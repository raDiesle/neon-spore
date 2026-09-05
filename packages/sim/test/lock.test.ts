import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  lockedBody,
  NO_GRIP,
  type SimConfig,
  type SpawnEntry,
  step,
  type TimedCommand,
  ticksPerBeat,
} from "../src/index.js";

/**
 * THE LOCK: player 1's hand on a body aims every shot at it, from whatever
 * column the cannon is standing in, and letting go makes the bolt dumb again.
 *
 * The tests below are the sentence in four halves — that a locked shot really
 * does land in a column it was not fired up, that an unlocked one really does
 * not, that the two bodies a lock must refuse are refused, and that the hand
 * lifting is felt by a shot already in the air.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);

const grip = (tick: number, player: 1 | 2, id: number): TimedCommand => ({
  tick,
  player,
  command: { kind: "grip", id },
});
const cannon = (tick: number, col: number): TimedCommand => ({
  tick,
  player: 1,
  command: { kind: "cannonCol", col },
});
const fire = (tick: number, color: "red" | "cyan"): TimedCommand => ({
  tick,
  player: 2,
  command: { kind: "fire", color },
});

function world(queue: SpawnEntry[], cfg: SimConfig = CFG) {
  return createWorld({ ...cfg }, 0, queue);
}

function play(w: ReturnType<typeof world>, beats: number, inputs: TimedCommand[] = []): void {
  const byTick = new Map<number, TimedCommand[]>();
  for (const i of inputs) byTick.set(i.tick, [...(byTick.get(i.tick) ?? []), i]);
  const until = w.tick + TPB * beats;
  while (w.tick < until) step(w, byTick.get(w.tick) ?? []);
}

/**
 * One red slick in column 8, and a cannon standing at the other end of the
 * field. Seven columns apart is the whole point: nothing about an ordinary
 * shot fired from column 1 has ever reached column 8.
 */
const FAR: SpawnEntry[] = [{ beat: 0, col: 8, kind: "slick", color: "red" }];
const AWAY = 1;

/** The run above, with the hand and the shot the caller asks for. */
function run(inputs: TimedCommand[], queue: SpawnEntry[] = FAR) {
  const w = world(queue);
  play(w, 6, [cannon(0, AWAY), ...inputs]);
  return w;
}

describe("a shot with nobody holding anything", () => {
  it("goes straight up its own column and leaves the body alone", () => {
    const w = run([fire(TPB, "red")]);
    expect(w.creatures).toHaveLength(1);
  });
});

describe("player 1's hand on a body", () => {
  it("is the lock, and the body is named by it", () => {
    const w = world(FAR);
    play(w, 2, [grip(TPB, 1, 1)]);
    expect(lockedBody(w)?.id).toBe(1);
  });

  it("brings a shot fired seven columns away into the body", () => {
    const w = run([grip(TPB, 1, 1), fire(TPB * 2, "red")]);
    expect(w.creatures).toHaveLength(0);
  });

  it("still leaves the colour to be agreed: a wrong one arrives and bounces", () => {
    const w = run([grip(TPB, 1, 1), fire(TPB * 2, "cyan")]);
    expect(w.creatures).toHaveLength(1);
  });

  it("aims the bolt sideways while it flies, and says which way", () => {
    const w = world(FAR);
    play(w, 2, [cannon(0, AWAY), grip(TPB, 1, 1)]);
    play(w, 0.2, [fire(w.tick, "red")]);
    const b = w.bullets[0];
    if (!b) throw new Error("no shot is in the air");
    // Left of the muzzle it is not: the body is to the right of column 1.
    expect(b.col * 1000 + b.driftMilli).toBeGreaterThan(AWAY * 1000);
    expect(b.aimMilli).toBeGreaterThan(0);
  });
});

describe("the promise the frame makes", () => {
  /**
   * **Every column against every column.** The mark drawn round a locked body
   * says a shot will land on it, and the one thing that could quietly stop
   * being true is the geometry: a bolt that has to cross ten columns in the two
   * tiles left between it and the body. There is no cap on how fast it slides
   * for exactly that reason (`lock.ts`), and this is the test that says so —
   * a hundred and twenty-one openings, and the field is empty in all of them.
   */
  it("lands from any column on a body in any other", () => {
    const missed: string[] = [];
    for (let from = 0; from < CFG.cols; from++) {
      for (let at = 0; at < CFG.cols; at++) {
        const w = world([{ beat: 0, col: at, kind: "slick", color: "red" }]);
        play(w, 6, [cannon(0, from), grip(TPB, 1, 1), fire(TPB * 2, "red")]);
        if (w.creatures.length > 0) missed.push(`${from} -> ${at}`);
      }
    }
    expect(missed).toEqual([]);
  });

  it("holds for a lance too, which is half the speed and pierces", () => {
    const w = world([{ beat: 0, col: 9, kind: "slick", color: "red" }], {
      ...CFG,
      lancePrimeBeats: 1,
    });
    play(w, 8, [
      cannon(0, 0),
      grip(TPB, 1, 1),
      { tick: TPB, player: 1, command: { kind: "prime", on: true } },
      fire(TPB * 3, "red"),
    ]);
    expect(w.creatures).toHaveLength(0);
  });
});

describe("what the lock refuses", () => {
  it("a rock — it cannot be shot, so a lock on one would eat every bolt", () => {
    const rock: SpawnEntry[] = [{ beat: 0, col: 8, kind: "meteor", color: null }];
    const w = world(rock);
    play(w, 2, [grip(TPB, 1, 1)]);
    expect(lockedBody(w)).toBeUndefined();
  });

  it("a ghost — its column is the secret and player 1 is the seat kept from it", () => {
    const ghost: SpawnEntry[] = [{ beat: 0, col: 8, kind: "ghost", color: "red" }];
    const w = world(ghost);
    play(w, 2, [grip(TPB, 1, 1)]);
    expect(lockedBody(w)).toBeUndefined();
  });

  it("player 2's hand — the seat that aims is the seat that may lock", () => {
    const w = world(FAR);
    play(w, 2, [grip(TPB, 2, 1)]);
    expect(lockedBody(w)).toBeUndefined();
    expect(run([grip(TPB, 2, 1), fire(TPB * 2, "red")]).creatures).toHaveLength(1);
  });
});

describe("letting go", () => {
  it("leaves a shot already in the air going straight up from where it got to", () => {
    const w = world(FAR);
    play(w, 2, [cannon(0, AWAY), grip(TPB, 1, 1)]);
    play(w, 0.2, [fire(w.tick, "red")]);
    play(w, 0.1, [grip(w.tick, 1, NO_GRIP)]);
    const b = w.bullets[0];
    if (!b) throw new Error("the shot went before the hand did");
    expect(b.aimMilli).toBe(0);
    const held = b.col;
    play(w, 0.2);
    // It carries on up the column it had reached; it does not snap back.
    expect(w.bullets[0]?.col ?? held).toBe(held);
    expect(w.creatures).toHaveLength(1);
  });
});

describe("the fingerprint", () => {
  it("notices a shot that is steering", () => {
    const straight = run([fire(TPB, "red")], [{ beat: 0, col: 8, kind: "bulb", color: "cyan" }]);
    const steering = run(
      [grip(TPB, 1, 1), fire(TPB * 2, "red")],
      [{ beat: 0, col: 8, kind: "bulb", color: "cyan" }],
    );
    expect(hashWorld(steering)).not.toBe(hashWorld(straight));
  });
});
