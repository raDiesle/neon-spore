import {
  type FlueState,
  flueCannonCol,
  flueLitLevel,
  flueShownLevel,
  type World,
} from "@neon-spore/sim";
import { drawFlueBareHeat, drawFlueShield, flueBareness } from "./flue-bare.js";
import { drawFlueCard } from "./flue-card.js";
import { drawFlueStrings } from "./flue-cords.js";
import { drawFlueCilia, drawFlueSegment } from "./flue-flesh.js";
import type { FlueFx } from "./flue-fx.js";
import { drawFlueFlash, drawFlueLevels, drawFlueSight, drawFlueSlotGlow } from "./flue-marks.js";
import { drawFlueMirageFluid, drawFlueMiragePhantoms } from "./flue-mirage.js";
import { flueArrived, flueSpent } from "./flue-pose.js";
import { drawFlueScale } from "./flue-scale.js";
import {
  flueCentre,
  flueEmberAt,
  flueSightAt,
  flueSlotPath,
  flueUnitAt,
  flueUnits,
} from "./flue-shape.js";
import { drawFlueSpore } from "./flue-spore.js";
import { drawFlueSting } from "./flue-sting.js";
import { flueHang } from "./flue-strings.js";
import { drawFlueMarkFeedback } from "./flue-verdicts.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { showsFlueEmber } from "./view-role-clocks-c.js";

/** How far above its place the flue starts as it slides in, in tiles. */
const ARRIVE = 3;

/**
 * **THE FLUE**: a slotted flue laid across the top of the field, an ember
 * running along its slot end to end and back, and a sight on it over the
 * cannon held still under the middle column (§11.57, the owner's rework of
 * 5 October 2026), hung from the dark on three strings that are the level's
 * shots (`flue-strings.ts`, `flue-cords.ts`).
 *
 * **The split is the ember.** The pilot's screen is drawn it and the
 * navigator's is not (`showsFlueEmber`): the navigator has the trigger and
 * has to be told when, and is shown a mirage in the gullet instead — a
 * rainbow fluid and spores that are not there (`flue-mirage.ts`). Everything else is on both — the sight in the colour
 * the level asks, with the beam's bar through it on a beam level, the strings
 * it hangs on, one cut for every shot spent, and a stud for every level over the flue, lit as each is
 * cleared: the flue's health, read off the body. Under the slot a scale
 * ticks the beats the ember has left to the sight (`flue-scale.ts`), and over
 * the flue's left end a card names the weapon and THE SLOW (`flue-card.ts`).
 *
 * **It is drawn dark**: the owner had it drawn flat on 5 October 2026 so the
 * sight's colours can be seen, and THE SLOW's colour split stands round the
 * whole flue rather than splitting it (`slow-boss-aim-d.ts`). On 6 October he
 * asked for it bigger and *more alien living*, so the units are now dark
 * flesh, the slot a gullet and the ember a spore (`flue-flesh.ts`,
 * `flue-spore.ts`) — low in value and in neither cannon's colour, so the
 * sight is still the brightest colour on the flue. Later that day he asked
 * for it to show when it can be hurt: shielded away from the sight, bare and
 * red over it (`flue-bare.ts`). What outlives a frame — a
 * hit's flash, a stud's flare, the red of a blow landed and its shake — is
 * `fx` (`flue-fx.ts`); the blow at the hull is `flue-blow.ts`.
 */
export function drawFlue(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: FlueState,
  beat: number,
  beatPhase: number,
  time: number,
  fx: FlueFx,
): void {
  const cfg = world.cfg;
  const centre = flueCentre(l, cfg);
  const fade = 1 - 0.5 * flueSpent(s, cfg, beat, beatPhase);
  ctx.save();
  ctx.globalAlpha = fade;
  const arrive = -(1 - flueArrived(s, cfg, beat, beatPhase)) * ARRIVE * l.tile;
  const shake = fx.hurt.shakeX(time, l.tile);
  const hang = flueHang(l, cfg, s, beat, beatPhase, time, fx.swing);
  // The strings hang from under the chrome and stay there as the flue comes down.
  drawFlueStrings(ctx, l, cfg, hang, { x: shake, y: arrive }, time);
  ctx.translate(shake, arrive);
  // Everything else hangs off the strings, turned round the sight, where
  // every shot is met and which therefore never moves.
  const sight = flueSightAt(l, cfg);
  ctx.translate(sight.x, sight.y + hang.drop);
  ctx.rotate(hang.tilt);
  ctx.translate(-sight.x, -sight.y);

  const hurt = fx.hurt.value;
  const units = flueUnits(cfg);
  const aimed = flueCannonCol(cfg);
  for (let k = 0; k < units; k++) {
    // The cilia stop short of the sight's own units, where the words stand.
    if (Math.abs(k - aimed) > 1) drawFlueCilia(ctx, l, k, flueUnitAt(l, cfg, k), time);
  }
  for (let k = 0; k < units; k++) drawFlueSegment(ctx, l, k, flueUnitAt(l, cfg, k), hurt, time);
  const slot = flueSlotPath(l, cfg);
  drawGullet(ctx, slot, l);
  const lit = flueLitLevel(s) !== null;
  const sees = showsFlueEmber(l.role);
  const spent = s.phase === "spent";
  if (lit) drawFlueSlotGlow(ctx, slot, beatPhase);
  // The screen not shown the spore is shown a mirage in its place (`flue-mirage.ts`).
  if (!sees && !spent) drawFlueMirageFluid(ctx, l, cfg, slot, lit, time);

  const level = flueShownLevel(s);
  if (level !== null) {
    drawFlueScale(ctx, l, cfg, level, lit);
    drawFlueSight(ctx, l, sight, level, lit, beatPhase);
    drawFlueCard(ctx, l, centre.y, level, lit);
  }
  drawFlueLevels(ctx, l, centre, s.hits, s.levels.length, fx.flare);
  drawFlueFlash(ctx, l, sight, fx.flash);
  drawFlueSting(ctx, l, sight, fx.sting);
  drawFlueMarkFeedback(ctx, l, world, s, beat, beatPhase, time, fx.verdicts);
  // The spore over the marks: the partner's clock fills the sight on the
  // pilot's screen, and drawn under it the spore vanished just where it is met.
  if (!sees) {
    if (lit) drawFlueMiragePhantoms(ctx, l, cfg, time);
  } else {
    const at = flueEmberAt(l, cfg, s.emberMilli);
    const bare = flueBareness(cfg, s);
    drawFlueBareHeat(ctx, l, at, bare, time);
    drawFlueSpore(ctx, l, at, spent ? 0.45 : 1, bare.red, beatPhase, time, s.hits, fx.flash);
    if (!spent) drawFlueShield(ctx, l, at, bare, time);
  }
  ctx.restore();
}

/**
 * The slot as a gullet cut through the flesh: near black, its wall going down
 * into it in the deep violet, a wet light along its lower lip, and a dark
 * lip round it.
 */
function drawGullet(ctx: CanvasRenderingContext2D, slot: Path2D, l: Layout): void {
  ctx.fillStyle = PALETTE.flueSlot;
  ctx.fill(slot);
  ctx.save();
  ctx.clip(slot);
  ctx.lineWidth = l.tile * 0.2;
  ctx.strokeStyle = rgba(PALETTE.sheenDeep, 0.9);
  ctx.stroke(slot);
  ctx.translate(0, -l.tile * 0.07);
  ctx.lineWidth = l.tile * 0.045;
  ctx.strokeStyle = rgba(PALETTE.sheenRim, 0.18);
  ctx.stroke(slot);
  ctx.restore();
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = rgba(PALETTE.flueSootDark, 0.9);
  ctx.stroke(slot);
}
