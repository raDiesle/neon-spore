import { beatSeconds, type LedgerState, ledgerPhase, type World } from "@neon-spore/sim";
import { IDLE_DRIFT } from "./idle-drift.js";
import { OUTLINE_SEED, outlineDrift } from "./outline-drift.js";
import { slowHush } from "./slow-hush.js";
import { noise1 } from "./solid-motion.js";

/**
 * **THE LEDGER leans on its root** (`docs/spec/living-bosses.md` §1, the
 * outline tier): both halves sheared together about the underside, where the
 * cord is rooted and the seam's mouth opens, so the top of the plating wanders
 * most of a tile either way and the foot does not move. That is seen (*Big
 * enough to be seen*, `docs/looks.md`).
 *
 * **A shear and not a roll**: nothing goes up or down, so the underside a bolt
 * meets and the mouth a shot goes in by stay where the simulation judges them,
 * and the cord's root stays tied. **One lean for both halves**, so the gap
 * between them — the readout — stays the same width all the way up.
 *
 * Nothing a thumb presses is on the plating: every ring is on the cord or the
 * hull. It pays in with the cord as it roots, dies down under THE SLOW, and
 * eases out over the first beat of `out`, where the parting halves are the
 * readout.
 */

/** How far the top of the plating leans at the widest, in tiles. */
export const LEDGER_LEAN = 0.9;
/** How tall the plating stands over its underside, in tiles (`ledger-shape.ts` `RISE` + `DROP`). */
const PLATING = 3.3;

/** The shear this beat: how many pixels across per pixel above the underside. */
export function ledgerLean(world: World, t: LedgerState, beat: number, beatPhase: number): number {
  const k = outlineDrift("ledger");
  if (k <= 0) return 0;
  const { cfg } = world;
  const b = beat + beatPhase;
  const phase = ledgerPhase(t, cfg, beat);
  const along =
    phase === "out"
      ? 1 - Math.min(1, b - t.outBeat)
      : phase === "rooting"
        ? Math.min(1, (b - t.rootBeat) / Math.max(1, cfg.ledgerRootBeats))
        : 1;
  const left = Math.max(0, along) * slowHush(world, beat, beatPhase);
  if (left <= 0) return 0;
  const seconds = b * beatSeconds(cfg);
  const lean = noise1((seconds * 2) / IDLE_DRIFT.roll.period, OUTLINE_SEED.ledger);
  return (k * left * LEDGER_LEAN * lean) / PLATING;
}

/** Where the lean puts `p`, sheared about the underside at `y0`. */
export function ledgerLeaned<P extends { x: number; y: number }>(
  p: P,
  lean: number,
  y0: number,
): P {
  return { ...p, x: p.x + lean * (y0 - p.y) };
}
