import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import postgres from "npm:postgres";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use("*", logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "X-User-Token", "X-Admin-Secret"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// ── Startup migration: add missing columns so existing triggers don't fail ────
// The game_data table has a trigger that references NEW.level, but the column
// was never created. We add it here idempotently using ADD COLUMN IF NOT EXISTS.
// SUPABASE_DB_URL connects as the postgres superuser, so DDL is allowed.
async function runStartupMigrations() {
  const dbUrl = Deno.env.get("SUPABASE_DB_URL");
  if (!dbUrl) {
    console.log("[Migration] SUPABASE_DB_URL not set — skipping");
    return;
  }
  const pg = postgres(dbUrl, { max: 1 });
  try {
    await pg`
      ALTER TABLE public.game_data
      ADD COLUMN IF NOT EXISTS level INTEGER NOT NULL DEFAULT 1
    `;
    console.log("[Migration] game_data.level column ensured ✓");
  } catch (e: any) {
    console.log("[Migration] Could not alter game_data:", e.message);
  } finally {
    await pg.end({ timeout: 5 });
  }
}

// Run immediately — don't await so the server starts without blocking
runStartupMigrations().catch(console.error);

// ── Helper: get Supabase admin client ────────────────────────────────────────
function getAdminClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

// ── Helper: get authenticated user from request ──────────────────────────────
// Authorization: Bearer <publicAnonKey>  → passes the Supabase gateway
// X-User-Token: <userJWT>               → our server reads the user identity
//
// We validate the user JWT by calling the Supabase Auth REST endpoint directly
// via raw fetch. This is the most reliable approach in Deno Edge Functions —
// it bypasses any SDK wrapper quirks (global-header interference, singleton
// state, version-specific bugs) and directly hits /auth/v1/user.
async function getAuthUser(request: Request) {
  const accessToken = request.headers.get("X-User-Token");
  if (!accessToken || accessToken.length < 30) {
    console.log("[Auth] Missing or short X-User-Token (len:", accessToken?.length ?? 0, ")");
    return null;
  }

  // Must look like a JWT (3 dot-separated parts)
  const parts = accessToken.split(".");
  if (parts.length !== 3) {
    console.log("[Auth] X-User-Token is not a valid JWT (got", parts.length, "parts)");
    return null;
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey     = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Direct REST call to Supabase Auth — exactly what the JS SDK does internally.
    // Sending the user JWT as the Bearer token lets the auth server validate it
    // (signature, expiry, issuer) and return the user object.
    const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        apikey: anonKey,
      },
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.log("[Auth] /auth/v1/user returned", res.status, body.slice(0, 200));
      return null;
    }

    const user = await res.json();
    if (!user?.id) {
      console.log("[Auth] /auth/v1/user: no id in response");
      return null;
    }

    console.log("[Auth] Validated user:", user.id);
    return user;
  } catch (e: any) {
    console.log("[Auth] Exception validating token:", e.message);
    return null;
  }
}

// ── Health check ─────────────────────────────────────────────────────────────
app.get("/make-server-8f0246f6/health", (c) => {
  return c.json({ status: "ok" });
});

// ── Level computation (mirrors client-side getLevelInfo) ─────────────────────
// Kept server-side so the game_data trigger (which references NEW.level) always
// receives a valid integer, even if the client never sends one explicitly.
function xpForLevel(level: number): number {
  if (level <= 0) return 50;
  const earlyThresholds = [50, 100, 200, 350, 500];
  if (level <= 5) return earlyThresholds[level - 1];
  return Math.round(500 * Math.pow(1.25, level - 5));
}

function computeLevel(totalXP: number): number {
  let level = 1;
  let spent = 0;
  while (true) {
    const needed = xpForLevel(level);
    if (totalXP - spent < needed) return level;
    spent += needed;
    level++;
    // Safety cap to avoid infinite loop with broken XP values
    if (level > 9999) return level;
  }
}

// ── AUTH: Signup ──────────────────────────────────────────────────────────────
// Uses service role to auto-confirm email (no email server configured)
app.post("/make-server-8f0246f6/auth/signup", async (c) => {
  try {
    const { email, password, nick } = await c.req.json();

    // Validate inputs
    if (!email || !password || !nick) {
      return c.json({ error: "Email, senha e nick sao obrigatorios" }, 400);
    }

    if (password.length < 6) {
      return c.json({ error: "Senha deve ter pelo menos 6 caracteres" }, 400);
    }

    const nickRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    if (!nickRegex.test(nick)) {
      return c.json({ error: "Nick deve ter 3-20 caracteres (letras, numeros, _ ou -)" }, 400);
    }

    const supabase = getAdminClient();

    // Check if nick is available
    const { data: existingNick } = await supabase
      .from("nicks")
      .select("nick")
      .eq("nick", nick.toLowerCase())
      .single();

    if (existingNick) {
      return c.json({ error: "Este nick ja esta em uso" }, 409);
    }

    // Create user with auto-confirm
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { nick },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true,
    });

    if (error) {
      console.log("Error creating user during signup:", error);
      return c.json({ error: error.message }, 400);
    }

    // The trigger `on_auth_user_created` will auto-create profile, nick, and game_data

    return c.json({
      success: true,
      user: { id: data.user.id, email: data.user.email },
    });
  } catch (e: any) {
    console.log("Signup endpoint error:", e);
    return c.json({ error: "Erro interno no servidor durante cadastro: " + e.message }, 500);
  }
});

// ── AUTH: Check nick availability ────────────────────────────────────────────
app.get("/make-server-8f0246f6/auth/check-nick/:nick", async (c) => {
  try {
    const nick = c.req.param("nick").toLowerCase();
    const supabase = getAdminClient();

    const { data } = await supabase
      .from("nicks")
      .select("nick")
      .eq("nick", nick)
      .single();

    return c.json({ available: !data });
  } catch (e: any) {
    console.log("Check nick error:", e);
    return c.json({ error: "Erro ao verificar nick: " + e.message }, 500);
  }
});

// ── FRIENDS: Search player by nick ───────────────────────────────────────────
app.get("/make-server-8f0246f6/friends/search/:nick", async (c) => {
  try {
    const user = await getAuthUser(c.req.raw);
    if (!user) return c.json({ error: "Nao autorizado" }, 401);

    const nick = c.req.param("nick").toLowerCase();
    const supabase = getAdminClient();

    const { data, error } = await supabase
      .from("profiles")
      .select("id, nick, level, avatar_url")
      .eq("nick_lower", nick)
      .single();

    if (error || !data) {
      return c.json({ error: "Jogador nao encontrado" }, 404);
    }

    // Don't return self
    if (data.id === user.id) {
      return c.json({ error: "Voce nao pode adicionar a si mesmo" }, 400);
    }

    // Get combat power
    const { data: gameData } = await supabase
      .from("game_data")
      .select("combat_power, cp_rank_tier")
      .eq("uid", data.id)
      .single();

    return c.json({
      player: {
        id: data.id,
        nick: data.nick,
        level: data.level,
        avatarUrl: data.avatar_url,
        combatPower: gameData?.combat_power ?? 0,
        cpRank: gameData?.cp_rank_tier ?? "F",
      },
    });
  } catch (e: any) {
    console.log("Search player error:", e);
    return c.json({ error: "Erro ao buscar jogador: " + e.message }, 500);
  }
});

// ── FRIENDS: Send friend request ─────────────────────────────────────────────
app.post("/make-server-8f0246f6/friends/request", async (c) => {
  try {
    const user = await getAuthUser(c.req.raw);
    if (!user) return c.json({ error: "Nao autorizado" }, 401);

    const { receiverUid } = await c.req.json();
    if (!receiverUid) return c.json({ error: "receiverUid obrigatorio" }, 400);

    const supabase = getAdminClient();

    // Check if friendship already exists (in either direction)
    const { data: existing } = await supabase
      .from("friendships")
      .select("id, status")
      .or(
        `and(sender_uid.eq.${user.id},receiver_uid.eq.${receiverUid}),and(sender_uid.eq.${receiverUid},receiver_uid.eq.${user.id})`
      );

    if (existing && existing.length > 0) {
      const f = existing[0];
      if (f.status === "accepted") return c.json({ error: "Voces ja sao amigos" }, 409);
      if (f.status === "pending") return c.json({ error: "Convite ja enviado ou pendente" }, 409);
    }

    // Create friendship
    const { error } = await supabase
      .from("friendships")
      .insert({
        sender_uid: user.id,
        receiver_uid: receiverUid,
        status: "pending",
      });

    if (error) {
      console.log("Error creating friendship:", error);
      return c.json({ error: "Erro ao enviar convite: " + error.message }, 400);
    }

    return c.json({ success: true });
  } catch (e: any) {
    console.log("Send friend request error:", e);
    return c.json({ error: "Erro ao enviar convite: " + e.message }, 500);
  }
});

// ── FRIENDS: Respond to friend request ───────────────────────────────────────
app.put("/make-server-8f0246f6/friends/respond", async (c) => {
  try {
    const user = await getAuthUser(c.req.raw);
    if (!user) return c.json({ error: "Nao autorizado" }, 401);

    const { friendshipId, response } = await c.req.json();
    if (!friendshipId || !response) {
      return c.json({ error: "friendshipId e response obrigatorios" }, 400);
    }

    if (!["accepted", "declined"].includes(response)) {
      return c.json({ error: "response deve ser 'accepted' ou 'declined'" }, 400);
    }

    const supabase = getAdminClient();

    const { data, error } = await supabase
      .from("friendships")
      .update({ status: response })
      .eq("id", friendshipId)
      .eq("receiver_uid", user.id)
      .select()
      .single();

    if (error) {
      console.log("Error responding to friendship:", error);
      return c.json({ error: "Erro ao responder convite: " + error.message }, 400);
    }

    return c.json({ success: true, friendship: data });
  } catch (e: any) {
    console.log("Respond friend request error:", e);
    return c.json({ error: "Erro ao responder convite: " + e.message }, 500);
  }
});

// ── FRIENDS: List friends ────────────────────────────────────────────────────
app.get("/make-server-8f0246f6/friends/list", async (c) => {
  try {
    const user = await getAuthUser(c.req.raw);
    if (!user) return c.json({ error: "Nao autorizado" }, 401);

    const supabase = getAdminClient();

    const { data, error } = await supabase
      .from("friendships")
      .select(`
        id,
        status,
        sender_uid,
        receiver_uid,
        created_at,
        updated_at
      `)
      .or(`sender_uid.eq.${user.id},receiver_uid.eq.${user.id}`);

    if (error) {
      console.log("Error listing friendships:", error);
      return c.json({ error: "Erro ao listar amigos: " + error.message }, 500);
    }

    // Gather all unique friend UIDs
    const friendUids = new Set<string>();
    for (const f of (data ?? [])) {
      if (f.sender_uid !== user.id) friendUids.add(f.sender_uid);
      if (f.receiver_uid !== user.id) friendUids.add(f.receiver_uid);
    }

    // Fetch profiles for all friends
    let profiles: Record<string, any> = {};
    if (friendUids.size > 0) {
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, nick, level, avatar_url")
        .in("id", Array.from(friendUids));

      for (const p of (profilesData ?? [])) {
        profiles[p.id] = p;
      }
    }

    // Fetch game data for combat power
    let gameDataMap: Record<string, any> = {};
    if (friendUids.size > 0) {
      const { data: gdData } = await supabase
        .from("game_data")
        .select("uid, combat_power, cp_rank_tier, total_tasks_completed, total_monsters_defeated, economy")
        .in("uid", Array.from(friendUids));

      for (const gd of (gdData ?? [])) {
        gameDataMap[gd.uid] = gd;
      }
    }

    // Build response
    const friends = (data ?? []).map(f => {
      const friendUid = f.sender_uid === user.id ? f.receiver_uid : f.sender_uid;
      const profile = profiles[friendUid];
      const gd = gameDataMap[friendUid];

      return {
        friendshipId: f.id,
        status: f.status,
        isIncoming: f.receiver_uid === user.id,
        friendUid,
        nick: profile?.nick ?? "???",
        level: profile?.level ?? 1,
        avatarUrl: profile?.avatar_url,
        combatPower: gd?.combat_power ?? 0,
        cpRank: gd?.cp_rank_tier ?? "F",
        totalTasks: gd?.total_tasks_completed ?? 0,
        totalMonsters: gd?.total_monsters_defeated ?? 0,
        selectedClass: gd?.economy?.selectedClass ?? "guerreiro",
        since: f.updated_at,
      };
    });

    return c.json({ friends });
  } catch (e: any) {
    console.log("List friends error:", e);
    return c.json({ error: "Erro ao listar amigos: " + e.message }, 500);
  }
});

// ── FRIENDS: Remove friend ───────────────────────────────────────────────────
app.delete("/make-server-8f0246f6/friends/:id", async (c) => {
  try {
    const user = await getAuthUser(c.req.raw);
    if (!user) return c.json({ error: "Nao autorizado" }, 401);

    const friendshipId = c.req.param("id");
    const supabase = getAdminClient();

    const { error } = await supabase
      .from("friendships")
      .delete()
      .eq("id", friendshipId)
      .or(`sender_uid.eq.${user.id},receiver_uid.eq.${user.id}`);

    if (error) {
      console.log("Error removing friend:", error);
      return c.json({ error: "Erro ao remover amigo: " + error.message }, 400);
    }

    return c.json({ success: true });
  } catch (e: any) {
    console.log("Remove friend error:", e);
    return c.json({ error: "Erro ao remover amigo: " + e.message }, 500);
  }
});

// ── FRIENDS: Get friend profile by UID ───────────────────────────────────────
app.get("/make-server-8f0246f6/friends/profile/:uid", async (c) => {
  try {
    const user = await getAuthUser(c.req.raw);
    if (!user) return c.json({ error: "Nao autorizado" }, 401);

    const targetUid = c.req.param("uid");
    const supabase = getAdminClient();

    // Fetch profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, nick, level, avatar_url")
      .eq("id", targetUid)
      .single();

    // Fetch game data
    const { data: gd } = await supabase
      .from("game_data")
      .select("uid, combat_power, cp_rank_tier, total_tasks_completed, total_monsters_defeated, economy")
      .eq("uid", targetUid)
      .single();

    // Fetch friendship to get the "since" date
    const { data: friendship } = await supabase
      .from("friendships")
      .select("id, updated_at, sender_uid, receiver_uid")
      .or(`and(sender_uid.eq.${user.id},receiver_uid.eq.${targetUid}),and(sender_uid.eq.${targetUid},receiver_uid.eq.${user.id})`)
      .eq("status", "accepted")
      .maybeSingle();

    if (!profile) {
      return c.json({ error: "Perfil nao encontrado" }, 404);
    }

    return c.json({
      friend: {
        friendUid: targetUid,
        nick: profile.nick ?? "???",
        level: profile.level ?? 1,
        avatarUrl: profile.avatar_url,
        combatPower: gd?.combat_power ?? 0,
        cpRank: gd?.cp_rank_tier ?? "F",
        totalTasks: gd?.total_tasks_completed ?? 0,
        totalMonsters: gd?.total_monsters_defeated ?? 0,
        selectedClass: gd?.economy?.selectedClass ?? "guerreiro",
        since: friendship?.updated_at ?? null,
      },
    });
  } catch (e: any) {
    console.log("Get friend profile error:", e);
    return c.json({ error: "Erro ao buscar perfil: " + e.message }, 500);
  }
});

// ── PROFILE: Update nick ─────────────────────────────────────────────────────
app.put("/make-server-8f0246f6/profile/nick", async (c) => {
  try {
    const user = await getAuthUser(c.req.raw);
    if (!user) return c.json({ error: "Nao autorizado" }, 401);

    const { newNick } = await c.req.json();
    if (!newNick) return c.json({ error: "newNick obrigatorio" }, 400);

    const nickRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    if (!nickRegex.test(newNick)) {
      return c.json({ error: "Nick invalido (3-20 chars, letras/numeros/_/-)" }, 400);
    }

    const supabase = getAdminClient();

    // Check availability
    const { data: existing } = await supabase
      .from("nicks")
      .select("nick")
      .eq("nick", newNick.toLowerCase())
      .single();

    if (existing) {
      return c.json({ error: "Nick ja em uso" }, 409);
    }

    // Get current nick
    const { data: profile } = await supabase
      .from("profiles")
      .select("nick_lower")
      .eq("id", user.id)
      .single();

    // Delete old nick
    if (profile?.nick_lower) {
      await supabase.from("nicks").delete().eq("nick", profile.nick_lower);
    }

    // Insert new nick
    await supabase.from("nicks").insert({
      nick: newNick.toLowerCase(),
      uid: user.id,
    });

    // Update profile
    await supabase
      .from("profiles")
      .update({ nick: newNick, nick_lower: newNick.toLowerCase() })
      .eq("id", user.id);

    return c.json({ success: true, nick: newNick });
  } catch (e: any) {
    console.log("Update nick error:", e);
    return c.json({ error: "Erro ao atualizar nick: " + e.message }, 500);
  }
});

// ── GAME DATA: Push (save game state to cloud) ──────────────────────────────
app.post("/make-server-8f0246f6/game-data/push", async (c) => {
  try {
    const user = await getAuthUser(c.req.raw);
    if (!user) return c.json({ error: "Nao autorizado" }, 401);

    const body = await c.req.json();
    const supabase = getAdminClient();

    // ── Compute totalXP + level from missions (needed for DB trigger) ─────
    // The game_data table has a trigger that references NEW.level.
    // We compute the level server-side so it's always present in the upsert.
    let totalXP = 0;
    const missions: any[] = body.gameData?.missions ?? [];
    for (const m of missions) {
      for (const t of (m.tasks ?? [])) {
        if (t.completed) {
          const base: Record<string, number> = { easy: 10, medium: 20, hard: 30 };
          totalXP += base[t.difficulty ?? "easy"] ?? 10;
        }
      }
    }
    // Add bonus XP stored separately in the economy/rebirth state
    const bonusXP: number = body.gameData?.economy?.bonusXP ?? 0;
    const computedLevel = computeLevel(totalXP + bonusXP);

    // ── Upsert game_data (uses SERVICE_ROLE_KEY → bypasses RLS) ──────────
    // combat_power is now sent as an integer CP value (e.g. 212) from the client.
    // No conversion needed. Round as a safety net for legacy float values.
    const rawCombatPower: number = body.gameData?.combat_power ?? 1;
    const safeCombatPower: number = Math.round(rawCombatPower);

    const { error: gdError } = await supabase
      .from("game_data")
      .upsert({
        uid: user.id,
        ...body.gameData,
        // Override with safe integer value
        combat_power: safeCombatPower,
        // Always include `level` so the DB trigger (NEW.level) doesn't fail
        level: computedLevel,
        updated_at: new Date().toISOString(),
      });

    if (gdError) {
      console.log("[game-data/push] game_data upsert error:", JSON.stringify(gdError));
      return c.json({ error: "Erro ao salvar game_data: " + gdError.message, details: gdError }, 500);
    }

    // ── Update profile level/xp (non-critical) ──────────────────────────
    if (body.profileUpdate) {
      const profilePayload = {
        ...body.profileUpdate,
        // Ensure the profile level is consistent with the computed level
        level: computedLevel,
      };
      const { error: profError } = await supabase
        .from("profiles")
        .update(profilePayload)
        .eq("id", user.id);

      if (profError) {
        console.log("[game-data/push] profile update error (non-critical):", JSON.stringify(profError));
      }
    }

    console.log(`[game-data/push] OK for user ${user.id}, level=${computedLevel}, totalXP=${totalXP}`);
    return c.json({ success: true });
  } catch (e: any) {
    console.log("[game-data/push] exception:", e);
    return c.json({ error: "Erro ao salvar dados: " + e.message }, 500);
  }
});

// ── GAME DATA: Pull (load game state from cloud) ─────────────────────────────
app.get("/make-server-8f0246f6/game-data/pull", async (c) => {
  try {
    const user = await getAuthUser(c.req.raw);
    if (!user) return c.json({ error: "Nao autorizado" }, 401);

    const supabase = getAdminClient();

    const { data, error } = await supabase
      .from("game_data")
      .select("*")
      .eq("uid", user.id)
      .maybeSingle();

    if (error) {
      console.log("[game-data/pull] select error:", JSON.stringify(error));
      return c.json({ error: "Erro ao carregar game_data: " + error.message, details: error }, 500);
    }

    if (!data) {
      console.log(`[game-data/pull] No row for user ${user.id}`);
      return c.json({ exists: false });
    }

    console.log(`[game-data/pull] OK for user ${user.id}, updated_at=${data.updated_at}`);
    return c.json({ exists: true, data });
  } catch (e: any) {
    console.log("[game-data/pull] exception:", e);
    return c.json({ error: "Erro ao carregar dados: " + e.message }, 500);
  }
});

// ── ADMIN: Wipe check — clients poll this to detect server-side wipes ─────────
app.get("/make-server-8f0246f6/admin/wipe-check", async (c) => {
  try {
    const wipeAt = await kv.get("global_wipe_at");
    return c.json({ wipeAt: wipeAt ?? null });
  } catch (e: any) {
    console.log("[admin/wipe-check] error:", e.message);
    return c.json({ wipeAt: null });
  }
});

// ── ADMIN: Execute full Wipe — resets all game_data and profiles ──────────────
// Protected by X-Admin-Secret header (must match ADMIN_WIPE_SECRET env var)
app.post("/make-server-8f0246f6/admin/wipe", async (c) => {
  try {
    const secret = c.req.header("X-Admin-Secret");
    const expected = Deno.env.get("ADMIN_WIPE_SECRET");

    if (!expected) {
      console.log("[admin/wipe] ADMIN_WIPE_SECRET not set on server");
      return c.json({ error: "Wipe não configurado no servidor" }, 503);
    }
    if (!secret || secret !== expected) {
      console.log("[admin/wipe] Invalid secret attempt");
      return c.json({ error: "Segredo inválido" }, 401);
    }

    const dbUrl = Deno.env.get("SUPABASE_DB_URL");
    if (!dbUrl) {
      return c.json({ error: "SUPABASE_DB_URL não configurado" }, 503);
    }

    const now = new Date().toISOString();

    const defaultEconomy = {
      selectedClass: null,
      bonusXP: 0,
      coins: 0,
      unlockedAchievements: [],
      focusDamageBonus: 0,
    };

    // Use postgres direct connection for the mass update (bypasses RLS)
    const pg = postgres(dbUrl, { max: 1 });
    let affectedGameData = 0;
    let affectedProfiles = 0;

    try {
      // Reset all game_data rows
      const gdResult = await pg`
        UPDATE public.game_data
        SET
          missions              = '[]'::jsonb,
          campaign_order        = 0,
          task_history          = '[]'::jsonb,
          pity_history          = '[]'::jsonb,
          challenges            = '[]'::jsonb,
          habits                = '[]'::jsonb,
          economy               = ${JSON.stringify(defaultEconomy)}::jsonb,
          combat_power          = 75,
          cp_rank_tier          = 'F',
          level                 = 1,
          total_tasks_completed = 0,
          total_monsters_defeated = 0,
          total_bosses_defeated = 0,
          max_habit_streak      = 0,
          challenges_completed  = 0,
          updated_at            = ${now}
      `;
      affectedGameData = Number(gdResult.count ?? 0);
      console.log(`[admin/wipe] game_data rows reset: ${affectedGameData}`);

      // Reset profiles level
      const profResult = await pg`
        UPDATE public.profiles
        SET level = 1
      `;
      affectedProfiles = Number(profResult.count ?? 0);
      console.log(`[admin/wipe] profiles rows reset: ${affectedProfiles}`);
    } finally {
      await pg.end({ timeout: 5 });
    }

    // Store the wipe timestamp in KV — clients poll this to detect the wipe
    await kv.set("global_wipe_at", now);
    console.log(`[admin/wipe] Global wipe complete at ${now}`);

    return c.json({
      success: true,
      wipedAt: now,
      affectedGameData,
      affectedProfiles,
    });
  } catch (e: any) {
    console.log("[admin/wipe] exception:", e);
    return c.json({ error: "Erro ao executar wipe: " + e.message }, 500);
  }
});

Deno.serve(app.fetch);