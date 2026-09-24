import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  CAIRN_COLS,
  type CairnState,
  type Creature,
  cairnState,
  createWorld,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { type BossCue, bossCue } from "../src/boss-cue.js";
import { computeLayout, type Layout, tileCX, tileCY, type ViewRole } from "../src/layout.js";
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
 * **THE CAIRN's one word, and the five silences round it**
 * (`render/src/boss-cue-read-q.ts`).
 *
 * The queue said this boss *says nothing on the field at all*, and it was right:
 * it fell through `cuesOf`'s default. What it had never said is the gesture it
 * is **named after** — nothing on either band reaches the pile, so the only
 * answer to it is a grip carried sideways across the stack, and a pair meeting
 * it with no word would spend the opening firing at a body a bolt goes straight
 * past (`sim/shot-reach.ts`).
 *
 * **Most of this file is about the clock, which is the whole difficulty.** The
 * pile lets a rock go by itself after `cairnShedBeats` standing whole, into a
 * column the rng drew, and that column — its lane and the ring shaking on the
 * stone that is going — is drawn on **player 1's screen alone**
 * (`showsCairnSettle`). The obviously useful word is *pull now, it is about to
 * choose for you*, and it is forbidden: a word that arrived, hurried or changed
 * as the patience ran out would be the pilot's gauge read out on the
 * navigator's glass by its own arrival, which is THE LEAD's finding one boss on
 * (`boss-cue-clocks.test.ts`). So the cases below assert that the word is the
 * **same word** at a fresh clock and one beat short of the shed, on both
 * screens, and that its place never moves with `settleCol`. Those are the cases
 * that would catch a lane making this boss "clearer" by taking its subject away
 * (`decisions.md` #34, *reconsider if a cue starts carrying a column, a colour
 * or a count*).
 *
 * **The seat is `null`, and that is the claim the real frames prove.** The carry
 * is either seat's (`grip-push.ts`) and both are drawn the stack whole, so
 * *the right seat* here is both of them — and the frame case is the sharper one
 * for it: the two screens are handed the identical word though only one of them
 * is shown the clock it would otherwise be timed on. The screen that must never
 * carry it is a screen with no pile on it, and the last case is that.
 *
 * The states are set rather than played into, as in `boss-cue-candle.test.ts`:
 * the pull, the shed and the reset are proved in `sim/test/cairn*.test.ts`.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const LAYOUT: Record<ViewRole, Layout> = {
  p1: computeLayout(VIEWPORT, CFG, "p1"),
  p2: computeLayout(VIEWPORT, CFG, "p2"),
  test: computeLayout(VIEWPORT, CFG, "test"),
};

function opened(beats = 1): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("cairn");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < beats * TPB; i++) step(world, []);
  return world;
}

function cue(world: World, role: ViewRole): BossCue | null {
  const l = LAYOUT[role];
  return bossCue(l, world, 0, () => l.hullY);
}

function word(world: World, role: ViewRole): string | null {
  return cue(world, role)?.word ?? null;
}

/** The boss this wave installed. */
function installed(world: World): CairnState {
  const s = cairnState(world);
  if (s === null) throw new Error("the cairn wave installed no pile");
  return s;
}

/** The stack itself, which is what the mark stands on. */
function pile(world: World, s: CairnState): Creature {
  const body = world.creatures.find((c) => c.id === s.creatureId);
  if (body === undefined) throw new Error("the pile is gone");
  return body;
}

describe("THE CAIRN", () => {
  it("asks either seat for the pull, which is the gesture it is named after", () => {
    const world = opened();
    const s = installed(world);
    const body = pile(world, s);
    for (const role of ["p1", "p2"] as const) {
      const it = cue(world, role);
      expect(it?.word).toBe("PULL");
      expect(it?.kind).toBe("CARRY");
      // The stack's own centre, `cairn-units.ts`'s spelling of it, so the frame
      // stands on the stones rather than beside them.
      expect(it?.x).toBe(tileCX(LAYOUT[role], body.col + (CAIRN_COLS - 1) / 2));
      expect(it?.y).toBe(tileCY(LAYOUT[role], body.row));
    }
    // Either seat's, because the carry is (`grip-push.ts`).
    expect(cue(world, "p1")?.seat).toBeNull();
  });

  it("says the same word at a fresh clock as one beat short of the shed", () => {
    const world = opened();
    const s = installed(world);
    const fresh = { p1: cue(world, "p1"), p2: cue(world, "p2") };
    s.leftBeat = world.waveBeat - (CFG.cairnShedBeats - 1);
    // The pilot is shown the lane filling and the stone shaking; she is shown
    // neither (`showsCairnSettle`). A word that changed here would be his gauge,
    // and on her screen its arrival alone would be the whole of it.
    expect(cue(world, "p1")).toEqual(fresh.p1);
    expect(cue(world, "p2")).toEqual(fresh.p2);
  });

  it("never stands on the lane the pile chose, whichever one it is", () => {
    const world = opened();
    const s = installed(world);
    const body = pile(world, s);
    const mid = tileCX(LAYOUT.p2, body.col + (CAIRN_COLS - 1) / 2);
    for (let i = 0; i < CAIRN_COLS - 1; i++) {
      s.settleCol = body.col + i;
      // The column is the pair's second sentence, said across the voice delay,
      // and #34 forbids a cue carrying one at all.
      expect(cue(world, "p2")?.x).toBe(mid);
      expect(cue(world, "p1")?.x).toBe(mid);
    }
  });

  it("goes quiet for the beat of quiet a carry costs, on both screens", () => {
    const world = opened();
    const s = installed(world);
    pile(world, s).pushBeat = world.beat;
    // THE CURTAIN's gate on the same gesture (`carryIsReady`): a word on a beat
    // the game will refuse is worse than none. The silence leaks nothing — a
    // rock has just left, which both screens saw.
    expect(word(world, "p1")).toBeNull();
    expect(word(world, "p2")).toBeNull();
  });

  it("says nothing once the last unit has come away", () => {
    const world = opened();
    const s = installed(world);
    s.units = 0;
    expect(word(world, "p1")).toBeNull();
    expect(word(world, "p2")).toBeNull();
    // And nothing where the body has already left `world.creatures` with it.
    s.units = 3;
    world.creatures = world.creatures.filter((c) => c.id !== s.creatureId);
    expect(word(world, "p1")).toBeNull();
    expect(word(world, "p2")).toBeNull();
  });

  it("draws the word on both screens, and on neither once the pile is gone", () => {
    const drawn = (role: ViewRole, set: (world: World, s: CairnState) => void): string[] => {
      const world = opened();
      set(world, installed(world));
      const texts: TextBox[] = [];
      runFrames(world, role, 3, {
        every: 3,
        onCanvas: (c) => {
          c.texts = texts;
        },
      });
      return texts.map((t) => t.text);
    };
    const standing = (): void => {};
    for (const role of ["p1", "p2"] as const) {
      expect(drawn(role, standing)).toContain("PULL");
      expect(drawn(role, standing)).not.toContain("CARRY");
    }
    // The clock is on his screen and not on hers, and the word is the same on
    // both regardless: the frames are where that stops being an argument.
    const nearly = (world: World, s: CairnState): void => {
      s.leftBeat = world.waveBeat - (CFG.cairnShedBeats - 1);
    };
    expect(drawn("p2", nearly)).toContain("PULL");
    expect(drawn("p1", nearly)).toContain("PULL");
    const emptied = (_world: World, s: CairnState): void => {
      s.units = 0;
    };
    expect(drawn("p1", emptied)).not.toContain("PULL");
    expect(drawn("p2", emptied)).not.toContain("PULL");
  });
});
