import type { BurgeeEntry } from "./burgee.js";
import type { CapstanEntry } from "./capstan.js";
import type { CystEntry } from "./cyst.js";
import type { DavitEntry } from "./davit.js";
import type { FlueEntry } from "./flue.js";
import type { GallEntry } from "./gall.js";
import type { GrindstoneEntry } from "./grindstone.js";
import type { HalterEntry } from "./halter.js";
import type { OculusEntry } from "./oculus.js";
import type { PlumbEntry } from "./plumb.js";
import type { RimeEntry } from "./rime.js";
import type { SeamEntry } from "./seam.js";
import type { SlingEntry } from "./sling.js";
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
  // The one that authors passes and clamps as well as shots: a wheel ground by two seats (`grindstone.ts`).
  | GrindstoneEntry
  // The one that authors flanks as well as shots: a sac one seat stills for the other (`cyst.ts`).
  | CystEntry
  // The one that authors leans and draws as well as shots: a boom one seat steers for the other (`davit.ts`).
  | DavitEntry
  // The one that authors rests and chords as well as shots: a seam one seat stays off while the other grips (`halter.ts`).
  | HalterEntry
  // The one that authors leans and rubs as well as shots: a drum one seat rocks for the other (`capstan.ts`).
  | CapstanEntry
  // The one that authors closes as well as shots: a nodule pinched where it sits and moved (`gall.ts`).
  | GallEntry
  // The one that authors catches as well as shots: a flag one seat taps still for the other to catch (`burgee.ts`).
  | BurgeeEntry
  // The one that authors stillness as well as taps: an ember one seat keeps steady for the other to tap (`flue.ts`).
  | FlueEntry;

export type { BurgeeEntry, BurgeeStep } from "./burgee.js";
export type { CapstanEntry, CapstanStep } from "./capstan.js";
export type { CystEntry, CystStep } from "./cyst.js";
export type { DavitEntry, DavitStep } from "./davit.js";
export type { FlueEntry, FlueStep } from "./flue.js";
export type { GallEntry, GallStep } from "./gall.js";
export type { GrindstoneEntry, GrindstoneStep } from "./grindstone.js";
export type { HalterEntry, HalterStep } from "./halter.js";
export type { OculusEntry, OculusStep } from "./oculus.js";
export type { PlumbEntry, PlumbStep } from "./plumb.js";
export type { RimeEntry, RimeStep } from "./rime.js";
export type { SeamEntry, SeamStep } from "./seam.js";
export type { SlingEntry, SlingStep } from "./sling.js";
export type { TrivetEntry, TrivetStep } from "./trivet.js";
export type { ViseEntry, ViseStep } from "./vise.js";
