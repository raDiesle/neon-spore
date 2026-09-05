import { beforeAll, describe, expect, it } from "bun:test";
import { controlSet } from "@neon-spore/content";
import {
  createWorld,
  type SimEvent,
  type SpawnEntry,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { linkOnField } from "../src/crawler.js";
import type { ViewRole } from "../src/layout.js";
import { CFG, installCanvasGlobals, ROLES, runFrames } from "./frame-harness.js";

/**
 * THE CRAWLER, drawn: a run of links along the ship's own row, the marks over
 * them, and the three pictures that outlive the body they are about.
 *
 * Nothing here can answer whether a worm *reads* as a worm at forty pixels —
 * that is a check that needs an eye, and it was made by looking at a captured
 * frame. What this holds is the shape of the arrangement: that a body which
 * spends its first beats in columns the field does not have never hands the
 * canvas a coordinate it refuses, that a link taken off the middle leaves a
 * picture the canvas will still take, and that the beam and the mound — the
 * only two pictures in this creature drawn with no body to hang them on — go
 * through the same stub as everything else.
 *
 * The stub is a canvas that refuses what a real one refuses, which is what
 * catches a value that is a perfectly good `string` and not a colour. Every
 * colour on this creature comes out of `PALETTE` and through `hazed`, and a
 * plate's comes out of `shell-plate.ts` — three sources, none of them checked
 * anywhere else on this body.
 */

beforeAll(installCanvasGlobals);

const crawler = (segments: number, col = 0): SpawnEntry => ({
  beat: 0,
  col,
  kind: "crawler",
  color: null,
  segments,
});

function crawlerFrames(role: ViewRole, ticks: number, segments = 5, col = 0) {
  return runFrames(createWorld(CFG, 1, [crawler(segments, col)]), role, ticks, {
    // Every second tick: the contraction runs the length of the body inside two
    // beats, so a sampling that only caught beat boundaries would draw one
    // phase of it over and over.
    every: 2,
    controls: controlSet("default"),
  });
}

/**
 * Both seats' commands for this tick: the cannon and the matching lobe under
 * whichever colour ring is standing furthest forward, and the shield and the
 * trigger under the first plate. A link in a column the field has not got is
 * skipped — no control can reach one, and aiming at it would park both seats
 * off the side of the ship for the first several beats.
 */
function bothControls(w: World): TimedCommand[] {
  const links = w.creatures.filter((c) => c.kind === "crawler" && c.col >= 0 && c.col < CFG.cols);
  const shot = links.find((c) => c.color !== null);
  const plate = links.find((c) => c.color === null);
  const out: TimedCommand[] = [];
  if (shot?.color) {
    out.push({ tick: w.tick, player: 1, command: { kind: "cannonCol", col: shot.col } });
    out.push({ tick: w.tick, player: 2, command: { kind: "fire", color: shot.color } });
  }
  if (plate) {
    out.push({ tick: w.tick, player: 2, command: { kind: "shieldCol", col: plate.col } });
    out.push({ tick: w.tick, player: 1, command: { kind: "guard" } });
  }
  return out;
}

describe("the crawler", () => {
  // Past the far wall, so every frame this creature produces — walking on over
  // the edge, the whole body standing, the burrow and the hull breaking under
  // it — has been through the stub.
  const TICKS = ticksPerBeat(CFG) * 26;

  for (const role of ROLES) {
    it(`draws the links, their necks and both endings for ${role}`, () => {
      const { ctx } = crawlerFrames(role, TICKS);
      expect(ctx.calls).toBeGreaterThan(1000);
    });
  }

  it("keeps the canvas happy off either wall, and at either length", () => {
    for (const col of [0, CFG.cols - 1]) {
      for (const segments of [2, 7]) {
        const { ctx } = crawlerFrames("p1", TICKS, segments, col);
        expect(ctx.calls).toBeGreaterThan(1000);
      }
    }
  });

  it("draws a burst ring's splash and the swept lane when the pair takes one apart", () => {
    // A worm answered by both controls at a speed no pair could manage: the
    // cannon under the first colour ring standing on the field with the
    // matching lobe, and the dome under the first plate. What it is here to
    // reach is the two pictures with no body left to hang them on — the goo a
    // ring throws and the lane the ship sweeps — because the mound above is
    // the only one of the three the walking test gets to on its own.
    const world: World = createWorld(CFG, 1, [crawler(3)]);
    for (let t = 0; t < ticksPerBeat(CFG) + 1; t++) step(world, []);
    const { ctx, events } = runFrames(world, "test", ticksPerBeat(CFG) * 24, {
      every: 2,
      controls: controlSet("default"),
      onTick: (_tick, w) => step(w, bothControls(w)),
    });
    const kinds = new Set(events.map((e: SimEvent) => e.type));
    expect(kinds.has("crawlerBreak")).toBe(true);
    expect(kinds.has("crawlerBeam")).toBe(true);
    expect(ctx.calls).toBeGreaterThan(1000);
  });

  it("keeps a link off the side of the field out of the picture", () => {
    const world = createWorld(CFG, 1, [crawler(7)]);
    for (let t = 0; t < ticksPerBeat(CFG) + 1; t++) step(world, []);
    const links = world.creatures.filter((c) => c.kind === "crawler");
    // Only the head has walked on; every link behind it is in a column no
    // phone has, and a body drawn there would be one the pilot can see and can
    // never put the cannon under.
    expect(links.filter((c) => linkOnField(CFG, c, 0))).toHaveLength(1);
  });
});
