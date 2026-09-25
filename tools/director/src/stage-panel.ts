import type { World } from "@neon-spore/sim";

/**
 * **What the stage panel is, as a contract**, and nothing about how it is
 * driven.
 *
 * Cut out of `stage.ts` when the boss round pushed that file over its 250-line
 * ceiling, along a seam it already had: next door is the loop, the transport,
 * the finger on the canvas and the world being stepped, and this is the handful
 * of verbs the rest of the director has of it. Every panel that touches the
 * stage imports this type and none of them imports `bindStage`, so the split is
 * where the readers already were.
 */

/**
 * The wave, playing, in the shape the phone draws it in.
 *
 * It runs the shipping renderer against a real `World` — not a preview of the
 * grid. The whole reason the editor is worth building is the question the data
 * cannot answer: whether the cannon has time to get there. A second drawing of
 * the same numbers would answer nothing.
 */
export interface StagePanel {
  /** Fresh run of the wave being edited. Called whenever its shape changes. */
  rebuild(): void;
  /** Replay the wave from its start up to `beat`, then hold there. */
  seek(beat: number): void;
  /** Let the field run from where it is — what a wave opened to be *watched*
   * needs, since the transport keeps whatever it was last left at. */
  play(): void;
  /**
   * Stand the boss on a numbered round and **hold it there**.
   *
   * A round-played boss opens on its first round and the only thing that moves
   * it on is *winning*, which nobody does while judging a sheet — so picking
   * STAGE 4 in the boss panel used to redraw the panel and leave the field on
   * stage 1. It goes through `setBossRound`, which is the fight's own way into
   * a round, so what the stage plays is the round the pair would have reached
   * (`sim/boss-round.ts`). Says nothing for a boss that is not played in
   * rounds; the panels that offer the choice are the ones that have them.
   *
   * **It is a wanted round rather than one click's doing**, and that is the
   * whole of the fix. It used to be applied once, to the world a rebuild had
   * just stood up, which worked only because the click ran `onEdit` first —
   * so *anything else* that rebuilt the stage put the fight back on round 0
   * while the tab still read STAGE 4. A tuning slider, a pair switch, a jump
   * to another wave and back: the panel then named a sheet the field was not
   * playing, which is exactly the disagreement this was made to end. `rebuild`
   * re-applies it, so the two cannot come apart again.
   */
  openRound(round: number): void;
  /**
   * Let the field go back to opening on its first round.
   *
   * The wave picker's, because a round belongs to the boss that was being
   * judged: standing a different wave's fight on the fourth sheet of the last
   * one is the same disagreement with the numbers swapped.
   */
  closeRound(): void;
  /** The round the field is being held on, for the panel that offers the
   * choice to mark — one answer, read rather than kept twice. */
  round(): number;
  /** The beat the field is holding, for a placement to land on. */
  beat(): number;
  /**
   * The world being played. `rebuild` swaps it for a new one, so a panel
   * reading the run needs a call rather than a reference handed out once.
   */
  world(): World;
}
