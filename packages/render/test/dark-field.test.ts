import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import {
  createWorld,
  type SpawnEntry,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { darkView, drawDarkField, lightAt } from "../src/dark-field.js";
import { computeLayout } from "../src/layout.js";
import type { ViewState } from "../src/renderer.js";
import { seenView } from "../src/unseen.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  runFrames,
  stubCanvas,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE DARK, as a screen draws it**: no body where no light is, and a body
 * back where a finger lit its square (`dark-field.ts`, `sim/dark.ts`).
 */

const TPB = ticksPerBeat(CFG);

beforeAll(installCanvasGlobals);

const slick = (col: number): SpawnEntry => ({ beat: 0, col, kind: "slick", color: "red" });

function darkWorld(dark = true): World {
  const world = createWorld(CFG, 3);
  startWave(world, 0, [slick(0), slick(6)], [], null, false, 0, [
    ...(dark ? [{ kind: "dark" as const, at: 0, beats: 0 }] : []),
  ]);
  for (let t = 0; t < TPB * 4; t++) step(world, []);
  return world;
}

function view(world: World): ViewState {
  return { world, beatPhase: 0, role: "p2", time: 1, dt: 1 / 60, events: [], running: true };
}

/** A light on the square the body at `col` is standing on, stepped in. */
function lightOn(world: World, col: number): void {
  const body = world.creatures.find((c) => c.col === col);
  if (!body) throw new Error(`no body in column ${col}`);
  step(world, [{ tick: world.tick, player: 1, command: { kind: "light", col, row: body.row } }]);
}

describe("the bodies the dark keeps", () => {
  it("hands back the very frame while the dark is up", () => {
    const v = view(darkWorld(false));
    expect(darkView(v)).toBe(v);
  });

  it("draws no body above the ship while nothing is lit", () => {
    const world = darkWorld();
    expect(world.creatures.length).toBe(2);
    expect(seenView(view(world)).world.creatures).toEqual([]);
  });

  it("shows the body a finger lit, and not the one across the field", () => {
    const world = darkWorld();
    const lit = world.creatures.reduce((a, c) => (c.col < a.col ? c : a));
    lightOn(world, lit.col);
    const shown = seenView(view(world)).world.creatures;
    expect(shown.map((c) => c.id)).toEqual([lit.id]);
  });
});

describe("how lit a square is", () => {
  it("is whole on the lit square, nothing past the reach, and goes out at the end", () => {
    const world = darkWorld();
    const lit = [{ col: 3, row: 5, untilTick: world.tick + TPB * 2 }];
    expect(lightAt(world, lit, 3, 5)).toBe(1);
    expect(lightAt(world, lit, 3 + CFG.darkLitRadiusMilli / 1000, 5)).toBe(0);
    const near = lightAt(world, lit, 4, 5);
    expect(near).toBeGreaterThan(0);
    expect(near).toBeLessThan(1);
    const ending = [{ ...lit[0]!, untilTick: world.tick + 1 }];
    expect(lightAt(world, ending, 3, 5)).toBeLessThan(0.1);
  });
});

describe("a frame of it", () => {
  it("says LIGHTS OUT over the black, not under it", () => {
    // The lantern and its line are drawn among the bodies, so the cover put
    // them out too until the film's first frame showed it.
    const { ctx } = stubCanvas();
    ctx.texts = [];
    const l = computeLayout({ width: 390, height: 844, dpr: 1 }, CFG, "p1");
    drawDarkField(ctx as unknown as CanvasRenderingContext2D, l, view(darkWorld()));
    expect(ctx.texts.map((t) => t.text)).toContain("LIGHTS OUT");
  });

  for (const role of ROLES) {
    it(`draws on ${role}, lit and unlit`, () => {
      const run = runFrames(darkWorld(), role, TPB * 3, {
        onTick: (tick, w) => {
          const light =
            tick === TPB
              ? [
                  {
                    tick: w.tick,
                    player: 2 as const,
                    command: { kind: "light" as const, col: 4, row: 6 },
                  },
                ]
              : [];
          step(w, light);
        },
      });
      expect(run.ctx.calls).toBeGreaterThan(500);
    });
  }
});
