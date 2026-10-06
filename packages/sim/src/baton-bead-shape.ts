import type { Color } from "./types.js";

/**
 * THE BATON's bead and its sockets, as data: what a socket can be and what a
 * bead remembers. Split off `baton.ts` on 6 October 2026, when the bead was
 * given the two fields its knock-back is drawn from and that file had six
 * lines left; `baton.ts` re-exports all of it, so every reader still imports
 * from there.
 */

/**
 * What a socket is. `lit` has not been passed yet, `dark` has, `swell` is a
 * dark one whose shell is coming away and has not let go yet, and `shed` is
 * one whose shell is gone — dropped down the arm as a rock (`batonShed`) or
 * taken off clean by a thumb (`baton-hand.ts`).
 */
export const BATON_SOCKET_LIT = 0;
export const BATON_SOCKET_DARK = 1;
export const BATON_SOCKET_SHED = 2;
export const BATON_SOCKET_SWELL = 3;

/** One bead on the arm: sitting in a socket, or in the air below it. */
export interface BatonBead {
  /** In the air between two sockets. Otherwise sitting in `socket`. */
  flying: boolean;
  /** `world.beat` it last came to rest on — the settle clock counts from here. */
  satBeat: number;
  /** The socket it is in, or is flying out of. */
  socket: number;
  /** `world.tick` the flight began on, -1 while it is not in the air. */
  flightTick: number;
  /** Whether a shot of the right colour has gone through it this flight. */
  struck: boolean;
  /** The colour it carries, which is the colour that takes it. */
  color: Color;
  /** The column it is landing in. Read only while it flies: sitting, its column is its socket's (`batonSocketCol`). */
  col: number;
  /** The column it left from. The same as `col` unless the arm swung for this flight. */
  fromCol: number;
  /** On the crossing: this flight is `batonFinalBeats` long, not `batonFlightBeats`. */
  final: boolean;
  /**
   * `world.tick` the bead was last sent back up the arm on — knocked by the
   * wrong colour or shaken from a socket it sat in too long — and -1 before
   * the first. **The picture's**, like `threadBeat`: the rule moved the bead
   * on that tick, and the throw from where it was to where it sits is drawn
   * from here (`render/baton-knock.ts`).
   */
  backTick: number;
  /** Where it was sent back from, in thousandths of a row down from the top. */
  backFromMilli: number;
}
