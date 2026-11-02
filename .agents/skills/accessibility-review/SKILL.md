---
name: accessibility-review
description: Run a WCAG 2.1 AA accessibility audit on a design, page or component.
---

# Accessibility Review (WCAG 2.1 AA)

Use esta skill para auditar a acessibilidade da interface, componentes JSX e folhas de estilo CSS, visando conformidade com as diretrizes WCAG 2.1 nível AA.

## Checklist de Auditoria

1. **Perceptível:**
   - Contraste de cores mínimo: 4.5:1 para texto normal, 3:1 para texto grande/componentes de UI ativos.
   - Textos alternativos (`alt`) descritivos em imagens funcionais e `alt=""` ou `aria-hidden="true"` em ícones/ilustrações puramente decorativas.
   - Não transmitir informação unicamente por cor (usar ícones, sublinhado ou texto explicativo de status).

2. **Operável:**
   - Navegação completa por teclado (`Tab`, `Shift+Tab`, `Enter`, `Space`, setas).
   - Indicador de foco visualmente nítido em todos os elementos interativos (`:focus-visible`).
   - Existência de "Skip link" (Pular para o conteúdo principal).
   - Sem armadilhas de teclado (keyboard traps) em modais e menus suspensos.

3. **Compreensível:**
   - Estrutura clara de cabeçalhos sem pular níveis (`h1` -> `h2` -> `h3`).
   - Labels explícitos ou `aria-label` associados a cada campo de formulário.
   - Mensagens de erro claras, específicas e associadas via `aria-describedby` ou `aria-errormessage`.

4. **Robusto:**
   - Sem landmarks semânticos conflitantes (ex: evitar `<main role="status">`, usar `<p role="status">` interno).
   - Atributos ARIA válidos (`aria-expanded`, `aria-selected`, `aria-live`).
