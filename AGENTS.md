# Diretrizes para Agentes de Código — Portal de Cursos Website

Este documento estabelece as convenções de vocabulário, arquitetura e padrões adotados no projeto para garantir consistência e evitar que refatorações sejam desfeitas nos próximos commits.

---

## 1. Vocabulário Padronizado (Um verbo por ideia)

Não utilize sinônimos concorrentes ou termos arcaicos. Siga rigorosamente a convenção:

| Ideia / Ação | Verbo / Padrão Obrigatório | O que NÃO usar | Exemplo de uso |
|---|---|---|---|
| **Buscar dados no servidor** (remoto) | `buscar` | `obter`, `consultar`, `requisitar` | `buscarCursos`, `buscarCursoPorId`, `buscarProjetosPublicados` |
| **Ler dado já presente em memória/local** | `pegar` | `obter` | `pegarIniciais`, `pegarEnderecoRecurso`, `pegarBaseApi` |
| **Alterar estado / setter de useState** | `mudar` | `definir`, `set` (em pt-br) | `mudarSessao`, `mudarTema`, `mudarPagina`, `mudarErros` |
| **Transformar / normalizar estruturas** | `preparar` | `mapear` | `prepararCurso`, `prepararDisciplina`, `prepararProjeto` |
| **Reagir a eventos / callbacks de UI** | `ao` + evento | `acompanhar`, `navegar`, `aoOcorrer` | `aoSair`, `aoMudarRota`, `aoClicarLink`, `aoApertarTecla` |
| **Gerar strings / slugs** | `gerar` | `criarIdentificador` | `gerarSlug` |
| **Decodificar / interpretar tokens** | `lerTokenJwt` | `decodificarPayloadJwt` | `lerTokenJwt` |
| **Listagens e CRUD padrão** | `listar`, `cadastrar`, `atualizar`, `excluir` | (mantêm padrão simples) | `listarUsuarios`, `excluirProjeto` |

---

## 2. Nomenclatura de Componentes e Arquivos

- **Componente raiz da aplicação**: `App.jsx` em `src/app/App.jsx`.
- **Links e navegação**: `Link.jsx` em `src/shared/componentes/Link.jsx`.
- **Cards e Apresentação**: `CardCurso.jsx`, `CardCatalogo.jsx`, `Contador.jsx`, `Esqueleto.jsx`.
- **Home / Landing Page**: `Capa.jsx`, `ChamadaEnviar.jsx`, `CursosDestaque.jsx`, `ProjetosDestaque.jsx`.
- **Páginas de detalhes**: `PaginaCurso.jsx`, `PaginaProjeto.jsx`, `PaginaVerSubmissao.jsx`.
- **Pastas internas**: Use exclusivamente `componentes` e `servicos` (sem acento, plural). Nunca crie pastas com nomes em inglês como `components` ou `services`.
- **Hooks customizados**: Devem residir em `hooks` e começar com o prefixo `use` (ex.: `useAparecer.js`).

---

## 3. Isolamento da Fronteira da API

- Contratos com o backend (rotas HTTP como `/api/academico/...`, campos do JSON e enums de banco como `EM_ANALISE`, `PROJETO_INTEGRADOR`) pertencem exclusivamente à camada de cliente HTTP em `src/api/`.
- O resto da aplicação consome os dados normalizados via funções de preparo (`prepararCurso`, etc.), isolando a camada visual de contratos legados do backend.
