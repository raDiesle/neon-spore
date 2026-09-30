import { type PinballState, pinCannonMilli } from "@neon-spore/sim";
import { drawBand } from "./band.js";
import type { Effects } from "./effects.js";
import { drawBackground } from "./field.js";
import { drawHud } from "./hud.js";
import { drawHull } from "./hull.js";
import { frame, surfaceSampler } from "./hull-frame.js";
import type { Layout, ViewRole } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drawAim, drawPowerBar } from "./pinball-aim.js";
import { drawPinBlast, drawPinTake } from "./pinball-blast.js";
import { drawPinCatch } from "./pinball-catch.js";
import { drawPinFuse } from "./pinball-fuse.js";
import { drawPinballGrips } from "./pinball-grip.js";
import { drawPinballAsked, drawPinballVerdicts } from "./pinball-marks.js";
import { drawPinPieces } from "./pinball-piece.js";
import { drawPinSockets } from "./pinball-socket.js";
import { drawPinBall, drawPinResting, drawPinWalls, pinTable } from "./pinball-table.js";
import type { ViewState } from "./renderer.js";
import { seatSkin } from "./seat-skin.js";
import { drawShipAir } from "./ship-air.js";

/**
 * PINBALL over the whole stage.
 *
 * **The ship is on the screen and the panel is the band**, and that is the
 * owner's second pass over this round rather than how it shipped. It arrived
 * the way THE GAUGE established — the field *gone*, a table in a violet case
 * over a flat fill, four slabs where the panel used to be — and he asked for
 * the opposite, in the same words he used on THE PULSE: *the game area field
 * must look like default game play with the ship, and control set area.*
 *
 * The rule survives him being right, and THE PULSE's header is where the
 * argument is written out: what a round takes away is the **field** — the
 * bodies falling down eleven columns and the vocabulary that hangs on them —
 * and the hull and the panel are not the field. They are the thing the pair
 * have been holding since wave one.
 *
 * So the table is the field's own eleven columns, from the top of the play area
 * down to the hull's own surface, with no case around it (`pinball-table.ts`);
 * what stands on it is the game's own rocks and pods (`pinball-piece.ts`); the
 * ship at the bottom is the real hull with its real scars, and the thing that
 * fires and catches is its **cannon**, moved by the ordinary strip at the
 * ordinary speed (`sim/pinball-controls.ts`). A ball that beats the cannon
 * explodes on the hull it hit (`pinball-blast.ts`).
 *
 * **Both seats are shown the same table**, which is the one place this round
 * differs from every other one in the game, and it was the owner's decision
 * rather than an omission: the coupling here is in the *verbs* — two presses
 * that have to arrive from alternating seats in one order — rather than in
 * what each screen knows. `showsPinPieces` below is the seam that would change
 * that, and it is written as a role predicate for exactly that reason: making
 * the board one-sided later is a line here, not a rewrite.
 */

/**
 * Which seat can see the pieces. Both, today.
 *
 * A predicate rather than a fact, because the question is live: this round is
 * the only built one whose two screens are the same, and every argument in
 * `docs/spec/interludes.md` says a round wants them different. If the pair
 * find the aim too easy to agree on, the first thing to try is `role !== "p2"`
 * here — the seat holding the cannon keeps the map and the seat opening the
 * sweep is talked onto it.
 */
export const showsPinPieces = (_role: ViewRole): boolean => true;

/**
 * The ship stands where the wave left it, and the cannon stands where the
 * strip put it this tick.
 *
 * Read straight off the world rather than eased towards it, for THE PULSE's
 * reason: an ease is state that outlives a frame, and state that outlives a
 * frame is what a restart reads as its own (`render-state.ts`). It costs
 * nothing here — the strip is absolute on every wave, so the cannon arrives at
 * a column rather than travelling to it.
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

export function drawPinballRound(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  view: ViewState,
  effects: Effects,
): void {
  const boss = view.world.boss;
  if (boss === null || boss.kind !== "pinball") return;
  const world = view.world;
  const cfg = world.cfg;
  const skin = seatSkin(view.role);

  // **The membrane first, because the floor of the table is the ship.** One
  // `frame()` built here and handed to the hull pass and to the blast alike, so
  // both agree about where the skin is this tick — the bargain `canvas2d.ts`
  // and `pulse-round.ts` both make, for the same reason.
  const { at, mood } = stillPose(view);
  const f = frame(l, view.time, mood, at);
  const surfaceY = surfaceSampler(f);
  const table = pinTable(l, cfg);

  // The field's own ground, not a flat fill: the round sits in the same water
  // the ship always sits in, which is most of what "like default game play"
  // turned out to mean. No grid and no radar — those *are* the field.
  drawBackground(ctx, l, world.wave, view.time);
  drawShipAir(ctx, l, view.time, skin);

  ctx.textAlign = "center";
  drawPinWalls(ctx, table);
  // No header: the only reading the top of the table carries is the board's
  // clock, the fuse every boss wears (`pinball-fuse.ts`).
  drawPinFuse(ctx, l, table, view, boss);

  if (boss.phase !== "morph") {
    if (showsPinPieces(view.role)) {
      drawPinSockets(ctx, table, boss);
      drawPinPieces(ctx, table, boss, view.time);
    }
    drawAim(ctx, table, view, boss);
    if (boss.shot === "flight") drawPinBall(ctx, table, boss, cfg.pinballBallMilli);
  }
  drawPinTake(ctx, table, view, boss);
  drawPowerBar(ctx, table, boss);

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
  // Over the ship, because both are *on* it: the ball waiting in the muzzle
  // between shots, the fire from the last one that got past it, and the
  // cheer for the last one that did not.
  const mouthX = table.x + (pinCannonMilli(cfg, world.cannonCol) * table.tile) / 1000;
  const mouthY = surfaceY(mouthX) - table.tile * 0.34;
  if (boss.phase === "play" && boss.shot !== "flight") {
    drawPinResting(ctx, table, mouthX, mouthY, cfg.pinballBallMilli);
  }
  drawPinBlast(ctx, l, table, view, boss, surfaceY);
  drawPinCatch(ctx, table, view, boss, mouthX, mouthY);
  // The two hands on the table, after the ship: both stand a tile and a half
  // above the floor, and the floor is the skin the hull pass bows and lights
  // (`pinball-grip.ts`).
  drawPinballAsked(ctx, l, cfg, boss, view.time);
  drawPinballGrips(ctx, l, cfg, boss, view.time);

  drawBand(ctx, l, world, false, false, view.time, view.controls);
  drawHud(ctx, l, view);
  ctx.textAlign = "center";
  // The verdict stands through `spent` too: the round is over and holding
  // its own picture until the next wave arrives (`sim/wave-end.ts`).
  if (boss.phase === "verdict" || boss.phase === "spent") drawVerdict(ctx, l, boss);
  ctx.textAlign = "left";
  drawPinballVerdicts(ctx, l, cfg, boss, effects.boss.pinball.verdicts);
}

/** How it went, once it is over. */
function drawVerdict(ctx: CanvasRenderingContext2D, l: Layout, boss: PinballState): void {
  ctx.font = '600 20px "Courier New",monospace';
  ctx.fillStyle = boss.passed ? PALETTE.good : PALETTE.red;
  ctx.fillText(boss.passed ? "TABLE CLEAR" : "OUT OF TIME", l.width / 2, l.playHeight * 0.5);
}
