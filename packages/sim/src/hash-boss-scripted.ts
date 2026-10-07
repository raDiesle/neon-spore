import type { BossState } from "./boss-union.js";
import { capstanHashParts } from "./capstan-hash.js";
import { cystHashParts } from "./cyst-hash.js";
import { davitHashParts } from "./davit-hash.js";
import { flueHashParts } from "./flue-hash.js";
import { gallHashParts } from "./gall-hash.js";
import { governorHashParts } from "./governor-hash.js";
import { grindstoneHashParts } from "./grindstone-hash.js";
import { halterHashParts } from "./halter-hash.js";
import { lampreyHashParts } from "./lamprey-hash.js";
import { mimicHashParts } from "./mimic-hash.js";
import { oculusHashParts } from "./oculus-hash.js";
import { plumbHashParts } from "./plumb-hash.js";
import { rimeHashParts } from "./rime-hash.js";
import { seamHashParts } from "./seam-hash.js";
import { slingHashParts } from "./sling-hash.js";
import { trapezeHashParts } from "./trapeze-hash.js";
import { trivetHashParts } from "./trivet-hash.js";
import { viseHashParts } from "./vise-hash.js";

/**
 * The fingerprint's share of **the scripted bosses** — THE SEAM and every boss
 * after it that installs a script and nothing else (`wave-boss-scripted.ts`'s
 * `SCRIPTED_KINDS`), cut out of `hash-boss-clocks.ts` when THE LAMPREY took
 * that page to its 250-line limit. Each gathers its own numbers beside its
 * own state (`*-hash.ts`); this is only the branches, called once from
 * `clockHashParts`, and the contract is `bossHashParts`'s — a flat list in a
 * fixed order. Only one branch can match, so the numbers are the same ones
 * in the same order as before the cut. The next scripted boss goes on the end.
 *
 * Returns nothing for any other boss, so the caller can push it unconditionally.
 */
export function scriptedHashParts(boss: BossState): number[] {
  const out: number[] = [];
  // THE SEAM: the phase, the cursor, the sealed points, the answers owed
  // and the script (`seam-hash.ts`).
  if (boss.kind === "seam") {
    for (const n of seamHashParts(boss)) out.push(n);
  }
  // THE OCULUS: the phase, the cursor, the leaves, the hits, both thumbs
  // and the script (`oculus-hash.ts`).
  if (boss.kind === "oculus") {
    for (const n of oculusHashParts(boss)) out.push(n);
  }
  // THE VISE: the phase, the cursor, the cracks, the hits, both gaps and
  // the script (`vise-hash.ts`).
  if (boss.kind === "vise") {
    for (const n of viseHashParts(boss)) out.push(n);
  }
  // THE RIME: the phase, the cursor, the wipes, the hits, both halves' frost,
  // the reversal counts and the script (`rime-hash.ts`).
  if (boss.kind === "rime") {
    for (const n of rimeHashParts(boss)) out.push(n);
  }
  // THE TRIVET: the phase, the cursor, the feet, the hits, both seats' pads
  // and the script (`trivet-hash.ts`).
  if (boss.kind === "trivet") {
    for (const n of trivetHashParts(boss)) out.push(n);
  }
  // THE PLUMB: the phase, the cursor, the weights, the hits, both seats'
  // leans and the script (`plumb-hash.ts`).
  if (boss.kind === "plumb") {
    for (const n of plumbHashParts(boss)) out.push(n);
  }
  // THE SLING: the phase, the cursor, the arms, the hits, both fingers, both
  // counts and the script (`sling-hash.ts`).
  if (boss.kind === "sling") {
    for (const n of slingHashParts(boss)) out.push(n);
  }
  // THE GRINDSTONE: the phase, the cursor, the passes, the hits, the caliper,
  // both flats' grit and rubs, both jaws and the script (`grindstone-hash.ts`).
  if (boss.kind === "grindstone") {
    for (const n of grindstoneHashParts(boss)) out.push(n);
  }
  // THE CYST: the phase, the cursor, the cracks, the hits, the core, both
  // flanks' gaps and taps and the script (`cyst-hash.ts`).
  if (boss.kind === "cyst") {
    for (const n of cystHashParts(boss)) out.push(n);
  }
  // THE DAVIT: the phase, the cursor, the swings, the hits, the pivot, both
  // seats' steers, fingers and counts, the boom and the script (`davit-hash.ts`).
  if (boss.kind === "davit") {
    for (const n of davitHashParts(boss)) out.push(n);
  }
  // THE HALTER: the phase, the cursor, the cracks, the hits, the centre, both
  // seats' rests, stirrings and grips, the pair's count and the script (`halter-hash.ts`).
  if (boss.kind === "halter") {
    for (const n of halterHashParts(boss)) out.push(n);
  }
  // THE CAPSTAN: the phase, the cursor, both bands' wear, the hits, the core,
  // both seats' leans and reversal counts, the hold's count and the script (`capstan-hash.ts`).
  if (boss.kind === "capstan") {
    for (const n of capstanHashParts(boss)) out.push(n);
  }
  // THE GALL: the phase, the cursor, the point, the closes, the hits, the root,
  // the gap and its count, and the script (`gall-hash.ts`).
  if (boss.kind === "gall") {
    for (const n of gallHashParts(boss)) out.push(n);
  }
  // THE TRAPEZE: the phase, the cursor, the swing, the freeze, the catches, the
  // hits, the spindle, the thumbs and the draws, and the script (`trapeze-hash.ts`).
  if (boss.kind === "trapeze") {
    for (const n of trapezeHashParts(boss)) out.push(n);
  }
  // THE FLUE: the phase, the cursor, the ember and its ticks, the shots, the
  // hits, and the levels (`flue-hash.ts`).
  if (boss.kind === "flue") {
    for (const n of flueHashParts(boss)) out.push(n);
  }
  // THE GOVERNOR: the phase, the cursor, the needle and its speed, the taps,
  // the hits, the hub, the pads and the thumbs, and the script (`governor-hash.ts`).
  if (boss.kind === "governor") {
    for (const n of governorHashParts(boss)) out.push(n);
  }
  // THE LAMPREY: the phase, the jaw, the bite, the teeth, the thumbs and the script (`lamprey-hash.ts`).
  if (boss.kind === "lamprey") {
    for (const n of lampreyHashParts(boss)) out.push(n);
  }
  // THE MIMIC: the phase, the signs, the drawn, the peels, the reaches and the script (`mimic-hash.ts`).
  if (boss.kind === "mimic") {
    for (const n of mimicHashParts(boss)) out.push(n);
  }
  return out;
}
