import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type RepriseState,
  repriseEchoing,
  repriseLeft,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { type BossCue, bossCue } from "../src/boss-cue.js";
import { computeLayout, type Layout, tileCX, type ViewRole } from "../src/layout.js";
import { repriseTearCenter } from "../src/reprise-draw.js";
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
 * **THE REPRISE's two words, and the silence that is the wave**
 * (`render/src/boss-cue-read-s.ts`).
 *
 * The queue said this boss says nothing on the field at all, and for once in
 * this family that was true: its own drawing calls no `drawCueText`, and the
 * reading fell through `cuesOf`'s default. What it had never said is that the
 * ordinary controls still answer **a screen with nothing on it** — which is the
 * whole encounter, and the one instinct a pair brings to it is to wait until
 * they can see something. One body on the hull fails the wave.
 *
 * **Every case below is really about the gate.** Both words stand for exactly
 * as long as `repriseEchoing`, and that is legal because the tear is drawn on
 * both seats with no `showsX` anywhere near it and is *shut to a seam* while a
 * stretch runs seen — so the word's arrival and its absence each say a thing
 * both screens are already shown. Nothing reads the count, the cursor or the
 * beat.
 *
 * **The two that would catch a later lane making this boss clearer** are the
 * last two. `MOVE` does not go out when the pilot is already in the column an
 * unseen body is falling down, because a word that vanished there would be a
 * mark made out of a body `unseen.ts` exists to keep off the frame; and both
 * words go out the beat the echo's last body is *sent*, with bodies nothing
 * drew still in the air, because a word that stayed up would announce one by
 * standing there.
 *
 * The first echo is played into — it opens on wave beat twelve with nobody
 * touching a control — and the beat it *shuts* is set, as in
 * `boss-cue-candle.test.ts`: a pair that presses nothing loses this wave to the
 * hull before the echo can spend itself, and `world` stops advancing there. The
 * clock is `content/test/scene-reprise.test.ts`'s to prove and it does (*seen
 * @18*, an unseen bulb taken at @20, the last of them on the hull at @33); what
 * is set here is exactly the three fields `closeEcho` writes.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const LAYOUT: Record<ViewRole, Layout> = {
  p1: computeLayout(VIEWPORT, CFG, "p1"),
  p2: computeLayout(VIEWPORT, CFG, "p2"),
  test: computeLayout(VIEWPORT, CFG, "test"),
};

function opened(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("reprise");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  return world;
}

/** Stepped until the field is what the case is about, or the case is a lie. */
function until(world: World, want: (w: World) => boolean, beats = 80): World {
  for (let i = 0; i < beats * TPB; i++) {
    if (want(world)) return world;
    step(world, []);
  }
  throw new Error("the reprise never reached that state");
}

function cue(world: World, role: ViewRole): BossCue | null {
  const l = LAYOUT[role];
  return bossCue(l, world, 0, () => l.hullY);
}

function word(world: World, role: ViewRole): string | null {
  return cue(world, role)?.word ?? null;
}

/**
 * The first echo, spent: exactly what `closeEcho` writes, over a field that
 * still holds the bodies it sent. Set rather than played into, for the reason
 * in the header.
 */
function shut(): World {
  const world = until(opened(), repriseEchoing);
  const s = installed(world);
  s.at = -1;
  s.cursor = 0;
  s.left = 0;
  return world;
}

function installed(world: World): RepriseState {
  const boss = world.boss;
  if (boss === null || boss.kind !== "reprise") throw new Error("the wave installed no reprise");
  return boss;
}

describe("THE REPRISE", () => {
  it("asks the pilot for the column and the navigator for the press, while the tear is open", () => {
    const world = until(opened(), repriseEchoing);
    expect(repriseLeft(world)).toBeGreaterThan(0);

    const his = cue(world, "p1");
    expect(his?.word).toBe("MOVE");
    expect(his?.kind).toBe("CARRY");
    expect(his?.seat).toBe(1);
    // On his own cannon, at the hull: the one strip in the game that picks a
    // column, and player 1's (`content/src/controls.ts`).
    expect(his?.x).toBe(tileCX(LAYOUT.p1, world.cannonCol));
    expect(his?.y).toBe(LAYOUT.p1.hullY);

    const hers = cue(world, "p2");
    expect(hers?.word).toBe("FIRE");
    expect(hers?.kind).toBe("PRESS");
    expect(hers?.seat).toBe(2);
    // On the tear, which hangs on the middle column and does not move sideways
    // for anything — the only thing on this field either seat is still shown.
    const tear = repriseTearCenter(LAYOUT.p2, CFG);
    expect(hers?.x).toBe(tear.x);
    expect(hers?.y).toBe(tear.y);
  });

  it("says nothing at all while the stretch is running seen", () => {
    const world = opened();
    // Before the first echo the field is the pair's own and draws every body
    // on it: the ordinary game asks for the ordinary thing, and a word here
    // would be a cue for the base game rather than for this boss.
    expect(repriseEchoing(world)).toBe(false);
    expect(word(world, "p1")).toBeNull();
    expect(word(world, "p2")).toBeNull();
    for (let i = 0; i < TPB * 6; i++) step(world, []);
    expect(repriseEchoing(world)).toBe(false);
    expect(word(world, "p1")).toBeNull();
    expect(word(world, "p2")).toBeNull();
  });

  it("never says the colour, the count or anything the echo is owed", () => {
    const world = until(opened(), repriseEchoing);
    const s = installed(world);
    const before = { p1: cue(world, "p1"), p2: cue(world, "p2") };
    // The count is the tear's, as a row of teeth, on both screens — and #34
    // forbids a cue carrying one at all. Nothing below moves with it.
    for (const left of [1, 2, 5]) {
      s.left = left;
      expect(cue(world, "p1")).toEqual(before.p1);
      expect(cue(world, "p2")).toEqual(before.p2);
    }
    expect(before.p2?.word).not.toContain("RED");
    expect(before.p2?.word).not.toContain("CYAN");
  });

  it("stands in the same place whichever column the pilot is in", () => {
    const world = until(opened(), repriseEchoing);
    const hers = cue(world, "p2");
    for (let col = 0; col < CFG.cols; col++) {
      world.cannonCol = col;
      // His word follows his own thumb and never goes out: the column he would
      // be standing in is an unseen body's, so a word that vanished when he
      // was right would be that body marked by its own absence (`unseen.ts`).
      const his = cue(world, "p1");
      expect(his?.word).toBe("MOVE");
      expect(his?.x).toBe(tileCX(LAYOUT.p1, col));
      // And hers does not move with him at all — she is not drawn the cannon
      // (`showsCannon`), so a mark that tracked it would be his strip on her
      // glass.
      expect(cue(world, "p2")).toEqual(hers);
    }
  });

  it("goes quiet the beat the echo's last body is sent, with bodies still falling", () => {
    const world = shut();
    // `closeEcho` runs when the last body is *sent*, not when it lands: the
    // tear shuts and these words go out over a field that still holds bodies
    // nothing drew. A word that stayed up would announce one by standing
    // there, and the film's last three pages are the cost of that silence.
    expect(world.creatures.some((c) => c.unseen)).toBe(true);
    expect(word(world, "p1")).toBeNull();
    expect(word(world, "p2")).toBeNull();
  });

  it("paints each word on its own seat's canvas and on neither other", () => {
    const drawn = (role: ViewRole, world: World): string[] => {
      const texts: TextBox[] = [];
      runFrames(world, role, 3, {
        every: 3,
        // Frozen: the case is about one state of the echo, and three ticks of
        // the real clock would spend it.
        onTick: () => {},
        onCanvas: (c) => {
          c.texts = texts;
        },
      });
      return texts.map((t) => t.text);
    };
    const echo = until(opened(), repriseEchoing);
    const his = drawn("p1", echo);
    expect(his).toContain("MOVE");
    expect(his).not.toContain("CARRY");
    expect(his).not.toContain("FIRE");
    const hers = drawn("p2", echo);
    expect(hers).toContain("FIRE");
    expect(hers).toContain("PRESS");
    expect(hers).not.toContain("MOVE");

    // And nothing on either once the tear has shut, with an unseen body still
    // coming down the field.
    const after = shut();
    expect(drawn("p1", after)).not.toContain("MOVE");
    expect(drawn("p2", after)).not.toContain("FIRE");
  });
});
