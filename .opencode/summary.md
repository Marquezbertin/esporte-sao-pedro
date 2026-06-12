# Sessão 12/06/2026 — Substituição do brasão por versão limpa

## Resumo
O brasão de São Pedro–SP com watermark da MBI (392 KB, JPG) foi substituído pela versão PNG da Wikimedia Commons (35 KB, 252×233, domínio público, sem watermark). Commit `887ea19` enviado para `origin/main`.

## Arquivos alterados
- `img/brasao-sao-pedro.jpg` → deletado (392 KB, watermark MBI)
- `img/brasao-sao-pedro.png` → adicionado (35 KB, domínio público)
- `index.html` → `src` atualizado de `.jpg` para `.png` (linha 154)

## CSS não precisou de alteração
A classe `.hero-brasao` (em `style.css` e `style.min.css`) não referencia extensão de arquivo, apenas a classe. Funciona com PNG sem alterações.

## Fonte
Wikimedia Commons: `https://upload.wikimedia.org/wikipedia/commons/8/82/Brasao-saopedrosp.png`
Licença: Domínio público (governo municipal brasileiro).
