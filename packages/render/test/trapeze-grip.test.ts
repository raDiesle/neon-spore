import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue, controlSet } from "@neon-spore/content";
import {
  type Command,
  createWorld,
  DEFAULT_CONFIG,
  startWave,
  step,
  type TrapezeState,
  ticksPerBeat,
  trapezeOnMark,
  type World,
} from "@neon-spore/sim";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { type Field, type Hold, touchDown, touchUp } from "../src/touch.js";
import { trapezeDrawUnder, trapezeFreezeCircle, trapezeFreezeUnder } from "../src/trapeze-grip.js";
import { trapezeMarks } from "../src/trapeze-marks.js";
import { CFG, FRAME_TIMEOUT_MS, VIEWPORT, waveWith } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE TRAPEZE's two hands as controls (`trapeze-grip.ts`): the freeze ring and
 * the draw's track are pressed where `trapezeMarks` puts them, only by the
 * seat the lit step asks, and the draw's lift carries the swipe's side. The
 * rule is the simulation's (`sim/test/trapeze*.test.ts`); this file proves the
 * picture hands it a thumb — and, last, that the thumbs alone catch the flag.
 */

const layout = (role: ViewRole) => computeLayout(VIEWPORT, CFG, role);

/** THE TRAPEZE's wave, stepped to its first catch: player 1 freezes, player 2 draws, the mark left of the middle. */
function toLit(): { world: World; b: TrapezeState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("trapeze");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  const b = world.boss;
  if (b === null || b.kind !== "trapeze")
    throw new Error("the trapeze's wave installed no trapeze");
  let guard = 0;
  while (b.phase !== "lit" && guard++ < 60 * ticksPerBeat(CFG)) step(world, []);
  return { world, b };
}

function fieldOf(world: World, seat: 1 | 2): Field {
  return {
    creatures: world.creatures,
    cannonCol: 4,
    shieldCol: 4,
    beatPhase: 0.5,
    skinY: null,
    beat: world.beat,
    waveBeat: world.waveBeat,
    tick: world.tick,
    seat,
    cfg: DEFAULT_CONFIG,
    boss: world.boss,
    controls: controlSet("default"),
    faults: [],
    well: false,
  };
}

function marksOf(role: ViewRole, b: TrapezeState) {
  const l = layout(role);
  const lit = b.steps[b.cursor];
  if (lit === undefined) throw new Error("no lit step");
  return { l, ...trapezeMarks(l, CFG, lit) };
}

describe("the freeze ring", () => {
  it("is the freezer's, on the ring, and an edge's press", () => {
    const { world, b } = toLit();
    expect(b.steps[b.cursor]).toMatchObject({ ask: "catch", freezer: 1, offset: -1 });
    const { l, ring } = marksOf("p1", b);
    const touch = trapezeFreezeUnder(l, ring.x, ring.y, fieldOf(world, 1));
    expect(touch?.player).toBe(1);
    expect(touch?.command).toEqual({
      kind: "drag",
      target: "trapezeFreeze",
      on: true,
      fromMilli: 0,
    });
    expect(touchDown(l, ring.x, ring.y, fieldOf(world, 1))?.command).toMatchObject({
      target: "trapezeFreeze",
    });
  });

  it("is nobody's for the seat that draws, or a tile off the ring", () => {
    const { world, b } = toLit();
    const { l, ring } = marksOf("p2", b);
    expect(trapezeFreezeUnder(l, ring.x, ring.y, fieldOf(world, 2))).toBeNull();
    const p1 = layout("p1");
    const far = ring.r * 1.5 + p1.tile;
    expect(trapezeFreezeUnder(p1, ring.x, ring.y - far, fieldOf(world, 1))).toBeNull();
    expect(trapezeFreezeUnder(p1, ring.x, ring.y, { ...fieldOf(world, 1), boss: null })).toBeNull();
  });

  it("lets go on the lift, so a resting thumb can tap again", () => {
    const { world, b } = toLit();
    const { l, ring } = marksOf("p1", b);
    const hold = touchDown(l, ring.x, ring.y, fieldOf(world, 1))?.hold as Hold;
    expect(touchUp(l, hold, ring)?.command).toMatchObject({ target: "trapezeFreeze", on: false });
  });
});

describe("the draw's track", () => {
  it("is the other seat's, anywhere along it", () => {
    const { world, b } = toLit();
    const { l, from, to } = marksOf("p2", b);
    for (const at of [from, to, { x: (from.x + to.x) / 2, y: from.y }]) {
      expect(trapezeDrawUnder(l, at.x, at.y, fieldOf(world, 2))?.command).toEqual({
        kind: "drag",
        target: "trapezeDraw",
        on: true,
        fromMilli: 0,
      });
    }
    expect(trapezeDrawUnder(layout("p1"), from.x, from.y, fieldOf(world, 1))).toBeNull();
  });

  it("carries the swipe's side on the lift", () => {
    const { world, b } = toLit();
    const { l, from } = marksOf("p2", b);
    const down = () => touchDown(l, from.x, from.y, fieldOf(world, 2))?.hold as Hold;
    const left = touchUp(l, down(), { x: from.x - l.tile, y: from.y })?.command;
    const right = touchUp(l, down(), { x: from.x + l.tile, y: from.y })?.command;
    expect(left).toMatchObject({ target: "trapezeDraw", on: false });
    expect((left as { fromMilli: number }).fromMilli).toBeLessThan(0);
    expect((right as { fromMilli: number }).fromMilli).toBeGreaterThan(0);
  });
});

describe("two thumbs on the glass", () => {
  it("catch the flag: the pilot's tap stills it, the navigator's swipe lands", () => {
    const { world, b } = toLit();
    const send = (player: 1 | 2, command: Command) =>
      step(world, [{ tick: world.tick, player, command }]);
    let guard = 0;
    while (!trapezeOnMark(world, b) && guard++ < 20 * ticksPerBeat(CFG)) step(world, []);
    const p1 = layout("p1");
    const ring = trapezeFreezeCircle(p1, CFG, b);
    if (ring === null) throw new Error("no ring while a catch is lit");
    const tap = touchDown(p1, ring.x, ring.y, fieldOf(world, 1));
    send(1, tap?.command as Command);
    expect(b.frozenBeats).toBeGreaterThan(0);
    const { l, from } = marksOf("p2", b);
    const draw = touchDown(l, from.x, from.y, fieldOf(world, 2));
    send(2, draw?.command as Command);
    for (let i = 0; i < ticksPerBeat(CFG) * 1.5; i++) step(world, []);
    const lift = touchUp(l, draw?.hold as Hold, { x: from.x - l.tile, y: from.y });
    send(2, lift?.command as Command);
    expect(b.catches).toBe(1);
  });
});
