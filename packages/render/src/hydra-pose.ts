import type { HydraHead, HydraState, SimConfig } from "@neon-spore/sim";
import { smoothstep } from "./ease.js";
import { type At, hydraCentre, hydraReach } from "./hydra-shape.js";
import type { Layout } from "./layout.js";

/**
 * **THE HYDRA's pose**: where in its story the body is this frame, read off
 * the boss and the beat and never kept — coming in, a level's heads coming
 * for the ship, rearing back between two levels, beaten.
 *
 * **Each kind of head has a stance, and the body between two is a blend.**
 * Behind the biting necks it hunches low and lunges; holding its coils it
 * squats wide and pulls; under its eyes it stands tall; with its maws it
 * swells, the fire rising in its throat. As it rears between two levels the
 * stance eases from the one to the next (`smoothstep`), never cut.
 *
 * **It turns as it rears** (THE INSTAR's *turned*, `docs/spec/bosses.md`
 * §11.32): a half turn about its upright axis every level, so the pale
 * belly the pair has been looking at goes round and the spined back with
 * its glowing spots comes round — and the next level turns it back. It
 * never turns while heads are coming: they are judged where they hang.
 */
export interface HydraPose {
  /** The body's centre this frame, lifted as it rears. */
  c: At;
  /** How far across it reaches, in pixels, with its stance. */
  rx: number;
  /** How far down and up it reaches, in pixels, with its stance. */
  ry: number;
  /** How near it has come, 0..1, swelling in out of the dark. */
  near: number;
  /** How grown the heads of the level on are, 0..1: below 1 while it rears and they grow. */
  grow: number;
  /** How far up it rears, 0..1, peaking halfway between two levels. */
  rear: number;
  /** How far the lit level's window has run, 0..1: the heads come closer as it does. */
  threat: number;
  /** How far the beaten body has sunk away, 0..1. */
  die: number;
  /** The beat's throb: 1 on the beat, falling. */
  pulse: number;
  /** The slow breath, -1..1. */
  breathe: number;
  /** The turn about the upright axis, radians: 0 the belly face-on, pi the spined back. */
  yaw: number;
  /** How hard the fire burns in its throat, 0..1: the maws' stance. */
  throat: number;
  /** How far the body hunches forward and down, 0..1: the bites' stance. */
  hunch: number;
}

/** How each kind of head holds the body: wider, taller, hunched, and the throat lit. */
const STANCE: Record<HydraHead, { wide: number; tall: number; hunch: number; throat: number }> = {
  bite: { wide: 1.04, tall: 0.94, hunch: 1, throat: 0 },
  coil: { wide: 1.12, tall: 0.86, hunch: 0.3, throat: 0 },
  eye: { wide: 0.94, tall: 1.12, hunch: 0, throat: 0 },
  maw: { wide: 1.07, tall: 1.06, hunch: 0.2, throat: 1 },
};

export function hydraPose(
  l: Layout,
  cfg: SimConfig,
  s: HydraState,
  beat: number,
  beatPhase: number,
  time: number,
): HydraPose {
  const now = beat + beatPhase;
  const since = now - s.phaseBeat;
  const pulse = Math.max(0, 1 - 2.5 * beatPhase);
  const near = s.phase === "enter" ? smoothstep(Math.min(1, since / cfg.hydraEnterBeats)) : 1;
  const rearing = s.phase === "rear";
  const k = rearing ? Math.min(1, since / cfg.hydraRearBeats) : 1;
  const e = smoothstep(k);
  const grow = s.phase === "enter" ? near : e;
  const die = s.phase === "spent" ? Math.min(1, since / cfg.hydraSpentBeats) : 0;
  const lit = s.steps[s.cursor];
  const threat =
    s.phase === "heads" && lit !== undefined ? Math.min(1, since / Math.max(1, lit.beats)) : 0;
  // The stance: the level on now, eased from the one just stopped.
  const on = STANCE[lit?.head ?? s.steps[s.cursor - 1]?.head ?? "bite"];
  const gone = s.steps[s.cursor - 1]?.head;
  const was = rearing && gone !== undefined ? STANCE[gone] : on;
  const mix = (a: number, b: number) => a + (b - a) * e;
  const rear = rearing ? Math.sin(Math.PI * k) : 0;
  // Half a turn a level stopped; the arrival turns it in from the back.
  const turns = s.phase === "enter" ? near - 1 : s.cursor - (rearing ? 1 - e : 0);
  const r = hydraReach(l, s) * (1 + 0.08 * rear);
  const breathe = Math.sin(time * 1.1);
  const swell = 1 + 0.03 * breathe + 0.04 * pulse * threat;
  const c = hydraCentre(l, cfg);
  const hunch = mix(was.hunch, on.hunch) * (0.5 + 0.5 * threat);
  return {
    c: {
      x: c.x,
      y: c.y - rear * l.tile * 0.8 + hunch * l.tile * 0.35 - die * l.tile * 2,
    },
    rx: r * mix(was.wide, on.wide) * swell,
    ry: r * 0.8 * mix(was.tall, on.tall) * swell * (1 - 0.06 * hunch),
    near,
    grow,
    rear,
    threat,
    die,
    pulse,
    breathe,
    yaw: turns * Math.PI,
    throat: mix(was.throat, on.throat),
    hunch,
  };
}
