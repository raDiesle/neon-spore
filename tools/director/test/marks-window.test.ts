import { afterAll, describe, expect, test } from "bun:test";
import { controlSet } from "@neon-spore/content";
import { computeLayout, type Viewport } from "@neon-spore/render";
import { type BossKind, beatPhase, roundSpent, step, type World } from "@neon-spore/sim";
import { drawBoss } from "../../../packages/render/src/boss-draw.js";
import { Effects } from "../../../packages/render/src/effects.js";
import { drawRound } from "../../../packages/render/src/round-draw.js";
import { installCanvasGlobals, stubCanvas } from "../../../packages/render/test/canvas-stub.js";
import { bossWorld } from "../src/poses-bosses-kit.js";
import { stageAutopilot } from "../src/stage-autopilot.js";
import { stageField } from "../src/stage-field.js";
import { type Mark, spies } from "./marks-window-kit.js";
import { ROWS_A } from "./marks-window-rows-a.js";
import { ROWS_B } from "./marks-window-rows-b.js";
import { ROWS_C } from "./marks-window-rows-c.js";
import { ROWS_D } from "./marks-window-rows-d.js";
import { ROWS_E } from "./marks-window-rows-e.js";
import { ROWS_F } from "./marks-window-rows-f.js";

/**
 * **No boss puts a mark up before its window opens** — the owner, 27
 * September 2026, on THE INSTAR and *e.g. in boss waves*: a ring, halo or
 * glyph that asks for a gesture is drawn only while that gesture would be
 * answered. THE INSTAR has its own test (`instar-marks-up.test.ts`); this is
 * the one every other boss gets a row in.
 *
 * AUTO plays both seats through the boss's wave, the boss is drawn every
 * few ticks — a round by `drawRound`, as the game draws it — and every call the draw makes into the boss's `*-marks.ts` is
 * caught. A call that draws a mark lit — its own argument says so, or the
 * call is only ever a mark — must fall on a tick the **simulation** says
 * that mark's window is open, by the boss's own predicate in `sim/`, never
 * the render's gate re-read. Every mark must also be seen lit at least once,
 * or the row proves nothing — unless AUTO has no hand to take the boss that
 * far, and the row says so (`unreached`, with the queue entry that ends it).
 *
 * A window is the gesture being answered, not THE SLOW: THE VALVE's turn and
 * THE KEEL's third movement are at tempo on purpose, and their marks are up
 * through them. **THE QUEEN has no row and must not get one**: her faint
 * rings from the announcement onward are her mechanic — P1 is shown both
 * marks (`docs/spec/controls.md`).
 *
 * A boss has a row in `marks-window-rows-a.ts` to `-f.ts`, or a line
 * in `marks-window-no-row.ts` saying why it has none — THE QUEEN never, a boss
 * with a test of its own, one with no `*-marks.ts` to spy on, and the rows
 * still owed. `marks-window-coverage.test.ts` holds every boss to one or the
 * other, so a boss added later goes red until it has either, and a row written
 * strikes its line.
 */

const VIEWPORT: Viewport = { width: 900, height: 1600, dpr: 2 };
const EVERY = 1;
const TICKS = 40_000;

afterAll(() => {
  for (const s of spies) s.mockRestore();
});

const ROWS = [...ROWS_A, ...ROWS_B, ...ROWS_C, ...ROWS_D, ...ROWS_E, ...ROWS_F];

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
  // A round that has run its course stays installed, spent, until the next
  // wave replaces it (`wave-end.ts`), and nothing in it asks again.
  for (let i = 0; i < TICKS && world.boss?.kind === kind && !roundSpent(world); i++) {
    step(world, auto.commands(world));
    if (i % EVERY !== 0) continue;
    const before = marks.map((m) => m.calls().length);
    const view = { world, beatPhase: beatPhase(cfg, world.tick), role: "test" as const };
    const state = {
      ...view,
      time: i / cfg.tickHz,
      dt: EVERY / cfg.tickHz,
      events: [],
      running: true,
    };
    // A round replaces the field and is never drawn by `drawBoss` at all
    // (`round-draw.ts`), so its marks are only reached the game's own way.
    if (!drawRound(c, l, state, effects)) drawBoss(c, l, state, effects);
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
    const marks = row.marks.map((m) => m());
    const { wrong, seen } = walk(row.kind, marks);
    expect(wrong.slice(0, 5)).toEqual([]);
    for (const m of marks) {
      if (m.unreached !== undefined) continue;
      expect(seen.get(m.name) ?? 0, `${m.name} was never drawn lit`).toBeGreaterThan(0);
    }
  });
});
