import { controlSetForWave } from "@neon-spore/content";
import { hullPercent, PULSE_COUNT_BEATS, type PulseState, pulseCurrent } from "@neon-spore/sim";
import { drawBand } from "./band.js";
import { drawBackground } from "./field.js";
import { drawHud } from "./hud.js";
import { drawHull } from "./hull.js";
import { frame, surfaceSampler } from "./hull-frame.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drawPulseDrops } from "./pulse-drop.js";
import { drawArrows, drawReceptors } from "./pulse-fall.js";
import { drawPulseLanes, drawPulseLine, type PulseField, pulseField } from "./pulse-lane.js";
import { drawPulseMeter, drawPulseTally, drawPulseVerdict } from "./pulse-meter.js";
import type { ViewState } from "./renderer.js";
import { seatSkin } from "./seat-skin.js";
import { drawShipAir } from "./ship-air.js";

/**
 * THE PULSE over the whole stage.
 *
 * **The ship is on the screen and the panel is the band.** It did not ship
 * that way: this round replaced the picture outright, on the rule THE GAUGE
 * established — the field is *gone*, not dimmed and not re-skinned — and the
 * owner looked at it and asked for the opposite. *More integrated, how a
 * regular game with control panel looks: to see the ship and its controls, and
 * buttons in the same style as the default set.* He is right, and the rule
 * survives him being right: what a round takes away is the **field** — the
 * eleven columns, the bodies falling down them, the vocabulary that hangs on
 * them — and none of that is here. The hull and the panel are not the field.
 * They are the thing the pair have been holding since wave one, and a round
 * that threw them away made the last boss of the act look like a different
 * game.
 *
 * So: four lanes fall through the space the grid would be, onto a line above
 * the hull, and the four buttons are lobes in the band's own sockets
 * (`pulse-button.ts`). **An arrow nobody answered goes past the line and into
 * the ship** (`pulse-drop.ts`), which is the other half of what he asked for —
 * a dropped arrow used to stop being drawn and take a number down with it.
 *
 * **Each screen draws its own chart.** The two seats are playing the same
 * notes, but an arrow leaves a screen the moment *that* seat has resolved it —
 * so a player who is a bar behind sees a bar they are behind on, which is the
 * only honest picture. What the two screens genuinely disagree about is the
 * veil: an arrow this seat cannot read falls in the middle with its heading
 * cycling, and the same arrow on the other screen falls in its lane wearing a
 * light (`pulse-arrow.ts`).
 *
 * **The partner is on the screen and their misses are the reason.** The strip
 * under the line carries the other seat's last judgement and their run, and it
 * is the one thing here that is about somebody else — the owner asked for it
 * by name, and without it a pair have no idea whether the meter is falling
 * because of them.
 *
 * This file composes the screen. What is *falling* down it is `pulse-fall.ts`,
 * what happens to the ones that land is `pulse-drop.ts`.
 */

/** How long a judgement word stands before it fades, in ticks. */
const WORD_TICKS = 45;

/** The words, indexed by `PULSE_JUDGES`. */
const WORDS = ["", "PERFECT", "GOOD", "MISS", "—"];
const WORD_COLORS = [PALETTE.dim, PALETTE.good, PALETTE.cyan, PALETTE.red, PALETTE.pod];

/**
 * The ship stands still through the round, and both swellings stand where the
 * wave left them.
 *
 * Nothing in THE PULSE flies the ship — there is no cannon to slide and no
 * shield to place — so the pose is read straight off the world rather than
 * eased towards it (`field-pose.ts` is for a hull being flown). A round has no
 * `FieldPose` of its own and should not grow one: an ease is state that
 * outlives a frame, and state that outlives a frame is what a restart reads as
 * its own (`render-state.ts`).
 */
function stillPose(view: ViewState) {
  return {
    at: {
      cannon: view.world.cannonCol,
      shield: [{ col: view.world.shieldCol, weight: 1, halfMul: 1 }],
    },
    mood: { armed: 0, intake: 0, chew: 0, charge: 0 },
  };
}

export function drawPulseRound(ctx: CanvasRenderingContext2D, l: Layout, view: ViewState): void {
  const boss = view.world.boss;
  if (boss === null || boss.kind !== "pulse") return;
  const world = view.world;
  const cfg = world.cfg;
  // See `ViewState.controls`: `view.world.wave` only indexes the shipped
  // `WAVES` for a host actually playing them, so an explicit `view.controls`
  // wins when one is given.
  const set = view.controls === undefined ? controlSetForWave(world.wave) : view.controls;
  const seat: 1 | 2 = view.role === "p2" ? 2 : 1;
  const other: 1 | 2 = seat === 1 ? 2 : 1;
  const field = pulseField(l, set, view.role);
  const skin = seatSkin(view.role);

  // The field's own ground, not a flat fill: the round sits in the same water
  // the ship always sits in, which is most of what "integrated" turned out to
  // mean. No grid and no radar — those *are* the field, and the four lanes are
  // what stands in their place.
  drawBackground(ctx, l, world.wave, view.time);
  drawShipAir(ctx, l, view.time, skin);
  drawPulseLanes(ctx, field, view.time);

  ctx.textAlign = "center";
  drawTitle(ctx, l, boss);
  drawPulseMeter(ctx, l, boss, cfg.pulseMeterMaxMilli);
  drawPulseTally(ctx, l, boss, seat);

  if (boss.phase === "count") drawCount(ctx, l, view, boss);
  if (boss.phase === "play" || boss.phase === "count") drawArrows(ctx, view, boss, field, seat);

  // The ship, under the line and over the lanes. One membrane built here and
  // handed to both the hull and the drops, so an arrow lands on the skin the
  // eye is looking at rather than on a second one a fraction of a tick away
  // (`canvas2d.ts` makes the same bargain for the same reason).
  const { at, mood } = stillPose(view);
  const f = frame(l, view.time, mood, at);
  drawHull(
    ctx,
    l,
    world.scars,
    view.time,
    mood,
    hullPercent(world),
    at,
    () => true,
    () => true,
    skin.hull,
    { x: 0, y: 0 },
    f,
  );
  drawPulseDrops(ctx, l, view, boss, field, seat, surfaceSampler(f));

  // Over the ship: the interface the round is actually played on.
  drawPulseLine(ctx, field, view.beatPhase);
  drawReceptors(ctx, view, boss, field, seat);
  drawWord(ctx, l, field, view, boss, seat, other);

  drawBand(ctx, l, world, false, false, view.time, view.controls);
  drawHud(ctx, l, view);
  ctx.textAlign = "center";
  if (boss.phase === "verdict" || boss.phase === "spent") drawPulseVerdict(ctx, l, boss);
  ctx.textAlign = "left";
}

/** The name, and the stage under it. */
function drawTitle(ctx: CanvasRenderingContext2D, l: Layout, boss: PulseState): void {
  ctx.fillStyle = PALETTE.hull;
  ctx.font = '600 16px "Courier New",monospace';
  ctx.fillText("THE PULSE", l.width / 2, l.playHeight * 0.07);
  ctx.fillStyle = PALETTE.dim;
  ctx.font = '13px "Courier New",monospace';
  ctx.fillText(pulseCurrent(boss).name, l.width / 2, l.playHeight * 0.105);
}

/** The count-in, on the beat, so the pair start together. */
function drawCount(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  view: ViewState,
  boss: PulseState,
): void {
  const left = PULSE_COUNT_BEATS - (view.world.beat - boss.phaseBeat);
  const swell = (1 - view.beatPhase) ** 2;
  ctx.fillStyle = PALETTE.text;
  ctx.globalAlpha = 0.3 + 0.6 * swell;
  ctx.font = `600 ${Math.round(46 + 16 * swell)}px "Courier New",monospace`;
  ctx.fillText(String(Math.max(1, left)), l.width / 2, l.playHeight * 0.45);
  ctx.globalAlpha = 1;
}

/** This seat's last judgement over the line, and the partner's under it. */
function drawWord(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  field: PulseField,
  view: ViewState,
  boss: PulseState,
  seat: 1 | 2,
  other: 1 | 2,
): void {
  say(ctx, l, view, boss, seat, field.lineY - l.playHeight * 0.1, "", 17);
  say(ctx, l, view, boss, other, field.lineY - l.playHeight * 0.045, "THEM ", 13);
}

function say(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  view: ViewState,
  boss: PulseState,
  who: 1 | 2,
  y: number,
  prefix: string,
  size: number,
): void {
  const last = who === 1 ? boss.last1 : boss.last2;
  const at = who === 1 ? boss.lastTick1 : boss.lastTick2;
  const combo = who === 1 ? boss.combo1 : boss.combo2;
  if (at < 0 || last === 0) return;
  const fade = Math.max(0, 1 - (view.world.tick - at) / WORD_TICKS);
  if (fade <= 0) return;
  ctx.globalAlpha = fade;
  ctx.fillStyle = WORD_COLORS[last] ?? PALETTE.dim;
  ctx.font = `600 ${size}px "Courier New",monospace`;
  ctx.textAlign = "center";
  const run = combo > 3 ? `  ×${combo}` : "";
  ctx.fillText(`${prefix}${WORDS[last] ?? ""}${run}`, l.width / 2, y);
  ctx.globalAlpha = 1;
}
