import { beforeAll, describe, expect, it } from "bun:test";
import {
  INTRO_ANSWER,
  INTRO_BEATS,
  INTRO_CROSS,
  INTRO_LOOK,
  INTRO_SCENE_SECONDS,
} from "@neon-spore/content";
import { DEFAULT_CONFIG } from "@neon-spore/sim";
import { drawIntroPair, introPlay } from "../src/intro-pair.js";
import { introPlayer } from "../src/intro-player.js";
import { drawIntroScene, introOver, playBox } from "../src/intro-scene.js";
import { answered, readingNow, shoutNow } from "../src/intro-shout.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

/**
 * The one scene a pair meets before they have chosen anything, through the
 * canvas that refuses what a real one refuses.
 *
 * It is the same rule `briefing.test.ts` holds a wave's opening to, and for a
 * stronger reason: this is the *first* screen, so a colour the browser cannot
 * parse here is a game that never starts for somebody who has just been sent
 * a link. The scene plays through rather than being paged through, so it is
 * sampled the whole way across at a step finer than any of its own moments —
 * a single frame would prove almost nothing about a picture that is moving the
 * entire time it is up.
 *
 * What it holds beyond *the canvas took it* is the sentence the scene is
 * saying: one of them speaks, and only then does the other one move. An answer
 * that begins before its shout has crossed is a pair who are not talking to
 * each other, which is the one thing this screen exists to claim.
 */

const CFG = DEFAULT_CONFIG;
const ROLES: ViewRole[] = ["p1", "p2", "test"];

beforeAll(installCanvasGlobals);

function layoutAt(width: number, height: number, role: ViewRole = "p1") {
  return computeLayout({ width, height, dpr: 2 }, CFG, role);
}

/** Every tenth of a second of it, and a little past the end. */
function everyMoment(): number[] {
  const ages: number[] = [];
  for (let age = 0; age <= INTRO_SCENE_SECONDS + 1.5; age += 0.1) ages.push(age);
  return ages;
}

describe("the intro on the stage", () => {
  it("draws the whole scene in every role", () => {
    const { ctx } = stubCanvas();
    for (const role of ROLES) {
      const l = layoutAt(900, 1600, role);
      for (const age of everyMoment()) {
        drawIntroScene(ctx as unknown as CanvasRenderingContext2D, l, age);
      }
    }
    expect(ctx.calls).toBeGreaterThan(1000);
  });

  it("draws on a screen narrow enough that a word does not fit", () => {
    const { ctx } = stubCanvas();
    const l = layoutAt(240, 480);
    for (const age of everyMoment()) {
      drawIntroScene(ctx as unknown as CanvasRenderingContext2D, l, age);
    }
  });

  it("draws on a window with no room in it at all", () => {
    // Two ways the box for the picture goes negative. A window too short: the
    // banner and the caption alone fill it — a desktop browser at the
    // director's `/game` door, a phone caught mid-rotation. And a canvas that
    // has not been laid out, which is 0 by 0 and still gets frames while its
    // tab is hidden. `plate` turned either into a negative corner radius,
    // `arcTo` threw `IndexSizeError`, and the first screen of the game died
    // before it drew anything.
    const { ctx } = stubCanvas();
    for (const [width, height] of [
      [900, 0],
      [900, 60],
      [900, 200],
      [900, 229],
      [0, 0],
      [20, 1600],
    ] as const) {
      const l = layoutAt(width, height);
      for (const age of [0, 1.8, 3, 6, 9]) {
        drawIntroPair(
          ctx as unknown as CanvasRenderingContext2D,
          { x: 14, y: 40, w: Math.max(0, width - 28), h: Math.max(0, height - 200) },
          age,
        );
        drawIntroScene(ctx as unknown as CanvasRenderingContext2D, l, age);
      }
    }
  });

  it("draws with a pointer resting on the one corner that answers one", () => {
    // A desk lights what a mouse is over, and the lit path is a second colour
    // a phone never reaches.
    const { ctx } = stubCanvas();
    const l = layoutAt(900, 1600);
    const b = playBox(l);
    for (const age of [0.2, 4, 9.9]) {
      drawIntroScene(ctx as unknown as CanvasRenderingContext2D, l, age, {
        x: b.x + b.w / 2,
        y: b.y + b.h / 2,
      });
    }
  });

  it("goes on drawing past its own end rather than blanking", () => {
    // The host closes it on `introOver`, and a host is a place a mistake can
    // happen: a tab that was hidden through the whole scene comes back with a
    // large `age` and one more frame to paint before it closes.
    const { ctx } = stubCanvas();
    const l = layoutAt(900, 1600);
    const before = ctx.calls;
    drawIntroScene(ctx as unknown as CanvasRenderingContext2D, l, INTRO_SCENE_SECONDS * 4);
    expect(ctx.calls).toBeGreaterThan(before);
  });

  it("leaves no transform open, at any moment of the scene", () => {
    // The picture, the tag and every line of type are drawn through a scale,
    // and the field is drawn under the intro and goes on being drawn after it
    // closes. One unbalanced `save` and the rest of the game is played at the
    // size of whichever frame dropped it.
    const { ctx } = stubCanvas();
    const l = layoutAt(900, 1600);
    for (const age of everyMoment()) {
      ctx.tally.clear();
      drawIntroScene(ctx as unknown as CanvasRenderingContext2D, l, age);
      expect(ctx.tally.get("save") ?? 0, `at ${age.toFixed(1)}s`).toBe(
        ctx.tally.get("restore") ?? 0,
      );
    }
  });

  it("clips the picture, so the near end of the trip stays in its window", () => {
    // Without the clip a figure at the top of its cycle lands on the banner
    // above it, which is the difference between depth and a zoom.
    const { ctx } = stubCanvas();
    const l = layoutAt(900, 1600);
    ctx.tally.clear();
    drawIntroScene(ctx as unknown as CanvasRenderingContext2D, l, 1.7);
    expect(ctx.tally.get("clip") ?? 0).toBeGreaterThan(0);
  });
});

describe("the sentence the scene is saying", () => {
  it("has nobody talking before the first shout", () => {
    expect(shoutNow(0)).toBeNull();
    expect(shoutNow(INTRO_BEATS[0]?.at ?? 0)).not.toBeNull();
  });

  it("never has two of them shouting at once", () => {
    // One bubble in the air. Two is a room with four people in it.
    for (let age = 0; age < INTRO_SCENE_SECONDS; age += 0.02) {
      const said = shoutNow(age);
      if (!said) continue;
      const others = INTRO_BEATS.filter((b) => b.id !== said.beat.id);
      for (const other of others) {
        const overlapping = age >= other.at && age < other.at + INTRO_CROSS;
        expect(overlapping, `${other.id} at ${age.toFixed(2)}`).toBe(false);
      }
    }
  });

  it("moves no control until the word about it has landed", () => {
    // The whole claim of the screen: one of them acts *because* the other
    // spoke. An answer that starts early is a pair who did not need to talk.
    for (const beat of INTRO_BEATS) {
      expect(answered(beat.at, beat), beat.id).toBe(0);
      expect(answered(beat.at + INTRO_CROSS - 0.01, beat), beat.id).toBe(0);
      expect(answered(beat.at + INTRO_CROSS + 0.2, beat), beat.id).toBeGreaterThan(0);
    }
  });

  it("keeps every part of the picture inside the range it is read as", () => {
    // All four are used as a position along something or as an alpha, and an
    // alpha outside 0..1 is what the strict canvas refuses outright.
    for (let age = 0; age < INTRO_SCENE_SECONDS + 4; age += 0.02) {
      for (const [name, v] of Object.entries(introPlay(age))) {
        expect(v, `${name} at ${age.toFixed(2)}`).toBeGreaterThanOrEqual(0);
        expect(v, `${name} at ${age.toFixed(2)}`).toBeLessThanOrEqual(1);
      }
    }
  });

  it("puts a look in front of every shout, and takes it away as the word leaves", () => {
    // The moment the scene did not have, and the cause of the other three: the
    // owner, 16 September 2026 — *they first look, then they call, then the
    // other ones listen and performs what he was told to do so*.
    for (const beat of INTRO_BEATS) {
      expect(
        beat.at - INTRO_LOOK,
        `${beat.id} would look before the scene opens`,
      ).toBeGreaterThanOrEqual(0);
      expect(readingNow(beat.at - INTRO_LOOK - 0.01)?.beat.id, beat.id).not.toBe(beat.id);
      const mid = readingNow(beat.at - INTRO_LOOK * 0.4);
      expect(mid?.beat.id, beat.id).toBe(beat.id);
      expect(mid?.read ?? 0, beat.id).toBeGreaterThan(0.9);
      // **The one reading is the one who is about to call**, and not the one
      // who will answer. A scene where the listener is the one studying their
      // screen is the pair the wrong way round.
      expect(mid?.beat.from, beat.id).toBe(beat.from);
      // And nobody is still bent over a phone while their own word crosses.
      expect(readingNow(beat.at + INTRO_CROSS * 0.4)?.read ?? 0, beat.id).toBe(0);
    }
  });

  it("runs the four moments in the order the scene claims, and in no other", () => {
    for (const beat of INTRO_BEATS) {
      const look = beat.at - INTRO_LOOK * 0.4;
      const land = beat.at + INTRO_CROSS;
      // Nothing is being said while the screen is being read.
      expect(shoutNow(look)?.beat.id, beat.id).not.toBe(beat.id);
      // Nothing has moved while the word is still in the air.
      expect(answered(beat.at + 0.1, beat), beat.id).toBe(0);
      expect(answered(land - 0.01, beat), beat.id).toBe(0);
      // And the control has moved by the time the answer has had its say.
      expect(answered(land + INTRO_ANSWER, beat), beat.id).toBeGreaterThan(0.9);
    }
  });

  it("lights the phone of whoever is reading it, and nobody else's", () => {
    // The look is only a look if it can be seen. The figure is a phone, an ear
    // and a mouth (`intro-player.ts`), and the rows on the screen are the one
    // part of it that says *this one is reading*.
    const { ctx } = stubCanvas();
    const still = { look: 1 as const, reading: 0, talking: 0, listening: 0 };
    const before = ctx.calls;
    introPlayer(ctx as unknown as CanvasRenderingContext2D, 100, 100, 40, "#C9A7FF", 2, still);
    const dark = ctx.calls - before;
    const at = ctx.calls;
    introPlayer(ctx as unknown as CanvasRenderingContext2D, 100, 100, 40, "#C9A7FF", 2, {
      ...still,
      reading: 1,
    });
    expect(ctx.calls - at, "a lit phone draws no more than a dark one").toBeGreaterThan(dark);
  });

  it("ends only once both answers have been given", () => {
    const last = INTRO_BEATS[INTRO_BEATS.length - 1];
    expect(last).toBeDefined();
    expect(introOver(INTRO_SCENE_SECONDS - 0.01)).toBe(false);
    expect(introOver(INTRO_SCENE_SECONDS)).toBe(true);
    for (const beat of INTRO_BEATS) {
      expect(answered(INTRO_SCENE_SECONDS, beat), beat.id).toBe(1);
    }
    // And with a moment left over: the picture worth ending on is the pair
    // standing there having just played a round together.
    expect(introPlay(INTRO_SCENE_SECONDS - 0.9).shielded).toBe(1);
  });
});
