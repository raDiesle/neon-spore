import {
  type Frame,
  type Ring,
  ringNormal,
  SIDE,
  seeTube,
  tubeFrames,
  turn as turn3,
  type View,
  view,
} from "@neon-spore/content";
import { INSTAR_BODY } from "./instar-body-look.js";
import { instarFarEnd } from "./instar-far-end.js";
import { frontWings } from "./instar-front.js";
import { frontBody } from "./instar-front-body.js";
import type { Point } from "./instar-place.js";
import type { Look } from "./instar-plate.js";
import { heading, profileLines, profileWings, type WingSeat } from "./instar-profile.js";
import { type Body, bodyOf, place } from "./instar-profile-surface.js";
import { rolledBack } from "./instar-roll.js";
import { BODY_LENS, instarNeck, instarTurn } from "./instar-turn.js";
import type { Layout } from "./layout.js";

/**
 * **THE INSTAR turning between its two views is one body turning** — the
 * owner, 7 October 2026: *when it's switching the view from front to side it
 * looks very strange and unnatural, like it's replaced and not just moving
 * perspective*. It was: across the middle of the turn the face-on drawing
 * faded out while the side-on one faded in, two ghosts of one dragon going
 * different ways.
 *
 * Now there is one body. Both views already build it on the rig — face-on a
 * tube going back into depth (`frontBody`), side-on a tube along the spine
 * (`bodyOf`) — so `k` of the way through the handover each ring sits `k` of
 * the way from where face-on has it to where side-on has it, in the model,
 * and the view it is seen through yaws the same share of the way round, its
 * lens easing out to side-on's flat one. The wings' shoulders and turns, the
 * tail's root and the legs' size go with it, and the back rolls round from
 * where face-on has it to where side-on has it (`instar-roll.ts`). At `k = 1`
 * it is the side view exactly, and at `0` the face-on body.
 *
 * Where the side view's spine doubles back, the mixed spine folds for a
 * fiftieth of the turn and the hide's spines swing round its fold in a few
 * ticks — fast, but no part of the body is ever cut from one place to another
 * (`test/instar-turning.test.ts`).
 *
 * Everything is about the face-on neck, so the side view's places are taken
 * relative to it and nothing jumps when the model is mixed.
 */
export interface Turned {
  spine: Point[];
  top: Point[];
  bottom: Point[];
  rear: Point;
  seats: readonly Point[];
  /** The body on the rig, seen about `origin`. */
  body: Body;
  origin: Point;
  /** The way the body runs at its rear, and how large its tail and legs are drawn against side-on. */
  heading: Point;
  near: (u: number) => number;
  tailNear: number;
  wings: [WingSeat, WingSeat];
}

/** The body `k` of the way from face-on (0) to side-on (1) this frame. */
export function turnedLines(l: Layout, look: Look, k: number): Turned {
  const side = profileLines(l, look);
  const { top, bottom, rear, spine, seats } = side;
  if (k >= 1) {
    const body = bodyOf(top, bottom);
    const wings = profileWings(top, rear, look.r);
    const one = () => 1;
    return {
      ...side,
      body,
      origin: { x: 0, y: 0 },
      heading: heading(spine),
      near: one,
      tailNear: 1,
      wings,
    };
  }
  const { f, head, r } = look;
  const neck = instarNeck(head, r);
  const front = frontBody(look, neck, instarFarEnd(l, f), instarTurn(f.side));
  const sideBody = bodyOf(top, bottom);
  const n = spine.length;
  const rings: Ring[] = resample(front.rings, n).map((g, i) => {
    const s = sideBody.rings[i] as Ring;
    const c = { x: s.c.x - neck.x, y: s.c.y - neck.y, z: 0 };
    return {
      c: { x: mix(g.c.x, c.x, k), y: mix(g.c.y, c.y, k), z: mix(g.c.z, c.z, k) },
      r: mix(g.r, s.r, k),
    };
  });
  const w = view(mix(front.w.yaw, SIDE, k), 0, eased(r * BODY_LENS, k));
  const frames = tubeFrames(rings);
  const fronts = tubeFrames(resample(front.rings, n));
  const back = rolledBack(fronts, sideBody.frames, sideBody.upright, frames, k);
  // `π/2` off the back faces the player, as either view has it.
  const f0 = frames[0] as Frame;
  const flank = ringNormal(f0, (back[0] ?? 0) + Math.PI / 2);
  const body: Body = {
    rings,
    frames,
    seen: seeTube(rings, frames, w),
    side: turn3(flank, w).z >= 0 ? 1 : -1,
    upright: true,
    back,
    w,
  };
  const on = (a: number) => (i: number) => {
    const p = place(body, i, a);
    return { x: neck.x + p.x, y: neck.y + p.y };
  };
  const centres = body.seen.map((g) => ({ x: neck.x + g.c.x, y: neck.y + g.c.y }));
  // The side view's own two edges are drawn, not its tube's: the turn ends on them.
  const edge = (a: number, line: readonly Point[]) =>
    centres.map((_, i) => {
      const p = on(a)(i);
      const q = line[i] as Point;
      return { x: mix(p.x, q.x, k), y: mix(p.y, q.y, k) };
    });
  const backs = edge(0, top);
  const bellies = edge(Math.PI, bottom);
  // As `frontLimbs` sizes them face-on: against the girth they hang from.
  const frontNear = (u: number) =>
    (front.seen[Math.round(u * (front.seen.length - 1))]?.r ?? 0) / (r * INSTAR_BODY.girth(u));
  return {
    spine: centres,
    top: backs,
    bottom: bellies,
    rear: centres[n - 1] as Point,
    seats,
    body,
    origin: neck,
    heading: heading(centres),
    near: (u) => mix(frontNear(u), 1, k),
    tailNear: mix(frontNear(1), 1, k),
    wings: mixWings(frontWings(look), profileWings(top, rear, r), k),
  };
}

/** Over which share of the turn the face-on head gives way to the side-on one. */
const HEAD_FROM = 0.35;
const HEAD_SPAN = 0.3;

/** How much of the head drawn `k` of the way round is the side-on one: the one thing still crossed, over the middle of the turn where it moves fastest. */
export function sideHead(k: number): number {
  return Math.min(1, Math.max(0, (k - HEAD_FROM) / HEAD_SPAN));
}

/** The two wings' seats `k` of the way from face-on to side-on. */
function mixWings(
  a: [WingSeat, WingSeat],
  b: [WingSeat, WingSeat],
  k: number,
): [WingSeat, WingSeat] {
  const one = (p: WingSeat, q: WingSeat): WingSeat => ({
    at: { x: mix(p.at.x, q.at.x, k), y: mix(p.at.y, q.at.y, k) },
    w: mixView(p.w, q.w, k),
    hinge: {
      x: mix(p.hinge.x, q.hinge.x, k),
      y: mix(p.hinge.y, q.hinge.y, k),
      z: mix(p.hinge.z, q.hinge.z, k),
    },
    side: q.side,
  });
  return [one(a[0], b[0]), one(a[1], b[1])];
}

function mixView(a: View, b: View, k: number): View {
  const lens = Number.isFinite(b.lens) ? mix(a.lens, b.lens, k) : eased(a.lens, k);
  return view(mix(a.yaw, b.yaw, k), mix(a.pitch, b.pitch, k), lens);
}

/** A lens `lens` eased out to none, the eye going back to infinity as `k` runs to 1. */
function eased(lens: number, k: number): number {
  return k >= 1 ? Number.POSITIVE_INFINITY : lens / (1 - k);
}

function mix(a: number, b: number, k: number): number {
  return a + (b - a) * k;
}

/** `rings` resampled to `n`, evenly along their run. */
function resample(rings: readonly Ring[], n: number): Ring[] {
  const m = rings.length - 1;
  return Array.from({ length: n }, (_, i) => {
    const s = (i / (n - 1)) * m;
    const j = Math.min(m - 1, Math.floor(s));
    const t = s - j;
    const a = rings[j] as Ring;
    const b = rings[j + 1] as Ring;
    return {
      c: { x: mix(a.c.x, b.c.x, t), y: mix(a.c.y, b.c.y, t), z: mix(a.c.z, b.c.z, t) },
      r: mix(a.r, b.r, t),
    };
  });
}
