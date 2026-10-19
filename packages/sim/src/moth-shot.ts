import { metColor } from "./balance.js";
import { bossColourMissed } from "./boss-wrong-colour.js";
import {
  type MothState,
  mothBellyOpen,
  mothBoss,
  mothCovers,
  mothLitSpots,
  mothLitStep,
  mothLobes,
  mothMeetMilli,
} from "./moth.js";
import { mothFlee } from "./moth-step.js";
import type { Bullet } from "./types.js";
import type { World } from "./world.js";

/**
 * Where a bolt sweeping from `from` to `to` meets THE MOTH, thousandths of a
 * row, or -1: its body or its wings, at the row it has sunk to. Asked beside
 * the bodies in the same sweep, so a slick under a wing is met first.
 */
export function mothAlong(world: World, bullet: Bullet, from: number, to: number): number {
  const s = mothBoss(world);
  if (s === null || s.phase === "enter" || s.phase === "spent") return -1;
  if (!mothCovers(world.cfg, s, bullet.col)) return -1;
  const at = mothMeetMilli(world.cfg, s);
  return from < at || at < to ? -1 : at;
}

/**
 * A bolt meeting THE MOTH, once `mothAlong` has said it does. A lit spot
 * tears its wing; the open belly throws it up and away; a lit part met in
 * another colour is the default every boss keeps — the wave lost
 * (`boss-wrong-colour.ts`); anything else takes the bolt and nothing happens.
 */
export function mothStruck(world: World, bullet: Bullet): void {
  const s = mothBoss(world);
  if (s === null) return;
  const col = bullet.col;
  const off = col - s.centre;
  const spot = mothLitSpots(s).includes(off) ? s.spots.indexOf(off) : -1;
  const belly = mothBellyOpen(s) && off === 0;
  if (spot < 0 && !belly) {
    world.events.push({ type: "mothHide", col });
    return;
  }
  if (bullet.color !== "red") {
    world.events.push({ type: "mothSpoil", col });
    bossColourMissed(world);
    return;
  }
  metColor(world);
  if (spot >= 0) {
    s.spots.splice(spot, 1);
    world.events.push({ type: "mothTear", col, left: mothLobes(s) });
    if (s.spots.length === 0) beaten(world, s);
    return;
  }
  s.hits += 1;
  s.settle = 0;
  world.events.push({ type: "mothBelly", col, left: mothLobes(s) });
  const step = mothLitStep(s);
  if (step?.kind === "belly" && s.hits >= step.hits) beaten(world, s);
  else mothFlee(world, s);
}

/** A step's last part hit: rest before the next, or, after the last, spent. */
function beaten(world: World, s: MothState): void {
  s.cursor += 1;
  s.phaseBeat = world.beat;
  s.spots = [];
  s.settle = 0;
  if (s.cursor >= s.steps.length) {
    s.phase = "spent";
    world.events.push({ type: "mothSpent", col: s.centre });
    return;
  }
  s.phase = "rest";
}
