/**
 * What a capture is asked for, and what it finds in the page when it gets
 * there.
 *
 * Split out of `capture.ts` when that file reached the 250-line ceiling, along
 * the seam that was already there: everything here is a *shape* — the spec a
 * caller writes and the handle `apps/game/src/handle.ts` installs — and
 * nothing here opens a browser. `capture.ts` re-exports both names, so a
 * caller that already reached for a `FrameSpec` through it did not move.
 */

export interface FrameSpec {
  /** 0-based wave index, the same number `jumpToWave` already takes. */
  wave: number;
  /** Ticks to advance, from the wave's own start, before the first capture. */
  ticks: number;
  /**
   * A strip rather than a still, for a check about motion. 1 is a single
   * frame at `ticks`; more than that captures `frames` frames, `strideTicks`
   * apart, starting at `ticks`.
   */
  frames?: number;
  /** Ticks between frames of a strip. Ignored when `frames` is 1. */
  strideTicks?: number;
  /** CSS viewport the phone is drawn at. A fixed size is part of what makes
   * two captures comparable — the layout math reads the viewport back. */
  viewport?: { width: number; height: number };
  /**
   * Whose screen this is. Omitted leaves the build's own default, which is the
   * test rig showing both halves at once.
   *
   * A creature whose whole point is that the two devices carry two different
   * pictures — THE VEIL, THE LURE, THE DART — cannot be photographed at all
   * without this: the rig's frame is neither of the two frames a player sees,
   * and it is the one this tool used to be able to take.
   */
  seat?: "p1" | "p2" | "test";
  /**
   * A thumb held down for the whole run of ticks.
   *
   * Every other verb here drives a *wave*; four mechanics on this field are a
   * *held control* — THE LID's cord, THE WARDEN's rope, THE MAZE's wheel and
   * THE LANCE's lobe — and released they show nothing of what they are.
   *
   * The press goes in after the wave's own `ticks` and before the picture,
   * with `holdTicks` of its own to show in — a hand takes hold of something
   * that is already there, and a `drag` sent at tick zero names a creature the
   * simulation has not dealt an id to yet. A strip holds from its first frame
   * on, so what it shows is the hold building rather than one held frame at
   * the end.
   */
  hold?: HoldSpec;
  /** Ticks run with the hold in, after `ticks` and before the picture. Long
   * enough for what the hold does to be visible — plates parting, a lobe
   * filling — and short enough not to be a different moment of the wave. */
  holdTicks?: number;
}

/**
 * One press for `neonSpore.send`, structural rather than a `Command` imported
 * from `packages/sim` — for the same reason `window.neonSpore` is declared
 * below rather than imported: this file drives a *built* game, sometimes one
 * built from a commit whose types are not the working tree's, and the thing
 * that crosses into the page is JSON either way.
 */
export interface HoldSpec {
  player: 1 | 2;
  command: { kind: string } & Record<string, unknown>;
}

declare global {
  interface Window {
    neonSpore?: {
      // Both fields are optional: `bun run frames <sha>` drives a commit and
      // its own parent through this same evaluated function, and `phase`
      // replaced `due` in the commit that added the introduction
      // (`f6be23b`). A parent checked out from before that lands on the
      // older shape, so this has to recognise either rather than assume the
      // one the current tree happens to have.
      world: { brief: { phase?: number; due?: readonly unknown[] } };
      jumpToWave(wave: number): void;
      dismissBriefing(): void;
      /** Missing on a build from before the introduction existed. */
      advanceOpening?(seconds: number): void;
      /** Missing on a build from before `--hold` existed — which is every
       * parent of the commit that added it, so `--hold` says so by name rather
       * than failing as an undefined call somewhere in the page. */
      send?(player: 1 | 2, command: unknown): void;
      advance(ticks: number): void;
      paint(): void;
    };
  }
}
