# Configuracao de seguranca do Supabase

Este projeto continua com custo zero: GitHub Pages + Supabase Free + Cloudinary Free.

## 1. Criar usuario admin

No Supabase:

1. Acesse `Authentication > Users`.
2. Crie um usuario com e-mail e senha fortes.
3. Copie o `User UID` desse usuario.

## 2. Aplicar RLS

1. Acesse `SQL Editor`.
2. Abra o arquivo `supabase-rls-admin.sql` deste repositorio.
3. Execute o SQL.
4. Depois, execute o `insert into public.admin_users...` que esta comentado no arquivo, trocando:
   - `00000000-0000-0000-0000-000000000000` pelo `User UID`.
   - `seu-email@exemplo.com` pelo e-mail do admin.

## 3. Recomendada: bloquear cadastro publico

No Supabase, em `Authentication > Providers > Email`, deixe o cadastro publico desativado se o portal tiver apenas um editor.

## 4. Como fica depois

- Leitores continuam lendo o portal publicamente.
- Admin faz login com e-mail e senha do Supabase.
- Escritas importantes ficam bloqueadas por RLS para quem nao estiver em `admin_users`.
- Newsletter, votos de enquete e views continuam funcionando como interacoes publicas.

Observacao: para proteger newsletter/votos/views de forma perfeita, o ideal futuro e separar esses dados em tabelas proprias. A politica atual preserva o funcionamento sem custo e sem reestruturar o banco agora.
