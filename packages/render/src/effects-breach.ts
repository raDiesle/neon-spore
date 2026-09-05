import { type Color, type CreatureKind, isWardable, type SimEvent } from "@neon-spore/sim";
import type { Arrivals } from "./arrivals.js";
import type { DeflectFx } from "./deflect.js";
import { type Layout, tileCX } from "./layout.js";
import { PALETTE } from "./palette.js";
import type { RockImpactFx } from "./rock-impact.js";
import { rockRadius } from "./torch.js";

/**
 * What a breach looks like — the one event whose answer is not a burst at a
 * point, because the thing that caused it may not have arrived yet.
 *
 * Its own file because `effects.ts` reached the 250-line ceiling and this is
 * the seam: everything here is about **the gap between the sim resolving a hit
 * and the picture of it landing**, which is a subject of its own. Nothing else
 * in `Effects` has that problem.
 *
 * The gap is real. A rock is still visibly falling when the simulation says it
 * has hit, so its sparks and its crack wait for `rock-impact.ts` to bring it
 * down; a living creature falls one tile a beat, is already at the hull when
 * the event arrives, and fires now.
 *
 * A deflection has exactly the same gap and is here for exactly that reason:
 * the bounce has to wait for the rock too, and the two are one subject.
 */
export interface BreachParts {
  /** Sparks thrown from a point, in a colour. `Effects` owns the particles. */
  burst: (x: number, y: number, n: number, hex: string) => void;
  rockImpactFx: RockImpactFx;
  arrivals: Arrivals;
}

/** The colour a body's own burst is thrown in: what it was shot with, and
 * `red` for the colourless — a throb, a shell nobody opened, a round that
 * costs the hull with nothing on the field. */
function breachHue(color: Color | null): string {
  return color === "cyan" ? PALETTE.cyan : PALETTE.red;
}

/** A rock's own colour: the torch carries a flame, every other tier is stone. */
function rockHue(kind: CreatureKind): string {
  return kind === "torch" ? PALETTE.ember : PALETTE.rock;
}

export function ingestBreach(
  e: Extract<SimEvent, { type: "breach" }>,
  l: Layout,
  time: number,
  beatSeconds: number,
  parts: BreachParts,
): void {
  // `isWardable` rather than `isMeteorKind`: THE VOLLEY is a rock the shield
  // answers, and a shell nobody warded arrives as the rock it looks like — the
  // fall replay and the crack that waits for it, not a burst at the hull.
  if (!isWardable(e.kind)) {
    parts.burst(tileCX(l, e.col), l.hullY, 16 * e.span, breachHue(e.color));
    return;
  }
  // The event carries the width the body actually had — `colSpan(e.kind)`
  // would answer for the kind and miss a plain tier authored two tiles wide.
  const span = e.span;
  const r = rockRadius(l, span);
  const loCol = Math.round(e.col - (span - 1) / 2);
  // Bursts flanking the crater rather than one on top of it: sparks fly off
  // the rim the rock tore, not out of thin air at its centre.
  const arrive = (ax: number, ay: number): void => {
    // A rock is the heaviest thing that reaches the hull and it now lands like
    // it: three times the sparks a body throws, in the rock's own colour
    // rather than red — the torch's ember, everything else's stone. Red said
    // "damage" where the rock in front of the player said stone, and the two
    // readings fought.
    const hue = rockHue(e.kind);
    parts.burst(ax - r * 0.8, ay, 24 * e.span, hue);
    parts.burst(ax + r * 0.8, ay, 24 * e.span, hue);
    // A third, tighter burst out of the crater itself, so the middle of the
    // impact is not the one empty part of it.
    parts.burst(ax, ay, 16 * e.span, PALETTE.ember);
    // Only now does this rock's own crack get to show.
    parts.arrivals.mark(loCol, span, e.beat);
  };
  parts.rockImpactFx.spawn(
    tileCX(l, e.col),
    l,
    time,
    beatSeconds,
    e.kind,
    span,
    e.fromRow,
    true,
    arrive,
  );
}

/**
 * A rock turned at the shield's surface. Same lateness as a breach, so the
 * bounce waits for the rock — and `embed: false`, because a deflected rock
 * bounces off rather than sinking in.
 */
export function ingestDeflect(
  e: Extract<SimEvent, { type: "deflect" }>,
  l: Layout,
  time: number,
  beatSeconds: number,
  parts: BreachParts & { deflectFx: DeflectFx; onDeflect: () => void },
): void {
  const x = tileCX(l, e.col);
  parts.rockImpactFx.spawn(x, l, time, beatSeconds, e.kind, e.span, e.fromRow, false, (ax, ay) => {
    // The kind as well as the span: both halves of "it is still the same
    // rock" — the width it was drawn at all the way down, and the torch's
    // ember ring (`deflect.ts`).
    parts.deflectFx.spawn(ax, ay, l.tile, e.span, e.kind);
    parts.burst(ax, ay, 26 * e.span, PALETTE.shieldRim);
    parts.onDeflect();
  });
}
