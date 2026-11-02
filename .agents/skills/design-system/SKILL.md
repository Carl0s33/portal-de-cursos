---
name: design-system
description: Audit, document, or extend design system tokens, patterns, and component guidelines.
---

# Design System Management

Use esta skill para auditar, documentar ou estender o Design System do Portal de Cursos.

## Princípios do Sistema de Design

1. **Tokens Centralizados (`src/styles/tokens.css`):**
   - Nunca use valores hexadecimais ou medidas mágicas em CSS locais sem token equivalente.
   - Suporte nativo aos temas Claro e Escuro através de variáveis CSS sob `[data-tema="claro"]` e `[data-tema="escuro"]`.
2. **Nomenclatura Semântica:**
   - Tokens com finalidade explícita: `--cor-fundo-superficie`, `--cor-texto-principal`, `--cor-borda-suave`.
3. **Padrão CSS (BEM / Kebab-case):**
   - `.bloco__elemento--modificador`
   - Evitar seletores aninhados excessivamente profundos ou uso de `!important`.
