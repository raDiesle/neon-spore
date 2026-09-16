/**
 * **What a caller sends into the page**, as opposed to what it asks the page
 * for.
 *
 * Cut out of `spec.ts` when `--until` needed room there and that file stood at
 * 248 of its 250 lines, along the seam `spec.ts` already had two names for:
 * everything there describes the *picture* a capture is after — which wave,
 * which tick, which rectangle — and everything here is a *command on the
 * wire*, the shape `neonSpore.send` takes and the flags that build one. The
 * three names are re-exported from `spec.ts` and from `capture.ts`, so nothing
 * that already reached for them had to move.
 *
 * Structural rather than a `Command` imported from `packages/sim`, for the
 * same reason `window.neonSpore` is declared rather than imported: this tool
 * drives a *built* game, sometimes one built from a commit whose types are not
 * the working tree's, and the thing that crosses into the page is JSON either
 * way.
 */

export interface HoldSpec {
  player: 1 | 2;
  command: { kind: string } & Record<string, unknown>;
  /**
   * Which body on the field this command's `id` names, chosen in the page
   * rather than guessed from outside it. Absent for every command that already
   * carries the number it means — `PICKS` in `press.ts` says why a grip cannot.
   */
  pick?: "first" | "lowest";
}

/**
 * Where a finger goes on the ship: one of the two swellings, and for the
 * navigator's thumb on the cannon's, which way it is carried. Parsed by
 * `parseHand` in `hand.ts`, which is also where the muzzle is explained.
 */
export interface HandSpec {
  on: "cannon" | "shield";
  carry?: "red" | "cyan";
}

/** A `HoldSpec` with a tick to arrive on. Parsed by `parsePress` in `hold.ts`. */
export interface PressSpec extends HoldSpec {
  tick: number;
}
