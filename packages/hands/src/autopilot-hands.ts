import type { World } from "@neon-spore/sim";
import { fieldHand } from "./autopilot-field-hand.js";
import { fleetHand } from "./boss-hand-fleet.js";
import { hiveHand } from "./boss-hand-hive.js";
import { batonHand, throatHand } from "./boss-hands-beats.js";
import { leadHand, ledgerHand, tasterHand } from "./boss-hands-clocks.js";
import { curtainHand, gorgeHand, scuttleHand } from "./boss-hands-field.js";
import { gaugeHand } from "./boss-hands-gauge.js";
import { gimbalHand } from "./boss-hands-gimbal.js";
import { filamentHand, sinewHand, surgeHand } from "./boss-hands-handles.js";
import { haspHand } from "./boss-hands-hasp.js";
import { keelHand } from "./boss-hands-keel.js";
import { mantleHand } from "./boss-hands-mantle.js";
import { oculusHand } from "./boss-hands-oculus.js";
import { queenHand } from "./boss-hands-queen.js";
import { ratchetHand } from "./boss-hands-ratchet.js";
import { mazeHand, mirrorHand, pinballHand } from "./boss-hands-rounds.js";
import { instarHand, nettleHand } from "./boss-hands-scene.js";
import { scoutHand } from "./boss-hands-scout.js";
import { vaneHand, wardenHand } from "./boss-hands-shots.js";
import { snakeHand } from "./boss-hands-snake.js";
import { spoolHand } from "./boss-hands-spool.js";
import { lidHand } from "./boss-hands-stare.js";
import { antiphonHand, cairnHand, spliceHand, undertowHand } from "./boss-hands-takes.js";
import { pulseHand, repriseHand } from "./boss-hands-unseen.js";
import { wellHoldHand, wellWindHand } from "./boss-hands-well.js";
import type { Hand } from "./hand.js";

export type BossKind = NonNullable<World["boss"]>["kind"];

/** The first hand with something to say this tick — two hands that take turns
 * on one handle, each silent while the other's phase is up. */
const either =
  (...hands: Hand[]): Hand =>
  (w) => {
    for (const hand of hands) {
      const out = hand(w);
      if (out.length > 0) return out;
    }
    return [];
  };

/**
 * **The hand the autopilot plays each boss with**: the one the poses reach the
 * boss's defeat with, because that is the hand that plays it *right*. The
 * poses' other hands — THE SINEW's snap, THE SPOOL's wrong turn, THE LEAD's
 * late one — play it wrong on purpose, to reach a state, and are not here.
 *
 * A boss with no row has no hand anywhere in the director, and the autopilot
 * says so rather than guessing. THE PULSE and THE REPRISE were the last two,
 * until `boss-hands-unseen.ts`.
 */
export const AUTOPILOT_HANDS: Partial<Record<BossKind, Hand>> = {
  antiphon: antiphonHand,
  baton: batonHand,
  cairn: cairnHand,
  curtain: curtainHand,
  filament: filamentHand,
  fleet: fleetHand,
  gauge: gaugeHand,
  gimbal: gimbalHand,
  gorge: gorgeHand,
  hasp: haspHand,
  hive: hiveHand,
  instar: instarHand,
  keel: keelHand,
  lead: leadHand,
  ledger: ledgerHand,
  mantle: mantleHand,
  maze: mazeHand,
  mirror: mirrorHand,
  nettle: nettleHand,
  oculus: oculusHand,
  pinball: pinballHand,
  pulse: pulseHand,
  queen: queenHand,
  ratchet: ratchetHand,
  reprise: repriseHand,
  scout: scoutHand,
  scuttle: scuttleHand,
  sinew: sinewHand,
  snake: snakeHand,
  splice: spliceHand,
  spool: spoolHand,
  stare: lidHand(true),
  surge: surgeHand,
  taster: tasterHand,
  throat: throatHand,
  undertow: undertowHand,
  vane: vaneHand,
  warden: wardenHand,
  // The hold while the face slips, then the wind home once it has stopped.
  well: either(wellWindHand, wellHoldHand),
};

/** The hand for the boss on the field, null for a boss with no hand, and the
 * cannon and shield played together when there is no boss at all
 * (`autopilot-field-hand.ts`). */
export function autopilotHand(w: World): Hand | null {
  return w.boss ? (AUTOPILOT_HANDS[w.boss.kind] ?? null) : fieldHand;
}
