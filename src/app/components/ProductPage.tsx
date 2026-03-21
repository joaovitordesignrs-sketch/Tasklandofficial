/**
 * ProductPage — Landing page / product presentation for Taskland.
 * Rendered outside RootLayout for unauthenticated visitors.
 * Uses the design system tokens via useTheme().
 */
import { useState } from "react";
import { useNavigate } from "react-router";
import { PreferencesProvider, useTheme } from "../contexts/PreferencesContext";
import {
  Swords, Brain, Shield, Gem, Sparkles, Flame, Clock, CheckCircle2,
  ChevronRight, Zap, Trophy, Star, Users, Laptop, Smartphone, ArrowRight,
  Heart, TrendingUp, Target, Crown,
} from "lucide-react";

// ── Monster images ───────────────────────────────────────────────────────────
import imgSlime    from "../../assets/monsters/monster_slime.png";
import imgGoblin   from "../../assets/monsters/monster_goblin.png";
import imgCogu     from "../../assets/monsters/monster_cogu.png";
import imgSkeleton from "../../assets/monsters/monster_skeleton.png";
import imgDarkLord from "../../assets/monsters/monster_darklord.png";

// ── Character images ─────────────────────────────────────────────────────────
import imgWarrior from "../../assets/profile_pic/profile_pic_warrior.png";
import imgMage    from "../../assets/profile_pic/profile_pic_mage.png";

// ── Arena background ─────────────────────────────────────────────────────────
import imgArena from "../../assets/arena_background/arena_background_default.png";

// ══════════════════════════════════════════════════════════════════════════════
// CSS
// ══════════════════════════════════════════════════════════════════════════════
const CSS = `
  @keyframes fadeUp { from { opacity:0; transform:translateY(24px) } to { opacity:1; transform:translateY(0) } }
  @keyframes float { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-8px) } }
  @keyframes pulse { 0%,100% { opacity:0.4 } 50% { opacity:0.8 } }
  @keyframes shimmer { 0% { background-position:-200% 0 } 100% { background-position:200% 0 } }
  @keyframes shake { 0%,100%{transform:translate(0)} 25%{transform:translate(-3px,2px)} 75%{transform:translate(3px,-2px)} }

  .pp-fadeUp { animation: fadeUp 0.5s ease both; }
  .pp-d1 { animation-delay: 0.1s; }
  .pp-d2 { animation-delay: 0.2s; }
  .pp-d3 { animation-delay: 0.3s; }
  .pp-d4 { animation-delay: 0.4s; }

  .pp-float { animation: float 3s ease-in-out infinite; }
  .pp-pulse { animation: pulse 2s ease-in-out infinite; }

  .pp-monster-hit { animation: shake 0.3s ease; }

  .pp-btn:hover { transform: translate(-1px,-1px); box-shadow: 5px 5px 0 var(--shadow) !important; }
  .pp-card:hover { border-color: var(--gold) !important; transform: translateY(-2px); }

  .pp-section { padding: 100px 24px; position: relative; }
  .pp-inner { max-width: 1060px; margin: 0 auto; }

  .pp-grid2 { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
  .pp-grid3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:20px; }
  .pp-grid4 { display:grid; grid-template-columns:1fr 1fr 1fr 1fr; gap:16px; }

  @media(max-width:800px) {
    .pp-grid2,.pp-grid3,.pp-grid4 { grid-template-columns:1fr; }
    .pp-hero-layout { flex-direction: column !important; }
    .pp-hero-visual { max-width: 100% !important; }
    .pp-compare-grid { grid-template-columns:1fr !important; }
  }

  html { scroll-behavior: smooth; }
`;

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
function ProductPageInner() {
  const navigate = useNavigate();
  const {
    BG_DEEPEST, BG_CARD, BG_PAGE, BORDER_SUBTLE, BORDER_ELEVATED,
    ACCENT_GOLD, ACCENT_SHADOW, COLOR_DANGER, COLOR_SUCCESS, COLOR_WARNING,
    COLOR_ORANGE, COLOR_MAGE, COLOR_WARRIOR, COLOR_LEGENDARY,
    TEXT_INACTIVE, TEXT_MUTED, TEXT_BODY, TEXT_LIGHT,
    FONT_PIXEL, FONT_BODY,
    PX_XL, PX_MD, PX_SM, PX_XS, PX_2XS, PX_3XS,
    VT_2XL, VT_XL, VT_LG, VT_MD, VT_SM, VT_XS,
    SP_SM, SP_MD, SP_LG, SP_XL,
    RADIUS_SM, RADIUS_MD, RADIUS_LG, RADIUS_XL, RADIUS_PILL,
    alpha,
  } = useTheme();

  const goRegister = () => navigate("/");
  const goLogin    = () => navigate("/");

  // ── Shared styles ────────────────────────────────────────────────────────
  const sLabel: React.CSSProperties  = { fontFamily: FONT_PIXEL, fontSize: PX_2XS, color: COLOR_MAGE, letterSpacing: 3, marginBottom: SP_LG };
  const sTitle: React.CSSProperties  = { fontFamily: FONT_PIXEL, fontSize: PX_XL + 5, color: TEXT_LIGHT, lineHeight: 2.2, marginBottom: 48 };
  const sBody: React.CSSProperties   = { fontFamily: FONT_BODY, fontSize: VT_XL, color: TEXT_BODY, lineHeight: 1.5 };

  const card = (extra?: React.CSSProperties): React.CSSProperties => ({
    background: BG_CARD, border: `1px solid ${BORDER_SUBTLE}`,
    borderRadius: RADIUS_XL, padding: "28px 24px", transition: "all 0.25s",
    ...extra,
  });

  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div style={{ background: BG_DEEPEST, minHeight: "100vh", overflow: "hidden",
      ["--gold" as any]: ACCENT_GOLD, ["--shadow" as any]: ACCENT_SHADOW }}>
      <style>{CSS}</style>

      {/* ── Pixel grid overlay ── */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        backgroundImage: `linear-gradient(${alpha(ACCENT_GOLD, "05")} 1px, transparent 1px), linear-gradient(90deg, ${alpha(ACCENT_GOLD, "05")} 1px, transparent 1px)`,
        backgroundSize: "48px 48px",
      }} />

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* 1. HERO                                                            */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <section className="pp-section" style={{ minHeight: "100vh", display: "flex", alignItems: "center", paddingTop: 60, paddingBottom: 60 }}>
        <div className="pp-inner">
          {/* Top nav */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 64 }} className="pp-fadeUp">
            <span style={{ fontFamily: FONT_PIXEL, fontSize: PX_MD + 2, color: ACCENT_GOLD, textShadow: `2px 2px 0 ${ACCENT_SHADOW}` }}>⚔ TASKLAND</span>
            <div style={{ display: "flex", gap: SP_MD }}>
              <button onClick={goLogin} style={{ fontFamily: FONT_PIXEL, fontSize: PX_3XS, color: TEXT_MUTED, background: "none", border: "none", cursor: "pointer" }}>Entrar</button>
              <button onClick={goRegister} className="pp-btn" style={{ fontFamily: FONT_PIXEL, fontSize: PX_3XS, background: ACCENT_GOLD, color: BG_DEEPEST, border: "none", padding: "10px 20px", cursor: "pointer", boxShadow: `3px 3px 0 ${ACCENT_SHADOW}` }}>
                Começar grátis
              </button>
            </div>
          </div>

          <div className="pp-hero-layout" style={{ display: "flex", gap: 48, alignItems: "center" }}>
            {/* Left: text */}
            <div style={{ flex: 1 }}>
              <div className="pp-fadeUp pp-d1" style={{ fontFamily: FONT_PIXEL, fontSize: PX_2XS, color: COLOR_MAGE, background: alpha(COLOR_MAGE, "14"), border: `1px solid ${alpha(COLOR_MAGE, "33")}`, display: "inline-block", padding: "6px 14px", borderRadius: RADIUS_PILL, marginBottom: 24 }}>
                ⚔ PIXEL RPG EDITION · v1.0
              </div>

              <h1 className="pp-fadeUp pp-d2" style={{ fontFamily: FONT_PIXEL, fontSize: 26, color: TEXT_LIGHT, lineHeight: 2, marginBottom: 20 }}>
                O RPG que transforma sua <span style={{ color: ACCENT_GOLD }}>produtividade</span> em uma aventura.
              </h1>

              <p className="pp-fadeUp pp-d3" style={{ ...sBody, maxWidth: 480, marginBottom: 36 }}>
                Complete tarefas, derrote monstros, equipe itens e evolua seu herói — enquanto avança nos seus objetivos reais.
              </p>

              <div className="pp-fadeUp pp-d4" style={{ display: "flex", gap: SP_LG, flexWrap: "wrap" }}>
                <button onClick={goRegister} className="pp-btn" style={{
                  fontFamily: FONT_PIXEL, fontSize: PX_SM, background: ACCENT_GOLD, color: BG_DEEPEST,
                  border: "none", padding: "16px 32px", cursor: "pointer",
                  boxShadow: `4px 4px 0 ${ACCENT_SHADOW}`, display: "flex", alignItems: "center", gap: 10,
                }}>
                  ▶ Começar grátis
                </button>
                <a href="#como" style={{
                  fontFamily: FONT_PIXEL, fontSize: PX_SM, color: TEXT_LIGHT,
                  border: `2px solid ${BORDER_ELEVATED}`, padding: "14px 28px",
                  textDecoration: "none", display: "flex", alignItems: "center", gap: 8,
                  transition: "all 0.2s",
                }}>
                  ↓ Ver como funciona
                </a>
              </div>
            </div>

            {/* Right: arena mock */}
            <div className="pp-hero-visual pp-fadeUp pp-d3" style={{ flex: 1, maxWidth: 480, position: "relative" }}>
              <div style={{
                position: "relative", borderRadius: RADIUS_XL, overflow: "hidden",
                border: `2px solid ${alpha(ACCENT_GOLD, "33")}`,
                boxShadow: `0 0 60px ${alpha(ACCENT_GOLD, "14")}`,
              }}>
                <img src={imgArena} alt="" style={{ width: "100%", display: "block", filter: "brightness(0.7)" }} />

                {/* Monster overlay */}
                <div style={{ position: "absolute", bottom: "10%", right: "15%", animation: "float 3s ease-in-out infinite" }}>
                  <img src={imgDarkLord} alt="Boss" style={{ height: 140, imageRendering: "pixelated" as any, filter: "drop-shadow(0 4px 20px rgba(0,0,0,0.6))" }} />
                </div>

                {/* HP bar */}
                <div style={{ position: "absolute", top: 16, left: 16, right: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontFamily: FONT_PIXEL, fontSize: PX_3XS, color: COLOR_DANGER }}>♛ DARK LORD</span>
                    <span style={{ fontFamily: FONT_BODY, fontSize: VT_SM, color: TEXT_LIGHT }}>340/500 HP</span>
                  </div>
                  <div style={{ height: 8, background: alpha(COLOR_DANGER, "33"), borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ width: "68%", height: "100%", background: COLOR_DANGER, borderRadius: 4 }} />
                  </div>
                </div>

                {/* CP badge */}
                <div style={{ position: "absolute", bottom: 16, left: 16, background: alpha(BG_DEEPEST, "dd"), border: `1px solid ${BORDER_SUBTLE}`, borderRadius: RADIUS_LG, padding: "8px 14px" }}>
                  <div style={{ fontFamily: FONT_PIXEL, fontSize: PX_3XS, color: TEXT_MUTED, marginBottom: 2 }}>COMBAT POWER</div>
                  <div style={{ fontFamily: FONT_PIXEL, fontSize: PX_MD + 2, color: COLOR_LEGENDARY, textShadow: `0 0 10px ${alpha(COLOR_LEGENDARY, "44")}` }}>342</div>
                </div>

                {/* Item slots */}
                <div style={{ position: "absolute", bottom: 16, right: 16, display: "flex", gap: 6 }}>
                  {[
                    { icon: <Swords size={14} />, color: ACCENT_GOLD },
                    { icon: <Shield size={14} />, color: COLOR_WARRIOR },
                    { icon: <Gem size={14} />, color: COLOR_MAGE },
                    { icon: <Sparkles size={14} />, color: COLOR_ORANGE },
                  ].map((s, i) => (
                    <div key={i} style={{ width: 32, height: 32, background: alpha(BG_DEEPEST, "cc"), border: `1px solid ${alpha(s.color, "55")}`, borderRadius: RADIUS_SM, display: "flex", alignItems: "center", justifyContent: "center", color: s.color }}>
                      {s.icon}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* 2. COMO FUNCIONA                                                   */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <section id="como" className="pp-section" style={{ background: BG_CARD, borderTop: `1px solid ${BORDER_SUBTLE}`, borderBottom: `1px solid ${BORDER_SUBTLE}` }}>
        <div className="pp-inner">
          <div style={sLabel}>// COMO FUNCIONA</div>
          <div style={sTitle}>TRÊS PASSOS SIMPLES</div>

          <div className="pp-grid3">
            {[
              {
                num: "01", icon: <Target size={24} />, color: COLOR_SUCCESS,
                title: "CRIE SUAS MISSÕES",
                text: "Transforme tarefas e hábitos em missões dentro do jogo. Trabalho, estudo, saúde — tudo vira munição.",
              },
              {
                num: "02", icon: <Swords size={24} />, color: COLOR_DANGER,
                title: "COMPLETE E DERROTE",
                text: "Ao concluir tarefas, você causa dano em monstros e recebe ouro + essências. Chain combos para dano crítico!",
              },
              {
                num: "03", icon: <Gem size={24} />, color: COLOR_MAGE,
                title: "EQUIPE E EVOLUA",
                text: "Use ouro para comprar itens e essências para evoluí-los de Aprendiz até Ascendente. Fique mais forte a cada dia.",
              },
            ].map((step, i) => (
              <div key={i} className="pp-card" style={{
                ...card({ borderTop: `2px solid ${step.color}` }),
                position: "relative", overflow: "hidden",
              }}>
                <div style={{ position: "absolute", top: -8, right: 12, fontFamily: FONT_PIXEL, fontSize: 52, color: alpha(step.color, "08"), pointerEvents: "none" }}>{step.num}</div>
                <div style={{ width: 44, height: 44, background: alpha(step.color, "14"), border: `1px solid ${alpha(step.color, "33")}`, borderRadius: RADIUS_LG, display: "flex", alignItems: "center", justifyContent: "center", color: step.color, marginBottom: SP_LG }}>
                  {step.icon}
                </div>
                <h3 style={{ fontFamily: FONT_PIXEL, fontSize: PX_XS, color: TEXT_LIGHT, marginBottom: SP_SM }}>{step.title}</h3>
                <p style={{ fontFamily: FONT_BODY, fontSize: VT_LG, color: TEXT_BODY, lineHeight: 1.4 }}>{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* 3. COMBAT POWER                                                    */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <section className="pp-section">
        <div className="pp-inner">
          <div style={sLabel}>// SISTEMA DE PODER</div>
          <div style={sTitle}>SEU PODER CRESCE COM<br/>A SUA DISCIPLINA</div>

          <div style={{ display: "flex", gap: 32, flexWrap: "wrap", alignItems: "flex-start" }}>
            {/* Left: explanation */}
            <div style={{ flex: 1, minWidth: 300 }}>
              <p style={{ ...sBody, marginBottom: 32 }}>
                O Combat Power do seu personagem é calculado a partir de quatro pilares — cada um conectado ao que você faz na vida real.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: SP_MD }}>
                {[
                  { label: "HÁBITOS (MH)", desc: "Hábitos que você mantém diariamente", color: COLOR_SUCCESS, icon: <Flame size={16} /> },
                  { label: "NÍVEL (MN)", desc: "Sobe conforme você cumpre tarefas", color: COLOR_WARRIOR, icon: <TrendingUp size={16} /> },
                  { label: "CLASSE (MC)", desc: "Guerreiro, Mago — cada um com bônus único", color: COLOR_DANGER, icon: <Crown size={16} /> },
                  { label: "ITENS (MR)", desc: "Comprados com ouro, evoluídos com essências", color: COLOR_MAGE, icon: <Gem size={16} /> },
                ].map((p, i) => (
                  <div key={i} style={{ display: "flex", gap: SP_MD, alignItems: "center" }}>
                    <div style={{ width: 36, height: 36, flexShrink: 0, background: alpha(p.color, "14"), border: `1px solid ${alpha(p.color, "33")}`, borderRadius: RADIUS_LG, display: "flex", alignItems: "center", justifyContent: "center", color: p.color }}>{p.icon}</div>
                    <div>
                      <div style={{ fontFamily: FONT_PIXEL, fontSize: PX_2XS, color: p.color, marginBottom: 2 }}>{p.label}</div>
                      <div style={{ fontFamily: FONT_BODY, fontSize: VT_MD, color: TEXT_BODY }}>{p.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: CP card mock */}
            <div style={{ flex: 1, minWidth: 300 }}>
              <div style={{
                ...card({ borderTop: `2px solid ${COLOR_LEGENDARY}` }),
                background: BG_PAGE,
              }}>
                <div style={{ fontFamily: FONT_PIXEL, fontSize: PX_2XS, color: TEXT_MUTED, marginBottom: SP_SM }}>COMBAT POWER</div>
                <div style={{ fontFamily: FONT_PIXEL, fontSize: 36, color: COLOR_LEGENDARY, textShadow: `0 0 20px ${alpha(COLOR_LEGENDARY, "44")}`, marginBottom: 24 }}>342</div>

                {[
                  { label: "Hábitos (MH)", val: "×1.20", color: COLOR_SUCCESS },
                  { label: "Nível (MN)", val: "×1.15", color: COLOR_WARRIOR },
                  { label: "Classe (MC)", val: "×1.10", color: COLOR_DANGER },
                  { label: "Itens equipados", val: "+0.12", color: COLOR_MAGE },
                ].map((r, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < 3 ? `1px solid ${BORDER_SUBTLE}` : "none" }}>
                    <span style={{ fontFamily: FONT_BODY, fontSize: VT_MD, color: TEXT_BODY }}>{r.label}</span>
                    <span style={{ fontFamily: FONT_PIXEL, fontSize: PX_XS, color: r.color }}>{r.val}</span>
                  </div>
                ))}
              </div>

              <div style={{ fontFamily: FONT_PIXEL, fontSize: PX_3XS, color: ACCENT_GOLD, textAlign: "center", marginTop: SP_LG, lineHeight: 2 }}>
                QUANTO MAIS CONSISTENTE VOCÊ É,<br/>MAIS FORTE SEU PERSONAGEM SE TORNA.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* 4. ITENS, OURO E ESSÊNCIAS                                         */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <section className="pp-section" style={{ background: BG_CARD, borderTop: `1px solid ${BORDER_SUBTLE}`, borderBottom: `1px solid ${BORDER_SUBTLE}` }}>
        <div className="pp-inner">
          <div style={sLabel}>// ITENS, OURO E ESSÊNCIAS</div>
          <div style={sTitle}>CONSTRUA SUA BUILD COM<br/>ITENS EVOLUTIVOS</div>

          <p style={{ ...sBody, maxWidth: 640, marginBottom: 48 }}>
            Derrote monstros para ganhar ouro e essências. Use o ouro para comprar itens na loja e as essências para evoluir esses itens de Tier 1 (Aprendiz) até Tier 4 (Ascendente).
          </p>

          <div className="pp-grid4">
            {[
              { icon: <Swords size={20} />, name: "Espada do Foco", desc: "Aumenta o multiplicador da sua classe.", color: ACCENT_GOLD, slot: "ARMA" },
              { icon: <Shield size={20} />, name: "Armadura da Disciplina", desc: "Aumenta o impacto dos seus hábitos diários.", color: COLOR_WARRIOR, slot: "ARMADURA" },
              { icon: <Gem size={20} />, name: "Amuleto do Nível", desc: "Deixa cada nível conquistado mais poderoso.", color: COLOR_MAGE, slot: "ACESSÓRIO" },
              { icon: <Sparkles size={20} />, name: "Relíquia do Campeão", desc: "Bônus permanente de poder de combate.", color: COLOR_ORANGE, slot: "RELÍQUIA" },
            ].map((item, i) => (
              <div key={i} className="pp-card" style={{
                ...card({ borderTop: `2px solid ${item.color}` }),
                textAlign: "center",
              }}>
                <div style={{ width: 44, height: 44, margin: "0 auto 12px", background: alpha(item.color, "14"), border: `1px solid ${alpha(item.color, "33")}`, borderRadius: RADIUS_LG, display: "flex", alignItems: "center", justifyContent: "center", color: item.color }}>
                  {item.icon}
                </div>
                <div style={{ fontFamily: FONT_PIXEL, fontSize: PX_3XS, color: item.color, marginBottom: 4 }}>{item.slot}</div>
                <h4 style={{ fontFamily: FONT_PIXEL, fontSize: PX_2XS, color: TEXT_LIGHT, marginBottom: SP_SM }}>{item.name}</h4>
                <p style={{ fontFamily: FONT_BODY, fontSize: VT_MD, color: TEXT_BODY }}>{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Tier timeline */}
          <div style={{ marginTop: 56 }}>
            <div style={{ fontFamily: FONT_PIXEL, fontSize: PX_2XS, color: TEXT_MUTED, textAlign: "center", marginBottom: SP_XL }}>EVOLUÇÃO DE ITEM</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, flexWrap: "wrap" }}>
              {[
                { tier: "TIER 1", name: "Aprendiz", color: TEXT_BODY },
                { tier: "TIER 2", name: "Herói", color: COLOR_SUCCESS },
                { tier: "TIER 3", name: "Lenda", color: COLOR_LEGENDARY },
                { tier: "TIER 4", name: "Ascendente", color: COLOR_MAGE },
              ].map((t, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ textAlign: "center", padding: "0 16px" }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: alpha(t.color, "22"), border: `2px solid ${t.color}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>
                      <Star size={14} color={t.color} />
                    </div>
                    <div style={{ fontFamily: FONT_PIXEL, fontSize: PX_3XS, color: t.color }}>{t.tier}</div>
                    <div style={{ fontFamily: FONT_BODY, fontSize: VT_SM, color: TEXT_MUTED }}>{t.name}</div>
                  </div>
                  {i < 3 && <ChevronRight size={16} color={BORDER_ELEVATED} />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* 5. EVOLUÇÃO DO PERSONAGEM                                          */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <section className="pp-section">
        <div className="pp-inner">
          <div style={sLabel}>// EVOLUÇÃO DO PERSONAGEM</div>
          <div style={sTitle}>VEJA SEU HERÓI EVOLUIR<br/>COM SEUS RESULTADOS</div>

          <div className="pp-grid4">
            {[
              { name: "APRENDIZ", desc: "Você está começando sua jornada.", color: TEXT_BODY, bg: alpha(TEXT_BODY, "08") },
              { name: "HERÓI", desc: "Você mantém sua rotina e derrota monstros regularmente.", color: COLOR_SUCCESS, bg: alpha(COLOR_SUCCESS, "08") },
              { name: "LENDA", desc: "Seu Combat Power mostra que sua consistência é rara.", color: COLOR_LEGENDARY, bg: alpha(COLOR_LEGENDARY, "08") },
              { name: "ASCENDENTE", desc: "Sua build, itens e rotina são de endgame.", color: COLOR_MAGE, bg: alpha(COLOR_MAGE, "08") },
            ].map((stage, i) => (
              <div key={i} className="pp-card" style={{
                ...card({ borderTop: `3px solid ${stage.color}`, background: stage.bg }),
                textAlign: "center",
              }}>
                <div style={{ width: 56, height: 56, margin: "0 auto 16px", borderRadius: "50%", background: alpha(stage.color, "18"), border: `2px solid ${alpha(stage.color, "44")}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontFamily: FONT_PIXEL, fontSize: PX_MD, color: stage.color }}>{i + 1}</span>
                </div>
                <h3 style={{ fontFamily: FONT_PIXEL, fontSize: PX_XS, color: stage.color, marginBottom: SP_SM }}>{stage.name}</h3>
                <p style={{ fontFamily: FONT_BODY, fontSize: VT_MD, color: TEXT_BODY, lineHeight: 1.4 }}>{stage.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* 6. PARA QUEM É                                                     */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <section className="pp-section" style={{ background: BG_CARD, borderTop: `1px solid ${BORDER_SUBTLE}`, borderBottom: `1px solid ${BORDER_SUBTLE}` }}>
        <div className="pp-inner">
          <div style={sLabel}>// PARA QUEM É</div>
          <div style={sTitle}>FEITO PARA QUEM AMA RPG,<br/>MAS PRECISA VENCER A VIDA REAL</div>

          <div className="pp-grid3">
            {[
              { icon: <Swords size={24} />, title: "GAMERS E FÃS DE RPG", desc: "Querem sentir que estão upando um personagem enquanto trabalham, estudam e cuidam da vida.", color: COLOR_DANGER },
              { icon: <Brain size={24} />, title: "FREELANCERS E CRIATIVOS", desc: "Precisam transformar tarefas chatas em algo mais recompensador e envolvente.", color: COLOR_MAGE },
              { icon: <Trophy size={24} />, title: "ESTUDANTES E CONCURSEIROS", desc: "Se motivam mais vendo XP, dano, itens e progressão visual do que checklists simples.", color: COLOR_LEGENDARY },
            ].map((p, i) => (
              <div key={i} className="pp-card" style={card({ borderTop: `2px solid ${p.color}` })}>
                <div style={{ width: 44, height: 44, background: alpha(p.color, "14"), border: `1px solid ${alpha(p.color, "33")}`, borderRadius: RADIUS_LG, display: "flex", alignItems: "center", justifyContent: "center", color: p.color, marginBottom: SP_LG }}>
                  {p.icon}
                </div>
                <h3 style={{ fontFamily: FONT_PIXEL, fontSize: PX_XS, color: TEXT_LIGHT, marginBottom: SP_SM }}>{p.title}</h3>
                <p style={{ fontFamily: FONT_BODY, fontSize: VT_LG, color: TEXT_BODY, lineHeight: 1.4 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* 7. COMPARAÇÃO                                                      */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <section className="pp-section">
        <div className="pp-inner">
          <div style={sLabel}>// COMPARAÇÃO</div>
          <div style={sTitle}>POR QUE TASKLAND É DIFERENTE?</div>

          <div className="pp-compare-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {/* Traditional */}
            <div style={{ ...card({ borderTop: `2px solid ${TEXT_MUTED}` }), opacity: 0.7 }}>
              <h3 style={{ fontFamily: FONT_PIXEL, fontSize: PX_SM, color: TEXT_MUTED, marginBottom: 20 }}>APPS TRADICIONAIS</h3>
              {[
                { text: "Checklists", has: true },
                { text: "Lembretes", has: true },
                { text: "Combate, itens, loot", has: false },
                { text: "Sensação de build e progressão", has: false },
                { text: "Sistema de tiers evolutivos", has: false },
              ].map((r, i) => (
                <div key={i} style={{ display: "flex", gap: SP_SM, alignItems: "center", padding: "6px 0", fontFamily: FONT_BODY, fontSize: VT_LG, color: r.has ? TEXT_BODY : TEXT_INACTIVE }}>
                  <span style={{ fontFamily: FONT_PIXEL, fontSize: PX_3XS, color: r.has ? COLOR_SUCCESS : COLOR_DANGER }}>{r.has ? "✓" : "✗"}</span>
                  {r.text}
                </div>
              ))}
            </div>

            {/* Taskland */}
            <div style={{ ...card({ borderTop: `2px solid ${ACCENT_GOLD}`, boxShadow: `0 0 30px ${alpha(ACCENT_GOLD, "0a")}` }) }}>
              <h3 style={{ fontFamily: FONT_PIXEL, fontSize: PX_SM, color: ACCENT_GOLD, marginBottom: 20 }}>⚔ TASKLAND</h3>
              {[
                "Tarefas, hábitos e objetivos",
                "Monstros, arena e combate",
                "Itens que aumentam seu poder",
                "Sistema de tiers para itens e personagem",
                "Tudo conectado ao que você faz na vida real",
              ].map((text, i) => (
                <div key={i} style={{ display: "flex", gap: SP_SM, alignItems: "center", padding: "6px 0", fontFamily: FONT_BODY, fontSize: VT_LG, color: TEXT_LIGHT }}>
                  <span style={{ fontFamily: FONT_PIXEL, fontSize: PX_3XS, color: COLOR_SUCCESS }}>✓</span>
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* 8. FAQ                                                             */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <section className="pp-section" style={{ background: BG_CARD, borderTop: `1px solid ${BORDER_SUBTLE}`, borderBottom: `1px solid ${BORDER_SUBTLE}` }}>
        <div className="pp-inner" style={{ maxWidth: 700 }}>
          <div style={sLabel}>// FAQ</div>
          <div style={sTitle}>PERGUNTAS FREQUENTES</div>

          {[
            { q: "O Taskland é só um jogo ou também é um app de produtividade?", a: "É os dois — você organiza sua vida com tarefas e hábitos, e isso alimenta o RPG. Cada tarefa concluída é um ataque real contra o monstro." },
            { q: "Preciso entender muito de RPG para usar?", a: "Não. Se você gosta de ver números subindo, já é o bastante. O tutorial explica o básico de monstros, itens e Combat Power." },
            { q: "Os itens são só cosméticos?", a: "Não. Eles aumentam seus multiplicadores de poder e te ajudam a derrotar monstros mais difíceis. Cada item pode ser evoluído até Tier 4." },
            { q: "Taskland é gratuito?", a: "Sim, você pode jogar e evoluir seus itens com o ouro e essências que ganha no próprio jogo." },
            { q: "Funciona no celular?", a: "Sim, Taskland roda no navegador, tanto no desktop quanto no mobile. Seu progresso sincroniza entre dispositivos." },
          ].map((faq, i) => (
            <FaqItem key={i} q={faq.q} a={faq.a} />
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* 9. CTA FINAL                                                       */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <section className="pp-section" style={{ textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", width: 600, height: 600, background: `radial-gradient(circle, ${alpha(ACCENT_GOLD, "06")} 0%, transparent 70%)`, top: "50%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none" }} />

        <div style={{ position: "relative" }}>
          <h2 style={{ fontFamily: FONT_PIXEL, fontSize: PX_XL + 4, color: ACCENT_GOLD, textShadow: `2px 2px 0 ${ACCENT_SHADOW}`, marginBottom: SP_LG }}>
            PRONTO PARA TRANSFORMAR<br/>SUAS TAREFAS EM AVENTURA?
          </h2>
          <p style={{ fontFamily: FONT_BODY, fontSize: VT_XL, color: TEXT_BODY, maxWidth: 500, margin: "0 auto 36px", lineHeight: 1.5 }}>
            Crie sua conta, escolha sua classe, equipe seus primeiros itens e comece a derrotar monstros hoje mesmo.
          </p>

          <div style={{ display: "flex", gap: SP_LG, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={goRegister} className="pp-btn" style={{
              fontFamily: FONT_PIXEL, fontSize: PX_SM, background: ACCENT_GOLD, color: BG_DEEPEST,
              border: "none", padding: "16px 36px", cursor: "pointer",
              boxShadow: `4px 4px 0 ${ACCENT_SHADOW}`, display: "flex", alignItems: "center", gap: 10,
            }}>
              ▶ Criar conta grátis
            </button>
            <button onClick={goLogin} style={{
              fontFamily: FONT_PIXEL, fontSize: PX_SM, color: TEXT_MUTED,
              background: "none", border: `2px solid ${BORDER_ELEVATED}`, padding: "14px 28px", cursor: "pointer",
              transition: "all 0.2s",
            }}>
              Já tenho conta — Entrar
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: `1px solid ${BORDER_SUBTLE}`, padding: "32px 24px", textAlign: "center", position: "relative", zIndex: 1 }}>
        <div style={{ fontFamily: FONT_PIXEL, fontSize: PX_SM, color: ACCENT_GOLD, marginBottom: SP_SM }}>⚔ TASKLAND</div>
        <div style={{ fontFamily: FONT_BODY, fontSize: VT_SM, color: TEXT_MUTED }}>© 2026 Taskland · Pixel RPG Edition v1.0</div>
      </footer>
    </div>
  );
}

// ── FAQ Accordion Item ───────────────────────────────────────────────────────
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  const {
    BG_PAGE, BORDER_SUBTLE, ACCENT_GOLD, TEXT_LIGHT, TEXT_BODY,
    FONT_PIXEL, FONT_BODY, PX_XS, VT_LG, RADIUS_LG, SP_SM, alpha,
  } = useTheme();

  return (
    <div style={{
      background: BG_PAGE, border: `1px solid ${open ? alpha(ACCENT_GOLD, "44") : BORDER_SUBTLE}`,
      borderRadius: RADIUS_LG, marginBottom: SP_SM, overflow: "hidden",
      transition: "border-color 0.2s", cursor: "pointer",
    }} onClick={() => setOpen(!open)}>
      <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: FONT_PIXEL, fontSize: PX_XS, color: open ? ACCENT_GOLD : TEXT_LIGHT, transition: "color 0.2s", flex: 1, lineHeight: 1.8 }}>{q}</span>
        <ChevronRight size={16} color={open ? ACCENT_GOLD : TEXT_BODY} style={{ transform: open ? "rotate(90deg)" : "none", transition: "transform 0.2s", flexShrink: 0, marginLeft: 12 }} />
      </div>
      {open && (
        <div style={{ padding: "0 20px 16px", fontFamily: FONT_BODY, fontSize: VT_LG, color: TEXT_BODY, lineHeight: 1.5 }}>
          {a}
        </div>
      )}
    </div>
  );
}

// ── Exported with PreferencesProvider for standalone use ──────────────────────
export default function ProductPage() {
  return (
    <PreferencesProvider>
      <ProductPageInner />
    </PreferencesProvider>
  );
}
