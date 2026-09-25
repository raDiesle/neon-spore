import type { Renderer } from "@neon-spore/render";
import { DEFAULT_CONFIG } from "@neon-spore/sim";
import { createRunState, type RunState } from "../src/run-state.js";
import { bindViewport, type Geometry } from "../src/viewport.js";

/**
 * The window `viewport.test.ts` and `viewport-furniture.test.ts` stand up,
 * since there is no DOM in this runner. The fake is small on purpose:
 * `bindViewport` reads four numbers off it, binds its listeners, and
 * everything else it does is arithmetic the render package already tests.
 */

const heldWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
const heldDoc = Object.getOwnPropertyDescriptor(globalThis, "document");
const heldObserver = Object.getOwnPropertyDescriptor(globalThis, "ResizeObserver");
const heldStyle = Object.getOwnPropertyDescriptor(globalThis, "getComputedStyle");

/** Puts back every global `screen` stood up; each file runs it after each test. */
export function restoreGlobals(): void {
  restore("window", heldWindow);
  restore("document", heldDoc);
  restore("ResizeObserver", heldObserver);
  restore("getComputedStyle", heldStyle);
}

function restore(name: string, had: PropertyDescriptor | undefined): void {
  if (had) Object.defineProperty(globalThis, name, had);
  else delete (globalThis as Record<string, unknown>)[name];
}

/** The screen, as the one file under test sees it. */
export interface Screen {
  /** Put a new size on the window and fire the listeners a browser would. */
  move: (size: { width?: number; height?: number }) => void;
  /** Give the phone a notch and a home indicator, or take them away. */
  furniture: (inset: { top?: number; bottom?: number; left?: number; right?: number }) => void;
  /** Every size the renderer was told about, oldest first. */
  sized: { width: number; height: number; dpr: number }[];
  /** The canvas's inline CSS size, which this host writes and the renderer does not. */
  style: { width?: string; height?: string };
  /** The height with every bar out (`100svh`); 0, the default, is a browser
   * that cannot say. Read at the same moments the furniture is. */
  bars: (small: number) => void;
  /** How many times the furniture has been read off the page. */
  reads: () => number;
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
export function screen(visual: boolean): Screen {
  const listeners: { type: string; fn: () => void }[] = [];
  let reads = 0;
  const sized: { width: number; height: number; dpr: number }[] = [];
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  let small = 0;
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
  function on(type: string, fn: () => void): void {
    listeners.push({ type, fn });
  }
  define("window", win);
  define("document", {
    documentElement: {},
    body: { appendChild: (): void => {} },
    createElement: () => ({
      style: { setProperty: (): void => {} },
      getBoundingClientRect: () => ({ height: small }),
    }),
  });
  define("getComputedStyle", () => {
    reads++;
    return {
      paddingTop: `${inset.top}px`,
      paddingRight: `${inset.right}px`,
      paddingBottom: `${inset.bottom}px`,
      paddingLeft: `${inset.left}px`,
    };
  });
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
  const style: { width?: string; height?: string } = {};
  const canvas = {
    style,
    getBoundingClientRect: () => ({
      left: 0,
      top: 0,
      width: win.visualViewport?.width ?? win.innerWidth,
      height: win.visualViewport?.height ?? win.innerHeight,
    }),
  } as unknown as HTMLCanvasElement;

  // A size change is a `resize`; the furniture changing is a rotation, which
  // a browser tells every listener about.
  const fire = (only?: string): void => {
    for (const l of [...listeners]) if (!only || l.type === only) l.fn();
  };

  return {
    sized,
    style,
    reads: () => reads,
    run,
    bind: () => bindViewport(canvas, renderer, DEFAULT_CONFIG, () => "test", run),
    bars: (next) => {
      small = next;
      fire();
    },
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
      fire("resize");
    },
  };
}

function define(name: string, value: unknown): void {
  Object.defineProperty(globalThis, name, { configurable: true, value });
}
