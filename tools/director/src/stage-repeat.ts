/**
 * A cleared wave stops and asks, rather than starting itself again.
 *
 * The stage used to answer `needWave` by rebuilding on the spot — the wave
 * ran, cleared, and was running again before the author had seen that it
 * cleared. The owner asked on 13 September 2026 for the opposite: the moment
 * the wave is finished the picture **pauses under a grey veil that says
 * REPEAT WAVE?**, and **a click anywhere on the screen** runs it again from
 * the top. Anywhere, because the question has one answer and the author's
 * pointer is wherever it was when the wave ended; and that click is spent on
 * the answer — it reaches nothing under it, so a pointer resting on a button
 * restarts the wave and does not also press the button. The P key, which the
 * renderer's own PAUSED line under the veil still names, is the same answer
 * (`stage.ts` routes the play toggle here while the question is up).
 *
 * Dependency-injected the way `stage-afterrun.ts` is, so `bun test` proves
 * the pause, the veil and the click without a DOM: the veil is an element
 * `index.html` already carries, and the ear is whatever `doc` is handed.
 */

export interface StageRepeat {
  /** The veil over the stage column, `hidden` until asked. */
  veil: HTMLElement;
  /** Where a click anywhere is heard — `document` in the browser. */
  doc: Pick<Document, "addEventListener">;
  rebuild: () => void;
  setRunning: (running: boolean) => void;
  /** Repaints the play button, whose `▶`/`⏸` depends on `running`. */
  paintPlay: () => void;
}

export interface StageRepeatHandle {
  /** The wave is over: pause, and put the question up. */
  ask(): void;
  /** Take the question down without answering it — a rebuild from elsewhere. */
  hide(): void;
  /** Yes: the veil comes down and the wave runs again from the top. */
  answer(): void;
  /** Whether the question is up. */
  asking(): boolean;
}

export function bindStageRepeat({
  veil,
  doc,
  rebuild,
  setRunning,
  paintPlay,
}: StageRepeat): StageRepeatHandle {
  const asking = (): boolean => !veil.hidden;

  const hide = (): void => {
    veil.hidden = true;
  };

  const ask = (): void => {
    setRunning(false);
    paintPlay();
    veil.hidden = false;
  };

  const answer = (): void => {
    hide();
    rebuild();
    setRunning(true);
    paintPlay();
  };

  // Capture, so the answer is read before anything under the pointer is.
  doc.addEventListener(
    "click",
    (e) => {
      if (!asking()) return;
      e.stopPropagation();
      answer();
    },
    true,
  );

  return { ask, hide, answer, asking };
}
