import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { controlSet } from "@neon-spore/content";
import { computeLayout, computeStage } from "@neon-spore/render";
import {
  type Command,
  createWorld,
  DEFAULT_CONFIG,
  mazeRound,
  midCol,
  startWave,
  type World,
} from "@neon-spore/sim";
import { stagePoint } from "../src/stage-point.js";
import { bindStageTouch, pointerSeat } from "../src/stage-touch.js";

/**
 * A CLICK ON A CONTROL LANDS ON THE CONTROL THAT WAS DRAWN.
 *
 * The owner reported it as clicking in the director sometimes not working, and
 * suspected sizing or scaling. Both halves were true and they were the same
 * fault: the renderer draws into a phone-shaped rectangle cut out of the
 * canvas (`computeStage`), and four listeners each built their layout from the
 * whole canvas and turned a `PointerEvent` into canvas coordinates with their
 * own copy of the same three lines. At the panel's real size that puts the
 * first lobe on screen near x=93 with a radius of 17 and answers it near x=61
 * with a ring of 28 — overlapping just enough that some presses worked.
 *
 * Two things are checked, and the second is the one no arithmetic here could
 * be trusted to prove on its own: the conversion returns the coordinates the
 * renderer drew in, and a press put where a control *looks* emits that
 * control's command through the real binding.
 */

type Listener = (e: unknown) => void;

let windowOn = new Map<string, Listener[]>();
let hadWindow: unknown;

beforeAll(() => {
  const g = globalThis as { window?: unknown };
  hadWindow = g.window;
  g.window = {
    addEventListener: (type: string, fn: Listener): void => {
      const list = windowOn.get(type) ?? [];
      list.push(fn);
      windowOn.set(type, list);
    },
  };
});

afterAll(() => {
  const g = globalThis as { window?: unknown };
  if (hadWindow === undefined) delete g.window;
  else g.window = hadWindow;
});

/** A panel the shape the director actually gives the stage. */
const VIEWPORT = { width: 392, height: 700, dpr: 1 };
/** The canvas is laid out bigger than the renderer was told — browser zoom. */
const ZOOM = 1.25;
const RECT = { left: 100, top: 20 };

function stubCanvas() {
  const on = new Map<string, Listener[]>();
  windowOn = new Map();
  return {
    canvas: {
      addEventListener: (type: string, fn: Listener) => {
        const list = on.get(type) ?? [];
        list.push(fn);
        on.set(type, list);
      },
      getBoundingClientRect: () => ({
        left: RECT.left,
        top: RECT.top,
        width: VIEWPORT.width * ZOOM,
        height: VIEWPORT.height * ZOOM,
      }),
    } as unknown as HTMLCanvasElement,
    fire(type: string, e: unknown): void {
      for (const fn of on.get(type) ?? []) fn(e);
      for (const fn of windowOn.get(type) ?? []) fn(e);
    },
  };
}

const cfg = DEFAULT_CONFIG;
const stage = () => computeStage(VIEWPORT, cfg, "test");
const layout = () =>
  computeLayout({ width: stage().width, height: stage().height, dpr: 1 }, cfg, "test");

/** Where a point in the drawn picture is on the screen the mouse is on. */
function onScreen(x: number, y: number): { clientX: number; clientY: number } {
  const s = stage();
  return {
    clientX: RECT.left + (x + s.left) * ZOOM,
    clientY: RECT.top + (y + s.top) * ZOOM,
  };
}

describe("the stage's pointer conversion", () => {
  test("the stage is narrower than the canvas, which is why this exists", () => {
    // If this ever stops being true the offset is zero and the test below
    // would pass with the conversion deleted.
    expect(stage().width).toBeLessThan(VIEWPORT.width - 20);
    expect(stage().left).toBeGreaterThan(20);
  });

  test("a point on screen comes back as the point that was drawn", () => {
    const stub = stubCanvas();
    const at = stagePoint(stub.canvas, () => VIEWPORT, stage);
    const l = layout();
    const x = l.gridLeft + 5 * l.tile + l.tile / 2;
    const y = l.cannonStrip.y;
    const p = at(onScreen(x, y));
    expect(p.x).toBeCloseTo(x, 6);
    expect(p.y).toBeCloseTo(y, 6);
  });

  test("a press on the middle column of the cannon strip moves it there", () => {
    const world: World = createWorld(cfg, 0);
    startWave(world, 0, [], [], null, false);
    const sent: { player: 1 | 2; command: Command }[] = [];
    const stub = stubCanvas();
    bindStageTouch({
      canvas: stub.canvas,
      at: stagePoint(stub.canvas, () => VIEWPORT, stage),
      layout,
      field: () => ({
        creatures: world.creatures,
        cannonCol: world.cannonCol,
        shieldCol: world.shieldCol,
        beatPhase: 0,
        seat: pointerSeat("test"),
        cfg,
        maze: mazeRound(world),
        warden: null,
        controls: controlSet(undefined),
      }),
      push: (player, command) => sent.push({ player, command }),
      world: () => world,
      role: () => "test",
      cardStep: () => 0,
      setCardStep: () => {},
    });

    const l = layout();
    const middle = midCol(cfg);
    stub.fire("pointerdown", {
      pointerId: 1,
      preventDefault: () => {},
      ...onScreen(l.gridLeft + middle * l.tile + l.tile / 2, l.cannonStrip.y),
    });

    expect(sent).toEqual([{ player: 1, command: { kind: "cannonCol", col: middle } }]);
  });
});
