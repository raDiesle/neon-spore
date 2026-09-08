import { hullPercent, type PinballState, pinCannonMilli, pinTargetsLeft } from "@neon-spore/sim";
import { drawBand } from "./band.js";
import { drawBackground } from "./field.js";
import { drawHud } from "./hud.js";
import { drawHull } from "./hull.js";
import { frame, surfaceSampler } from "./hull-frame.js";
import type { Layout, ViewRole } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drawAim, drawPowerBar } from "./pinball-aim.js";
import { drawPinBlast, drawPinTake } from "./pinball-blast.js";
import { drawPinPieces } from "./pinball-piece.js";
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

export function drawPinballRound(ctx: CanvasRenderingContext2D, l: Layout, view: ViewState): void {
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
  drawTitle(ctx, l, table, view.role, boss);
  drawTally(ctx, l, table, view, boss);

  if (boss.phase !== "morph") {
    if (showsPinPieces(view.role)) drawPinPieces(ctx, table, boss, view.time);
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
    hullPercent(world),
    at,
    () => true,
    () => true,
    skin.hull,
    { x: 0, y: 0 },
    f,
  );
  // Over the ship, because both are *on* it: the ball waiting in the muzzle
  // between shots, and the fire from the last one that got past it.
  if (boss.phase === "play" && boss.shot !== "flight") {
    const mouth = pinCannonMilli(cfg, world.cannonCol);
    const x = table.x + (mouth * table.tile) / 1000;
    drawPinResting(ctx, table, x, surfaceY(x) - table.tile * 0.34, cfg.pinballBallMilli);
  }
  drawPinBlast(ctx, l, table, view, boss, surfaceY);

  drawBand(ctx, l, world, false, false, view.time, view.controls);
  drawHud(ctx, l, view);
  ctx.textAlign = "center";
  // The verdict stands through `spent` too: the round is over and holding
  // its own picture until the next wave arrives (`sim/wave-end.ts`).
  if (boss.phase === "verdict" || boss.phase === "spent") drawVerdict(ctx, l, boss);
  ctx.textAlign = "left";
}

/**
 * The name, whose press the round is waiting for, and the tally — all three in
 * the clear air at the top of the table.
 *
 * They stand *inside* the board rather than above it because there is nothing
 * above it any more: the table runs from the top of the play area to the hull.
 * The band of air they sit in is the one every board hangs below
 * (`PIN_TOP_TILES` in `content/src/pinball-rounds.ts`), so no piece can ever be
 * drawn under this text.
 */
function drawTitle(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  t: { x: number; y: number; tile: number },
  role: ViewRole,
  boss: PinballState,
): void {
  ctx.fillStyle = PALETTE.hull;
  ctx.font = '600 16px "Courier New",monospace';
  ctx.fillText("PINBALL", l.width / 2, t.y + t.tile * 0.52);
  ctx.fillStyle = PALETTE.dim;
  ctx.font = '12px "Courier New",monospace';
  ctx.fillText(waiting(role, boss), l.width / 2, t.y + t.tile * 0.98);
}

/**
 * Whose turn it is, said on both screens. The one thing that differs between
 * them is whether it says "you" or "them", which is not an information split —
 * it is the same fact, addressed.
 *
 * Two states rather than three, since the sweep is no longer opened by a press
 * (`packages/sim/src/pinball-controls.ts`): the needle is player 1's to stop
 * and the bar is player 2's to fire on.
 */
function waiting(role: ViewRole, boss: PinballState): string {
  if (boss.phase === "morph") return "the table is coming up";
  if (boss.shot === "flight") return "get the cannon under it";
  const mine = boss.shot === "power" ? role !== "p1" : role !== "p2";
  const who = mine ? "you" : "they";
  if (boss.shot === "power") return `${who} fire on the bar`;
  return `${who} stop the needle`;
}

/**
 * Targets left, which board this is, and how long there is — with what the
 * drops have cost hung off the middle only once there is one.
 *
 * Three readings and not four: a row of four numbers across a phone is a row
 * nobody reads under pressure, and the drop count is the one that is nothing at
 * all until it is something.
 */
function drawTally(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  t: { y: number; tile: number },
  view: ViewState,
  boss: PinballState,
): void {
  const left = pinTargetsLeft(boss);
  const round = boss.rounds[Math.min(boss.round, boss.rounds.length - 1)];
  const beats = Math.max(0, (round?.beats ?? 0) - (view.world.beat - boss.roundBeat));
  const y = t.y + t.tile * 1.44;
  ctx.font = '11px "Courier New",monospace';
  ctx.textAlign = "center";
  ctx.fillStyle = PALETTE.pod;
  ctx.fillText(`LIT ${left}`, l.width * 0.16, y);
  ctx.fillStyle = boss.drops > 0 ? PALETTE.red : PALETTE.dim;
  const cost = boss.drops > 0 ? `  ·  ${boss.drops} DROPPED` : "";
  ctx.fillText(`TABLE ${boss.round + 1}/${boss.rounds.length}${cost}`, l.width / 2, y);
  ctx.fillStyle = beats < 8 ? PALETTE.red : PALETTE.dim;
  ctx.fillText(`${beats}`, l.width * 0.88, y);
}

/** How it went, once it is over. */
function drawVerdict(ctx: CanvasRenderingContext2D, l: Layout, boss: PinballState): void {
  ctx.font = '600 20px "Courier New",monospace';
  ctx.fillStyle = boss.passed ? PALETTE.good : PALETTE.red;
  ctx.fillText(boss.passed ? "TABLE CLEAR" : "OUT OF TIME", l.width / 2, l.playHeight * 0.5);
}
