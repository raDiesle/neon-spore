import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type HaspState,
  haspBoss,
  NO_BEARING,
  NO_BOLT,
  NO_BURN,
  NO_LATCH,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  runFrames,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE HASP's story between the hasps, drawn (`render/src/hasp-story.ts`): the
 * door shaking on its hinge, the wheel spinning backward with its mark
 * smeared, the last hasp furred with rust, the three doors swaying half-shut.
 * Set rather than played to; `sim/test/hasp-story.test.ts` proves the rules.
 *
 * What this file asks is that each state is drawn on every screen and unlike
 * the door without it, and **that the split holds through the story**: the
 * rattle quiets for his grip on his screen alone, the rust thins and the smear
 * fades for her hand on hers alone.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
type Story = "rattle" | "backspin" | "rust" | "sway";

function hung(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("hasp");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 6; i++) step(world, []);
  return world;
}

/** The hasps a state follows: the rattle one out, the backspin and the rust two, the sway all three. */
const LEFT: Record<Story, number> = { rattle: 2, backspin: 1, rust: 1, sway: 0 };

/** The door in `phase` a beat in, both hands off; `"work"` is the plain door at `hasps`. */
function at(world: World, phase: Story | "work", hasps: number): HaspState {
  const s = haspBoss(world);
  if (s === null) throw new Error("the hasp wave hung no door");
  s.phase = phase;
  s.phaseBeat = world.beat - 1;
  s.hasps = hasps;
  s.latchMilli = NO_LATCH;
  s.gripBeat = world.beat;
  s.burnBeat = NO_BURN;
  s.wheelMilli = 0;
  s.handMilli = NO_BEARING;
  s.woundMilli = 0;
  s.seized = false;
  s.boltCol = NO_BOLT;
  s.runBeats = 0;
  s.travelMilli = 0;
  s.rocks = 0;
  return s;
}

const story = (world: World, phase: Story): HaspState => at(world, phase, LEFT[phase]);

function frame(role: ViewRole, arrange: (world: World) => void): string {
  const world = hung();
  arrange(world);
  const log: string[] = [];
  runFrames(world, role, 9, {
    every: 3,
    onCanvas: (c) => {
      c.log = log;
    },
  });
  return log.join("|");
}

function tinted(text: string, hex: string): number {
  const v = Number.parseInt(hex.slice(1), 16);
  const count = (colour: string) => text.split(colour).length - 1;
  return count(hex) + count(`rgba(${(v >> 16) & 255},${(v >> 8) & 255},${v & 255},`);
}

describe("THE HASP's story", () => {
  for (const phase of ["rattle", "backspin", "rust", "sway"] as const) {
    it.each(ROLES)(`draws the ${phase} unlike the plain door, on %s`, (role) => {
      const plain = frame(role, (w) => at(w, "work", LEFT[phase]));
      expect(frame(role, (w) => story(w, phase))).not.toBe(plain);
    });
  }
});

describe("THE HASP's rattle", () => {
  it("quiets as his grip is kept, on the latch's screens and not on hers", () => {
    const held = (runBeats: number) => (w: World) => {
      const s = story(w, "rattle");
      s.latchMilli = CFG.haspGripMilli;
      s.runBeats = runBeats;
    };
    for (const role of ["p1", "test"] as const) {
      expect(frame(role, held(CFG.haspRattleBeats - 1))).not.toBe(frame(role, held(0)));
    }
    expect(frame("p2", held(CFG.haspRattleBeats - 1))).toBe(frame("p2", held(0)));
  });
});

describe("THE HASP's backspin", () => {
  it("fades its smear as her winding counts, on the wheel's screens and not on his", () => {
    const wound = (travelMilli: number) => (w: World) => {
      story(w, "backspin").travelMilli = travelMilli;
    };
    const most = CFG.haspWindTravelMilli - 100;
    for (const role of ["p2", "test"] as const) {
      expect(frame(role, wound(most))).not.toBe(frame(role, wound(0)));
    }
    expect(frame("p1", wound(most))).toBe(frame("p1", wound(0)));
  });
});

describe("THE HASP's rust", () => {
  it.each(ROLES)("furs the last hasp in rust, on %s", (role) => {
    const plain = frame(role, (w) => at(w, "work", 1));
    const rust = frame(role, (w) => story(w, "rust"));
    expect(tinted(rust, PALETTE.ember)).toBeGreaterThan(tinted(plain, PALETTE.ember));
    expect(tinted(rust, PALETTE.emberRim)).toBeGreaterThan(tinted(plain, PALETTE.emberRim));
  });

  it("thins as her rocks count, on the wheel's screens and not on his", () => {
    const rocked = (rocks: number) => (w: World) => {
      const s = story(w, "rust");
      s.latchMilli = CFG.haspGripMilli;
      s.rocks = rocks;
    };
    const most = CFG.haspRustRocks - 1;
    for (const role of ["p2", "test"] as const) {
      // The fur is one path however many blotches are left, so the tint's
      // count stays; what the rocks change is the path.
      expect(frame(role, rocked(most))).not.toBe(frame(role, rocked(0)));
    }
    expect(frame("p1", rocked(most))).toBe(frame("p1", rocked(0)));
  });
});

describe("THE HASP's sway", () => {
  it.each(ROLES)("falls toward half-shut as the window runs, on %s", (role) => {
    const opened = frame(role, (w) => story(w, "sway"));
    const later = frame(role, (w) => {
      story(w, "sway").phaseBeat = w.beat - Math.floor(CFG.haspStoryBeats / 2);
    });
    expect(later).not.toBe(opened);
  });
});

it("draws the same rust the same way twice", () => {
  const arrange = (w: World) => {
    story(w, "rust").rocks = 1;
  };
  expect(frame("test", arrange)).toBe(frame("test", arrange));
});
