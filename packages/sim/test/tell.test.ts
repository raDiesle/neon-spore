import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  roundSpent,
  type SimConfig,
  startWave,
  step,
  TELL_BEATS,
  TELL_THROWS,
  type TellRung,
  type TellState,
  type TellThrow,
  type TimedCommand,
  tellBeatenBy,
  tellCurrent,
  tellHolds,
  tellIndex,
  tellResolve,
  tellRingIsBalanced,
  tellRound,
  tellShivers,
  tellThrowAt,
  tellWindow,
  ticksPerBeat,
  type World,
} from "../src/index.js";

/**
 * THE TELL: the ring, the split tell, and the ladder that starts again.
 *
 * Most of this file is about the two decisions that make the round something
 * other than a coin toss — the boss answering the pair's last throw, and the
 * seat split that means one throw takes two people — plus the three rules the
 * owner settled on 8 September 2026: a double press loses the rung, a bolt in
 * the wrong colour turns a win into a stand-off and leaves a loss alone, and a
 * lost rung goes back to the foot of the same ladder rather than a new one.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const WAVE = 4;
/** Two rungs, so a ladder can be climbed inside a test and still be a ladder. */
const RUNGS: TellRung[] = [{ beats: 3 }, { beats: 3, answers: true }];

function open(rungs: TellRung[] = RUNGS, beats = 120, seed = 5): World {
  const world = createWorld(CFG, seed);
  startWave(world, WAVE, [], [], { kind: "tell", rungs, beats });
  return world;
}

function round(world: World): TellState {
  const t = tellRound(world);
  if (t === null) throw new Error("no round running");
  return t;
}

function cmd(world: World, player: 1 | 2, command: TimedCommand["command"]): TimedCommand {
  return { tick: world.tick, player, command };
}

function run(world: World, ticks: number, bot: (w: World) => TimedCommand[] = () => []): void {
  for (let i = 0; i < ticks; i++) step(world, bot(world));
}

/** Tick until the round's phase is one of these, or the cap runs out. */
function until(world: World, phase: TellState["phase"], cap = 60 * TPB): void {
  for (let i = 0; i < cap && round(world).phase !== phase; i++) step(world, []);
}

/** The press that throws this, from the seat that owns it. */
function throwIt(world: World, t: TellThrow): TimedCommand {
  if (t === "plate") return cmd(world, 1, { kind: "guard" });
  if (t === "maw") return cmd(world, 1, { kind: "intake" });
  return cmd(world, 2, { kind: "fire", color: "red" });
}

/** Throw the thing that beats what the boss is about to. A pair that talked. */
function beatIt(world: World): TimedCommand[] {
  const t = round(world);
  if (t.phase !== "tell" || t.thrown !== -1) return [];
  const theirs = tellThrowAt(t.bossThrow);
  if (theirs === null) return [];
  const ours = tellBeatenBy(theirs);
  // A bolt only lands in the boss's own colour, so the pair that can see the
  // skin says which one — which is the whole of player 2's half of the tell.
  if (ours === "bolt") {
    return [cmd(world, 2, { kind: "fire", color: t.bossColor === 1 ? "red" : "cyan" })];
  }
  return [throwIt(world, ours)];
}

describe("the ring", () => {
  it("is odd, and every throw beats one and loses to one", () => {
    expect(TELL_THROWS.length % 2, "an even ring has a throw that is simply better").toBe(1);
    expect(tellRingIsBalanced()).toBe(true);
  });

  it("beats the way the game's own physics does", () => {
    expect(TELL_BEATS.plate).toBe("bolt");
    expect(TELL_BEATS.bolt).toBe("maw");
    expect(TELL_BEATS.maw).toBe("plate");
  });

  it("calls a matching pair a stand-off and an unanswered window a loss", () => {
    const maw = tellIndex("maw");
    expect(tellResolve(maw, 0, maw, 1), "the same throw twice").toBe(2);
    expect(tellResolve(-1, 0, maw, 1), "nothing thrown").toBe(3);
  });

  /**
   * The owner's rule, and the only version that holds together: were a wrong
   * colour to excuse a loss, throwing the wrong one into PLATE would be better
   * than throwing the right one.
   */
  it("lets the wrong colour cost a win and never save a loss", () => {
    const bolt = tellIndex("bolt");
    expect(tellResolve(bolt, 1, tellIndex("maw"), 1), "right colour, winning throw").toBe(1);
    expect(tellResolve(bolt, 2, tellIndex("maw"), 1), "wrong colour, winning throw").toBe(2);
    expect(tellResolve(bolt, 2, tellIndex("plate"), 1), "wrong colour, losing throw").toBe(3);
  });
});

describe("reaching the round", () => {
  it("takes the field away and keeps the beat", () => {
    const world = open();
    expect(tellHolds(world)).toBe(true);
    const beat = world.beat;
    run(world, TPB * 3);
    expect(world.beat, "the metronome runs through a round").toBeGreaterThan(beat);
    expect(world.creatures, "nothing of the boss is on the field").toHaveLength(0);
  });

  it("refuses a wave that authored no ladder", () => {
    expect(() => open([], 40)).toThrow(/not a round/);
  });

  it("opens on a lead-in and then a window", () => {
    const world = open();
    expect(round(world).phase).toBe("lead");
    until(world, "tell");
    expect(round(world).phase).toBe("tell");
  });
});

describe("one throw, two seats", () => {
  it("gives the plate and the mouth to player 1 and the bolt to player 2", () => {
    const world = open();
    until(world, "tell");
    step(world, [cmd(world, 2, { kind: "guard" })]);
    expect(round(world).thrown, "player 2 has no plate").toBe(-1);
    step(world, [cmd(world, 1, { kind: "fire", color: "red" })]);
    expect(round(world).thrown, "player 1 has no bolt").toBe(-1);
    step(world, [cmd(world, 1, { kind: "guard" })]);
    expect(round(world).thrown).toBe(tellIndex("plate"));
  });

  it("throws nothing when both seats press inside the same window", () => {
    const world = open();
    until(world, "tell");
    step(world, [cmd(world, 1, { kind: "guard" })]);
    step(world, [cmd(world, 2, { kind: "fire", color: "red" })]);
    const t = round(world);
    expect(t.fumbled, "two thumbs at once").toBe(true);
    until(world, "reveal");
    expect(round(world).outcome, "a fumble loses the rung").toBe(3);
  });

  it("ignores the same seat pressing twice", () => {
    const world = open();
    until(world, "tell");
    step(world, [cmd(world, 1, { kind: "guard" })]);
    step(world, [cmd(world, 1, { kind: "intake" })]);
    const t = round(world);
    expect(t.fumbled).toBe(false);
    expect(t.thrown, "the press is committed").toBe(tellIndex("plate"));
  });
});

describe("the ladder", () => {
  it("climbs on a win and is climbed by a pair that talks", () => {
    const world = open();
    until(world, "tell");
    run(world, TPB * 40, beatIt);
    const t = round(world);
    expect(t.passed, "a pair that reads the tell gets up it").toBe(true);
    expect(t.lost).toBe(0);
  });

  it("goes back to the foot of the same ladder and takes the hull with it", () => {
    const world = open();
    const before = world.hullMilli;
    until(world, "tell");
    // Throw whatever loses, on purpose.
    const t = round(world);
    const theirs = tellThrowAt(t.bossThrow);
    if (theirs === null) throw new Error("the boss threw nothing");
    step(world, [throwIt(world, TELL_BEATS[theirs])]);
    until(world, "reveal");
    const after = round(world);
    expect(after.outcome).toBe(3);
    expect(after.rung, "back to the first rung").toBe(0);
    expect(after.lost).toBe(1);
    expect(world.hullMilli, "a lost rung costs the hull").toBeLessThan(before);
  });

  /**
   * The reason starting again is bearable: the rungs are copied in once and
   * never re-drawn, so the pair comes back through what it already knows.
   */
  it("does not re-draw the ladder when it starts again", () => {
    const world = open([{ beats: 4 }, { beats: 2, feint: true }]);
    const authored = round(world).rungs.map((r) => ({ ...r }));
    until(world, "tell");
    step(world, [throwIt(world, "maw")]);
    step(world, [throwIt(world, "plate")]);
    until(world, "reveal");
    expect(round(world).rungs).toEqual(authored);
  });

  it("ends on the ladder's own clock and breaks the hull for it", () => {
    const world = open(RUNGS, 12);
    until(world, "verdict");
    expect(round(world).passed).toBe(false);
    for (let i = 0; i < 40 * TPB && !roundSpent(world); i++) step(world, []);
    expect(roundSpent(world), "a spent round holds its picture").toBe(true);
  });
});

describe("what stops it being a coin toss", () => {
  it("answers the pair's last throw on a rung that says so", () => {
    const world = open([{ beats: 2 }, { beats: 2, answers: true }]);
    until(world, "tell");
    // Win the first rung with a known throw, then read what the second one
    // brings: it has to be the thing that would have beaten that throw.
    const first = round(world);
    const theirs = tellThrowAt(first.bossThrow);
    if (theirs === null) throw new Error("the boss threw nothing");
    const ours = tellBeatenBy(theirs);
    step(world, [throwIt(world, ours === "bolt" ? "bolt" : ours)]);
    if (ours === "bolt") {
      // Make it land: the colour is the second axis and a stand-off would
      // leave the rung standing rather than advancing it.
      round(world).thrownColor = round(world).bossColor;
    }
    until(world, "reveal");
    expect(round(world).outcome, "the pair won the first rung").toBe(1);
    until(world, "tell");
    const second = round(world);
    expect(tellThrowAt(second.bossThrow)).toBe(tellBeatenBy(ours));
  });

  it("shivers on the beat it changes its mind, and not before", () => {
    const world = open([{ beats: 3, feint: true }]);
    until(world, "tell");
    const t = round(world);
    expect(t.bossShown, "a feint shows something else first").not.toBe(t.bossThrow);
    const beats = tellWindow(tellCurrent(t), t.shorten);
    run(world, TPB * tellShivers(beats));
    expect(round(world).bossShown, "and tells the truth on the last beat").toBe(t.bossThrow);
  });

  it("shortens the next window after a stand-off", () => {
    const world = open([{ beats: 4 }]);
    until(world, "tell");
    const t = round(world);
    const theirs = tellThrowAt(t.bossThrow);
    if (theirs === null) throw new Error("the boss threw nothing");
    step(world, [throwIt(world, theirs)]);
    until(world, "reveal");
    expect(round(world).outcome, "the same throw twice").toBe(2);
    expect(round(world).shorten).toBe(1);
  });
});

/**
 * THE LAST RUNG: three throws, back to back, no guess in either of them.
 *
 * `docs/spec/bosses.md` 11.9 ends the ladder on a rung that is not a reading
 * test at all — the pair finding out whether it can say three words in four
 * seconds. What is worth asserting is the two things that make it one rung
 * rather than three: the exchanges are *consecutive*, with no reveal between
 * them, and the sentence is folded whole, so two right words and a wrong one
 * is a lost rung and not two thirds of a climb.
 */
describe("a rung of three throws", () => {
  const THREE: TellRung[] = [{ beats: 2, throws: 3 }];

  it("opens the next tell on the beat the last window closed, with no scene between", () => {
    const world = open(THREE);
    until(world, "tell");
    const seen: number[] = [];
    // Two windows' worth of beats, answering nothing: each is a loss, and the
    // phase has to still be `tell` at the end of the first two of them.
    for (let i = 0; i < 2; i++) {
      const at = round(world).at;
      seen.push(at);
      run(world, 2 * TPB + 1);
      expect(round(world).phase, `after exchange ${at + 1}`).toBe("tell");
      expect(round(world).at, "the next exchange opened").toBe(at + 1);
    }
    expect(seen).toEqual([0, 1]);
    // And the third closes the rung rather than opening a fourth.
    run(world, 2 * TPB + 1);
    expect(round(world).phase).toBe("reveal");
    expect(round(world).played).toHaveLength(3);
  });

  it("is climbed only by a pair that says all three words", () => {
    const world = open(THREE);
    until(world, "tell");
    run(world, 3 * (2 * TPB + 1), beatIt);
    const t = round(world);
    expect(
      t.played.map((e) => e.outcome),
      "three wins",
    ).toEqual([1, 1, 1]);
    expect(t.passed || t.rung > 0, "the ladder moved").toBe(true);
  });

  it("loses the whole rung for one word missed", () => {
    const world = open([...THREE, { beats: 3 }]);
    until(world, "tell");
    // The first two answered and the third left alone, driven off the round's
    // own exchange index rather than off a tick count — a window closes on a
    // beat boundary, so counting ticks would have the bot answering the third.
    run(world, 3 * (2 * TPB + 2), (w) => (round(w).at < 2 ? beatIt(w) : []));
    const t = round(world);
    expect(t.played.map((e) => e.outcome)).toEqual([1, 1, 3]);
    expect(t.rung, "back to the foot of the ladder").toBe(0);
    expect(t.lost).toBe(1);
  });

  it("plays the three scenes in turn rather than one", () => {
    const world = open(THREE);
    until(world, "tell");
    run(world, 3 * (2 * TPB + 1), beatIt);
    expect(round(world).phase).toBe("reveal");
    // The scalars render/ reads are the first exchange, then the second, then
    // the third — one scene a reveal, walked by the clock.
    const scenes: number[] = [];
    for (let i = 0; i < 3; i++) {
      scenes.push(round(world).at);
      const was = round(world).at;
      for (
        let t = 0;
        t < 4 * TPB && round(world).at === was && round(world).phase === "reveal";
        t++
      ) {
        step(world, []);
      }
    }
    expect(scenes).toEqual([0, 1, 2]);
  });

  it("refuses a rung that both feints and asks for three", () => {
    expect(() => open([{ beats: 2, feint: true, throws: 3 }])).toThrow(/feint/);
  });

  it("puts every exchange into the fingerprint, not only the one on screen", () => {
    const world = open(THREE);
    until(world, "tell");
    run(world, 2 * TPB + 1, beatIt);
    const before = hashWorld(world);
    const t = round(world);
    const first = t.played[0];
    if (first === undefined) throw new Error("no exchange played");
    first.outcome = first.outcome === 1 ? 3 : 1;
    expect(hashWorld(world), "an exchange nobody is looking at").not.toBe(before);
  });
});

describe("the fingerprint", () => {
  it("notices the throw nobody can see yet", () => {
    const world = open();
    until(world, "tell");
    const before = hashWorld(world);
    const t = round(world);
    t.bossThrow = (t.bossThrow + 1) % TELL_THROWS.length;
    expect(hashWorld(world)).not.toBe(before);
  });
});
