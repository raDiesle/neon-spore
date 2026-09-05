import { describe, expect, it } from "bun:test";
import { onBeat } from "../src/beat.js";
import { DEFAULT_CONFIG, hullRow, type SimConfig } from "../src/config.js";
import { echoBodies, echoSplitsLeft, echoStruck } from "../src/echo.js";
import { ECHO_AXES, echoAxis, echoSplitPhase, echoWaitBeats } from "../src/echo-split.js";
import { setGrip } from "../src/grip.js";
import { hashWorld } from "../src/hash.js";
import type { Bullet, Creature } from "../src/types.js";
import { startWave } from "../src/wave-start.js";
import { createWorld, type World } from "../src/world.js";

/**
 * THE ECHO: half speed down, and one arrival becomes eight bodies over three
 * divisions whose waits grow. What is worth pinning here is the half a reader
 * of `echo.ts` and `echo-split.ts` cannot check by eye — that each wait really
 * is longer than the last, that the eight land on eight *different* squares,
 * that the strain render draws peaks on the beat the division actually
 * happens, and that a second device walking the same beats arrives at the same
 * fingerprint.
 */

const cfg: SimConfig = { ...DEFAULT_CONFIG, briefings: false };

/** A world with one echo standing at `col`, and nothing else on the field. */
function withEcho(col = 5, color: "red" | "cyan" = "cyan"): World {
  const world = createWorld(cfg, 1);
  startWave(world, 0, [{ beat: 0, col, kind: "echo", color }]);
  onBeat(world);
  return world;
}

const echoes = (world: World): Creature[] => world.creatures.filter((c) => c.kind === "echo");
/** How far apart the outermost of a set of bodies stand, along one axis. */
const spread = (bodies: Creature[], of: (c: Creature) => number): number =>
  Math.max(...bodies.map(of)) - Math.min(...bodies.map(of));
const tiles = (world: World): string[] =>
  echoes(world)
    .map((c) => `${c.col},${c.row}`)
    .sort();

/** Run until the field holds `want` echoes, or give up. Returns the beat. */
function until(world: World, want: number): number {
  for (let i = 0; i < 60; i++) {
    if (echoes(world).length >= want) return world.beat;
    onBeat(world);
  }
  return -1;
}

describe("the waits", () => {
  it("holds the arrival whole for echoSplitBeats before it divides at all", () => {
    const world = withEcho();
    const born = world.beat;
    expect(until(world, 2) - born).toBe(cfg.echoSplitBeats);
  });

  /**
   * The whole of what the owner asked for over the first version: a second
   * wait long enough that the body reads as finished with, and it is not.
   */
  it("makes every wait after that a longer one", () => {
    const world = withEcho();
    const at2 = until(world, 2);
    const at4 = until(world, 4);
    const at8 = until(world, 8);
    expect(at4 - at2).toBe(cfg.echoSplitBeats * 2);
    expect(at8 - at4).toBe(cfg.echoSplitBeats * 3);
    // Said plainly, because it is the property and not the arithmetic that
    // matters: each gap is strictly longer than the one before it.
    expect(at4 - at2).toBeGreaterThan(at2 - world.cfg.echoSplitBeats);
    expect(at8 - at4).toBeGreaterThan(at4 - at2);
  });

  it("reads the wait off the generation rather than off a stored countdown", () => {
    const world = withEcho();
    const arrival = echoes(world)[0]!;
    expect(echoWaitBeats(cfg, arrival)).toBe(cfg.echoSplitBeats);
    until(world, 2);
    expect(echoWaitBeats(cfg, echoes(world)[0]!)).toBe(cfg.echoSplitBeats * 2);
  });

  it("stops at echoSplits, however long the wave runs", () => {
    const world = withEcho();
    until(world, 1 << cfg.echoSplits);
    expect(echoes(world)).toHaveLength(1 << cfg.echoSplits);
    for (const c of echoes(world)) expect(echoSplitsLeft(c)).toBe(0);
    // And never a ninth: from here the only thing that removes one is a shot
    // or the hull, so the count can fall and must not rise.
    for (let i = 0; i < 6; i++) onBeat(world);
    expect(echoes(world).length).toBeLessThanOrEqual(1 << cfg.echoSplits);
  });
});

describe("the strain render draws", () => {
  it("runs from nothing to full across the wait and peaks on the beat it goes", () => {
    const world = withEcho();
    const c = echoes(world)[0]!;
    expect(echoSplitPhase(cfg, world.beat, c)).toBe(0);
    expect(echoSplitPhase(cfg, world.beat + cfg.echoSplitBeats / 2, c)).toBeCloseTo(0.5, 5);
    expect(echoSplitPhase(cfg, world.beat + cfg.echoSplitBeats, c)).toBe(1);
  });

  it("is nothing at all on a body that has finished dividing", () => {
    const world = withEcho();
    until(world, 1 << cfg.echoSplits);
    const done = echoes(world)[0]!;
    expect(echoAxis(cfg, done)).toBeNull();
    expect(echoSplitPhase(cfg, world.beat, done)).toBe(0);
  });

  /** The picture points the way the simulation actually steps. */
  it("names the axis the halves will step along", () => {
    const world = withEcho();
    expect(echoAxis(cfg, echoes(world)[0]!)).toEqual(ECHO_AXES[0]!);
    until(world, 2);
    expect(echoAxis(cfg, echoes(world)[0]!)).toEqual(ECHO_AXES[1]!);
  });
});

describe("the fan", () => {
  it("turns a corner each time: sideways, then up and down, then both", () => {
    const world = withEcho(5);

    until(world, 2);
    const two = echoes(world);
    // Sideways: one row between them, two columns apart.
    expect(new Set(two.map((c) => c.row)).size).toBe(1);
    expect(spread(two, (c) => c.col)).toBe(2 * ECHO_AXES[0]!.col);

    until(world, 4);
    const four = echoes(world);
    // Up and down: a two-by-two block, which is as close as bodies can stand.
    expect(new Set(four.map((c) => c.col)).size).toBe(2);
    expect(new Set(four.map((c) => c.row)).size).toBe(2);
    expect(spread(four, (c) => c.row)).toBe(2 * ECHO_AXES[1]!.row);

    until(world, 8);
    const eight = echoes(world);
    // Both at once: the block opens along the diagonal, on both axes together.
    expect(spread(eight, (c) => c.col)).toBeGreaterThan(spread(four, (c) => c.col));
    expect(spread(eight, (c) => c.row)).toBeGreaterThan(spread(four, (c) => c.row));
  });

  /**
   * The reason `ECHO_AXES` reaches two squares on the last one. A body hidden
   * behind a body is a shot that kills the wrong one and a count that is wrong
   * out loud.
   */
  it("leaves the eight on eight different squares", () => {
    const world = withEcho(5);
    until(world, 1 << cfg.echoSplits);
    expect(new Set(tiles(world)).size).toBe(1 << cfg.echoSplits);
  });

  it("keeps a body against the wall, the ceiling and the hull on the field", () => {
    for (const col of [0, cfg.cols - 1]) {
      const world = withEcho(col);
      for (let i = 0; i < 24; i++) onBeat(world);
      for (const c of echoes(world)) {
        expect(c.col).toBeGreaterThanOrEqual(0);
        expect(c.col).toBeLessThan(cfg.cols);
        expect(c.row).toBeGreaterThanOrEqual(0);
        expect(c.row).toBeLessThan(hullRow(cfg));
      }
    }
  });

  it("gives each half the parent's colour and the place it came from", () => {
    const world = withEcho(5, "red");
    // The beat before it goes, so the tile it was standing on is still its own.
    for (let i = 0; i < cfg.echoSplitBeats - 1; i++) onBeat(world);
    const from = { col: echoes(world)[0]!.col, row: echoes(world)[0]!.row };
    onBeat(world);

    expect(echoes(world)).toHaveLength(2);
    for (const c of echoes(world)) {
      expect(c.color).toBe("red");
      // Both halves glide out of the one place the parent was, so the picture
      // is a body opening rather than two bodies appearing beside each other.
      expect(c.fromCol).toBe(from.col);
      expect(c.fromRow).toBe(from.row);
    }
    expect(new Set(echoes(world).map((c) => c.fromRow)).size).toBe(1);
  });

  /**
   * `ECHO_AXES` is the whole rule, so a config asking for more divisions than
   * there are directions would repeat the last one and stack two bodies on a
   * square. The ceiling is a fact about the shipped configuration, checked
   * rather than remembered.
   */
  it("never asks for more divisions than there are directions", () => {
    expect(cfg.echoSplits).toBeLessThanOrEqual(ECHO_AXES.length);
  });
});

describe("half speed", () => {
  it("steps down one row every echoFallBeats and holds in between", () => {
    const world = withEcho();
    const rows = [echoes(world)[0]!.row];
    for (let i = 0; i < 6; i++) {
      onBeat(world);
      rows.push(echoes(world)[0]!.row);
    }
    for (let i = 1; i < rows.length; i++) expect(rows[i]! - rows[i - 1]!).toBeLessThanOrEqual(1);
    expect(rows[rows.length - 1]! - rows[0]!).toBe(6 / cfg.echoFallBeats);
  });

  /**
   * A hand still works, which is what separates this creature from the dart,
   * the wisp and the crossing ghost — all three refuse a grip because they do
   * not fall at all. An echo does fall, only rarely, so the brake has a rate
   * to scale.
   */
  it("is slowed further by a hand, rather than refusing one", () => {
    const held = withEcho();
    const free = withEcho();
    setGrip(held, 1, held.creatures[0]!.id);
    for (let i = 0; i < 8; i++) {
      onBeat(held);
      onBeat(free);
    }
    // The held one is behind at least one of the free one's bodies, which is
    // all a brake on a body that divides can mean.
    const lowest = (w: World): number => Math.max(...echoes(w).map((c) => c.row));
    expect(lowest(held)).toBeLessThan(lowest(free));
  });
});

describe("what a shot is worth", () => {
  const shot = (color: "red" | "cyan"): Bullet => ({
    id: 1,
    col: 0,
    row: 0,
    subMilli: 0,
    color,
    lance: false,
    pierced: 0,
    driftMilli: 0,
    aimMilli: 0,
  });

  it("pays for every body the one it killed would have become", () => {
    const world = withEcho(5, "red");
    echoStruck(world, shot("red"), world.creatures[0]!);
    expect(world.score).toBe(cfg.scoreEchoKill * (1 << cfg.echoSplits));
    expect(world.creatures).toHaveLength(0);
  });

  it("pays the same for the whole arrival taken one body at a time", () => {
    const early = withEcho(5, "red");
    echoStruck(early, shot("red"), early.creatures[0]!);

    const late = withEcho(5, "red");
    until(late, 1 << cfg.echoSplits);
    for (const c of [...late.creatures]) echoStruck(late, shot("red"), c);

    expect(late.score).toBe(early.score);
  });

  it("counts a wrong colour as an ordinary colour miss and leaves the body", () => {
    const world = withEcho(5, "red");
    const before = world.balance.colorMisses;
    expect(echoStruck(world, shot("cyan"), world.creatures[0]!)).toBe(false);
    expect(world.balance.colorMisses).toBe(before + 1);
    expect(world.creatures).toHaveLength(1);
  });

  it("reads a body that never divided as no divisions rather than as undefined", () => {
    expect(echoSplitsLeft({ kind: "slick" } as Creature)).toBe(0);
    expect(echoBodies({ kind: "slick" } as Creature)).toBe(1);
  });
});

/**
 * The whole point of `echoSplits` and `echoBeat` being in `hashWorld`: two
 * devices handed the same wave walk the same beats and hold the same field,
 * ids included.
 */
describe("two devices", () => {
  it("agree about a field that has divided three times", () => {
    const a = withEcho(5, "red");
    const b = withEcho(5, "red");
    for (let i = 0; i < 24; i++) {
      onBeat(a);
      onBeat(b);
    }
    expect(hashWorld(a)).toBe(hashWorld(b));
  });

  it("would not agree if one of them started its wait a beat earlier", () => {
    const a = withEcho(5, "red");
    const b = withEcho(5, "red");
    b.creatures[0]!.echoBeat = (b.creatures[0]!.echoBeat ?? 0) - 1;
    expect(hashWorld(a)).not.toBe(hashWorld(b));
  });
});
