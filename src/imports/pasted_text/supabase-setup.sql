-- ============================================================================
-- TASKLAND RPG - SUPABASE DATABASE SETUP
-- ============================================================================
-- Execute este script inteiro no Supabase SQL Editor (Dashboard > SQL Editor)
-- Ordem: Extensions > Tabelas > Triggers > RLS > Realtime > Indexes
-- ============================================================================

-- ============================================================================
-- 0. EXTENSIONS
-- ============================================================================

create extension if not exists "pgcrypto"; -- para gen_random_uuid()

-- ============================================================================
-- 1. TABELAS
-- ============================================================================

-- ── 1.1 nicks (controle global de nicks unicos) ─────────────────────────────

create table public.nicks (
  nick        text primary key,                                    -- nick em minusculo, e o proprio ID
  uid         uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz default now()
);

comment on table public.nicks is 'Registro global de nicknames unicos (case-insensitive via nick_lower)';

-- ── 1.2 profiles (dados publicos do usuario) ────────────────────────────────

create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  nick         text not null unique,
  nick_lower   text not null unique,          -- para buscas case-insensitive
  avatar_url   text,
  level        int default 1,
  xp           int default 0,
  created_at   timestamptz default now(),
  last_login   timestamptz default now(),
  settings     jsonb default '{}'::jsonb       -- audio, tema, preferencias
);

comment on table public.profiles is 'Perfil publico do jogador - nick, level, xp, avatar';

-- ── 1.3 game_data (progresso completo do jogo) ──────────────────────────────
-- Armazena TODO o estado do jogo em colunas JSONB para flexibilidade maxima.
-- Isso espelha exatamente as localStorage keys do frontend.

create table public.game_data (
  uid                uuid primary key references auth.users(id) on delete cascade,

  -- Missoes / Campanha
  missions           jsonb default '[]'::jsonb,        -- Mission[] (campanha infinita)
  campaign_order     int default 0,                    -- proximo monstro da campanha
  task_history       jsonb default '[]'::jsonb,        -- historico de tasks completadas
  pity_history       jsonb default '[]'::jsonb,        -- MonsterType[] (ultimos 5 monstros)

  -- Desafios (Time-Attack + Foco)
  challenges         jsonb default '[]'::jsonb,        -- Challenge[]

  -- Habitos
  habits             jsonb default '[]'::jsonb,        -- Habit[]

  -- Economia (moedas, classes, pets, achievements)
  economy            jsonb default '{
    "coins": 0,
    "totalCoinsEarned": 0,
    "selectedClass": null,
    "unlockedClasses": [],
    "pets": [],
    "activePet": null,
    "unlockedAchievements": [],
    "title": null,
    "onePunchBosses": 0
  }'::jsonb,

  -- Renascimento (Rebirth / Rogue-like)
  rebirth            jsonb default '{
    "runNumber": 1,
    "totalRebirths": 0,
    "permanentDamageBonus": 0,
    "permanentAchievements": [],
    "highestLevelEver": 0,
    "totalMonstersEver": 0,
    "totalTasksEver": 0
  }'::jsonb,

  -- Combat Power (cache - recalculado no frontend)
  combat_power       int default 0,
  cp_rank_tier       text default 'F',

  -- Audio settings
  audio_settings     jsonb default '{
    "masterVolume": 0.7,
    "musicVolume": 0.5,
    "sfxVolume": 0.8,
    "musicEnabled": true,
    "sfxEnabled": true
  }'::jsonb,

  -- Estatisticas agregadas (para queries rapidas e ranking futuro)
  total_tasks_completed   int default 0,
  total_monsters_defeated int default 0,
  total_bosses_defeated   int default 0,
  max_habit_streak        int default 0,
  challenges_completed    int default 0,

  -- Player name (exibido no jogo, pode ser diferente do nick)
  player_name        text default 'Aventureiro',

  -- Timestamps
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);

comment on table public.game_data is 'Progresso completo do jogo - espelha localStorage do frontend';

-- ── 1.4 friendships (sistema de amigos) ─────────────────────────────────────

create table public.friendships (
  id            uuid primary key default gen_random_uuid(),
  sender_uid    uuid not null references auth.users(id) on delete cascade,
  receiver_uid  uuid not null references auth.users(id) on delete cascade,
  status        text not null default 'pending',  -- 'pending' | 'accepted' | 'declined'
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),

  -- Garante que nao existe duplicata de par de amigos
  constraint no_duplicate_friendship unique (sender_uid, receiver_uid),
  -- Garante que o usuario nao adiciona a si mesmo
  constraint no_self_friendship check (sender_uid != receiver_uid),
  -- Valida status
  constraint valid_status check (status in ('pending', 'accepted', 'declined'))
);

comment on table public.friendships is 'Convites e amizades entre jogadores';

-- ============================================================================
-- 2. INDEXES
-- ============================================================================

create index idx_nicks_uid             on public.nicks (uid);
create index idx_profiles_nick_lower   on public.profiles (nick_lower);
create index idx_friendships_sender    on public.friendships (sender_uid);
create index idx_friendships_receiver  on public.friendships (receiver_uid);
create index idx_friendships_status    on public.friendships (status);
create index idx_game_data_updated     on public.game_data (updated_at desc);
create index idx_game_data_level       on public.game_data ((economy->>'coins'));  -- para ranking futuro

-- ============================================================================
-- 3. FUNCTIONS & TRIGGERS
-- ============================================================================

-- ── 3.1 Auto-create profile + game_data + nick on signup ─────────────────────

create or replace function public.handle_new_user()
returns trigger as $$
declare
  user_nick text;
  user_nick_lower text;
begin
  user_nick := coalesce(new.raw_user_meta_data->>'nick', 'Aventureiro_' || left(new.id::text, 8));
  user_nick_lower := lower(user_nick);

  -- Criar profile
  insert into public.profiles (id, nick, nick_lower)
  values (new.id, user_nick, user_nick_lower)
  on conflict (id) do nothing;

  -- Registrar nick globalmente
  insert into public.nicks (nick, uid)
  values (user_nick_lower, new.id)
  on conflict (nick) do nothing;

  -- Criar game_data vazio (defaults ja definidos na tabela)
  insert into public.game_data (uid)
  values (new.id)
  on conflict (uid) do nothing;

  return new;
end;
$$ language plpgsql security definer;

-- Trigger: disparado apos cada novo cadastro
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── 3.2 Auto-update updated_at em game_data ─────────────────────────────────

create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists game_data_updated_at on public.game_data;
create trigger game_data_updated_at
  before update on public.game_data
  for each row execute procedure public.update_updated_at();

-- ── 3.3 Auto-update updated_at em friendships ───────────────────────────────

drop trigger if exists friendships_updated_at on public.friendships;
create trigger friendships_updated_at
  before update on public.friendships
  for each row execute procedure public.update_updated_at();

-- ── 3.4 Sync level/xp do game_data para profiles (opcional, para ranking) ──

create or replace function public.sync_profile_stats()
returns trigger as $$
begin
  update public.profiles
  set
    level = coalesce((
      select (new.rebirth->>'highestLevelEver')::int
    ), new.level),
    xp = coalesce(new.total_tasks_completed, 0),
    last_login = now()
  where id = new.uid;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists sync_profile_on_game_update on public.game_data;
create trigger sync_profile_on_game_update
  after update on public.game_data
  for each row execute procedure public.sync_profile_stats();

-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Ativa RLS em todas as tabelas
alter table public.profiles    enable row level security;
alter table public.game_data   enable row level security;
alter table public.friendships enable row level security;
alter table public.nicks       enable row level security;

-- ── 4.1 PROFILES ─────────────────────────────────────────────────────────────

-- Qualquer usuario autenticado pode VER perfis (necessario para busca de amigos)
create policy "profiles_select_authenticated"
  on public.profiles for select
  using (auth.role() = 'authenticated');

-- Usuario so atualiza o proprio perfil
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- Insert via trigger (security definer), mas permitir insert do proprio
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

-- ── 4.2 GAME DATA ───────────────────────────────────────────────────────────

-- Usuario acessa apenas os proprios dados (CRUD completo)
create policy "game_data_all_own"
  on public.game_data for all
  using (auth.uid() = uid);

-- ── 4.3 NICKS ────────────────────────────────────────────────────────────────

-- Qualquer autenticado pode buscar nicks (para adicionar amigos)
create policy "nicks_select_authenticated"
  on public.nicks for select
  using (auth.role() = 'authenticated');

-- Usuario cria apenas o proprio nick
create policy "nicks_insert_own"
  on public.nicks for insert
  with check (auth.uid() = uid);

-- Usuario deleta apenas o proprio nick (para troca de nick)
create policy "nicks_delete_own"
  on public.nicks for delete
  using (auth.uid() = uid);

-- ── 4.4 FRIENDSHIPS ─────────────────────────────────────────────────────────

-- Usuario ve amizades onde ele e sender ou receiver
create policy "friendships_select_own"
  on public.friendships for select
  using (auth.uid() = sender_uid or auth.uid() = receiver_uid);

-- Usuario so pode enviar convites como sender
create policy "friendships_insert_sender"
  on public.friendships for insert
  with check (auth.uid() = sender_uid);

-- Apenas o RECEPTOR pode atualizar o status (aceitar/recusar)
create policy "friendships_update_receiver"
  on public.friendships for update
  using (auth.uid() = receiver_uid);

-- Ambas as partes podem deletar a amizade
create policy "friendships_delete_own"
  on public.friendships for delete
  using (auth.uid() = sender_uid or auth.uid() = receiver_uid);

-- ============================================================================
-- 5. REALTIME
-- ============================================================================
-- Ativa Realtime nas tabelas que precisam de sincronizacao em tempo real.
-- Executar no SQL Editor OU ativar manualmente em Database > Replication.

alter publication supabase_realtime add table public.game_data;
alter publication supabase_realtime add table public.friendships;

-- ============================================================================
-- 6. STORAGE (Avatares)
-- ============================================================================
-- Criar bucket de avatares via Dashboard: Storage > New Bucket
-- Nome: avatars
-- Public: SIM (para exibir avatar sem auth)
--
-- Ou via SQL:
-- insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);
--
-- Policy de upload (apenas o dono):
-- create policy "avatar_upload_own" on storage.objects for insert
--   with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
--
-- Policy de leitura publica:
-- create policy "avatar_public_read" on storage.objects for select
--   using (bucket_id = 'avatars');

-- ============================================================================
-- 7. FUNCOES AUXILIARES (opcionais, uteis para queries)
-- ============================================================================

-- ── 7.1 Buscar perfil por nick (case-insensitive) ──────────────────────────

create or replace function public.find_player_by_nick(search_nick text)
returns table (
  id uuid,
  nick text,
  level int,
  avatar_url text,
  combat_power int,
  cp_rank_tier text
) as $$
begin
  return query
    select
      p.id,
      p.nick,
      p.level,
      p.avatar_url,
      gd.combat_power,
      gd.cp_rank_tier
    from public.profiles p
    left join public.game_data gd on gd.uid = p.id
    where p.nick_lower = lower(search_nick);
end;
$$ language plpgsql security definer;

-- ── 7.2 Listar amigos com dados completos ───────────────────────────────────

create or replace function public.get_friends(player_uid uuid)
returns table (
  friendship_id uuid,
  friend_uid uuid,
  friend_nick text,
  friend_level int,
  friend_avatar_url text,
  friend_combat_power int,
  friend_cp_rank text,
  friendship_since timestamptz
) as $$
begin
  return query
    select
      f.id as friendship_id,
      case when f.sender_uid = player_uid then f.receiver_uid else f.sender_uid end as friend_uid,
      p.nick as friend_nick,
      p.level as friend_level,
      p.avatar_url as friend_avatar_url,
      gd.combat_power as friend_combat_power,
      gd.cp_rank_tier as friend_cp_rank,
      f.updated_at as friendship_since
    from public.friendships f
    join public.profiles p on p.id = case
      when f.sender_uid = player_uid then f.receiver_uid
      else f.sender_uid
    end
    left join public.game_data gd on gd.uid = p.id
    where (f.sender_uid = player_uid or f.receiver_uid = player_uid)
      and f.status = 'accepted'
    order by p.nick;
end;
$$ language plpgsql security definer;

-- ── 7.3 Listar convites pendentes recebidos ─────────────────────────────────

create or replace function public.get_pending_requests(player_uid uuid)
returns table (
  friendship_id uuid,
  sender_uid uuid,
  sender_nick text,
  sender_level int,
  sender_avatar_url text,
  sent_at timestamptz
) as $$
begin
  return query
    select
      f.id as friendship_id,
      f.sender_uid,
      p.nick as sender_nick,
      p.level as sender_level,
      p.avatar_url as sender_avatar_url,
      f.created_at as sent_at
    from public.friendships f
    join public.profiles p on p.id = f.sender_uid
    where f.receiver_uid = player_uid
      and f.status = 'pending'
    order by f.created_at desc;
end;
$$ language plpgsql security definer;

-- ── 7.4 Verificar se nick esta disponivel ───────────────────────────────────

create or replace function public.is_nick_available(check_nick text)
returns boolean as $$
begin
  return not exists (
    select 1 from public.nicks where nick = lower(check_nick)
  );
end;
$$ language plpgsql security definer;

-- ============================================================================
-- FIM DO SETUP
-- ============================================================================
-- Apos executar este script:
--
-- [ ] Ativar Email provider em Authentication > Providers
-- [ ] Ativar Google OAuth em Authentication > Providers
--     (seguir: https://supabase.com/docs/guides/auth/social-login/auth-google)
-- [ ] Criar bucket 'avatars' em Storage (descomente a secao 6 se preferir via SQL)
-- [ ] Verificar Realtime ativo em Database > Replication
-- [ ] Copiar SUPABASE_URL e SUPABASE_ANON_KEY para o frontend
-- ============================================================================
