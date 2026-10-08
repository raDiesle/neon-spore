import type { World } from "@neon-spore/sim";
import { fieldHand } from "./autopilot-field-hand.js";
import { fleetHand } from "./boss-hand-fleet.js";
import { hiveHand } from "./boss-hand-hive.js";
import { batonHand, throatHand } from "./boss-hands-beats.js";
import { capstanHand } from "./boss-hands-capstan.js";
import { leadHand, ledgerHand, tasterHand } from "./boss-hands-clocks.js";
import { cystHand } from "./boss-hands-cyst.js";
import { curtainHand, gorgeHand, scuttleHand } from "./boss-hands-field.js";
import { flueHand } from "./boss-hands-flue.js";
import { gallHand } from "./boss-hands-gall.js";
import { gaugeHand } from "./boss-hands-gauge.js";
import { gimbalHand } from "./boss-hands-gimbal.js";
import { governorHand } from "./boss-hands-governor.js";
import { grindstoneHand } from "./boss-hands-grindstone.js";
import { halterHand } from "./boss-hands-halter.js";
import { filamentHand, sinewHand, surgeHand } from "./boss-hands-handles.js";
import { haspHand } from "./boss-hands-hasp.js";
import { keelHand } from "./boss-hands-keel.js";
import { lampreyHand } from "./boss-hands-lamprey.js";
import { latchHand } from "./boss-hands-latch.js";
import { mantleHand } from "./boss-hands-mantle.js";
import { mimicHand } from "./boss-hands-mimic.js";
import { oculusHand } from "./boss-hands-oculus.js";
import { plumbHand } from "./boss-hands-plumb.js";
import { queenHand } from "./boss-hands-queen.js";
import { ratchetHand } from "./boss-hands-ratchet.js";
import { rimeHand } from "./boss-hands-rime.js";
import { mazeHand, mirrorHand, pinballHand } from "./boss-hands-rounds.js";
import { instarHand, nettleHand } from "./boss-hands-scene.js";
import { scoutHand } from "./boss-hands-scout.js";
import { seamHand } from "./boss-hands-seam.js";
import { vaneHand, wardenHand } from "./boss-hands-shots.js";
import { slingHand } from "./boss-hands-sling.js";
import { snakeHand } from "./boss-hands-snake.js";
import { spoolHand } from "./boss-hands-spool.js";
import { stareHand } from "./boss-hands-stare.js";
import { antiphonHand, cairnHand, spliceHand, undertowHand } from "./boss-hands-takes.js";
import { trapezeHand } from "./boss-hands-trapeze.js";
import { trivetHand } from "./boss-hands-trivet.js";
import { pulseHand, repriseHand } from "./boss-hands-unseen.js";
import { valveHand } from "./boss-hands-valve.js";
import { viseHand } from "./boss-hands-vise.js";
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
  trapeze: trapezeHand,
  // Every rock pulled out is a plain rock falling, and the pile's hand is on
  // the pile — the shield under it is the field's.
  cairn: (w) => [...cairnHand(w), ...fieldHand(w)],
  capstan: capstanHand,
  curtain: curtainHand,
  filament: filamentHand,
  fleet: fleetHand,
  flue: flueHand,
  cyst: cystHand,
  sling: slingHand,
  gall: gallHand,
  gauge: gaugeHand,
  gimbal: gimbalHand,
  gorge: gorgeHand,
  governor: governorHand,
  grindstone: grindstoneHand,
  halter: halterHand,
  hasp: haspHand,
  hive: hiveHand,
  instar: instarHand,
  keel: keelHand,
  lamprey: lampreyHand,
  lead: leadHand,
  ledger: ledgerHand,
  mantle: mantleHand,
  mimic: mimicHand,
  latch: latchHand,
  maze: mazeHand,
  mirror: mirrorHand,
  nettle: nettleHand,
  oculus: oculusHand,
  pinball: pinballHand,
  plumb: plumbHand,
  pulse: pulseHand,
  queen: queenHand,
  ratchet: ratchetHand,
  reprise: repriseHand,
  rime: rimeHand,
  scout: scoutHand,
  seam: seamHand,
  scuttle: scuttleHand,
  sinew: sinewHand,
  snake: snakeHand,
  splice: spliceHand,
  spool: spoolHand,
  stare: stareHand,
  // The rocks it throws while both thumbs are on the bulb are the dome's,
  // and nothing in the bulb's hand moves it.
  surge: (w) => [...surgeHand(w), ...fieldHand(w)],
  taster: tasterHand,
  throat: throatHand,
  trivet: trivetHand,
  // The wave sends six slimes under the lobes, and the lobes' hand answers
  // only the lobes.
  undertow: (w) => [...undertowHand(w), ...fieldHand(w)],
  valve: valveHand,
  vane: vaneHand,
  vise: viseHand,
  warden: wardenHand,
  // The hold while the face slips, then the wind home once it has stopped —
  // and the wave's own bodies answered all the while, because the face turns
  // the field without taking anything off it (`sim/well.ts`).
  well: (w) => [...either(wellWindHand, wellHoldHand)(w), ...fieldHand(w)],
};

/** The hand for the boss on the field, null for a boss with no hand, and the
 * cannon and shield played together when there is no boss at all
 * (`autopilot-field-hand.ts`). */
export function autopilotHand(w: World): Hand | null {
  return w.boss ? (AUTOPILOT_HANDS[w.boss.kind] ?? null) : fieldHand;
}
