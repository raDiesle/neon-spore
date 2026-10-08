import type { Layout } from "../../../../../packages/render/src/layout.js";
import {
  LEDGER_HALF_W,
  ledgerBodyY,
  type Point,
} from "../../../../../packages/render/src/ledger-shape.js";

/**
 * **COLONY · PLATED** — two drafts off the shape sheet, combined and named:
 * CODE PLATE's slab (`systems.ts`, a superellipse to the fifth, flat-sided
 * and square-shouldered — the made thing the owner's riveted plating asked
 * for) cut down the seam, and COLONY's five small bodies under one skin
 * (`creatures.ts`) as the back, swelling out of the plate's flat side and
 * breathing out of step the way the colony's bodies do. Neither is worn by
 * anything the game draws.
 *
 * Inside the same width as the shipped half — the plate and a lobe at its
 * fullest come to `LEDGER_HALF_W` — because the simulation refuses a bolt up
 * every column the plating covers, and the picture has to cover exactly those.
 */

/** CODE PLATE's exponent: high enough for flat sides and square shoulders. */
const POWER = 5;
/** How much of the half's width is plate, and how much the lobes add to it. */
const PLATE = 0.72;
const LOBE = 0.27;
/** COLONY's count, and how far apart down the back they sit. */
const BODIES = 5;
/** A lobe's reach down the back, as a share of the space each one has. */
const LOBE_SPAN = 0.62;
/** Points sampled down the back: enough for five round lobes on a phone. */
const SAMPLES = 40;

export function platedBack(
  l: Layout,
  seamX: number,
  side: -1 | 1,
  gap: number,
  time: number,
): Point[] {
  const { top, bottom, mid, ry } = ledgerBodyY(l);
  const inner = seamX + side * gap * 0.5;
  const w = l.tile * LEDGER_HALF_W;
  const step = (bottom - top) / BODIES;
  const lobeAt = (y: number): number => {
    let most = 0;
    for (let i = 0; i < BODIES; i++) {
      const d = (y - (top + step * (i + 0.5))) / (step * LOBE_SPAN);
      if (Math.abs(d) >= 1) continue;
      // The colony's bodies breathe slightly out of step (`forms/cluster.ts`).
      const breath = 1 + 0.06 * Math.sin(time * 1.4 + i * 2.3);
      most = Math.max(most, Math.sqrt(1 - d * d) * breath);
    }
    return most;
  };
  const pts: Point[] = [
    { x: inner, y: (top + mid) * 0.5 },
    { x: inner, y: top },
  ];
  for (let i = 1; i < SAMPLES; i++) {
    const a = -Math.PI / 2 + (i / SAMPLES) * Math.PI;
    const c = Math.cos(a);
    const s = Math.sin(a);
    const r = (Math.abs(c) ** POWER + Math.abs(s) ** POWER) ** (-1 / POWER);
    const y = mid + ry * s * r;
    // The lobes swell off the flat of the plate and fade into its shoulders.
    const out = w * (PLATE * c * r + LOBE * lobeAt(y) * Math.sqrt(c));
    pts.push({ x: inner + side * out, y });
  }
  pts.push({ x: inner, y: bottom }, { x: inner, y: (mid + bottom) * 0.5 });
  return pts;
}
