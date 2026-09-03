import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { createWorld, DEFAULT_CONFIG } from "@neon-spore/sim";
import { bindStageAfterRun } from "../src/stage-afterrun.js";

/**
 * THE DIRECTOR DRAWS "TAP TO RESTART" AND NOTHING IS LISTENING.
 *
 * `balance.ts` (in `packages/render`, not owned here) writes "tap to restart"
 * onto the after-run screen. The director never answered that instruction:
 * `bindStageTouch` binds `pointerdown` on `#stage`, but a pointerdown that
 * finds no field command (there is none once `world.over`) does nothing, and
 * `▣ SHEET` (`#endRun`) only ever called `endRun` — a second press re-ended an
 * already-ended run, so the button read as dead too.
 *
 * Both dismissals live in `stage-afterrun.ts`, which is dependency-injected the
 * same way `stage-interlude.ts` is (a stub canvas and a stub button rather than
 * `document.getElementById`), so this is a real behavioural test — the canvas
 * click restarts, and a second `#endRun` press un-ends the run — rather than
 * the source-regex `stage.ts` itself would have needed, since `bindStage` is
 * still `ResizeObserver` and `requestAnimationFrame` end to end and this repo's
 * test runner carries no DOM. Whether the field actually comes back at tempo is
 * a browser question and not a `bun test` one, and is unverified here.
 *
 * Split out of `stage.test.ts`, which was three unrelated subjects in one file
 * and installed its `document` at module scope without ever removing it — `bun
 * test` runs every file in one process, so every file loaded after it inherited
 * a fake document. The stub goes up in `beforeAll` and comes down in `afterAll`.
 */

type Listener = () => void;

/** The smallest clickable thing: an element that remembers who is listening. */
function stubClickable() {
  const listeners: Listener[] = [];
  return {
    el: {
      addEventListener: (type: string, fn: Listener) => {
        if (type === "click") listeners.push(fn);
      },
      textContent: "",
    } as unknown as HTMLElement,
    click: (): void => {
      for (const fn of listeners) fn();
    },
  };
}

// Reassigned fresh by every `armed()` call, so each test's button carries only
// its own listener — `bindStageAfterRun` looks it up once, by id, itself.
let currentEndRunBtn = stubClickable();
let hadDocument: unknown;

beforeAll(() => {
  const g = globalThis as { document?: unknown };
  hadDocument = g.document;
  g.document = {
    getElementById: (id: string) => (id === "endRun" ? currentEndRunBtn.el : null),
  };
});

afterAll(() => {
  const g = globalThis as { document?: unknown };
  if (hadDocument === undefined) delete g.document;
  else g.document = hadDocument;
});

function armed() {
  let world = createWorld(DEFAULT_CONFIG, 10);
  let running = true;
  let rebuilds = 0;
  let paintPlays = 0;
  const canvas = stubClickable();
  currentEndRunBtn = stubClickable();
  const endRunBtn = currentEndRunBtn;
  const handle = bindStageAfterRun({
    canvas: canvas.el as unknown as HTMLCanvasElement,
    world: () => world,
    rebuild: () => {
      rebuilds++;
      world = createWorld(DEFAULT_CONFIG, 10);
    },
    setRunning: (r) => {
      running = r;
    },
    paintPlay: () => {
      paintPlays++;
    },
  });
  return {
    canvas,
    endRunBtn,
    handle,
    world: () => world,
    running: () => running,
    rebuilds: () => rebuilds,
    paintPlays: () => paintPlays,
  };
}

describe("the stage answers its own after-run screen", () => {
  it("a click on the canvas does nothing while the run is live", () => {
    const s = armed();
    s.canvas.click();
    expect(s.rebuilds()).toBe(0);
  });

  it("a click on the canvas restarts the wave once the run is over", () => {
    const s = armed();
    s.world().over = true;
    s.canvas.click();
    expect(s.rebuilds()).toBe(1);
  });

  it("a first ▣ SHEET press ends the run and pauses", () => {
    const s = armed();
    s.endRunBtn.click();
    expect(s.world().over).toBe(true);
    expect(s.running()).toBe(false);
    expect(s.paintPlays()).toBe(1);
    expect(s.endRunBtn.el.textContent).toBe("▣ FIELD");
  });

  it("a second ▣ SHEET press un-ends the run in place instead of re-ending it", () => {
    const s = armed();
    s.endRunBtn.click();
    s.endRunBtn.click();
    expect(s.world().over).toBe(false);
    expect(s.running()).toBe(true);
    expect(s.rebuilds()).toBe(0); // un-ending, not rebuilding
    expect(s.endRunBtn.el.textContent).toBe("▣ SHEET");
  });

  it("the handle repaints the label to match whatever `over` is now", () => {
    const s = armed();
    s.world().over = true;
    s.handle.paint();
    expect(s.endRunBtn.el.textContent).toBe("▣ FIELD");
  });
});
