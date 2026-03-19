// ── Auth Screen (Login / Signup) ──────────────────────────────────────────────
// Pixel-art RPG styled login and signup screen matching the game's aesthetic.

import { useState, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import TasklandLogotipo from "../../imports/TasklandLogotipo";
import { projectId, publicAnonKey } from "/utils/supabase/info";

type AuthMode = "login" | "signup";

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-8f0246f6`;

export default function AuthScreen() {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nick, setNick] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nickAvailable, setNickAvailable] = useState<boolean | null>(null);
  const [nickChecking, setNickChecking] = useState(false);

  // Check nick availability
  const checkNick = useCallback(async (value: string) => {
    if (value.length < 3) {
      setNickAvailable(null);
      return;
    }
    setNickChecking(true);
    try {
      const res = await fetch(`${SERVER_URL}/auth/check-nick/${value.toLowerCase()}`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` },
      });
      const data = await res.json();
      setNickAvailable(data.available ?? false);
    } catch {
      setNickAvailable(null);
    } finally {
      setNickChecking(false);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        if (password !== confirmPassword) {
          setError("Passwords do not match");
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError("Password must be at least 6 characters");
          setLoading(false);
          return;
        }
        if (!nick || nick.length < 3) {
          setError("Nick must be at least 3 characters");
          setLoading(false);
          return;
        }
        const result = await signUp(email, password, nick);
        if (result.error) setError(result.error);
      } else {
        const result = await signIn(email, password);
        if (result.error) setError(result.error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    const result = await signInWithGoogle();
    if (result.error) setError(result.error);
  };

  return (
    <>
      <style>{`
        @keyframes authFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes starTwinkle {
          0%,100% { opacity: 0.12; }
          50%     { opacity: 0.55; }
        }
        @keyframes pulseGlow {
          0%,100% { box-shadow: 0 0 8px rgba(240,192,64,0.3); }
          50%     { box-shadow: 0 0 20px rgba(240,192,64,0.6); }
        }
      `}</style>

      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "#080c1a",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'VT323', monospace",
          overflow: "auto",
          padding: "20px",
        }}
      >
        {/* Stars background */}
        {Array.from({ length: 25 }, (_, i) => (
          <div
            key={i}
            style={{
              position: "fixed",
              left: `${(i * 137.5 + 11) % 100}%`,
              top: `${(i * 97.3 + 31) % 100}%`,
              width: (i % 3) === 0 ? 2 : 1,
              height: (i % 3) === 0 ? 2 : 1,
              background: "#e39f64",
              pointerEvents: "none",
              animation: `starTwinkle ${1.8 + (i % 7) * 0.3}s ease-in-out ${(i % 9) * 0.2}s infinite`,
            }}
          />
        ))}

        {/* Logo */}
        <div
          style={{
            width: "min(380px, 75vw)",
            aspectRatio: "725 / 378",
            marginBottom: 20,
            animation: "authFadeIn 0.6s ease-out",
          }}
        >
          <TasklandLogotipo />
        </div>

        {/* Auth Card */}
        <div
          style={{
            width: "min(420px, 90vw)",
            background: "#0d1024",
            border: "1px solid rgba(42,46,80,0.8)",
            borderRadius: 12,
            boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03) inset",
            animation: "authFadeIn 0.6s ease-out 0.1s both",
          }}
        >
          {/* Tab Header */}
          <div style={{ display: "flex", borderBottom: "1px solid #2a2e50" }}>
            {(["login", "signup"] as AuthMode[]).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(null); }}
                style={{
                  flex: 1,
                  padding: "12px 0",
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: 10,
                  color: mode === m ? "#f0c040" : "#5a6080",
                  background: mode === m ? "#0b0d1e" : "#0d1024",
                  border: "none",
                  cursor: "pointer",
                  borderBottom: mode === m ? "2px solid #f0c040" : "2px solid transparent",
                  transition: "all 0.2s",
                }}
              >
                {m === "login" ? "LOGIN" : "REGISTER"}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ padding: 20 }}>
            {/* Nick (signup only) */}
            {mode === "signup" && (
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>ADVENTURER NICK</label>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    value={nick}
                    onChange={e => {
                      const v = e.target.value;
                      setNick(v);
                      if (v.length >= 3) checkNick(v);
                      else setNickAvailable(null);
                    }}
                    placeholder="ex: DragonSlayer99"
                    maxLength={20}
                    style={inputStyle}
                    required
                  />
                  {nick.length >= 3 && (
                    <span
                      style={{
                        position: "absolute",
                        right: 10,
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontFamily: "'Press Start 2P', monospace",
                        fontSize: 8,
                        color: nickChecking ? "#5a6080" : nickAvailable ? "#06FFA5" : "#E63946",
                      }}
                    >
                      {nickChecking ? "..." : nickAvailable ? "OK" : "IN USE"}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>EMAIL</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="adventurer@email.com"
                style={inputStyle}
                required
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>PASSWORD</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="min 6 characters"
                style={inputStyle}
                required
                minLength={6}
              />
            </div>

            {/* Confirm Password (signup) */}
            {mode === "signup" && (
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>CONFIRM PASSWORD</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="repeat password"
                  style={inputStyle}
                  required
                  minLength={6}
                />
              </div>
            )}

            {/* Error */}
            {error && (
              <div
                style={{
                  padding: "8px 12px",
                  background: "rgba(230,57,70,0.15)",
                  border: "1px solid #E63946",
                  color: "#E63946",
                  fontFamily: "'VT323', monospace",
                  fontSize: 16,
                  marginBottom: 16,
                  textAlign: "center",
                }}
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || (mode === "signup" && nickAvailable === false)}
              style={{
                width: "100%",
                padding: "14px 0",
                fontFamily: "'Press Start 2P', monospace",
                fontSize: 11,
                color: "#0d1024",
                background: loading ? "#5a6080" : "#f0c040",
                border: "none",
                borderRadius: 8,
                boxShadow: "none",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.15s",
                animation: !loading ? "pulseGlow 2s ease-in-out infinite" : "none",
              }}
            >
              {loading
                ? "LOADING..."
                : mode === "login"
                  ? "START ADVENTURE"
                  : "CREATE ACCOUNT"
              }
            </button>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "18px 0" }}>
              <div style={{ flex: 1, height: 1, background: "#2a2e50" }} />
              <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: "#5a6080" }}>
                OU
              </span>
              <div style={{ flex: 1, height: 1, background: "#2a2e50" }} />
            </div>

            {/* Google OAuth */}
            <button
              type="button"
              onClick={handleGoogle}
              style={{
                width: "100%",
                padding: "12px 0",
                fontFamily: "'Press Start 2P', monospace",
                fontSize: 9,
                color: "#d0d4e8",
                background: "#1a1d35",
                border: "2px solid #2a2e50",
                boxShadow: "3px 3px 0 #000",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                transition: "all 0.15s",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              SIGN IN WITH GOOGLE
            </button>
          </form>
        </div>

        {/* Version */}
        <div
          style={{
            marginTop: 20,
            fontFamily: "'VT323', monospace",
            color: "#232840",
            fontSize: 15,
          }}
        >
          v1.0 - PIXEL RPG EDITION
        </div>
      </div>
    </>
  );
}

// ── Shared Styles ────────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "'Press Start 2P', monospace",
  fontSize: 8,
  color: "#5a6080",
  marginBottom: 6,
  letterSpacing: "0.1em",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  fontFamily: "'VT323', monospace",
  fontSize: 18,
  color: "#d0d4e8",
  background: "#0b0d1e",
  border: "2px solid #2a2e50",
  outline: "none",
  boxSizing: "border-box",
};