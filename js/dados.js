const atividades = JSON.parse(localStorage.getItem("atividades") || "[]");

const indiceAtividades = new Map();

atividades.forEach(atividade => {
    indiceAtividades.set(atividade.id, atividade);
});

function salvarAtividade(dadosDaAtividade) {
    if (typeof dadosDaAtividade.alunoId !== "string" || dadosDaAtividade.alunoId.trim() === "") {
        return "Aluno não informado.";
    }

    const categoriasPermitidas = [
        "Ensino",
        "Pesquisa",
        "Extensão"
    ];

    if (!categoriasPermitidas.includes(dadosDaAtividade.categoria)) {
        return "Categoria inválida.";
    }

    if (limitesHoras[dadosDaAtividade.categoria][dadosDaAtividade.tipoAtividade] === undefined) {
        return "Tipo de atividade inválido";
    }

    if (dadosDaAtividade.dataInicio && dadosDaAtividade.dataConclusao &&
        dadosDaAtividade.dataConclusao < dadosDaAtividade.dataInicio) {
        return "Data de conclusão inválida.";
    }

    if (!Number.isFinite(dadosDaAtividade.horasSolicitadas) || dadosDaAtividade.horasSolicitadas <= 0) {
        return "Quantidade de horas solicitadas inválida.";
    }

    dadosDaAtividade.id = crypto.randomUUID();
    dadosDaAtividade.status = "pendente";
    dadosDaAtividade.horasValidadas = 0;

    atividades.push(dadosDaAtividade);

    indiceAtividades.set(dadosDaAtividade.id, dadosDaAtividade);

    localStorage.setItem("atividades", JSON.stringify(atividades));

    return dadosDaAtividade;
}

function listarAtividades() {
    return atividades;
}

function buscarAtividade(id) {
    return indiceAtividades.get(id);
}

async function removerAtividade(id) {
    const indice = atividades.findIndex(function (atividade) {
        return atividade.id === id;
    });

    if (indice === -1) {
        return "Atividade não encontrada.";
    }

    try {
        await removerCertificado(id);
    } catch (erro) {
        return "Erro ao remover certificado. Atividade não excluída.";
    }

    atividades.splice(indice, 1);

    indiceAtividades.delete(id);

    localStorage.setItem("atividades", JSON.stringify(atividades));

    return "Atividade removida com sucesso.";
}

function editarAtividade(id, novosDados) {
    if (!novosDados || typeof novosDados !== "object" || Array.isArray(novosDados)) {
        return "Informe os dados que deseja corrigir.";
    }

    const atividade = buscarAtividade(id);

    if (!atividade) {
        return "Atividade não encontrada.";
    }

    if (atividade.status === "aprovado") {
        return "Atividades aprovadas não podem ser editadas.";
    }

    if (novosDados.nome !== undefined && (typeof novosDados.nome !== "string" || novosDados.nome.trim() === "")) {
        return "O nome da atividade não pode ficar vazio.";
    }

    if (novosDados.descricao !== undefined && typeof novosDados.descricao !== "string") {
        return "A descrição da atividade deve ser um texto.";
    }

    if (novosDados.horasSolicitadas !== undefined && (typeof novosDados.horasSolicitadas !== "number" ||
        !Number.isFinite(novosDados.horasSolicitadas) || novosDados.horasSolicitadas <= 0)) {
        return "As horas solicitadas devem ser um número maior que zero.";
    }

    const categoria = novosDados.categoria ?? atividade.categoria;
    const tipoAtividade = novosDados.tipoAtividade ?? atividade.tipoAtividade;

    if (!limitesHoras[categoria] || !Object.hasOwn(limitesHoras[categoria], tipoAtividade)) {
        return "Categoria ou tipo de atividade inválido.";
    }

    const dataInicio = novosDados.dataInicio ?? atividade.dataInicio;
    const dataConclusao = novosDados.dataConclusao ?? atividade.dataConclusao;

    if (dataInicio && dataConclusao && dataConclusao < dataInicio) {
        return "A data de conclusão não pode ser anterior à data de início.";
    }

    const camposEditaveis = [
        "nome",
        "descricao",
        "categoria",
        "tipoAtividade",
        "horasSolicitadas",
        "dataInicio",
        "dataConclusao"
    ];

    const houveAlteracao = camposEditaveis.some(function (campo) {
        return (novosDados[campo] !== undefined && novosDados[campo] !== atividade[campo]);
    });

    if (!houveAlteracao) {
        return "Nenhuma informação foi alterada.";
    }

    camposEditaveis.forEach(function (campo) {
        if (novosDados[campo] !== undefined) {
            atividade[campo] = novosDados[campo];
        }
    });

    atividade.status = "pendente";
    atividade.horasValidadas = 0;

    localStorage.setItem("atividades", JSON.stringify(atividades));

    return "Atividade atualizada com sucesso.";
}

function removerCertificado(idAtividade) {
    return obterBancoDeDados().then(function (banco) {
        return new Promise(function (resolve, reject) {
            const transacao = banco.transaction("certificados", "readwrite");
            const armazenamento = transacao.objectStore("certificados");

            armazenamento.delete(idAtividade);

            transacao.oncomplete = function () {
                resolve("Certificado removido com sucesso.");
            };

            transacao.onerror = function () {
                reject("Erro ao remover certificado.");
            };
        });
    });
}

function avaliarAtividade(id, novoStatus, horas) {
    const atividade = buscarAtividade(id);

    if (!atividade) {
        return "Atividade não encontrada.";
    }

    if (novoStatus !== "aprovado" && novoStatus !== "reprovado") {
        return "Status inválido.";
    }

    if (novoStatus === "aprovado" && (!Number.isFinite(horas) || horas <= 0)) {
        return "Quantidade de horas inválida.";
    }

    if (novoStatus === "aprovado") {
        const limite = limitesHoras[atividade.categoria][atividade.tipoAtividade];

        const maximoPermitido = Math.min(atividade.horasSolicitadas, limite);

        if (horas > maximoPermitido) {
            return "Horas acima do limite permitido.";
        }
    }

    atividade.status = novoStatus;
    atividade.horasValidadas = novoStatus === "aprovado" ? horas : 0;

    localStorage.setItem("atividades", JSON.stringify(atividades));

    return atividade;
}

function listarAtividadesDoAluno(alunoId) {
    return atividades.filter(atividade => atividade.alunoId === alunoId);
}

function calcularHorasAprovadas(alunoId) {
    return listarAtividadesDoAluno(alunoId).filter(atividade => atividade.status === "aprovado")
        .reduce((total, atividade) => total + atividade.horasValidadas, 0);
}

function calcularHorasPorCategoria(alunoId, categoria) {
    return listarAtividadesDoAluno(alunoId).filter(atividade => atividade.status === "aprovado" &&
        atividade.categoria === categoria).reduce((total, atividade) => total + atividade.horasValidadas, 0);
}

const tabelaCursos = Array.from({ length: 10 }, () => []);

function gerarHash(nomeCurso) {
    let soma = 0;

    for (let i = 0; i < nomeCurso.length; i++) {
        soma += nomeCurso.charCodeAt(i);
    }

    return soma % tabelaCursos.length;
}

function inserirCurso(nomeCurso, horasExigidas) {
    const indice = gerarHash(nomeCurso);

    const cursoExistente = buscarCurso(nomeCurso);

    if (cursoExistente) {
        return "Curso já cadastrado.";
    }

    tabelaCursos[indice].push({
        curso: nomeCurso,
        horas: horasExigidas
    });

    return "Curso cadastrado com sucesso.";
}

function buscarCurso(nomeCurso) {
    const indice = gerarHash(nomeCurso);

    return tabelaCursos[indice].find(curso => curso.curso === nomeCurso);
}

inserirCurso("Sistemas de Informação", 300);
inserirCurso("Ciência da Computação", 360);
inserirCurso("Engenharia de Software", 320);

const solicitarAberturaBanco = indexedDB.open("BancoCertificados", 2);

function obterBancoDeDados() {
    return new Promise(function (resolve, reject) {
        if (solicitarAberturaBanco.readyState === "done") {
            if (solicitarAberturaBanco.result) {
                resolve(solicitarAberturaBanco.result);
            }
            else {
                reject("Não foi possível abrir o banco de dados.");
            }

            return;
        }

        solicitarAberturaBanco.addEventListener("success", function () {
            resolve(solicitarAberturaBanco.result);
        });

        solicitarAberturaBanco.addEventListener("error", function () {
            reject("Erro ao abrir banco de dados.");
        });

    });
}


solicitarAberturaBanco.onupgradeneeded = function (evento) {
    const bancoDeDados = evento.target.result;

    if (!bancoDeDados.objectStoreNames.contains("certificados")) {
        bancoDeDados.createObjectStore("certificados");
    }
};

function salvarCertificado(idAtividade, arquivoPDF) {
    return new Promise(function (resolve, reject) {

        if (!(arquivoPDF instanceof Blob) || arquivoPDF.type !== "application/pdf") {
            reject("O certificado deve ser um arquivo PDF.");
            return;
        }

        if (!buscarAtividade(idAtividade)) {
            reject("Atividade não encontrada.");
            return;
        }

        obterBancoDeDados().then(function (bancoDeDados) {
            const transacao = bancoDeDados.transaction("certificados", "readwrite");

            const armazenamentoCertificados = transacao.objectStore("certificados");

            armazenamentoCertificados.put(arquivoPDF, idAtividade);

            transacao.oncomplete = function () {
                resolve("Certificado salvo com sucesso.");
            };

            transacao.onerror = function () {
                reject("Erro ao salvar certificado.");
            };

            transacao.onabort = function () {
                reject("Gravação do certificado cancelada.");
            };
        })
            .catch(function (erro) {
                reject(erro);
            });
    });
}

function buscarCertificado(idAtividade) {
    return new Promise(function (resolve, reject) {

        obterBancoDeDados().then(function (bancoDeDados) {

            const transacao = bancoDeDados.transaction("certificados", "readonly");

            const armazenamentoCertificados = transacao.objectStore("certificados");

            const solicitacaoBusca = armazenamentoCertificados.get(idAtividade);

            solicitacaoBusca.onsuccess = function () {
                resolve(solicitacaoBusca.result);
            };

            solicitacaoBusca.onerror = function () {
                reject("Erro ao buscar certificado");
            };
        })
            .catch(function (erro) {
                reject(erro);
            });
    });
}

async function abrirCertificado(idAtividade) {
    const arquivoPDF = await buscarCertificado(idAtividade);

    if (!arquivoPDF) {
        return "Certificado não encontrado.";
    }

    const enderecoTemporario = URL.createObjectURL(arquivoPDF);
    window.open(enderecoTemporario, "_blank");

    return "Solicitação de abertura realizada.";
}

function calcularProgresso(alunoId, nomeCurso) {
    const curso = buscarCurso(nomeCurso);

    if (!curso || curso.horas <= 0) {
        return "Curso inválido.";
    }

    const horasAprovadas = calcularHorasAprovadas(alunoId);

    const percentual = (horasAprovadas / curso.horas) * 100;

    return Math.min(percentual, 100);
}

function calcularHorasRestantes(alunoId, nomeCurso) {
    const curso = buscarCurso(nomeCurso);

    if (!curso) {
        return "Curso inválido";
    }

    const horasAprovadas = calcularHorasAprovadas(alunoId);

    return Math.max(0, curso.horas - horasAprovadas);
}

function calcularMinimoPorCategoria(nomeCurso) {
    const curso = buscarCurso(nomeCurso);

    if (!curso) {
        return "Curso inválido";
    }

    return Math.ceil(curso.horas / 6);
}

function cumpriuMinimoDaCategoria(alunoId, nomeCurso, categoria) {
    const minimo = calcularMinimoPorCategoria(nomeCurso);

    if (minimo === "Curso inválido") {
        return "Curso inválido";
    }

    const horasAprovadas = calcularHorasPorCategoria(alunoId, categoria);

    return horasAprovadas >= minimo;
}

function cumpriuMinimosDasCategorias(alunoId, nomeCurso) {
    const ensino = cumpriuMinimoDaCategoria(alunoId, nomeCurso, "Ensino");
    const pesquisa = cumpriuMinimoDaCategoria(alunoId, nomeCurso, "Pesquisa");
    const extensao = cumpriuMinimoDaCategoria(alunoId, nomeCurso, "Extensão");

    if (ensino === "Curso inválido") {
        return "Curso inválido";
    }

    return ensino && pesquisa && extensao;
}

function concluiuHorasComplementares(alunoId, nomeCurso) {
    const curso = buscarCurso(nomeCurso);

    if (!curso) {
        return "Curso inválido";
    }

    const totalAprovado = calcularHorasAprovadas(alunoId);

    const cumpriuMinimos = cumpriuMinimosDasCategorias(
        alunoId,
        nomeCurso
    );

    return totalAprovado >= curso.horas && cumpriuMinimos;
}

const tiposAtividade = {
    Ensino: [
        "Estudos contemporâneos",
        "Estudos de língua estrangeira",
        "Disciplinas de outros cursos - anteriores",
        "Disciplinas de outros cursos - concomitantes",
        "Monitoria no curso"
    ],

    Pesquisa: [
        "Participação em projetos",
        "Publicação de artigos",
        "Participação em programa de iniciação científica",
        "Participação em concursos",
        "Autoria e coautoria de livros",
        "Organização de eventos científicos",
        "Apresentação de trabalhos em eventos",
        "Patentes"
    ],

    Extensão: [
        "Participação em projetos de extensão",
        "Participação em eventos presenciais ou on-line",
        "Estágio não obrigatório",
        "Organização de projeto de extensão",
        "Participação em grupos de estudo",
        "Participação em conselhos e assemelhados"
    ]
};

const limitesHoras = {
    Ensino: {
        "Estudos contemporâneos": 30,
        "Estudos de língua estrangeira": 40,
        "Disciplinas de outros cursos - anteriores": 60,
        "Disciplinas de outros cursos - concomitantes": 60,
        "Monitoria no curso": 80
    },

    Pesquisa: {
        "Participação em projetos": 80,
        "Publicação de artigos": 40,
        "Participação em programa de iniciação científica": 100,
        "Participação em concursos": 30,
        "Autoria e coautoria de livros": 60,
        "Organização de eventos científicos": 40,
        "Apresentação de trabalhos em eventos": 30,
        "Patentes": 100
    },

    Extensão: {
        "Participação em projetos de extensão": 100,
        "Participação em eventos presenciais ou on-line": 30,
        "Estágio não obrigatório": 100,
        "Organização de projeto de extensão": 60,
        "Participação em grupos de estudo": 40,
        "Participação em conselhos e assemelhados": 30
    }
};


