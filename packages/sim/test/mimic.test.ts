import { describe, expect, it } from "bun:test";
import { midCol } from "../src/config.js";
import { GLYPHS } from "../src/glyphs.js";
import {
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  type SimConfig,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "../src/index.js";
import {
  type MimicState,
  type MimicStep,
  mimicBoss,
  mimicDraws,
  mimicReadBy,
} from "../src/mimic.js";
import { mimicStruck } from "../src/mimic-shot.js";
import { slowing } from "../src/slow.js";
import type { Bullet, Color } from "../src/types.js";

/**
 * THE MIMIC's rules: one of you sees the sign on its skin and says what it
 * is, and the other draws it (`docs/spec/bosses.md` §11.60). What a phone
 * cannot show: that the sign each seat must draw is on the *other* seat's
 * screen only; that only a seat with a sign to draw is heard; that a wrong
 * sign is worn and then an arm reaches, three reaches the hull; that a peel
 * draws the arms back; that a roll trades the seats; that a changing sign
 * changes on its beat; that a split wants both halves; that the core wants
 * its colour, and a core run out closes back to the split. AUTO playing it
 * through: `tools/director/test/autopilot-mimic.test.ts`.
 */

const CFG: SimConfig = { ...DEFAULT_CONFIG };
const TPB = ticksPerBeat(CFG);
const MID = midCol(CFG);

const sign = (reader: 1 | 2, changes = false): MimicStep => ({
  ask: "sign",
  reader,
  changes,
  color: "either",
  beats: 10,
});
const ROLL: MimicStep = { ask: "roll", reader: 1, changes: false, color: "either", beats: 2 };
const SPLIT: MimicStep = { ask: "split", reader: 1, changes: false, color: "either", beats: 10 };
const core = (color: Color | "either"): MimicStep => ({
  ask: "core",
  reader: 1,
  changes: false,
  color,
  beats: 4,
});

/** The shipped wave's script, written out: sim tests do not read content. */
const SCRIPT: readonly MimicStep[] = [
  sign(1),
  sign(1),
  sign(1),
  ROLL,
  sign(2),
  sign(2, true),
  sign(2, true),
  ROLL,
  SPLIT,
  core("red"),
  SPLIT,
  core("cyan"),
];

function install(steps: readonly MimicStep[] = SCRIPT, seed = 0): World {
  const world = createWorld({ ...CFG }, seed);
  startWave(world, 0, [], [], { kind: "mimic", steps });
  return world;
}

function mimic(world: World): MimicState {
  const s = mimicBoss(world);
  if (s === null) throw new Error("the wave installed no mimic");
  return s;
}

function tick(world: World, cmds: TimedCommand[] = []): string[] {
  step(world, cmds);
  return world.events.map((e) => e.type);
}

function glyph(world: World, player: 1 | 2, sign: number): string[] {
  return tick(world, [{ tick: world.tick, player, command: { kind: "glyph", sign } }]);
}

/** The sign `player` must draw, which the other seat's screen shows. */
const owed = (world: World, player: 1 | 2): number => mimic(world).signs[player - 1] ?? -1;

/** One of the five that is not `n`. */
const not = (n: number): number => (n + 1) % GLYPHS.length;

function runUntil(world: World, until: (w: World) => boolean, beats = 60): Set<string> {
  const seen = new Set<string>();
  const end = world.tick + TPB * beats;
  while (!until(world)) {
    if (world.tick >= end) throw new Error("the mimic never got there");
    for (const t of tick(world)) seen.add(t);
  }
  return seen;
}

const toSign = (world: World) => runUntil(world, (w) => mimic(w).phase === "sign");
const toCore = (world: World) => runUntil(world, (w) => mimic(w).phase === "core");
const saw = (type: string) => (w: World) => w.events.some((e) => e.type === type);

/** Every sign on the skin drawn right by the seat that owes it. */
function drawAll(world: World): void {
  for (const seat of [1, 2] as const) {
    if (mimicDraws(mimic(world), seat)) glyph(world, seat, owed(world, seat));
  }
}

function shot(color: Color, col = MID): Bullet {
  return { id: 999, col, row: 20, subMilli: 0, color, lance: false, driftMilli: 0, aimMilli: 0 };
}

describe("THE MIMIC's sign", () => {
  it("slaps into shape, then shows the pilot a sign the navigator must draw, under THE SLOW", () => {
    const world = install();
    expect(mimic(world).phase).toBe("entering");
    const seen = toSign(world);
    const s = mimic(world);
    expect(seen.has("mimicSign")).toBe(true);
    expect(s.signs[0]).toBe(-1);
    expect(s.signs[1]).toBeGreaterThanOrEqual(0);
    expect(mimicReadBy(s, 1)).toBe(s.signs[1] ?? -2);
    expect(mimicReadBy(s, 2)).toBe(-1);
    expect(slowing(world)).toBe(true);
  });

  it("peels to the drawer's right glyph, and drops the reader's", () => {
    const world = install();
    toSign(world);
    const want = owed(world, 2);
    expect(glyph(world, 1, want)).not.toContain("mimicPeel");
    expect(mimic(world).phase).toBe("sign");
    expect(glyph(world, 2, want)).toContain("mimicPeel");
    expect(mimic(world).phase).toBe("peeled");
    expect(mimic(world).peels).toBe(1);
    expect(slowing(world)).toBe(false);
    toSign(world);
    expect(owed(world, 2)).not.toBe(want);
  });

  it("wears a wrong sign, then reaches; three reaches in a movement strike the hull", () => {
    const world = install();
    toSign(world);
    for (let r = 1; r <= CFG.mimicReaches; r++) {
      const want = owed(world, 2);
      expect(glyph(world, 2, not(want))).toContain("mimicWrong");
      expect(mimic(world).drawn[1]).toBe(not(want));
      expect(slowing(world)).toBe(false);
      runUntil(world, saw("mimicReach"));
      if (r < CFG.mimicReaches) {
        expect(mimic(world).reaches).toBe(r);
        expect(mimic(world).phase).toBe("sign");
      }
    }
    expect(world.events.some((e) => e.type === "breach")).toBe(true);
    expect(mimic(world).reaches).toBe(0);
  });

  it("reaches after a window run out with nothing drawn, the skin left mottled", () => {
    const world = install();
    toSign(world);
    runUntil(world, saw("mimicLapse"), 20);
    expect(mimic(world).phase).toBe("mimicking");
    expect(mimic(world).drawn).toEqual([-1, -1]);
    runUntil(world, saw("mimicReach"));
    expect(mimic(world).reaches).toBe(1);
  });

  it("draws every arm back a step with a peel", () => {
    const world = install();
    toSign(world);
    glyph(world, 2, not(owed(world, 2)));
    runUntil(world, saw("mimicReach"));
    expect(mimic(world).reaches).toBe(1);
    glyph(world, 2, owed(world, 2));
    expect(mimic(world).reaches).toBe(0);
  });
});

describe("the movements", () => {
  it("rolls after three signs: the reaches start again and the navigator reads", () => {
    const world = install();
    toSign(world);
    glyph(world, 2, not(owed(world, 2)));
    runUntil(world, saw("mimicReach"));
    for (let n = 0; n < 3; n++) {
      toSign(world);
      drawAll(world);
    }
    runUntil(world, saw("mimicRoll"));
    expect(mimic(world).reaches).toBe(0);
    toSign(world);
    expect(owed(world, 1)).toBeGreaterThanOrEqual(0);
    expect(owed(world, 2)).toBe(-1);
  });

  it("changes a changing sign on its beat, and the old one is then wrong", () => {
    const world = install([sign(2, true)]);
    toSign(world);
    const was = owed(world, 1);
    const at = mimic(world).phaseBeat + CFG.mimicChangeBeats;
    runUntil(world, (w) => w.beat >= at);
    expect(mimic(world).changed).toBe(true);
    expect(owed(world, 1)).not.toBe(was);
    expect(glyph(world, 1, was)).toContain("mimicWrong");
  });

  it("splits for both seats: one peel waits for the other, and either wrong brings both back", () => {
    const world = install([SPLIT, core("either")]);
    toSign(world);
    const [a, b] = [owed(world, 1), owed(world, 2)];
    expect(a).toBeGreaterThanOrEqual(0);
    expect(b).toBeGreaterThanOrEqual(0);
    expect(a).not.toBe(b);
    expect(mimicReadBy(mimic(world), 1)).toBe(b);
    expect(mimicReadBy(mimic(world), 2)).toBe(a);
    glyph(world, 1, a);
    expect(mimic(world).phase).toBe("sign");
    expect(mimicDraws(mimic(world), 1)).toBe(false);
    glyph(world, 2, not(b));
    runUntil(world, saw("mimicReach"));
    expect(mimic(world).peeled).toEqual([false, false]);
    drawAll(world);
    expect(mimic(world).phase).toBe("peeled");
    toCore(world);
  });
});

describe("the core", () => {
  it("takes a shot in its colour, refuses the other, and closes back to the split when run out", () => {
    const world = install([SPLIT, core("red"), SPLIT, core("cyan")]);
    toSign(world);
    drawAll(world);
    toCore(world);
    expect(mimicStruck(world, shot("cyan"))).toBe(true);
    expect(mimic(world).hits).toBe(0);
    runUntil(world, saw("mimicClose"), 10);
    expect(mimic(world).cursor).toBe(0);
    expect(mimic(world).phase).toBe("sign");
    drawAll(world);
    toCore(world);
    expect(mimicStruck(world, shot("red", MID + 1))).toBe(false);
    expect(mimicStruck(world, shot("red"))).toBe(true);
    expect(mimic(world).hits).toBe(1);
    expect(mimic(world).phase).toBe("clench");
  });

  it("plays the whole script through to the fall, and the wave's boss is gone", () => {
    const world = install();
    const seen = new Set<string>();
    for (let i = 0; i < TPB * 400 && world.boss !== null; i++) {
      const s = mimicBoss(world);
      if (s?.phase === "sign" && (!s.steps[s.cursor]?.changes || s.changed)) drawAll(world);
      else if (s?.phase === "core") {
        const color = s.steps[s.cursor]?.color;
        mimicStruck(world, shot(color === "cyan" ? "cyan" : "red"));
      } else for (const t of tick(world)) seen.add(t);
      for (const e of world.events) seen.add(e.type);
    }
    expect(world.boss).toBeNull();
    for (const t of ["mimicChange", "mimicRoll", "mimicHit", "mimicSpent", "mimicOut"])
      expect(seen.has(t)).toBe(true);
    for (const t of ["mimicWrong", "mimicLapse", "mimicReach", "breach"])
      expect(seen.has(t)).toBe(false);
  });
});

describe("the signs are the seeded Rng's", () => {
  it("never wears the same sign twice running", () => {
    const world = install(Array.from({ length: 12 }, () => sign(1)));
    let last = -1;
    for (let n = 0; n < 12; n++) {
      toSign(world);
      const now = owed(world, 2);
      expect(now).not.toBe(last);
      last = now;
      drawAll(world);
    }
  });

  it("hashes the same for the same seed and the same glyphs", () => {
    const play = (seed: number) => {
      const world = install(SCRIPT, seed);
      toSign(world);
      glyph(world, 2, not(owed(world, 2)));
      runUntil(world, saw("mimicReach"));
      return hashWorld(world);
    };
    expect(play(7)).toBe(play(7));
  });
});
