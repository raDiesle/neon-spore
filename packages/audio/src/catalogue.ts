/**
 * Every sound the game knows about, in one list.
 *
 * Two things read this. The game reads it through `bind.ts`, which maps what
 * the simulation reported onto an id. A person reads it through the director's
 * SOUND tab, which is the point of the `status` and `use` fields: a sound that
 * is built and unclaimed is a thing you can listen to and then decide to spend,
 * which is cheaper than commissioning one for an idea that may not survive.
 */

import { AMBIENT_SOUNDS } from "./sounds/ambient.js";
import { ASSIST_SOUNDS } from "./sounds/assist.js";
import { BEAT_SOUNDS } from "./sounds/beat.js";
import { BOSS_SOUNDS } from "./sounds/boss.js";
import { BOSS_PLANNED_SOUNDS } from "./sounds/boss-planned.js";
import { CREATURE_SOUNDS } from "./sounds/creature.js";
import { CREATURE_GHOST_SOUNDS } from "./sounds/creature-ghost.js";
import { CREATURE_IDEA_SOUNDS } from "./sounds/creature-ideas.js";
import { CREATURE_STORE_SOUNDS } from "./sounds/creature-store.js";
import { GRIP_SOUNDS } from "./sounds/grip.js";
import { HULL_SOUNDS } from "./sounds/hull.js";
import { IMPACT_SOUNDS } from "./sounds/impact.js";
import { MIRROR_SOUNDS } from "./sounds/mirror.js";
import { MIRROR_ROUND_SOUNDS } from "./sounds/mirror-round.js";
import { MOTION_SOUNDS } from "./sounds/motion.js";
import { POD_SOUNDS } from "./sounds/pod.js";
import { SHIP_SOUNDS } from "./sounds/ship.js";
import { SIGNAL_SOUNDS } from "./sounds/signal.js";
import { SWARM_SOUNDS } from "./sounds/swarm.js";
import { UI_SOUNDS } from "./sounds/ui.js";
import type { Family, SoundDef } from "./types.js";

export const CATALOGUE: readonly SoundDef[] = [
  ...BEAT_SOUNDS,
  ...SHIP_SOUNDS,
  ...GRIP_SOUNDS,
  ...IMPACT_SOUNDS,
  ...HULL_SOUNDS,
  ...POD_SOUNDS,
  ...BOSS_SOUNDS,
  ...BOSS_PLANNED_SOUNDS,
  ...MIRROR_SOUNDS,
  ...MIRROR_ROUND_SOUNDS,
  ...UI_SOUNDS,
  ...AMBIENT_SOUNDS,
  ...CREATURE_SOUNDS,
  ...CREATURE_GHOST_SOUNDS,
  ...CREATURE_IDEA_SOUNDS,
  ...CREATURE_STORE_SOUNDS,
  ...ASSIST_SOUNDS,
  ...SIGNAL_SOUNDS,
  ...SWARM_SOUNDS,
  ...MOTION_SOUNDS,
];

const BY_ID = new Map(CATALOGUE.map((s) => [s.id, s]));

/**
 * The one way to reach a sound. It throws rather than returning undefined: an
 * id that is not in the catalogue is a typo in a binding, and a typo that
 * plays silence is a bug nobody hears until someone asks why the shield is
 * quiet.
 */
export function sound(id: string): SoundDef {
  const def = BY_ID.get(id);
  if (!def) throw new Error(`no sound "${id}" in the catalogue`);
  return def;
}

export function hasSound(id: string): boolean {
  return BY_ID.has(id);
}

/** In catalogue order, which is family order. */
export function byFamily(family: Family): SoundDef[] {
  return CATALOGUE.filter((s) => s.family === family);
}

/** Every family that has at least one sound, in the order they first appear. */
export function families(): Family[] {
  const seen: Family[] = [];
  for (const s of CATALOGUE) if (!seen.includes(s.family)) seen.push(s.family);
  return seen;
}
