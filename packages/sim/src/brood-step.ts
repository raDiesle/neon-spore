import { metColor } from "./balance.js";
import { bossColourMissed } from "./boss-wrong-colour.js";
import {
  type BroodBud,
  type BroodState,
  type BroodStep,
  broodBoss,
  broodBudIn,
  broodCentre,
  broodColOf,
  broodCovers,
  broodHangs,
  broodLitStep,
  broodLobes,
  freshBrood,
} from "./brood.js";
import { broodLay, broodLayDue, broodSpawnBody, broodSway } from "./brood-lay.js";
import { midCol } from "./config.js";
import type { Bullet } from "./types.js";
import { MILLI, type World } from "./world.js";

/**
 * THE BROOD's clock — coming down, a step's buds growing and dropping, the
 * rest between steps, and the beats after the last; its laying and swaying
 * are `brood-lay.ts`, called from here — and the one moment a
 * bolt meets it: a bud on the rim, or the sac's hide, met in mid-field as a
 * body would be (`broodAlong`, from `boss-along.ts`).
 *
 * **No step opens THE SLOW.** The field around the sac is the ordinary field,
 * and a dropped bud is an ordinary body falling: slowing the buds would slow
 * what they drop, and the pair would be learning a fall that no other wave
 * has. A bud's window is its ripening, eight beats or more, which is the
 * owner's *a shot gets time* (6 October 2026) without the slow.
 */

export function installBrood(world: World, steps: readonly BroodStep[]): BroodState {
  const s = freshBrood(world.beat, steps);
  world.events.push({ type: "broodEnter", col: midCol(world.cfg) });
  return s;
}

/**
 * One beat of THE BROOD: it comes down, a step's buds grow, a ripe bud drops
 * and starts again, a beaten step rests, and the last one beaten it goes.
 */
export function stepBrood(world: World, s: BroodState): void {
  const cfg = world.cfg;
  const since = world.beat - s.phaseBeat;
  if (s.phase === "spent") {
    if (since >= cfg.broodSpentBeats) {
      world.events.push({ type: "broodOut", col: broodCentre(cfg, s) });
      world.boss = null;
    }
    return;
  }
  broodLayDue(world, s);
  if (s.phase === "enter") {
    if (since >= cfg.broodEnterBeats) grow(world, s);
    return;
  }
  if (s.phase === "rest" && since >= cfg.broodRestBeats) grow(world, s);
  else if (s.phase === "grow") {
    const step = broodLitStep(s);
    if (step !== null) broodSway(world, s, step);
    ripen(world, s);
  }
  broodLay(world, s);
}

/** The next step's buds begin, all on this beat. */
function grow(world: World, s: BroodState): void {
  const step = s.steps[s.cursor];
  if (step === undefined) return;
  s.phase = "grow";
  s.phaseBeat = world.beat;
  s.buds = step.buds.map((plan) => ({
    col: broodColOf(world.cfg, plan, s.sway),
    color: plan.color,
    bornBeat: world.beat,
    popped: false,
  }));
  for (const b of s.buds) world.events.push({ type: "broodBud", col: b.col, color: b.color });
}

/** Every bud ripe this beat drops; every bud regrown this beat is said again. */
function ripen(world: World, s: BroodState): void {
  const step = broodLitStep(s);
  if (step === null) return;
  for (const b of s.buds) {
    if (b.popped) continue;
    if (b.bornBeat === world.beat) {
      world.events.push({ type: "broodBud", col: b.col, color: b.color });
    }
    if (broodHangs(world, b) && world.beat - b.bornBeat >= step.ripenBeats) drop(world, s, b);
  }
}

/**
 * A ripe bud falls from the rim as the body it was growing into, from the
 * bud's own row rather than the top of the field, and its lobe grows it again.
 */
function drop(world: World, s: BroodState, b: BroodBud): void {
  broodSpawnBody(world, b.col, b.color);
  s.dropped += 1;
  b.bornBeat = world.beat + world.cfg.broodRegrowBeats;
  world.events.push({ type: "broodDrop", col: b.col, color: b.color });
}

/**
 * Where a bolt sweeping from `from` to `to` meets THE BROOD, thousandths of a
 * row, or -1: a bud on the rim, or the sac's hide under it. Asked beside the
 * bodies in the same sweep, so a body standing below the rim is met first.
 */
export function broodAlong(world: World, bullet: Bullet, from: number, to: number): number {
  const s = broodBoss(world);
  if (s === null || s.phase === "enter" || s.phase === "spent") return -1;
  if (!broodCovers(world.cfg, bullet.col, s.sway)) return -1;
  const at = world.cfg.broodBudRow * MILLI;
  return from < at || at < to ? -1 : at;
}

/**
 * A bolt meeting THE BROOD, once `broodAlong` has said it does. A bud of its
 * colour pops and the sac loses a lobe; a bud of the other colour is the
 * default every boss keeps — the wave lost (`boss-wrong-colour.ts`); and the
 * hide, where no bud hangs, takes the bolt and nothing happens.
 */
export function broodStruck(world: World, bullet: Bullet): void {
  const s = broodBoss(world);
  if (s === null) return;
  const col = bullet.col;
  const bud = broodBudIn(world, s, col);
  if (bud === undefined) {
    world.events.push({ type: "broodHide", col });
    return;
  }
  if (bud.color !== bullet.color) {
    world.events.push({ type: "broodSpoil", col, color: bullet.color });
    bossColourMissed(world);
    return;
  }
  metColor(world);
  bud.popped = true;
  world.events.push({ type: "broodPop", col, color: bud.color, left: broodLobes(s) });
  if (s.buds.every((b) => b.popped)) beaten(world, s);
}

/** A step's last bud popped: rest before the next, or, after the last, spent. */
function beaten(world: World, s: BroodState): void {
  s.cursor += 1;
  s.phaseBeat = world.beat;
  s.buds = [];
  if (s.cursor >= s.steps.length) {
    s.phase = "spent";
    // Beaten, it lays nothing more: what was growing inside it dies with it.
    s.eggs = [];
    world.events.push({ type: "broodSpent", col: broodCentre(world.cfg, s) });
    return;
  }
  s.phase = "rest";
}
