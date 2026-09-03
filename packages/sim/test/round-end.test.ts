import { describe, expect, it } from "bun:test";
import {
  type BossEntry,
  createWorld,
  DEFAULT_CONFIG,
  roundSpent,
  type SimConfig,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "../src/index.js";

/**
 * A round that takes the whole picture never gives it back to the field.
 *
 * The three of them — THE GAUGE, SNAKE, PINBALL — used to take themselves off
 * the world the moment their verdict had stood, and the field came straight
 * back: the hull, the grid and the ship, for the beats of rest before the next
 * wave. On a wave that restarts into itself, which is what the director does
 * all afternoon, that reads as the round dropping out to the wrong picture and
 * back again — and it is exactly what `docs/spec/interludes.md` says a round
 * may not do.
 *
 * So a spent round stays installed and holds its own picture until `startWave`
 * puts the next wave's boss in its place. The wave still ends, on the same
 * rest and through the same `needWave`, from `wave-end.ts` instead of from an
 * empty field.
 *
 * One file for all three because it is one rule; each round's own file holds
 * what is different about it.
 */

/** The hull is held, so a round nobody plays cannot end the run before it ends
 * itself — what is being watched here is the picture, not the damage. */
const CFG: SimConfig = { ...DEFAULT_CONFIG, hullInvulnerable: true };
const TPB = ticksPerBeat(CFG);
const WAVE = 7;

/** A board with one target nothing will ever hit, so the clock is the only way
 * out. Placed the way `snake.test.ts` places its arena: for the rig. */
const PIN_ROUNDS = [
  {
    pieces: [
      {
        kind: "peg" as const,
        xMilli: 2_500,
        yMilli: 4_000,
        wMilli: 300,
        hMilli: 300,
        target: true,
      },
    ],
    beats: 12,
  },
];

/**
 * An arena the body never sets off in: `stepTicks` is longer than the round,
 * so nothing is steered into a wall. A crash starts the attempt over and puts
 * the clock back with it (`snake-move.ts`), and a rig that never touches the
 * controls would sit in that loop for ever instead of reaching the end this
 * file is about.
 */
const SNAKE_ROUNDS = [
  {
    enemies: [{ col: 8, row: 0 }],
    points: [{ col: 0, row: 0 }],
    rocks: [],
    beats: 12,
    stepTicks: 1_000_000,
  },
];

const ROUNDS: readonly { name: string; entry: BossEntry }[] = [
  { name: "THE GAUGE", entry: { kind: "gauge" } },
  { name: "SNAKE", entry: { kind: "snake", rounds: SNAKE_ROUNDS } },
  { name: "PINBALL", entry: { kind: "pinball", rounds: PIN_ROUNDS } },
];

function open(entry: BossEntry): World {
  const world = createWorld(CFG, WAVE);
  startWave(world, WAVE, [], [], entry);
  return world;
}

describe("a round holds its picture until the next wave takes it", () => {
  for (const { name, entry } of ROUNDS) {
    it(`${name} is never off the world while its wave is still running`, () => {
      const world = open(entry);
      const kind = entry.kind;
      expect(world.boss?.kind).toBe(kind);

      let asked = false;
      for (let i = 0; i < TPB * 400 && !asked; i++) {
        step(world, []);
        // The one assertion this file exists for: not a single tick between
        // the round opening and the host being asked for the next wave has a
        // field on it.
        expect(world.boss?.kind).toBe(kind);
        asked = world.events.some((e) => e.type === "needWave");
      }
      // And it did end — a picture that holds for ever is the other bug.
      expect(asked).toBe(true);
      expect(roundSpent(world)).toBe(true);
    });
  }

  it("hands the picture over only when the next wave is installed", () => {
    const world = open({ kind: "pinball", rounds: PIN_ROUNDS });
    for (let i = 0; i < TPB * 400; i++) {
      step(world, []);
      if (world.events.some((e) => e.type === "needWave")) break;
    }
    expect(roundSpent(world)).toBe(true);
    startWave(world, WAVE + 1, []);
    expect(world.boss).toBeNull();
  });
});
