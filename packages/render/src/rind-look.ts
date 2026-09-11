import type { CreatureSilhouette } from "@neon-spore/content";
import { type Creature, rindLayersLeft, type SimConfig } from "@neon-spore/sim";
import { burr } from "./rind-burr.js";
import { drawShed } from "./rind-skin.js";

/**
 * THE ONE RECORD A CANDIDATE RIND SHED PATCHES.
 *
 * `magnet-look.ts`, `dart-look.ts`, `crawler-look.ts` and `throb-look.ts` are
 * the files this is the fifth of, and it is here rather than at the bottom of
 * `rind-shed.ts` for their reason: the record needs the paint and the caller
 * needs the record, so the two would import each other.
 *
 * What is different about this one is *what* the look is of. Every record
 * before it is a surface — a thing on a body in every frame. A rind's look is
 * an **event**: the half-second after a shot in which a layer comes off, and
 * outside that half-second the body is an ordinary slick or bulb wearing
 * `living-look.ts`'s answer. So the record holds one drawing and it is a
 * drawing of a moment, judged on whether it reads as a thing losing a skin
 * (`docs/queue.md`, 9 September 2026).
 */

/**
 * One layer coming off, as everything a picture of it could want.
 *
 * `was` and `now` are the two radii the whole event is between — the size the
 * skin came off at and the size the body has now — in screen pixels, off the
 * one rule the grip's ring is drawn at (`creatureRadius`), so no candidate has
 * a second opinion about how big either was. `path` is the contour the body
 * was wearing at the instant, about the origin in contour units, with its
 * wobble frozen there: the body goes on breathing and the skin does not,
 * because it is attached to nothing now. `unit` turns a radius in pixels into
 * that contour's own scale.
 */
export interface RindShed {
  readonly ctx: CanvasRenderingContext2D;
  /** The body's centre this frame — it is still falling while the skin goes. */
  readonly x: number;
  readonly y: number;
  /** The body it came off, for a candidate that spreads a phase by it. */
  readonly id: number;
  /** The contour it wore, about the origin, in contour units. */
  readonly path: Path2D;
  /** What one unit of radius is worth in contour space — `living-draw.ts`'s
   * `scale`, factored out so a radius is all a draw has to think about. */
  readonly unit: number;
  /** The body's own colour, and its rim. */
  readonly hex: string;
  readonly rim: string;
  /** 0..1 across the whole shed. */
  readonly t: number;
  /** The radius the skin came off at, and the one the body has now. */
  readonly was: number;
  readonly now: number;
}

export interface RindLook {
  /** The whole event: the outline it wore and the skin it lost, one frame of it. */
  shed(s: RindShed): void;
  /**
   * The body a rind wears while it still has a layer on, by how many it has
   * left and how many it arrived with — or `null` for the shipped answer,
   * which is the slick or the bulb it will become, at a whole footprint per
   * layer (`livingBodyMul`). The owner asked on 10 September 2026 for a rind
   * that is not a slick: only the colour and the mechanic are fixed, and
   * this is the field a whole other body hangs off. The footprint is not
   * this field's — the size is the health bar and stays `livingBodyMul`'s;
   * a body here is fitted into it by its own `rx`/`ry` like any other.
   *
   * A function of the count rather than one silhouette, because the count is
   * the creature: a rind with two layers on and a rind with one are two
   * states the pair has to tell apart, and a body that reads the count can
   * say so in its rim. Called per frame, so a candidate builds its
   * silhouettes once and hands them back — `walkedSilhouette` samples a
   * contour forty-eight times and is not a per-frame call.
   */
  body: ((left: number, layers: number) => CreatureSilhouette) | null;
}

/** The shipped shed: the old outline crushed onto the new body, and the skin
 * thrown outward as a thinning ring that breaks into plates on the way, in a
 * bloom of the body's own colour. `rind-skin.ts` holds the arithmetic. And no
 * body of its own: a rind is drawn as what it will become. */
export const RIND_LOOK: RindLook = { shed: drawShed, body: burr };

/**
 * The silhouette this rind is drawn with instead of its worn kind's, or
 * `undefined` when it has none — a bare rind is an ordinary body, and so is
 * every rind under the shipped look. `offset` asks about a count other than
 * the one it has: the shed asks for the body it wore one layer ago.
 */
export function rindWears(c: Creature, cfg: SimConfig, offset = 0): CreatureSilhouette | undefined {
  if (c.kind !== "rind" || RIND_LOOK.body === null) return undefined;
  const left = rindLayersLeft(c) + offset;
  if (left <= 0) return undefined;
  return RIND_LOOK.body(left, cfg.rindLayers);
}
