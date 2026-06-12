# Esporte Sao Pedro

Portal esportivo regional de São Pedro/SP. Resultados, tabelas, artilheiros, calendário e tudo sobre o esporte da cidade. Custo operacional zero.

## Funcionalidades

- **Notícias** — Publicação com rich text, galeria de fotos, vídeo, autor, tags e agendamento
- **Campeonatos** — Classificação, artilharia, resultados e gráficos (Chart.js)
- **Calendário** — Jogos e eventos esportivos em calendário mensal
- **Atletas e Times** — Perfis com fotos, biografia e redes sociais (modal Linktree)
- **Mapa Esportivo** — Locais esportivos de São Pedro em mapa interativo (Leaflet + OSM)
- **Fala, Torcedor!** — Leitores enviam relatos; admin aprova e publica
- **Galeria de Fotos** — Fotos com legendas e filtro por esporte
- **Vídeos** — Incorporação de vídeos do YouTube
- **Podcast** — Episódios com player embutido
- **Colunas de Opinião** — Artigos de colunistas
- **Conquistas** — Medalhas e títulos de atletas/times
- **Placar ao Vivo** — Atualização em tempo real
- **Transmissão ao Vivo** — Suporte a YouTube, Twitch, Facebook e Instagram
- **Notificações Push** — Envio para navegador (Edge Function Supabase)
- **Banner do Site** — Banner configurável (imagem, comercial, notícia, vídeo)
- **Modo Claro/Escuro** — Alternância com persistência
- **Newsletter** — Captura e exportação de e-mails
- **Enquetes** — Votação dos leitores
- **Patrocinadores** — Cadastro e exibição por plano (ouro/prata/bronze)
- **Monitor de Pautas com IA** — Coleta de links, extração automática, integração Gemini
- **Dashboard Editorial** — Visão geral, busca, calendário
- **Dashboard de Uso** — Controle de volume de dados e imagens
- **SEO** — JSON-LD, Open Graph, Twitter Cards, RSS, Sitemap, PWA

## Stack

| Componente | Tecnologia | Custo |
|------------|-----------|-------|
| Frontend | HTML, CSS, JavaScript (vanilla) | R$ 0 |
| Hospedagem | GitHub Pages | R$ 0 |
| Banco de Dados | Supabase (PostgreSQL) | R$ 0 |
| Imagens | Cloudinary | R$ 0 |
| Mapa | Leaflet + OpenStreetMap | R$ 0 |
| Gráficos | Chart.js | R$ 0 |
| Push | Supabase Edge Functions | R$ 0 |
| IA | Google Gemini API | R$ 0 |
| Fonte | Google Fonts (Inter + Outfit) | R$ 0 |

**Custo mensal total: R$ 0,00** — 100% gratuito.

## Estrutura

```
esporte-sao-pedro/
├── index.html            # Estrutura completa do portal
├── app.js                # Toda a lógica do frontend
├── style.css             # Estilos (4.6k+ linhas)
├── supabase.js           # Camada de integração Supabase
├── upload.js             # Upload de imagens Cloudinary
├── sw.js                 # Service Worker (PWA + Push)
├── manifest.json         # Manifest PWA
├── funcionalidades_valor.txt
├── supabase/functions/   # Edge Functions (send-push)
└── README.md
```

## Como usar

O projeto roda 100% no navegador. Dados são persistidos no Supabase e localmente (localStorage como fallback).

1. Acesse: `https://marquezbertin.github.io/esporte-sao-pedro/`
2. Clique em **Editor** no header para fazer login
3. Admin pode cadastrar notícias, campeonatos, atletas, times, etc.

## Admin

Login via Supabase Auth. Apenas usuários na tabela `admin_users` têm acesso administrativo.

## Licença

Uso livre e gratuito para fins esportivos e comunitários.
