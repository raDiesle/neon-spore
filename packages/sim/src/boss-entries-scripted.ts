import type { BastionEntry } from "./bastion.js";
import type { CapstanEntry } from "./capstan.js";
import type { FlueEntry } from "./flue.js";
import type { GallEntry } from "./gall.js";
import type { GovernorEntry } from "./governor.js";
import type { LampreyEntry } from "./lamprey.js";
import type { LatchEntry } from "./latch.js";
import type { MimicEntry } from "./mimic.js";
import type { OculusEntry } from "./oculus.js";
import type { PlumbEntry } from "./plumb.js";
import type { RimeEntry } from "./rime.js";
import type { SeamEntry } from "./seam.js";
import type { SlingEntry } from "./sling.js";
import type { TrapezeEntry } from "./trapeze.js";
import type { TrivetEntry } from "./trivet.js";
import type { ViseEntry } from "./vise.js";

/**
 * **The bosses a wave authors as a script of steps** — THE SEAM and every one
 * after it, cut out of `boss-entries.ts` on 27 September 2026 when THE
 * CAPSTAN's entry left that page at 250 lines exactly.
 *
 * The same family `wave-boss-scripted.ts` installs, along the same seam: each
 * entry is a `kind` and the `steps` its wave writes out, and each is defined
 * beside its own state (`<kind>.ts`). `boss-entries.ts` takes the union whole
 * and re-exports every name, so nothing that reached for one through that
 * page, or through `entries.ts`, had to move. The next such boss goes on the
 * end of the union here.
 */
export type ScriptedBossEntry =
  // The one that authors a whole script of standard-control steps (`seam.ts`).
  | SeamEntry
  // The one that authors holds as well as shots: a lens shut by two thumbs (`oculus.ts`).
  | OculusEntry
  // The one that authors pinches as well as shots: a case cracked by two gaps (`vise.ts`).
  | ViseEntry
  // The one that authors wipes and a shield as well as shots: a lens rubbed clear (`rime.ts`).
  | RimeEntry
  // The one that authors chords as well as shots: a stand planted by two seats' pads (`trivet.ts`).
  | TrivetEntry
  // The one that authors leans as well as shots: a bob held level by two phones (`plumb.ts`).
  | PlumbEntry
  // The one that authors draws as well as shots: a fork loosed by two seats' holds (`sling.ts`).
  | SlingEntry
  // The one that authors leans and rubs as well as shots: a drum one seat rocks for the other (`capstan.ts`).
  | CapstanEntry
  // The one that authors leaps as well as shots: an alien tapped, thrown to the other half and shot (`gall.ts`).
  | GallEntry
  // The one that authors levels of swipes and shots: a swing pushed higher until it kicks a gong (`trapeze.ts`).
  | TrapezeEntry
  // The one that authors levels of a weapon, a colour, a speed and a slow: an ember one seat sees and the other shoots (`flue.ts`).
  | FlueEntry
  // The one that authors marks for both seats and a pace: a needle each of you taps on your own mark (`governor.ts`).
  | GovernorEntry
  // The one that authors a grip as well as taps: a jaw one seat pins for the other to pull its teeth (`lamprey.ts`).
  | LampreyEntry
  // The one answered by drawing: a sign one seat reads for the other to draw (`mimic.ts`).
  | MimicEntry
  // The one hauled hand over hand: two grips on one tendril, never both let go (`latch.ts`).
  | LatchEntry
  // The one taken apart a shell at a time, each a different way (`bastion.ts`).
  | BastionEntry;

export type { BastionEntry, BastionStep } from "./bastion.js";
export type { CapstanEntry, CapstanStep } from "./capstan.js";
export type { FlueEntry, FlueLevel } from "./flue.js";
export type { GallEntry, GallStep } from "./gall.js";
export type { GovernorEntry, GovernorStep } from "./governor.js";
export type { LampreyEntry, LampreyStep } from "./lamprey.js";
export type { LatchEntry, LatchStep } from "./latch.js";
export type { MimicEntry, MimicStep } from "./mimic.js";
export type { OculusEntry, OculusStep } from "./oculus.js";
export type { PlumbEntry, PlumbStep } from "./plumb.js";
export type { RimeEntry, RimeStep } from "./rime.js";
export type { SeamEntry, SeamStep } from "./seam.js";
export type { SlingEntry, SlingStep } from "./sling.js";
export type { TrapezeEntry, TrapezeStep } from "./trapeze.js";
export type { TrivetEntry, TrivetStep } from "./trivet.js";
export type { ViseEntry, ViseStep } from "./vise.js";
