# Esporte São Pedro

Portal esportivo regional de São Pedro/SP. Full-stack com custo zero.

## Localização
`C:\Users\BrunoBertinMarquez\Documents\GitHub\esporte-sao-pedro`

## Stack
- **Frontend**: HTML, CSS, JavaScript vanilla (sem frameworks)
- **Backend**: Supabase (Auth + PostgreSQL + Storage)
- **Hospedagem**: GitHub Pages
- **Autenticação**: Supabase Auth, admin via tabela `admin_users`

## Arquivos principais
- `index.html` — estrutura das páginas
- `style.css` — estilos (3810+ linhas)
- `app.js` — toda a lógica do portal (4400+ linhas)
- `supabase.js` — camada de integração com Supabase
- `upload.js` — upload de imagens para a nuvem

## Estrutura de dados
Tudo persistido via `getData`/`setData` no Supabase (tabela `portal_data`, chave-valor). Fallback para localStorage.

### Chaves usadas
- `noticias`, `jogos`, `atletas`, `galeria`, `videos`, `episodios`
- `patrocinadores`, `campeonatos`, `opinioes`, `eventos`, `enquetes`
- `conquistas`, `resumos`, `times`, `pautas`, `pautas_monitor`
- `views`, `site_logo`, `sobre`, `newsletter`, `live`, `placar`
- `financeiro` — produtos publicitários
- `financeiro_orcamentos` — orçamentos e vendas

## Admin
- Login: botão "Editor" no header
- Painéis admin ficam na seção **Sobre**
- Painéis admin financeiro ficam na seção **Sobre** e têm resumo na **Início**

## Funcionalidades principais
- Notícias com rich text, galeria, vídeo, agendamento, rascunho
- Campeonatos com classificação, resultados, artilharia
- Calendário de jogos, placar ao vivo, transmissão ao vivo
- Atletas, times, galeria de fotos, vídeos, podcast
- Colunas de opinião, conquistas/medalhas, enquetes
- Newsletter, patrocinadores, resumo da semana
- Monitor de pautas com IA (Gemini)
- Dashboard financeiro: produtos, calculadora de vendas, orçamentos
- SEO (JSON-LD, RSS, Open Graph, Sitemap), PWA
