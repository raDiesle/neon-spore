import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  magnetPoleColor,
  type SimConfig,
  type SpawnEntry,
  step,
  type TimedCommand,
  ticksPerBeat,
} from "../src/index.js";

/**
 * THE MAGNET: a body that cannot be answered from the column it is standing
 * in, and the tests are that sentence taken apart.
 *
 * A shot up its own column meets the plate and does nothing. A shot player 1
 * has locked from any other column climbs, turns level with the body and comes
 * in horizontally under the plate's edge, and lands. Which pole it meets is
 * which side it came from, and which pole it meets is which trigger it has to
 * be — so the same bolt from the other side of the field is the wrong colour
 * without a word of the wave changing.
 *
 * The fingerprint is compared between two runs in one process rather than
 * pinned as a constant: two phones on the same build is the property lockstep
 * needs, and a pinned number is a number somebody re-pins the day a real
 * regression moves it (docs/decisions.md #19).
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

/** One red magnet in the middle of the field: red on its left pole, cyan on
 * its right. It falls a row a beat like a slick. */
const ONE: SpawnEntry[] = [{ beat: 0, col: 5, kind: "magnet", color: "red" }];

/** `world.events` is emptied every tick, so a run that wants to say *this
 * happened* has to keep them as it goes. */
function play(queue: SpawnEntry[], inputs: TimedCommand[], beats = 6) {
  const w = createWorld({ ...CFG }, 0, queue);
  const byTick = new Map<number, TimedCommand[]>();
  for (const i of inputs) byTick.set(i.tick, [...(byTick.get(i.tick) ?? []), i]);
  const until = w.tick + TPB * beats;
  const said: string[] = [];
  while (w.tick < until) {
    step(w, byTick.get(w.tick) ?? []);
    for (const e of w.events) said.push(e.type);
  }
  return { w, said };
}

describe("the plate under it", () => {
  it("turns away a shot fired up its own column, even with a hand on the body", () => {
    const { w } = play(ONE, [cannon(0, 5), grip(TPB, 1, 1), fire(TPB * 2, "red")]);
    expect(w.creatures).toHaveLength(1);
  });

  it("says so as its own event, and never as a colour miss", () => {
    const { w, said } = play(ONE, [cannon(0, 5), grip(TPB, 1, 1), fire(TPB * 2, "red")]);
    expect(said).toContain("magnetPlate");
    // The ammunition was right and the bearing was not, so nothing is booked
    // against the seat holding the triggers (`magnet.ts`).
    expect(w.balance.colorMisses).toBe(0);
    expect(said).not.toContain("reject");
  });

  it("turns away an unaimed shot too, because an unaimed shot climbs straight", () => {
    const { w } = play(ONE, [cannon(0, 5), fire(TPB * 2, "red")]);
    expect(w.creatures).toHaveLength(1);
  });
});

describe("a bolt bent in from the side", () => {
  it("reaches the pole it arrives at and ends the body", () => {
    // Four lanes to the left, and the body is still near the top of the field:
    // the slant a bolt arrives at is what is left sideways over what is left
    // upward, so a body this high has to be taken from further out than one
    // about to land. That is `magnetSlantMilli` doing its whole job.
    const { w } = play(ONE, [cannon(0, 1), grip(TPB, 1, 1), fire(TPB * 2, "red")]);
    expect(w.creatures).toHaveLength(0);
  });

  /**
   * **One lane over is enough, and it is enough at any height.** The path is a
   * corner rather than a diagonal, so how far the bolt has to climb before it
   * turns has nothing to do with whether it gets past the plate — only whether
   * it turns at all does. A pilot standing anywhere but the magnet's own column
   * is answering it.
   */
  it("gets in from the lane next door, high or low", () => {
    expect(
      play(ONE, [cannon(0, 4), grip(TPB, 1, 1), fire(TPB * 2, "red")]).w.creatures,
    ).toHaveLength(0);
    expect(
      play(ONE, [cannon(0, 4), grip(TPB, 1, 1), fire(TPB * 5, "red")]).w.creatures,
    ).toHaveLength(0);
  });

  it("meets the other pole from the other side, and the colour is the other one", () => {
    const { w: right } = play(ONE, [cannon(0, 9), grip(TPB, 1, 1), fire(TPB * 2, "cyan")]);
    expect(right.creatures).toHaveLength(0);
    const { w: wrong } = play(ONE, [cannon(0, 9), grip(TPB, 1, 1), fire(TPB * 2, "red")]);
    expect(wrong.creatures).toHaveLength(1);
  });

  it("pairs each side with a colour in one place, and both sides are answerable", () => {
    const body = play(ONE, [], 1).w.creatures[0];
    if (!body) throw new Error("nothing arrived");
    expect(magnetPoleColor(body, true)).toBe("red");
    expect(magnetPoleColor(body, false)).toBe("cyan");
  });
});

describe("whose hand it is", () => {
  it("answers player 1's, which is the seat holding the cannon", () => {
    const { w } = play(ONE, [cannon(0, 1), grip(TPB, 1, 1), fire(TPB * 2, "red")]);
    expect(w.creatures).toHaveLength(0);
  });

  it("does nothing at all under player 2's — the press is not refused, it is empty", () => {
    const { w } = play(ONE, [cannon(0, 1), grip(TPB, 2, 1), fire(TPB * 2, "red")]);
    expect(w.gripP2).toBe(0);
    expect(w.creatures).toHaveLength(1);
  });
});

describe("the run itself", () => {
  it("fingerprints the same twice", () => {
    const inputs = [cannon(0, 1), grip(TPB, 1, 1), fire(TPB * 2, "red")];
    expect(hashWorld(play(ONE, inputs).w)).toBe(hashWorld(play(ONE, inputs).w));
  });
});
