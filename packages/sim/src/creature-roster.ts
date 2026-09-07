import type { CreatureKind } from "./creature-kinds.js";

/**
 * **The fixed order every kind is written into the world fingerprint in.**
 *
 * Cut out of `creature-kinds.ts` when THE FENCE took that file over its
 * 250-line limit, and along the seam `kind-code.ts` already cut once: next
 * door is what a kind **is** — thirty paragraphs, one per body, each arguing
 * why that body exists — and this is the single list they are all named in.
 * That file grows by a paragraph per creature and this one by a word, so
 * holding them together meant a reader opening two hundred lines of bestiary
 * to check a list of names.
 *
 * The `satisfies` keeps the names honest; `KindsAreExhaustive` in
 * `kind-code.ts` keeps the list complete, so a kind added to the union and not
 * to the list here is a build error rather than a silent collision in the
 * fingerprint. The type comes back from `creature-kinds.js`, which is a
 * type-only cycle and the one `bullet-types.ts` already stands in.
 *
 * **Append only.** The index *is* the wire value: reordering this list changes
 * what every existing replay hashes to, and two devices on different builds
 * would disagree about a world they are playing identically.
 */
export const CREATURE_KINDS = [
  "slick",
  "bulb",
  "meteor",
  "meteorMedium",
  "meteorFast",
  "meteorFaster",
  "meteorFastest",
  "torch",
  "queen",
  "warden",
  "tether",
  "lure",
  "throb",
  "shell",
  "clasp",
  "dart",
  "veil",
  "wisp",
  "ghost",
  "echo",
  "rind",
  "gyre",
  "mount",
  "lid",
  "recoil",
  "carom",
  "chute",
  "volley",
  "veer",
  "strand",
  "crawler",
  "fence",
  "magnet",
  "coil",
  "choir",
  "balloon",
] as const satisfies readonly CreatureKind[];
