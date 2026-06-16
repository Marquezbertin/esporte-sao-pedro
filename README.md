# Esporte São Pedro

Portal esportivo regional de São Pedro/SP. Resultados, tabelas, artilheiros, calendário e tudo sobre o esporte da cidade. Custo operacional zero.

## Funcionalidades

### Conteúdo Editorial
- **Notícias** — Publicação com rich text (negrito, itálico, listas), galeria de fotos, vídeo incorporado, autor, tags, cidade, fonte, status (rascunho/revisão/publicada/agendada)
- **Campeonatos** — Classificação, artilharia, resultados, gráficos (Chart.js), filtro por esporte
- **Calendário de Jogos** — Jogos e eventos esportivos em calendário mensal com navegação
- **Colunas de Opinião** — Artigos de colunistas convidados
- **Resumo da Semana** — Boletim semanal publicado na página inicial
- **Monitor de Pautas com IA** — Coleta de links/textos da internet, extração automática de times/locais/modalidades via Google Gemini, geração de rascunhos de notícias
- **Dashboard Editorial** — Visão geral, busca textual em todas as notícias, calendário editorial mensal

### Atletas e Times
- **Atletas** — Perfis com foto, biografia, esporte, cidade, redes sociais (Instagram, YouTube, Facebook, X/Twitter, site), vínculo a um time
- **Times / Equipes** — Cadastro com nome, esporte, cidade, escudo, descrição (textarea com 8 linhas), redes sociais
- **Página Dedicada do Time** — Tela cheia com hero (escudo + nome), descrição completa, links das redes sociais e grid de atletas vinculados

### Multimídia
- **Galeria de Fotos** — Fotos com legenda e filtro por esporte
- **Vídeos** — Incorporação de vídeos do YouTube com filtro por esporte
- **Podcast** — Player Spotify incorporado, episódios em destaque com filtro por esporte
- **Conquistas** — Medalhas e títulos (ouro/prata/bronce/destaque) de atletas e times

### Ao Vivo e Programação
- **Transmissão ao Vivo** — Suporte a YouTube, Twitch, Facebook (embed) e Instagram (nova aba). Botão "AO VIVO" no menu
- **Placar ao Vivo** — Atualização em tempo real com timer regressivo, exibido em destaque na página inicial
- **Programação** — Agendamento de reprises com data, horário e duração. Auto-play no horário agendado (timer de 15s no navegador). Suporte a YouTube, Twitch, Facebook e Instagram. Widget "Tocando Agora" (com vídeo + botão dispensar) + "Próximos Programas" informativo na página inicial. Bloqueio de reprodução antes do horário. Contador de views por programa (visível no admin)

### Engajamento
- **Fala, Torcedor!** — Leitores enviam relatos; admin aprova e publica na página dedicada
- **Enquetes** — Votação dos leitores na página inicial
- **Newsletter** — Captura de e-mail com validação, exportação dos inscritos
- **Mapa Esportivo** — Locais esportivos de São Pedro em mapa interativo (Leaflet + OpenStreetMap) com categorias (estádio, ginásio, quadra, pista, academia, parque)

### Administrativo / Financeiro
- **Dashboard Financeiro** — Produtos publicitários (banner, narrador, vídeo, post patrocinado, patrocínio geral) com valores customizáveis
- **Calculadora de Vendas** — Seleção de produtos, definição de quantidades, geração de orçamentos com total automático
- **Histórico de Orçamentos** — Orçamentos salvos com status (orçamento/vendido/cancelado), edição, exclusão
- **PDF do Orçamento** — Gera PDF profissional com layout organizado, logo do portal (texto), tabela de itens, total em destaque e observações. Pronto para enviar ao cliente
- **Compartilhar Orçamento** — Envio do orçamento por e-mail (cliente de e-mail padrão) ou compartilhamento via Web Share API (celular)
- **Patrocinadores** — Cadastro com logo, link e plano (ouro/prata/bronze). Aprovação para exibição pública

### Infraestrutura do Portal
- **Banner do Site** — Banner configurável no topo: imagem, texto comercial, notícia em destaque ou vídeo incorporado, com agendamento por data
- **Modo Claro/Escuro** — Alternância com persistência em localStorage
- **Notificações Push** — Envio para navegadores inscritos via Supabase Edge Function
- **Dashboard de Uso** — Controle de volume de dados (banco de textos e imagens), limites configuráveis pelo admin
- **Exportação/Importação de Dados** — Backup completo em JSON, restauração e limpeza
- **Sobre Editável** — Texto da página Sobre editável diretamente pelo admin
- **Logo do Site** — Upload de logo personalizado (substitui o "SP" no header/footer)

### SEO e Performance
- **JSON-LD** — Dados estruturados para artigos, site, organização
- **Open Graph / Twitter Cards** — Metatags para compartilhamento em redes sociais
- **RSS** — Feed RSS das últimas notícias
- **Sitemap** — Sitemap XML automático
- **PWA** — Service Worker com cache offline, manifesto, instalação como app

## Stack

| Componente | Tecnologia | Custo |
|------------|-----------|-------|
| Frontend | HTML, CSS, JavaScript (vanilla) | R$ 0 |
| Hospedagem | GitHub Pages | R$ 0 |
| Banco de Dados | Supabase (PostgreSQL) | R$ 0 |
| Autenticação | Supabase Auth | R$ 0 |
| Imagens | Cloudinary | R$ 0 |
| Mapa | Leaflet + OpenStreetMap | R$ 0 |
| Gráficos | Chart.js | R$ 0 |
| Push | Supabase Edge Functions | R$ 0 |
| PDF | html2canvas + jsPDF | R$ 0 |
| IA | Google Gemini API | R$ 0 |
| Fonte | Google Fonts (Inter + Outfit) | R$ 0 |

**Custo mensal total: R$ 0,00** — 100% gratuito.

## Estrutura

```
esporte-sao-pedro/
├── index.html              # Estrutura completa do portal
├── app.js                  # Toda a lógica do frontend (~6500 linhas)
├── app.min.js              # Versão minificada do app.js
├── style.css               # Estilos (~5500 linhas)
├── style.min.css           # Versão minificada do style.css
├── supabase.js             # Camada de integração Supabase
├── upload.js               # Upload de imagens Cloudinary
├── sw.js                   # Service Worker (PWA + Push)
├── manifest.json           # Manifest PWA
├── AGENTS.md               # Instruções para IA (contexto do projeto)
├── funcionalidades_valor.txt
├── supabase/functions/     # Edge Functions (send-push)
└── README.md
```

## Como usar

O projeto roda 100% no navegador. Dados são persistidos no Supabase (tabela `portal_data`, chave-valor) com fallback para localStorage.

1. Acesse: `https://marquezbertin.github.io/esporte-sao-pedro/`
2. Clique em **Editor** no header para fazer login
3. Admin pode cadastrar notícias, campeonatos, atletas, times, programação, etc.

## Admin

Login via Supabase Auth. Apenas usuários na tabela `admin_users` têm acesso administrativo. Os painéis administrativos ficam na seção **Sobre**.

## Licença

Uso livre e gratuito para fins esportivos e comunitários.
