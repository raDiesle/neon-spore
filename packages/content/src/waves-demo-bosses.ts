import type { MechanicId } from "./mechanics.js";
import type { Demonstration } from "./waves-demo.js";

/**
 * **Where each boss from THE STARE on is watched**: one row each, every one
 * its own wave. Lifted out of `waves-demo.ts` when that file came within
 * twenty lines of its 250 — a boss is added most weeks and each adds a row.
 *
 * `satisfies` rather than a type of its own, so `DEMONSTRATIONS` spreads it in
 * with every key known and its `Record<MechanicId, …>` still fails the type
 * check for a mechanic nobody has said where to watch — in either file.
 */
export const BOSS_DEMONSTRATIONS = {
  stare: { wave: "theStare" },
  baton: { wave: "theBaton" },
  throat: { wave: "theThroat" },
  undertow: { wave: "theUndertow" },
  gorge: { wave: "theGorge" },
  curtain: { wave: "theCurtain" },
  taster: { wave: "theTaster" },
  ledger: { wave: "theLedger" },
  sinew: { wave: "theSinew" },
  surge: { wave: "theSurge" },
  lead: { wave: "theLead" },
  scuttle: { wave: "theScuttle" },
  antiphon: { wave: "theAntiphon" },
  hive: { wave: "theHive" },
  instar: { wave: "theInstar" },
  nettle: { wave: "theNettle" },
  filament: { wave: "theFilament" },
  gimbal: { wave: "theGimbal" },
  spool: { wave: "theSpool" },
  hasp: { wave: "theHasp" },
  ratchet: { wave: "theRatchet" },
  mantle: { wave: "theMantle" },
  keel: { wave: "theKeel" },
  valve: { wave: "theValve" },
  seam: { wave: "theSeam" },
  oculus: { wave: "theOculus" },
  vise: { wave: "theVise" },
  rime: { wave: "theRime" },
  trivet: { wave: "theTrivet" },
  plumb: { wave: "thePlumb" },
  sling: { wave: "theSling" },
  grindstone: { wave: "theGrindstone" },
  cyst: { wave: "theCyst" },
  halter: { wave: "theHalter" },
  capstan: { wave: "theCapstan" },
  gall: { wave: "theGall" },
  trapeze: { wave: "theTrapeze" },
  flue: { wave: "theFlue" },
  governor: { wave: "theGovernor" },
  lamprey: { wave: "theLamprey" },
  mimic: { wave: "theMimic" },
  latch: { wave: "theLatch" },
} satisfies Partial<Record<MechanicId, Demonstration>>;
