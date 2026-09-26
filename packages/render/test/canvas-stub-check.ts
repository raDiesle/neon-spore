/**
 * **What the stub canvas refuses, and the path it builds.** Every argument a
 * frame hands the canvas is checked here — a colour the browser cannot parse,
 * a coordinate that came out NaN, a negative radius — and `StubPath`, which is
 * nothing but those checks and the log, sits beside them.
 *
 * Cut out of `canvas-stub.ts` on 26 September 2026, when that file was 692
 * lines. The module-level log and tally pointers live here because `StubPath`
 * has no `this: StubContext` to hang them off; the context claims them through
 * `setActiveLog` and `setActiveTally`.
 */

const COLOR = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$|^rgba?\([^)]+\)$/i;

class StubFail extends Error {}

export function fail(where: string, detail: string): never {
  throw new StubFail(`${where}: ${detail}`);
}

/** Shared by every counted call site, including StubPath's constructor,
 * which has no `this: StubContext` to hang a method off of. */
let activeTally: Map<string, number> | undefined;
let activeLog: string[] | undefined;

/** Which context `new Path2D` counts against — `stubCanvas`'s to decide. */
export function setActiveTally(v: Map<string, number> | undefined): void {
  activeTally = v;
}

/** Which log a path's builders write to — the context's `log` setter's. */
export function setActiveLog(v: string[] | undefined): void {
  activeLog = v;
}

export function round(v: unknown): unknown {
  return typeof v === "number" ? Math.round(v * 1000) / 1000 : v;
}

function hit(name: string, args?: unknown[]): void {
  if (activeTally) activeTally.set(name, (activeTally.get(name) ?? 0) + 1);
  if (activeLog) {
    const rendered = args ? args.map(round).join(", ") : "";
    activeLog.push(args ? `${name}(${rendered})` : name);
  }
}

/**
 * A path builder: every coordinate checked, and the call written into the
 * ordered log.
 *
 * **The shape a path is made of is part of the picture**, and it used to be
 * the one part the log left out — `StubPath`'s builders went through `nums`
 * for validation and never through `hit`, so only `new Path2D` appeared and
 * that is a count rather than a shape. `.claude/skills/render-perf` names an
 * ordered diff of the log as the proof that a speed change draws the same
 * thing, and the savings left in this renderer are mostly of the shape *move
 * work out of `fillRect` and into a path* — invisible to that diff on the
 * side that matters. THE FLEET's crossings became exactly that and had to be
 * held with an arithmetic invariant instead.
 *
 * Logged and not tallied: `new Path2D` is the count that a budget is written
 * against, and a row per builder would be a hundred and thirty of them for
 * one lattice.
 */
function drew(where: string, values: number[]): void {
  nums(where, values);
  if (activeLog) activeLog.push(`${where}(${values.map(round).join(", ")})`);
}

/** Every coordinate that reaches the canvas has to be a real number. */
export function nums(where: string, values: number[]): void {
  for (const v of values) {
    if (typeof v !== "number" || !Number.isFinite(v)) fail(where, `${v} is not a finite number`);
  }
}

/**
 * The corner radii of a `roundRect`, checked the way a real canvas checks
 * them and returned as the list to log.
 *
 * `CanvasRenderingContext2D.roundRect` takes **either one radius or a list of
 * up to four**, one per corner clockwise from the top-left, and every browser
 * the game runs in honours the list. This stub took the number only, so a
 * shape that is round at the top and near-square at the foot could not be
 * drawn by anything held here — which is every candidate and every frame test
 * — and `tools/versus/candidates/guide-chrome/tide/plate.ts` wrote its crest
 * with one radius and a comment saying why. 16 September 2026.
 *
 * A real one throws `RangeError` on an empty list or a fifth entry and
 * `IndexSizeError` on a negative one, so this refuses all three: a stub that
 * takes a call the browser will not take is a test that passes on a frame
 * nobody can draw.
 */
export function radii(where: string, r: number | number[]): number[] {
  const list = Array.isArray(r) ? r : [r];
  if (list.length < 1 || list.length > 4)
    fail(where, `${list.length} radii — a corner list is one to four`);
  nums(where, list);
  for (const v of list) if (v < 0) fail(where, `radius ${v} is negative`);
  return list;
}

export function color(where: string, value: unknown): void {
  if (value instanceof StubGradient || value instanceof StubPattern) return;
  if (typeof value !== "string" || !COLOR.test(value))
    fail(where, `${String(value)} is not a colour`);
}

export class StubGradient {
  addColorStop(offset: number, value: string): void {
    nums("addColorStop", [offset]);
    if (offset < 0 || offset > 1) fail("addColorStop", `offset ${offset} is outside 0..1`);
    color("addColorStop", value);
  }
}

export class StubPattern {}

/** A path is a string of numbers; one NaN in it and the shape silently vanishes. */
export class StubPath {
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
    drew("Path2D.rect", [x, y, w, h]);
  }
  moveTo(x: number, y: number): void {
    drew("Path2D.moveTo", [x, y]);
  }
  lineTo(x: number, y: number): void {
    drew("Path2D.lineTo", [x, y]);
  }
  quadraticCurveTo(...a: number[]): void {
    drew("Path2D.quadraticCurveTo", a);
  }
  bezierCurveTo(...a: number[]): void {
    drew("Path2D.bezierCurveTo", a);
  }
  closePath(): void {
    if (activeLog) activeLog.push("Path2D.closePath");
  }
  arc(x: number, y: number, r: number, from: number, to: number): void {
    drew("Path2D.arc", [x, y, r, from, to]);
    if (r < 0) fail("Path2D.arc", `radius ${r} is negative`);
  }
  /** A rounded rectangle in one call — THE MAGNET's plate, and the only
   * builder in this file that was missing until a frame actually reached it.
   * One radius or a corner list, refused the way a real one refuses them
   * (`radii`). */
  roundRect(x: number, y: number, w: number, h: number, r: number | number[]): void {
    drew("Path2D.roundRect", [x, y, w, h, ...radii("Path2D.roundRect", r)]);
  }
  /** The rounded corner every plate in the intro is cut with. A real one
   * refuses a negative radius the same way `arc` does. */
  arcTo(x1: number, y1: number, x2: number, y2: number, r: number): void {
    drew("Path2D.arcTo", [x1, y1, x2, y2, r]);
    if (r < 0) fail("Path2D.arcTo", `radius ${r} is negative`);
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
    drew("Path2D.ellipse", [x, y, rx, ry, rotation, from, to]);
    if (rx < 0 || ry < 0) fail("Path2D.ellipse", `radius ${rx < 0 ? rx : ry} is negative`);
  }
  /** One path folded into another, which is how a hole is cut: a crust drawn
   * as a shell with a disc added to it and filled `evenodd` (`carom.ts`). A
   * real one takes a `Path2D`; anything else is a `TypeError` there and has to
   * be one here, or the mistake is a silent no-op and the hole never appears. */
  addPath(path: StubPath): void {
    if (!(path instanceof StubPath)) fail("Path2D.addPath", `${String(path)} is not a Path2D`);
    if (activeLog) activeLog.push("Path2D.addPath");
  }
}

export class StubImageData {
  data: Uint8ClampedArray;
  constructor(
    readonly width: number,
    readonly height: number,
  ) {
    this.data = new Uint8ClampedArray(width * height * 4);
  }
}
