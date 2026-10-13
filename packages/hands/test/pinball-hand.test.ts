import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  type PinballRound,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { pinballHand } from "../src/boss-hand-pinball.js";

/**
 * **AUTO's PINBALL shot reaches the board** (`boss-hand-pinball.ts`). The hand
 * once latched on its first tick and launched on its next: every shot went
 * straight up at four thousandths of the bar, fell back onto the cannon and
 * was fired again the same way until the round's clock ran out, with nothing
 * lit (`docs/queue.md`, 10 October 2026).
 */

/** Two boards, written out: hands tests do not read content. */
const ROUNDS: PinballRound[] = [
  {
    beats: 60,
    pieces: [
      { kind: "peg", xMilli: 3500, yMilli: 5500, wMilli: 200, hMilli: 200, target: true },
      { kind: "block", xMilli: 7500, yMilli: 8500, wMilli: 440, hMilli: 150, target: false },
    ],
  },
  {
    beats: 60,
    pieces: [
      { kind: "peg", xMilli: 8500, yMilli: 4000, wMilli: 200, hMilli: 200, target: true },
      { kind: "peg", xMilli: 5500, yMilli: 6000, wMilli: 200, hMilli: 200, target: false },
      { kind: "peg", xMilli: 2500, yMilli: 7000, wMilli: 200, hMilli: 200, target: false },
    ],
  },
];

interface Flight {
  ticks: number;
  lit: number;
}

/** Play the fight to its verdict, and say how every flight went. */
function played(): { world: World; flights: Flight[] } {
  const world = createWorld(DEFAULT_CONFIG, 1);
  startWave(world, 0, [], [], { kind: "pinball", rounds: ROUNDS });
  const flights: Flight[] = [];
  let launched = -1;
  let lit = 0;
  const stop = 240 * ticksPerBeat(DEFAULT_CONFIG);
  while (world.tick < stop) {
    step(
      world,
      pinballHand(world).map((c) => ({ ...c, tick: world.tick })),
    );
    const b = world.boss;
    if (b?.kind !== "pinball" || b.phase === "verdict") break;
    if (b.shot === "flight") {
      if (launched < 0) launched = world.tick;
      lit = b.lit.length;
    } else if (launched >= 0) {
      flights.push({ ticks: world.tick - launched, lit });
      launched = -1;
    }
  }
  return { world, flights };
}

describe("PINBALL, played by AUTO", () => {
  const { world, flights } = played();
  const b = world.boss;

  it("passes both boards and drops no ball", () => {
    expect(b?.kind === "pinball" && b.passed).toBe(true);
    expect(b?.kind === "pinball" ? b.drops : -1).toBe(0);
  });

  it("ends every flight under the flight clock, and its first lights a piece", () => {
    const clock = DEFAULT_CONFIG.pinballFlightBeats * ticksPerBeat(DEFAULT_CONFIG);
    expect(flights.length).toBeGreaterThan(0);
    for (const f of flights) expect(f.ticks).toBeLessThan(clock);
    expect(flights[0]?.lit).toBeGreaterThan(0);
  });
});
