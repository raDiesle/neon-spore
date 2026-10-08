import type { BossKind } from "@neon-spore/sim";

/**
 * **The bosses with no row in `marks-window.test.ts`, and why** — the
 * allowance in the shape of `boss-states.test.ts`'s `OWED`, so the sentence
 * *every boss has a row* is held by a test rather than by whoever reads it.
 *
 * Until 8 October 2026 the preamble said it and nothing checked: THE LATCH's
 * lane added a row because it read the sentence, and 36 of 58 bosses had none
 * with the test green. `marks-window-coverage.test.ts` now holds every
 * `BossKind` to a row or a line here, and every line here to having no row —
 * so the list can only shrink, and a row written strikes its line.
 *
 * - **`never`** — THE QUEEN, whose faint rings from the announcement onward
 *   are her mechanic.
 * - **`own-test`** — a boss whose marks are held by a test of their own.
 * - **`owed`** — it has a `*-marks.ts` and nobody has written its row. Each is
 *   a later lane of its own.
 * - **`answers-only`** — its `*-marks.ts` draws the verdict, the answer to a
 *   touch, and no mark that asks for one, so there is no window to hold it to.
 *   THE CAIRN, whose pile is asked by the hand ring the grip itself draws.
 * - **`no-marks-file`** — there is no `*-marks.ts` to spy on, which is what a
 *   row is made of (`marks-window-kit.ts`). Whatever it lights is drawn in its
 *   body's own files; a lane that finds a mark there moves it out first.
 */
export type NoRowWhy = "never" | "own-test" | "owed" | "answers-only" | "no-marks-file";

export const NO_ROW: Partial<Record<BossKind, NoRowWhy>> = {
  queen: "never",
  // `packages/render/test/instar-marks-up.test.ts`.
  instar: "own-test",
  // `cairn-marks.ts` draws the verdict and nothing else: the ring round the
  // pile is the hand on it (`cairn-hand.ts`), drawn only once a thumb has it.
  cairn: "answers-only",
  warden: "no-marks-file",
  well: "no-marks-file",
  splice: "no-marks-file",
  reprise: "no-marks-file",
  stare: "no-marks-file",
  undertow: "no-marks-file",
  // Its scars ask for nothing and its fire step lights the body (`gall-draw.ts`):
  // the ring it asked with went on 8 October 2026, and `gall-marks.ts` became `gall-scars.ts`.
  gall: "no-marks-file",
  spool: "no-marks-file",
  nettle: "no-marks-file",
};
