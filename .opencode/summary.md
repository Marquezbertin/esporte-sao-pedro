# Sessão 12/06/2026 — Brasão alinhado à esquerda do hero, sem fundo branco

## Resumo
O brasão foi reposicionado do canto superior esquerdo (watermark) para alinhado à esquerda do texto "PORTAL ESPORTIVO / O Esporte de Sao Pedro" no hero, usando flexbox. O tamanho reduziu de 60px para 45px. O fundo branco é removido via `mix-blend-mode: multiply` contra o gradiente azul escuro do hero. Commit `4e4db4a` enviado para `origin/main`.

## Arquivos alterados
- `index.html` — `<img class="hero-brasao">` movido para dentro de `.hero-content`, texto envolvido em `<div class="hero-text">`
- `style.css` — `.hero-content` agora flex (display:flex + gap), `.hero-brasao` sem absolute/grayscale/opacity baixa, com mix-blend-mode:multiply e 45px. Adicionado `.hero-text { flex: 1 }`
- `style.min.css` — mesmas alterações minificadas (hero-content + hero-brasao + hero-text)
- `.opencode/summary.md` — este arquivo
