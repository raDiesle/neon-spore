import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  type BatonState,
  batonBoss,
  type CandleState,
  type CurtainState,
  candleBoss,
  createWorld,
  curtainBoss,
  type GorgeState,
  gorgeBoss,
  startWave,
  step,
  type TasterState,
  tasterBoss,
  ticksPerBeat,
  type UndertowState,
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
 * **The one word the field says**, on six bosses and on the seat that can
 * answer it (`render/src/boss-cue.ts`, `docs/decisions.md` #34).
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

/** The word this seat is given, or nothing. */
function word(world: World, role: ViewRole): string | null {
  const l = LAYOUT[role];
  return bossCue(l, world, 0, HULL(l))?.word ?? null;
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

describe("THE CANDLE", () => {
  it("tells the navigator to fire at the light, and says nothing about the column", () => {
    const world = opened("candle");
    const c: CandleState = boss(candleBoss(world), "candle");
    c.phase = "full";
    expect(word(world, "p2")).toBe("FIRE");
    expect(cue(world, "p2")?.kind).toBe("PRESS");
  });

  it("tells the pilot to move when he is sitting in the column the flame is eating", () => {
    const world = opened("candle");
    const c: CandleState = boss(candleBoss(world), "candle");
    c.phase = "eating";
    c.faceCol = world.cannonCol;
    expect(word(world, "p1")).toBe("MOVE");
    // And the navigator, who cannot see the face, is told her own job instead.
    expect(word(world, "p2")).toBe("FIRE");
    // Off that column he is told nothing at all: the shot is not his, and a
    // pilot with no job this beat is a pilot listening to the other seat.
    c.faceCol = world.cannonCol === 0 ? 1 : 0;
    expect(word(world, "p1")).toBeNull();
  });

  it("says nothing while the light is going out", () => {
    const world = opened("candle");
    boss(candleBoss(world), "candle").phase = "out";
    expect(word(world, "p1")).toBeNull();
    expect(word(world, "p2")).toBeNull();
  });
});

describe("THE GORGE", () => {
  it("is silent while it is being fed — the fight is not shooting", () => {
    const world = opened("gorge");
    boss(gorgeBoss(world), "gorge");
    expect(word(world, "p1")).toBeNull();
    expect(word(world, "p2")).toBeNull();
  });

  it("asks for the pierce on the navigator's screen once an intake comes full", () => {
    const world = opened("gorge");
    const g: GorgeState = boss(gorgeBoss(world), "gorge");
    const k = g.intakes[2];
    if (k === undefined) throw new Error("no intake 2");
    k.beads = CFG.gorgeFullBeads;
    k.color = "red";
    k.fullBeat = world.beat;
    expect(word(world, "p2")).toBe("PIERCE");
    // The pilot fires nothing and is told nothing.
    expect(word(world, "p1")).toBeNull();
  });

  it("asks for the beam once it is gorged", () => {
    const world = opened("gorge");
    const g: GorgeState = boss(gorgeBoss(world), "gorge");
    g.mouth = 3;
    g.ruptures = CFG.gorgeMouthRuptures;
    expect(word(world, "p2")).toBe("BURN");
    expect(cue(world, "p2")?.kind).toBe("HOLD");
  });
});

describe("THE CURTAIN", () => {
  it("asks either seat for the shove while the core is covered", () => {
    const world = opened("curtain");
    boss(curtainBoss(world), "curtain");
    expect(word(world, "p1")).toBe("SHOVE");
    expect(word(world, "p2")).toBe("SHOVE");
    expect(cue(world, "p1")?.kind).toBe("CARRY");
  });

  it("asks the navigator alone for the shot once the core is bare", () => {
    const world = opened("curtain");
    const c: CurtainState = boss(curtainBoss(world), "curtain");
    c.tornBeat = world.beat;
    expect(word(world, "p2")).toBe("FIRE");
    // The pilot is not drawn the shadow, so he is not drawn a mark on it.
    expect(word(world, "p1")).toBeNull();
  });
});

describe("THE TASTER", () => {
  it("asks the navigator to shear while the fan stands, and to burn once it closes", () => {
    const world = opened("taster");
    const t: TasterState = boss(tasterBoss(world), "taster");
    const blade = t.blades[0];
    if (blade === undefined) throw new Error("no blade 0");
    blade.setBeat = world.beat;
    blade.edge = "red";
    expect(word(world, "p2")).toBe("SHEAR");
    expect(word(world, "p1")).toBeNull();
    t.shorn = t.blades.length - CFG.tasterClosedBlades;
    expect(word(world, "p2")).toBe("BURN");
  });
});

describe("THE UNDERTOW", () => {
  const stand = (world: World, col: number, tall: boolean): void => {
    boss(undertowBoss(world), "undertow").breaches.push({
      col,
      stage: "standing",
      stageBeat: world.beat,
      tall,
      widthMilli: 0,
      widened: false,
    });
  };

  it("gives the maw to the pilot and the beam to the navigator", () => {
    const world = opened("undertow");
    stand(world, 2, false);
    expect(word(world, "p1")).toBe("OPEN");
    expect(word(world, "p2")).toBeNull();

    const tall = opened("undertow");
    stand(tall, 2, true);
    expect(word(tall, "p2")).toBe("BURN");
    expect(word(tall, "p1")).toBeNull();
  });

  it("tells the pilot to slide off a seat that has come up under him", () => {
    const world = opened("undertow");
    const u: UndertowState = boss(undertowBoss(world), "undertow");
    u.unseatedUntil = world.beat + 2;
    expect(word(world, "p1")).toBe("MOVE");
  });

  it("tells the navigator to move a shield that is keeping the maw off a lobe", () => {
    const world = opened("undertow");
    stand(world, world.shieldCol, false);
    expect(word(world, "p2")).toBe("MOVE");
    // The pilot still has his own half of the same beat.
    expect(word(world, "p1")).toBe("OPEN");
  });
});

describe("THE BATON", () => {
  it("gives the launch to the pilot and the shot to the navigator", () => {
    const world = opened("baton", 3);
    const b: BatonState = boss(batonBoss(world), "baton");
    b.stage = "passing";
    const bead = b.beads[0];
    if (bead === undefined) throw new Error("no bead");
    bead.flying = false;
    b.lockUntil = [-1, -1];
    expect(word(world, "p1")).toBe("LAUNCH");
    expect(word(world, "p2")).toBeNull();

    bead.flying = true;
    bead.struck = false;
    bead.flightTick = world.tick;
    expect(word(world, "p2")).toBe("FIRE");
  });

  it("says nothing to a seat the fight has locked out", () => {
    const world = opened("baton", 3);
    const b: BatonState = boss(batonBoss(world), "baton");
    b.stage = "passing";
    const bead = b.beads[0];
    if (bead === undefined) throw new Error("no bead");
    bead.flying = false;
    b.lockUntil = [world.beat + 1, -1];
    expect(word(world, "p1")).toBeNull();
  });
});

describe("what a cue may say", () => {
  /** Every cue the six arrangements above produce, on every seat. */
  function every(): BossCue[] {
    const out: BossCue[] = [];
    const worlds: World[] = [];
    const candle = opened("candle");
    boss(candleBoss(candle), "candle").phase = "eating";
    boss(candleBoss(candle), "candle").faceCol = candle.cannonCol;
    worlds.push(candle);
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
    boss(undertowBoss(undertow), "undertow").breaches.push({
      col: 2,
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

  it("names one of the four kinds of action and nothing else", () => {
    for (const c of every()) expect(["PRESS", "HOLD", "CARRY", "TURN"]).toContain(c.kind);
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
 * **The kind line keeps out of whatever stands over the picture.**
 *
 * On the game itself nothing does and the line sits over the mark. A rehearsal
 * puts a band across the top — 104 pixels of TUTORIAL over PLAYER n · SCREEN —
 * and draws the cue like anything else (`guide-seat.ts` → `drawBodies`), so a
 * boss whose mark stands high wrote PRESS or HOLD inside it until 18 September
 * 2026. The line drops off `headerTop` now, the way a round's header does —
 * capped by its own verb, so a mark that is itself inside the band keeps its
 * cue whole and goes behind the plate with it rather than leaving a lone
 * PRESS below (`boss-cue-text.ts`).
 */
describe("the cue and a band over the picture", () => {
  const BAND = 104;
  /** A band deeper than the mark stands from the top, so both lines must move. */
  const DEEP = 400;

  function drawn(clearTop: number | undefined): TextBox[] {
    const world = opened("gorge");
    const g: GorgeState = boss(gorgeBoss(world), "gorge");
    g.mouth = 3;
    g.ruptures = CFG.gorgeMouthRuptures;
    const { ctx } = stubCanvas();
    ctx.texts = [];
    const l = computeLayout(VIEWPORT, CFG, "p2");
    drawBossCue(
      ctx as unknown as CanvasRenderingContext2D,
      l,
      world,
      0,
      0,
      () => l.hullY,
      clearTop,
    );
    return ctx.texts;
  }

  function said(clearTop: number | undefined): { kind: TextBox; word: TextBox } {
    const texts = drawn(clearTop);
    const kind = texts.find((t) => t.text === "HOLD");
    const word = texts.find((t) => t.text === "BURN");
    expect(kind, "no kind line drawn").toBeTruthy();
    expect(word, "no verb drawn").toBeTruthy();
    return { kind: kind as TextBox, word: word as TextBox };
  }

  it("stands over the mark when nothing stands over the picture", () => {
    const { kind, word } = said(undefined);
    expect(kind.y).toBeLessThan(word.y);
  });

  it("keeps both lines out of the band when one does", () => {
    const { kind, word } = said(BAND);
    expect(kind.y, "the kind line is under the tutorial band").toBeGreaterThanOrEqual(BAND);
    expect(word.y, "the verb is under the tutorial band").toBeGreaterThanOrEqual(BAND);
  });

  it("puts the kind line under the verb when the mark is inside the band", () => {
    const { kind, word } = said(DEEP);
    expect(word.y, "the verb is under the band").toBeGreaterThanOrEqual(DEEP);
    expect(kind.y, "the kind line is over the verb with no room for it").toBeGreaterThan(word.y);
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
    expect(lines("CARRY", "PULL")).toEqual(["PULL", "CARRY"]);
  });
});
