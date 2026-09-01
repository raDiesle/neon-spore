/**
 * A canvas that answers like the real one and complains where the real one
 * would — or, in a few places, where the real one silently would not.
 *
 * `packages/render` is the one package with no tests, because its output is
 * pixels and pixels are not assertable. Its *arguments* are: a colour the
 * browser cannot parse, a coordinate that came out NaN, a negative radius.
 * Every one of those is a crash or an invisible object in the running game and
 * nothing at all in a type check. So the stub is strict, and a frame drawn
 * through it either passes or names the call that was wrong.
 *
 * Bun has no DOM, so this also installs the two globals render/ reaches for:
 * `document.createElement("canvas")` (glow sprites, the dither tile) and
 * `Path2D`.
 */

const COLOR = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$|^rgba?\([^)]+\)$/i;

class StubFail extends Error {}

function fail(where: string, detail: string): never {
  throw new StubFail(`${where}: ${detail}`);
}

/** Every coordinate that reaches the canvas has to be a real number. */
function nums(where: string, values: number[]): void {
  for (const v of values) {
    if (typeof v !== "number" || !Number.isFinite(v)) fail(where, `${v} is not a finite number`);
  }
}

function color(where: string, value: unknown): void {
  if (value instanceof StubGradient || value instanceof StubPattern) return;
  if (typeof value !== "string" || !COLOR.test(value))
    fail(where, `${String(value)} is not a colour`);
}

class StubGradient {
  addColorStop(offset: number, value: string): void {
    nums("addColorStop", [offset]);
    if (offset < 0 || offset > 1) fail("addColorStop", `offset ${offset} is outside 0..1`);
    color("addColorStop", value);
  }
}

class StubPattern {}

/** A path is a string of numbers; one NaN in it and the shape silently vanishes. */
class StubPath {
  constructor(d?: string) {
    if (d !== undefined && /NaN|Infinity|undefined/.test(d)) {
      fail("new Path2D", `path contains ${/NaN/.test(d) ? "NaN" : "a non-finite value"}`);
    }
  }

  /** A path can also be built by call, not only from a string — and a real
   * `Path2D.rect` refuses a non-finite coordinate the same as a string one. */
  rect(x: number, y: number, w: number, h: number): void {
    nums("Path2D.rect", [x, y, w, h]);
  }
}

class StubImageData {
  data: Uint8ClampedArray;
  constructor(
    readonly width: number,
    readonly height: number,
  ) {
    this.data = new Uint8ClampedArray(width * height * 4);
  }
}

export class StubContext {
  private _fillStyle: unknown = "#000000";
  private _strokeStyle: unknown = "#000000";
  private _lineWidth = 1;
  private _globalAlpha = 1;
  private _lineDash: number[] = [];
  private _lineDashOffset = 0;
  font = "10px sans-serif";
  textAlign = "start";
  lineCap = "butt";
  lineJoin = "miter";
  shadowBlur = 0;
  globalCompositeOperation = "source-over";
  /** How many draw calls a frame made, so a test can tell a frame from nothing. */
  calls = 0;

  set fillStyle(v: unknown) {
    color("fillStyle", v);
    this._fillStyle = v;
  }
  get fillStyle(): unknown {
    return this._fillStyle;
  }
  set strokeStyle(v: unknown) {
    color("strokeStyle", v);
    this._strokeStyle = v;
  }
  get strokeStyle(): unknown {
    return this._strokeStyle;
  }
  set lineWidth(v: number) {
    nums("lineWidth", [v]);
    if (v <= 0) fail("lineWidth", `${v} draws nothing`);
    this._lineWidth = v;
  }
  get lineWidth(): number {
    return this._lineWidth;
  }
  /** Out of range is not an error in a browser; it is a mistake everywhere else. */
  set globalAlpha(v: number) {
    nums("globalAlpha", [v]);
    if (v < 0 || v > 1) fail("globalAlpha", `${v} is outside 0..1`);
    this._globalAlpha = v;
  }
  get globalAlpha(): number {
    return this._globalAlpha;
  }

  /**
   * A dash pattern, which a browser takes silently and then draws nothing
   * from if a number in it is not finite or is negative — the exact shape of
   * failure this stub exists for. `lineDashOffset` is a plain number and gets
   * the same treatment through its setter below.
   */
  setLineDash(pattern: number[]): void {
    if (!Array.isArray(pattern)) fail("setLineDash", "pattern is not an array");
    nums("setLineDash", pattern);
    for (const v of pattern) {
      if (v < 0) fail("setLineDash", `dash ${v} is negative`);
    }
    this._lineDash = pattern.slice();
  }
  getLineDash(): number[] {
    return this._lineDash.slice();
  }
  set lineDashOffset(v: number) {
    nums("lineDashOffset", [v]);
    this._lineDashOffset = v;
  }
  get lineDashOffset(): number {
    return this._lineDashOffset;
  }

  save(): void {}
  restore(): void {}
  beginPath(): void {}
  closePath(): void {}
  clip(): void {}
  measureText(text: string): { width: number } {
    return { width: text.length * 6 };
  }

  moveTo(...a: number[]): void {
    nums("moveTo", a);
  }
  lineTo(...a: number[]): void {
    nums("lineTo", a);
  }
  quadraticCurveTo(...a: number[]): void {
    nums("quadraticCurveTo", a);
  }
  rect(...a: number[]): void {
    nums("rect", a);
  }
  translate(...a: number[]): void {
    nums("translate", a);
  }
  scale(...a: number[]): void {
    nums("scale", a);
  }
  rotate(...a: number[]): void {
    nums("rotate", a);
  }
  setTransform(...a: number[]): void {
    nums("setTransform", a);
  }

  arc(x: number, y: number, r: number, from: number, to: number): void {
    nums("arc", [x, y, r, from, to]);
    if (r < 0) fail("arc", `radius ${r} is negative`);
    this.calls++;
  }
  ellipse(
    x: number,
    y: number,
    rx: number,
    ry: number,
    rotation: number,
    from: number,
    to: number,
  ): void {
    nums("ellipse", [x, y, rx, ry, rotation, from, to]);
    if (rx < 0 || ry < 0) fail("ellipse", `radius ${rx < 0 ? rx : ry} is negative`);
    this.calls++;
  }
  fillRect(...a: number[]): void {
    nums("fillRect", a);
    this.calls++;
  }
  strokeRect(...a: number[]): void {
    nums("strokeRect", a);
    this.calls++;
  }
  fillText(text: string, x: number, y: number): void {
    nums("fillText", [x, y]);
    if (/NaN|undefined/.test(text)) fail("fillText", `text reads "${text}"`);
    this.calls++;
  }
  fill(): void {
    this.calls++;
  }
  stroke(): void {
    this.calls++;
  }
  drawImage(_img: unknown, ...a: number[]): void {
    nums("drawImage", a);
    this.calls++;
  }

  createLinearGradient(...a: number[]): StubGradient {
    nums("createLinearGradient", a);
    return new StubGradient();
  }
  createRadialGradient(
    x0: number,
    y0: number,
    r0: number,
    x1: number,
    y1: number,
    r1: number,
  ): StubGradient {
    nums("createRadialGradient", [x0, y0, r0, x1, y1, r1]);
    if (r0 < 0 || r1 < 0) fail("createRadialGradient", "radius is negative");
    return new StubGradient();
  }
  createPattern(): StubPattern {
    return new StubPattern();
  }
  createImageData(w: number, h: number): StubImageData {
    return new StubImageData(w, h);
  }
  putImageData(): void {}
}

/** A canvas element, enough of one for `new Canvas2DRenderer(canvas)`. */
export function stubCanvas(): { canvas: HTMLCanvasElement; ctx: StubContext } {
  const ctx = new StubContext();
  const canvas = {
    width: 0,
    height: 0,
    style: {},
    getContext: () => ctx,
  };
  return { canvas: canvas as unknown as HTMLCanvasElement, ctx };
}

/** Installs `document` and `Path2D`, which Bun does not have. */
export function installCanvasGlobals(): void {
  const g = globalThis as Record<string, unknown>;
  g.Path2D = StubPath;
  g.document = {
    createElement: (tag: string) => {
      if (tag !== "canvas") throw new Error(`unexpected createElement(${tag})`);
      return stubCanvas().canvas;
    },
  };
}
