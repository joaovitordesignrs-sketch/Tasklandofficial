// ── Friends Screen ────────────────────────────────────────────────────────────
// System for sending/receiving friend requests and viewing friends list.

import { useState, useEffect, useCallback } from "react";
import { UserPlus, Users, Check, X, Search, Trash2, ArrowLeft, RefreshCw, Zap } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { useIsDesktop } from "../hooks/useIsDesktop";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import imgAvatarWarrior from "../../assets/profile_pic/profile_pic_warrior.webp";
import imgAvatarMage from "../../assets/profile_pic/profile_pic_mage.webp";
import { PageShell } from "./ui/PageShell";
import { RpgButton } from "./ui/RpgButton";
import { useTheme } from "../contexts/PreferencesContext";

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-8f0246f6`;

interface Friend {
  friendshipId: string;
  status: "pending" | "accepted" | "declined";
  isIncoming: boolean;
  friendUid: string;
  nick: string;
  level: number;
  avatarUrl: string | null;
  combatPower: number;
  cpRank: string;
  totalTasks: number;
  totalMonsters: number;
  selectedClass: string;
  since: string;
}

interface SearchResult {
  id: string;
  nick: string;
  level: number;
  avatarUrl: string | null;
  combatPower: number;
  cpRank: string;
}

export default function FriendsScreen() {
  const {
    BG_DEEPEST, BG_CARD, BORDER_SUBTLE, BORDER_ELEVATED,
    COLOR_WARRIOR, COLOR_DANGER, COLOR_SUCCESS, COLOR_LEGENDARY, COLOR_MAGE, COLOR_ORANGE,
    TEXT_INACTIVE, TEXT_MUTED, RANK_VETERANO,
    FONT_PIXEL, FONT_BODY, RADIUS_XL, RADIUS_LG, PX_XS, alpha,
  } = useTheme();

  const RANK_COLORS: Record<string, string> = {
    "S+": "#FF2D55", S: COLOR_LEGENDARY, A: COLOR_ORANGE, B: COLOR_MAGE,
    C: COLOR_WARRIOR, D: COLOR_SUCCESS, E: RANK_VETERANO, F: TEXT_MUTED,
  };

  const { session } = useAuth();
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const [tab, setTab] = useState<"friends" | "pending" | "search">("friends");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchNick, setSearchNick] = useState("");
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const token = session?.access_token ?? "";

  // Helper: build headers for Edge Function requests
  // Authorization: publicAnonKey (gateway), X-User-Token: userJWT (our server)
  const mkHeaders = (ct?: string): Record<string, string> => {
    const h: Record<string, string> = {
      Authorization: `Bearer ${publicAnonKey}`,
      "X-User-Token": token,
    };
    if (ct) h["Content-Type"] = ct;
    return h;
  };

  const fetchFriends = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${SERVER_URL}/friends/list`, {
        headers: mkHeaders(),
      });
      const data = await res.json();
      if (data.friends) setFriends(data.friends);
    } catch (e) {
      console.log("Error fetching friends:", e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchFriends();
    setRefreshing(false);
  }, [fetchFriends]);

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  const acceptedFriends = friends.filter(f => f.status === "accepted");
  const pendingRequests = friends.filter(f => f.status === "pending" && f.isIncoming);
  const sentRequests = friends.filter(f => f.status === "pending" && !f.isIncoming);

  // Search player
  const handleSearch = async () => {
    if (!searchNick.trim()) return;
    setSearching(true);
    setSearchError(null);
    setSearchResult(null);
    try {
      const res = await fetch(`${SERVER_URL}/friends/search/${searchNick.trim()}`, {
        headers: mkHeaders(),
      });
      const data = await res.json();
      if (data.player) {
        setSearchResult(data.player);
      } else {
        setSearchError(data.error || "Player not found");
      }
    } catch {
      setSearchError("Connection error");
    } finally {
      setSearching(false);
    }
  };

  // Send friend request
  const handleSendRequest = async (receiverUid: string) => {
    setActionLoading(receiverUid);
    try {
      const res = await fetch(`${SERVER_URL}/friends/request`, {
        method: "POST",
        headers: mkHeaders("application/json"),
        body: JSON.stringify({ receiverUid }),
      });
      const data = await res.json();
      if (data.success) {
        setSearchResult(null);
        setSearchNick("");
        fetchFriends();
      } else {
        setSearchError(data.error || "Error sending request");
      }
    } catch {
      setSearchError("Connection error");
    } finally {
      setActionLoading(null);
    }
  };

  // Respond to request
  const handleRespond = async (friendshipId: string, response: "accept" | "decline") => {
    setActionLoading(friendshipId);
    try {
      await fetch(`${SERVER_URL}/friends/respond`, {
        method: "PUT",
        headers: mkHeaders("application/json"),
        body: JSON.stringify({ friendshipId, response }),
      });
      fetchFriends();
    } catch (e) {
      console.log("Error responding to request:", e);
    } finally {
      setActionLoading(null);
    }
  };

  // Remove friend
  const removeFriend = async (friendshipId: string) => {
    setActionLoading(friendshipId);
    try {
      await fetch(`${SERVER_URL}/friends/${friendshipId}`, {
        method: "DELETE",
        headers: mkHeaders(),
      });
      fetchFriends();
    } catch (e) {
      console.log("Error removing friend:", e);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <PageShell
        icon={<Users size={16} />}
        title="FRIENDS"
        accentColor={COLOR_WARRIOR}
        badge={
          <RpgButton
            variant="ghost"
            color={refreshing ? TEXT_MUTED : COLOR_WARRIOR}
            disabled={refreshing || loading}
            small
            onClick={handleRefresh}
            title="Refresh list"
          >
            <RefreshCw size={14} style={{ animation: refreshing ? "spin 1s linear infinite" : "none" }} />
          </RpgButton>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { key: "friends" as const, label: "FRIENDS", icon: Users, count: acceptedFriends.length },
              { key: "pending" as const, label: "INVITES", icon: UserPlus, count: pendingRequests.length },
              { key: "search" as const, label: "SEARCH", icon: Search, count: 0 },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  padding: "8px 14px",
                  fontFamily: FONT_PIXEL,
                  fontSize: PX_XS,
                  background: tab === t.key ? alpha(COLOR_WARRIOR, "1f") : "transparent",
                  border: `1px solid ${tab === t.key ? COLOR_WARRIOR : BORDER_ELEVATED}`,
                  color: tab === t.key ? COLOR_WARRIOR : TEXT_MUTED,
                  cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 6,
                  borderRadius: 6, transition: "all 0.15s",
                }}
              >
                <t.icon size={11} /> {t.label}
                {t.count > 0 && (
                  <span style={{ background: COLOR_WARRIOR, color: "#000", borderRadius: RADIUS_XL, padding: "1px 6px", fontSize: 9, fontFamily: FONT_BODY }}>
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ── SEARCH tab ────────────────────────────── */}
          {tab === "search" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ background: BG_CARD, border: `1px solid ${alpha(BORDER_ELEVATED, "cc")}`, borderRadius: RADIUS_XL, padding: "16px 18px" }}>
                <div style={{ fontFamily: FONT_PIXEL, color: COLOR_WARRIOR, fontSize: 9, marginBottom: 12 }}>
                  SEARCH ADVENTURER
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    value={searchNick}
                    onChange={e => setSearchNick(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") handleSearch(); }}
                    placeholder="@nome_do_jogador"
                    style={{ flex: 1, background: BG_DEEPEST, border: `1px solid ${BORDER_ELEVATED}`, color: "#fff", padding: "10px 14px", fontFamily: FONT_BODY, fontSize: 18, outline: "none", borderRadius: 6 }}
                  />
                  <button
                    onClick={handleSearch}
                    disabled={searching || !searchNick.trim()}
                    style={{ background: COLOR_WARRIOR, border: "none", color: "#000", padding: "10px 16px", fontFamily: FONT_PIXEL, fontSize: 9, cursor: "pointer", borderRadius: 6 }}
                  >
                    {searching ? "..." : <Search size={14} />}
                  </button>
                </div>
                {searchError && <div style={{ color: COLOR_DANGER, fontSize: 15, marginTop: 8 }}>{searchError}</div>}
              </div>

              {searchResult && (
                <div style={{ background: BG_CARD, border: `1px solid ${alpha(BORDER_ELEVATED, "cc")}`, borderRadius: RADIUS_XL, overflow: "hidden" }}>
                  <div style={{ background: BG_DEEPEST, borderBottom: `1px solid ${BORDER_SUBTLE}`, padding: "8px 14px" }}>
                    <span style={{ fontFamily: FONT_PIXEL, color: COLOR_WARRIOR, fontSize: PX_XS }}>RESULT</span>
                  </div>
                  <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 48, height: 48, flexShrink: 0, background: BG_DEEPEST, border: `1px solid ${BORDER_SUBTLE}`, borderRadius: RADIUS_LG, overflow: "hidden", position: "relative" }}>
                      <img src={imgAvatarWarrior} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", imageRendering: "pixelated" }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: FONT_PIXEL, color: "#fff", fontSize: 10 }}>@{searchResult.nick}</div>
                      <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                        <span style={{ color: COLOR_LEGENDARY, fontSize: 15 }}>LVL {searchResult.level}</span>
                        <span style={{ color: RANK_COLORS[searchResult.cpRank] ?? TEXT_MUTED, fontSize: 15 }}>{searchResult.cpRank} • {searchResult.combatPower.toLocaleString()} PWR</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSendRequest(searchResult!.id)}
                      disabled={!!actionLoading}
                      style={{ background: COLOR_WARRIOR, border: "none", color: "#000", padding: "8px 14px", fontFamily: FONT_PIXEL, fontSize: PX_XS, cursor: "pointer", borderRadius: 6, display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <UserPlus size={12} /> ADICIONAR
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── PENDING tab ────────────────────────────── */}
          {tab === "pending" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {pendingRequests.length === 0 && (
                <div style={{ background: BG_CARD, border: `1px solid ${alpha(BORDER_ELEVATED, "cc")}`, borderRadius: RADIUS_XL, padding: "32px 20px", textAlign: "center", opacity: 0.5 }}>
                  <UserPlus size={32} color={TEXT_INACTIVE} style={{ margin: "0 auto 10px" }} />
                  <div style={{ fontFamily: FONT_PIXEL, color: TEXT_INACTIVE, fontSize: PX_XS }}>NO INVITES</div>
                </div>
              )}
              {pendingRequests.map(req => (
                <div key={req.friendshipId} style={{ background: BG_CARD, border: `1px solid ${alpha(BORDER_ELEVATED, "cc")}`, borderRadius: RADIUS_XL, overflow: "hidden" }}>
                  <div style={{ background: BG_DEEPEST, borderBottom: `1px solid ${BORDER_SUBTLE}`, padding: "7px 14px" }}>
                    <span style={{ fontFamily: FONT_PIXEL, color: req.isIncoming ? COLOR_LEGENDARY : TEXT_MUTED, fontSize: PX_XS }}>
                      {req.isIncoming ? "📨 RECEIVED" : "📤 SENT"}
                    </span>
                  </div>
                  <div style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 44, height: 44, flexShrink: 0, background: BG_DEEPEST, border: `1px solid ${BORDER_SUBTLE}`, borderRadius: RADIUS_LG, overflow: "hidden", position: "relative" }}>
                      <img src={req.selectedClass === "mago" ? imgAvatarMage : imgAvatarWarrior} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", imageRendering: "pixelated" }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: FONT_PIXEL, color: "#fff", fontSize: 10 }}>@{req.nick}</div>
                      <div style={{ color: TEXT_MUTED, fontSize: 15, marginTop: 3 }}>LVL {req.level}</div>
                    </div>
                    {req.isIncoming && (
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => handleRespond(req.friendshipId, "accept")} disabled={actionLoading === req.friendshipId} style={{ background: COLOR_SUCCESS, border: "none", color: "#000", padding: "7px 12px", fontFamily: FONT_PIXEL, fontSize: PX_XS, cursor: "pointer", borderRadius: 5, display: "flex", alignItems: "center", gap: 4 }}>
                          <Check size={12} /> OK
                        </button>
                        <button onClick={() => handleRespond(req.friendshipId, "decline")} disabled={actionLoading === req.friendshipId} style={{ background: COLOR_DANGER, border: "none", color: "#fff", padding: "7px 12px", fontFamily: FONT_PIXEL, fontSize: PX_XS, cursor: "pointer", borderRadius: 5, display: "flex", alignItems: "center", gap: 4 }}>
                          <X size={12} /> NO
                        </button>
                      </div>
                    )}
                    {!req.isIncoming && (
                      <span style={{ color: COLOR_LEGENDARY, fontSize: 14 }}>Waiting...</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── FRIENDS tab ────────────────────────────── */}
          {tab === "friends" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {loading && <div style={{ color: TEXT_MUTED, fontSize: 18, textAlign: "center", padding: 24 }}>Loading...</div>}
              {!loading && acceptedFriends.length === 0 && (
                <div style={{ background: BG_CARD, border: `1px solid ${alpha(BORDER_ELEVATED, "cc")}`, borderRadius: RADIUS_XL, padding: "32px 20px", textAlign: "center", opacity: 0.5 }}>
                  <Users size={32} color={TEXT_INACTIVE} style={{ margin: "0 auto 10px" }} />
                  <div style={{ fontFamily: FONT_PIXEL, color: TEXT_INACTIVE, fontSize: PX_XS }}>NO FRIENDS YET</div>
                  <div style={{ color: BORDER_ELEVATED, fontSize: 16, marginTop: 8 }}>Use the "Search" tab to find players</div>
                </div>
              )}
              {acceptedFriends.map(f => (
                <div key={f.friendshipId} style={{ background: BG_CARD, border: `1px solid ${alpha(BORDER_ELEVATED, "cc")}`, borderRadius: RADIUS_XL, overflow: "hidden" }}>
                  <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                      onClick={() => navigate(`/amigos/${f.friendUid}`)}
                      style={{ width: 52, height: 52, flexShrink: 0, background: BG_DEEPEST, border: `1px solid ${BORDER_SUBTLE}`, borderRadius: RADIUS_XL, overflow: "hidden", position: "relative", cursor: "pointer" }}
                    >
                      <img src={f.selectedClass === "mago" ? imgAvatarMage : imgAvatarWarrior} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", imageRendering: "pixelated" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        onClick={() => navigate(`/amigos/${f.friendUid}`)}
                        style={{ fontFamily: FONT_PIXEL, color: "#fff", fontSize: 10, cursor: "pointer", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                      >
                        @{f.nick}
                      </div>
                      <div style={{ display: "flex", gap: 10, marginTop: 5, flexWrap: "wrap" }}>
                        <span style={{ color: COLOR_LEGENDARY, fontSize: 15 }}>LVL {f.level}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <Zap size={12} color={RANK_COLORS[f.cpRank] ?? TEXT_MUTED} />
                          <span style={{ color: RANK_COLORS[f.cpRank] ?? TEXT_MUTED, fontSize: 15 }}>{f.combatPower.toLocaleString()}</span>
                          <span style={{ background: alpha(RANK_COLORS[f.cpRank] ?? TEXT_MUTED, "22"), color: RANK_COLORS[f.cpRank] ?? TEXT_MUTED, padding: "1px 5px", fontSize: 11, borderRadius: 3 }}>{f.cpRank}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <button
                        onClick={() => navigate(`/amigos/${f.friendUid}`)}
                        style={{ background: BORDER_SUBTLE, border: `1px solid ${BORDER_ELEVATED}`, color: RANK_VETERANO, padding: "6px 10px", fontFamily: FONT_PIXEL, fontSize: 7, cursor: "pointer", borderRadius: 5 }}
                      >
                        VER
                      </button>
                      <button
                        onClick={() => removeFriend(f.friendshipId)}
                        disabled={actionLoading === f.friendshipId}
                        style={{ background: alpha(COLOR_DANGER, "14"), border: `1px solid ${alpha(COLOR_DANGER, "44")}`, color: COLOR_DANGER, padding: "6px 8px", cursor: "pointer", borderRadius: 5, display: "flex", alignItems: "center" }}
                        title="Remove friend"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PageShell>
    </>
  );
}