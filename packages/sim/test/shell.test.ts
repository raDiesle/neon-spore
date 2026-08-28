import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  hullPercent,
  hullRow,
  record,
  runReplay,
  SHELL_COLS,
  SHELL_INTACT,
  type SimConfig,
  type SimEvent,
  type SpawnEntry,
  shellHasPiece,
  shellIsBare,
  shellPieceAt,
  shellPiecesLeft,
  step,
  type TimedCommand,
  ticksPerBeat,
} from "../src/index.js";

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const HULL = hullRow(CFG);
// A creature entered at beat 0 stands on row (beat - 1) — see rules.test.ts.
const IMPACT_TICK = TPB * (HULL + 1);

interface Run {
  world: ReturnType<typeof createWorld>;
  events: SimEvent[];
}

function run(queue: SpawnEntry[], ticks: number, inputs: TimedCommand[] = []): Run {
  const world = createWorld({ ...CFG }, 0, queue);
  const byTick = new Map<number, TimedCommand[]>();
  for (const i of inputs) byTick.set(i.tick, [...(byTick.get(i.tick) ?? []), i]);
  const events: SimEvent[] = [];
  for (let t = 0; t < ticks; t++) {
    step(world, byTick.get(t) ?? []);
    events.push(...world.events);
  }
  return { world, events };
}

const shell = (col: number): SpawnEntry => ({ beat: 0, col, kind: "shell", color: null });
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

/**
 * One aimed shot, at a tick. The cannon slides immediately and the shot leaves
 * on the same tick, so a column and a colour is the whole of an attempt — and
 * the half-beat cooldown (`fireEveryBeats`) is why the caller spaces them.
 */
function shot(tick: number, col: number, color: "red" | "cyan"): TimedCommand[] {
  return [aim(tick, col), fire(tick, color)];
}

const COL = 3;

describe("the shell's pieces", () => {
  it("wears one piece per column it occupies, and nothing else wears any", () => {
    const { world } = run([shell(COL)], TPB + 1);
    const body = world.creatures[0]!;
    expect(body.shell).toBe(SHELL_INTACT);
    expect(shellPiecesLeft(body)).toBe(SHELL_COLS);
    for (let k = 0; k < SHELL_COLS; k++) {
      expect(shellHasPiece(body, body.col + k)).toBe(true);
      expect(shellPieceAt(body, body.col + k)).toBe(k);
    }
    // A column the body does not occupy has no piece in front of it at all,
    // which is a different answer from "its piece is broken".
    expect(shellPieceAt(body, body.col - 1)).toBe(-1);
    expect(shellPieceAt(body, body.col + SHELL_COLS)).toBe(-1);
  });

  it("arrives with no colour, because there is nothing to know yet", () => {
    const { world } = run([shell(COL)], TPB + 1);
    expect(world.creatures[0]!.color).toBeNull();
    expect(shellIsBare(world.creatures[0]!)).toBe(false);
  });
});

/**
 * The constraint the whole shape rests on. The cannon fires straight up, so a
 * shot meets whatever stands lowest in its column and nothing else — pieces
 * stacked in rows would leave the upper ones permanently armoured by the lower
 * ones and the body would be unkillable rather than hard, on a phone, while
 * passing every test that did not ask this question.
 *
 * So it is asked directly: fire up each of the body's columns in turn, one
 * shot each, and every piece has to be the one that broke.
 */
describe("every piece is reachable from its own column", () => {
  for (let k = 0; k < SHELL_COLS; k++) {
    it(`piece ${k} breaks when the column in front of it is fired up`, () => {
      const { world } = run([shell(COL)], TPB * 4, shot(TPB * 2, COL + k, "red"));
      const body = world.creatures[0]!;
      expect(shellPiecesLeft(body)).toBe(SHELL_COLS - 1);
      expect(shellHasPiece(body, COL + k)).toBe(false);
      for (let other = 0; other < SHELL_COLS; other++) {
        if (other !== k) expect(shellHasPiece(body, COL + other)).toBe(true);
      }
    });
  }

  it("takes every piece off in exactly one shot each, whichever order", () => {
    const inputs = [...shot(TPB * 2, COL + 1, "red"), ...shot(TPB * 3, COL, "cyan")];
    const { world, events } = run([shell(COL)], TPB * 5, inputs);
    const body = world.creatures[0]!;
    expect(shellIsBare(body)).toBe(true);
    expect(events.filter((e) => e.type === "shellBreak")).toHaveLength(SHELL_COLS);
  });
});

describe("while the shell is on, the colour is not the question", () => {
  it("chips a piece with either colour, and scores for it", () => {
    for (const color of ["red", "cyan"] as const) {
      const { world, events } = run([shell(COL)], TPB * 4, shot(TPB * 2, COL, color));
      expect(shellPiecesLeft(world.creatures[0]!)).toBe(SHELL_COLS - 1);
      expect(world.score).toBeGreaterThanOrEqual(CFG.scoreShellPiece);
      const broke = events.find((e) => e.type === "shellBreak");
      expect(broke).toBeDefined();
      // Never a colour moment: nothing about the ammunition could have been
      // wrong, so nothing may be charged to the balance either player reads.
      expect(world.balance.colorHits + world.balance.colorMisses).toBe(0);
    }
  });

  it("sparks off the core in a column whose piece is already gone", () => {
    const inputs = [...shot(TPB * 2, COL, "red"), ...shot(TPB * 3, COL, "red")];
    const { world, events } = run([shell(COL)], TPB * 5, inputs);
    const body = world.creatures[0]!;
    // One piece off, one still on: the second shot up the bared column found
    // hard core and did nothing. This is the reason two pieces are worth
    // having — the pair now has to name which column still carries armour.
    expect(shellPiecesLeft(body)).toBe(SHELL_COLS - 1);
    expect(events.filter((e) => e.type === "shellBreak")).toHaveLength(1);
    expect(events.some((e) => e.type === "reject")).toBe(true);
    expect(world.balance.colorMisses).toBe(0);
  });
});

describe("once the shell is off, the colour is the only question", () => {
  const bareAt = TPB * 3;
  const strip = [...shot(TPB * 2, COL, "red"), ...shot(bareAt, COL + 1, "red")];

  function coreColor(events: SimEvent[]): "red" | "cyan" {
    const bare = events.find((e) => e.type === "shellBare");
    if (bare === undefined || bare.type !== "shellBare") throw new Error("never bared");
    return bare.color;
  }

  it("hands the body a colour at the break and not one tick before it", () => {
    const { world, events } = run([shell(COL)], TPB * 4, strip);
    const body = world.creatures[0]!;
    expect(shellIsBare(body)).toBe(true);
    expect(body.color).toBe(coreColor(events));
    // The shot that took the last piece is spent on the piece. The body is
    // still standing, and what kills it now is a colour nobody had a beat ago.
    expect(events.some((e) => e.type === "destroy")).toBe(false);
  });

  it("refuses the wrong colour, and charges it as a colour miss", () => {
    const opened = run([shell(COL)], TPB * 4, strip);
    const wrong = coreColor(opened.events) === "red" ? "cyan" : "red";
    const { world, events } = run([shell(COL)], TPB * 6, [...strip, ...shot(TPB * 4, COL, wrong)]);
    expect(world.creatures).toHaveLength(1);
    expect(events.some((e) => e.type === "destroy")).toBe(false);
    // Unlike every refusal while the shell was on: here the ammunition *was*
    // the question, so the balance both players read has to hear about it.
    expect(world.balance.colorMisses).toBe(1);
  });

  it("dies to the matching colour, from either seat's lobe", () => {
    const opened = run([shell(COL)], TPB * 4, strip);
    const right = coreColor(opened.events);
    const { world, events } = run([shell(COL)], TPB * 6, [...strip, ...shot(TPB * 4, COL, right)]);
    expect(world.creatures).toHaveLength(0);
    expect(events.some((e) => e.type === "destroy")).toBe(true);
    expect(world.balance.colorHits).toBe(1);
  });
});

describe("the shell as an ordinary arrival", () => {
  it("costs the hull exactly what any other missed creature does", () => {
    const noRegen: SimConfig = { ...CFG, hullRegenPerSecond: 0 };
    const world = createWorld(noRegen, 0, [shell(COL)]);
    for (let t = 0; t < IMPACT_TICK + 1; t++) step(world, []);
    expect(hullPercent(world)).toBe(100 - CFG.damageCreature);
  });

  it("replays deterministically: two pieces, then the colour that was drawn", () => {
    const opened = run([shell(COL)], TPB * 4, [
      ...shot(TPB * 2, COL, "red"),
      ...shot(TPB * 3, COL + 1, "red"),
    ]);
    const bare = opened.events.find((e) => e.type === "shellBare");
    if (bare === undefined || bare.type !== "shellBare") throw new Error("never bared");

    const replay = record({
      name: "shell stripped and killed",
      seed: 0,
      queue: [shell(COL)],
      ticks: TPB * 6,
      inputs: [
        ...shot(TPB * 2, COL, "red"),
        ...shot(TPB * 3, COL + 1, "red"),
        ...shot(TPB * 4, COL, bare.color),
      ],
    });
    const world = runReplay(replay);
    expect(world.creatures).toHaveLength(0);
    // Not a pinned constant — two runs of the same replay in one process is
    // the property lockstep actually needs (docs/decisions.md #19).
    expect(hashWorld(runReplay(replay))).toBe(replay.expectHash!);
  });

  it("puts the pieces into the fingerprint, so two devices cannot differ", () => {
    const intact = run([shell(COL)], TPB * 2);
    const chipped = run([shell(COL)], TPB * 2, shot(TPB, COL, "red"));
    expect(hashWorld(chipped.world)).not.toBe(hashWorld(intact.world));
  });
});
