Boa, João. Vamos readaptar toda a estrutura para Figma Make + Supabase. A lógica de negócio continua a mesma, mas a implementação muda bastante. Vou te guiar por cada camada.

Stack Redefinida
Camada	Tecnologia
Frontend / Interface	Figma Make
Backend / Banco de dados	Supabase
Autenticação	Supabase Auth
Login Google	Supabase Auth (Google OAuth)
Armazenamento de avatares	Supabase Storage
Sincronização automática	Supabase Realtime
Funções de servidor	Supabase Edge Functions
Exportar
Copiar
1. Supabase Auth — Autenticação

O Supabase Auth já cuida de email+senha e Google OAuth nativamente.

Configuração no Supabase Dashboard
Authentication → Providers
├── Email → ATIVADO
│   ├── Confirm email: opcional (recomendo desativar no início)
│   └── Secure email change: ATIVADO
│
└── Google → ATIVADO
    ├── Client ID → pegar no Google Cloud Console
    └── Client Secret → pegar no Google Cloud Console

No Figma Make — Cadastro com email
Javascript
Copiar
// Ação de cadastro no Figma Make
const { data, error } = await supabase.auth.signUp({
  email: inputEmail,
  password: inputSenha,
  options: {
    data: {
      nick: inputNick
    }
  }
})
No Figma Make — Login com Google
Javascript
Copiar
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: 'sua-url-do-figma-make'
  }
})
Persistência de sessão
Javascript
Copiar
// Verifica sessão ao abrir o jogo
const { data: { session } } = await supabase.auth.getSession()

if (!session) {
  // Exibe tela de login, bloqueia o jogo
  mostrarTelaDeLogin()
} else {
  // Carrega dados e abre o jogo
  carregarDadosDoUsuario(session.user.id)
}

// Listener que fica escutando mudanças de sessão
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') abrirJogo()
  if (event === 'SIGNED_OUT') mostrarTelaDeLogin()
})
2. Estrutura do Banco de Dados (Supabase / PostgreSQL)
Tabela: nicks (controle global de nicks únicos)
Sql
Copiar
create table nicks (
  nick        text primary key,        -- nick em minúsculo, é o próprio ID
  uid         uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz default now()
);

-- Índice para busca rápida
create index on nicks (uid);
Tabela: profiles (dados do usuário)
Sql
Copiar
create table profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  nick         text not null unique,
  nick_lower   text not null unique,    -- para buscas case-insensitive
  avatar_url   text,
  level        int default 1,
  xp           int default 0,
  created_at   timestamptz default now(),
  last_login   timestamptz default now(),
  settings     jsonb default '{}'::jsonb
);

-- Trigger para criar profile automaticamente após cadastro
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, nick, nick_lower)
  values (
    new.id,
    new.raw_user_meta_data->>'nick',
    lower(new.raw_user_meta_data->>'nick')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
Tabela: game_data (progresso do jogo)
Sql
Copiar
create table game_data (
  uid               uuid primary key references auth.users(id) on delete cascade,
  tasks             jsonb default '[]'::jsonb,
  completed_tasks   int default 0,
  streak_days       int default 0,
  last_active_date  timestamptz,
  inventory         jsonb default '[]'::jsonb,
  equipped_items    jsonb default '{}'::jsonb,
  achievements      jsonb default '[]'::jsonb,
  updated_at        timestamptz default now()
);

-- Trigger para atualizar updated_at automaticamente
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger game_data_updated_at
  before update on game_data
  for each row execute procedure update_updated_at();
Tabela: friendships (lista de amigos)
Sql
Copiar
create table friendships (
  id            uuid primary key default gen_random_uuid(),
  sender_uid    uuid not null references auth.users(id) on delete cascade,
  receiver_uid  uuid not null references auth.users(id) on delete cascade,
  status        text not null default 'pending',  -- 'pending' | 'accepted' | 'declined'
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),

  -- Garante que não existe duplicata de par de amigos
  constraint no_duplicate_friendship unique (sender_uid, receiver_uid),
  -- Garante que o usuário não adiciona a si mesmo
  constraint no_self_friendship check (sender_uid != receiver_uid)
);

create index on friendships (sender_uid);
create index on friendships (receiver_uid);
create index on friendships (status);
3. Row Level Security (RLS) — Segurança dos Dados

Isso é obrigatório no Supabase. Garante que cada usuário só acessa os próprios dados.

Sql
Copiar
-- Ativa RLS em todas as tabelas
alter table profiles enable row level security;
alter table game_data enable row level security;
alter table friendships enable row level security;
alter table nicks enable row level security;

-- PROFILES
create policy "Usuário lê o próprio perfil"
  on profiles for select
  using (auth.uid() = id);

create policy "Usuário atualiza o próprio perfil"
  on profiles for update
  using (auth.uid() = id);

create policy "Perfis são visíveis para busca de amigos"
  on profiles for select
  using (auth.role() = 'authenticated');

-- GAME DATA
create policy "Usuário acessa os próprios dados"
  on game_data for all
  using (auth.uid() = uid);

-- NICKS (leitura pública para busca, escrita só do dono)
create policy "Nick visível para todos autenticados"
  on nicks for select
  using (auth.role() = 'authenticated');

create policy "Usuário cria o próprio nick"
  on nicks for insert
  with check (auth.uid() = uid);

-- FRIENDSHIPS
create policy "Usuário vê as próprias amizades"
  on friendships for select
  using (auth.uid() = sender_uid or auth.uid() = receiver_uid);

create policy "Usuário envia convite"
  on friendships for insert
  with check (auth.uid() = sender_uid);

create policy "Receptor pode atualizar o status"
  on friendships for update
  using (auth.uid() = receiver_uid);
4. Sistema de Amigos — Lógica no Figma Make
Enviar convite de amizade
Javascript
Copiar
async function enviarConvite(nickAlvo) {

  // 1. Busca o nick (case-insensitive)
  const { data: nickData, error: nickError } = await supabase
    .from('nicks')
    .select('uid')
    .eq('nick', nickAlvo.toLowerCase())
    .single()

  if (nickError || !nickData) {
    return mostrarErro('Usuário não encontrado')
  }

  const receptorUid = nickData.uid

  // 2. Verifica se já são amigos ou convite pendente
  const { data: existente } = await supabase
    .from('friendships')
    .select('status')
    .or(`sender_uid.eq.${meuUid},receiver_uid.eq.${meuUid}`)
    .or(`sender_uid.eq.${receptorUid},receiver_uid.eq.${receptorUid}`)
    .single()

  if (existente) {
    if (existente.status === 'accepted') return mostrarErro('Vocês já são amigos')
    if (existente.status === 'pending') return mostrarErro('Convite já enviado')
  }

  // 3. Cria o convite
  const { error } = await supabase
    .from('friendships')
    .insert({
      sender_uid: meuUid,
      receiver_uid: receptorUid,
      status: 'pending'
    })

  if (!error) {
    // 4. Busca dados do alvo para exibir confirmação
    const { data: perfil } = await supabase
      .from('profiles')
      .select('nick, level, avatar_url')
      .eq('id', receptorUid)
      .single()

    mostrarConfirmacao(perfil) // exibe nick, level e avatar
  }
}
Aceitar ou recusar convite
Javascript
Copiar
async function responderConvite(friendshipId, resposta) {
  // resposta: 'accepted' ou 'declined'

  const { data, error } = await supabase
    .from('friendships')
    .update({ status: resposta })
    .eq('id', friendshipId)
    .eq('receiver_uid', meuUid) // garante que só o receptor responde
    .select(`
      sender_uid,
      profiles!friendships_sender_uid_fkey (
        nick,
        level,
        avatar_url
      )
    `)
    .single()

  if (!error && resposta === 'accepted') {
    // Retorna os dados do novo amigo
    return {
      nick: data.profiles.nick,
      level: data.profiles.level,
      avatarUrl: data.profiles.avatar_url
    }
  }
}
Buscar lista de amigos com dados completos
Javascript
Copiar
async function buscarAmigos() {
  const { data, error } = await supabase
    .from('friendships')
    .select(`
      id,
      status,
      sender_uid,
      receiver_uid,
      sender:profiles!friendships_sender_uid_fkey (
        nick, level, avatar_url
      ),
      receiver:profiles!friendships_receiver_uid_fkey (
        nick, level, avatar_url
      )
    `)
    .or(`sender_uid.eq.${meuUid},receiver_uid.eq.${meuUid}`)
    .eq('status', 'accepted')

  // Normaliza para sempre retornar o AMIGO, não o próprio usuário
  return data.map(f => {
    const amigo = f.sender_uid === meuUid ? f.receiver : f.sender
    return {
      nick: amigo.nick,
      level: amigo.level,
      avatarUrl: amigo.avatar_url
    }
  })
}
5. Sincronização Automática com Supabase Realtime
Javascript
Copiar
// Sincroniza game_data automaticamente
function iniciarSincronizacao(uid) {

  supabase
    .channel('game_data_sync')
    .on(
      'postgres_changes',
      {
        event: '*',           // INSERT, UPDATE, DELETE
        schema: 'public',
        table: 'game_data',
        filter: `uid=eq.${uid}`
      },
      (payload) => {
        // Atualiza o estado do jogo com os novos dados
        atualizarJogo(payload.new)
      }
    )
    .subscribe()

  // Sincroniza convites de amizade em tempo real
  supabase
    .channel('friend_requests')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'friendships',
        filter: `receiver_uid=eq.${uid}`
      },
      (payload) => {
        mostrarNotificacaoDeConvite(payload.new)
      }
    )
    .subscribe()
}
Salvar dados do jogo (automático, sem botão)
Javascript
Copiar
// Chamado sempre que qualquer coisa relevante acontece no jogo
async function salvarProgresso(dadosAtualizados) {
  await supabase
    .from('game_data')
    .upsert({
      uid: meuUid,
      ...dadosAtualizados
    })
  // Sem feedback visual necessário — acontece em background
}
6. Validação de Nick Único no Cadastro
Javascript
Copiar
async function verificarNickDisponivel(nick) {
  const { data } = await supabase
    .from('nicks')
    .select('nick')
    .eq('nick', nick.toLowerCase())
    .single()

  return !data // true = disponível, false = em uso
}

async function cadastrar(email, senha, confirmaSenha, nick) {

  // 1. Valida senha
  if (senha !== confirmaSenha) {
    return mostrarErro('As senhas não coincidem')
  }
  if (senha.length < 6) {
    return mostrarErro('Senha muito curta')
  }

  // 2. Valida nick
  const nickRegex = /
^
[a-zA-Z0-9_-]{3,20}
$
/
  if (!nickRegex.test(nick)) {
    return mostrarErro('Nick inválido')
  }

  // 3. Verifica disponibilidade do nick
  const disponivel = await verificarNickDisponivel(nick)
  if (!disponivel) {
    return mostrarErro('Nick já está em uso')
  }

  // 4. Cria a conta
  const { data, error } = await supabase.auth.signUp({
    email,
    password: senha,
    options: { data: { nick } }   // passa o nick pro trigger criar o profile
  })

  if (error) return mostrarErro(error.message)

  // 5. Registra o nick na tabela global
  await supabase.from('nicks').insert({
    nick: nick.toLowerCase(),
    uid: data.user.id
  })
}
7. Fluxo Completo Resumido
ABRIR O JOGO
│
├── getSession()
│   ├── TEM SESSÃO → carregarDados() → abrirJogo()
│   └── SEM SESSÃO → telaDeLogin() [jogo bloqueado]
│
CADASTRO
├── validarSenhas()
├── validarNick()
├── verificarNickDisponivel()
├── supabase.auth.signUp()
├── trigger cria profile automaticamente
├── inserir em nicks
└── abrirJogo()
│
LOGIN GOOGLE
├── signInWithOAuth('google')
├── verificar se profile existe
│   ├── SIM → abrirJogo()
│   └── NÃO → escolherNick() → criar profile → abrirJogo()
│
AMIGOS
├── enviarConvite(nick) → busca nick → cria friendship pending
├── receptor recebe via Realtime → notificação
├── aceitar/recusar → atualiza status
└── lista de amigos retorna nick + level + avatar
│
PROGRESSO
└── qualquer ação no jogo → salvarProgresso() → Supabase Realtime
    → sync automático em todos os dispositivos

8. Checklist de Configuração no Supabase
□ Criar projeto no Supabase
□ Ativar provider Email/Senha em Authentication
□ Ativar provider Google em Authentication
□ Criar as 4 tabelas (nicks, profiles, game_data, friendships)
□ Criar os triggers (handle_new_user, update_updated_at)
□ Ativar RLS em todas as tabelas
□ Criar todas as policies de segurança
□ Ativar Realtime nas tabelas game_data e friendships
□ Pegar a SUPABASE_URL e SUPABASE_ANON_KEY
□ Configurar as variáveis no Figma Make


Quer que eu agora escreva o SQL completo em um único bloco para você rodar direto no Supabase, ou prefere partir para a estrutura das telas no Figma Make com os componentes de login e cadastro?