# Sessão 12/06/2026 — Brasão responsivo: desktop à esquerda, mobile centralizado acima

## Problema resolvido
O brasão ficava sobreposto ao texto em telas mobile porque a regra `.hero-brasao{position:absolute}` apendada manualmente no `style.min.css` estava FORA de media query, sobrescrevendo as regras mobile.

## Solução
- **Desktop (≥769px)**: `.hero-brasao` com `position:absolute; left:24px; top:50%; transform:translateY(-50%); width:118px`
- **Tablet (≤768px)**: `.hero-content` vira `flex-direction:column; align-items:center`, brasão `position:static; width:48px; margin-bottom:12px`
- **Celular (≤480px)**: `.hero-brasao{width:32px}`
- **`style.min.css`**: regra desktop do brasão envolvida em `@media(min-width:769px)` para não vazar para mobile

## Commits
- `25bfc64` — brasão 118px desktop
- `1c2b85c`, `1847100`, `d1f859d` — tentativas de responsivo (falhas porque regra apendada sem media query sobrescrevia)
- `2bcb922` — FIX: desktop rule wrapped in `@media(min-width:769px)` no minificado

## PNG com fundo transparente
`img/brasao-sao-pedro.png` processado via .NET (pixels >240 convertidos para alpha 0) para remover fundo branco.
