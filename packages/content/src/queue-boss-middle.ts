import type { BossEntry } from "@neon-spore/sim";

/**
 * **The bosses authored from the middle**, which `bossFromWave` passes
 * through untouched: each names no column, only `midCol` and offsets from
 * it, so a narrower field moves nothing the entry says.
 *
 * Cut out of `queue-boss.ts` when THE GEODE took it to the 250-line limit,
 * along the one seam it had: a chain of branches that each returned the boss
 * as it came. A boss whose places are remapped stays there.
 */
const FROM_THE_MIDDLE = [
  // THE SEAM: its ridge is `midCol` and a rock is authored as an
  // offset from it, clamped to whatever width the field has.
  "seam",
  // THE OCULUS the same: its eye is `midCol` and nothing else has a place.
  "oculus",
  // THE VISE the same: its kernel is `midCol` and nothing else has a place.
  "vise",
  // THE PLUMB the same: its core is `midCol` and its levels are the phones.
  "plumb",
  // THE SLING the same: its yoke is `midCol` and its aims are sides, not columns.
  "sling",
  // THE CAPSTAN the same: its drum is `midCol` and its faces are sides.
  "capstan",
  // THE GALL the same: its points are the seam's own, spread across the hull.
  "gall",
  // THE TRAPEZE the same: its gongs are angles off the middle.
  "trapeze",
  // THE FLUE the same: its cannon is `midCol` and its ember's span is tuning.
  "flue",
  // THE GOVERNOR the same: its dial is `midCol` and its marks are thousandths of a lap.
  "governor",
  // THE MIMIC hangs over `midCol` and authors no column at all; THE LATCH's tendril the same,
  // THE BASTION's moon, whose nodes and ports are offsets from the middle, and THE CHRYSALIS's cocoon, THE HYDRA's heads, THE BROOD's buds and THE GEODE's cracks the same, and THE MATRON's lobes.
  "mimic",
  "latch",
  "bastion",
  "chrysalis",
  "hydra",
  "brood",
  "matron",
  "geode",
  "swindle",
  // THE MOTH comes in over `midCol`; its spots are offsets from its body.
  "moth",
] as const satisfies readonly BossEntry["kind"][];

type MiddleKind = (typeof FROM_THE_MIDDLE)[number];

/** Whether `boss` is one of them; narrows it, so the remap after it is typed. */
export function authoredFromTheMiddle(
  boss: BossEntry,
): boss is Extract<BossEntry, { kind: MiddleKind }> {
  return (FROM_THE_MIDDLE as readonly string[]).includes(boss.kind);
}
