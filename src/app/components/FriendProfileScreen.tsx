import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { ArrowLeft, Zap, Shield, Swords, Star, Users } from "lucide-react";
import imgAvatarWarrior from "../../assets/profile_pic/profile_pic_warrior.png";
import imgAvatarMage    from "../../assets/profile_pic/profile_pic_mage.png";
import { getPowerRankFromCP, getNextPowerRankFromCP, formatCP } from "../data/combatPower";
import { getRank } from "../data/gameEngine";
import { useAuth } from "../hooks/useAuth";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { PageShell } from "./ui/PageShell";

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-8f0246f6`;

const CARD = {
  background: "#0d1024",
  border: "1px solid rgba(42,46,80,0.8)",
  borderRadius: 10,
  overflow: "hidden",
} as const;

const TOOLBAR = {
  background: "#0b0d1e",
  borderBottom: "1px solid #1f254f",
  padding: "8px 14px",
  display: "flex" as const,
  alignItems: "center" as const,
  gap: 8,
} as const;

export interface FriendProfileData {
  friendUid: string;
  nick: string;
  level: number;
  combatPower: number;
  cpRank: string;
  totalTasks: number;
  totalMonsters: number;
  selectedClass: string;
  since: string | null;
}

export default function FriendProfileScreen() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const { friendId } = useParams<{ friendId: string }>();
  const { session }  = useAuth();

  const stateData = location.state?.friend as FriendProfileData | undefined;
  const [friend, setFriend] = useState<FriendProfileData | null>(stateData ?? null);
  const [loading, setLoading] = useState(!stateData);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!friendId) { setError("Adventurer ID not found."); setLoading(false); return; }
      const token = session?.access_token ?? "";
      try {
        const res  = await fetch(`${SERVER_URL}/friends/profile/${friendId}`, {
          headers: { Authorization: `Bearer ${publicAnonKey}`, "X-User-Token": token },
        });
        const data = await res.json();
        if (data.friend) {
          setFriend(data.friend);
        } else if (!stateData) {
          setError(data.error ?? "Profile not found.");
        }
      } catch (e) {
        console.log("Error fetching friend profile:", e);
        if (!stateData) setError("Connection error loading profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [friendId, session]);

  // ── Back button badge ───────────────────────────────────────────────────────
  const backBadge = (
    <button
      onClick={() => navigate(-1)}
      style={{
        background: "transparent",
        border: "1px solid #2a2e50",
        color: "#8a9fba",
        cursor: "pointer",
        padding: "5px 10px",
        display: "flex",
        alignItems: "center",
        gap: 6,
        borderRadius: 6,
        fontFamily: "'Press Start 2P', monospace",
        fontSize: 7,
        transition: "all 0.15s",
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "#e39f64"; e.currentTarget.style.color = "#e39f64"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "#2a2e50"; e.currentTarget.style.color = "#8a9fba"; }}
    >
      <ArrowLeft size={12} /> BACK
    </button>
  );

  // ── Title helper ─────────────────────────────────────────────────────────────
  const pageTitle = (nick?: string) =>
    nick ? `${nick.toUpperCase()}'S PROFILE` : "ADVENTURER PROFILE";

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading && !friend) {
    return (
      <PageShell icon={<Users size={16} />} title={pageTitle()} accentColor="#c084fc" badge={backBadge}>
        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0", flexDirection: "column", gap: 12 }}>
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: "#f0c040", animation: "pulse 1.5s ease-in-out infinite" }}>
            LOADING PROFILE...
          </div>
        </div>
      </PageShell>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (!friend && error) {
    return (
      <PageShell icon={<Users size={16} />} title={pageTitle()} accentColor="#E63946" badge={backBadge}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0", flexDirection: "column", gap: 16 }}>
          <div style={{ fontFamily: "'VT323', monospace", fontSize: 20, color: "#E63946" }}>{error}</div>
        </div>
      </PageShell>
    );
  }

  if (!friend) return null;

  // ── Derived ──────────────────────────────────────────────────────────────────
  const isMage      = friend.selectedClass === "mago";
  const classAvatar = isMage ? imgAvatarMage : imgAvatarWarrior;
  const classLabel  = isMage ? "MAGE" : "WARRIOR";
  const classColor  = isMage ? "#c084fc" : "#e39f64";

  const cpRankData = getPowerRankFromCP(friend.combatPower);
  const nextRank   = getNextPowerRankFromCP(friend.combatPower);
  const levelRank  = getRank(friend.level);

  let cpProgressPct = 0;
  let remainingCP   = 0;
  if (nextRank) {
    const minCP  = Math.floor(cpRankData.minPower * 75);
    const nextCP = Math.floor(nextRank.minPower * 75);
    const range  = nextCP - minCP;
    const prog   = friend.combatPower - minCP;
    cpProgressPct = Math.min(100, Math.round((prog / range) * 100));
    remainingCP   = Math.max(0, nextCP - friend.combatPower);
  }

  const sinceDate = friend.since
    ? new Date(friend.since).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "—";

  return (
    <>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.75}}`}</style>
      <PageShell icon={<Users size={16} />} title={pageTitle(friend.nick)} accentColor={classColor} badge={backBadge}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* ── Character card ─────────────────────────────────────────────── */}
          <div style={{ ...CARD }}>
            <div style={{ ...TOOLBAR }}>
              <Star size={14} color={classColor} />
              <span style={{ fontFamily: "'Press Start 2P', monospace", color: classColor, fontSize: 9, flex: 1, textShadow: "1px 1px 0 #000" }}>CHARACTER</span>
              <span style={{ fontFamily: "'Press Start 2P', monospace", color: "#FFD700", fontSize: 9, textShadow: "1px 1px 0 #000" }}>LVL {friend.level}</span>
            </div>
            <div style={{ display: "flex", alignItems: "stretch" }}>
              {/* Avatar */}
              <div style={{ width: 110, flexShrink: 0, background: "#0a0c1a", borderRight: `1px solid ${classColor}22`, position: "relative", overflow: "hidden", minHeight: 120 }}>
                <img
                  src={classAvatar}
                  alt={classLabel}
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", imageRendering: "pixelated" }}
                />
                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0,
                  background: `${classColor}dd`,
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: 6, color: "#0d1024",
                  textAlign: "center", padding: "3px 0",
                }}>
                  {classLabel}
                </div>
              </div>
              {/* Info */}
              <div style={{ flex: 1, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ fontFamily: "'Press Start 2P', monospace", color: "#fff", fontSize: 13, textShadow: "1px 1px 0 #000" }}>
                  {friend.nick}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Star size={13} color={levelRank.color} />
                  <span style={{ fontFamily: "'VT323', monospace", color: levelRank.color, fontSize: 22 }}>{levelRank.label}</span>
                </div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <Zap size={12} color={cpRankData.color} />
                  <span style={{
                    fontFamily: "'Press Start 2P', monospace", fontSize: 7,
                    color: cpRankData.color,
                    background: `${cpRankData.color}20`,
                    border: `1px solid ${cpRankData.color}55`,
                    padding: "2px 7px",
                  }}>
                    Rank {cpRankData.tier} · {cpRankData.label}
                  </span>
                </div>
                <div style={{ fontFamily: "'VT323', monospace", color: "#3a4060", fontSize: 16 }}>
                  Friends since {sinceDate}
                </div>
              </div>
            </div>
          </div>

          {/* ── Stats grid ─────────────────────────────────────────────────── */}
          <div style={{ ...CARD }}>
            <div style={{ ...TOOLBAR }}>
              <span style={{ fontSize: 14 }}>📊</span>
              <span style={{ fontFamily: "'Press Start 2P', monospace", color: "#5a6080", fontSize: 9 }}>STATISTICS</span>
            </div>
            <div style={{ padding: "12px 14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { label: "Level",    val: friend.level,                color: "#f0c040",        icon: <Star size={13} color="#f0c040" /> },
                  { label: "Power",    val: formatCP(friend.combatPower / 75), color: cpRankData.color, icon: <Zap size={13} color={cpRankData.color} /> },
                  { label: "Tasks",    val: friend.totalTasks,           color: "#06FFA5",         icon: <Shield size={13} color="#06FFA5" /> },
                  { label: "Monsters", val: friend.totalMonsters,        color: "#E63946",         icon: <Swords size={13} color="#E63946" /> },
                ].map(({ label, val, color, icon }) => (
                  <div key={label} style={{ background: "#0b0d1e", border: "1px solid #1f254f", padding: "12px 14px", borderRadius: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      {icon}
                      <span style={{ fontFamily: "'VT323', monospace", color: "#5a6080", fontSize: 14 }}>{label}</span>
                    </div>
                    <div style={{ fontFamily: "'VT323', monospace", color, fontSize: 30, textShadow: "1px 1px 0 #000", lineHeight: 1 }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Power card ─────────────────────────────────────────────────── */}
          <div style={{ ...CARD, position: "relative" }}>
            <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 30% 20%, ${cpRankData.glow} 0%, transparent 60%)`, pointerEvents: "none", opacity: 0.15 }} />
            <div style={{ ...TOOLBAR, position: "relative", zIndex: 1 }}>
              <Zap size={14} color={cpRankData.color} />
              <span style={{ fontFamily: "'Press Start 2P', monospace", color: cpRankData.color, fontSize: 9, flex: 1, textShadow: "1px 1px 0 #000" }}>POWER</span>
              <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: cpRankData.color, background: `${cpRankData.color}22`, border: `1px solid ${cpRankData.color}44`, padding: "2px 8px" }}>
                {cpRankData.tier} — {cpRankData.label}
              </span>
            </div>
            <div style={{ padding: "16px 18px", position: "relative", zIndex: 1 }}>
              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <div style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: 40, color: cpRankData.color,
                  textShadow: `3px 3px 0 #000, 0 0 24px ${cpRankData.glow}`,
                  letterSpacing: 3, lineHeight: 1,
                }}>
                  {friend.combatPower}
                </div>
                <div style={{ fontFamily: "'VT323', monospace", fontSize: 16, color: "#5a6080", marginTop: 4 }}>POWER</div>
              </div>
              {nextRank ? (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontFamily: "'VT323', monospace", color: cpRankData.color, fontSize: 15 }}>{cpRankData.tier}</span>
                    <span style={{ fontFamily: "'VT323', monospace", color: nextRank.color, fontSize: 15 }}>{nextRank.tier} — {nextRank.label}</span>
                  </div>
                  <div style={{ height: 10, background: "#0b0d1e", border: "2px solid #2a2e50", position: "relative", overflow: "hidden", borderRadius: 4 }}>
                    <div style={{
                      position: "absolute", inset: 0, width: `${cpProgressPct}%`,
                      background: `linear-gradient(90deg, ${cpRankData.color}, ${nextRank.color})`,
                      transition: "width 0.8s ease",
                    }} />
                    <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(90deg,transparent 0px,transparent 10px,rgba(0,0,0,0.2) 10px,rgba(0,0,0,0.2) 11px)", pointerEvents: "none" }} />
                  </div>
                  <div style={{ fontFamily: "'VT323', monospace", color: "#4a5070", fontSize: 14, marginTop: 3 }}>
                    {remainingCP} Power to rank {nextRank.tier}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: "center", fontFamily: "'VT323', monospace", color: cpRankData.color, fontSize: 18, animation: "pulse 2s infinite" }}>
                  ✦ MAX RANK REACHED ✦
                </div>
              )}
            </div>
          </div>

          {/* ── Class banner ───────────────────────────────────────────────── */}
          <div style={{ ...CARD, marginBottom: 8 }}>
            <div style={{ ...TOOLBAR }}>
              <Swords size={14} color={classColor} />
              <span style={{ fontFamily: "'Press Start 2P', monospace", color: classColor, fontSize: 9 }}>CLASS</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", minHeight: 80 }}>
              <div style={{ width: 64, flexShrink: 0, alignSelf: "stretch", background: "#0a0c1a", borderRight: `2px solid ${classColor}33`, position: "relative", overflow: "hidden" }}>
                <img src={classAvatar} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", imageRendering: "pixelated" }} />
              </div>
              <div style={{ padding: "16px 20px", flex: 1 }}>
                <div style={{ fontFamily: "'Press Start 2P', monospace", color: classColor, fontSize: 11, marginBottom: 6 }}>
                  {classLabel}
                </div>
                <div style={{ fontFamily: "'VT323', monospace", color: "#5a6080", fontSize: 16 }}>
                  {isMage
                    ? "XP bonus on tasks · Magic damage on last tasks"
                    : "Physical damage bonus · Extra strength at end of day"}
                </div>
              </div>
            </div>
          </div>

        </div>
      </PageShell>
    </>
  );
}