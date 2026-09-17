import {
  type CurtainState,
  curtainBody,
  curtainBoss,
  curtainCoreBare,
  curtainLobesLeft,
  curtainReach,
  curtainStride,
} from "./curtain.js";
import { removeCreatures } from "./field.js";
import { gripCount } from "./grip.js";
import { nextInt } from "./rng.js";
import { NO_SHELL } from "./shell.js";
import { bodyCenterCol, CURTAIN_COLS } from "./span.js";
import { spawnOne } from "./spawn.js";
import type { Creature } from "./types.js";
import type { World } from "./world.js";

/**
 * THE CURTAIN's clock — the soft lobes redrawn, the roll-back, the core's
 * fire, the beats after the last hit — and the three moments the pair's
 * hands and shots meet it: the fabric shoved (`curtainShoved`, from the
 * carry) — and the pieces the shots spend, which `curtain-shot.ts` calls
 * from the tick: a lobe off, a rock fired, the core drifting.
 *
 * Everything here runs on the **beat** from `stepBoss`, after the carry has
 * moved the fabric for this beat; the shots are next door and on the tick,
 * because a lobe that waited for the next beat to come off would be a shot
 * the pair watched vanish into cloth.
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
    tornBeat: -1,
    outBeat: -1,
  };
  world.events.push({ type: "curtainUnroll", col, width: CURTAIN_COLS });
  world.events.push({ type: "curtainShadow", col: c.coreCol, color: c.coreColor });
  drawSoft(world, c, body);
  return c;
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
 * **The carry, at boss scale.** Both hands are already reconciled by the
 * time this is called — `carryDir` has cancelled two thumbs going opposite
 * ways and `spend` has charged the ones that won — so what is left is one
 * direction and a stride. A bare hem cannot hold its rail and the shove
 * tears the sheet off instead of moving it.
 */
export function curtainShoved(
  world: World,
  body: Creature,
  dir: -1 | 1,
  paid: readonly (1 | 2)[],
): void {
  const c = curtainBoss(world);
  if (c === null || c.creatureId !== body.id) return;
  for (const player of paid) {
    world.events.push({
      type: "carry",
      player,
      col: bodyCenterCol(body, body.col),
      row: body.row,
      dir,
    });
  }
  if (curtainLobesLeft(c) === 0) {
    removeCreatures(world, [body.id]);
    c.soft = [];
    c.tornBeat = world.beat;
    c.fireBeat = world.beat;
    world.events.push({ type: "curtainTear", col: c.coreCol });
    return;
  }
  const stride = curtainStride(c, world.cfg);
  const reach = curtainReach(world.cfg);
  const to = Math.max(reach.min, Math.min(reach.max, body.col + dir * stride));
  if (to === body.col) return;
  body.fromCol = body.col;
  body.col = to;
  c.moveBeat = world.beat;
  world.events.push({ type: "curtainShove", col: to, dir, stride });
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

/**
 * One beat of the curtain, after the carry has had this beat's shove.
 *
 * The fabric's glide is closed off unless it moved this beat; a hand on it
 * holds the roll-back clock, and without one it rolls a column back on its
 * count. The soft set is redrawn on its count. A bare core fires on its
 * count, faster once it is naked; a covered one counts nothing. After the
 * last hit the fight stands `curtainOutBeats` and goes.
 */
export function stepCurtain(world: World, c: CurtainState): void {
  const cfg = world.cfg;
  if (c.outBeat >= 0) {
    // Nulled here rather than at the hit, so the frame has its beats of the
    // core going out before the wave is allowed to end (`bossHoldsWave`).
    if (world.beat - c.outBeat >= cfg.curtainOutBeats) {
      removeCreatures(world, [c.creatureId]);
      world.boss = null;
    }
    return;
  }
  const body = curtainBody(world, c);
  if (body !== undefined) {
    if (c.moveBeat !== world.beat) body.fromCol = body.col;
    if (gripCount(world, body.id) > 0) c.moveBeat = world.beat;
    else if (world.beat - c.moveBeat >= cfg.curtainRerollBeats) reroll(world, c, body);
    if (world.beat - c.softBeat >= cfg.curtainSoftBeats) drawSoft(world, c, body);
  }
  if (!curtainCoreBare(world, c)) {
    c.fireBeat = world.beat;
    return;
  }
  const every = c.tornBeat >= 0 ? cfg.curtainNakedFireBeats : cfg.curtainFireBeats;
  if (world.beat - c.fireBeat >= every) curtainFire(world, c);
}
