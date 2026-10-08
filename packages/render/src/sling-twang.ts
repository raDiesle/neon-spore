import type { SimConfig, SimEvent, SlingState } from "@neon-spore/sim";
import { bodyLife } from "./motion-life.js";
import { phaseInto } from "./phase-into.js";

/**
 * **THE SLING's tines ring out after a true loose**
 * (`docs/spec/living-bosses.md`, the rollout's step 11, the mechanisms'
 * hinged parts): the step a loose answers ends in the fork's rest, and
 * through that rest the two tines swing about the crotch like a struck
 * fork, mirrored, their tips travelling more than half a tile on the first
 * swing and dying to nothing as the rest runs out.
 *
 * **An event, not an idle drift.** VERSUS `sling:tine` — a tine springing a
 * few degrees all the time — was dropped on 27 September 2026 as too small
 * to see (`tools/versus/DECIDED.md`); this one is big and happens once, and
 * only when a loose was true. **Read off the rest's own beat**
 * (`s.phaseBeat`), so both screens ring together; what the simulation does
 * not keep — that a loose and not a shot or a spring began the rest — is
 * kept here, from the events, and cleared by every other way a step ends.
 * **Gone before the next draw is asked for**: the rest is the whole ring,
 * and a tine is a seat's draw handle once the next step lights. Not hushed
 * by THE SLOW: a loose closes the window, and a ring hushed as it opens
 * would be the September swing again.
 */

/** The first swing's reach, in radians: a tip 1.24 tiles out travels well over half a tile. */
export const SLING_TWANG = 0.6;
/** Swings across the rest. */
const RINGS = 2.5;

/** Whether the rest standing now began with a true loose: set by the loose, cleared by anything else that ends or lights a step. */
export class SlingRing {
  rung = false;

  ingest(events: readonly SimEvent[]): void {
    for (const e of events) {
      if (e.type === "slingLoose") this.rung = true;
      else if (
        e.type === "slingLight" ||
        e.type === "slingHit" ||
        e.type === "slingMiss" ||
        e.type === "slingSpring" ||
        e.type === "slingDim" ||
        e.type === "slingCool"
      )
        this.rung = false;
    }
  }

  clear(): void {
    this.rung = false;
  }
}

/** The pilot's tine's ring at `beat` and `beatPhase`, in canvas radians; the navigator's is its mirror. */
export function slingTwang(
  s: SlingState,
  cfg: Pick<SimConfig, "slingRestBeats">,
  rung: boolean,
  beat: number,
  beatPhase: number,
): number {
  if (!rung || s.phase !== "rest") return 0;
  const life = bodyLife();
  const t = phaseInto(s, beat, beatPhase) / Math.max(1, cfg.slingRestBeats);
  if (life <= 0 || t >= 1) return 0;
  return life * SLING_TWANG * (1 - t) ** 2 * Math.sin(t * RINGS * Math.PI * 2);
}

/** Tine `side`'s own turn for a ring of `ring`: the pilot's as rung, the navigator's mirrored. */
export function slingTineTurn(side: 0 | 1, ring: number): number {
  return side === 0 ? ring : -ring;
}

/** Point `p`, laid about the crotch, carried round with tine `side` by a ring of `ring`. */
export function slingRung(p: { x: number; y: number }, side: 0 | 1, ring: number) {
  const a = slingTineTurn(side, ring);
  const c = Math.cos(a);
  const n = Math.sin(a);
  return { x: p.x * c - p.y * n, y: p.x * n + p.y * c };
}
