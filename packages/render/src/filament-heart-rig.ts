import type { Ring, Vec3 } from "@neon-spore/content";
import { mixHex } from "./hex.js";
import { PALETTE } from "./palette.js";
import type { Part } from "./solid-rig.js";
import type { Skin } from "./solid-tube-draw.js";

/**
 * **THE FILAMENT's heart, modelled** — the owner, 7 October 2026: *the
 * hearth looks weird. i meant more like a real hearth organ not for kids …
 * something cool looking like a 3d alien organ*. The flat two-lobed card it
 * replaces is the shape on a sweet wrapper; this is the organ.
 *
 * Built as a rig (`solid-rig.ts`, the style guide's "A boss seen from any
 * side") so it is lit, ordered and turned in three dimensions:
 *
 * - **two ventricles**: the left the whole cone down to the apex, the right
 *   a bulge on its front that tapers up into the trunk, as a heart's outflow
 *   does — the groove between them is where its rim crosses the left one;
 * - **two atria** on top, a ball each, behind the ventricles' base;
 * - **the arch**, a vessel rising off the base, curling over and back down
 *   behind, with three stumps standing up off it, the **trunk** up out
 *   of the right ventricle and the **cava** beside it — the alien's own
 *   vessels, run up toward the body the heart hangs in, swaying as that
 *   body moves and tapering to threads short of the top of the screen;
 *
 * Every length is in the heart's radius `rx`, so a heart a vein smaller is
 * the same organ smaller. `x` is the screen's, `y` down, `z` toward the
 * seats. The veins the pair traces go in at the apex (`filamentHeartPoint`),
 * which sits on the axis the idle turn is about, so the lead does not slide.
 */

/** The flesh: `sheenDeep` toward `sheenWarm` for the muscle, lit up to the warm end. */
export const MUSCLE: Skin = {
  base: mixHex(PALETTE.sheenDeep, PALETTE.sheenWarm, 0.3),
  lift: PALETTE.sheenWarm,
  sheen: PALETTE.sheenRim,
};
/** The atria: thinner walls, so cooler — toward the wisp's violet. */
export const ATRIUM: Skin = {
  base: mixHex(PALETTE.sheenDeep, PALETTE.wisp, 0.35),
  lift: PALETTE.sheenMid,
  sheen: PALETTE.sheenRim,
};
/** The great vessels: darker than the muscle so the heart reads in front of them. */
export const VESSEL: Skin = {
  base: mixHex(PALETTE.sheenDeep, PALETTE.sheenMid, 0.14),
  lift: mixHex(PALETTE.wisp, PALETTE.sheenDeep, 0.3),
  sheen: PALETTE.sheenRim,
};

/** How many steps a struck heart flushes red in, and how red the last is. */
export const FLUSH_STEPS = 3;
const FLUSH_MOST = 0.55;

/** A skin flushed toward the hurt's red, `step` of `FLUSH_STEPS` — stepped, so a ball's sprite is one of four. */
function flushed(skin: Skin, step: number): Skin {
  const k = (step / FLUSH_STEPS) * FLUSH_MOST;
  if (k <= 0) return skin;
  return {
    base: mixHex(skin.base, PALETTE.red, k),
    lift: mixHex(skin.lift, PALETTE.redRim, k),
    sheen: skin.sheen,
  };
}

/** Every skin at every flush, built once. */
const FLUSHED = Array.from({ length: FLUSH_STEPS + 1 }, (_, i) => ({
  muscle: flushed(MUSCLE, i),
  atrium: flushed(ATRIUM, i),
  vessel: flushed(VESSEL, i),
}));

/**
 * Where the apex is, in `rx` from the heart's middle: below it and toward the
 * left ventricle, the way a heart's point leans. Every vein goes in there.
 */
export const APEX = 1.32;
/** How far above the middle the atria reach, in `rx`: what the heart hangs from. */
export const HEART_TOP = 1.12;
export const APEX_X = 0.26;
/**
 * How far up the vessels run at most, in `rx` above the middle. The drawer
 * passes less when the top of the screen is nearer: no boss is drawn under
 * the seat switcher (`top-chrome.ts`), so they taper to a thread short of it.
 */
export const RISE = 4.2;
/** How far a vessel's top sways, in `rx`, and how fast, in radians a second: it hangs in a body that moves. */
const SWAY_REACH = 0.12;
const SWAY_RATE = 0.9;

/** How a heart is posed this frame: its two squeezes, each 0..1. */
export interface HeartSqueeze {
  /** The atria, on the lub. */
  readonly atria: number;
  /** The ventricles, on the dub. */
  readonly ventricles: number;
}

/** How far a full squeeze draws a chamber in. */
const SQUEEZE_ATRIA = 0.12;
const SQUEEZE_VENTRICLES = 0.07;

type P3 = readonly [number, number, number];

/** A cubic Bézier through four model points, at `u`. */
function bez(a: P3, b: P3, c: P3, d: P3, u: number): Vec3 {
  const v = 1 - u;
  const k0 = v * v * v;
  const k1 = 3 * v * v * u;
  const k2 = 3 * v * u * u;
  const k3 = u * u * u;
  return {
    x: a[0] * k0 + b[0] * k1 + c[0] * k2 + d[0] * k3,
    y: a[1] * k0 + b[1] * k1 + c[1] * k2 + d[1] * k3,
    z: a[2] * k0 + b[2] * k1 + c[2] * k2 + d[2] * k3,
  };
}

/** A tube along a Bézier, its radius read off `radii` (spread evenly along it), `n` rings, scaled by `s`. */
function along(
  spine: readonly [P3, P3, P3, P3],
  radii: readonly number[],
  n: number,
  s: number,
): Ring[] {
  const rings: Ring[] = [];
  for (let i = 0; i < n; i++) {
    const u = i / (n - 1);
    const p = bez(spine[0], spine[1], spine[2], spine[3], u);
    const f = u * (radii.length - 1);
    const j = Math.min(radii.length - 2, Math.floor(f));
    const r = (radii[j] as number) + ((radii[j + 1] as number) - (radii[j] as number)) * (f - j);
    rings.push({ c: { x: p.x * s, y: p.y * s, z: p.z * s }, r: r * s });
  }
  return rings;
}

const LV_SPINE: readonly [P3, P3, P3, P3] = [
  [0.05, -0.62, -0.15],
  [0.3, -0.2, -0.12],
  [0.42, 0.55, -0.05],
  [APEX_X, APEX - 0.04, 0],
];
const LV_RADII = [0.42, 0.72, 0.76, 0.64, 0.42, 0.22, 0.05];
/** The right ventricle: a bulge on the left one's front, tapering up into the trunk at `RV_TOP`. */
const RV_TOP: P3 = [-0.22, -0.6, 0.3];
const RV_TOP_R = 0.19;
const RV_SPINE: readonly [P3, P3, P3, P3] = [
  RV_TOP,
  [-0.62, -0.15, 0.36],
  [-0.32, 0.6, 0.3],
  [0.12, 0.98, 0.16],
];
const RV_RADII = [RV_TOP_R, 0.46, 0.52, 0.44, 0.26, 0.07];

/** The left ventricle's rings and the right's, squeezed by `v`, at `rx` pixels to a unit. */
export function ventricles(rx: number, v: number): { left: Ring[]; right: Ring[] } {
  const k = 1 - SQUEEZE_VENTRICLES * v;
  const lr = LV_RADII.map((r) => r * k);
  const rr = RV_RADII.map((r) => r * k);
  return { left: along(LV_SPINE, lr, 11, rx), right: along(RV_SPINE, rr, 9, rx) };
}

/** A vessel from `from` up toward the top of the screen, tapering to a thread at `rise`, swaying `lean` sideways, `r` thick at its root. */
function rising(from: P3, lean: number, r: number, rx: number, rise: number): Ring[] {
  const top: P3 = [from[0] + lean, -rise, from[2] - 0.15];
  const a: P3 = [from[0] - lean * 0.2, from[1] - 0.8, from[2] + 0.05];
  const b: P3 = [from[0] + lean * 0.9, (from[1] - rise) * 0.55, from[2] - 0.1];
  return along([from, a, b, top], [r * 1.25, r, r * 0.85, r * 0.55, r * 0.12], 8, rx);
}

/**
 * The great vessels: the arch up off the base, over toward the left
 * ventricle's side and down behind it, with three stumps standing up off its
 * crown; the trunk out of the right ventricle in front of it, rising and
 * leaning out; and the cava up off the near atrium's back.
 */
function vessels(rx: number, skin: Skin, time: number, rise: number): Part[] {
  const sway = (i: number): number => SWAY_REACH * Math.sin(time * SWAY_RATE + i * 1.9);
  const tube = (rings: Ring[]): Part => ({ kind: "tube", rings, skin });
  const arch = along(
    [
      [0.08, -0.5, -0.05],
      [-0.02, -1.2, 0.0],
      [0.85, -1.45, -0.35],
      [0.95, -0.75, -0.7],
    ],
    [0.27, 0.25, 0.23, 0.22, 0.2],
    11,
    rx,
  );
  return [
    tube(arch),
    tube(rising([0.18, -1.15, -0.06], -0.35 + sway(0), 0.1, rx, rise)),
    tube(rising([0.42, -1.28, -0.16], -0.05 + sway(1), 0.085, rx, rise)),
    tube(rising([0.66, -1.3, -0.28], 0.3 + sway(2), 0.08, rx, rise)),
    tube(rising([-0.75, -0.9, -0.2], -0.35 + sway(3), 0.18, rx, rise)),
    tube(rising(RV_TOP, -0.65 + sway(4), RV_TOP_R / 1.25, rx, rise)),
  ];
}

/** THE FILAMENT's heart as a rig about its middle, `rx` pixels to a unit, squeezed as `sq` says and flushed `flush` steps red. */
export function filamentHeartRig(
  rx: number,
  sq: HeartSqueeze,
  flush = 0,
  time = 0,
  rise = RISE,
): Part[] {
  const skins = FLUSHED[Math.max(0, Math.min(FLUSH_STEPS, flush))] ?? FLUSHED[0];
  if (skins === undefined) return [];
  const v = ventricles(rx, sq.ventricles);
  const a = 1 - SQUEEZE_ATRIA * sq.atria;
  const ball = (x: number, y: number, z: number, r: number): Part => ({
    kind: "ball",
    c: { x: x * rx, y: y * rx, z: z * rx },
    r: r * rx,
    skin: skins.atrium,
  });
  return [
    ...vessels(rx, skins.vessel, time, rise),
    ball(0.6, -0.68, -0.35, 0.44 * a),
    ball(-0.62, -0.58, -0.05, 0.47 * a),
    { kind: "tube", rings: v.left, skin: skins.muscle },
    { kind: "tube", rings: v.right, skin: skins.muscle },
  ];
}
