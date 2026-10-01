import { DEG, idleDrift } from "./idle-drift.js";
import { glance, type PartAngles, partDrift, partOwn, partSeed } from "./idle-drift-parts.js";
import type { Point } from "./instar-place.js";
import type { Figure } from "./instar-shape.js";

/**
 * **THE INSTAR's parts drift on their own** (`docs/spec/living-bosses.md` §1,
 * "Every part moves on its own"): on top of the body's turn
 * (`instar-drift.ts`) the head cocks about its neck, the jaw breathes open
 * a few degrees, the eyes glance ahead of the head, each wing wanders on its
 * own shoulder and the tail swings about its root — seven parts, under the
 * spec's eight. The horns and the claws ride their parents and have no
 * seed of their own.
 *
 * Every angle here is the part's **on its parent**, the parent's own taken
 * off — the drawer has already turned the body, so what it adds is only what
 * the part did differently (`idle-drift-parts.ts` `partDrift`).
 *
 * Side-on a nod and a cock are both turns in the plane we see, so the head's
 * and the tail's tilt and rotate are added into one angle there (`headPlane`,
 * `tailPlane`); the head's turn joins the yaw it is drawn at (`headTurn`).
 * The tail's turn is dropped: the tail is drawn flat on the body's plane and
 * has no yaw to take it.
 */
export interface InstarParts {
  /** The head's turn about its neck, on top of the body's and its own drift, radians. */
  readonly headTurn: number;
  /** The head cocked about its neck in the plane we see, radians. */
  readonly headPlane: number;
  /** How far the jaw is breathed open, radians, never shut past the gesture's. */
  readonly jaw: number;
  /** Where both pupils look, in eye radii. */
  readonly glance: { readonly x: number; readonly y: number };
  /** The near wing's and the far one's angles on their shoulder anchor, radians. */
  readonly wings: readonly [WingDelta, WingDelta];
  /** The tail swung about its root in the plane we see, radians. */
  readonly tailPlane: number;
  /** The neck and the tail root the cocks turn about, in thousandths of the field, swing included. */
  readonly headXMilli: number;
  readonly headYMilli: number;
  readonly headRMilli: number;
  readonly rearXMilli: number;
  readonly rearYMilli: number;
}

export interface WingDelta {
  readonly yaw: number;
  readonly pitch: number;
  readonly roll: number;
}

/** THE INSTAR's seed, `instar-drift.ts`'s. */
const SEED = 163;
/** Links the tail's swing is carried down. */
const TAIL_LINKS = 3;
/** Each part's index for `partSeed`: the tail's links are the last three. */
const SEAT = { head: 0, jaw: 1, nearWing: 2, farWing: 3, tail: 4 } as const;

const minus = (a: PartAngles, b: PartAngles): PartAngles => ({
  turn: a.turn - b.turn,
  tilt: a.tilt - b.tilt,
  rotate: a.rotate - b.rotate,
});
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** The parts this frame, at `hush` — the body's, so a hushed body hushes all of it. */
export function instarParts(
  time: number,
  hush: number,
  f: Figure,
  sway: { xMilli: number; yMilli: number },
): InstarParts {
  const body = (t: number): PartAngles => {
    const d = idleDrift(t, SEED, hush);
    return { turn: d.yaw, tilt: d.pitch, rotate: d.roll };
  };
  const neck = (t: number): PartAngles => {
    const d = idleDrift(t, SEED, hush);
    return { turn: d.yaw + d.headYaw, tilt: d.pitch, rotate: d.roll };
  };
  const head = minus(partDrift(time, partSeed(SEED, SEAT.head), "head", neck, hush), neck(time));
  const wing = (seat: number, letGo: number): WingDelta => {
    const d = minus(
      partDrift(time, partSeed(SEED, seat), "wing", body, hush, { letGo }),
      body(time),
    );
    return { yaw: d.turn, pitch: d.tilt, roll: d.rotate };
  };
  // A wing the script spreads is the gesture's; a jaw the script opens is too,
  // and side-on it is held a third to a half open, so the breath fades by it.
  const spread = 1 - 0.7 * f.wing;
  const shut = clamp01(1 - (f.jawUp + f.jawDown));
  const jaw = partOwn(time, partSeed(SEED, SEAT.jaw), "jaw").tilt * DEG * hush * shut;
  return {
    headTurn: head.turn,
    headPlane: head.tilt + head.rotate,
    jaw,
    glance: glance(time, SEED, hush),
    wings: [wing(SEAT.nearWing, spread), wing(SEAT.farWing, spread)],
    tailPlane: tailPlane(time, hush, body),
    headXMilli: f.headX + sway.xMilli,
    headYMilli: f.headY + sway.yMilli,
    headRMilli: f.headR * (1 + 0.25 * f.reach),
    rearXMilli: f.rearX + sway.xMilli,
    rearYMilli: f.rearY + sway.yMilli,
  };
}

/** The tail's tip on the body, each link following the one before it late and less. */
function tailPlane(time: number, hush: number, body: (t: number) => PartAngles): number {
  let parent = body;
  for (let link = 0; link < TAIL_LINKS; link++) {
    const above = parent;
    const seed = partSeed(SEED, SEAT.tail + link);
    const opts = { link, links: TAIL_LINKS };
    parent = (t) => partDrift(t, seed, "tail", above, hush, opts);
  }
  const d = minus(parent(time), body(time));
  return d.tilt + d.rotate;
}

/** The canvas turned `a` about `c`: what `rotateAbout` does to a point. */
export function cockAbout(ctx: CanvasRenderingContext2D, c: Point, a: number): void {
  ctx.translate(c.x, c.y);
  ctx.rotate(a);
  ctx.translate(-c.x, -c.y);
}
