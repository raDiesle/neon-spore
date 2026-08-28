import { beforeAll, describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG } from "@neon-spore/sim";
import { drawBackdrop, hash01 } from "../src/backdrop.js";
import { computeLayout } from "../src/layout.js";
import { installCanvasGlobals } from "./canvas-stub.js";

// `light-shafts.ts` reaches for `document.createElement("canvas")` for its
// sprite cache, same as `glow.ts` — the global `frame.test.ts` and
// `restart.test.ts` already install for that reason.
beforeAll(installCanvasGlobals);

/**
 * The backdrop's whole risk is the opposite of the rest of render/: instead of
 * checking that the canvas accepts every value (frame.test.ts's job), this
 * checks that the values never depend on anything but `wave` and `time` — no
 * `Math.random` sneaking in and drawing a different field on the two screens.
 *
 * A minimal recording context stands in for the canvas: it does not validate
 * colours the way `canvas-stub.ts` does (frame.test.ts already runs the real
 * backdrop through that, every frame, for every role), it only remembers what
 * it was asked to draw, in order, as text — cheap enough to compare two runs
 * for exact equality.
 */

const CFG = DEFAULT_CONFIG;
const L = computeLayout({ width: 900, height: 1600, dpr: 2 }, CFG, "test");

class Recorder {
  log: string[] = [];
  private _fillStyle: unknown = "";
  private _globalAlpha = 1;

  set fillStyle(v: unknown) {
    this._fillStyle = v;
  }
  get fillStyle(): unknown {
    return this._fillStyle;
  }
  set globalAlpha(v: number) {
    this._globalAlpha = v;
  }
  get globalAlpha(): number {
    return this._globalAlpha;
  }

  fillRect(x: number, y: number, w: number, h: number): void {
    this.log.push(
      `rect ${String(this._fillStyle)} a=${this._globalAlpha} ${x.toFixed(3)},${y.toFixed(3)},${w.toFixed(3)},${h.toFixed(3)}`,
    );
  }

  // `light-shafts.ts` rotates the canvas to `KEY`'s angle and blits a cached
  // sprite rather than filling rects — this records the same shape of thing
  // frame.test.ts's real canvas accepts, so the determinism checks below see
  // it too.
  save(): void {
    this.log.push("save");
  }
  restore(): void {
    this.log.push("restore");
  }
  translate(x: number, y: number): void {
    this.log.push(`translate ${x.toFixed(3)},${y.toFixed(3)}`);
  }
  rotate(angle: number): void {
    this.log.push(`rotate ${angle.toFixed(6)}`);
  }
  drawImage(_img: unknown, dx: number, dy: number, dw: number, dh: number): void {
    this.log.push(
      `image a=${this._globalAlpha} ${dx.toFixed(3)},${dy.toFixed(3)},${dw.toFixed(3)},${dh.toFixed(3)}`,
    );
  }

  createLinearGradient(x0: number, y0: number, x1: number, y1: number) {
    const stops: string[] = [];
    return {
      addColorStop: (offset: number, color: string) => {
        stops.push(`${offset}:${color}`);
      },
      toString: () => `grad(${x0},${y0},${x1},${y1})[${stops.join(";")}]`,
    };
  }
}

function record(wave: number, time: number): string[] {
  const r = new Recorder();
  drawBackdrop(r as unknown as CanvasRenderingContext2D, L, wave, time);
  return r.log;
}

describe("hash01", () => {
  it("is a pure function of its index, not a roll of the dice", () => {
    for (const i of [0, 1, 2, 41, 1000, 12_345]) {
      expect(hash01(i)).toBe(hash01(i));
    }
  });

  it("always lands in [0, 1)", () => {
    for (let i = 0; i < 500; i++) {
      const v = hash01(i);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe("the backdrop", () => {
  it("draws something", () => {
    expect(record(0, 0).length).toBeGreaterThan(0);
  });

  it("draws byte-for-byte the same field for the same wave and time, every time", () => {
    // The whole point: two devices holding the same tick must never disagree
    // about what is behind the field, and nothing here may read a clock or a
    // random source to find out.
    expect(record(2, 12.5)).toEqual(record(2, 12.5));
  });

  it("moves the motes as time passes, without changing how many things are drawn", () => {
    const a = record(2, 0);
    const b = record(2, 30);
    expect(a).not.toEqual(b);
    expect(a.length).toBe(b.length);
  });

  it("gives different acts a different wash and horizon, same time", () => {
    const a = record(0, 5);
    const b = record(1, 5);
    expect(a).not.toEqual(b);
  });

  it("never throws on a field with nothing to draw into", () => {
    const empty = computeLayout({ width: 0, height: 0, dpr: 1 }, CFG, "test");
    expect(() =>
      drawBackdrop(new Recorder() as unknown as CanvasRenderingContext2D, empty, 0, 0),
    ).not.toThrow();
  });
});
