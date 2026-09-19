import {
  type ScoutState,
  scoutCurrent,
  scoutLeft,
  scoutMawOpen,
  type World,
} from "@neon-spore/sim";
import { drawBand } from "./band.js";
import { drawBackground } from "./field.js";
import { drawHud } from "./hud.js";
import { drawHull } from "./hull.js";
import { frame } from "./hull-frame.js";
import type { Layout, ViewRole } from "./layout.js";
import { PALETTE } from "./palette.js";
import type { ViewState } from "./renderer.js";
import { drawScoutHazards, drawScoutHome, drawScoutMotes, drawScoutWalls } from "./scout-draw.js";
import { drawScout } from "./scout-ship.js";
import { seatSkin } from "./seat-skin.js";
import { drawShipAir } from "./ship-air.js";
import { showsScoutArena, showsScoutNose } from "./view-role.js";

/**
 * THE SCOUT over the whole stage.
 *
 * **The ship is on the screen and the panel is the band**, the way PINBALL and
 * THE PULSE were rebuilt to be and for the reasons `pinball-round.ts` writes
 * out: what a round takes away is the *field*, and the hull and the band are
 * not the field. So the arena is the field's own columns from the top of the
 * play area down to the hull's real surface (`scout-draw.ts`), the four
 * presses are lobes in THE CLAW's sockets (`scout-button.ts`), and the mother
 * ship the little one flies home to is the real hull.
 *
 * **The mother ship's mouth is the hull's own intake.** `scoutHome` stands on
 * the bottom row's middle, which is where the cannon's socket is when the
 * cannon is over the middle column — so the pose below parks the cannon there
 * and drives `mood.intake` off `scoutMawOpen`, and the hull *opens* for the
 * beat the navigator's press keeps it open, with the same swelling and throat
 * the field's pods are swallowed through (`hull-frame.ts`, `MAW`). The maw on
 * the band and the maw on the ship are one fact drawn twice.
 *
 * **The split is the encounter** (`view-role.ts`): the pilot is shown the
 * ship, its nose and what it carries and not one mote or hazard; the
 * navigator is shown every mote and hazard and a ship with no nose on it.
 * Both are shown home, the walls and the count, because both are counting.
 *
 * Nothing here outlives a frame. The pose is read off the world each time
 * rather than eased, for THE PULSE's reason: an ease is state a restart reads
 * as its own.
 */

/**
 * The ship stands still with its cannon over the middle column, which is
 * where home is; the shield stays where the wave left it. The intake is the
 * maw, open for as long as the navigator's press holds it.
 */
function stillPose(world: World, round: ScoutState) {
  const open = round.phase === "play" && scoutMawOpen(round, world.tick, world.cfg.scoutMawTicks);
  return {
    at: {
      cannon: (world.cfg.cols - 1) / 2,
      shield: [{ col: world.shieldCol, weight: 1, halfMul: 1 }],
    },
    mood: { armed: 0, intake: open ? 1 : 0, chew: 0, charge: 0 },
  };
}

export function drawScoutRound(ctx: CanvasRenderingContext2D, l: Layout, view: ViewState): void {
  const boss = view.world.boss;
  if (boss === null || boss.kind !== "scout") return;
  const world = view.world;
  const cfg = world.cfg;
  const skin = seatSkin(view.role);
  const { at, mood } = stillPose(world, boss);
  const f = frame(l, view.time, mood, at);

  drawBackground(ctx, l, world.wave, view.time);
  drawShipAir(ctx, l, view.time, skin);
  drawScoutWalls(ctx, l, cfg);

  ctx.textAlign = "center";
  const top = l.gridTop + l.tile * 0.52;
  drawTitle(ctx, l, view.role, boss, top);
  drawTally(ctx, l, view, boss, top + l.tile * 0.92);

  drawScoutHome(ctx, l, cfg, mood.intake, view.time);
  if (showsScoutArena(view.role)) {
    drawScoutMotes(ctx, l, cfg, boss, view.time);
    drawScoutHazards(ctx, l, cfg, boss, view.time);
  }
  // The little ship is out only once the lead has let it go: in the lead it
  // is still inside the mother ship, and the picture is the mouth opening.
  if (boss.phase !== "lead") {
    drawScout(ctx, l, cfg, boss, world.tick, view.time, showsScoutNose(view.role));
  }

  drawHull(
    ctx,
    l,
    world.scars,
    view.time,
    mood,
    at,
    () => true,
    () => true,
    skin.hull,
    { x: 0, y: 0 },
    f,
  );
  drawBand(ctx, l, world, false, false, view.time, view.controls);
  drawHud(ctx, l, view);
  ctx.textAlign = "center";
  // The verdict stands through `spent` too: the round holds its own picture
  // until the next wave arrives (`sim/wave-end.ts`).
  if (boss.phase === "verdict" || boss.phase === "spent") drawVerdict(ctx, l, boss);
  ctx.textAlign = "left";
}

/** The name and which seat is doing what, in the clear air above the arena. */
function drawTitle(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  role: ViewRole,
  boss: ScoutState,
  top: number,
): void {
  ctx.fillStyle = PALETTE.hull;
  ctx.font = '600 16px "Courier New",monospace';
  ctx.fillText("THE SCOUT", l.width / 2, top);
  ctx.fillStyle = PALETTE.dim;
  ctx.font = '12px "Courier New",monospace';
  ctx.fillText(job(role, boss), l.width / 2, top + l.tile * 0.46);
}

/**
 * What this seat is for, said on both screens. Addressed rather than split:
 * the pilot is told they are flying blind and the navigator that they are
 * the eyes, and each is told the other's job in the same breath, since the
 * whole round is the two of them saying it out loud.
 */
function job(role: ViewRole, boss: ScoutState): string {
  if (boss.phase === "lead") return "the ship is opening";
  if (boss.phase !== "play") return boss.passed ? "every mote is home" : "the scout is lost";
  if (role === "p1") return "you fly it — they can see the arena";
  if (role === "p2") return "you see the arena — they fly it";
  return "one flies, one sees";
}

/**
 * Motes banked, which arena this is, and how long there is. Three readings
 * for PINBALL's reason: a row of four across a phone is a row nobody reads.
 * In the lead the clock shows the beats until the ship is let go.
 */
function drawTally(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  view: ViewState,
  boss: ScoutState,
  y: number,
): void {
  const cfg = view.world.cfg;
  const arena = scoutCurrent(boss);
  const total = arena.motes.length;
  const since = view.world.beat - (boss.phase === "lead" ? boss.phaseBeat : boss.arenaBeat);
  const span = boss.phase === "lead" ? cfg.scoutLeadBeats : arena.beats;
  const beats = Math.max(0, span - since);
  ctx.font = '11px "Courier New",monospace';
  ctx.textAlign = "center";
  ctx.fillStyle = PALETTE.pod;
  ctx.fillText(`MOTES ${total - scoutLeft(boss)}/${total}`, l.width * 0.16, y);
  ctx.fillStyle = PALETTE.dim;
  ctx.fillText(`ARENA ${boss.arena + 1}/${boss.arenas.length}`, l.width / 2, y);
  ctx.fillStyle = boss.phase === "play" && beats < 4 ? PALETTE.red : PALETTE.dim;
  ctx.fillText(`${beats}`, l.width * 0.88, y);
}

/** How it went, once it is over. */
function drawVerdict(ctx: CanvasRenderingContext2D, l: Layout, boss: ScoutState): void {
  ctx.font = '600 20px "Courier New",monospace';
  ctx.fillStyle = boss.passed ? PALETTE.good : PALETTE.red;
  const lost = boss.caughtTick >= 0 ? "CAUGHT" : "OUT OF TIME";
  ctx.fillText(boss.passed ? "ALL BANKED" : lost, l.width / 2, l.playHeight * 0.5);
}
