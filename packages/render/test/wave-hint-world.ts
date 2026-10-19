import { expect } from "bun:test";
import {
  buildBoss,
  buildPods,
  buildQueue,
  controlSetForWave,
  placedFaults,
  setLance,
  WAVES,
} from "@neon-spore/content";
import { createWorld, DEFAULT_CONFIG, startWave, step, type World } from "@neon-spore/sim";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { HINT_BEATS, hinting, waveHint } from "../src/wave-hint.js";

/**
 * **The worlds a hint is read on**, for `wave-hint.test.ts`: a wave started as
 * the game starts one, played to its first line, walked through every state a
 * line can be true in. Its own file at that test's length ceiling.
 */

export const CFG = { ...DEFAULT_CONFIG, briefings: false };
export const FIRST = WAVES.findIndex((w) => w.id === "firstStep");
export const PHONE = { width: 390, height: 844, dpr: 2 };
export const SIZES = [
  PHONE,
  { width: 320, height: 568, dpr: 1 },
  { width: 900, height: 1600, dpr: 2 },
];
export const HINTED = WAVES.flatMap((w, i) => (w.hints === undefined ? [] : [i]));

/** A wave started as the game starts one (`apps/game/src/waves.ts`), nobody playing it. */
export function started(wave: number): World {
  const world = createWorld(CFG, 7);
  const [cols, faults] = [CFG.cols, placedFaults(WAVES[wave]?.faults)];
  const [pods, boss] = [buildPods(wave, cols), buildBoss(wave, cols)];
  const lance = setLance(controlSetForWave(wave));
  startWave(world, wave, buildQueue(wave, cols), pods, boss, false, 0, faults, lance);
  return world;
}

/**
 * A wave in play, stepped until its first body is on the field — and, on a
 * hinted wave, until some screen is shown a line: TAP opens on a bulb its
 * lesson is not about (`HINTS_ABOUT`).
 */
export function played(wave = FIRST): World {
  const world = started(wave);
  const def = WAVES[wave]!;
  const ready = () =>
    world.creatures.length > 0 &&
    (def.hints === undefined || said(world, "p1") !== null || said(world, "p2") !== null);
  for (let i = 0; i < 4000 && !ready(); i++) step(world, []);
  expect(world.creatures.length, `${def.name}: no body arrived`).toBeGreaterThan(0);
  return world;
}

/**
 * The wave played on with nobody playing it, `explore` run at every arrival
 * while it still teaches: THE MINE's second body is the other seat's.
 */
export function eachArrival(wave: number, explore: (world: World) => void): void {
  const world = started(wave);
  let at = 0;
  for (let i = 0; i < 4000 && (world.spawned === 0 || hinting(world)); i++) {
    step(world, []);
    if (world.spawned > at && hinting(world)) {
      at = world.spawned;
      explore(world);
    }
  }
}

export function body(world: World) {
  return world.creatures[0]!;
}

const PLAYED = new Map<number, World>();

/** `played`, once per wave: the readings below change the world and put it back. */
export function playedOnce(wave: number): World {
  const found = PLAYED.get(wave) ?? played(wave);
  PLAYED.set(wave, found);
  return found;
}

/**
 * Every state a line can be true in, one after another: each column for the
 * cannon, the shield with it and away from it, the next body free and held,
 * and enough beats for every line of a seat to take its turn.
 */
export function* states(world: World): Generator<void> {
  const [col, shield, grip, beat] = [world.cannonCol, world.shieldCol, world.gripP1, world.beat];
  const next = world.creatures.reduce((a, c) => (c.row > a.row ? c : a));
  for (const _ of shot(world)) {
    for (let c = 0; c < CFG.cols; c++) {
      for (const s of [c, (c + 3) % CFG.cols]) {
        for (const held of [false, true]) {
          for (let turn = 0; turn < 8; turn++) {
            world.cannonCol = c;
            world.shieldCol = s;
            world.gripP1 = held ? next.id : grip;
            world.beat = turn * HINT_BEATS;
            yield;
          }
        }
      }
    }
  }
  [world.cannonCol, world.shieldCol, world.gripP1, world.beat] = [col, shield, grip, beat];
}

/**
 * The field as it stands, then as a shot would have left it: the first pod
 * knocked loose, every morsel limp — the states nobody playing ever reaches.
 */
function* shot(world: World): Generator<void> {
  yield;
  const pod = world.pods[0];
  const morsels = world.creatures.filter((c) => c.kind === "morsel");
  if (pod === undefined && morsels.length === 0) return;
  const loose = pod?.loose;
  if (pod) pod.loose = true;
  for (const m of morsels) m.morselLimp = true;
  yield;
  if (pod && loose !== undefined) pod.loose = loose;
  for (const m of morsels) delete m.morselLimp;
}

export function said(world: World, role: ViewRole) {
  return waveHint(computeLayout(PHONE, CFG, role), world, 0.5);
}
