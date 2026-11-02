# Guia de contribuição e padrões

Estas regras mantêm o projeto organizado. Antes de abrir um pull request, rode:

```
npm run check
```

Ele executa lint, verificação de padrões (`npm run padroes`) e build.

## Estrutura

- `src/app/`: aplicação, rotas e sessão.
- `src/api/`: chamadas ao backend, um arquivo por recurso.
- `src/pages/<pagina>/`: uma pasta por página, com `components/`, `services/` e CSS próprio.
- `src/shared/`: componentes e estilos usados por mais de uma página.
- `src/styles/`: `tokens.css` (variáveis) e `globais.css`.

## Nomes

- Tudo em português: pastas, componentes, funções, classes e variáveis.
- Componentes e páginas em `PascalCase.jsx` (`PaginaSubmissao.jsx`).
- Funções e variáveis em `camelCase`; constantes fixas em `MAIUSCULAS`.
- Pastas, CSS e classes em `kebab-case`. Classes seguem `bloco`, `bloco__elemento`, `bloco--variacao`.
- Variável de ambiente: `PROJETOS_API_URL`.

## CSS

1. **Nunca use cor fixa** (`#fff`, `#003da8`). Use variáveis de `src/styles/tokens.css`. Se faltar uma, crie o token com valor para os temas claro e escuro.
2. Não duplique regras de tema escuro: se a cor é variável, ela já muda sozinha.
3. Evite `!important`. Resolva pela especificidade ou pela ordem.
4. Cada componente tem o seu CSS, importado no próprio componente.
5. Limite: **400 linhas** por arquivo CSS. Passou disso, divida por responsabilidade.

## React

1. Limite: **400 linhas** por componente, 300 por módulo `.js`.
2. Um componente por arquivo. Se o JSX tem blocos grandes (etapas, abas, listas), extraia cada um.
3. Dados fixos (listas, configurações, textos) ficam em arquivo separado, não dentro do componente.
4. Regras de negócio e chamadas HTTP ficam em `services/` ou `api/`, não no componente.
5. Não crie arquivos que só repassam outra função.

## Fluxo de trabalho

- Um assunto por pull request e por commit.
- Mensagens de commit curtas, no imperativo e em português (`Divide estilos da administração`).
- Ao refatorar, teste a tela nos temas claro e escuro antes de pedir revisão.
- Remova código, imagens e ícones sem uso em vez de deixá-los "para depois".

## O que o `npm run padroes` verifica

| Regra                                             | Resultado           |
| ------------------------------------------------- | ------------------- |
| Cor hexadecimal fora de `tokens.css`              | **erro** (bloqueia) |
| Arquivo acima de 400 linhas (CSS/JSX) ou 300 (JS) | aviso               |
| Uso de `!important`                               | aviso               |

Os avisos existentes são dívida conhecida (veja `docs/PROXIMOS-PASSOS.md`). Quando zerarem, transforme-os em erro em `ferramentas/verificar-padroes.mjs`.
