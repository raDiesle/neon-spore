import { endRun, type World } from "@neon-spore/sim";

/**
 * The after-run screen honours its own instruction.
 *
 * The director holds the hull, so no run here ever ends on its own — this is
 * the way in, and the way back out. `balance.ts` (`packages/render`, not owned
 * here) draws "tap to restart" onto the sheet once a run ends, and nothing in
 * the director was listening for it: `bindStageTouch` already spends the
 * canvas's own pointerdown on the cannon, and finds no field command once the
 * run is over, so a tap on the stage did nothing. `▣ SHEET` (`#endRun`) only
 * ever ended a run, so a second press re-ended one already over, and the
 * button read as dead too.
 *
 * Both live here rather than in `stage.ts` because they answer one screen: a
 * click on the stage restarts the wave — the same thing `#restart` already
 * does — and a second `#endRun` press un-ends the run in place, resuming
 * exactly where `endRun` froze it, rather than rebuilding it. The button's own
 * label follows which way the next press goes, the same convention the play
 * button already uses for `▶`/`⏸`.
 */
export interface StageAfterRun {
  canvas: HTMLCanvasElement;
  /** The live world — read fresh, since `rebuild` swaps it for a new one. */
  world: () => World;
  rebuild: () => void;
  setRunning: (running: boolean) => void;
  /** Repaints the play button, whose `▶`/`⏸` also depends on `running`. */
  paintPlay: () => void;
}

export interface StageAfterRunHandle {
  /** Repaint the `#endRun` label. Call after anything that can change `over`. */
  paint(): void;
}

export function bindStageAfterRun({
  canvas,
  world,
  rebuild,
  setRunning,
  paintPlay,
}: StageAfterRun): StageAfterRunHandle {
  const endRunBtn = document.getElementById("endRun");
  const paint = (): void => {
    if (endRunBtn) endRunBtn.textContent = world().over ? "▣ FIELD" : "▣ SHEET";
  };

  // `balance.ts` says "tap to restart"; this is the ear for it. Same as `#restart`.
  canvas.addEventListener("click", () => {
    if (world().over) rebuild();
  });

  // Toggles: a second press used to re-end an already-ended run, reading as
  // dead. Now it un-ends the run in place, instead of rebuilding it.
  endRunBtn?.addEventListener("click", () => {
    if (world().over) {
      world().over = false;
      setRunning(true);
    } else {
      endRun(world());
      setRunning(false);
    }
    paintPlay();
    paint();
  });

  return { paint };
}
