import { color, fail, nums, round, setActiveLog } from "./canvas-stub-check.js";

/**
 * **What a stub context holds between calls**: its styles, its tally and log,
 * its dash, and the transform with the stack `save` and `restore` walk — the
 * state a draw call reads, and none of the draw calls.
 *
 * Cut out of `canvas-stub.ts` on 26 September 2026, when that file was 692
 * lines, as the base of a chain: `StubText` (`canvas-stub-text.ts`) records
 * where words land on top of it, and `StubContext` draws on top of that.
 */
export class StubState {
  /** The element this context belongs to, as a real one has: a surface that
   * clears itself reads its own device size off it (`surface-clear.ts`).
   * `stubCanvas` fills it in; a bare `new StubContext()` gets a zero-sized
   * stand-in rather than `undefined`. */
  canvas: HTMLCanvasElement = { width: 0, height: 0 } as HTMLCanvasElement;
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
  /** Optional ordered log of every call the picture is made of — the counted
   * ones and the path builders that are not counted — compact enough to diff
   * two frames by eye. Unset by default; assign an array to start recording. */
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
    setActiveLog(v);
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
  protected mark(name: string, value?: unknown, args?: unknown[]): void {
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

  /**
   * The context's own transform, so a text box is where the word lands.
   *
   * `texts` promises that two boxes which overlap here overlap on the phone,
   * and until 16 September 2026 that was only true of words drawn with no
   * transform on the context: a `fillText` was recorded at the coordinates it
   * was handed. A guide draws its page inside a translate (`guide-film.ts`)
   * and a count-in inside another (`simon-fx.ts`), so their boxes landed
   * hundreds of pixels from where the eye sees them — which read as words in
   * places nothing is, and hid words in places something is.
   *
   * Six numbers in canvas order. A rotation is carried on the corner and not
   * on the box, which stays axis-aligned at the scaled size: nothing in
   * `render/` writes rotated type, and a box that lied about its angle would
   * be a second wrong answer rather than the same one.
   */
  protected m: [number, number, number, number, number, number] = [1, 0, 0, 1, 0, 0];
  private mStack: [number, number, number, number, number, number][] = [];
  /** The alpha and the compositing a `save` holds, as a real context does: a
   * fade set inside a `save` that outlived its `restore` here once made a glow
   * look as if it arrived faded when a browser would have handed it 1. */
  private aStack: [number, string][] = [];

  private mul(n: readonly number[]): void {
    const [a, b, c, d, e, f] = this.m;
    const [A, B, C, D, E, F] = n as [number, number, number, number, number, number];
    this.m = [
      a * A + c * B,
      b * A + d * B,
      a * C + c * D,
      b * C + d * D,
      a * E + c * F + e,
      b * E + d * F + f,
    ];
  }

  /** A point through the current transform. */
  protected at(x: number, y: number): { x: number; y: number } {
    const [a, b, c, d, e, f] = this.m;
    return { x: a * x + c * y + e, y: b * x + d * y + f };
  }

  save(): void {
    this.mark("save");
    this.mStack.push([...this.m]);
    this.aStack.push([this._globalAlpha, this._globalCompositeOperation]);
  }
  restore(): void {
    this.mark("restore");
    const was = this.mStack.pop();
    if (was) this.m = was;
    const paint = this.aStack.pop();
    if (paint) [this._globalAlpha, this._globalCompositeOperation] = paint;
  }
  translate(...a: number[]): void {
    nums("translate", a);
    this.mul([1, 0, 0, 1, a[0] as number, a[1] as number]);
  }
  scale(...a: number[]): void {
    nums("scale", a);
    this.mul([a[0] as number, 0, 0, a[1] as number, 0, 0]);
  }
  rotate(...a: number[]): void {
    nums("rotate", a);
    const r = a[0] as number;
    this.mul([Math.cos(r), Math.sin(r), -Math.sin(r), Math.cos(r), 0, 0]);
  }
  /** The general one, which a shear has to go through: a flung gum leans
   * into its flight (`gum.ts`), and nothing else in render/ reaches for it. */
  transform(...a: number[]): void {
    nums("transform", a);
    this.mul(a);
  }
  /** The transform as a real context hands it back: a pass that works on the
   * frame's own pixels has to know where a point landed on them
   * (`tools/versus/candidates/slow-pull/lens.ts`). */
  getTransform(): { a: number; b: number; c: number; d: number; e: number; f: number } {
    const [a, b, c, d, e, f] = this.m;
    return { a, b, c, d, e, f };
  }
  /** Logged as well as checked, unlike `translate`/`scale`/`rotate`: a
   * surface that wipes itself has to put the identity on first, and the log
   * is the only place a test can see that it did (`surface-clear.test.ts`). */
  setTransform(...a: number[]): void {
    nums("setTransform", a);
    this.m =
      a.length >= 6
        ? [
            a[0] as number,
            a[1] as number,
            a[2] as number,
            a[3] as number,
            a[4] as number,
            a[5] as number,
          ]
        : [1, 0, 0, 1, 0, 0];
    this.mark("setTransform", undefined, a);
  }
}
