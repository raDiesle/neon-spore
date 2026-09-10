import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
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
import { linkCenter, RIDE } from "../src/crawler-place.js";
import { frame, type HullMood, type LobePositions, surfaceSampler } from "../src/hull-frame.js";
import type { ViewRole } from "../src/layout.js";
import { computeLayout } from "../src/layout.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  runFrames,
  thirdOf,
  VIEWPORT,
} from "./frame-harness.js";

// The cap this file runs under. Asked for here rather than inherited: bun
// applies `setDefaultTimeout` to the file the call is in, and the harness is
// evaluated once, so a call left there reaches only whichever frame test
// imported it first (`frame-harness.ts`). This file is the one that found out,
// at 5017 ms inside a check it passes in 4.4 s on its own.
setDefaultTimeout(FRAME_TIMEOUT_MS);

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

/**
 * Every second tick, unless a caller is one of three sharing the play: the
 * contraction runs the length of the body inside two beats, so a sampling
 * that only caught beat boundaries would draw one phase of it over and over.
 */
const EVERY_SECOND = { every: 2, phase: 0 };

function crawlerFrames(
  role: ViewRole,
  ticks: number,
  segments = 5,
  col = 0,
  sampling = EVERY_SECOND,
) {
  return runFrames(createWorld(CFG, 1, [crawler(segments, col)]), role, ticks, {
    ...sampling,
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

  // Each seat draws a third of the every-second-tick walk (`thirdOf`), so
  // the contraction is still caught mid-body and the walk is drawn once.
  for (const [i, role] of ROLES.entries()) {
    it(`draws the links, their necks and both endings for ${role}`, () => {
      const { ctx } = crawlerFrames(role, TICKS, 5, 0, thirdOf(2, i));
      expect(ctx.calls).toBeGreaterThan(1000);
    });
  }

  /**
   * The wall and the length are **paired rather than crossed**, for the
   * strand's reason (`strand-frame.test.ts`): the two axes are independent.
   * `crawlerSide` reads the column to pick a wall and `linkCol` walks the
   * body off it a link a rank, `dir` times the rank, and the count only says
   * how many ranks there are — so the short worm over one wall and the long
   * one over the other put every value of both through the canvas, in two
   * plays where crossing them took four.
   */
  it("keeps the canvas happy off either wall, and at either length", () => {
    for (const [col, segments] of [
      [0, 2],
      [CFG.cols - 1, 7],
    ] as const) {
      const { ctx } = crawlerFrames("p1", TICKS, segments, col);
      expect(ctx.calls).toBeGreaterThan(1000);
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

/**
 * A hull at rest with its cannon over one column and no shield lobes at all —
 * the shield is left out so that what the numbers below are about is the one
 * swelling being moved.
 */
const AT_REST: HullMood = { armed: 0, intake: 0, chew: 0, charge: 0 };

function surfaceWithCannonAt(l: ReturnType<typeof computeLayout>, cannon: number) {
  const at: LobePositions = { cannon, shield: [] };
  return surfaceSampler(frame(l, 0, AT_REST, at));
}

describe("a worm walks the ship rather than a line over it", () => {
  const l = computeLayout(VIEWPORT, CFG, "p1");
  // A link standing still in column three: `fromCol` equals `col`, so nothing
  // here depends on where in a beat the picture was taken.
  const ring = {
    id: 1,
    kind: "crawler" as const,
    col: 3,
    row: CFG.rows - 2,
    fromRow: CFG.rows - 2,
    fromCol: 3,
    color: null,
    holes: 0,
    petals: 0,
    dragMilli: 0,
    shell: 0,
  };

  it("falls back to the flat hull line for a caller with no ship to sample", () => {
    // That fallback has to be the placement this creature shipped with, or a
    // host that never built a `HullFrame` would draw a different worm.
    expect(linkCenter(l, ring, 0).y).toBeCloseTo(l.hullY, 6);
  });

  it("lies on the skin the ship is drawn with, not on that flat line", () => {
    // The two are half a tile apart: `Layout.hullY` is a straight line and the
    // hull is an arc with a lobed radius, so a worm measured from the line was
    // floating over the plating (`crawler-place.ts`). `RIDE` is the clearance
    // that keeps it on the ship instead.
    const s = surfaceWithCannonAt(l, 0);
    expect(linkCenter(l, ring, 0, s).y).toBeCloseTo(s(linkCenter(l, ring, 0).x) - l.tile * RIDE, 6);
  });

  it("is pushed up by the cannon lobe when the cannon is under it", () => {
    const under = linkCenter(l, ring, 0, surfaceWithCannonAt(l, 3)).y;
    const away = linkCenter(l, ring, 0, surfaceWithCannonAt(l, 8)).y;
    // Up the screen is a smaller y. Half a tile is the lobe's whole lift
    // (`CANNON_LOBE.liftTiles`), and the breath takes a little off it, so what
    // is pinned here is that most of it arrives rather than the exact figure.
    expect(away - under).toBeGreaterThan(l.tile * 0.35);
    // And the ring does not move sideways for it: the column is the rule, and
    // a body that slid would be one the cannon could no longer be put under.
    expect(linkCenter(l, ring, 0, surfaceWithCannonAt(l, 3)).x).toBeCloseTo(
      linkCenter(l, ring, 0).x,
      6,
    );
  });

  it("lets it down again a column either side, so the lobe reads as a hill", () => {
    const under = linkCenter(l, ring, 0, surfaceWithCannonAt(l, 3)).y;
    const beside = linkCenter(l, ring, 0, surfaceWithCannonAt(l, 4)).y;
    const away = linkCenter(l, ring, 0, surfaceWithCannonAt(l, 8)).y;
    expect(beside).toBeGreaterThan(under);
    expect(beside).toBeLessThanOrEqual(away);
  });

  it("follows the ship's own contour, so a long worm is not drawn on one line", () => {
    // The hull is a breathing arc with a lobed radius, not a shelf
    // (`hull-frame.ts`), and the whole of what was asked for is that a worm is
    // *on* it. So the rings of one body standing across the field are at
    // several different heights — which is the difference between a thing
    // lying along a ship and a row of counters on a rule.
    const away = surfaceWithCannonAt(l, 0);
    const ys = [];
    // From column one, so the cannon parked on column zero is not what this is
    // measuring: the contour has to be uneven on its own.
    for (let col = 1; col < CFG.cols; col++) {
      ys.push(linkCenter(l, { ...ring, col, fromCol: col }, 0, away).y);
    }
    expect(Math.max(...ys) - Math.min(...ys)).toBeGreaterThan(l.tile * 0.1);
  });
});
