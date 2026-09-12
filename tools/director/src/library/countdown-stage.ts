import { type CountdownLook, computeLayout, drawLivingBody, showsCount } from "@neon-spore/render";
import { type Creature, createWorld, DEFAULT_CONFIG } from "@neon-spore/sim";
import { type AssetContext, type AssetFrame, BEAT_SECONDS } from "./types.js";

/**
 * The game's own count, drawn on a card wearing a look of the caller's
 * choosing.
 *
 * The field's row for the kind is three calls in a row — the living disc,
 * the look's `over` on both screens, the look's `count` on the pilot's
 * (`creature-body.ts`) — and the card makes the same three, handing the look
 * in rather than swapping `COUNTDOWN_LOOK` for the length of a frame: there
 * is no record to put back, so nothing this card does can outlive it.
 *
 * The card is the pilot's screen, the seat the count is drawn for, and the
 * body's count is read off the card's own beat — `countPhase` nought, so the
 * four looks on four cards count down together: four, three, two, one, then
 * two beats open, then again. `world.beat` is the one thing set on the
 * world per frame, because that is what `countdownMarks` reads.
 */

/** A tile that makes the disc most of a card wide. */
const TILE = 120;
const LAYOUT = computeLayout(
  { width: TILE * DEFAULT_CONFIG.cols, height: TILE * DEFAULT_CONFIG.cols * 2, dpr: 1 },
  DEFAULT_CONFIG,
  "p1",
);

const COUNT: Creature = {
  id: 9,
  kind: "countdown",
  col: 3,
  row: 4,
  fromRow: 4,
  color: "red",
  holes: 0,
  petals: 0,
  dragMilli: 0,
  shell: 0,
  countPhase: 0,
};

/** A world for the body row to read its config and beat off; nothing else in
 * it moves. */
const WORLD = createWorld(DEFAULT_CONFIG, 1);
const NO_BLOCKS: ReadonlyMap<number, number> = new Map();

export function drawCountdownStage(c: AssetContext, f: AssetFrame, look: CountdownLook): void {
  const { ctx, w, h } = c;
  WORLD.beat = f.beat;
  const b = {
    ctx,
    l: LAYOUT,
    world: WORLD,
    c: COUNT,
    x: w / 2,
    y: h / 2,
    time: f.t,
    beats: f.t / BEAT_SECONDS,
    beatPhase: f.beatPhase,
    // `near` is one: the card is at arm's length, and the haze is distance.
    near: 1,
    blocked: NO_BLOCKS,
    turn: 0,
  };
  ctx.save();
  drawLivingBody(b);
  look.over(b);
  if (showsCount(LAYOUT)) look.count(b);
  ctx.restore();
}
