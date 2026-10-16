import type { ControlSet } from "@neon-spore/content";
import { mirrorHoldsControls, shieldAsked, suckAsked, type World } from "@neon-spore/sim";
import { paintEmberIn } from "./aim-ember.js";
import { bandControlSet } from "./band.js";
import { controlLobes } from "./band-lobes.js";
import type { BossCue } from "./boss-cue-shape.js";
import { cueBreath, cueHelper } from "./cue-helper.js";
import { halo } from "./glow.js";
import type { Circle, Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * **The SHIELD and SUCK buttons, lit with the shot's mark when something is
 * asking for them** — the fire button's EMBER (`fire-button-mark.ts`), in the
 * button's own colour. The owner, 16 October 2026: *when the shield or cannon
 * is below a boss tile vertical or an enemy which requires shield, then also
 * the button should highlight, like we do for cannon shot button on a boss if
 * a crosshair is shown … for shield and suck, show it also for regular waves,
 * whenever vertical.*
 *
 * Two ways in, and either lights it: a boss's cue saying the word
 * (`cueHelper`, the reading that already draws the button face at the mark),
 * or the field itself — a body the dome answers in the shield's column, a
 * cargo falling inside the mouth's reach (`shieldAsked`, `suckAsked`). A band
 * THE MIRROR is holding draws nothing, as the fire button's does not.
 */

type Ask = "guard" | "intake";

const HUES: Record<Ask, { hex: string; rim: string }> = {
  guard: { hex: PALETTE.shield, rim: PALETTE.shieldRim },
  intake: { hex: PALETTE.pod, rim: PALETTE.podRim },
};

/** The buttons each ask lights: THE THROAT's pair are the same two presses. */
const IDS: Record<Ask, readonly string[]> = {
  guard: ["guard", "throatShield"],
  intake: ["intake", "mawTake", "throatSuck"],
};

export function drawShipButtonMarks(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  cue: BossCue | null,
  time: number,
  controls?: ControlSet,
): void {
  const k = cueBreath(time);
  for (const { circle, ask } of markedShipButtons(l, world, cue, controls)) {
    const hues = HUES[ask];
    halo(ctx, circle.x, circle.y, circle.r * 1.9, hues.hex, 0.35 * k);
    paintEmberIn(ctx, circle.x, circle.y, circle.r, k, time, hues);
  }
}

/** The SHIELD and SUCK buttons on this screen something is asking for. */
export function markedShipButtons(
  l: Layout,
  world: World,
  cue: BossCue | null,
  controls?: ControlSet,
): { circle: Circle; ask: Ask }[] {
  if (mirrorHoldsControls(world)) return [];
  const said = cue === null ? null : cueHelper(cue.word);
  const lit = new Set<Ask>();
  if (said === "guard" || shieldAsked(world)) lit.add("guard");
  if (said === "intake" || suckAsked(world)) lit.add("intake");
  if (lit.size === 0) return [];
  const out: { circle: Circle; ask: Ask }[] = [];
  for (const { control, circle } of controlLobes(l, bandControlSet(controls, world))) {
    for (const ask of lit) {
      if (IDS[ask].includes(control.id)) out.push({ circle, ask });
    }
  }
  return out;
}
