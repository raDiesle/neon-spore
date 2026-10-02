import { metColor, missedColor } from "./balance.js";
import { midCol } from "./config.js";
import {
  type GorgeIntake,
  type GorgeLevel,
  type GorgeState,
  gorgeBeads,
  gorgeBoss,
  gorgeBottom,
  gorgeDue,
  gorgeLevelOf,
  gorgePhase,
  gorgeSated,
} from "./gorge.js";
import { gorgeColOf, gorgeRowOf, gorgeSlow, turnRing } from "./gorge-ring.js";
import { livingKindForColor } from "./kinds.js";
import { nextInt } from "./rng.js";
import { spawnOne } from "./spawn.js";
import type { Bullet, Color } from "./types.js";
import { MILLI, type World } from "./world.js";

/**
 * THE GORGE's clock — a level hung, the ring turning, the pause between
 * levels and the beats after the last — and the one moment a shot meets it:
 * a bubble in mid-field, in its column, met as a body would be
 * (`gorgeAlong`, from `bullets.ts` and `lance-burn.ts`). The beat's work runs
 * from `stepBoss`; the tap is `gorge-hand.ts`.
 */

/** Install it with the wave's levels, the first one hung at once. */
export function installGorge(world: World, levels: readonly GorgeLevel[]): GorgeState {
  const g: GorgeState = {
    kind: "gorge",
    col: 0,
    // Copied, never shared: the state is the world's, and a content list
    // edited in place would change a fight already under way.
    levels: levels.map((v) => ({ ...v })),
    level: 0,
    intakes: [],
    next: 0,
    turn: 0,
    turnFrom: 0,
    turnBeat: world.beat,
    clearBeat: -1,
    outBeat: -1,
  };
  hang(world, g);
  return g;
}

/**
 * Put level `g.level` up, centred on the middle column. The shape is the
 * level's; what each bubble wants is rolled here: a total from the level's
 * range and a colour, the first `mixed` of them (with two shots or more to
 * split) asking for some of each, and on an ordered level a shuffled order.
 */
function hang(world: World, g: GorgeState): void {
  const cfg = world.cfg;
  const level = gorgeLevelOf(g);
  const width = Math.min(level.intakes, cfg.cols);
  g.col = Math.max(0, Math.min(cfg.cols - width, midCol(cfg) - Math.floor(width / 2)));
  g.intakes = [];
  for (let i = 0; i < width; i++) {
    const total = level.needMin + nextInt(world.rng, level.needMax - level.needMin + 1);
    const k: GorgeIntake = { needRed: 0, needCyan: 0, gotRed: 0, gotCyan: 0, order: -1, taps: 0 };
    if (i < level.mixed && total >= 2) {
      k.needRed = 1 + nextInt(world.rng, total - 1);
      k.needCyan = total - k.needRed;
    } else if (nextInt(world.rng, 2) === 0) k.needRed = total;
    else k.needCyan = total;
    g.intakes.push(k);
  }
  if (level.ordered) {
    const order = g.intakes.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = nextInt(world.rng, i + 1);
      const t = order[i] ?? 0;
      order[i] = order[j] ?? 0;
      order[j] = t;
    }
    g.intakes.forEach((k, i) => {
      k.order = order[i] ?? 0;
    });
  }
  g.next = 0;
  g.turn = 0;
  g.turnFrom = 0;
  g.turnBeat = world.beat;
  g.clearBeat = -1;
  world.events.push({ type: "gorgeSettle", row: gorgeRowOf(world.cfg, g), col: g.col, width });
  gorgeSlow(world, g);
}

/** The bubble a shot up `col` meets, or `-1`: none there, the level not being fed, or sated. */
function bubbleIn(world: World, g: GorgeState, col: number): number {
  const phase = gorgePhase(g);
  if (phase !== "row" && phase !== "ring") return -1;
  const i = phase === "ring" ? gorgeBottom(g) : col - g.col;
  const k = g.intakes[i];
  if (k === undefined || gorgeSated(k) || gorgeColOf(world.cfg, g, i) !== col) return -1;
  return i;
}

/**
 * Where a bubble stands in this shot's column and sweep, in thousandths of a
 * row, or -1. Asked beside the bodies and pods in the same segment, so
 * whichever stands lowest is met first (`vaneMouthAlong`'s rule). A sated
 * bubble is shut for good, and a shot flies on past it.
 */
export function gorgeAlong(world: World, bullet: Bullet, from: number, to: number): number {
  const g = gorgeBoss(world);
  if (g === null || bubbleIn(world, g, bullet.col) < 0) return -1;
  const at = gorgeRowOf(world.cfg, g) * MILLI;
  return from < at || at < to ? -1 : at;
}

/**
 * A shot meeting the bubble in its column, once `gorgeAlong` has said one is
 * there. Out of turn, or a ring's bubble not yet tapped open, it is refused:
 * spat back down the column as a body of the shot's colour. The colour it
 * still wants fills it a step; the other takes a step back out.
 */
export function gorgeStruck(world: World, bullet: Bullet): void {
  const g = gorgeBoss(world);
  if (g === null) return;
  const i = bubbleIn(world, g, bullet.col);
  const k = g.intakes[i];
  if (k === undefined) return;
  const col = bullet.col;
  const color = bullet.color;
  const shut = gorgeLevelOf(g).ring && k.taps < world.cfg.gorgeOpenTaps;
  if (shut || !gorgeDue(g, i)) {
    world.events.push({ type: "gorgeSpit", row: gorgeRowOf(world.cfg, g), col, color });
    spawnOne(world, { beat: world.beat, col, kind: livingKindForColor(color), color });
    return;
  }
  if (wants(k, color)) {
    metColor(world);
    if (color === "red") k.gotRed += 1;
    else k.gotCyan += 1;
    world.events.push({
      type: "gorgeSwallow",
      row: gorgeRowOf(world.cfg, g),
      col,
      color,
      beads: k.gotRed + k.gotCyan,
    });
    if (gorgeSated(k)) sated(world, g, col, color);
    return;
  }
  missedColor(world);
  spill(k, color);
  world.events.push({
    type: "gorgeEmptied",
    row: gorgeRowOf(world.cfg, g),
    col,
    beads: k.gotRed + k.gotCyan,
  });
}

function wants(k: GorgeIntake, color: Color): boolean {
  return color === "red" ? k.gotRed < k.needRed : k.gotCyan < k.needCyan;
}

/** One shot back out: of the colour that went in if it holds any, else of the other. */
function spill(k: GorgeIntake, color: Color): void {
  const red = color === "red" ? k.gotRed > 0 : k.gotCyan === 0;
  if (red) k.gotRed = Math.max(0, k.gotRed - 1);
  else k.gotCyan = Math.max(0, k.gotCyan - 1);
}

function sated(world: World, g: GorgeState, col: number, color: Color): void {
  world.events.push({ type: "gorgeFull", row: gorgeRowOf(world.cfg, g), col, color });
  if (gorgeLevelOf(g).ordered) g.next += 1;
  if (g.intakes.every(gorgeSated)) {
    g.clearBeat = world.beat;
    world.events.push({
      type: "gorgeCleared",
      row: gorgeRowOf(world.cfg, g),
      col: g.col,
      level: g.level,
    });
  }
  gorgeSlow(world, g);
}

/**
 * One beat of THE GORGE. A ring turns on its count. A sated level stands its
 * gap, then the next is hung — or, after the last, it is out, and stands
 * `gorgeOutBeats` more before it goes, so the frame has its beats of bubbles
 * leaving before the wave may end (`bossHoldsWave`).
 */
export function stepGorge(world: World, g: GorgeState): void {
  const cfg = world.cfg;
  const phase = gorgePhase(g);
  if (phase === "out") {
    if (world.beat - g.outBeat >= cfg.gorgeOutBeats) world.boss = null;
    return;
  }
  if (phase === "clear") {
    if (world.beat - g.clearBeat < cfg.gorgeLevelGapBeats) return;
    if (g.level + 1 < g.levels.length) {
      g.level += 1;
      hang(world, g);
      return;
    }
    g.outBeat = world.beat;
    world.events.push({
      type: "gorgeOut",
      row: gorgeRowOf(world.cfg, g),
      col: g.col,
      beads: gorgeBeads(g),
    });
    return;
  }
  if (phase === "ring" && world.beat - g.turnBeat >= cfg.gorgeTurnBeats) turnRing(world, g);
  gorgeSlow(world, g);
}
