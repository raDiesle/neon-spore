import { type ScoutState, scoutMawOpen, scoutPilot, type World } from "@neon-spore/sim";
import { drawBand } from "./band.js";
import type { Effects } from "./effects.js";
import { drawBackground } from "./field.js";
import { tear } from "./flip-reveal.js";
import { drawHud } from "./hud.js";
import { drawHull } from "./hull.js";
import { frame, skinSampler } from "./hull-frame.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import type { ViewState } from "./renderer.js";
import {
  drawScoutHazards,
  drawScoutHome,
  drawScoutMotes,
  drawScoutWalls,
  type ScoutPut,
} from "./scout-draw.js";
import { drawScoutGrips } from "./scout-grip.js";
import { drawScoutClock, drawScoutLaunch, drawScoutSuck, scoutGlimpse } from "./scout-look.js";
import { drawScoutAsked, drawScoutVerdicts } from "./scout-marks.js";
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
 * Both are shown home, the walls and the clock, and the pilot a glimpse of
 * the arena every few seconds (`scout-look.ts`).
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

export function drawScoutRound(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  view: ViewState,
  effects: Effects,
): void {
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

  // No words over the arena while it is flown — the owner, 29 September
  // 2026: *remove all the text above from wave during game*. The clock is
  // the fuse across the top, and who does what is the guide's to say.
  drawScoutClock(ctx, l, boss, world.beat, view.beatPhase);

  drawScoutHome(ctx, l, cfg, mood.intake, view.time);
  drawScoutSuck(ctx, l, cfg, boss, view.time);
  drawArena(ctx, l, view, boss);
  // The little ship is out only once the lead has let it go: in the lead it
  // is still inside the mother ship, and the picture is the mouth opening.
  if (boss.phase !== "lead") {
    const nose = showsScoutNose(view.role, scoutPilot(boss));
    drawScout(ctx, l, cfg, boss, world.tick, view.time, nose);
    drawScoutLaunch(ctx, l, cfg, boss, world.tick);
  }

  drawHull(
    ctx,
    l,
    world.scars,
    view.time,
    mood,
    at,
    effects.boss.hit.craterShown(l),
    effects.boss.hit.crackShown(),
    skin.hull,
    { x: 0, y: 0 },
    f,
  );
  effects.boss.hit.draw(ctx, l, view.time, skinSampler(f));
  // The two hands on the ship, after the hull: the arena's bottom row stands
  // on the hull's own surface, so a ring off the stern of a ship flown down
  // there would be painted over by the plating it is hanging in front of
  // (`scout-grip.ts`).
  drawScoutAsked(ctx, l, cfg, boss, view.time);
  drawScoutGrips(ctx, l, cfg, boss, view.time);
  drawBand(ctx, l, world, false, false, view.time, view.controls);
  drawHud(ctx, l, view);
  ctx.textAlign = "center";
  // The verdict stands through `spent` too: the round holds its own picture
  // until the next wave arrives (`sim/wave-end.ts`).
  if (boss.phase === "verdict" || boss.phase === "spent") drawVerdict(ctx, l, boss);
  ctx.textAlign = "left";
  drawScoutVerdicts(ctx, l, cfg, boss, effects.boss.scout.verdicts);
}

/**
 * The motes and hazards, on the screen that is shown them. The pilot's is
 * shown them only in a glimpse, torn in and out (`scout-look.ts`), and the
 * one hazard that caught the ship once it has — *when little ship is caught,
 * it should show the enemy which caught it for both players*.
 */
function drawArena(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  view: ViewState,
  boss: ScoutState,
): void {
  const { world, time } = view;
  const cfg = world.cfg;
  if (showsScoutArena(view.role, scoutPilot(boss))) {
    drawScoutMotes(ctx, l, cfg, boss, time);
    drawScoutHazards(ctx, l, cfg, boss, time);
    return;
  }
  const glimpse = scoutGlimpse(cfg, boss, world.tick);
  if (glimpse !== null) {
    const frame = Math.floor(time * 18);
    const put: ScoutPut = (id, x, y, paint) =>
      tear(ctx, l, id, x, y, frame, glimpse.s, glimpse.alpha, 0, paint);
    drawScoutMotes(ctx, l, cfg, boss, time, put);
    drawScoutHazards(ctx, l, cfg, boss, time, put);
  } else if (boss.caughtBy >= 0) {
    drawScoutHazards(ctx, l, cfg, boss, time, undefined, boss.caughtBy);
  }
}

/** How it went, once it is over. */
function drawVerdict(ctx: CanvasRenderingContext2D, l: Layout, boss: ScoutState): void {
  ctx.font = '600 20px "Courier New",monospace';
  ctx.fillStyle = boss.passed ? PALETTE.good : PALETTE.red;
  const lost = boss.caughtTick >= 0 ? "CAUGHT" : "OUT OF TIME";
  ctx.fillText(boss.passed ? "ALL BANKED" : lost, l.width / 2, l.playHeight * 0.5);
}
