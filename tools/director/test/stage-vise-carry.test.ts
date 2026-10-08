import { afterAll, beforeAll, expect, it } from "bun:test";
import { buildBoss, buildQueue, controlSet, WAVES } from "@neon-spore/content";
import { computeLayout, type Field, touchDown } from "@neon-spore/render";
import {
  type Command,
  createWorld,
  DEFAULT_CONFIG,
  startWave,
  step,
  ticksPerBeat,
  viseBoss,
  type World,
} from "@neon-spore/sim";
import { bindStageTouch } from "../src/stage-touch.js";

/**
 * **One pointer on THE VISE's lobe, on the stage.** The case was a pinch,
 * two fingers paired by the host, until the owner ruled one finger a player on
 * 8 October 2026; now a press takes the lobe and a carry shuts it
 * (`render/vise-grip.ts`, `render/vise-carry.ts`). The stage answers a
 * pointer the way the field does, so a mouse plays it from the director.
 *
 * The press goes on the canvas and the lift on the window, so a stub window
 * forwards to the stub canvas's listeners — `stage-touch.test.ts`'s pattern.
 */

type Listener = (e: unknown) => void;
let on = new Map<string, Listener[]>();
let hadWindow: unknown;
const add = (type: string, fn: Listener): void => {
  on.set(type, [...(on.get(type) ?? []), fn]);
};
const fire = (type: string, e: unknown): void => {
  for (const fn of on.get(type) ?? []) fn(e);
};

beforeAll(() => {
  const g = globalThis as { window?: unknown };
  hadWindow = g.window;
  g.window = { addEventListener: add };
});

afterAll(() => {
  const g = globalThis as { window?: unknown };
  if (hadWindow === undefined) delete g.window;
  else g.window = hadWindow;
});

const CFG = DEFAULT_CONFIG;
const VIEWPORT = { width: 420, height: 900, dpr: 2 };
const layout = computeLayout(VIEWPORT, CFG, "p1");

/** THE VISE's wave, the case stood and its first step lit — `vise-grip.test.ts`'s world. */
function lit(): World {
  const world = createWorld(CFG, 5);
  const index = WAVES.findIndex((w) => w.boss?.kind === "vise");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < ticksPerBeat(CFG) * 4; i++) step(world, []);
  const s = viseBoss(world);
  if (s === null) throw new Error("the vise wave stood no case");
  s.phase = "lit";
  s.phaseBeat = world.beat;
  s.cursor = 0;
  return world;
}

function fieldOf(world: World): Field {
  return {
    creatures: world.creatures,
    cannonCol: world.cannonCol,
    shieldCol: world.shieldCol,
    beatPhase: 0,
    skinY: null,
    beat: world.beat,
    waveBeat: world.waveBeat,
    tick: world.tick,
    seat: 1,
    cfg: CFG,
    boss: world.boss,
    controls: controlSet("default"),
    faults: [],
    well: false,
  };
}

/** Every point on a coarse grid where a press takes hold of the pilot's lobe. */
function onLobe(field: Field): { x: number; y: number }[] {
  const hits: { x: number; y: number }[] = [];
  for (let y = 0; y < VIEWPORT.height; y += 6) {
    for (let x = 0; x < VIEWPORT.width; x += 6) {
      const t = touchDown(layout, x, y, field);
      if (t?.hold?.kind === "drag" && t.hold.target === "viseLobeLeft") hits.push({ x, y });
    }
  }
  return hits;
}

it("carries the pilot's lobe shut with one pointer, and lets it open on the lift", () => {
  const world = lit();
  const field = fieldOf(world);
  on = new Map();
  const sent: { player: 1 | 2; command: Command }[] = [];
  bindStageTouch({
    canvas: { addEventListener: add } as unknown as HTMLCanvasElement,
    at: (e) => ({ x: e.clientX, y: e.clientY }),
    layout: () => layout,
    field: () => field,
    seats: () => [1],
    push: (player, command) => sent.push({ player, command }),
    world: () => world,
    role: () => "p1",
    replay: () => {},
  });

  const lobe = onLobe(field);
  expect(lobe.length, "no press found the pilot's lobe").toBeGreaterThan(1);
  const a = lobe[0];
  if (!a) throw new Error("unreachable");
  const pointer = (pointerId: number, p: { x: number; y: number }) => ({
    pointerId,
    clientX: p.x,
    clientY: p.y,
    preventDefault: () => {},
  });

  fire("pointerdown", pointer(1, a));
  expect(sent, "a press not yet carried has shut nothing").toEqual([]);

  // A tile of carry is a tile off the open gap; the whole of it is shut.
  fire("pointermove", pointer(1, { x: a.x + layout.tile, y: a.y }));
  const part = sent.at(-1)?.command;
  if (part?.kind !== "drag") throw new Error("the move sent no drag");
  expect(part.target).toBe("viseLobeLeft");
  expect(part.on).toBe(true);
  expect(part.fromMilli).toBe(CFG.viseOpenMilli - 1000);
  const far = { x: a.x + (layout.tile * CFG.viseOpenMilli) / 1000, y: a.y };
  fire("pointermove", pointer(1, far));
  const shut = sent.at(-1)?.command;
  expect(shut?.kind === "drag" && shut.fromMilli).toBe(0);

  fire("pointerup", pointer(1, far));
  const off = sent.at(-1)?.command;
  expect(off?.kind === "drag" && off.on).toBe(false);
});
