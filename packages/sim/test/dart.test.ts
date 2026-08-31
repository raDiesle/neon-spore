import { describe, expect, it } from "bun:test";
import {
  createRng,
  createWorld,
  DART_COLS,
  DART_ROWS,
  DEFAULT_CONFIG,
  dartFits,
  dartHeading,
  dartPickDir,
  dartStepCol,
  hashWorld,
  hullPercent,
  hullRow,
  isGrippable,
  record,
  runReplay,
  type SimConfig,
  type SimEvent,
  type SpawnEntry,
  step,
  type TimedCommand,
  ticksPerBeat,
} from "../src/index.js";

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const HULL = hullRow(CFG);

const dart = (col: number, color: "red" | "cyan" = "red"): SpawnEntry => ({
  beat: 0,
  col,
  kind: "dart",
  color,
});
const aim = (tick: number, col: number): TimedCommand => ({
  tick,
  player: 1,
  command: { kind: "cannonCol", col },
});
const fire = (tick: number, color: "red" | "cyan"): TimedCommand => ({
  tick,
  player: 2,
  command: { kind: "fire", color },
});

/** The field after `beats` whole beats, and nothing else touching it. */
function fly(queue: SpawnEntry[], beats: number, cfg: SimConfig = CFG) {
  const world = createWorld({ ...cfg }, 0, queue);
  for (let t = 0; t < TPB * beats; t++) step(world, []);
  return world;
}

/** Where the one creature on the field stands, beat by beat. */
function track(startCol: number, beats: number): { col: number; row: number; float: boolean }[] {
  const world = createWorld({ ...CFG }, 0, [dart(startCol)]);
  const seen: { col: number; row: number; float: boolean }[] = [];
  for (let b = 0; b < beats; b++) {
    for (let t = 0; t < TPB; t++) step(world, []);
    const c = world.creatures[0];
    if (!c) break;
    seen.push({ col: c.col, row: c.row, float: c.dartFloat === true });
  }
  return seen;
}

describe("the dart's arithmetic", () => {
  it("spends the same number of rows and columns, so a move is a true diagonal", () => {
    expect(DART_ROWS).toBe(DART_COLS);
  });

  it("reads a missing direction as one side rather than as none", () => {
    // Nothing in the game builds a dart without a direction — `onBeat` rolls
    // one at spawn — but three pictures are drawn off this call and none of
    // them may be drawn off `undefined`.
    expect(dartHeading({ dartDir: -1 } as never)).toBe(-1);
    expect(dartHeading({ dartDir: 1 } as never)).toBe(1);
    expect(dartHeading({} as never)).toBe(1);
  });

  it("offers only the side a whole move fits on, at either edge", () => {
    const cols = CFG.cols;
    expect(dartFits(0, cols, -1)).toBe(false);
    expect(dartFits(0, cols, 1)).toBe(true);
    expect(dartFits(cols - 1, cols, 1)).toBe(false);
    expect(dartFits(cols - 1, cols, -1)).toBe(true);
    // One short of a whole move is still short: the rule is about the landing
    // column, not about the edge itself.
    expect(dartFits(DART_COLS - 1, cols, -1)).toBe(false);
  });

  it("never picks a side that would take it off the field, however the roll goes", () => {
    const cols = CFG.cols;
    for (let seed = 0; seed < 64; seed++) {
      const rng = createRng(seed);
      for (let col = 0; col < cols; col++) {
        const dir = dartPickDir(rng, col, cols);
        const to = dartStepCol(col, cols, dir);
        expect(to).toBeGreaterThanOrEqual(0);
        expect(to).toBeLessThan(cols);
      }
    }
  });

  it("draws from the stream exactly once a pick, edge or no edge", () => {
    // Two devices consume the same rng whatever column the dart is standing
    // in. Folding the edge test into the draw would spend a number in the
    // middle of the field and none against a wall.
    const middle = createRng(7);
    const edge = createRng(7);
    dartPickDir(middle, 5, CFG.cols);
    dartPickDir(edge, 0, CFG.cols);
    expect(middle.state).toBe(edge.state);
  });

  it("refuses a hand: its fall is a cycle, not a rate a brake could scale", () => {
    expect(isGrippable("dart")).toBe(false);
  });
});

describe("the dart on the field", () => {
  it("hangs and runs, one beat each, and never falls straight down", () => {
    const seen = track(5, 8);
    expect(seen.length).toBeGreaterThan(6);
    for (const [i, at] of seen.entries()) {
      if (i === 0) continue;
      const before = seen[i - 1]!;
      const droppedRows = at.row - before.row;
      const movedCols = Math.abs(at.col - before.col);
      if (droppedRows === 0) {
        // A float: it holds both its row and its column.
        expect(movedCols).toBe(0);
      } else {
        // A run: never a vertical drop, and never rows without columns.
        expect(droppedRows).toBe(DART_ROWS);
        expect(movedCols).toBe(DART_COLS);
      }
    }
  });

  it("alternates the two beats strictly, and enters already aiming", () => {
    const seen = track(5, 7);
    // The beat it arrives on is a hang, so the arrow is over it on player 2's
    // screen for the whole of the glide in and the first diagonal comes out of
    // a beat the pair had to talk through.
    expect(seen[0]).toEqual({ col: 5, row: 0, float: true });
    for (const [i, at] of seen.entries()) {
      if (i === 0) continue;
      const dropped = at.row - seen[i - 1]!.row;
      expect(dropped).toBe(i % 2 === 1 ? DART_ROWS : 0);
      // `dartFloat` is true exactly on the beats it stands still, which is
      // what render/ hangs the arrow and the lean off.
      expect(at.float).toBe(dropped === 0);
    }
  });

  it("turns back inward instead of flattening against an edge", () => {
    // From column 0 there is only one whole move, so wherever the rolls fall
    // the body has to come back in — and it has to still be on the field.
    for (const start of [0, CFG.cols - 1]) {
      for (const at of track(start, 10)) {
        expect(at.col).toBeGreaterThanOrEqual(0);
        expect(at.col).toBeLessThan(CFG.cols);
      }
    }
    // The one column with only one whole move out of it: whatever the roll
    // said, the first diagonal is the one going back in.
    const fromLeft = track(0, 3);
    expect(fromLeft[1]!.col).toBe(DART_COLS);
  });

  it("crosses the field at a slick's pace: two rows every two beats", () => {
    // The `4 seconds to impact` rule holds by the same arithmetic every other
    // body satisfies it with — a dart is not a slow creature, it is a creature
    // that spends half its beats standing still and the other half moving
    // twice as far.
    const seen = track(5, HULL);
    const last = seen[seen.length - 1]!;
    expect(last.row).toBeGreaterThanOrEqual(HULL - DART_ROWS);
  });

  it("costs the hull exactly like any other missed creature", () => {
    const noRegen: SimConfig = { ...CFG, hullRegenPerSecond: 0 };
    const world = fly([dart(5)], HULL + 2, noRegen);
    expect(world.creatures).toHaveLength(0);
    expect(hullPercent(world)).toBe(100 - CFG.damageCreature);
  });

  /**
   * Fly a dart down and shoot at it on the first hang beat below `from`, in
   * whatever column it has by then reached.
   *
   * Written as a search rather than as a tick worked out on paper, because
   * that arithmetic is the creature: which column a dart is in on a given beat
   * is a roll of the seeded rng, and a test that hard-coded one would be
   * asserting today's stream rather than today's rule. Low down the field on
   * purpose too — a shot crosses twelve rows a beat, so aiming at a body two
   * rows above the ship is aiming at a body that is still there when the shot
   * arrives, which is the whole of what player 1 has to manage.
   */
  function shootOnHang(color: "red" | "cyan", aimAt: number | null = null) {
    const world = createWorld({ ...CFG }, 0, [dart(5)]);
    const events: SimEvent[] = [];
    let firedAt = -1;
    let atCol = -1;
    for (let t = 0; t < TPB * (HULL + 4); t++) {
      const c = world.creatures[0];
      const cmds: TimedCommand[] = [];
      if (firedAt < 0 && c && c.dartFloat === true && c.row >= HULL - 3 && t % TPB === 1) {
        atCol = c.col;
        cmds.push(aim(t, aimAt ?? c.col), fire(t, color));
        firedAt = t;
      }
      step(world, cmds);
      events.push(...world.events);
    }
    return {
      firedAt,
      atCol,
      destroyed: events.some((e) => e.type === "destroy"),
      rejected: events.some((e) => e.type === "reject"),
      breached: events.some((e) => e.type === "breach"),
    };
  }

  it("dies to its own colour in the column it has landed in, and to nothing else", () => {
    const right = shootOnHang("red");
    expect(right.firedAt).toBeGreaterThan(0);
    // It has left the column it was authored in, which is the whole creature.
    expect(right.atCol).not.toBe(5);
    expect(right.destroyed).toBe(true);
    expect(right.breached).toBe(false);

    // The same shot, on the same beat, in the wrong colour: it skids off and
    // the body goes on to break the hull.
    const wrongColor = shootOnHang("cyan");
    expect(wrongColor.rejected).toBe(true);
    expect(wrongColor.destroyed).toBe(false);
    expect(wrongColor.breached).toBe(true);

    // And the right colour in the column it *started* in, which is the mistake
    // the wave exists to punish: by the time a dart is worth shooting at, it
    // is nowhere near where player 1 first saw it.
    const staleColumn = shootOnHang("red", 5);
    expect(staleColumn.destroyed).toBe(false);
    expect(staleColumn.breached).toBe(true);
  });

  it("replays deterministically, zig-zag and all", () => {
    const replay = record({
      name: "two darts zig-zagging down an empty field",
      seed: 0,
      queue: [dart(5), dart(2, "cyan")],
      ticks: TPB * 8,
      inputs: [],
    });
    const world = runReplay(replay);
    // Still on the field, in columns the rolls chose rather than the ones the
    // wave authored — the property a fingerprint over `dartDir` is protecting.
    expect(world.creatures).toHaveLength(2);
    expect(world.creatures.map((c) => c.col)).not.toEqual([5, 2]);
    // Two runs in one process, never a pinned constant — see decisions.md #19.
    expect(hashWorld(runReplay(replay))).toBe(replay.expectHash!);
  });

  it("desyncs the fingerprint if the side a dart chose is not in it", () => {
    // `dartDir` and `dartFloat` decide where the body will be, so two worlds
    // that disagree about either are two worlds a shot lands in one of.
    const a = fly([dart(5)], 3);
    const b = fly([dart(5)], 3);
    expect(hashWorld(a)).toBe(hashWorld(b));
    const c = b.creatures[0]!;
    c.dartDir = dartHeading(c) === 1 ? -1 : 1;
    expect(hashWorld(b)).not.toBe(hashWorld(a));
  });
});
