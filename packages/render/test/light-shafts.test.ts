import { beforeAll, describe, expect, it } from "bun:test";
import { KEY } from "@neon-spore/content";
import { DEFAULT_CONFIG } from "@neon-spore/sim";
import { computeLayout } from "../src/layout.js";
import { drawLightShafts } from "../src/light-shafts.js";
import { installCanvasGlobals } from "./canvas-stub.js";

/**
 * `drawLightShafts` is the one call `backdrop.ts` adds for the owner's
 * "sun falling into the ocean deep" — this checks the three things that ask
 * named as load-bearing: it leans to `KEY` without a second copy of the
 * angle, it is a pure function of `time` and nothing else, and it never
 * allocates a canvas per frame.
 */

beforeAll(installCanvasGlobals);

const CFG = DEFAULT_CONFIG;
const L = computeLayout({ width: 900, height: 1600, dpr: 2 }, CFG, "test");

class Recorder {
  log: string[] = [];
  private _globalAlpha = 1;

  set fillStyle(_v: unknown) {}
  get fillStyle(): unknown {
    return "";
  }
  set globalAlpha(v: number) {
    this._globalAlpha = v;
  }
  get globalAlpha(): number {
    return this._globalAlpha;
  }
  globalCompositeOperation = "source-over";

  save(): void {}
  restore(): void {}
  translate(): void {}
  rotate(angle: number): void {
    this.log.push(`rotate ${angle.toFixed(9)}`);
  }
  drawImage(_img: unknown, dx: number, dy: number, dw: number, dh: number): void {
    this.log.push(
      `image a=${this._globalAlpha} ${dx.toFixed(3)},${dy.toFixed(3)},${dw.toFixed(3)},${dh.toFixed(3)}`,
    );
  }
}

function record(time: number): string[] {
  const r = new Recorder();
  drawLightShafts(r as unknown as CanvasRenderingContext2D, L, time);
  return r.log;
}

describe("drawLightShafts", () => {
  it("leans at the light's own travel direction, not a second copy of it", () => {
    const angle = Math.atan2(-KEY.y, -KEY.x);
    const log = record(0);
    const rotations = log.filter((l) => l.startsWith("rotate"));
    expect(rotations.length).toBeGreaterThan(0);
    for (const line of rotations) {
      expect(line).toBe(`rotate ${angle.toFixed(9)}`);
    }
  });

  it("draws a few bands, never many", () => {
    const log = record(0);
    const bands = log.filter((l) => l.startsWith("image"));
    expect(bands.length).toBeGreaterThan(0);
    expect(bands.length).toBeLessThanOrEqual(5);
  });

  it("stays dim — no band's alpha competes with a body's own brightness", () => {
    const log = record(0);
    for (const line of log.filter((l) => l.startsWith("image"))) {
      const alpha = Number(line.match(/a=([\d.]+)/)?.[1]);
      expect(alpha).toBeLessThan(0.15);
    }
  });

  it("is a pure function of time — same time, same frame, on both screens", () => {
    expect(record(12.5)).toEqual(record(12.5));
  });

  it("drifts as time passes, without changing how many bands are drawn", () => {
    const a = record(0);
    const b = record(40);
    expect(a).not.toEqual(b);
    expect(a.length).toBe(b.length);
  });

  it("draws nothing into a field with no sky to put a stripe in", () => {
    const empty = computeLayout({ width: 0, height: 0, dpr: 1 }, CFG, "test");
    const r = new Recorder();
    expect(() => drawLightShafts(r as unknown as CanvasRenderingContext2D, empty, 0)).not.toThrow();
    expect(r.log.length).toBe(0);
  });

  it("never allocates a fresh sprite once the cache is warm", () => {
    const g = globalThis as { document: { createElement: (tag: string) => unknown } };
    let created = 0;
    const real = g.document.createElement;
    g.document.createElement = (tag: string) => {
      created++;
      return real(tag);
    };
    try {
      record(0);
      const after = created;
      record(1);
      record(2);
      expect(created).toBe(after);
    } finally {
      g.document.createElement = real;
    }
  });
});
