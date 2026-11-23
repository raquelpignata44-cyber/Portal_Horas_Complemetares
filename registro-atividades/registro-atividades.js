
const campoCategoria = document.getElementById("categoria");
const campoTipo = document.getElementById("tipoAtividade");

campoCategoria.addEventListener("change", function () {

    const categoriaSelecionada = campoCategoria.value;

    campoTipo.innerHTML = "";

    if (categoriaSelecionada === "") {
        campoTipo.innerHTML = '<option value="">Selecione primeiro uma categoria</option>';
        return;
    }

    const tipos = tiposAtividade[categoriaSelecionada];

    tipos.forEach(function (tipo) {

        const opcao = document.createElement("option");

        opcao.value = tipo;
        opcao.textContent = tipo;

        campoTipo.appendChild(opcao);
    });

});


// Localizamos o formulário pelo ID
const formulario = document.getElementById("formAtividade");

// Detectamos quando o usuário clicar em cadastrar
formulario.addEventListener("submit", function (evento) {

    // Impedimos que a página recarregue automaticamente
    evento.preventDefault();

    // Capturamos os dados preenchidos
    const dadosDaAtividade = {
        nome: document.getElementById("nome").value,
        descricao: document.getElementById("descricao").value,
        categoria: campoCategoria.value,
        tipoAtividade: campoTipo.value,
        horasSolicitadas: Number(document.getElementById("horasSolicitadas").value),
        dataInicio: document.getElementById("dataInicio").value,
        dataConclusao: document.getElementById("dataConclusao").value,
        certificado: document.getElementById("certificado").files[0]
    };

    // Verificamos se as horas são válidas
if (dadosDaAtividade.horasSolicitadas <= 0) {
    alert("Informe uma quantidade de horas maior que zero.");
    return;
}

// Verificamos se a data de conclusão é válida
if (dadosDaAtividade.dataInicio &&
    dadosDaAtividade.dataConclusao &&
    dadosDaAtividade.dataConclusao < dadosDaAtividade.dataInicio) {

    alert("A data de conclusão não pode ser anterior à data de início.");
    return;
}

// Verificamos se o certificado é PDF
if (!dadosDaAtividade.certificado ||
    dadosDaAtividade.certificado.type !== "application/pdf") {

    alert("Selecione um certificado em PDF.");
    return;
}


// Salvamos os dados da atividade
const atividadeSalva = salvarAtividade({

    alunoId: "aluno001",
    nome: dadosDaAtividade.nome,
    descricao: dadosDaAtividade.descricao,
    categoria: dadosDaAtividade.categoria,
    tipoAtividade: dadosDaAtividade.tipoAtividade,
    horasSolicitadas: dadosDaAtividade.horasSolicitadas,
    dataInicio: dadosDaAtividade.dataInicio,
    dataConclusao: dadosDaAtividade.dataConclusao

});

if (typeof atividadeSalva === "string") {

    alert(atividadeSalva);

} else {

    // Salvamos o certificado usando o ID da atividade cadastrada
    salvarCertificado(
        atividadeSalva.id,
        dadosDaAtividade.certificado
    )
        .then(function (mensagem) {

            alert("Atividade e certificado cadastrados com sucesso!");

            console.log("Atividade salva:", atividadeSalva);
            console.log(mensagem);

        })
        .catch(function (erro) {

            alert("A atividade foi cadastrada, mas houve um erro ao salvar o certificado: " + erro);

            console.error(erro);

        });

}

});

