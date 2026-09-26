/**
 * **The handle `apps/game/src/handle.ts` installs**, as this tool sees it.
 *
 * Cut out of `spec.ts` when the absolute-tick fix took that file past its
 * 250-line limit, along the seam it already had a paragraph about: everything
 * left there is a *spec a caller writes*, and everything here is what the
 * **page** turns out to have — which is not one shape but several, because
 * `bun run frames <sha>` drives a commit and its own parent through the same
 * evaluated functions. Nearly every field below is optional for that reason,
 * and each says which commit added it, so a capture against an older build
 * refuses by name rather than failing as an undefined call somewhere in the
 * page.
 */

declare global {
  interface Window {
    neonSpore?: {
      // Both fields are optional: `bun run frames <sha>` drives a commit and
      // its own parent through this same evaluated function, and `phase`
      // replaced `due` in the commit that added the introduction
      // (`f6be23b`). A parent checked out from before that lands on the
      // older shape, so this has to recognise either rather than assume the
      // one the current tree happens to have.
      // `steps` is optional for its own reason: a build from before the guide
      // had pages has no such field, and 0 is exactly what it means there.
      // `wave` and `creatures` are what `tools/perf` reads to find the tick a
      // wave carries the most bodies. Both have been on `World` since long
      // before either tool existed, so neither is optional the way `brief`'s
      // two shapes are.
      world: {
        brief: { phase?: number; steps?: number; due?: readonly unknown[] };
        wave: number;
        /** `tools/perf` counts these; a `pick`ed press reads the two fields it
         * chooses by, and both are optional so a build older than either still
         * types (`tools/frames/press.ts`). */
        creatures: readonly { id?: number; row?: number }[];
        /**
         * The round in play, or nothing. `tools/perf` asks only whether there
         * is one: a wave with a round on it keeps its whole picture here and
         * puts no bodies on the field, so a body count cannot find its busiest
         * tick (`BOSS_SONG_FRACTION`). Optional and unknown-shaped for that
         * reason — nothing outside the page has any business reading into it.
         */
        boss?: unknown;
        /** The simulation's own clock, which `--settle` must not move. */
        tick: number;
        /**
         * **What the simulation reported about the tick just run**, cleared at
         * the top of every step (`sim/step.ts`) — so it is read between two
         * single steps or not at all, which is why `advance` steps one tick at
         * a time (`drive.ts`). `--until` stops on a type in this list.
         *
         * Not optional, for `creatures`' reason: it has been on `World` since
         * long before this tool existed, so a build old enough to lack it is
         * older than anything a capture can drive. Loosely typed because the
         * union grows with every mechanic and nothing here reads past `type`.
         */
        events: readonly { type?: unknown }[];
        /**
         * **The faults placed on this wave's map.** Written rather than read:
         * `--fault` puts one on a wave that carries none (`fault.ts`).
         *
         * It was `malfunction`, one field holding the wave's single fault for
         * the whole of itself, until a fault became a pencil on the map with a
         * beat it enters on and a number it holds. Optional and loosely typed
         * for the same reason it always was: a build from before the list
         * existed has no such key, and `--fault` says so by name rather than
         * writing a property nothing reads.
         */
        faults?: unknown[];
        /** The beat counter, which a tap waits for: it is **not** `tick /
         * ticksPerBeat`, because a wave's opening advances one and not the
         * other (`capture.ts`'s `toBeat`, and `docs/queue.md`). */
        beat: number;
        /** A rehearsal's ticks are counted in it. Optional for the usual
         * reason: a caller falls back to the shipped 120 rather than failing. */
        cfg?: {
          tickHz: number;
          /** Beats between two automatic actions of a broken control, which is
           * where a runaway cannon's and a self-arming shield's period lives
           * (`sim/config-malfunction.ts`). Written by `--fault`. */
          malfunctionEveryBeats?: number;
        };
      };
      jumpToWave(wave: number): void;
      dismissBriefing(): void;
      /** Missing on a build from before the introduction existed. */
      advanceOpening?(seconds: number): void;
      /**
       * Stand the installed boss on a numbered round. Missing on a build from
       * before it existed — which is every parent of the commit that added it,
       * so `--boss-round` says so by name rather than failing as an undefined
       * call somewhere in the page.
       */
      bossRound?(round: number): boolean;
      /** AUTO for the ticks `advance` steps (`auto.ts`). Missing on a build
       * from before it existed, so `--auto` says so by name. */
      setAuto?(mode: "off" | "both" | "p1" | "p2"): void;
      /** Missing on a build from before `--hold` existed — which is every
       * parent of the commit that added it, so `--hold` says so by name rather
       * than failing as an undefined call somewhere in the page. */
      send?(player: 1 | 2, command: unknown): void;
      /** Whether the next tick would change anything for this press, asked
       * before it is sent. Missing on a build from before it existed, where
       * the run says nothing about refused presses (`report.ts`). */
      wouldHear?(player: 1 | 2, command: unknown): boolean;
      /**
       * Where a swelling on the ship is on the **screen** — the grab circle's
       * centre as a `clientX`/`clientY` and its radius in the same pixels —
       * so `--hand` can press it with a real mouse. Missing on a build from
       * before it existed, so the flag says so by name (`hand.ts`).
       */
      shipGrab?(on: "cannon" | "shield"): { clientX: number; clientY: number; r: number };
      advance(ticks: number): void;
      /** `dt` is what this frame is worth. Optional twice over: a build from
       * before it existed ignores the argument and paints a sixtieth, which is
       * what every caller but a rehearsal's wanted. */
      paint(dt?: number): void;
      /** This page of a rehearsal again, from its first tick, and whether it
       * has played out and is holding on its last frame. Both missing on a
       * build from before they were exposed, so `--opening guide` says so by
       * name rather than failing as an undefined call inside the page. */
      replayGuide?(): void;
      guideFinished?(): boolean;
      /**
       * Whether the wave is still arriving. Missing on a build from before it
       * was exposed — which includes builds that *have* the rings, so
       * `settleLaunch` paints a fixed count there rather than asking.
       */
      launching?(): boolean;
    };
  }
}
