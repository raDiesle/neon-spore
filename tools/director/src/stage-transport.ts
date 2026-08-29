import type { ViewRole } from "@neon-spore/render";
import type { Keys } from "./keys.js";

/**
 * The buttons under the field: `⏸`/`▶`, `↺ WAVE`, `✓ CARD` and the three role
 * switches. Split out of `stage.ts` on the layout pass that also moved
 * `#briefToggle` and the balance sheet — `stage.ts` was already at its line
 * budget, and this is the same shape `stage-afterrun.ts`, `stage-gauge.ts` and
 * `stage-touch.ts` already use: DOM wiring that reads and writes the one
 * running world through a small set of callbacks rather than a reference.
 */
export interface StageTransportDeps {
  push: Keys["push"];
  rebuild: () => void;
  /** Flip `running` and repaint the play button — both live in `stage.ts`. */
  onPlayToggle: () => void;
  setRole: (role: ViewRole) => void;
}

export function bindStageTransport(deps: StageTransportDeps): void {
  document.getElementById("play")?.addEventListener("click", deps.onPlayToggle);
  document.getElementById("restart")?.addEventListener("click", deps.rebuild);
  // The whole stage is the card's button on a phone (`apps/game/src/briefing.ts`);
  // here it is one button instead, since `bindStageTouch` already spends the
  // canvas's own pointerdown on the cannon. Both acks unconditionally, exactly
  // like the game's own Space key — the command means nothing when no card is
  // up, so it costs nothing to send it whether or not one is. Without this,
  // turning `briefings` on (`pair-panel.ts`, now under `#briefToggle`) freezes
  // the stage on the first wave forever: `startWave` opens the card and
  // nothing else in the director could ever put it away.
  document.getElementById("ackBrief")?.addEventListener("click", () => {
    deps.push(1, { kind: "brief" });
    deps.push(2, { kind: "brief" });
  });

  for (const button of document.querySelectorAll<HTMLElement>("button.role")) {
    button.addEventListener("click", () => {
      deps.setRole((button.dataset.role as ViewRole) ?? "test");
      for (const other of document.querySelectorAll("button.role")) {
        other.classList.toggle("on", other === button);
      }
    });
  }
}
