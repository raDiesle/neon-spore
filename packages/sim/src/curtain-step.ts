import {
  type CurtainPhase,
  type CurtainState,
  curtainBody,
  curtainCoreBare,
  curtainLobesLeft,
} from "./curtain.js";
import { removeCreatures } from "./field.js";
import { gripCount } from "./grip.js";
import { nextInt } from "./rng.js";
import { NO_SHELL } from "./shell.js";
import { closeSlow } from "./slow.js";
import { CURTAIN_COLS } from "./span.js";
import { spawnOne } from "./spawn.js";
import type { Creature } from "./types.js";
import type { World } from "./world.js";

/**
 * THE CURTAIN's clock — the soft lobes redrawn, the jam running down, the
 * core's fire, the beats after the last hit — and the pieces every other
 * half of the fight spends: a lobe off, a rock fired, the core drifting, a
 * state entered.
 *
 * Everything here runs on the **beat** from `stepBoss`, after the carry has
 * moved the fabric for this beat. The two halves that are not on the beat are
 * next door and were each cut off this file at the 250-line limit: the shots
 * (`curtain-shot.ts`), because a lobe that waited for the next beat to come
 * off would be a shot the pair watched vanish into cloth, and the hem's lift
 * (`curtain-hand.ts`), because a gap that waited would be one the pilot had
 * already let go of. **The shove — with the jam and the tear it
 * ends in — is `curtain-shove.ts`**, cut when the jam took this file one
 * line over: everything there is the pair's hands on the cloth, and
 * nothing there is the clock. The roll-back stayed here with the count it
 * answers.
 */

/** Install it from the wave's own `boss:` entry. There is nothing to author. */
export function installCurtain(world: World): CurtainState {
  const cfg = world.cfg;
  const id = world.nextId++;
  const col = Math.floor((cfg.cols - CURTAIN_COLS) / 2);
  const body: Creature = {
    id,
    kind: "curtain",
    col,
    row: cfg.curtainRow,
    fromRow: cfg.curtainRow,
    color: null,
    holes: 0,
    petals: 0,
    dragMilli: 0,
    shell: NO_SHELL,
  };
  world.creatures.push(body);
  const lobes: boolean[] = [];
  for (let i = 0; i < CURTAIN_COLS; i++) lobes.push(true);
  const c: CurtainState = {
    kind: "curtain",
    creatureId: id,
    lobes,
    soft: [],
    coreCol: col + nextInt(world.rng, CURTAIN_COLS),
    coreColor: nextInt(world.rng, 2) === 0 ? "red" : "cyan",
    coreHits: 0,
    softBeat: world.beat,
    fireBeat: world.beat,
    moveBeat: world.beat,
    phase: "hung",
    phaseBeat: world.beat,
    liftMilli: 0,
  };
  world.events.push({ type: "curtainUnroll", col, width: CURTAIN_COLS });
  world.events.push({ type: "curtainShadow", col: c.coreCol, color: c.coreColor });
  drawSoft(world, c, body);
  return c;
}

/**
 * Into a state, and the clock with it, because every count in this fight is `world.beat - c.phaseBeat`, so the one
 * place the phase moves is the one place the clock is set. What the state
 * *says* is pushed by the caller, because only the caller knows the column.
 *
 * The hem's carry is left behind wherever it goes. It is read while `pinned`
 * and nowhere else, and a depth kept across a state would have the next lift
 * start where the last one stopped.
 */
export function enterCurtain(world: World, c: CurtainState, phase: CurtainPhase): void {
  if (c.phase === phase) return;
  c.phase = phase;
  c.phaseBeat = world.beat;
  c.liftMilli = 0;
}

/**
 * A new set of soft lobes, `curtainSoftCount` of the ones still hanging over
 * a column of the field — a lobe hanging off the wall cannot be shot, and a
 * cycle spent on one would be a cycle with nothing for player 1 to say.
 */
function drawSoft(world: World, c: CurtainState, body: Creature): void {
  const cfg = world.cfg;
  const pool: number[] = [];
  for (let i = 0; i < c.lobes.length; i++) {
    const col = body.col + i;
    if (c.lobes[i] && col >= 0 && col < cfg.cols) pool.push(i);
  }
  c.soft = [];
  c.softBeat = world.beat;
  while (pool.length > 0 && c.soft.length < cfg.curtainSoftCount) {
    const at = nextInt(world.rng, pool.length);
    const i = pool[at];
    if (i === undefined) break;
    pool.splice(at, 1);
    c.soft.push(i);
    world.events.push({ type: "curtainSoft", col: body.col + i });
  }
  c.soft.sort((a, b) => a - b);
}

/** Lobe `i` comes off the hem, however it went. */
export function curtainLobeOff(world: World, c: CurtainState, body: Creature, i: number): void {
  c.lobes[i] = false;
  c.soft = c.soft.filter((s) => s !== i);
  world.events.push({ type: "curtainLobeOff", col: body.col + i, left: curtainLobesLeft(c) });
}

/** One rock down the core's column. */
export function curtainFire(world: World, c: CurtainState): void {
  c.fireBeat = world.beat;
  world.events.push({ type: "curtainFire", col: c.coreCol });
  spawnOne(world, { beat: world.beat, col: c.coreCol, kind: "torch", color: null });
}

/**
 * The core drifts to another column under the fabric and takes another
 * colour — the shadow has to be read again. A naked core stays where it is:
 * there is no fabric to drift under.
 */
export function curtainDrift(world: World, c: CurtainState, body: Creature | undefined): void {
  c.coreColor = nextInt(world.rng, 2) === 0 ? "red" : "cyan";
  if (body !== undefined) {
    const pool: number[] = [];
    for (let i = 0; i < CURTAIN_COLS; i++) {
      const col = body.col + i;
      if (col !== c.coreCol && col >= 0 && col < world.cfg.cols) pool.push(col);
    }
    const pick = pool[nextInt(world.rng, pool.length)];
    if (pick !== undefined) c.coreCol = pick;
  }
  world.events.push({ type: "curtainShadow", col: c.coreCol, color: c.coreColor });
}

/**
 * One beat of the curtain, after the carry has had this beat's shove.
 *
 * The jam runs down on its own count and hands the rail back. The fabric's
 * glide is closed off unless it moved this beat; a hand on it — or a jam —
 * holds the roll-back clock, and without either it rolls a column back on its
 * count. The soft set is redrawn on its count. A bare core fires on its
 * count, faster once it is naked; a covered one counts nothing, so a hem
 * lifted over it is a gap that shoots back. After the last hit the fight
 * stands `curtainOutBeats` and goes.
 */
export function stepCurtain(world: World, c: CurtainState): void {
  const cfg = world.cfg;
  if (c.phase === "out") {
    // Nulled here rather than at the hit, so the frame has its beats of the
    // core going out before the wave is allowed to end (`bossHoldsWave`).
    if (world.beat - c.phaseBeat >= cfg.curtainOutBeats) {
      removeCreatures(world, [c.creatureId]);
      world.boss = null;
    }
    return;
  }
  if (c.phase === "pinned" && world.beat - c.phaseBeat >= cfg.curtainPinBeats) {
    // The jam ran out unanswered: its slow ends with it (`curtain-shot.ts`).
    closeSlow(world);
    enterCurtain(world, c, "hung");
  }
  const body = curtainBody(world, c);
  if (body !== undefined) {
    if (c.moveBeat !== world.beat) body.fromCol = body.col;
    // A jammed rail holds the roll-back clock as a hand does: it cannot slide
    // either way, so the fabric coming back over the core the tick the jam
    // lifted would be a column the pair was never given the chance to keep.
    if (gripCount(world, body.id) > 0 || c.phase === "pinned") c.moveBeat = world.beat;
    else if (world.beat - c.moveBeat >= cfg.curtainRerollBeats) reroll(world, c, body);
    if (world.beat - c.softBeat >= cfg.curtainSoftBeats) drawSoft(world, c, body);
  }
  if (!curtainCoreBare(world, c)) {
    c.fireBeat = world.beat;
    return;
  }
  const every = c.phase === "torn" ? cfg.curtainNakedFireBeats : cfg.curtainFireBeats;
  if (world.beat - c.fireBeat >= every) curtainFire(world, c);
}

/** Nobody held it: one column back toward the core's shadow standing under its middle. */
function reroll(world: World, c: CurtainState, body: Creature): void {
  const dir = Math.sign(c.coreCol - (body.col + Math.floor(CURTAIN_COLS / 2)));
  if (dir === 0) return;
  body.fromCol = body.col;
  body.col += dir;
  c.moveBeat = world.beat;
  world.events.push({ type: "curtainReroll", col: body.col, dir: dir > 0 ? 1 : -1 });
}
