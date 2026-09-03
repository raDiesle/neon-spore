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

/** Shared by every counted call site, including StubPath's constructor,
 * which has no `this: StubContext` to hang a method off of. */
let activeTally: Map<string, number> | undefined;
let activeLog: string[] | undefined;

function round(v: unknown): unknown {
  return typeof v === "number" ? Math.round(v * 1000) / 1000 : v;
}

function hit(name: string, args?: unknown[]): void {
  if (activeTally) activeTally.set(name, (activeTally.get(name) ?? 0) + 1);
  if (activeLog) {
    const rendered = args ? args.map(round).join(", ") : "";
    activeLog.push(args ? `${name}(${rendered})` : name);
  }
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
    hit("new Path2D");
  }

  /** A path can also be built by call, not only from a string — and a real
   * `Path2D` refuses a non-finite coordinate the same as a string one. Every
   * builder the game uses is here; a missing one is not a silent no-op but a
   * `TypeError` at the first frame that reaches it, which is how the veil's
   * cloud went a whole lane without a single frame drawn over it. */
  rect(x: number, y: number, w: number, h: number): void {
    nums("Path2D.rect", [x, y, w, h]);
  }
  moveTo(x: number, y: number): void {
    nums("Path2D.moveTo", [x, y]);
  }
  lineTo(x: number, y: number): void {
    nums("Path2D.lineTo", [x, y]);
  }
  quadraticCurveTo(...a: number[]): void {
    nums("Path2D.quadraticCurveTo", a);
  }
  bezierCurveTo(...a: number[]): void {
    nums("Path2D.bezierCurveTo", a);
  }
  closePath(): void {}
  arc(x: number, y: number, r: number, from: number, to: number): void {
    nums("Path2D.arc", [x, y, r, from, to]);
    if (r < 0) fail("Path2D.arc", `radius ${r} is negative`);
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
    nums("Path2D.ellipse", [x, y, rx, ry, rotation, from, to]);
    if (rx < 0 || ry < 0) fail("Path2D.ellipse", `radius ${rx < 0 ? rx : ry} is negative`);
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
  /** How many draw calls a frame made, so a test can tell a frame from nothing. */
  calls = 0;
  /** Per-method call counts, for a test that budgets op counts rather than
   * merely detecting a frame. Reset it (`ctx.tally.clear()`) between frames. */
  readonly tally = new Map<string, number>();
  /** Optional ordered log of every counted call, compact enough to diff two
   * frames by eye. Unset by default; assign an array to start recording. */
  private _log?: string[];
  private _globalCompositeOperation = "source-over";

  // Deliberately does *not* claim `activeTally`/`activeLog` here — a frame
  // draws through offscreen sprite-baking canvases too (`glow.ts`'s halo
  // sprites, `sheen.ts`'s grain and dither pattern), each its own
  // `StubContext` created via `document.createElement("canvas")`. If the
  // constructor claimed the module pointers, the last sprite baked before a
  // frame's `new Path2D(...)` would silently steal its tally. Only
  // `stubCanvas`'s caller decides which context is "the frame" — see there.

  set log(v: string[] | undefined) {
    this._log = v;
    activeLog = v;
  }
  get log(): string[] | undefined {
    return this._log;
  }

  set fillStyle(v: unknown) {
    color("fillStyle", v);
    this._fillStyle = v;
    this.mark("set fillStyle", v);
  }
  get fillStyle(): unknown {
    return this._fillStyle;
  }
  set strokeStyle(v: unknown) {
    color("strokeStyle", v);
    this._strokeStyle = v;
    this.mark("set strokeStyle", v);
  }
  get strokeStyle(): unknown {
    return this._strokeStyle;
  }
  set lineWidth(v: number) {
    nums("lineWidth", [v]);
    if (v <= 0) fail("lineWidth", `${v} draws nothing`);
    this._lineWidth = v;
    this.mark("set lineWidth", v);
  }
  get lineWidth(): number {
    return this._lineWidth;
  }
  /** Out of range is not an error in a browser; it is a mistake everywhere else. */
  set globalAlpha(v: number) {
    nums("globalAlpha", [v]);
    if (v < 0 || v > 1) fail("globalAlpha", `${v} is outside 0..1`);
    this._globalAlpha = v;
    this.mark("set globalAlpha", v);
  }
  get globalAlpha(): number {
    return this._globalAlpha;
  }
  set globalCompositeOperation(v: string) {
    this._globalCompositeOperation = v;
    this.mark("set globalCompositeOperation", v);
  }
  get globalCompositeOperation(): string {
    return this._globalCompositeOperation;
  }

  /** Records to this instance's tally/log, not the module-level `active*`
   * pointers — those exist only so `StubPath`, which has no `this: StubContext`,
   * can still tally itself against whichever context last constructed one.
   * `value` is a setter's new value (logged as `name=value`); `args` is a
   * method's argument list (logged as `name(args)`). At most one is given. */
  private mark(name: string, value?: unknown, args?: unknown[]): void {
    this.tally.set(name, (this.tally.get(name) ?? 0) + 1);
    if (!this.log) return;
    if (args) this.log.push(`${name}(${args.map(round).join(", ")})`);
    else if (value !== undefined) this.log.push(`${name}=${round(value)}`);
    else this.log.push(name);
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

  save(): void {
    this.mark("save");
  }
  restore(): void {
    this.mark("restore");
  }
  beginPath(): void {
    this.mark("beginPath");
  }
  closePath(): void {}
  clip(): void {
    this.mark("clip");
  }
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
  /** The cubic. THE WISP's streamers are the first thing here to want one:
   * a tentacle has a root that hangs and a tip that trails, which is two
   * controls and not one (`render/wisp-body.ts`). */
  bezierCurveTo(...a: number[]): void {
    nums("bezierCurveTo", a);
  }
  rect(...a: number[]): void {
    nums("rect", a);
  }
  /** A real canvas throws `IndexSizeError` on a negative corner radius, and
   * takes NaN nowhere — so this refuses both, like every other path call here. */
  arcTo(x1: number, y1: number, x2: number, y2: number, r: number): void {
    nums("arcTo", [x1, y1, x2, y2, r]);
    if (r < 0) fail("arcTo", `radius ${r} is negative`);
  }
  roundRect(x: number, y: number, w: number, h: number, r: number): void {
    nums("roundRect", [x, y, w, h, r]);
    if (r < 0) fail("roundRect", `radius ${r} is negative`);
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
    this.mark("arc", undefined, [x, y, r, from, to]);
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
    this.mark("fillRect", undefined, a);
  }
  strokeRect(...a: number[]): void {
    nums("strokeRect", a);
    this.calls++;
  }
  fillText(text: string, x: number, y: number): void {
    nums("fillText", [x, y]);
    if (/NaN|undefined/.test(text)) fail("fillText", `text reads "${text}"`);
    this.calls++;
    this.mark("fillText", undefined, [x, y]);
  }
  fill(): void {
    this.calls++;
    this.mark("fill");
  }
  stroke(): void {
    this.calls++;
    this.mark("stroke");
  }
  drawImage(_img: unknown, ...a: number[]): void {
    nums("drawImage", a);
    this.calls++;
    this.mark("drawImage", undefined, a);
  }

  createLinearGradient(...a: number[]): StubGradient {
    nums("createLinearGradient", a);
    this.mark("createLinearGradient", undefined, a);
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
    this.mark("createRadialGradient", undefined, [x0, y0, r0, x1, y1, r1]);
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

/**
 * A canvas element, enough of one for `new Canvas2DRenderer(canvas)`.
 *
 * `primary` (default `true`) is what makes `new Path2D(...)` — which has no
 * `this: StubContext` of its own to tally against — count against *this*
 * context's `tally`/`log` rather than whatever offscreen sprite canvas a
 * pass happened to bake last. Every caller in a test file wants the default;
 * `installCanvasGlobals`'s own `document.createElement` is the one caller
 * that has to say `false`, since it is standing in for exactly the kind of
 * throwaway canvas a primary frame should not be attributed to.
 */
export function stubCanvas(primary = true): { canvas: HTMLCanvasElement; ctx: StubContext } {
  const ctx = new StubContext();
  if (primary) activeTally = ctx.tally;
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
      return stubCanvas(false).canvas;
    },
  };
}
