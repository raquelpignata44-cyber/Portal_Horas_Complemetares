
# Portal de Horas Complementares

Projeto acadêmico desenvolvido pelo Grupo 4 para organizar o cadastro, a avaliação e o acompanhamento de horas complementares dos estudantes.

## Tecnologias utilizadas

- HTML
- CSS
- JavaScript
- localStorage para armazenar os dados das atividades
- IndexedDB para armazenar os certificados em PDF

## Estrutura do projeto

- `index.html` — página inicial provisória
- `style.css` — estilos visuais
- `script.js` — arquivo reservado para funcionalidades da interface
- `js/dados.js` — funções de armazenamento, validação, consulta e cálculo
- `imagens/` — imagens utilizadas no portal

## Funcionalidades da base de dados

O arquivo `js/dados.js` contém funções para:

- Cadastrar, consultar, editar e excluir atividades
- Aprovar ou reprovar atividades
- Armazenar e recuperar certificados PDF
- Calcular horas aprovadas e restantes
- Calcular o progresso dos estudantes
- Verificar os requisitos mínimos por categoria

## Estruturas de dados

O projeto utiliza uma tabela hash implementada manualmente para consultar cursos e um índice `Map` para localizar atividades pelo ID.

## Situação do projeto

A base de dados está desenvolvida. As interfaces definitivas e a integração entre as páginas estão em desenvolvimento pelo grupo.

## Observação

Os dados armazenados no `localStorage` e no `IndexedDB` ficam no navegador utilizado. Eles não são compartilhados automaticamente entre computadores.