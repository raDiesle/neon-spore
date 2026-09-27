import { afterAll, describe, expect, spyOn, test } from "bun:test";
import { controlSet } from "@neon-spore/content";
import { computeLayout, type Viewport } from "@neon-spore/render";
import {
  type BossKind,
  beatPhase,
  type KeelState,
  keelLit,
  type OculusState,
  oculusLitStep,
  type SeamState,
  seamLitStep,
  step,
  type TrivetState,
  trivetLitStep,
  type ValveState,
  type ViseState,
  valveBracing,
  valveFrozen,
  valveHolding,
  valveJetting,
  valveTurning,
  valveWiping,
  viseLitStep,
  type World,
} from "@neon-spore/sim";
import { drawBoss } from "../../../packages/render/src/boss-draw.js";
import { Effects } from "../../../packages/render/src/effects.js";
import * as keelMarks from "../../../packages/render/src/keel-marks.js";
import * as oculusMarks from "../../../packages/render/src/oculus-marks.js";
import * as seamMarks from "../../../packages/render/src/seam-marks.js";
import * as trivetMarks from "../../../packages/render/src/trivet-marks.js";
import * as valveMarks from "../../../packages/render/src/valve-marks.js";
import * as viseMarks from "../../../packages/render/src/vise-marks.js";
import { installCanvasGlobals, stubCanvas } from "../../../packages/render/test/canvas-stub.js";
import { bossWorld } from "../src/poses-bosses-kit.js";
import { stageAutopilot } from "../src/stage-autopilot.js";
import { stageField } from "../src/stage-field.js";

/**
 * **No boss puts a mark up before its window opens** — the owner, 27
 * September 2026, on THE INSTAR and *e.g. in boss waves*: a ring, halo or
 * glyph that asks for a gesture is drawn only while that gesture would be
 * answered. THE INSTAR has its own test (`instar-marks-up.test.ts`); this is
 * the one every other boss gets a row in.
 *
 * AUTO plays both seats through the boss's wave, the boss is drawn every
 * few ticks, and every call the draw makes into the boss's `*-marks.ts` is
 * caught. A call that draws a mark lit — its own argument says so, or the
 * call is only ever a mark — must fall on a tick the **simulation** says
 * that mark's window is open, by the boss's own predicate in `sim/`, never
 * the render's gate re-read. Every mark must also be seen lit at least once,
 * or the row proves nothing.
 *
 * A window is the gesture being answered, not THE SLOW: THE VALVE's turn and
 * THE KEEL's third movement are at tempo on purpose, and their marks are up
 * through them. **THE QUEEN has no row and must not get one**: her faint
 * rings from the announcement onward are her mechanic — P1 is shown both
 * marks (`docs/spec/controls.md`).
 *
 * The bosses still to read are in `docs/queue.md`.
 */

const VIEWPORT: Viewport = { width: 900, height: 1600, dpr: 2 };
const EVERY = 1;
const TICKS = 40_000;

/** One marks function: whether a call draws it lit, and the window it may be lit in. */
interface Mark {
  name: string;
  calls: () => readonly unknown[][];
  lit: (args: readonly unknown[]) => boolean;
  open: (world: World) => boolean;
}

const spies: { mockRestore: () => void }[] = [];
afterAll(() => {
  for (const s of spies) s.mockRestore();
});

function mark<T extends object, K extends keyof T & string>(
  ns: T,
  name: K,
  open: (world: World) => boolean,
  lit: (args: readonly unknown[]) => boolean = () => true,
): () => Mark {
  return () => {
    // biome-ignore lint/suspicious/noExplicitAny: a namespace's export, spied by name
    const spy = spyOn(ns as any, name);
    spies.push(spy);
    return { name, calls: () => spy.mock.calls as unknown[][], lit, open };
  };
}

const oculus = (w: World) => w.boss as OculusState;
const vise = (w: World) => w.boss as ViseState;
const trivet = (w: World) => w.boss as TrivetState;
const keel = (w: World) => w.boss as KeelState;
const valve = (w: World) => w.boss as ValveState;
const seam = (w: World) => w.boss as SeamState;

const ROWS: readonly { kind: BossKind; marks: (() => Mark)[] }[] = [
  {
    kind: "oculus",
    marks: [
      mark(oculusMarks, "drawOculusLitPair", (w) => oculusLitStep(oculus(w)) !== null),
      mark(
        oculusMarks,
        "drawOculusCore",
        (w) => oculusLitStep(oculus(w)) !== null,
        (a) => a[4] !== null,
      ),
    ],
  },
  {
    kind: "vise",
    marks: [
      mark(viseMarks, "drawViseLitSeam", (w) => viseLitStep(vise(w)) !== null),
      mark(
        viseMarks,
        "drawViseKernel",
        (w) => viseLitStep(vise(w)) !== null,
        (a) => a[5] !== null,
      ),
    ],
  },
  {
    kind: "trivet",
    marks: [
      mark(
        trivetMarks,
        "drawTrivetSockets",
        (w) => trivetLitStep(trivet(w)) !== null,
        (a) => (a[4] as number) > 0,
      ),
      mark(
        trivetMarks,
        "drawTrivetFace",
        (w) => trivetLitStep(trivet(w)) !== null,
        (a) => a[5] !== null,
      ),
    ],
  },
  {
    kind: "keel",
    marks: [
      mark(keelMarks, "drawKeelRing", (w) => keelLit(keel(w))),
      mark(keelMarks, "drawKeelSocket", (w) => keel(w).phase === "socket"),
    ],
  },
  {
    kind: "valve",
    marks: [
      mark(valveMarks, "drawValveMark", (w) => valveTurning(valve(w)) || valveFrozen(valve(w))),
      mark(
        valveMarks,
        "drawValveSocket",
        (w) => {
          const s = valve(w);
          return (
            valveHolding(s) ||
            valveFrozen(s) ||
            valveJetting(s) ||
            valveBracing(s) ||
            valveWiping(s)
          );
        },
        (a) => (a[4] as number) > 0,
      ),
    ],
  },
  {
    kind: "seam",
    marks: [
      mark(seamMarks, "drawSeamPoint", (w) => seamLitStep(seam(w)) !== null),
      mark(seamMarks, "drawSeamGrit", (w) => seamLitStep(seam(w)) !== null),
      mark(seamMarks, "drawSeamRock", (w) => seamLitStep(seam(w)) !== null),
    ],
  },
];

/** AUTO through the wave: every lit call outside its window, and how often each mark was lit. */
function walk(kind: BossKind, marks: Mark[]): { wrong: string[]; seen: Map<string, number> } {
  installCanvasGlobals();
  const world = bossWorld(kind);
  const cfg = world.cfg;
  const l = computeLayout(VIEWPORT, cfg, "test");
  const field = (seat: 1 | 2) => stageField(world, "test", controlSet("default"), cfg, seat, null);
  const auto = stageAutopilot({ layout: () => l, field });
  auto.setMode("both");
  const effects = new Effects();
  const { ctx } = stubCanvas();
  const c = ctx as unknown as CanvasRenderingContext2D;
  const wrong: string[] = [];
  const seen = new Map(marks.map((m) => [m.name, 0]));
  for (let i = 0; i < TICKS && world.boss?.kind === kind; i++) {
    step(world, auto.commands(world));
    if (i % EVERY !== 0) continue;
    const before = marks.map((m) => m.calls().length);
    const view = { world, beatPhase: beatPhase(cfg, world.tick), role: "test" as const };
    drawBoss(
      c,
      l,
      { ...view, time: i / cfg.tickHz, dt: EVERY / cfg.tickHz, events: [], running: true },
      effects,
    );
    marks.forEach((m, k) => {
      const lit = m.calls().slice(before[k]).filter(m.lit).length;
      if (lit === 0) return;
      seen.set(m.name, (seen.get(m.name) ?? 0) + lit);
      if (!m.open(world)) wrong.push(`${m.name} at tick ${world.tick}, phase ${phaseName(world)}`);
    });
  }
  return { wrong, seen };
}

function phaseName(world: World): string {
  const b = world.boss as { phase?: unknown } | null;
  return String(b?.phase ?? "none");
}

describe("no boss puts a mark up before its window opens", () => {
  test.each(ROWS.map((r) => [r.kind, r] as const))("%s", (_, row) => {
    const { wrong, seen } = walk(
      row.kind,
      row.marks.map((m) => m()),
    );
    expect(wrong.slice(0, 5)).toEqual([]);
    for (const [name, n] of seen) expect(n, `${name} was never drawn lit`).toBeGreaterThan(0);
  });
});
