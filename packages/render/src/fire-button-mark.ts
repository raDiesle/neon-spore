import type { ControlSet } from "@neon-spore/content";
import { type Color, mirrorHoldsControls, type World } from "@neon-spore/sim";
import { emberHues } from "./aim-ember.js";
import { bandControlSet } from "./band.js";
import { controlLobes } from "./band-lobes.js";
import { type BossCue, cueShot } from "./boss-cue-shape.js";
import { AIM_LOOK, cueAim, cueBreath } from "./cue-helper.js";
import { halo } from "./glow.js";
import type { Circle, Layout } from "./layout.js";
import { seatSkin } from "./seat-skin.js";

/**
 * **The fire button a shot's mark is asking for, lit with the same mark** —
 * the owner, 9 October 2026: *whenever we have this visible for a boss in the
 * moment of showing it, the related shoot button must glow. if one player do
 * not see on the screen which colour to use because its part of the boss
 * concept, than both cannon buttons … glow. Can we create a relation of
 * button glow visual and the crosshair visual more … maybe same crosshair
 * around the button.*
 *
 * So while EMBER stands on a target on this screen (`aim-ember.ts`,
 * `cueAim`), EMBER stands round the fire button too, in that button's own
 * colour: the one the mark on the target is drawn in (`cueShot`), or both
 * where this screen does not know it — and then the mark on the target
 * flickers between the two. The colour comes from what this screen already draws; nothing is told
 * here that the pair are meant to say to each other (#34).
 *
 * Drawn after the cue (`boss-cue-field.ts`), which is after the band, so the
 * ring stands over the button's gloss. A screen with no fire button draws
 * nothing, and neither does a band THE MIRROR is holding.
 */
export function drawFireButtonMarks(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  cue: BossCue,
  time: number,
  controls?: ControlSet,
): void {
  const k = cueBreath(time);
  const skin = seatSkin(l.role);
  for (const { circle, shot } of markedFireButtons(l, world, cue, controls)) {
    halo(ctx, circle.x, circle.y, circle.r * 1.9, emberHues(shot).hex, 0.35 * k);
    // The look the target wears, so a mark swapped there is swapped here too.
    AIM_LOOK.paint(ctx, circle.x, circle.y, circle.r, k, time, skin, circle, shot);
  }
}

/** The fire buttons on this screen that `cue` lights, and the colour each shoots. */
export function markedFireButtons(
  l: Layout,
  world: World,
  cue: BossCue,
  controls?: ControlSet,
): { circle: Circle; shot: Color }[] {
  if (cueAim(cue, l.hullY) === null || mirrorHoldsControls(world)) return [];
  const want = cueShot(cue);
  const out: { circle: Circle; shot: Color }[] = [];
  for (const { control, circle } of controlLobes(l, bandControlSet(controls, world))) {
    const shot = fireColour(control.id);
    if (shot !== null && (want === undefined || want === shot)) out.push({ circle, shot });
  }
  return out;
}

/** The colour a fire button shoots, or `null` for any other control. */
function fireColour(id: string): Color | null {
  if (id === "fireRed") return "red";
  if (id === "fireCyan") return "cyan";
  return null;
}
