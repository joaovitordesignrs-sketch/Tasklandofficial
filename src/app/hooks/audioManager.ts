/**
 * audioManager – Singleton that manages background music (game BGM style,
 * shuffle-only, no music-player controls) and all SFX.
 * Audio settings persisted in localStorage.
 *
 * SFX design (per spec):
 *  playBasicAttack()    – whoosh + hit + pling,  ~250ms  (task completed)
 *  playCriticalAttack() – fuller attack + shimmer, ~420ms  (combo ≥2 or hard task)
 *  playVictory()        – crystal break + ascending jingle  (monster killed)
 *  playLevelUp()        – short riser + soft chord  (level / CP / Rebirth)
 *  playClick()          – UI beep
 *  playTick()           – timer tick
 *  playPreviewBeep()    – SFX slider preview
 */

const STORAGE_KEY = "rpg_audio_settings";

const PLAYLIST = [
  "https://raw.githubusercontent.com/joaovitordesignrs-sketch/taskland/main/songtheme_1.mp3",
  "https://raw.githubusercontent.com/joaovitordesignrs-sketch/taskland/main/songtheme_2.mp3",
  "https://raw.githubusercontent.com/joaovitordesignrs-sketch/taskland/main/songtheme_3.mp3",
  "https://raw.githubusercontent.com/joaovitordesignrs-sketch/taskland/main/songtheme_4.mp3",
];

const TRACK_NAMES = ["Theme I", "Theme II", "Theme III", "Theme IV"];

export interface AudioSettings {
  musicOn: boolean;
  musicVolume: number;  // 0–1
  sfxOn: boolean;
  sfxVolume: number;    // 0–1
  currentTrack: number; // index into PLAYLIST (display only)
}

const DEFAULTS: AudioSettings = {
  musicOn: true,
  musicVolume: 0.05,
  sfxOn: true,
  sfxVolume: 0.55,
  currentTrack: 0,
};

const MIN_GAIN = 0.0001;

// ── Persistence ───────────────────────────────────────────────────────────────
function loadSettings(): AudioSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULTS };
  }
}

function saveSettings(s: AudioSettings) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch { /* noop */ }
}

// ── Fisher-Yates shuffle ──────────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Noise buffer helper ───────────────────────────────────────────────────────
function makeNoise(ctx: AudioContext, durationSec: number): AudioBuffer {
  const len = Math.max(1, Math.floor(ctx.sampleRate * durationSec));
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

// ── Singleton ─────────────────────────────────────────────────────────────────
type Listener = (s: AudioSettings) => void;

class AudioManager {
  private settings: AudioSettings;
  private audio: HTMLAudioElement | null = null;
  private listeners: Set<Listener> = new Set();
  private started = false;
  private pendingPlay = false;
  private audioCtx: AudioContext | null = null;

  private shuffleQueue: number[] = [];
  private shuffleIdx = 0;

  constructor() {
    this.settings = loadSettings();
    this.buildShuffleQueue(this.settings.currentTrack);
  }

  private buildShuffleQueue(avoidFirst?: number) {
    const q = shuffle(PLAYLIST.map((_, i) => i));
    if (avoidFirst !== undefined && q[0] === avoidFirst && q.length > 1) {
      const swap = 1 + Math.floor(Math.random() * (q.length - 1));
      [q[0], q[swap]] = [q[swap], q[0]];
    }
    this.shuffleQueue = q;
    this.shuffleIdx = 0;
  }

  // ── Audio context ─────────────────────────────────────────────────────────
  private getAudioCtx(): AudioContext | null {
    if (!this.audioCtx) {
      try {
        this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch { return null; }
    }
    if (this.audioCtx.state === "suspended") this.audioCtx.resume().catch(() => {});
    return this.audioCtx;
  }

  private ensureAudioCtxResumed() {
    if (this.audioCtx?.state === "suspended") this.audioCtx.resume().catch(() => {});
  }

  private safeGain(v: number) { return Math.max(MIN_GAIN, v); }

  // ══════════════════════════════════════════════════════════════════════════
  //  SFX: BASIC ATTACK  (task completed – single / easy)
  //  Profile: short, dry, positive. Whoosh → hit → pling reward. ~250ms total.
  //  Medium/high pitch, no heavy bass. Not tiring on repeated use.
  // ══════════════════════════════════════════════════════════════════════════
  playBasicAttack() {
    if (!this.settings.sfxOn) return;
    const ctx = this.getAudioCtx();
    if (!ctx) return;
    const vol = this.settings.sfxVolume;
    if (vol <= 0) return;
    const now = ctx.currentTime;
    const mv = vol * 0.38; // master scale

    // 1. Whoosh: bandpass noise sweep 900 → 3400Hz over 60ms
    const whooshSrc = ctx.createBufferSource();
    whooshSrc.buffer = makeNoise(ctx, 0.065);
    const whooshBpf = ctx.createBiquadFilter();
    whooshBpf.type = "bandpass";
    whooshBpf.frequency.setValueAtTime(900, now);
    whooshBpf.frequency.exponentialRampToValueAtTime(3400, now + 0.06);
    whooshBpf.Q.value = 1.0;
    const whooshG = ctx.createGain();
    whooshG.gain.setValueAtTime(MIN_GAIN, now);
    whooshG.gain.linearRampToValueAtTime(this.safeGain(mv * 0.70), now + 0.018);
    whooshG.gain.exponentialRampToValueAtTime(MIN_GAIN, now + 0.065);
    whooshSrc.connect(whooshBpf); whooshBpf.connect(whooshG); whooshG.connect(ctx.destination);
    whooshSrc.start(now); whooshSrc.stop(now + 0.07);

    // 2. Hit: sharp high-pass noise burst at t=50ms, 45ms
    const hitT = now + 0.050;
    const hitSrc = ctx.createBufferSource();
    hitSrc.buffer = makeNoise(ctx, 0.045);
    const hitHpf = ctx.createBiquadFilter();
    hitHpf.type = "highpass";
    hitHpf.frequency.value = 2000;
    hitHpf.Q.value = 0.7;
    const hitG = ctx.createGain();
    hitG.gain.setValueAtTime(this.safeGain(mv * 0.80), hitT);
    hitG.gain.exponentialRampToValueAtTime(MIN_GAIN, hitT + 0.045);
    hitSrc.connect(hitHpf); hitHpf.connect(hitG); hitG.connect(ctx.destination);
    hitSrc.start(hitT); hitSrc.stop(hitT + 0.05);

    // 3. Pling: triangle ~1350Hz with quick decay — the "reward" tone, t=62ms
    const plingT = now + 0.062;
    const plingOsc = ctx.createOscillator();
    plingOsc.type = "triangle";
    plingOsc.frequency.setValueAtTime(1350, plingT);
    plingOsc.frequency.exponentialRampToValueAtTime(1050, plingT + 0.16);
    const plingG = ctx.createGain();
    plingG.gain.setValueAtTime(MIN_GAIN, plingT);
    plingG.gain.linearRampToValueAtTime(this.safeGain(mv * 0.42), plingT + 0.007);
    plingG.gain.exponentialRampToValueAtTime(MIN_GAIN, plingT + 0.16);
    plingOsc.connect(plingG); plingG.connect(ctx.destination);
    plingOsc.start(plingT); plingOsc.stop(plingT + 0.18);
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  SFX: CRITICAL ATTACK  (combo ≥2 tasks or hard task)
  //  Profile: fuller, two-layer, +shimmer sparkle. ~420ms. Clearly "special".
  // ══════════════════════════════════════════════════════════════════════════
  playCriticalAttack() {
    if (!this.settings.sfxOn) return;
    const ctx = this.getAudioCtx();
    if (!ctx) return;
    const vol = this.settings.sfxVolume;
    if (vol <= 0) return;
    const now = ctx.currentTime;
    const mv = vol * 0.44; // slightly louder than basic

    // 1. Bigger whoosh: 500 → 4500Hz, 85ms
    const whooshSrc = ctx.createBufferSource();
    whooshSrc.buffer = makeNoise(ctx, 0.09);
    const whooshBpf = ctx.createBiquadFilter();
    whooshBpf.type = "bandpass";
    whooshBpf.frequency.setValueAtTime(500, now);
    whooshBpf.frequency.exponentialRampToValueAtTime(4500, now + 0.085);
    whooshBpf.Q.value = 0.9;
    const whooshG = ctx.createGain();
    whooshG.gain.setValueAtTime(MIN_GAIN, now);
    whooshG.gain.linearRampToValueAtTime(this.safeGain(mv * 0.80), now + 0.022);
    whooshG.gain.exponentialRampToValueAtTime(MIN_GAIN, now + 0.085);
    whooshSrc.connect(whooshBpf); whooshBpf.connect(whooshG); whooshG.connect(ctx.destination);
    whooshSrc.start(now); whooshSrc.stop(now + 0.09);

    // 2. Main impact: high-pass noise burst at t=70ms, 80ms + slight tail
    const impT = now + 0.070;
    const impSrc = ctx.createBufferSource();
    impSrc.buffer = makeNoise(ctx, 0.10);
    const impHpf = ctx.createBiquadFilter();
    impHpf.type = "highpass";
    impHpf.frequency.value = 1800;
    impHpf.Q.value = 0.8;
    const impG = ctx.createGain();
    impG.gain.setValueAtTime(this.safeGain(mv * 1.0), impT);
    impG.gain.exponentialRampToValueAtTime(MIN_GAIN, impT + 0.10);
    impSrc.connect(impHpf); impHpf.connect(impG); impG.connect(ctx.destination);
    impSrc.start(impT); impSrc.stop(impT + 0.11);

    // 3. Low magic poof: triangle 110 → 50Hz, gives weight without heavy bass
    const poofOsc = ctx.createOscillator();
    poofOsc.type = "triangle";
    poofOsc.frequency.setValueAtTime(110, impT);
    poofOsc.frequency.exponentialRampToValueAtTime(50, impT + 0.09);
    const poofG = ctx.createGain();
    poofG.gain.setValueAtTime(this.safeGain(mv * 0.50), impT);
    poofG.gain.exponentialRampToValueAtTime(MIN_GAIN, impT + 0.10);
    poofOsc.connect(poofG); poofG.connect(ctx.destination);
    poofOsc.start(impT); poofOsc.stop(impT + 0.12);

    // 4. Pling: same reward tone but slightly higher — t=85ms
    const plingT = now + 0.085;
    const plingOsc = ctx.createOscillator();
    plingOsc.type = "triangle";
    plingOsc.frequency.setValueAtTime(1700, plingT);
    plingOsc.frequency.exponentialRampToValueAtTime(1200, plingT + 0.14);
    const plingG = ctx.createGain();
    plingG.gain.setValueAtTime(MIN_GAIN, plingT);
    plingG.gain.linearRampToValueAtTime(this.safeGain(mv * 0.45), plingT + 0.007);
    plingG.gain.exponentialRampToValueAtTime(MIN_GAIN, plingT + 0.14);
    plingOsc.connect(plingG); plingG.connect(ctx.destination);
    plingOsc.start(plingT); plingOsc.stop(plingT + 0.16);

    // 5. Shimmer sparkle — 3 bright sine tones staggered, t=105ms
    //    This is what makes it clearly "special" vs basic
    const sparkT = now + 0.105;
    [3600, 5200, 7400].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, sparkT + i * 0.018);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.35, sparkT + i * 0.018 + 0.18);
      const g = ctx.createGain();
      g.gain.setValueAtTime(MIN_GAIN, sparkT);
      g.gain.linearRampToValueAtTime(this.safeGain(mv * 0.22), sparkT + i * 0.018 + 0.005);
      g.gain.exponentialRampToValueAtTime(MIN_GAIN, sparkT + i * 0.018 + 0.20);
      osc.connect(g); g.connect(ctx.destination);
      osc.start(sparkT + i * 0.018); osc.stop(sparkT + i * 0.018 + 0.22);
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  SFX: VICTORY  (monster killed)
  //  Sequence: mini-hit → crystal/shield break → ascending 4-note jingle
  //  Total: ~900ms. Gives clear "objective complete" feel.
  // ══════════════════════════════════════════════════════════════════════════
  playVictory() {
    if (!this.settings.sfxOn) return;
    const ctx = this.getAudioCtx();
    if (!ctx) return;
    const vol = this.settings.sfxVolume;
    if (vol <= 0) return;
    const now = ctx.currentTime;
    const mv = vol * 0.40;

    // 1. Final hit: quick high-pass noise burst (like basic attack hit layer)
    const hitSrc = ctx.createBufferSource();
    hitSrc.buffer = makeNoise(ctx, 0.05);
    const hitHpf = ctx.createBiquadFilter();
    hitHpf.type = "highpass";
    hitHpf.frequency.value = 1600;
    const hitG = ctx.createGain();
    hitG.gain.setValueAtTime(this.safeGain(mv * 0.90), now);
    hitG.gain.exponentialRampToValueAtTime(MIN_GAIN, now + 0.05);
    hitSrc.connect(hitHpf); hitHpf.connect(hitG); hitG.connect(ctx.destination);
    hitSrc.start(now); hitSrc.stop(now + 0.06);

    // 2. Crystal / shield break: high-frequency noise sparkle burst at t=40ms
    //    + 5 rapidly descending sine pings (glass-shattering feel)
    const breakT = now + 0.040;
    const breakSrc = ctx.createBufferSource();
    breakSrc.buffer = makeNoise(ctx, 0.12);
    const breakBpf = ctx.createBiquadFilter();
    breakBpf.type = "bandpass";
    breakBpf.frequency.value = 5000;
    breakBpf.Q.value = 3.0;
    const breakG = ctx.createGain();
    breakG.gain.setValueAtTime(this.safeGain(mv * 0.60), breakT);
    breakG.gain.exponentialRampToValueAtTime(MIN_GAIN, breakT + 0.12);
    breakSrc.connect(breakBpf); breakBpf.connect(breakG); breakG.connect(ctx.destination);
    breakSrc.start(breakT); breakSrc.stop(breakT + 0.13);

    // Crystal ping shards (5 rapid high tones, descending pitch)
    [6000, 4800, 3900, 3200, 2600].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, breakT + i * 0.016);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.55, breakT + i * 0.016 + 0.08);
      const g = ctx.createGain();
      g.gain.setValueAtTime(this.safeGain(mv * 0.18), breakT + i * 0.016);
      g.gain.exponentialRampToValueAtTime(MIN_GAIN, breakT + i * 0.016 + 0.09);
      osc.connect(g); g.connect(ctx.destination);
      osc.start(breakT + i * 0.016); osc.stop(breakT + i * 0.016 + 0.10);
    });

    // 3. Victory jingle: 4-note ascending C5 → E5 → G5 → C6, triangle + square mix
    //    Starts at t=130ms to feel like a natural resolution after the break
    const jingleT = now + 0.130;
    const jingle = [
      { freq: 523.25,  t: 0,     dur: 0.11 }, // C5
      { freq: 659.25,  t: 0.10,  dur: 0.11 }, // E5
      { freq: 783.99,  t: 0.20,  dur: 0.12 }, // G5
      { freq: 1046.50, t: 0.30,  dur: 0.45 }, // C6 — held, the triumphant resolution
    ];
    const jingleMaster = ctx.createGain();
    jingleMaster.gain.setValueAtTime(this.safeGain(mv * 0.70), jingleT);
    jingleMaster.gain.setValueAtTime(this.safeGain(mv * 0.70), jingleT + 0.65);
    jingleMaster.gain.exponentialRampToValueAtTime(MIN_GAIN, jingleT + 0.80);
    jingleMaster.connect(ctx.destination);

    jingle.forEach(({ freq, t, dur }) => {
      // Triangle — warm base
      const tri = ctx.createOscillator();
      tri.type = "triangle";
      tri.frequency.setValueAtTime(freq, jingleT + t);
      const triG = ctx.createGain();
      triG.gain.setValueAtTime(MIN_GAIN, jingleT);
      triG.gain.linearRampToValueAtTime(0.40, jingleT + t + 0.006);
      triG.gain.exponentialRampToValueAtTime(MIN_GAIN, jingleT + t + dur);
      tri.connect(triG); triG.connect(jingleMaster);
      tri.start(jingleT + t); tri.stop(jingleT + t + dur + 0.01);

      // Square at half volume — adds the 8-bit sparkle character
      const sq = ctx.createOscillator();
      sq.type = "square";
      sq.frequency.setValueAtTime(freq, jingleT + t);
      const sqG = ctx.createGain();
      sqG.gain.setValueAtTime(MIN_GAIN, jingleT);
      sqG.gain.linearRampToValueAtTime(0.12, jingleT + t + 0.006);
      sqG.gain.exponentialRampToValueAtTime(MIN_GAIN, jingleT + t + dur * 0.6);
      sq.connect(sqG); sqG.connect(jingleMaster);
      sq.start(jingleT + t); sq.stop(jingleT + t + dur + 0.01);
    });

    // Shimmer on the final C6 — adds magic resolution
    const shimOsc = ctx.createOscillator();
    shimOsc.type = "sine";
    shimOsc.frequency.setValueAtTime(2093, jingleT + 0.30); // C7
    const shimG = ctx.createGain();
    shimG.gain.setValueAtTime(MIN_GAIN, jingleT + 0.30);
    shimG.gain.linearRampToValueAtTime(this.safeGain(mv * 0.25), jingleT + 0.31);
    shimG.gain.exponentialRampToValueAtTime(MIN_GAIN, jingleT + 0.75);
    shimOsc.connect(shimG); shimG.connect(ctx.destination);
    shimOsc.start(jingleT + 0.30); shimOsc.stop(jingleT + 0.80);
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  SFX: LEVEL UP / COMBAT POWER / REBIRTH
  //  Distinct, "epic" feel. Short riser → soft major chord + shimmer.
  //  Memorable because it's a meta-game milestone. Total: ~1.3s.
  // ══════════════════════════════════════════════════════════════════════════
  playLevelUp() {
    if (!this.settings.sfxOn) return;
    const ctx = this.getAudioCtx();
    if (!ctx) return;
    const vol = this.settings.sfxVolume;
    if (vol <= 0) return;
    const now = ctx.currentTime;
    const mv = vol * 0.38;

    // 1. Riser: sine sweep 180 → 900Hz over 450ms — announces something big
    const riserOsc = ctx.createOscillator();
    riserOsc.type = "sine";
    riserOsc.frequency.setValueAtTime(180, now);
    riserOsc.frequency.exponentialRampToValueAtTime(900, now + 0.45);
    const riserG = ctx.createGain();
    riserG.gain.setValueAtTime(MIN_GAIN, now);
    riserG.gain.linearRampToValueAtTime(this.safeGain(mv * 0.55), now + 0.06);
    riserG.gain.setValueAtTime(this.safeGain(mv * 0.55), now + 0.38);
    riserG.gain.exponentialRampToValueAtTime(MIN_GAIN, now + 0.46);
    riserOsc.connect(riserG); riserG.connect(ctx.destination);
    riserOsc.start(now); riserOsc.stop(now + 0.48);

    // Riser harmonic (octave above) — adds richness
    const riserHarm = ctx.createOscillator();
    riserHarm.type = "triangle";
    riserHarm.frequency.setValueAtTime(360, now);
    riserHarm.frequency.exponentialRampToValueAtTime(1800, now + 0.45);
    const riserHarmG = ctx.createGain();
    riserHarmG.gain.setValueAtTime(MIN_GAIN, now);
    riserHarmG.gain.linearRampToValueAtTime(this.safeGain(mv * 0.25), now + 0.08);
    riserHarmG.gain.setValueAtTime(this.safeGain(mv * 0.25), now + 0.38);
    riserHarmG.gain.exponentialRampToValueAtTime(MIN_GAIN, now + 0.46);
    riserHarm.connect(riserHarmG); riserHarmG.connect(ctx.destination);
    riserHarm.start(now); riserHarm.stop(now + 0.48);

    // 2. Soft major chord: C5 + E5 + G5 in triangle waves at t=420ms
    //    Warm, not harsh — feels like evolution, not combat
    const chordT = now + 0.420;
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, chordT);
      const g = ctx.createGain();
      g.gain.setValueAtTime(MIN_GAIN, chordT);
      g.gain.linearRampToValueAtTime(this.safeGain(mv * (0.50 - i * 0.06)), chordT + 0.025);
      g.gain.setValueAtTime(this.safeGain(mv * (0.50 - i * 0.06)), chordT + 0.55);
      g.gain.exponentialRampToValueAtTime(MIN_GAIN, chordT + 0.80);
      osc.connect(g); g.connect(ctx.destination);
      osc.start(chordT); osc.stop(chordT + 0.85);
    });

    // C6 — bright top note of the chord, slight delay for arpeggio feel
    const topOsc = ctx.createOscillator();
    topOsc.type = "triangle";
    topOsc.frequency.setValueAtTime(1046.50, chordT + 0.030);
    const topG = ctx.createGain();
    topG.gain.setValueAtTime(MIN_GAIN, chordT + 0.030);
    topG.gain.linearRampToValueAtTime(this.safeGain(mv * 0.35), chordT + 0.050);
    topG.gain.setValueAtTime(this.safeGain(mv * 0.35), chordT + 0.50);
    topG.gain.exponentialRampToValueAtTime(MIN_GAIN, chordT + 0.82);
    topOsc.connect(topG); topG.connect(ctx.destination);
    topOsc.start(chordT + 0.030); topOsc.stop(chordT + 0.86);

    // 3. "Ding" accent: pure sine at C7 (2093Hz), sparkles on chord hit
    const dingOsc = ctx.createOscillator();
    dingOsc.type = "sine";
    dingOsc.frequency.setValueAtTime(2093, chordT);
    const dingG = ctx.createGain();
    dingG.gain.setValueAtTime(MIN_GAIN, chordT);
    dingG.gain.linearRampToValueAtTime(this.safeGain(mv * 0.45), chordT + 0.008);
    dingG.gain.exponentialRampToValueAtTime(MIN_GAIN, chordT + 0.55);
    dingOsc.connect(dingG); dingG.connect(ctx.destination);
    dingOsc.start(chordT); dingOsc.stop(chordT + 0.60);

    // 4. High shimmer tail: two tones at 3135Hz and 4186Hz (G7/C8 area)
    [3135, 4186].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, chordT + 0.05 + i * 0.04);
      const g = ctx.createGain();
      g.gain.setValueAtTime(MIN_GAIN, chordT + 0.05 + i * 0.04);
      g.gain.linearRampToValueAtTime(this.safeGain(mv * 0.18), chordT + 0.07 + i * 0.04);
      g.gain.exponentialRampToValueAtTime(MIN_GAIN, chordT + 0.70 + i * 0.05);
      osc.connect(g); g.connect(ctx.destination);
      osc.start(chordT + 0.05 + i * 0.04); osc.stop(chordT + 0.80 + i * 0.05);
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  SFX: UI CLICK
  // ══════════════════════════════════════════════════════════════════════════
  playClick(type: "tap" | "press" | "navigate" = "tap") {
    if (!this.settings.sfxOn) return;
    const ctx = this.getAudioCtx();
    if (!ctx) return;
    const vol = this.settings.sfxVolume;
    if (vol <= 0) return;
    const now = ctx.currentTime;
    const config = {
      tap:      { freq: 1800, dur: 0.035, gain: 0.25, type: "square"  as OscillatorType },
      press:    { freq: 1400, dur: 0.050, gain: 0.30, type: "square"  as OscillatorType },
      navigate: { freq: 2200, dur: 0.030, gain: 0.20, type: "square"  as OscillatorType },
    }[type];
    const osc = ctx.createOscillator();
    osc.type = config.type;
    osc.frequency.setValueAtTime(config.freq, now);
    osc.frequency.exponentialRampToValueAtTime(config.freq * 0.7, now + config.dur);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(this.safeGain(config.gain * vol), now);
    gain.gain.exponentialRampToValueAtTime(MIN_GAIN, now + config.dur);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(now); osc.stop(now + config.dur + 0.01);
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  SFX: TIMER TICK
  // ══════════════════════════════════════════════════════════════════════════
  playTick() {
    if (!this.settings.sfxOn) return;
    const ctx = this.getAudioCtx();
    if (!ctx) return;
    const vol = this.settings.sfxVolume;
    if (vol <= 0) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = "square";
    osc.frequency.setValueAtTime(1800, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.018);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(this.safeGain(0.08 * vol), now);
    gain.gain.exponentialRampToValueAtTime(MIN_GAIN, now + 0.022);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.025);
    const osc2 = ctx.createOscillator();
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(420, now + 0.012);
    const gain2 = ctx.createGain();
    gain2.gain.setValueAtTime(MIN_GAIN, now);
    gain2.gain.setValueAtTime(this.safeGain(0.04 * vol), now + 0.012);
    gain2.gain.exponentialRampToValueAtTime(MIN_GAIN, now + 0.04);
    osc2.connect(gain2); gain2.connect(ctx.destination);
    osc2.start(now + 0.012); osc2.stop(now + 0.045);
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  SFX: PREVIEW BEEP  (SFX volume slider feedback)
  // ══════════════════════════════════════════════════════════════════════════
  playPreviewBeep() {
    const ctx = this.getAudioCtx();
    if (!ctx) return;
    const vol = this.settings.sfxVolume;
    if (vol <= 0) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = "square";
    osc.frequency.setValueAtTime(1200, now);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(this.safeGain(0.20 * vol), now);
    gain.gain.exponentialRampToValueAtTime(MIN_GAIN, now + 0.04);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.05);
  }

  // ── Subscribe / unsubscribe ───────────────────────────────────────────────
  subscribe(fn: Listener) {
    this.listeners.add(fn);
    return () => { this.listeners.delete(fn); };
  }

  private emit() {
    saveSettings(this.settings);
    this.listeners.forEach((fn) => fn({ ...this.settings }));
  }

  getSettings(): AudioSettings { return { ...this.settings }; }
  getTrackName(): string       { return TRACK_NAMES[this.settings.currentTrack] ?? "???"; }
  getTrackCount(): number      { return PLAYLIST.length; }

  // ── Bootstrap ─────────────────────────────────────────────────────────────
  ensureStarted() {
    if (this.started) return;
    this.started = true;
    this.ensureAudioCtxResumed();
    if (this.settings.musicOn) this.playTrack(this.shuffleQueue[this.shuffleIdx]);
  }

  // ── Internal track player ─────────────────────────────────────────────────
  private playTrack(idx: number) {
    if (this.audio) {
      this.audio.pause();
      this.audio.removeEventListener("ended", this.handleEnded);
      this.audio = null;
    }
    this.settings.currentTrack = idx;
    const a = new Audio(PLAYLIST[idx]);
    a.volume = this.settings.musicVolume;
    a.preload = "auto";
    a.addEventListener("ended", this.handleEnded);
    this.audio = a;
    if (this.settings.musicOn && this.started) {
      a.play().catch(() => { this.pendingPlay = true; });
    }
    this.emit();
  }

  private handleEnded = () => {
    this.shuffleIdx++;
    if (this.shuffleIdx >= this.shuffleQueue.length) {
      this.buildShuffleQueue(this.settings.currentTrack);
    }
    this.playTrack(this.shuffleQueue[this.shuffleIdx]);
  };

  // ── Music controls ────────────────────────────────────────────────────────
  setMusicOn(on: boolean) {
    this.settings.musicOn = on;
    this.ensureAudioCtxResumed();
    if (on) {
      if (!this.audio) this.playTrack(this.shuffleQueue[this.shuffleIdx]);
      else this.audio.play().catch(() => {});
    } else {
      this.audio?.pause();
    }
    this.emit();
  }

  setMusicVolume(v: number) {
    this.settings.musicVolume = Math.min(1, Math.max(0, v));
    if (this.audio) this.audio.volume = this.settings.musicVolume;
    this.emit();
  }

  // ── SFX controls ──────────────────────────────────────────────────────────
  setSfxOn(on: boolean) {
    this.settings.sfxOn = on;
    this.ensureAudioCtxResumed();
    this.emit();
  }

  setSfxVolume(v: number) {
    this.settings.sfxVolume = Math.min(1, Math.max(0, v));
    this.ensureAudioCtxResumed();
    this.emit();
  }

  isSfxOn(): boolean    { return this.settings.sfxOn; }
  getSfxVolume(): number { return this.settings.sfxVolume; }

  retryPendingPlay() {
    if (this.pendingPlay && this.audio && this.settings.musicOn) {
      this.audio.play().catch(() => {});
      this.pendingPlay = false;
    }
  }
}

export const audioManager = new AudioManager();
