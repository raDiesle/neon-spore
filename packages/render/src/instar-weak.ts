import { type InstarState, instarActing, instarMarkDone, instarStep } from "@neon-spore/sim";
import { heartLight } from "./heartbeat.js";
import { PALETTE } from "./palette.js";
import { lightWithin } from "./part-light.js";

/**
 * **The part to shoot glows red** — the owner, 27 September 2026: *the
 * element of the body to shoot must glow very red, so it can be understood
 * as the fragile part of the boss to damage.* While a shoot mark's window is
 * open, the part it names — the eyes, the eggs, the tail or the heart — is
 * lit red from inside, beating like a heart (`heartbeat.ts`), and the light
 * goes out when every shoot mark on that part is done.
 *
 * **Inside the part, never round it** — the owner, 2 October 2026, for every
 * boss: *only let the part of body shape glow red, but not so heavy and no
 * glowing outside. and the borders should not be red.* Until that day this
 * was a strong red stroke along the part's outline with a bloom half again
 * as wide as a rim's round it. It is now `lightWithin` (`part-light.ts`): the
 * part's own drawing — the eye's iris, the eggs' shells — still reads under
 * it, and its edge keeps its own colour. The whole-body red wash is still the
 * hurt's (`boss-hurt.ts`), for half a second after a blow.
 *
 * Only the parts a shoot mark can name have an outline to glow along.
 */
export const WEAK_PARTS = ["eye", "eggs", "tail", "heart"] as const;
export type WeakPart = (typeof WEAK_PARTS)[number];

/** How hard each part glows this frame, 0..1 — nought for every part not shot at now. */
export type InstarWeak = Readonly<Record<WeakPart, number>>;

export const NO_WEAK: InstarWeak = { eye: 0, eggs: 0, tail: 0, heart: 0 };

/**
 * Which parts a live shoot mark names on this step, each at the beat's pulse.
 * A part two marks name — both eyes, both nests, the tail's two blades —
 * glows until the last of them is done.
 */
export function instarWeak(s: InstarState, beatPhase: number): InstarWeak {
  if (!instarActing(s)) return NO_WEAK;
  const step = instarStep(s);
  if (step === null) return NO_WEAK;
  const pulse = heartLight(beatPhase);
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
 * How the light is laid in a part's outline. Swapped by the test that finds
 * which part it was drawn on (`instar-weak.test.ts`), the way the other looks
 * are.
 */
export const WEAK_LOOK: {
  paint: (ctx: CanvasRenderingContext2D, outline: Path2D, k: number, part: WeakPart) => void;
} = {
  paint: (ctx, outline, k) => lightWithin(ctx, outline, PALETTE.red, k * 0.6),
};

/** The part's light inside `outline`, if it has one this frame. */
export function drawWeak(
  ctx: CanvasRenderingContext2D,
  outline: Path2D,
  k: number,
  part: WeakPart,
): void {
  if (k <= 0) return;
  WEAK_LOOK.paint(ctx, outline, k, part);
}
