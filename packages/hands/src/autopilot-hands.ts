import type { World } from "@neon-spore/sim";
import { clawHand } from "./autopilot-claw.js";
import { fieldHand, shieldHand } from "./autopilot-field-hand.js";
import { catchPod, freeDuePod } from "./autopilot-pod-hand.js";
import { scuttleWaveHand } from "./autopilot-scuttle.js";
import { fleetHand } from "./boss-hand-fleet.js";
import { hiveHand } from "./boss-hand-hive.js";
import { pinballHand } from "./boss-hand-pinball.js";
import { bastionHand } from "./boss-hands-bastion.js";
import { batonHand, throatHand } from "./boss-hands-beats.js";
import { broodHand } from "./boss-hands-brood.js";
import { capstanHand } from "./boss-hands-capstan.js";
import { chrysalisHand } from "./boss-hands-chrysalis.js";
import { leadHand, ledgerHand, tasterHand } from "./boss-hands-clocks.js";
import { curtainHand, gorgeHand } from "./boss-hands-field.js";
import { flueHand } from "./boss-hands-flue.js";
import { gallHand } from "./boss-hands-gall.js";
import { gaugeHand } from "./boss-hands-gauge.js";
import { geodeHand } from "./boss-hands-geode.js";
import { gimbalHand } from "./boss-hands-gimbal.js";
import { governorHand } from "./boss-hands-governor.js";
import { filamentHand, surgeHand } from "./boss-hands-handles.js";
import { haspHand } from "./boss-hands-hasp.js";
import { hydraHand } from "./boss-hands-hydra.js";
import { keelHand } from "./boss-hands-keel.js";
import { lampreyHand } from "./boss-hands-lamprey.js";
import { latchHand } from "./boss-hands-latch.js";
import { mantleHand } from "./boss-hands-mantle.js";
import { mimicHand } from "./boss-hands-mimic.js";
import { mothHand } from "./boss-hands-moth.js";
import { oculusHand } from "./boss-hands-oculus.js";
import { plumbHand } from "./boss-hands-plumb.js";
import { queenHand } from "./boss-hands-queen.js";
import { ratchetHand } from "./boss-hands-ratchet.js";
import { mazeHand, mirrorHand } from "./boss-hands-rounds.js";
import { instarHand, nettleHand } from "./boss-hands-scene.js";
import { scoutHand } from "./boss-hands-scout.js";
import { seamHand } from "./boss-hands-seam.js";
import { vaneHand, wardenHand } from "./boss-hands-shots.js";
import { sinewHand } from "./boss-hands-sinew.js";
import { slingHand } from "./boss-hands-sling.js";
import { snakeHand } from "./boss-hands-snake.js";
import { spoolHand } from "./boss-hands-spool.js";
import { stareHand } from "./boss-hands-stare.js";
import { antiphonHand, cairnHand, spliceHand, undertowHand } from "./boss-hands-takes.js";
import { trapezeHand } from "./boss-hands-trapeze.js";
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
  // Its core fires torches down the column it hangs over, and nothing in its
  // own hand moves the dome.
  curtain: (w) => [...curtainHand(w), ...shieldHand(w)],
  filament: filamentHand,
  fleet: fleetHand,
  flue: flueHand,
  sling: slingHand,
  gall: gallHand,
  gauge: gaugeHand,
  gimbal: gimbalHand,
  gorge: gorgeHand,
  governor: governorHand,
  hasp: haspHand,
  hive: hiveHand,
  instar: instarHand,
  keel: keelHand,
  lamprey: lampreyHand,
  // Its lean throws torches and rocks at the hull, and nothing in its own
  // hand moves the dome.
  lead: (w) => [...leadHand(w), ...shieldHand(w)],
  ledger: ledgerHand,
  mantle: mantleHand,
  mimic: mimicHand,
  latch: latchHand,
  bastion: bastionHand,
  chrysalis: chrysalisHand,
  hydra: hydraHand,
  brood: broodHand,
  // Her pods are the ordinary pods and her throws the ordinary field: the
  // field hand shoots, catches and shields all of it (`sim/matron.ts`).
  matron: fieldHand,
  geode: geodeHand,
  // Her pods are the ordinary pods: the field hand frees and swallows a real
  // one and keeps the maw shut for a fake (`sim/swindle.ts`).
  swindle: fieldHand,
  moth: mothHand,
  maze: mazeHand,
  mirror: mirrorHand,
  nettle: nettleHand,
  oculus: oculusHand,
  pinball: pinballHand,
  plumb: plumbHand,
  pulse: pulseHand,
  // Her torches break off on a clock of their own and fall to the hull in a
  // beat, and nothing in her own hand moves the dome under them; and a shot at
  // her can knock her pod loose, which is followed down before she is aimed at.
  queen: (w) => [...(catchPod(w) ?? freeDuePod(w) ?? queenHand(w)), ...shieldHand(w)],
  ratchet: ratchetHand,
  reprise: repriseHand,
  scout: scoutHand,
  seam: seamHand,
  scuttle: scuttleWaveHand,
  sinew: sinewHand,
  snake: snakeHand,
  splice: spliceHand,
  spool: spoolHand,
  stare: stareHand,
  // The rocks it throws while both thumbs are on the bulb are the dome's,
  // and nothing in the bulb's hand moves it.
  surge: (w) => [...surgeHand(w), ...fieldHand(w)],
  // The wave sends rocks and slimes under the blades, and the blades never
  // reach the hull, so the field is answered first.
  taster: either(fieldHand, tasterHand),
  throat: throatHand,
  // The wave sends six slimes under the lobes, and the lobes' hand answers
  // only the lobes.
  undertow: (w) => [...undertowHand(w), ...fieldHand(w)],
  valve: valveHand,
  // It folds the wave's arrivals into columns of its own and they fall like
  // any others; the bearing hurts nobody, so it waits for a quiet field.
  vane: either(fieldHand, vaneHand),
  vise: viseHand,
  warden: wardenHand,
  // The hold while the face slips, then the wind home once it has stopped —
  // and the wave's own bodies answered all the while, because the face turns
  // the field without taking anything off it (`sim/well.ts`).
  well: (w) => [...either(wellWindHand, wellHoldHand)(w), ...fieldHand(w)],
};

/** The hand for the boss on the field, null for a boss with no hand, and the
 * cannon and shield played together when there is no boss at all
 * (`autopilot-field-hand.ts`) — or THE CLAW's arm and crank when the panel
 * has them (`autopilot-claw.ts`). `arm` is the caller's to say: the world does
 * not know its panel, and the caller looked it up to draw it. */
export function autopilotHand(w: World, arm = false): Hand | null {
  if (w.boss) return AUTOPILOT_HANDS[w.boss.kind] ?? null;
  return arm ? clawHand : fieldHand;
}
