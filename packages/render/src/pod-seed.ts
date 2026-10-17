/**
 * **The real pod's body: a tumbling seed** — the shape and the clock, with
 * no drawing in it. `pod-blink.ts` paints it; `pod-seed-spikes.ts` and
 * `pod-seed-skins.ts` hold its spikes and skins.
 *
 * THE SMART's seven studs on a round body, tumbling about a tilted axis. From
 * `WAKES_AT` beats left it tumbles faster and its spikes throw themselves out
 * on every beat — a seed about to split. The owner chose the SMART seed as
 * the basis for the pod on 16 October 2026 and took BLINK from its family the
 * same day (`tools/versus/DECIDED.md`, `pod:real`); the hollow pod's looks in
 * VERSUS are built from the same seed, so a player who knows the one is
 * fooled by the other.
 *
 * It takes a radius rather than a layout so a pod can be drawn wherever its
 * caller has put it, and so this file need not import `pods.ts`, which
 * imports it.
 */

/** Beats left at which the seed wakes. */
export const WAKES_AT = 6;
/** The slow bob, as a share of the pod's radius — a twentieth of a tile. */
const BOB = 0.13;
/** THE SMART's stud count. */
const STUDS = 7;
export type V = { x: number; y: number; z: number };

/** Seven directions spread evenly over a sphere — the golden spiral. */
const DIRS: V[] = Array.from({ length: STUDS }, (_, i) => {
  const yy = 1 - ((i + 0.5) / STUDS) * 2;
  const rr = Math.sqrt(1 - yy * yy);
  const a = i * Math.PI * (3 - Math.sqrt(5));
  return { x: Math.cos(a) * rr, y: yy, z: Math.sin(a) * rr };
});
/** The axis it tumbles about, leaning off the upright. */
const AXIS: V = (() => {
  const v = { x: 0.55, y: 0.75, z: 0.35 };
  const n = Math.hypot(v.x, v.y, v.z);
  return { x: v.x / n, y: v.y / n, z: v.z / n };
})();

/** Rodrigues: `v` turned by `a` about `AXIS`. */
export function turn(v: V, a: number): V {
  const c = Math.cos(a);
  const s = Math.sin(a);
  const d = (v.x * AXIS.x + v.y * AXIS.y + v.z * AXIS.z) * (1 - c);
  return {
    x: v.x * c + (AXIS.y * v.z - AXIS.z * v.y) * s + AXIS.x * d,
    y: v.y * c + (AXIS.z * v.x - AXIS.x * v.z) * s + AXIS.y * d,
    z: v.z * c + (AXIS.x * v.y - AXIS.y * v.x) * s + AXIS.z * d,
  };
}

/** The seed at one moment: where it is, how big, how turned, how awake. */
export interface Seed {
  x: number;
  y: number;
  /** The pod's drawn radius — `POD_TILES` of a tile on the field. */
  r: number;
  /** The sphere's own radius. */
  R: number;
  roll: number;
  /** How far out a stud tip stands, in sphere radii. */
  reach: number;
  studs: V[];
  /** 0 with time to spare, 1 at the deadline. */
  awake: number;
  /** Where in its beat the clock is, 1 at the top falling to 0. */
  beat: number;
  /** The slow breath every candidate shares, 0..1. */
  pulse: number;
}

export function seedAt(x: number, y: number, r: number, t: number, beatsLeft: number): Seed {
  const awake = Math.max(0, Math.min(1, 1 - beatsLeft / WAKES_AT));
  const roll = t * (0.8 + 2.4 * awake);
  const beat = Number.isFinite(beatsLeft) ? beatsLeft % 1 : 0;
  return {
    x,
    y: y + Math.sin(t * 1.1) * r * BOB,
    r,
    R: r * 0.74,
    roll,
    // On the beat, a throw of the studs that decays through it.
    reach: 1.42 + 0.22 * awake * beat * beat,
    studs: DIRS.map((d) => turn(d, roll)),
    awake,
    beat,
    pulse: 0.5 + 0.5 * Math.sin(t * 2.4),
  };
}

/** Where a stud's tip is on the screen. */
export function tipOf(s: Seed, d: V): { x: number; y: number } {
  return { x: s.x + d.x * s.R * s.reach, y: s.y + d.y * s.R * s.reach };
}

/**
 * A pickup's blink, 0..1, hard-edged the way a bonus in a game blinks: once a
 * beat with time to spare, twice a beat from half the waking, four times in
 * the last beat. A pod that owes nothing blinks on the seconds.
 */
export function blinkAt(t: number, beatsLeft: number): number {
  if (!Number.isFinite(beatsLeft)) return (t * 1.6) % 1 < 0.22 ? 1 : 0;
  const per = beatsLeft < 1 ? 4 : beatsLeft < WAKES_AT / 2 ? 2 : 1;
  const ph = (beatsLeft * per) % 1;
  // The flash is the top of each count, a fifth of it, and falls off fast.
  return ph > 0.78 ? Math.min(1, (ph - 0.78) / 0.06) : 0;
}
