---
name: design-critique
description: Get structured design feedback on usability, hierarchy, and visual consistency.
---

# Design Critique

Use esta skill para avaliar telas, seções e fluxos de usuário com foco em heurísticas de usabilidade, hierarquia visual e coerência com a identidade do Portal de Cursos.

## Diretrizes de Avaliação

1. **Hierarquia e Escaneabilidade:**
   - O objetivo principal da tela é imediatamente compreendido?
   - O elemento primário de ação (Call to Action) se destaca dos secundários e terciários?
   - O espaçamento vertical e agrupamento visual (proximidade de Gestalt) separam bem os contextos?

2. **Consistência e Padrões:**
   - Tipografia segue a escala de tokens definida (`var(--tamanho-*)`, `var(--peso-*)`).
   - Cards, botões e tabelas mantêm os mesmos raios de borda, sombras e estados interativos (hover, active, disabled).
   - Paleta de cores alinhada ao design tokens de tema claro e escuro.

3. **Prevenção e Recuperação de Erros:**
   - Ações destrutivas (ex: exclusão de projetos) solicitam confirmação clara.
   - Feedbacks em tempo real ao usuário para ações bem-sucedidas ou falhas de requisição.
