import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type DiastoleState,
  type LeadState,
  type LedgerState,
  type OrreryState,
  type ScuttleState,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { type BossCue, bossCue } from "../src/boss-cue.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **The five older choreographed bosses, and what the field is allowed to say
 * about them** (`render/src/boss-cue-read-c.ts`). THE THROAT was a sixth until
 * its fight was read whole; its cases are in `boss-cue-throat.test.ts`.
 *
 * Half of this file is about **silence**, which is the unusual thing to test
 * and the reason it is worth a file. Each of these fights is a number the pair
 * says out loud — which beat the gaps line up, where the cord roots next,
 * where the body will be when the shot lands — and a cue that lit at the right
 * moment would answer it. So THE ORRERY's open shaft, THE DIASTOLE's
 * coincidence and THE LEAD's column each have a case here asserting that
 * **nothing is drawn**, and those cases are the ones that would catch a lane
 * making this boss "clearer" by taking its subject away (`decisions.md` #34,
 * *reconsider if a cue starts carrying a column, a colour or a count*).
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const LAYOUT: Record<ViewRole, Layout> = {
  p1: computeLayout(VIEWPORT, CFG, "p1"),
  p2: computeLayout(VIEWPORT, CFG, "p2"),
  test: computeLayout(VIEWPORT, CFG, "test"),
};

function opened(kind: Parameters<typeof waveWith>[0], beats = 1): World {
  const world = createWorld(CFG, 5);
  const index = waveWith(kind);
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

/**
 * The boss this wave installed, as the state its own file names it.
 *
 * The cast is the point of the helper and not a shortcut around it: every one
 * of these has an `xxxBoss` narrower in `packages/sim` except THE ORRERY, and
 * six imports to narrow six unions in a test that then writes to all of them
 * would be longer than the fights it is about. The `kind` check is what makes
 * it safe — a wave that installed the wrong boss throws here rather than
 * passing a test with no boss in it.
 */
function installed<T>(world: World, kind: string): T {
  const b = world.boss;
  if (b === null || b.kind !== kind) throw new Error(`the ${kind} wave installed no ${kind}`);
  return b as unknown as T;
}

describe("THE LEDGER", () => {
  const paying = (): { world: World; t: LedgerState } => {
    const world = opened("ledger", 6);
    const t = installed<LedgerState>(world, "ledger");
    t.rootBeat = world.beat - CFG.ledgerRootBeats;
    t.beads = [{ beat: world.beat + 2, span: 4, last: false }];
    return { world, t };
  };

  it("puts the trigger on the pilot and the plate on the navigator", () => {
    const { world, t } = paying();
    t.socket = world.shieldCol === 0 ? 1 : 0;
    expect(word(world, "p1")).toBe("GUARD");
    expect(word(world, "p2")).toBe("MOVE");
  });

  it("stops asking her to move once the plate is where the cord roots", () => {
    const { world, t } = paying();
    t.socket = world.shieldCol;
    expect(word(world, "p2")).toBeNull();
    expect(word(world, "p1")).toBe("GUARD");
  });

  it("says nothing about the last return, which is the one they must not ward", () => {
    const { world, t } = paying();
    t.beads = [{ beat: world.beat + 2, span: 4, last: true }];
    expect(word(world, "p1")).toBeNull();
    expect(word(world, "p2")).toBeNull();
  });
});

describe("THE LEAD", () => {
  it("is silent while the pair is working out where the body will be", () => {
    const world = opened("lead");
    const s = installed<LeadState>(world, "lead");
    s.segments = 4;
    s.passBeat = -1;
    expect(word(world, "p1")).toBeNull();
    expect(word(world, "p2")).toBeNull();
  });

  it("names the beam on the last pass, when the trigger has quietly stopped working", () => {
    const world = opened("lead");
    const s = installed<LeadState>(world, "lead");
    s.segments = 1;
    s.passBeat = world.beat;
    expect(word(world, "p2")).toBe("BURN");
    expect(cue(world, "p2")?.kind).toBe("HOLD");
    expect(word(world, "p1")).toBeNull();
  });
});

describe("THE SCUTTLE", () => {
  it("marks the live part while one hangs, and the beam when it winds up", () => {
    const world = opened("scuttle", 3);
    const s = installed<ScuttleState>(world, "scuttle");
    s.live = 1;
    s.loose = [1];
    s.windBeat = -1;
    s.downBeat = -1;
    expect(word(world, "p2")).toBe("FIRE");

    s.windBeat = world.beat;
    expect(word(world, "p2")).toBe("BURN");
  });
});

describe("THE DIASTOLE", () => {
  it("says nothing at all while the pair is holding two counts", () => {
    const world = opened("diastole");
    const b = installed<DiastoleState>(world, "diastole");
    b.phase = "one";
    expect(word(world, "p1")).toBeNull();
    expect(word(world, "p2")).toBeNull();
  });

  it("names the beam once a single-chamber hit has stopped landing", () => {
    const world = opened("diastole");
    const b = installed<DiastoleState>(world, "diastole");
    b.phase = "two";
    expect(word(world, "p2")).toBe("BURN");
    // And it still says nothing about the coincidence, which is the fight.
    expect(cue(world, "p2")?.kind).toBe("HOLD");
    expect(word(world, "p1")).toBeNull();
  });

  it("asks the pilot for the clamp once the chamber beats alone, and never for the beat", () => {
    const world = opened("diastole");
    const b = installed<DiastoleState>(world, "diastole");
    b.phase = "alone";
    b.leftHits = 0;
    b.clampBeat = -1;
    b.clampUntil = -1;
    expect(word(world, "p1")).toBe("CLAMP");
    expect(cue(world, "p1")?.kind).toBe("HOLD");
    // And nothing to her yet: the beam lands only under the clamp, so a word
    // over the bridge before there is one is a word over a refusing lance.
    expect(word(world, "p2")).toBeNull();
    // A spasm has nothing to hold for eight beats, and the chamber says so itself.
    b.phase = "spasm";
    expect(word(world, "p1")).toBeNull();
    expect(word(world, "p2")).toBeNull();
  });

  it("hands the word to her the moment the thumb lands, and takes his away", () => {
    const world = opened("diastole");
    const b = installed<DiastoleState>(world, "diastole");
    b.phase = "alone";
    b.leftHits = 0;
    b.clampBeat = world.beat;
    b.clampUntil = world.beat + world.cfg.diastoleClampBeats;
    expect(word(world, "p2")).toBe("BURN");
    // Nothing to him: what the fight wants now is a thumb that comes off
    // before the dial closes, and `HOLD` would be asking for the spasm.
    expect(word(world, "p1")).toBeNull();
  });

  it("goes quiet on both once the clamp has outlived its window", () => {
    const world = opened("diastole");
    const b = installed<DiastoleState>(world, "diastole");
    b.phase = "alone";
    b.leftHits = 0;
    // A thumb that came down a whole window ago and has never come off.
    world.beat = 20;
    b.clampBeat = world.beat - world.cfg.diastoleClampBeats;
    b.clampUntil = world.beat;
    expect(word(world, "p1")).toBeNull();
    expect(word(world, "p2")).toBeNull();
  });
});

describe("THE ORRERY", () => {
  it("is silent while the rings turn — the open beat is the whole boss", () => {
    const world = opened("orrery");
    const b = installed<OrreryState>(world, "orrery");
    b.phase = "rings";
    // Every beat of a full orbit, so a cue that lit on the open one is caught
    // wherever in the cycle this world happens to have started.
    for (let i = 0; i < 24; i++) {
      // Held, so a boss the step nulled cannot make this pass by saying
      // nothing about a fight that is over.
      expect(world.boss?.kind).toBe("orrery");
      expect(word(world, "p1")).toBeNull();
      expect(word(world, "p2")).toBeNull();
      for (let t = 0; t < TPB; t++) step(world, []);
      b.phase = "rings";
    }
  });

  it("names the beam once every ring is off", () => {
    const world = opened("orrery");
    const b = installed<OrreryState>(world, "orrery");
    b.phase = "naked";
    expect(word(world, "p2")).toBe("BURN");
    expect(word(world, "p1")).toBeNull();
  });
});
