import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  batonBoss,
  createWorld,
  type GorgeState,
  gorgeBoss,
  startWave,
  step,
  tasterBoss,
  ticksPerBeat,
  undertowBoss,
  type World,
} from "@neon-spore/sim";
import { type BossCue, bossCue } from "../src/boss-cue.js";
import { drawBossCue } from "../src/boss-cue-draw.js";
import { drawCueText } from "../src/boss-cue-text.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import type { TextBox } from "./canvas-stub.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  runFrames,
  stubCanvas,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **The one word the field says**, on five bosses and on the seat that can
 * answer it (`render/src/boss-cue.ts`, `docs/decisions.md` #34).
 *
 * THE BATON's own cases went to `boss-cue-baton.test.ts` on 18 September 2026,
 * with the reading they are about (`boss-cue-read-i.ts`), and THE UNDERTOW's
 * went to `boss-cue-undertow.test.ts` the same day with
 * `boss-cue-read-j.ts`; both are still in the sweep at the foot of this file,
 * which is about what a cue may *contain* and wants every boss in it. THE
 * GORGE's went to `boss-cue-gorge.test.ts` on 19 September 2026 with
 * `boss-cue-read-n.ts`, because the column was missing there. THE CURTAIN's
 * went to `boss-cue-curtain.test.ts` an hour later, and THE TASTER's to
 * `boss-cue-taster.test.ts` after it: both readings
 * stayed where they were, which had the room, and their cases did not.
 *
 * The readings are asked **directly** rather than through a frame, for
 * `undertow-frame.test.ts`' reason turned around: what a pixel proves is that
 * a canvas accepted the word, and what is actually at stake here is *which
 * seat is told* and *what the word is allowed to contain* — two things a
 * colour log cannot see. One frame case at the end carries the drawing, so a
 * cue that was read and never painted is still a failure.
 *
 * The states are set rather than played into: every clock below is already
 * proved in `packages/sim/test`, and a test that waited for the fan to close
 * would be that clock's third copy.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const LAYOUT: Record<ViewRole, Layout> = {
  p1: computeLayout(VIEWPORT, CFG, "p1"),
  p2: computeLayout(VIEWPORT, CFG, "p2"),
  test: computeLayout(VIEWPORT, CFG, "test"),
};

const HULL = (l: Layout) => () => l.hullY;

function opened(kind: Parameters<typeof waveWith>[0], beats = 1): World {
  const world = createWorld(CFG, 5);
  const index = waveWith(kind);
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < beats * TPB; i++) step(world, []);
  return world;
}

/** The whole cue this seat is given. */
function cue(world: World, role: ViewRole): BossCue | null {
  const l = LAYOUT[role];
  return bossCue(l, world, 0, HULL(l));
}

function boss<T>(found: T | null, what: string): T {
  if (found === null) throw new Error(`the ${what} wave installed no boss`);
  return found;
}

describe("what a cue may say", () => {
  /** Every cue five arrangements produce, on every seat. */
  function every(): BossCue[] {
    const out: BossCue[] = [];
    const worlds: World[] = [];
    const gorge = opened("gorge");
    const g = boss(gorgeBoss(gorge), "gorge");
    g.mouth = 3;
    g.ruptures = CFG.gorgeMouthRuptures;
    worlds.push(gorge);
    worlds.push(opened("curtain"));
    const taster = opened("taster");
    const t = boss(tasterBoss(taster), "taster");
    t.shorn = t.blades.length - CFG.tasterClosedBlades;
    worlds.push(taster);
    const undertow = opened("undertow");
    // Under the cannon, so the sweep sees `OPEN` — the word only this fight
    // says — rather than the `MOVE` a lobe out of reach would give it.
    boss(undertowBoss(undertow), "undertow").breaches.push({
      col: undertow.cannonCol,
      stage: "standing",
      stageBeat: undertow.beat,
      tall: false,
      widthMilli: 0,
      widened: false,
    });
    worlds.push(undertow);
    const baton = opened("baton", 3);
    const b = boss(batonBoss(baton), "baton");
    b.stage = "passing";
    b.lockUntil = [-1, -1];
    worlds.push(baton);
    for (const world of worlds) {
      for (const role of ["p1", "p2", "test"] as ViewRole[]) {
        const found = cue(world, role);
        if (found !== null) out.push(found);
      }
    }
    return out;
  }

  it("is one word, in capitals, and never a column, a colour or a count", () => {
    const cues = every();
    expect(cues.length).toBeGreaterThan(6);
    for (const c of cues) {
      expect({ word: c.word, one: /^[A-Z]+$/.test(c.word) }).toEqual({ word: c.word, one: true });
      expect(["red", "cyan", "RED", "CYAN"]).not.toContain(c.word);
    }
  });

  it("names one of the five kinds of action and nothing else", () => {
    // Four gestures and the one non-gesture THE STARE charges for
    // (`boss-cue-read-d.ts`).
    for (const c of every()) expect(["PRESS", "HOLD", "CARRY", "TURN", "STILL"]).toContain(c.kind);
  });

  it("stands inside the frame it is drawn on", () => {
    for (const c of every()) {
      expect(c.x).toBeGreaterThan(0);
      expect(c.x).toBeLessThan(VIEWPORT.width);
      expect(c.halfW).toBeGreaterThan(0);
      expect(c.halfH).toBeGreaterThan(0);
    }
  });
});

describe("the cue on a real frame", () => {
  it("is painted over the boss, in the words the reading gave", () => {
    const world = opened("gorge");
    const g: GorgeState = boss(gorgeBoss(world), "gorge");
    g.mouth = 3;
    g.ruptures = CFG.gorgeMouthRuptures;
    const texts: TextBox[] = [];
    runFrames(world, "p2", 3, {
      every: 3,
      onCanvas: (c) => {
        c.texts = texts;
      },
    });
    const said = texts.map((t) => t.text);
    expect(said).toContain("BURN");
    expect(said).toContain("HOLD");
  });

  it("is on neither screen when the boss is asking for nothing", () => {
    const world = opened("gorge");
    const texts: TextBox[] = [];
    runFrames(world, "p1", 3, {
      every: 3,
      onCanvas: (c) => {
        c.texts = texts;
      },
    });
    const said = texts.map((t) => t.text);
    expect(said).not.toContain("PIERCE");
    expect(said).not.toContain("PRESS");
  });
});

/**
 * **The kind line keeps out of the canvas's own top edge.**
 *
 * The line sits over the mark unless the mark stands close enough to the top
 * that it would run off screen, in which case the kind line is pushed below
 * the verb instead (`boss-cue-text.ts`).
 */
describe("the cue's kind line", () => {
  function drawn(): TextBox[] {
    const world = opened("gorge");
    const g: GorgeState = boss(gorgeBoss(world), "gorge");
    g.mouth = 3;
    g.ruptures = CFG.gorgeMouthRuptures;
    const { ctx } = stubCanvas();
    ctx.texts = [];
    const l = computeLayout(VIEWPORT, CFG, "p2");
    drawBossCue(ctx as unknown as CanvasRenderingContext2D, l, world, 0, 0, () => l.hullY);
    return ctx.texts;
  }

  it("stands over the mark", () => {
    const texts = drawn();
    const kind = texts.find((t) => t.text === "HOLD");
    const word = texts.find((t) => t.text === "BURN");
    expect(kind, "no kind line drawn").toBeTruthy();
    expect(word, "no verb drawn").toBeTruthy();
    expect((kind as TextBox).y).toBeLessThan((word as TextBox).y);
  });
});

/**
 * **The three handle bosses speak in this voice too**, since 18 September 2026.
 *
 * THE SINEW, THE SURGE and THE ANTIPHON were left out of the readings on
 * purpose: their handles already carried a word out of `handle-draw.ts`, and
 * `bosses-choreographed.md` argued that a kind line reading `HOLD` over `HOLD`
 * is the verb said twice. The word is a `BossCue` now — built where the ring is
 * drawn, because the ring's place is a whip, a swell and a sink the reading
 * cannot see — and the objection is answered by the hand rather than by keeping
 * a second prompt system: a kind line that repeats its verb is not drawn.
 *
 * Which seat is told, and that a screen is told once, is each boss's own frame
 * test (`sinew-frame.test.ts`, `surge-frame.test.ts`, `antiphon-frame.test.ts`).
 * What is here is the rule of the hand, asked directly.
 */
describe("a kind line that is the verb said twice", () => {
  function lines(kind: BossCue["kind"], word: string): string[] {
    const { ctx } = stubCanvas();
    ctx.texts = [];
    const cue: BossCue = {
      seat: 1,
      kind,
      word,
      x: 200,
      y: 400,
      halfW: 12,
      halfH: 12,
      seed: 1,
      framed: false,
    };
    drawCueText(ctx as unknown as CanvasRenderingContext2D, cue, 0);
    return ctx.texts.map((t) => t.text);
  }

  it("is not drawn, so the mark carries one word", () => {
    expect(lines("HOLD", "HOLD")).toEqual(["HOLD"]);
    expect(lines("TURN", "TURN")).toEqual(["TURN"]);
  });

  it("is drawn wherever it says something the verb does not", () => {
    expect(lines("PRESS", "FIRE")).toEqual(["FIRE", "PRESS"]);
  });

  it("never says CARRY, whose verb is always the motion (the owner, 24 September 2026)", () => {
    expect(lines("CARRY", "PULL")).toEqual(["PULL"]);
  });
});
