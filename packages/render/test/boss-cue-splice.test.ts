import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type SpliceState,
  spliceWanted,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { type BossCue, bossCue } from "../src/boss-cue.js";
import { computeLayout, type Layout, tileCX, type ViewRole } from "../src/layout.js";
import { spliceFlightAt, spliceMouthY, spliceTopY } from "../src/splice-straws.js";
import type { TextBox } from "./canvas-stub.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  runFrames,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE SPLICE's one word, and the four things it will not say**
 * (`render/src/boss-cue-read-d.ts`).
 *
 * The queue said this boss *says nothing on the field at all*, and what the
 * reading it grew is mostly about is everything it still says nothing about.
 * The panel is two buttons on two seats — the strip is his and the only SUCK is
 * hers (`content/src/control-sets-table.ts`) — and the split crosses the other
 * way: she is shown the tangle, the numbers and the clock, and no cannon at all
 * (`showsSpliceTangle`, `showsCannon`). So *which mouth* is her sentence to say
 * and *I am on it* is his, and a field that marked either of them would be the
 * fight played for the pair.
 *
 * What is left is the maw standing busy. A suck while a number is already
 * coming down is dropped (`sim/splice-round.ts`), so for `spliceFeedBeats` her
 * one button does nothing, and the film was built around a pair pressing again
 * because the first press looked as though it had failed. `WAIT`, in THE
 * STARE's `STILL`, on the number itself.
 *
 * The cases below hold three things a helpful lane would break: that the word
 * stands where the picture draws the token and not on the mouth it is coming to
 * — a frame there traces the straw for her, which is the whole fight — that the
 * pilot is told nothing at any point of any round, and that nothing is ever
 * said about a clock only she can see, however few beats are left on it.
 *
 * The reading is asked directly, as `boss-cue-mirror.test.ts` asks THE
 * MIRROR's; the states are set rather than played into, because the flight, the
 * verdict and the clock are all proved in `sim/test/splice.test.ts`. The last
 * case runs real frames, so a word that was read and never painted — or painted
 * on the wrong glass — is still a failure.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const LAYOUT: Record<ViewRole, Layout> = {
  p1: computeLayout(VIEWPORT, CFG, "p1"),
  p2: computeLayout(VIEWPORT, CFG, "p2"),
  test: computeLayout(VIEWPORT, CFG, "test"),
};

function opened(): { world: World; s: SpliceState } {
  const world = createWorld(CFG, 3);
  const index = waveWith("splice");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  step(world, []);
  const s = world.boss;
  if (s === null || s.kind !== "splice") throw new Error("the splice wave installed no splice");
  return { world, s };
}

function cue(world: World, role: ViewRole, beatPhase = 0): BossCue | null {
  const l = LAYOUT[role];
  return bossCue(l, world, beatPhase, () => l.hullY);
}

/** A number of the right straw put in the air, as a suck would. */
function feeding(world: World, s: SpliceState): number {
  const straw = spliceWanted(s);
  s.feedFrom = straw;
  s.feedBeat = world.beat;
  return straw;
}

describe("THE SPLICE's word", () => {
  it("says nothing while the maw is free, whoever is under whichever mouth", () => {
    const { world, s } = opened();
    expect(s.feedFrom).toBe(-1);
    for (const col of s.entranceCols) {
      world.cannonCol = col;
      expect(cue(world, "p1"), `cannon in ${col}`).toBeNull();
      expect(cue(world, "p2"), `cannon in ${col}`).toBeNull();
    }
    // Off every mouth, which is the other half of the same silence: a word that
    // went out only while he was under one would tell her where he is.
    world.cannonCol = s.entranceCols.includes(0) ? 1 : 0;
    expect(cue(world, "p1")).toBeNull();
    expect(cue(world, "p2")).toBeNull();
  });

  it("asks the seat holding the maw to WAIT while a number is coming down", () => {
    const { world, s } = opened();
    feeding(world, s);
    const hers = cue(world, "p2");
    expect(hers?.word).toBe("WAIT");
    // The fifth kind — the one the simulation can tell was not done — and not
    // the word, because this stillness has an end she can see coming.
    expect(hers?.kind).toBe("STILL");
    expect(hers?.seat).toBe(2);
  });

  it("stands on the number and not on the mouth it is coming to", () => {
    const { world, s } = opened();
    const straw = feeding(world, s);
    for (const phase of [0, 0.5, 1, 1.5]) {
      const at = spliceFlightAt(LAYOUT.p2, CFG, s, world.beat + phase);
      const c = cue(world, "p2", phase);
      expect({ phase, x: c?.x, y: c?.y }).toEqual({ phase, x: at?.x, y: at?.y });
    }
    // And on the beat the feed leaves, the mark is on the numbered top end it
    // came out of and a whole field away from the mouth: a frame at the
    // entrance would trace the straw to its end for her from the first beat of
    // the flight, and tracing it is the fight.
    const start = cue(world, "p2");
    expect(start?.x).toBe(tileCX(LAYOUT.p2, s.topCols[s.topOf[straw] ?? 0] ?? 0));
    expect(start?.y).toBe(spliceTopY(LAYOUT.p2, CFG));
    expect(start?.y).toBeLessThan(spliceMouthY(LAYOUT.p2, CFG) - LAYOUT.p2.tile);
  });

  it("says nothing to the pilot at any point of the flight, on any straw", () => {
    const { world, s } = opened();
    for (let straw = 0; straw < s.entranceCols.length; straw++) {
      s.feedFrom = straw;
      s.feedBeat = world.beat;
      world.cannonCol = s.entranceCols[straw] ?? 0;
      for (const phase of [0, 0.5, 1, 1.5]) {
        expect(cue(world, "p1", phase), `straw ${straw} at ${phase}`).toBeNull();
      }
    }
  });

  it("says nothing about the clock, with one beat left on it or none", () => {
    const { world, s } = opened();
    const beats = s.rounds[s.round]?.beats ?? 0;
    for (const spent of [beats - 1, beats]) {
      s.roundBeat = world.beat - spent;
      expect(cue(world, "p1"), `${spent} spent`).toBeNull();
      expect(cue(world, "p2"), `${spent} spent`).toBeNull();
    }
  });

  it("says nothing over a round already won, or a verdict just landed", () => {
    const { world, s } = opened();
    s.passBeat = world.beat;
    s.fed = s.topOf.length;
    expect(cue(world, "p2")).toBeNull();
    s.passBeat = -1;
    s.verdict = -1;
    s.verdictBeat = world.beat;
    s.verdictStraw = 0;
    expect(cue(world, "p2")).toBeNull();
  });

  it("draws the word on her glass and on no other, through a real suck", () => {
    const said = (role: ViewRole): string[] => {
      const { world, s } = opened();
      const col = s.entranceCols[spliceWanted(s)] ?? world.cannonCol;
      const texts: TextBox[] = [];
      runFrames(world, role, TPB, {
        every: 3,
        onCanvas: (c) => {
          c.texts = texts;
        },
        onTick: (tick, w) => {
          // The pair's own two presses, a tick apart: the cannon under the
          // mouth she named, and then her maw. Both are ordinary commands —
          // the suck is `intake` from player 2, which is the whole finding of
          // this lane (`content/src/control-command.ts`).
          if (tick === 1) {
            step(w, [{ tick: w.tick, player: 1, command: { kind: "cannonCol", col } }]);
            return;
          }
          if (tick === 2) {
            step(w, [{ tick: w.tick, player: 2, command: { kind: "intake" } }]);
            return;
          }
          step(w, []);
        },
      });
      return texts.map((t) => t.text);
    };
    const hers = said("p2");
    expect(hers).toContain("WAIT");
    expect(hers).toContain("STILL");
    expect(said("p1")).not.toContain("WAIT");
  });
});
