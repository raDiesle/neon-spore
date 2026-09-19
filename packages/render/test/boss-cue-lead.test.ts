import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type LeadState,
  leadBoss,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import { leadAskedAngle } from "../src/lead-shape.js";
import { leadWord } from "../src/lead-word.js";
import type { TextBox } from "./canvas-stub.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  runFrames,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE LEAD's word on the stalk, and the lean it had never drawn**
 * (`render/src/lead-word.ts`, `lead-shape.ts`).
 *
 * The fight shipped answered entirely on the panel, and the queue's complaint
 * was that a boss with four movements asks for one gesture in all of them. The
 * still is where that changed: with one segment left the body is unshootable
 * and no bolt is registered against it, so a thumb on the stalk steers nothing
 * and the only thing it has to give is time (`sim/lead-hand.ts`). A handle
 * nobody is told about is a handle nobody takes, so these pin the telling.
 *
 * **Both words are the navigator's**, and that is the whole of the first
 * describe. Her screen stands the stalk over the body's own column; his stands
 * it in the middle of the field whatever the column is, so on his screen it is
 * a readout and a word pinned to it would name a place that is nowhere
 * (`view-role-clocks.ts`, `lead-shape.ts`). The same argument is why the ring
 * is hers.
 *
 * **`BURN` is deliberately the pass's own word.** Her hand is not doing
 * anything to the body; it is buying the beam the beats it needs to fill, and
 * the beam is his. So she says the word she is about to say again out loud.
 *
 * **And the silence is the still she has already spent**: once the stalk has
 * been let go of or torn free it passes on the next beat whatever anyone does,
 * and a verb the game is about to refuse is worse than no verb
 * (`boss-cue.ts`).
 *
 * The second describe is the lean. `settleLean` has always written the pass's
 * way into `s.lean` on the last beat of the still and §11.29 has always said
 * the lean gives that pass away — the angle was pinned upright through every
 * still, so the one beat of warning the fight promises the pilot was never
 * drawn. These are the two halves of that being one field read where it is
 * written: the last beat of an unheld still, and every beat of a held one.
 *
 * The states are set rather than played into, as `boss-cue-surge.test.ts` sets
 * THE SURGE's: the still, the hold, the tear and the pass are proved in
 * `sim/test/lead-hold.test.ts`. The last case runs real frames, to prove the
 * word the reading chose is the word a canvas is handed.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);

function paced(): { world: World; s: LeadState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("lead");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB; i++) step(world, []);
  const s = leadBoss(world);
  if (s === null) throw new Error("the lead wave stood no body");
  return { world, s };
}

/** The body stopped dead with the stalk on offer, the way the fourth hit leaves it. */
function still(): { world: World; s: LeadState } {
  const { world, s } = paced();
  s.segments = 1;
  s.stillBeat = world.beat;
  s.lean = 0;
  return { world, s };
}

describe("THE LEAD's word", () => {
  it("says nothing at all while the body is walking, which is the panel's half of the fight", () => {
    const { s } = paced();
    expect(leadWord(s)).toBeNull();
  });

  it("offers the stalk by its own gesture's name while the still may be taken", () => {
    const { s } = still();
    expect(leadWord(s)).toEqual({ kind: "HOLD", word: "HOLD" });
  });

  it("says the beam's word under her thumb, because that is what her hand is buying", () => {
    const { world, s } = still();
    s.heldBeat = world.beat;
    expect(leadWord(s)).toEqual({ kind: "HOLD", word: "BURN" });
  });

  it("goes quiet on a still already spent, rather than name a state it is leaving", () => {
    const { world, s } = still();
    s.freeBeat = world.beat;
    expect(leadWord(s)).toBeNull();
  });

  it("is the navigator's on the field, and the pilot is shown no stalk to stand it on", () => {
    const drawn = (role: ViewRole, set: (w: World, s: LeadState) => void): string[] => {
      const { world, s } = still();
      set(world, s);
      const texts: TextBox[] = [];
      runFrames(world, role, 3, {
        every: 3,
        onCanvas: (c) => {
          c.texts = texts;
        },
      });
      return texts.map((t) => t.text);
    };
    const offered = (): void => {};
    const held = (w: World, s: LeadState): void => {
      s.heldBeat = w.beat;
    };
    // The offered stalk says `HOLD` once and not twice: the kind line goes when
    // it is the verb said over again, which is the same economy THE SURGE's
    // charge gets (`boss-cue-text.ts`). Under her thumb the two part, and the
    // grammar line above `BURN` is the gesture still being a hold.
    expect(drawn("p2", offered)).toContain("HOLD");
    expect(drawn("p2", offered).filter((t) => t === "HOLD")).toHaveLength(1);
    expect(drawn("p2", held)).toEqual(["BURN", "HOLD", ...drawn("p1", held)]);
    // And the pilot is shown neither, on a stalk that is a readout on his glass.
    expect(drawn("p1", offered)).not.toContain("HOLD");
    expect(drawn("p1", held)).not.toContain("BURN");
  });
});

describe("THE LEAD's lean through the still", () => {
  it("stands upright while the still is young and nothing holds it", () => {
    const { s } = still();
    expect(leadAskedAngle(s, "p1")).toBe(0);
  });

  it("gives the pass away on the beat the simulation says it does", () => {
    const { s } = still();
    // What `settleLean` writes on the last beat of the still, and what §11.29
    // has always promised the pilot he would be shown.
    s.lean = 1;
    expect(leadAskedAngle(s, "p1")).not.toBe(0);
  });

  it("is still the pilot's alone: her screen has the column and does not need it", () => {
    const { s } = still();
    s.lean = 1;
    expect(leadAskedAngle(s, "p2")).toBe(0);
  });
});
