import { type InstarState, instarActing, instarMarkDone, instarStep } from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **The part to shoot glows red** — the owner, 27 September 2026: *the
 * element of the body to shoot must glow very red, so it can be understood
 * as the fragile part of the boss to damage.* While a shoot mark's window is
 * open, the part it names — the eyes, the eggs, the tail or the heart — is
 * stroked a strong red along its own outline, pulsing on the beat, and the
 * glow stops when every shoot mark on that part is done.
 *
 * **It is an outline, never a fill.** The whole-body red wash is the hurt's
 * (`boss-hurt.ts`): a fill and a pale rim for half a second after a blow.
 * This is the part's own edge in the plain red, for as long as the window is
 * open, so the two read as *shoot here* and *that hurt*.
 *
 * Only the parts a shoot mark can name have an outline to glow along.
 */
export const WEAK_PARTS = ["eye", "eggs", "tail", "heart"] as const;
export type WeakPart = (typeof WEAK_PARTS)[number];

/** How hard each part glows this frame, 0..1 — nought for every part not shot at now. */
export type InstarWeak = Readonly<Record<WeakPart, number>>;

export const NO_WEAK: InstarWeak = { eye: 0, eggs: 0, tail: 0, heart: 0 };

/** The glow's low on the beat's far side; the thump lifts it to one. */
const WEAK_REST = 0.55;

/**
 * Which parts a live shoot mark names on this step, each at the beat's pulse.
 * A part two marks name — both eyes, both nests, the tail's two blades —
 * glows until the last of them is done.
 */
export function instarWeak(s: InstarState, beatPhase: number): InstarWeak {
  if (!instarActing(s)) return NO_WEAK;
  const step = instarStep(s);
  if (step === null) return NO_WEAK;
  const pulse = WEAK_REST + (1 - WEAK_REST) * Math.exp(-beatPhase * 4);
  let weak: InstarWeak | null = null;
  step.marks.forEach((m, i) => {
    if (m.gesture !== "shoot" || instarMarkDone(s, i) || !isWeakPart(m.part)) return;
    weak = { ...(weak ?? NO_WEAK), [m.part]: pulse };
  });
  return weak ?? NO_WEAK;
}

function isWeakPart(part: string): part is WeakPart {
  return (WEAK_PARTS as readonly string[]).includes(part);
}

/**
 * How the glow is laid on a part's outline: the red line and a bloom half
 * again as wide as a rim's round it. Swapped by the test that finds which
 * part it was drawn on (`instar-weak.test.ts`), the way the other looks are.
 */
export const WEAK_LOOK: {
  paint: (ctx: CanvasRenderingContext2D, outline: Path2D, k: number, part: WeakPart) => void;
} = {
  paint: (ctx, outline, k) =>
    strokeGlow(ctx, outline, PALETTE.red, STROKE.outline, 2.4 * k, 1, STROKE.glowSpread * 1.6),
};

/** The part's glow along `outline`, if it has one this frame. */
export function drawWeak(
  ctx: CanvasRenderingContext2D,
  outline: Path2D,
  k: number,
  part: WeakPart,
): void {
  if (k <= 0) return;
  WEAK_LOOK.paint(ctx, outline, k, part);
}
