import { controlSetForWave } from "@neon-spore/content";
import {
  CLAW_LEAD_BEATS,
  CLAW_POD,
  type ClawState,
  clawBeatsLeft,
  clawCells,
  clawPodsLeft,
} from "@neon-spore/sim";
import { clawCellX, clawRig, drawClaw, drawClawRail, drawClawSockets } from "./claw-rig.js";
import { type Layout, showsClawWrecks } from "./layout.js";
import { PALETTE } from "./palette.js";
import type { ViewState } from "./renderer.js";
import { slabPanel } from "./slabs.js";

/**
 * THE CLAW over the whole stage.
 *
 * `canvas2d.ts` hands the frame over and draws nothing else — no grid, no
 * hull, no band. That is the round's first condition: the field is gone, not
 * dimmed and not re-skinned (`docs/spec/interludes.md`).
 *
 * The two screens are **not** the same picture, and the difference is the whole
 * round: player 2's has the wrecks in the sockets, player 1's has the sockets
 * and the dark. Everything else — the rail, the claw, the clock, the tally —
 * is identical on both, deliberately, because a pair has to be able to say
 * "left" about the same machine.
 *
 * **Nothing here is labelled.** No letters across the rail and no numbers down
 * it: a coordinate is what THE FLEET's chart gives a pair so a direction can be
 * said once and be done with, and this round exists because of what happens
 * when they cannot.
 */
export function drawClawRound(ctx: CanvasRenderingContext2D, l: Layout, view: ViewState): void {
  const boss = view.world.boss;
  if (boss === null || boss.kind !== "claw") return;

  ctx.fillStyle = PALETTE.background;
  ctx.fillRect(0, 0, l.width, l.height);
  drawEdge(ctx, l);

  ctx.textAlign = "center";
  drawTitle(ctx, l, view);
  const rig = clawRig(l, clawCells(view.world.cfg));
  drawClawRail(ctx, rig);
  drawClawSockets(ctx, rig, boss, showsClawWrecks(view.role));
  drawClaw(ctx, rig, boss.cell, drop01(view, boss), carrying(view, boss));
  drawGrabMark(ctx, view, boss, rig);
  drawTally(ctx, l, view, boss);
  drawControls(ctx, l, view, boss);
  if (boss.phase === "lead") drawLead(ctx, l, view, boss);
  // The verdict stands through `spent` too: the round is over and holding its
  // own picture until the next wave arrives (`sim/wave-end.ts`).
  if (boss.phase === "verdict" || boss.phase === "spent") drawVerdict(ctx, l, boss);
  ctx.textAlign = "left";
}

/**
 * How far down the claw is, 0..1 and back again.
 *
 * One number for the whole gesture — down, shut, up — read off the beat of the
 * last grab and the rest that follows it, which are the two the simulation
 * already keeps. A field of its own would be a second copy of the rest, and a
 * restart would carry it into the next run (`docs/decisions.md`, `Effects`).
 */
function drop01(view: ViewState, round: ClawState): number {
  const rest = Math.max(1, view.world.cfg.clawGrabRestBeats);
  const since = view.world.beat + view.beatPhase - round.grabBeat;
  if (since < 0 || since >= rest) return 0;
  const t = since / rest;
  return t < 0.5 ? t * 2 : (1 - t) * 2;
}

/**
 * What the claw has hold of this frame, or nothing.
 *
 * Only on the way back up: a hand that already held the thing on the way down
 * would say what is in a socket before anybody had reached into it, which is
 * exactly the half of the field player 1 does not get.
 */
function carrying(view: ViewState, round: ClawState): number {
  if (round.grabCell < 0) return 0;
  const since = view.world.beat + view.beatPhase - round.grabBeat;
  const rest = Math.max(1, view.world.cfg.clawGrabRestBeats);
  return since >= rest / 2 && since < rest ? round.grabHold : 0;
}

/** A hard rectangle inset from the stage — THE GAUGE's edge, and it does the
 * same job here: without one there is nothing saying where the machine stops
 * and the dark begins. */
function drawEdge(ctx: CanvasRenderingContext2D, l: Layout): void {
  ctx.strokeStyle = PALETTE.grid;
  ctx.lineWidth = 1.4;
  ctx.strokeRect(6.5, 6.5, Math.max(1, l.width - 13), Math.max(1, l.height - 13));
}

/**
 * The one line of text either seat gets, and it is different on the two of
 * them — because the thing each of them has to be told is different.
 */
function drawTitle(ctx: CanvasRenderingContext2D, l: Layout, view: ViewState): void {
  ctx.fillStyle = PALETTE.text;
  ctx.font = '600 15px "Courier New",monospace';
  ctx.fillText("THE CLAW", l.width / 2, l.playHeight * 0.12);
  ctx.fillStyle = PALETTE.dim;
  ctx.font = '9px "Courier New",monospace';
  ctx.fillText(
    showsClawWrecks(view.role) ? "YOU SEE IT — THEY MOVE IT" : "YOU MOVE IT — THEY SEE IT",
    l.width / 2,
    l.playHeight * 0.12 + 15,
  );
}

/**
 * What the last grab came up with, over the socket it came out of.
 *
 * **Both screens get it**, and that is deliberate rather than an oversight in
 * the split: a claw that came up empty and said nothing is a round with no
 * feedback in it for the one seat that cannot see, and a pilot who never
 * learns what he pulled has no way of telling a sentence he misheard from a
 * wreck that moved. It says what came up and never what is still down there.
 */
function drawGrabMark(
  ctx: CanvasRenderingContext2D,
  view: ViewState,
  round: ClawState,
  rig: ReturnType<typeof clawRig>,
): void {
  if (round.grabCell < 0) return;
  const since = view.world.beat - round.grabBeat;
  if (since < 0 || since > view.world.cfg.clawGrabRestBeats) return;
  const good = round.grabHold === CLAW_POD;
  ctx.fillStyle = round.grabHold === 0 ? PALETTE.dim : good ? PALETTE.good : PALETTE.ember;
  ctx.font = '600 10px "Courier New",monospace';
  ctx.fillText(
    round.grabHold === 0 ? "EMPTY" : good ? "POD" : "ROCK",
    clawCellX(rig, round.grabCell),
    rig.socketTop + rig.socketH + 16,
  );
}

/**
 * Pods raised, as pips, and the time left as a bar that empties.
 *
 * The pips are the round's own progress and the bar costs something: the beats
 * running out break the hull, so a pair who cannot see them spending are being
 * charged for a thing nobody showed them — THE GAUGE's argument, unchanged.
 */
function drawTally(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  view: ViewState,
  round: ClawState,
): void {
  const cfg = view.world.cfg;
  const total = round.pods + clawPodsLeft(round.cells);
  const y = l.playHeight * 0.84;
  const gap = 15;
  const left = l.width / 2 - ((total - 1) * gap) / 2;
  for (let i = 0; i < total; i++) {
    ctx.beginPath();
    ctx.arc(left + i * gap, y, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = i < round.pods ? PALETTE.pod : "#3B3163";
    ctx.fill();
  }

  const left01 = Math.max(0, Math.min(1, clawBeatsLeft(view.world, round) / cfg.clawRoundBeats));
  const barW = l.width * 0.5;
  const barX = (l.width - barW) / 2;
  ctx.fillStyle = "#241B4F";
  ctx.fillRect(barX, y + 18, barW, 4);
  if (left01 > 0) {
    ctx.fillStyle = left01 < 0.25 ? PALETTE.ember : PALETTE.hull;
    ctx.fillRect(barX, y + 18, Math.max(1, barW * left01), 4);
  }
}

/**
 * The round's own buttons, lit while the machine will answer one.
 *
 * **Player 2's half is empty and stays empty.** `slabPanel` is handed the same
 * set both seats are, and the set has nothing of hers in it — so her screen
 * draws no panel at all rather than a greyed-out copy of his. A disabled
 * button is a promise that it will work later; there is nothing coming.
 */
function drawControls(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  view: ViewState,
  round: ClawState,
): void {
  const live = round.phase === "play";
  // See `ViewState.controls`: `view.world.wave` only indexes the shipped
  // `WAVES` for a host actually playing them, so an explicit `view.controls`
  // wins when one is given.
  const set = view.controls === undefined ? controlSetForWave(view.world.wave) : view.controls;
  for (const slab of slabPanel(l, set, view.role)) {
    ctx.fillStyle = "rgba(16,11,34,.9)";
    ctx.fillRect(slab.x, slab.y, slab.w, slab.h);
    ctx.strokeStyle = live ? PALETTE.hull : PALETTE.grid;
    ctx.lineWidth = 1.6;
    ctx.strokeRect(slab.x + 0.5, slab.y + 0.5, Math.max(1, slab.w - 1), Math.max(1, slab.h - 1));
    ctx.fillStyle = live ? PALETTE.hullRim : PALETTE.dim;
    ctx.font = '600 13px "Courier New",monospace';
    ctx.fillText(slab.control.label, slab.x + slab.w / 2, slab.y + slab.h / 2 + 5);
  }
}

/** The count-in, so the round does not begin on a beat nobody was watching. */
function drawLead(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  view: ViewState,
  round: ClawState,
): void {
  const left = CLAW_LEAD_BEATS - (view.world.beat - round.phaseBeat);
  ctx.fillStyle = PALETTE.hullRim;
  ctx.font = '600 34px "Courier New",monospace';
  ctx.fillText(String(Math.max(1, left)), l.width / 2, l.playHeight * 0.24);
}

/**
 * How it went, over the rail for a few beats.
 *
 * It says what the fishing cost as well as whether the field was cleared,
 * because a rock is the round's own price and it is charged one grab at a time
 * — a screen that only announced the ending would leave the pair to work out
 * where the hull went.
 */
function drawVerdict(ctx: CanvasRenderingContext2D, l: Layout, round: ClawState): void {
  const y = l.playHeight * 0.42;
  ctx.fillStyle = "rgba(5,4,11,.78)";
  ctx.fillRect(0, y - 46, l.width, 96);
  ctx.fillStyle = round.passed ? PALETTE.good : PALETTE.ember;
  ctx.font = '600 20px "Courier New",monospace';
  ctx.fillText(round.passed ? "FIELD CLEARED" : "OUT OF TIME", l.width / 2, y);
  ctx.fillStyle = PALETTE.text;
  ctx.font = '11px "Courier New",monospace';
  ctx.fillText(`${round.pods} up, ${round.rocks} wrong`, l.width / 2, y + 20);
  ctx.fillStyle = round.rocks === 0 && round.passed ? PALETTE.dim : PALETTE.ember;
  ctx.font = '9px "Courier New",monospace';
  ctx.fillText(
    round.passed && round.rocks === 0
      ? "nothing came up that should not have"
      : "THE HULL PAID FOR IT",
    l.width / 2,
    y + 38,
  );
}
