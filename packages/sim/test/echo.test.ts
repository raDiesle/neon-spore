import { describe, expect, it } from "bun:test";
import { onBeat } from "../src/beat.js";
import { DEFAULT_CONFIG, type SimConfig } from "../src/config.js";
import { echoBodies, echoSplitsLeft, echoSpread, echoStruck } from "../src/echo.js";
import { setGrip } from "../src/grip.js";
import { hashWorld } from "../src/hash.js";
import type { Bullet, Creature } from "../src/types.js";
import { startWave } from "../src/wave-start.js";
import { createWorld, type World } from "../src/world.js";

/**
 * THE ECHO: half speed down, and one arrival becomes four bodies over the two
 * beats after it lands. What is worth pinning here is the half a reader of
 * `echo.ts` cannot check by eye — that the fan lands in four *different*
 * columns, that the count runs out, that the price of the whole arrival is the
 * same however it is taken, and that a second device walking the same beats
 * arrives at the same fingerprint.
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
const columns = (world: World): number[] =>
  echoes(world)
    .map((c) => c.col)
    .sort((a, b) => a - b);

describe("the fan", () => {
  it("arrives as one body carrying every division ahead of it", () => {
    const world = withEcho();
    expect(echoes(world)).toHaveLength(1);
    expect(echoSplitsLeft(echoes(world)[0]!)).toBe(cfg.echoSplits);
  });

  it("is two on the next beat and four on the one after that", () => {
    const world = withEcho();
    onBeat(world);
    expect(echoes(world)).toHaveLength(2);
    onBeat(world);
    expect(echoes(world)).toHaveLength(4);
  });

  it("stops there, however long the wave runs", () => {
    const world = withEcho();
    for (let i = 0; i < 8; i++) onBeat(world);
    expect(echoes(world)).toHaveLength(4);
    for (const c of echoes(world)) expect(echoSplitsLeft(c)).toBe(0);
  });

  /**
   * The reason `echoSpread` halves. A fixed spread of one column would put the
   * second generation back in its own grandparent's lane, and two bodies in
   * one column is one body as far as a spoken count goes — the pair would say
   * "two" and be shot at by four.
   */
  it("leaves the four in four different columns, evenly spaced", () => {
    const world = withEcho(5);
    onBeat(world);
    expect(columns(world)).toEqual([3, 7]);
    onBeat(world);
    expect(columns(world)).toEqual([2, 4, 6, 8]);
  });

  it("keeps a body against the wall on the field", () => {
    const world = withEcho(0);
    onBeat(world);
    onBeat(world);
    for (const c of echoes(world)) {
      expect(c.col).toBeGreaterThanOrEqual(0);
      expect(c.col).toBeLessThan(cfg.cols);
    }
  });

  it("gives each half the parent's colour and the parent's row", () => {
    const world = withEcho(5, "red");
    const before = echoes(world)[0]!;
    onBeat(world);
    for (const c of echoes(world)) {
      expect(c.color).toBe("red");
      // The parent's own column, so render glides the halves out of the body
      // they came from rather than snapping them two lanes away.
      expect(c.fromCol).toBe(before.col);
    }
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
    // Never two steps running, and exactly one step per `echoFallBeats` beats
    // over the whole stretch — which is the whole of "half as fast".
    for (let i = 1; i < rows.length; i++) expect(rows[i]! - rows[i - 1]!).toBeLessThanOrEqual(1);
    expect(rows[rows.length - 1]! - rows[0]!).toBe(6 / cfg.echoFallBeats);
  });

  it("takes twice as long to reach the hull as an ordinary body does", () => {
    const clear = (world: World): number => {
      let beats = 0;
      while (world.creatures.length > 0 && beats < 200) {
        onBeat(world);
        beats += 1;
      }
      return beats;
    };
    const slick = createWorld(cfg, 1);
    startWave(slick, 0, [{ beat: 0, col: 5, kind: "slick", color: "red" }]);
    onBeat(slick);
    // One hold beat between every pair of steps, and none after the last one —
    // the body is at the hull by then — so it is double minus the hold that
    // never happens rather than double exactly.
    const steps = clear(slick);
    expect(clear(withEcho())).toBe(steps * cfg.echoFallBeats - (cfg.echoFallBeats - 1));
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
    expect(held.creatures[0]!.row).toBeLessThan(free.creatures[0]!.row);
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
    onBeat(late);
    onBeat(late);
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

  it("is worth one body once it has finished dividing", () => {
    const world = withEcho(5, "red");
    onBeat(world);
    onBeat(world);
    expect(echoBodies(world.creatures[0]!)).toBe(1);
  });
});

describe("the rules the rest of the game calls", () => {
  it("halves the spread every generation", () => {
    expect(echoSpread(2)).toBe(2);
    expect(echoSpread(1)).toBe(1);
    // Never zero: a split that put both halves in the parent's own column
    // would be a body that visibly doubled and could still be called as one.
    expect(echoSpread(0)).toBe(1);
  });

  it("reads a body that never divided as no divisions rather than as undefined", () => {
    expect(echoSplitsLeft({ kind: "slick" } as Creature)).toBe(0);
    expect(echoBodies({ kind: "slick" } as Creature)).toBe(1);
  });
});

/**
 * The whole point of `echoSplits` being in `hashWorld` and of the split being
 * read off nothing but the shared beat: two devices handed the same wave walk
 * the same beats and hold the same field, ids included.
 */
describe("two devices", () => {
  it("agree about a field that has divided twice", () => {
    const a = withEcho(5, "red");
    const b = withEcho(5, "red");
    for (let i = 0; i < 6; i++) {
      onBeat(a);
      onBeat(b);
    }
    expect(hashWorld(a)).toBe(hashWorld(b));
  });

  it("would not agree if one of them had a division left the other had spent", () => {
    const a = withEcho(5, "red");
    const b = withEcho(5, "red");
    b.creatures[0]!.echoSplits = 1;
    expect(hashWorld(a)).not.toBe(hashWorld(b));
  });
});
