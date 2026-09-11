import { globe } from "./recoil-globe.js";
import { drawHoopArc, drawRib } from "./recoil-ribs.js";

/**
 * THE ONE RECORD A CANDIDATE **RECOIL** PATCHES.
 *
 * `warden-look.ts`'s kind. The recoil is a slick or a bulb inside a sprung
 * frame, and the body is not in question: `wornKind` hands it to the ordinary
 * living draw, where `creature:slick` and `creature:bulb` already argue about
 * it. What the pair is asked about here is the **cage** — the ribs, the hoop
 * and the bolts — which shipped as glowing strokes in one plane: a spring
 * drawn as a zigzag line is a diagram of a spring, and a hoop drawn as a
 * circle is a ring with no near side. The seam is the whole frame, so a look
 * is free to draw the ribs as tubes, or as meridians of something round, or
 * as anything else that keeps the count.
 *
 * **The count is the creature, and a look keeps it.** One rib per bounce the
 * body arrived with, one blown open per bounce spent, drawn from the top and
 * going round (`recoil.ts`). A candidate that made the ribs harder to count
 * has changed the mechanic, not the look.
 *
 * **The shipped `springs` came through here with not one pixel moved.** The
 * loop is the one `recoil.ts` carried inline, and the colours, the glow and
 * the breath still arrive worked out from the record's caller. On 11
 * September 2026 the owner decided the slot: GLOBE (`recoil-globe.ts`) is the
 * cage now, and `springs` stays here for the GRAPHICS page's LIBRARY, beside
 * MOONS, FOAM and CALYX, which he kept for an enemy not built yet.
 */

/** Everything the cage is drawn from, in field pixels about `(x, y)`. */
export interface CageDraw {
  readonly ctx: CanvasRenderingContext2D;
  readonly x: number;
  readonly y: number;
  /** The body's own drawn radius, and the hoop's this frame — breathing. */
  readonly inner: number;
  readonly hoop: number;
  /** Ribs the body arrived with, and how many still have a bounce in them.
   * Rib `i` is spent once fewer than `i` remain. */
  readonly struts: number;
  readonly left: number;
  /** 1 on a whole cage, rising toward 2 as the ribs go. */
  readonly strain: number;
  /** The metal stained the body's colour, its dark, and a spent rib's ember —
   * all three hazed for distance already. */
  readonly metal: string;
  readonly dark: string;
  readonly burnt: string;
  /** `strokeGlow` intensity on a live rib, shimmer included. */
  readonly glow: number;
  /** The frame clock, in seconds, and this body's own phase on it. */
  readonly time: number;
  readonly phase: number;
}

/**
 * The cage as it shipped until 11 September 2026: a zigzag leaf from the body
 * to the hoop per rib, the quarter of the hoop it carries and the bolt at its
 * head, every one lit through `strokeGlow`. `recoil-ribs.ts` draws the pieces.
 */
export function springs(d: CageDraw): void {
  const { ctx, x, y, inner, hoop, struts, left, metal, burnt, dark, glow, time } = d;
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (let i = 0; i < struts; i++) {
    const spent = i >= left;
    const a = (i / struts) * Math.PI * 2 - Math.PI / 2;
    const hex = spent ? burnt : metal;
    const lit = spent ? glow * 0.25 : glow;
    drawRib(ctx, x, y, a, inner, hoop, spent, hex, time, lit);
    drawHoopArc(ctx, x, y, a, struts, hoop, spent, hex, dark, lit);
  }
  ctx.restore();
}

export interface RecoilLook {
  /** The frame round the body: ribs, hoop and bolts. Writable, like every
   * field a look goes through: the LIBRARY swaps it for the length of one
   * card and puts it back. */
  cage: (d: CageDraw) => void;
}

/** GLOBE since 11 September 2026 — the owner's pick over `springs`. */
export const RECOIL_LOOK: RecoilLook = { cage: globe };
