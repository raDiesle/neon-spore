import type { ViewRole } from "@neon-spore/render";
import type { World } from "@neon-spore/sim";
import { bindStageAfterRun, type StageAfterRunHandle } from "./stage-afterrun.js";
import { bindStageRepeat, type StageRepeatHandle } from "./stage-repeat.js";
import { bindStageTransport } from "./stage-transport.js";

/**
 * Everything that starts, stops and restarts the stage: the `⏸`/`▶` button
 * and the label it wears, the after-run screen, the REPEAT WAVE? veil and the
 * transport row. Split out of `stage.ts` when the jump row took it to 240
 * lines; the four read and write `running` through the same two calls, so
 * they are one seam. `running` itself stays in `stage.ts`, where the stepper
 * and the jump read it.
 */
export interface StagePlayDeps {
  canvas: HTMLCanvasElement;
  world: () => World;
  rebuild: () => void;
  running: () => boolean;
  setRunning: (running: boolean) => void;
  setRole: (role: ViewRole) => void;
}

export interface StagePlay {
  paintPlay: () => void;
  afterRun: StageAfterRunHandle;
  repeat: StageRepeatHandle;
}

export function bindStagePlay(deps: StagePlayDeps): StagePlay {
  const playBtn = document.getElementById("play");
  const paintPlay = (): void => {
    if (playBtn) playBtn.textContent = deps.running() ? "⏸" : "▶";
  };
  const afterRun = bindStageAfterRun({
    canvas: deps.canvas,
    world: deps.world,
    rebuild: deps.rebuild,
    setRunning: deps.setRunning,
    paintPlay,
  });
  const veil = document.getElementById("repeatWave");
  if (!veil) throw new Error("#repeatWave missing");
  const repeat = bindStageRepeat({
    veil,
    doc: document,
    rebuild: deps.rebuild,
    setRunning: deps.setRunning,
    paintPlay,
  });
  bindStageTransport({
    rebuild: deps.rebuild,
    onPlayToggle: () => {
      if (repeat.asking()) return repeat.answer(); // P is yes, while it asks
      deps.setRunning(!deps.running());
      paintPlay();
    },
    setRole: deps.setRole,
  });
  return { paintPlay, afterRun, repeat };
}
