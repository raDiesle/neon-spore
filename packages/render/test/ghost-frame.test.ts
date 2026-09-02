import { beforeAll, describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  ghostIsCharging,
  ghostLaps,
  type SimEvent,
  type SpawnEntry,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { Canvas2DRenderer } from "../src/canvas2d.js";
import { showsGhostBody } from "../src/ghost.js";
import { slabs } from "../src/ghost-glitch.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

/**
 * THE GHOST, drawn — through the same canvas that refuses what a real one
 * refuses (`frame.test.ts`), which is the only coverage render/ has.
 *
 * Nothing here can answer whether the camouflage *reads*, or whether the band
 * across player 1's row says "it is on this line and you have this long". Those
 * need an eye. What a test can hold is the part that is a rule rather than a
 * look, and for this creature the rule is the whole creature: **the body is
 * drawn on exactly one of the two screens**, and a frame that leaked it would
 * leak it silently, on the one device the whole design depends on it not
 * reaching.
 *
 * So the three things below are: it paints at all in every seat, the seats get
 * *different* frames, and the one exception — a body that has given up hiding
 * and is coming down at the ship — is drawn on both.
 */

const CFG = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const ROLES: ViewRole[] = ["p1", "p2", "test"];

beforeAll(installCanvasGlobals);

const falling = (col: number): SpawnEntry => ({ beat: 0, col, kind: "ghost", color: "cyan" });
const crossing = (col: number): SpawnEntry => ({ ...falling(col), path: "across" });

interface Painted {
  world: World;
  calls: number;
  /** Every canvas call in order, so two seats can be compared as pictures. */
  log: string[];
}

function paint(
  queue: SpawnEntry[],
  ticks: number,
  role: ViewRole,
  inputs: TimedCommand[] = [],
): Painted {
  const world = createWorld(CFG, 1, queue);
  const byTick = new Map<number, TimedCommand[]>();
  for (const i of inputs) byTick.set(i.tick, [...(byTick.get(i.tick) ?? []), i]);
  const { canvas, ctx } = stubCanvas();
  const renderer = new Canvas2DRenderer(canvas);
  renderer.resize({ width: 900, height: 1600, dpr: 2 });
  const log: string[] = [];
  ctx.log = log;

  let events: SimEvent[] = [];
  for (let tick = 0; tick < ticks; tick++) {
    step(world, byTick.get(tick) ?? []);
    if (world.events.length) events.push(...world.events);
    if (tick % 4 !== 0) continue;
    renderer.draw({
      world,
      beatPhase: (world.tick % TPB) / TPB,
      role,
      time: tick / CFG.tickHz,
      dt: 4 / CFG.tickHz,
      events,
      running: true,
    });
    events = [];
  }
  return { world, calls: ctx.calls, log };
}

/** Aim at `col`, then fire cyan a beat later — enough for the input delay and
 * the cannon's own slide to have landed. */
const shoot = (col: number): TimedCommand[] => [
  { tick: 1, player: 1, command: { kind: "cannonCol", col } },
  { tick: TPB, player: 2, command: { kind: "fire", color: "cyan" } },
];

describe("a ghost on the field", () => {
  for (const role of ROLES) {
    it(`paints the body, or the band that stands in for it, for ${role}`, () => {
      expect(paint([falling(5)], TPB * 5, role).calls).toBeGreaterThan(0);
    });
  }

  it("draws two different pictures for the two seats", () => {
    // Not "player 1's is shorter" — the band is drawn on that screen and the
    // body is not, so both frames have work in them. What has to be true is
    // that they are not the *same* frame, which is the whole creature.
    const one = paint([falling(5)], TPB * 5, "p1").log.join("\n");
    const two = paint([falling(5)], TPB * 5, "p2").log.join("\n");
    expect(one).not.toBe(two);
  });

  it("gives player 1 no picture of the body at all", () => {
    // The gate itself, asked directly. A halo, a glow pass and a rim all reach
    // outside the contour they belong to, so "drawn faintly" would be the
    // column given away in light — the answer has to be *not at all*.
    const world = paint([falling(5)], TPB * 3, "p1").world;
    const body = world.creatures[0];
    expect(body).toBeDefined();
    const layout = (role: ViewRole) =>
      computeLayout({ width: 900, height: 1600, dpr: 2 }, CFG, role);
    if (!body) return;
    expect(showsGhostBody(layout("p1"), CFG, body)).toBe(false);
    expect(showsGhostBody(layout("p2"), CFG, body)).toBe(true);
    // The rig is both halves at once on one screen, so it sees everything —
    // a rig that hid half the picture would be no rig.
    expect(showsGhostBody(layout("test"), CFG, body)).toBe(true);
  });
});

describe("a ghost that crosses", () => {
  /** Beats one crossing takes, derived rather than typed — the stride and the
   * field's width are both config, and a hand-typed budget would wait in the
   * wrong place the first time either moved. */
  const CROSS_BEATS = Math.ceil((CFG.cols - 1) / CFG.ghostCrossCols) + 1;
  const spent = TPB * (CFG.ghostCrossRow + CROSS_BEATS * (CFG.ghostChargeLaps + 1) + CFG.rows + 4);

  for (const role of ROLES) {
    it(`paints the prowl, the turns and the dive for ${role}`, () => {
      expect(paint([crossing(1)], spent, role).calls).toBeGreaterThan(0);
    });
  }

  it("really did spend its temper, or the frames proved nothing", () => {
    // Every one of those frames could have been an empty field. The run has to
    // have got as far as the charge for the angry end of the picture — the
    // widest glow, the most shards, the narrowest eyes — to have been drawn.
    const world = createWorld(CFG, 1, [crossing(1)]);
    let charged = false;
    for (let tick = 0; tick < spent; tick++) {
      step(world, []);
      charged ||= world.events.some((e) => e.type === "ghostCharge");
    }
    expect(charged).toBe(true);
  });

  it("stops hiding from player 1 once it is coming down at the ship", () => {
    const world = createWorld(CFG, 1, [crossing(1)]);
    const layout = computeLayout({ width: 900, height: 1600, dpr: 2 }, CFG, "p1");
    let hiddenWhileProwling = true;
    let shownWhileCharging = false;
    for (let tick = 0; tick < spent; tick++) {
      step(world, []);
      const body = world.creatures.find((c) => c.kind === "ghost");
      if (!body) continue;
      if (ghostIsCharging(CFG, body)) shownWhileCharging ||= showsGhostBody(layout, CFG, body);
      else hiddenWhileProwling &&= !showsGhostBody(layout, CFG, body);
      // And the count only ever goes up, which is what the picture reads.
      expect(ghostLaps(body)).toBeLessThanOrEqual(CFG.ghostChargeLaps);
    }
    expect(hiddenWhileProwling).toBe(true);
    expect(shownWhileCharging).toBe(true);
  });
});

describe("the escape", () => {
  for (const role of ROLES) {
    it(`paints a shot ghost climbing out of the top of the field for ${role}`, () => {
      const painted = paint([falling(5)], TPB * 8, role, shoot(5));
      expect(painted.calls).toBeGreaterThan(0);
      expect(painted.world.creatures).toHaveLength(0);
    });
  }

  it("draws the same escape in both seats, which is the point of it", () => {
    // The one moment both screens carry this body. `showsGhostBody` is not
    // consulted at all here — the effect is spawned from an event and the
    // creature is already gone — so the two frames differ only where the band
    // was, and the escape itself is in both logs.
    const one = paint([falling(5)], TPB * 8, "p1", shoot(5));
    const two = paint([falling(5)], TPB * 8, "p2", shoot(5));
    expect(one.world.creatures).toHaveLength(0);
    expect(two.world.creatures).toHaveLength(0);
    expect(one.calls).toBeGreaterThan(0);
    expect(two.calls).toBeGreaterThan(0);
  });
});

describe("the camouflage", () => {
  it("is deterministic, so two phones tear one body the same way", () => {
    // The pair says "the torn one on four" across a voice delay. A disguise
    // seeded off anything but the body's own id would make that a lie.
    const a = slabs(7, 1.25, 0.5).map((s) => s.shift);
    const b = slabs(7, 1.25, 0.5).map((s) => s.shift);
    expect(a).toEqual(b);
    expect(slabs(8, 1.25, 0.5).map((s) => s.shift)).not.toEqual(a);
  });

  it("stays inside the body it belongs to, and reaches further as it rages", () => {
    const calm = slabs(7, 1.25, 0).map((s) => Math.abs(s.shift));
    const angry = slabs(7, 1.25, 1).map((s) => Math.abs(s.shift));
    for (const s of angry) expect(s).toBeLessThanOrEqual(1);
    expect(Math.max(...angry)).toBeGreaterThan(Math.max(...calm));
  });
});
