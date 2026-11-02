---
name: design-handoff
description: Generate developer handoff specs from a design or UI specification.
---

# Design Handoff

Use esta skill para transformar especificações visuais, mockups e protótipos em especificações técnicas precisas para os desenvolvedores do Portal de Cursos.

## Especificação Técnica de Componente

Ao realizar o handoff, documente:

1. **Nome do Componente e Escopo de Uso:**
   - Domínio da aplicação (`pages/<dominio>/components/` ou `shared/components/`).
2. **Propriedades (Props) e Contratos de Dados:**
   - Nomes em camelCase e português conforme convenção da equipe.
   - Tipos e valores padrão.
3. **Mapeamento de Design Tokens:**
   - Cores: `var(--cor-*)`
   - Espaçamento: `var(--espacamento-*)`
   - Tipografia e Linhas: `var(--fonte-*)`, `var(--altura-linha-*)`
4. **Estados do Componente:**
   - Default, Hover, Focus, Active, Disabled, Loading, Error, Empty.
5. **Responsividade:**
   - Comportamento no mobile (< 768px), tablet (768px - 1024px) e desktop (> 1024px).
