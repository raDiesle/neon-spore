import { afterEach, describe, expect, it } from "bun:test";
import type { Renderer } from "@neon-spore/render";
import { DEFAULT_CONFIG } from "@neon-spore/sim";
import { createRunState, type RunState } from "../src/run-state.js";
import { bindViewport, type Geometry } from "../src/viewport.js";

/**
 * The size the game is drawn at, and the one change to it that is refused.
 *
 * On a phone `window.innerHeight` is not one number: it grows by the height of
 * the address bar the moment the bar collapses and shrinks again when the bar
 * comes back. `computeLayout` makes `bandTop` a share of that height, so every
 * one of those moves the control band — and a thumb resting on a lobe mid-wave
 * is then resting beside it without having moved. So the height is frozen for
 * the length of a run, and this is where that is held to.
 *
 * There is no DOM in this runner, so the window is stood up here. The fake is
 * small on purpose: `bindViewport` reads four numbers off it, binds three
 * listeners, and everything else it does is arithmetic the render package
 * already tests.
 */

const heldWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
const heldDoc = Object.getOwnPropertyDescriptor(globalThis, "document");
const heldObserver = Object.getOwnPropertyDescriptor(globalThis, "ResizeObserver");
const heldStyle = Object.getOwnPropertyDescriptor(globalThis, "getComputedStyle");

afterEach(() => {
  restore("window", heldWindow);
  restore("document", heldDoc);
  restore("ResizeObserver", heldObserver);
  restore("getComputedStyle", heldStyle);
});

function restore(name: string, had: PropertyDescriptor | undefined): void {
  if (had) Object.defineProperty(globalThis, name, had);
  else delete (globalThis as Record<string, unknown>)[name];
}

/** The screen, as the one file under test sees it. */
interface Screen {
  /** Put a new size on the window and fire the listeners a browser would. */
  move: (size: { width?: number; height?: number }) => void;
  /** Give the phone a notch and a home indicator, or take them away. */
  furniture: (inset: { top?: number; bottom?: number; left?: number; right?: number }) => void;
  /** Every size the renderer was told about, oldest first. */
  sized: { width: number; height: number; dpr: number }[];
  run: RunState;
  bind: () => Geometry;
}

/**
 * A window at `375 x 812`, with or without a `visualViewport`.
 *
 * `visual` is the whole of the first question: where there is one it is the
 * rectangle actually showing and the window's own numbers are the layout
 * viewport behind it, which is why the two are given different heights here.
 *
 * The furniture is read off a probe element's resolved padding
 * (`safe-area.ts`), so what is faked is `getComputedStyle` rather than a value
 * on the window, and the same answer is given for whichever element is asked.
 */
function screen(visual: boolean): Screen {
  const listeners: (() => void)[] = [];
  const sized: { width: number; height: number; dpr: number }[] = [];
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  // The layout viewport — taller than what shows, by the address bar.
  const outer = { width: 375, height: 812 };
  const seen = { width: 375, height: 730 };
  const win = {
    innerWidth: outer.width,
    innerHeight: outer.height,
    devicePixelRatio: 2,
    visualViewport: visual ? { ...seen, addEventListener: on } : undefined,
    addEventListener: on,
  };
  function on(_type: string, fn: () => void): void {
    listeners.push(fn);
  }
  define("window", win);
  define("document", {
    documentElement: {},
    body: { appendChild: (): void => {} },
    createElement: () => ({ style: { setProperty: (): void => {} } }),
  });
  define("getComputedStyle", () => ({
    paddingTop: `${inset.top}px`,
    paddingRight: `${inset.right}px`,
    paddingBottom: `${inset.bottom}px`,
    paddingLeft: `${inset.left}px`,
  }));
  define(
    "ResizeObserver",
    class {
      observe(): void {}
    },
  );

  // The three numbers only: the inset rides on the same object and is read
  // through `layout()` below, where it is the whole of what it changes.
  const renderer = {
    resize: (v: { width: number; height: number; dpr: number }) =>
      sized.push({ width: v.width, height: v.height, dpr: v.dpr }),
  } as unknown as Renderer;
  const run = createRunState();
  // The canvas covers the window, which is what the app does to it — so the
  // scale `pointOnStage` works out is 1 and a `clientY` is a window pixel.
  const canvas = {
    getBoundingClientRect: () => ({
      left: 0,
      top: 0,
      width: win.visualViewport?.width ?? win.innerWidth,
      height: win.visualViewport?.height ?? win.innerHeight,
    }),
  } as unknown as HTMLCanvasElement;

  const fire = (): void => {
    for (const fn of [...listeners]) fn();
  };

  return {
    sized,
    run,
    bind: () => bindViewport(canvas, renderer, DEFAULT_CONFIG, () => "test", run),
    furniture: (next) => {
      Object.assign(inset, next);
      fire();
    },
    move: ({ width, height }) => {
      if (width !== undefined) {
        win.innerWidth = width;
        if (win.visualViewport) win.visualViewport.width = width;
      }
      if (height !== undefined) {
        win.innerHeight = height + 82;
        if (win.visualViewport) win.visualViewport.height = height;
      }
      fire();
    },
  };
}

function define(name: string, value: unknown): void {
  Object.defineProperty(globalThis, name, { configurable: true, value });
}

describe("bindViewport", () => {
  it("is sized to the rectangle actually showing, not the one behind the address bar", () => {
    const s = screen(true);
    s.bind();
    expect(s.sized).toEqual([{ width: 375, height: 730, dpr: 2 }]);
  });

  it("falls back to the window where there is no visual viewport", () => {
    const s = screen(false);
    s.bind();
    expect(s.sized).toEqual([{ width: 375, height: 812, dpr: 2 }]);
  });

  /**
   * The bug this file exists for. Nothing the player did moved the band, so
   * the band does not move.
   */
  it("refuses a height that changed under a running wave", () => {
    const s = screen(true);
    s.bind();
    s.move({ height: 812 });
    expect(s.sized).toHaveLength(1);
  });

  it("answers a height that changed while the menu is up", () => {
    const s = screen(true);
    s.bind();
    s.run.hold("menu", true);
    s.move({ height: 812 });
    expect(s.sized.at(-1)).toEqual({ width: 375, height: 812, dpr: 2 });
  });

  /**
   * A rotation moves both numbers, and half of a rotation is not a stage. The
   * freeze is only ever about the height moving *on its own*.
   */
  it("answers a width that changed under a running wave, and takes the height with it", () => {
    const s = screen(true);
    s.bind();
    s.move({ width: 812, height: 375 });
    expect(s.sized.at(-1)).toEqual({ width: 812, height: 375, dpr: 2 });
  });

  it("takes the measurement it ignored once the run ends", () => {
    const s = screen(true);
    s.bind();
    s.move({ height: 812 });
    s.run.hold("hand", true);
    expect(s.sized.at(-1)).toEqual({ width: 375, height: 812, dpr: 2 });
  });

  /**
   * The wave opens on whatever is showing at that moment and is frozen there,
   * so the measurement is taken again on the way in as well as on the way out.
   */
  it("measures again as the run starts, so the frozen height is the wave's own", () => {
    const s = screen(true);
    s.bind();
    s.run.hold("menu", true);
    s.move({ height: 812 });
    s.run.hold("menu", false);
    s.move({ height: 730 });
    expect(s.sized.at(-1)).toEqual({ width: 375, height: 812, dpr: 2 });
  });

  it("ignores a viewport with no size at all — a hidden tab", () => {
    const s = screen(true);
    s.bind();
    s.run.hold("menu", true);
    s.move({ width: 0, height: 0 });
    expect(s.sized).toHaveLength(1);
  });
});

/**
 * The band used to run to the window's own three edges, and on a phone all
 * three are taken: the home indicator and the gesture bar below, the notch and
 * the status bar above. The stage steps inside them, and everything placed in
 * the stage steps in with it — the band, the strips, the lobes — because they
 * are all measured from its corner rather than from the window's.
 */
describe("the phone's own furniture", () => {
  it("cuts the stage inside it, top and bottom", () => {
    const s = screen(true);
    const g = s.bind();
    const bare = g.layout().height;
    s.run.hold("menu", true);
    s.furniture({ top: 44, bottom: 34 });
    expect(g.layout().height).toBe(bare - 78);
  });

  it("carries the band in with it rather than leaving it where it was", () => {
    const s = screen(true);
    const g = s.bind();
    const bare = g.layout().bandTop;
    s.run.hold("menu", true);
    s.furniture({ bottom: 34 });
    // The band's top moves up by the band's own share of the lost height, and
    // its foot — `bandTop + bandHeight` — now stops 34 above the window's.
    const l = g.layout();
    expect(l.bandTop).toBeLessThan(bare);
    expect(l.bandTop + l.bandHeight).toBe(l.height);
  });

  it("puts a press on the home indicator outside the picture", () => {
    const s = screen(true);
    const g = s.bind();
    s.run.hold("menu", true);
    s.furniture({ bottom: 34 });
    // 10 px above the foot of the window is inside the indicator's strip.
    expect(g.inStage({ clientX: 180, clientY: 720 })).toBeNull();
    // And one above the strip still lands, so it is the furniture doing it.
    expect(g.inStage({ clientX: 180, clientY: 690 })).not.toBeNull();
  });

  /**
   * Furniture appearing is a vertical change like any other — a keyboard, an
   * address bar — and a wave is not interrupted to honour one.
   */
  it("is not taken up under a running wave", () => {
    const s = screen(true);
    const g = s.bind();
    const bare = g.layout().height;
    s.furniture({ top: 44, bottom: 34 });
    expect(g.layout().height).toBe(bare);
  });
});
