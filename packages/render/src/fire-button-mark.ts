import type { ControlSet } from "@neon-spore/content";
import { type Color, mirrorHoldsControls, type World } from "@neon-spore/sim";
import { emberEither, emberHues } from "./aim-ember.js";
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
 * colour: the one the mark on the target is drawn in (`cueShot`). Where this
 * screen does not know it, the mark on the target flickers between red and
 * cyan and the mark here jumps between the two buttons with it, one at a
 * time — the owner, 9 October 2026: *the displaying visual should switch in
 * control set cannon buttons from one to another indicating its one of them
 * ( but not both at the same time)*. The colour comes from what this screen already draws; nothing is told
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
  // Where this screen does not know the colour, the mark jumps between the
  // two buttons in step with the ring's flicker — one at a time, never both.
  const either = cueShot(cue) === undefined;
  for (const { circle, shot } of markedFireButtons(l, world, cue, controls)) {
    if (either && shot !== emberEither(time)) continue;
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
  // THE GAUGE's two fire the cannon in their colour too (`content/controls-round.ts`).
  if (id === "fireRed" || id === "gaugeRed") return "red";
  if (id === "fireCyan" || id === "gaugeCyan") return "cyan";
  return null;
}
