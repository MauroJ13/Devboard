-- =====================================================================
-- Devboard – Datenbankschema für Supabase
-- Ausführen: Supabase Dashboard → SQL Editor → New query → einfügen → Run
-- =====================================================================

-- Team-Mitglieder
create table if not exists public.members (
  id          uuid primary key,
  name        text not null check (char_length(trim(name)) > 0),
  email       text not null default '',
  created_at  timestamptz not null default now()
);

-- Boards
create table if not exists public.boards (
  id          uuid primary key,
  title       text not null check (char_length(trim(title)) > 0),
  created_at  timestamptz not null default now()
);

-- Tasks (gehören zu einem Board; zugewiesene Person verweist auf members)
create table if not exists public.tasks (
  id                  uuid primary key,
  board_id            uuid not null references public.boards (id) on delete cascade,
  title               text not null check (char_length(trim(title)) > 0),
  description         text not null default '',
  assigned_member_id  uuid references public.members (id) on delete set null,
  deadline            date,
  column_id           text not null check (column_id in ('todo', 'in-progress', 'done')),
  position            integer not null default 0,
  created_at          timestamptz not null default now()
);

create index if not exists tasks_board_id_idx on public.tasks (board_id);
create index if not exists tasks_assigned_member_id_idx on public.tasks (assigned_member_id);

-- ---------------------------------------------------------------------
-- Row Level Security
-- Die App hat (noch) keinen Login. Damit der öffentliche anon-Key lesen und
-- schreiben darf, sind die Policies bewusst offen.
-- ACHTUNG: Jeder mit URL + anon-Key kann die Daten ändern. Für den
-- produktiven Einsatz Supabase Auth ergänzen und die Policies z. B. auf
-- "to authenticated" bzw. auf auth.uid() einschränken.
-- ---------------------------------------------------------------------
alter table public.members enable row level security;
alter table public.boards  enable row level security;
alter table public.tasks   enable row level security;

drop policy if exists "devboard members full access" on public.members;
create policy "devboard members full access" on public.members
  for all to anon, authenticated using (true) with check (true);

drop policy if exists "devboard boards full access" on public.boards;
create policy "devboard boards full access" on public.boards
  for all to anon, authenticated using (true) with check (true);

drop policy if exists "devboard tasks full access" on public.tasks;
create policy "devboard tasks full access" on public.tasks
  for all to anon, authenticated using (true) with check (true);
