import type { Point } from "@neon-spore/content";

/**
 * A **part** is a secondary form attached to somebody else's rim: a tentacle,
 * a spore, a crystal, a fin. It is not a body and never appears on its own.
 *
 * The catalogue has spent a long time answering "what shape is this creature"
 * with one closed contour per creature, which is right for the field — a body
 * at 26 px is its outline and nothing else. It is the wrong unit for *drawing*
 * though, because it makes every new silhouette a new drawing. A base blob and
 * a handful of parts is the same picture built out of pieces that are already
 * decided, which is what `docs/asset-catalogue.md` has wanted since the first
 * session that drew two creatures that differed by their fringe.
 *
 * Three properties are what make a part a part rather than a small shape:
 *
 * - **It is authored in its own frame.** Local `+x` is straight out of the
 *   body, local `+y` runs along the rim, and one local unit is the body's own
 *   radius at the attachment point. So a part carries no absolute size and no
 *   absolute bearing: `place` in `geometry.ts` gives it both, which is why
 *   every one of them rotates, mirrors, scales and repeats for free.
 * - **It knows the time and its own phase.** A rim of eight identical spines
 *   moving together reads as one machine; the same eight on eight phases reads
 *   as alive. Nothing else in the tool decides that, so each part sways on
 *   `t + phase` and the composer hands out the phases.
 * - **It returns closed loops, not a path.** `Subject.loopsAt` already exists
 *   for the bodies that come apart, and a body wearing detached spores *is* a
 *   body that has come apart — so a grown subject is exactly the base loop
 *   followed by every part's loops, with no new machinery underneath it.
 */
export interface Site {
  /** Where on the rim it is attached, in the body's own units. */
  x: number;
  y: number;
  /** Straight out of the body there, in radians. */
  out: number;
  /** The body's radius at that point — one local unit. */
  scale: number;
}

export interface PartCtx {
  /** Seconds on the page clock, the same one the contour is sampled at. */
  t: number;
  site: Site;
  /** Multiplier on the part's authored size. */
  size: number;
  /** Its own place in the sway, so repeats never move together. */
  phase: number;
  /**
   * How hard the host is squeezing right now, 0 to 1 — or how hard it was
   * squeezing `lag` beats ago, which is the argument that matters.
   *
   * Zero forever on a host that does not swim, so a part may call it without
   * asking. A part that hangs under a bell asks for it at a delay, and at a
   * *longer* delay the further along itself it looks: the wave that runs down
   * a tentacle is the same wave that left the bell, later. See `swim.ts` for
   * why this is a contour's business rather than a pose's.
   */
  pulse: (lag?: number) => number;
  /** Mirrored along the rim: +1 as authored, -1 flipped. */
  flip: 1 | -1;
}

/**
 * One part, drawn at one moment, as closed loops in its **own** frame — the
 * composer places them. A part that placed itself would be a part that could
 * not be repeated round a rim.
 */
export type Part = (c: PartCtx) => Point[][];

/**
 * What the sheet groups by. The question a person browsing asks is "what kind
 * of thing do I want hanging off this", and the answers are *something that
 * reaches*, *something that grows*, *something that is not biology at all*,
 * *something that only bends the outline* — and *something that trails behind
 * a body that swims*, which is the one category defined by a relationship in
 * time rather than by a shape. See `drift.ts`.
 */
export type PartCategory = "reach" | "growth" | "alien" | "rim" | "drift";

export interface PartDef {
  id: string;
  label: string;
  category: PartCategory;
  /** What it does to the silhouette, and what it would animate as. */
  hint: string;
  /**
   * Drawn *inside* the body rather than pushed out to its rim. Off for
   * everything but a vein — see `clampOut` in `grown.ts` for why the default
   * is what it is, and what it costs a part to opt out.
   */
  under?: boolean;
  build: Part;
}
