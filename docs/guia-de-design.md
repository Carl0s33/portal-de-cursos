# Guia de Design Institucional — Portal de Cursos

Este documento estabelece as diretrizes e decisões visuais do repositório `portal-de-cursos-website`, alinhadas à metodologia **frontend-design** e aos princípios de design plano e institucional.

---

## 1. Princípios Visuais Fundamentais

1. **Plano, Sólido e Institucional**:
   - Superfícies com preenchimento sólido (`var(--superficie)`).
   - Ausência completa de *glassmorphism* (`backdrop-filter`), degradês decorativos e sombras projetadas (`--sombra: none`, `--sombra-card: none`, `--sombra-hover: none`).
   - Camadas elevadas e sobreposições utilizam exclusivamente contorno de 1px (`--sombra-elevada: 0 0 0 1px var(--borda)`).

2. **Destaque Calmo e Autêntico**:
   - O hero da página inicial concentra o ponto funcional do portal, apresentando a lista real de cursos consultada via API.
   - O restante das páginas opera com disciplina e discrição.
   - A cor semântica pertence estritamente ao dado (ícone com fundo translúcido sutil `color-mix(in srgb, var(--cor) 12%, var(--superficie))` ou etiqueta de status), nunca a faixas decorativas ou bordas coloridas no topo de cards.

3. **Voz Direta e Acessível**:
   - Frases em escrita convencional (*Sentence case*), sem rótulos em caixa alta arbitrários.
   - Sem setas soltas (`→`) em botões ou links: a clareza decorre do verbo de ação ("Enviar projeto", "Explorar catálogo de cursos").
   - O termo "submissão" é mantido como substantivo de fluxo e governança; "Enviar projeto" é adotado nos botões e ações do usuário.

---

## 2. Tokens de Design (`src/styles/tokens.css`)

### Paleta Institucional

| Token | Tema Claro | Tema Escuro | Papel na Interface |
| :--- | :--- | :--- | :--- |
| `--fundo` | `#f7f8fc` | `#000000` | Fundo principal da aplicação |
| `--superficie` | `#ffffff` | `#0c0c0c` | Cartões de conteúdo, formulários e tabelas |
| `--suave` | `#e8edf8` | `#141414` | Fundos de apoio secundários |
| `--titulo` | `#00050e` | `#f5f5f5` | Títulos principais e valores de indicadores |
| `--texto` | `#334155` | `#bfbfbf` | Corpo de texto principal |
| `--texto-suave`| `#5f6b7d` | `#9aa3b0` | Rótulos de metadados e cabeçalhos de tabela |
| `--azul` | `#003da8` | `#8fb1ff` | Identidade do portal, links e botão primário |
| `--azul-vivo` | `#1559ff` | `#6c93ff` | Realce de foco |
| `--borda` | `#c6cfdd` | `#292929` | Divisórias e bordas ativas |
| `--borda-suave`| `#dfe5ef` | `#26282d` | Contorno neutro de cartões e painéis |
| `--borda-campo`| `#7c8aa0` | `#646c78` | Borda de formulário com contraste 3:1 (WCAG AA) |

### Escala de Raios de Borda

* `--raio-p`: `4px` — Etiquetas, crachás de status e pequenas tags.
* `--raio-m`: `8px` — Botões, campos de entrada de formulário e caixas de ícones.
* `--raio-g`: `12px` — Cartões de cursos, cartões de projetos, painéis e modais.
* `--raio-pilula`: `999px` — Marcadores de situação arredondados.

---

## 3. Padrão Unificado de Cartão

Aplicável a todos os componentes de cartão (`CartaoCurso`, `ItemProjeto`, `CartaoCatalogo`):

```css
.cartao {
  background: var(--superficie);
  border: 1px solid var(--borda-suave);
  border-radius: var(--raio-g);
  padding: var(--esp-5);
  display: flex;
  flex-direction: column;
  transition: border-color var(--transicao);
}

.cartao:hover {
  border-color: var(--borda);
}

.cartao:focus-within {
  border-color: var(--azul);
  outline: 2px solid var(--azul);
  outline-offset: 2px;
}
```

* Proibido uso de `translateY(-Xpx)` no hover.
* Proibido uso de `box-shadow` colorido ou difuso.
* Cor de categoria exibida no ícone correspondente com fundo matizado:
  ```css
  background: color-mix(in srgb, var(--cor) 12%, var(--superficie));
  color: var(--cor);
  ```

---

## 4. Tipografia e Legibilidade

* Família: **Manrope** em todos os pesos e tamanhos.
* Largura máxima de linha de leitura: `max-width: 68ch` em resumos e descrições.
* Cabeçalhos de tabela: em caixa baixa (*Sentence case*), peso 600, na cor `--texto-suave`.
* Códigos e matrículas: Manrope com `font-variant-numeric: tabular-nums` (sem fonte monospace avulsa).
