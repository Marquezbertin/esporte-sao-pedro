-- Esporte Sao Pedro - RLS + Admin Auth (custo zero)
-- Rode este arquivo no Supabase Dashboard > SQL Editor.
--
-- Antes de rodar:
-- 1. Crie um usuario em Authentication > Users.
-- 2. Copie o UUID desse usuario.
-- 3. Depois de executar a criacao da tabela admin_users, rode o INSERT comentado
--    abaixo trocando o UUID e o e-mail pelos seus dados.

create table if not exists public.admin_users (
    user_id uuid primary key references auth.users(id) on delete cascade,
    email text,
    created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

grant select on table public.admin_users to authenticated;

drop policy if exists "Admin users can read own row" on public.admin_users;
create policy "Admin users can read own row"
on public.admin_users
for select
to authenticated
using (auth.uid() = user_id);

-- Depois de criar o usuario no Supabase Auth, rode uma linha como esta:
-- insert into public.admin_users (user_id, email)
-- values ('00000000-0000-0000-0000-000000000000', 'seu-email@exemplo.com')
-- on conflict (user_id) do update set email = excluded.email;

alter table public.portal_data enable row level security;

grant select, insert, update, delete on table public.portal_data to anon, authenticated;

drop policy if exists "Public can read portal data" on public.portal_data;
drop policy if exists "Admins can insert portal data" on public.portal_data;
drop policy if exists "Admins can update portal data" on public.portal_data;
drop policy if exists "Admins can delete portal data" on public.portal_data;
drop policy if exists "Public can insert interactive data" on public.portal_data;
drop policy if exists "Public can update interactive data" on public.portal_data;

create policy "Public can read portal data"
on public.portal_data
for select
to anon, authenticated
using (true);

create policy "Admins can insert portal data"
on public.portal_data
for insert
to authenticated
with check (
    exists (
        select 1
        from public.admin_users admin
        where admin.user_id = auth.uid()
    )
);

create policy "Admins can update portal data"
on public.portal_data
for update
to authenticated
using (
    exists (
        select 1
        from public.admin_users admin
        where admin.user_id = auth.uid()
    )
)
with check (
    exists (
        select 1
        from public.admin_users admin
        where admin.user_id = auth.uid()
    )
);

create policy "Admins can delete portal data"
on public.portal_data
for delete
to authenticated
using (
    exists (
        select 1
        from public.admin_users admin
        where admin.user_id = auth.uid()
    )
);

-- Mantem recursos publicos atuais sem custo:
-- newsletter, votos de enquete e contador de views.
-- Observacao: como estes dados hoje ficam em documentos JSON compartilhados,
-- a protecao perfeita exige separar votos/newsletter/views em tabelas proprias.
create policy "Public can insert interactive data"
on public.portal_data
for insert
to anon, authenticated
with check (id in ('newsletter', 'enquetes', 'views'));

create policy "Public can update interactive data"
on public.portal_data
for update
to anon, authenticated
using (id in ('newsletter', 'enquetes', 'views'))
with check (id in ('newsletter', 'enquetes', 'views'));
