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
import { BOSS_ANTIPHON_SOUNDS } from "./sounds/boss-antiphon.js";
import { BOSS_BATON_SOUNDS } from "./sounds/boss-baton.js";
import { BOSS_BATON_HAND_SOUNDS } from "./sounds/boss-baton-hand.js";
import { BOSS_CURTAIN_SOUNDS } from "./sounds/boss-curtain.js";
import { BOSS_CYST_SOUNDS } from "./sounds/boss-cyst.js";
import { BOSS_DAVIT_SOUNDS } from "./sounds/boss-davit.js";
import { BOSS_FILAMENT_SOUNDS } from "./sounds/boss-filament.js";
import { BOSS_GAUGE_SOUNDS } from "./sounds/boss-gauge.js";
import { BOSS_GIMBAL_SOUNDS } from "./sounds/boss-gimbal.js";
import { BOSS_GORGE_SOUNDS } from "./sounds/boss-gorge.js";
import { BOSS_GRINDSTONE_SOUNDS } from "./sounds/boss-grindstone.js";
import { BOSS_HASP_SOUNDS } from "./sounds/boss-hasp.js";
import { BOSS_HIVE_SOUNDS } from "./sounds/boss-hive.js";
import { BOSS_INSTAR_SOUNDS } from "./sounds/boss-instar.js";
import { BOSS_KEEL_SOUNDS } from "./sounds/boss-keel.js";
import { BOSS_LEAD_SOUNDS } from "./sounds/boss-lead.js";
import { BOSS_LEDGER_SOUNDS } from "./sounds/boss-ledger.js";
import { BOSS_MANTLE_SOUNDS } from "./sounds/boss-mantle.js";
import { BOSS_OCULUS_SOUNDS } from "./sounds/boss-oculus.js";
import { BOSS_PINBALL_HAND_SOUNDS } from "./sounds/boss-pinball-hand.js";
import { BOSS_PLANNED_SOUNDS } from "./sounds/boss-planned.js";
import { BOSS_PLUMB_SOUNDS } from "./sounds/boss-plumb.js";
import { BOSS_PULSE_HAND_SOUNDS } from "./sounds/boss-pulse-hand.js";
import { BOSS_RATCHET_SOUNDS } from "./sounds/boss-ratchet.js";
import { BOSS_RIME_SOUNDS } from "./sounds/boss-rime.js";
import { BOSS_SCOUT_HAND_SOUNDS } from "./sounds/boss-scout-hand.js";
import { BOSS_SCUTTLE_SOUNDS } from "./sounds/boss-scuttle.js";
import { BOSS_SEAM_SOUNDS } from "./sounds/boss-seam.js";
import { BOSS_SINEW_SOUNDS } from "./sounds/boss-sinew.js";
import { BOSS_SLING_SOUNDS } from "./sounds/boss-sling.js";
import { BOSS_SNAKE_BODY_SOUNDS } from "./sounds/boss-snake-body.js";
import { BOSS_SPOOL_SOUNDS } from "./sounds/boss-spool.js";
import { BOSS_SURGE_SOUNDS } from "./sounds/boss-surge.js";
import { BOSS_TASTER_SOUNDS } from "./sounds/boss-taster.js";
import { BOSS_THROAT_SOUNDS } from "./sounds/boss-throat.js";
import { BOSS_TRIVET_SOUNDS } from "./sounds/boss-trivet.js";
import { BOSS_UNDERTOW_SOUNDS } from "./sounds/boss-undertow.js";
import { BOSS_VALVE_SOUNDS } from "./sounds/boss-valve.js";
import { BOSS_VANE_SOUNDS } from "./sounds/boss-vane.js";
import { BOSS_VISE_SOUNDS } from "./sounds/boss-vise.js";
import { BOSS_WARDEN_SOUNDS } from "./sounds/boss-warden.js";
import { BOSS_WELL_SOUNDS } from "./sounds/boss-well.js";
import { CREATURE_SOUNDS } from "./sounds/creature.js";
import { CREATURE_GHOST_SOUNDS } from "./sounds/creature-ghost.js";
import { CREATURE_IDEA_SOUNDS } from "./sounds/creature-ideas.js";
import { CREATURE_STORE_SOUNDS } from "./sounds/creature-store.js";
import { FLEET_SOUNDS } from "./sounds/fleet.js";
import { GRIP_SOUNDS } from "./sounds/grip.js";
import { HULL_SOUNDS } from "./sounds/hull.js";
import { IMPACT_SOUNDS } from "./sounds/impact.js";
import { MIRROR_SOUNDS } from "./sounds/mirror.js";
import { MIRROR_ROUND_SOUNDS } from "./sounds/mirror-round.js";
import { MOTION_SOUNDS } from "./sounds/motion.js";
import { POD_SOUNDS } from "./sounds/pod.js";
import { PULSE_SOUNDS } from "./sounds/pulse.js";
import { SHIP_SOUNDS } from "./sounds/ship.js";
import { SIGNAL_SOUNDS } from "./sounds/signal.js";
import { SPLICE_SOUNDS } from "./sounds/splice.js";
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
  ...BOSS_BATON_SOUNDS,
  ...BOSS_BATON_HAND_SOUNDS,
  ...BOSS_UNDERTOW_SOUNDS,
  ...BOSS_GORGE_SOUNDS,
  ...BOSS_CURTAIN_SOUNDS,
  ...BOSS_TASTER_SOUNDS,
  ...BOSS_LEDGER_SOUNDS,
  ...BOSS_SINEW_SOUNDS,
  ...BOSS_SURGE_SOUNDS,
  ...BOSS_LEAD_SOUNDS,
  ...BOSS_SCUTTLE_SOUNDS,
  ...BOSS_ANTIPHON_SOUNDS,
  ...BOSS_HIVE_SOUNDS,
  ...BOSS_INSTAR_SOUNDS,
  ...BOSS_FILAMENT_SOUNDS,
  ...BOSS_GIMBAL_SOUNDS,
  ...BOSS_SPOOL_SOUNDS,
  ...BOSS_HASP_SOUNDS,
  ...BOSS_RATCHET_SOUNDS,
  ...BOSS_MANTLE_SOUNDS,
  ...BOSS_KEEL_SOUNDS,
  ...BOSS_VALVE_SOUNDS,
  ...BOSS_SEAM_SOUNDS,
  ...BOSS_OCULUS_SOUNDS,
  ...BOSS_VISE_SOUNDS,
  ...BOSS_RIME_SOUNDS,
  ...BOSS_TRIVET_SOUNDS,
  ...BOSS_PLUMB_SOUNDS,
  ...BOSS_SLING_SOUNDS,
  ...BOSS_GRINDSTONE_SOUNDS,
  ...BOSS_CYST_SOUNDS,
  ...BOSS_DAVIT_SOUNDS,
  ...BOSS_WARDEN_SOUNDS,
  ...BOSS_VANE_SOUNDS,
  ...BOSS_THROAT_SOUNDS,
  ...BOSS_SNAKE_BODY_SOUNDS,
  ...BOSS_PINBALL_HAND_SOUNDS,
  ...BOSS_SCOUT_HAND_SOUNDS,
  ...BOSS_PULSE_HAND_SOUNDS,
  ...BOSS_GAUGE_SOUNDS,
  ...BOSS_WELL_SOUNDS,
  ...BOSS_PLANNED_SOUNDS,
  ...FLEET_SOUNDS,
  ...SPLICE_SOUNDS,
  ...PULSE_SOUNDS,
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
