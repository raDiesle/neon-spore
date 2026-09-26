import { isWardable, type SimEvent } from "@neon-spore/sim";
import type { Arrivals } from "./arrivals.js";
import type { BossStrikeFx } from "./boss-strike-fx.js";
import { breachHue } from "./breach-hue.js";
import type { DeflectFx } from "./deflect.js";
import { type Layout, tileCX } from "./layout.js";
import { PALETTE } from "./palette.js";
import type { RockImpactFx } from "./rock-impact.js";
import { rockRadius } from "./rock-size.js";

/**
 * What a breach looks like — the one event whose answer is not a burst at a
 * point, because the thing that caused it may not have arrived yet.
 *
 * Its own file because `effects.ts` reached the 250-line ceiling and this is
 * the seam: everything here is about **the gap between the sim resolving a hit
 * and the picture of it landing**, which is a subject of its own. Nothing else
 * in `Effects` has that problem.
 *
 * The gap is real for anything still in the air. A rock's sparks and crack
 * wait for `rock-impact.ts` to bring it down — and when the rock has already
 * been drawn landing in the skin (`landing.ts`), that wait is one frame
 * and the hole, the sparks and the crack all show as it is seen in it; a
 * living creature falls one tile a beat, is already at the hull when the
 * event arrives, and fires now.
 *
 * A deflection has exactly the same gap and is here for exactly that reason:
 * the bounce has to wait for the rock too, and the two are one subject.
 */
export interface BreachParts {
  /** Sparks thrown from a point, in a colour. `Effects` owns the particles. */
  burst: (x: number, y: number, n: number, hex: string) => void;
  rockImpactFx: RockImpactFx;
  arrivals: Arrivals;
  /** Whether a torch drags its streak from the top of the field into the
   * hull. False for one thrown out of THE COIL's dome, whose own line
   * `coil-flight.ts` keeps lit behind it; a fall it never made would be drawn
   * over it. */
  tail?: boolean;
  /** A boss's own blow, for a breach that names its boss (`boss-strike-fx.ts`). */
  bossStrike?: BossStrikeFx;
}

export function ingestBreach(
  e: Extract<SimEvent, { type: "breach" }>,
  l: Layout,
  time: number,
  beatSeconds: number,
  parts: BreachParts,
): void {
  // **THE FENCE, and the one breach in the game that does not break the skin.**
  // A wall does not strike the ship: it is a live wire, and one that finds the
  // dome in its way earths through it. So the burst is thrown in the wall's own
  // blue rather than the red everything else reaching the hull gets — an impact
  // is drawn in the colour of the thing that made it — and there is no scar
  // behind this event for a crack to hang from either (`breachUnscarred`,
  // sim/hull-damage.ts). What it costs instead is the shield's line, put out in
  // places: `shield-outage.ts`, fed from `RenderState` because it is drawn over
  // the hull and everything this file feeds goes under it.
  if (e.kind === "fence") {
    parts.burst(tileCX(l, e.col), l.hullY, 22, breachHue(e.kind, e.color));
    return;
  }
  // **THE GUM is the second**, and the other way round: it breaks the hull
  // and still leaves no scar, because what a drop does to plating is a
  // wetting rather than a crack. The burst is thrown in its own venom, and
  // the splash — the smear and the ripples across the whole ship — is
  // `gum-splash.ts`, fed from `RenderState` for the fence's reason.
  if (e.kind === "gum") {
    parts.burst(
      tileCX(l, e.col + (e.span - 1) / 2),
      l.hullY,
      18 * e.span,
      breachHue(e.kind, e.color),
    );
    return;
  }
  // `isWardable` rather than `isMeteorKind`: THE VOLLEY is a rock the shield
  // answers, and a shell nobody warded arrives as the rock it looks like — the
  // fall replay and the crack that waits for it, not a burst at the hull.
  if (!isWardable(e.kind)) {
    parts.burst(tileCX(l, e.col), l.hullY, 16 * e.span, breachHue(e.kind, e.color));
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
    const hue = breachHue(e.kind, e.color);
    parts.burst(ax - r * 0.8, ay, 24 * e.span, hue);
    parts.burst(ax + r * 0.8, ay, 24 * e.span, hue);
    // A third, tighter burst out of the crater itself, so the middle of the
    // impact is not the one empty part of it.
    parts.burst(ax, ay, 16 * e.span, PALETTE.ember);
    // Only now does this rock's own crack get to show.
    parts.arrivals.mark(loCol, span, e.beat);
  };
  // **A boss's window ran out**: the boss struck, and no rock fell. The same
  // landing, thrown when its own blow reaches the hull (`sim/boss-strike.ts`).
  if (e.by !== undefined && parts.bossStrike) {
    parts.bossStrike.spawn(e.by, e.col, beatSeconds, arrive, e.blow);
    return;
  }
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
    parts.tail ?? true,
    e.seed,
    e.holes,
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
  const bounce = (ax: number, ay: number): void => {
    // The kind, the span, the seed and the craters: every half of "it is
    // still the same rock" — the width it was drawn at all the way down, the
    // torch's ember ring, and the look the pair watched fall (`deflect.ts`).
    parts.deflectFx.spawn(ax, ay, l.tile, e.span, e.kind, e.seed, e.holes);
    parts.burst(ax, ay, 26 * e.span, PALETTE.shieldRim);
    parts.onDeflect();
  };
  const { kind, span, fromRow, seed, holes } = e;
  parts.rockImpactFx.spawn(
    x,
    l,
    time,
    beatSeconds,
    kind,
    span,
    fromRow,
    false,
    bounce,
    true,
    seed,
    holes,
  );
}
