/**
 * **Which bosses take the outline tier's pose, and on which seed**
 * (`outline-drift.ts`), split out when the list outgrew the page it is used
 * on.
 *
 * `OUTLINE_DRIFT` is how much of the pose each boss takes; a 0 draws no
 * transform at all. THE QUEEN takes the whole since 1 October 2026, and THE
 * REPRISE since 2 October 2026, with its skin (`reprise-surface.ts`).
 * `queen:shell`, `cairn:pile` and `reprise:sac` were dropped on 27 September
 * 2026 (`tools/versus/DECIDED.md`), and the seam stayed for a movement big
 * enough to be seen. Most of the rest take the seam and the seed but not the
 * pose, and move the way their bodies hang: THE THROAT bows between two held
 * ends (`throat-sway.ts`), THE CURTAIN swings at its hem (`curtain-sway.ts`),
 * THE TASTER's blades lean on their roots (`taster-sway.ts`), THE SINEW's mass
 * swings under its held collar (`sinew-sway.ts`), THE SURGE rocks about its
 * middle (`surge-sway.ts`), THE LEDGER's plating leans on its underside
 * (`ledger-sway.ts`), THE STARE rolls about its eye (`stare-sway.ts`) and
 * THE CYST's lobes each swing about their waists (`cyst-sway.ts`) and THE
 * VISE's case swings from its hinge (`vise-sway.ts`) and THE MANTLE leans on
 * its straps (`mantle-sway.ts`).
 */

export type OutlineBoss =
  | "queen"
  | "cairn"
  | "reprise"
  | "warden"
  | "throat"
  | "undertow"
  | "gorge"
  | "curtain"
  | "taster"
  | "sinew"
  | "surge"
  | "ledger"
  | "stare"
  | "cyst"
  | "vise"
  | "mantle";

/** How much of its pose each boss takes: 0 dead still, 1 the whole. Never past 1 — the cap is at 1. */
export const OUTLINE_DRIFT: Record<OutlineBoss, number> = {
  queen: 1,
  cairn: 0,
  reprise: 1,
  warden: 1,
  throat: 1,
  undertow: 1,
  gorge: 1,
  curtain: 1,
  taster: 1,
  sinew: 1,
  surge: 1,
  ledger: 1,
  stare: 1,
  cyst: 1,
  vise: 1,
  mantle: 1,
};

/** Each boss's seed, so no two on one screen lean in step; its parts hash theirs from it (`outline-parts.ts`). */
export const OUTLINE_SEED: Readonly<Record<OutlineBoss, number>> = {
  queen: 101,
  cairn: 113,
  reprise: 127,
  warden: 131,
  throat: 137,
  undertow: 139,
  gorge: 149,
  curtain: 151,
  taster: 157,
  sinew: 163,
  surge: 167,
  ledger: 173,
  stare: 179,
  cyst: 181,
  vise: 191,
  mantle: 193,
};
