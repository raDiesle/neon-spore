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
 * **Two fingers on THE VISE's lobe, on the stage.** A press on a pinch body
 * takes hold and says nothing, and the gap is sent only by the host that pairs
 * two pointers. The game's field did; the stage answered each pointer alone,
 * so two fingers on a lobe sent nothing and the case could not be played from
 * the director. Both hosts now keep the same `Fingers` (`render/fingers.ts`).
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

it("pairs two pointers on the pilot's lobe and sends the gap between them", () => {
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
  const b = lobe[lobe.length - 1];
  if (!a || !b) throw new Error("unreachable");
  const pointer = (pointerId: number, p: { x: number; y: number }) => ({
    pointerId,
    clientX: p.x,
    clientY: p.y,
    preventDefault: () => {},
  });

  fire("pointerdown", pointer(1, a));
  expect(sent, "a finger alone is not a pinch").toEqual([]);
  fire("pointerdown", pointer(2, b));
  const gap = sent.at(-1)?.command;
  expect(gap?.kind).toBe("drag");
  if (gap?.kind !== "drag") return;
  expect(gap.target).toBe("viseLobeLeft");
  expect(gap.on).toBe(true);
  expect(typeof gap.fromMilli).toBe("number");

  // Closer together is a smaller gap, sent on the move.
  const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  fire("pointermove", pointer(2, mid));
  const closer = sent.at(-1)?.command;
  if (closer?.kind !== "drag") throw new Error("the move sent no drag");
  expect(closer.fromMilli ?? 0).toBeLessThan(gap.fromMilli ?? 0);

  // Either finger lifting lets the lobe go.
  fire("pointerup", pointer(1, a));
  const off = sent.at(-1)?.command;
  expect(off?.kind === "drag" && off.on).toBe(false);
});
