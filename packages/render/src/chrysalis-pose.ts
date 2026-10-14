import type { ChrysalisSkin, ChrysalisState, SimConfig } from "@neon-spore/sim";
import { type At, chrysalisCentre } from "./chrysalis-shape.js";
import { smoothstep } from "./ease.js";
import type { Layout } from "./layout.js";

/**
 * **THE CHRYSALIS's pose**: where in its story the cocoon is this frame, read
 * off the boss and the beat and never kept — coming in, a skin lit, a skin
 * peeling away, a skin growing back, a sac swelling, the grub dying.
 *
 * **Each skin has a stance, and the body between two is a blend.** Under the
 * slime the cocoon hangs heavy; with its quills out it bristles on the beat;
 * with its sacs it is swollen low; down to its heart it squeezes on every
 * beat. As a skin peels, the stance eases from the one to the next
 * (`smoothstep`), never cut.
 *
 * **It turns as it sheds** (THE INSTAR's *turned*, `docs/spec/bosses.md`
 * §11.32): a half turn about its long axis as it writhes out of each skin,
 * so the face the pair has been looking at — two eye spots — goes round the
 * back and the row of breathing holes on its other side comes round, and the
 * next skin turns it back. It never turns while a skin is lit: the quills'
 * knobs, the sacs and the pores are judged where they hang.
 */
export interface ChrysalisPose {
  /** The cocoon's centre. */
  c: At;
  /** How near it has come, 0..1, swelling in from the dark. */
  near: number;
  /** The skin peeling away and how far it has gone, 0..1, or null. */
  shed: { skin: ChrysalisSkin; k: number } | null;
  /** How whole the lit skin is: below 1 while it grows back. */
  grow: number;
  /** How far the grub has died, 0..1: nought until the last skin is off. */
  die: number;
  /** The heartbeat, a lub and a dub: 1 on the beat, falling, a smaller rise after. */
  pulse: number;
  /** The slow breath, -1..1. */
  breathe: number;
  /** The turn about the long axis, radians: 0 the eye spots face-on, pi the breathing holes. */
  yaw: number;
  /** The lower half swollen, 0..1: the sacs' stance. */
  bloat: number;
  /** Drawn in round the waist, 0..1: the heart's beat. */
  squeeze: number;
  /** The swelling sac's swell, 0..1, or -1 with none swelling. */
  swell: number;
}

/** How each skin holds the body: its belly, and how hard it squeezes on the beat. */
const STANCE: Record<ChrysalisSkin, { bloat: number; squeeze: number }> = {
  slime: { bloat: 0.15, squeeze: 0 },
  quills: { bloat: 0, squeeze: 0.2 },
  sacs: { bloat: 1, squeeze: 0.1 },
  heart: { bloat: 0, squeeze: 1 },
};

/** A cocoon at rest, every skin whole: what a test draws by. */
export function chrysalisAtRest(l: Layout, cfg: SimConfig): ChrysalisPose {
  return {
    c: chrysalisCentre(l, cfg),
    near: 1,
    shed: null,
    grow: 1,
    die: 0,
    pulse: 0,
    breathe: 0,
    yaw: 0,
    bloat: 0,
    squeeze: 0,
    swell: -1,
  };
}

export function chrysalisPose(
  l: Layout,
  cfg: SimConfig,
  s: ChrysalisState,
  beat: number,
  beatPhase: number,
  time: number,
): ChrysalisPose {
  const now = beat + beatPhase;
  const since = now - s.phaseBeat;
  const pulse = Math.max(0, 1 - 3 * beatPhase, 0.55 * (1 - 4 * Math.abs(beatPhase - 0.3)));
  const near = s.phase === "enter" ? smoothstep(Math.min(1, since / cfg.chrysalisEnterBeats)) : 1;
  const gone = s.steps[s.cursor - 1]?.skin;
  const peeling = (s.phase === "shed" || s.phase === "spent") && gone !== undefined;
  const k = peeling ? Math.min(1, since / cfg.chrysalisShedBeats) : 1;
  const shed = peeling ? { skin: gone, k } : null;
  const grow = s.phase === "regrow" ? Math.min(1, since / cfg.chrysalisRegrowBeats) : 1;
  const die = s.phase === "spent" ? Math.min(1, since / cfg.chrysalisSpentBeats) : 0;
  // The stance: the skin on now, eased from the one just peeled.
  const on = STANCE[s.steps[s.cursor]?.skin ?? "heart"];
  const was = gone === undefined || !peeling ? on : STANCE[gone];
  const e = smoothstep(k);
  const bloat = was.bloat + (on.bloat - was.bloat) * e;
  const squeeze = (was.squeeze + (on.squeeze - was.squeeze) * e) * pulse;
  // Half a turn a skin peeled; the arrival turns it in from the back.
  const turns = s.phase === "enter" ? near - 1 : s.cursor - (peeling ? 1 - e : 0);
  const swell =
    s.sprayBeat < 0
      ? -1
      : Math.max(0, Math.min(1, 1 - (s.sprayBeat - now) / Math.max(1, cfg.chrysalisSwellBeats)));
  return {
    c: chrysalisCentre(l, cfg),
    near,
    shed,
    grow,
    die,
    pulse,
    breathe: Math.sin(time * 1.3),
    yaw: turns * Math.PI,
    bloat,
    squeeze,
    swell,
  };
}
