// Pagina de regras e informacoes do curso.
// Usa buscarCurso, calcularMinimoPorCategoria, tiposAtividade e limitesHoras de dados.js

const selectCurso = document.getElementById("select-curso");
const campoBusca = document.getElementById("busca-tipo");
const containerResultado = document.getElementById("resultado-regras");

const iconesCategoria = {
    "Ensino": "📚",
    "Pesquisa": "🔬",
    "Extensão": "🤝"
};

// Tira acentos e maiusculas para a busca achar "extensao" ao digitar "Extensão"
function normalizar(texto) {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function montarCategoria(categoria, termo, minimo) {
    const tipos = tiposAtividade[categoria].filter(function (tipo) {
        return normalizar(tipo).includes(termo);
    });

    if (tipos.length === 0) {
        return "";
    }

    const itens = tipos.map(function (tipo) {
        return `<li><span>${tipo}</span><span class="limite">até ${limitesHoras[categoria][tipo]} h</span></li>`;
    }).join("");

    // Se o aluno esta buscando algo, ja abre a categoria
    return `
        <details class="categoria glass3d" ${termo ? "open" : ""}>
            <summary>
                <span class="categoria-icone">${iconesCategoria[categoria]}</span>
                <span class="categoria-texto">
                    <strong>${categoria}</strong>
                    <small>mínimo de ${minimo} h nesta categoria</small>
                </span>
            </summary>
            <ul class="lista-tipos">${itens}</ul>
            <p class="nota">O limite vale para cada atividade enviada.</p>
        </details>`;
}

function exibirRegrasDoCurso() {
    const curso = buscarCurso(selectCurso.value);

    if (!curso) {
        containerResultado.innerHTML = `<p class="vazio">Curso não encontrado. Escolha outro na lista.</p>`;
        return;
    }

    const minimo = calcularMinimoPorCategoria(curso.curso);
    const termo = normalizar(campoBusca.value);

    const categorias = Object.keys(tiposAtividade).map(function (categoria) {
        return montarCategoria(categoria, termo, minimo);
    }).join("");

    containerResultado.innerHTML = `
        <div class="resumo">
            <div class="destaque glass3d">
                <span class="numero">${curso.horas}</span>
                <span class="rotulo">horas complementares exigidas em ${curso.curso}</span>
            </div>
            <div class="destaque glass3d">
                <span class="numero">${minimo}</span>
                <span class="rotulo">horas mínimas em cada categoria: Ensino, Pesquisa e Extensão</span>
            </div>
        </div>
        <div class="categorias">
            ${categorias || `<p class="vazio">Nenhum tipo de atividade encontrado para essa busca.</p>`}
        </div>`;
}

exibirRegrasDoCurso();
selectCurso.addEventListener("change", exibirRegrasDoCurso);
campoBusca.addEventListener("input", exibirRegrasDoCurso);