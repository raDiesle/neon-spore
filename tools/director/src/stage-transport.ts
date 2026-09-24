import type { ViewRole } from "@neon-spore/render";

/**
 * The buttons under the field: `⏸`/`▶`, `↺ WAVE` and the three role switches
 * — which are there twice, in RUN and in the phone's strip under the field.
 * Split out of `stage.ts` on the layout pass that also moved `#briefToggle`
 * and the balance sheet — `stage.ts` was already at its line budget, and this
 * is the same shape `stage-afterrun.ts` and `stage-touch.ts` already use: DOM wiring that reads and writes the one running world through
 * a small set of callbacks rather than a reference.
 */
export interface StageTransportDeps {
  rebuild: () => void;
  /** Flip `running` and repaint the play button — both live in `stage.ts`. */
  onPlayToggle: () => void;
  setRole: (role: ViewRole) => void;
}

export function bindStageTransport(deps: StageTransportDeps): void {
  document.getElementById("play")?.addEventListener("click", deps.onPlayToggle);
  // `restartField` is the phone's smaller copy over the field, beside the
  // role buttons — RUN is behind the menu there.
  for (const id of ["restart", "restartField"]) {
    document.getElementById(id)?.addEventListener("click", deps.rebuild);
  }
  // `✓ CARD` used to live here: the whole stage is the card's button on a
  // phone (`apps/game/src/briefing.ts`), and it stood in for that because
  // `bindStageTouch` already spent the canvas's own pointerdown on the
  // cannon. It is gone now that `bindStageTouch` answers the stage's own
  // pointerdown itself while a card is up — stepping it in `test`, or
  // dismissing it outright in `p1`/`p2` — the same target the phone answers,
  // one control fewer to find.

  for (const button of document.querySelectorAll<HTMLElement>("button.role")) {
    button.addEventListener("click", () => {
      deps.setRole((button.dataset.role as ViewRole) ?? "test");
      // By role, not by element: the phone's strip under the field is a
      // second copy of the three, and both copies say which one is on.
      for (const other of document.querySelectorAll<HTMLElement>("button.role")) {
        other.classList.toggle("on", other.dataset.role === button.dataset.role);
      }
    });
  }
}
