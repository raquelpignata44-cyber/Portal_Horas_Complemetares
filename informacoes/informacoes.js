document.addEventListener("DOMContentLoaded", function() {
    console.log("A página de informações foi carregada com sucesso!");
});
// document representa toda a pagina html e assim que carregar a pagina, executa o que contem na funcao
// a funcao é apenas para teste de funcionamento

// 1. Encontramos os elementos HTML pelo ID que criamos
    const selectCurso = document.getElementById("select-curso");
    const containerResultado = document.getElementById("resultado-regras");

    // 2. Criamos uma função para atualizar a tela com base no curso escolhido
    function exibirRegrasDoCurso() {
        const nomeCursoSelecionado = selectCurso.value;

        // 3. Chamamos a função buscarCurso que já existe no dados.js
        const dadosDoCurso = buscarCurso(nomeCursoSelecionado);

        // 4. Exibimos temporariamente no HTML para testar
        containerResultado.innerHTML = `
            <h3>Curso: ${dadosDoCurso.curso}</h3>
            <p>Total de horas exigidas: <strong>${dadosDoCurso.horas} horas</strong></p>
        `;
    }

    // 5. Executamos a função assim que a página abre para mostrar o curso padrão
    exibirRegrasDoCurso();

    // 6. Ficamos "escutando" se o usuário mudar a opção do select
    selectCurso.addEventListener("change", exibirRegrasDoCurso);
