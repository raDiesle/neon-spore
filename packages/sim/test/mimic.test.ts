import { describe, expect, it } from "bun:test";
import { midCol } from "../src/config.js";
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
  mimicRows,
} from "../src/mimic.js";
import { mimicFrame, mimicWants } from "../src/mimic-frame.js";
import { mimicShapeSize } from "../src/mimic-shapes.js";
import { slowing } from "../src/slow.js";

/**
 * THE MIMIC's rules: one of you sees a picture of squares and says it, and
 * the other paints it on the board a tile at a time (`docs/spec/bosses.md`
 * §11.60). What a phone cannot show: that the picture each seat paints is on
 * the *other* seat's screen only; that only a seat with a picture to paint is
 * heard, and only inside its own frame; that a second tap clears; that every
 * picture stands in its frame, the same place every time, and fills it; that
 * no SLOW opens; that a picture peels only when every square under it is
 * exact; that a window run out is worn and then an arm reaches, three reaches
 * the hull; that a peel draws the arms back; that a roll trades the seats;
 * that a changing picture changes on its beat; that a split wants both
 * halves; that the core takes a tap on its tile, and a core run out closes
 * back to the split. AUTO playing it through:
 * `tools/director/test/autopilot-mimic.test.ts`.
 */

const CFG: SimConfig = { ...DEFAULT_CONFIG };
const TPB = ticksPerBeat(CFG);
const MID = midCol(CFG);

const sign = (reader: 1 | 2, changes = false, size = 3): MimicStep => ({
  ask: "sign",
  reader,
  changes,
  size,
  beats: 16,
});
const ROLL: MimicStep = { ask: "roll", reader: 1, changes: false, size: 0, beats: 2 };
const SPLIT: MimicStep = { ask: "split", reader: 1, changes: false, size: 3, beats: 16 };
const CORE: MimicStep = { ask: "core", reader: 1, changes: false, size: 0, beats: 4 };

/** The shipped wave's script, written out: sim tests do not read content. */
const SCRIPT: readonly MimicStep[] = [
  sign(1),
  sign(1),
  sign(1),
  ROLL,
  sign(2, false, 5),
  sign(2, true, 5),
  sign(2, true, 5),
  ROLL,
  SPLIT,
  CORE,
  SPLIT,
  CORE,
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

function press(world: World, player: 1 | 2, command: TimedCommand["command"]): string[] {
  return tick(world, [{ tick: world.tick, player, command }]);
}

/** A tap on the board, from `player`. */
const tap = (world: World, player: 1 | 2, col: number, row: number) =>
  press(world, player, { kind: "tapTile", col, row });

/** The picture `player` must paint, which the other seat's screen shows. */
const owed = (world: World, player: 1 | 2): number => mimic(world).signs[player - 1] ?? -1;

/** Every square of seat `seat`'s picture, as `[col, row, wants]`. */
function squares(world: World, seat: 1 | 2): [number, number, number][] {
  const s = mimic(world);
  const cols = world.cfg.cols;
  const origin = s.origins[seat - 1] ?? 0;
  const { w, h } = mimicShapeSize(owed(world, seat));
  const out: [number, number, number][] = [];
  for (let dr = 0; dr < h; dr++) {
    for (let dc = 0; dc < w; dc++) {
      const [col, row] = [(origin % cols) + dc, Math.floor(origin / cols) + dr];
      out.push([col, row, mimicWants(world, s, seat, col, row)]);
    }
  }
  return out;
}

/** Seat `seat` paints its picture, skipping the last `leave` squares it wants. */
function paint(world: World, seat: 1 | 2, leave = 0): void {
  const want = squares(world, seat).filter(([, , w]) => w > 0);
  for (const [col, row] of want.slice(0, want.length - leave)) tap(world, seat, col, row);
}

/** Every picture up painted right by the seat that owes it. */
function paintAll(world: World): void {
  for (const seat of [1, 2] as const) if (mimicDraws(mimic(world), seat)) paint(world, seat);
}

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

/** A tap on the core's tile, or `col` along its row. */
const strike = (world: World, col = MID): string[] => tap(world, 1, col, world.cfg.mimicCoreRow);

describe("THE MIMIC's picture", () => {
  it("slaps into shape, then shows the pilot a picture the navigator must paint, with no SLOW", () => {
    const world = install();
    expect(mimic(world).phase).toBe("entering");
    const seen = toSign(world);
    const s = mimic(world);
    expect(seen.has("mimicSign")).toBe(true);
    expect(s.signs[0]).toBe(-1);
    expect(s.signs[1]).toBeGreaterThanOrEqual(0);
    expect(mimicReadBy(s, 1)).toBe(s.signs[1] ?? -2);
    expect(mimicReadBy(s, 2)).toBe(-1);
    expect(slowing(world)).toBe(false);
  });

  it("stands every picture in its frame, centred and low, and filling it", () => {
    const world = install(Array.from({ length: 12 }, (_, n) => sign(1, false, n < 6 ? 3 : 5)));
    for (let n = 0; n < 12; n++) {
      toSign(world);
      const s = mimic(world);
      const step = s.steps[s.cursor] ?? SPLIT;
      const frame = mimicFrame(CFG, step, 2);
      expect(s.origins[1]).toBe(frame.col + frame.row * CFG.cols);
      expect(mimicShapeSize(owed(world, 2))).toEqual({ w: step.size, h: step.size });
      expect(frame.col + (frame.size - 1) / 2).toBe(MID);
      expect(frame.row + (frame.size - 1) / 2).toBe(CFG.mimicFrameRow);
      expect(frame.row + frame.size).toBeLessThanOrEqual(mimicRows(CFG));
      paintAll(world);
    }
  });

  it("hears the painter and not the reader, only in the frame, and clears a square tapped twice", () => {
    const world = install();
    toSign(world);
    const f = mimicFrame(CFG, sign(1), 2);
    const at = f.col + f.row * CFG.cols;
    expect(tap(world, 1, f.col, f.row)).not.toContain("mimicPaint");
    expect(mimic(world).paint[at]).toBe(0);
    expect(tap(world, 2, f.col - 1, f.row)).not.toContain("mimicPaint");
    expect(tap(world, 2, f.col, f.row - 1)).not.toContain("mimicPaint");
    expect(tap(world, 2, f.col, f.row)).toContain("mimicPaint");
    expect(mimic(world).paint[at]).toBe(1);
    tap(world, 2, f.col, f.row);
    expect(mimic(world).paint[at]).toBe(0);
  });

  it("peels only once every square is exact, and a stray in the frame holds the peel", () => {
    const world = install();
    toSign(world);
    paint(world, 2, 1);
    expect(mimic(world).phase).toBe("sign");
    const bare = squares(world, 2).find(([, , w]) => w === 0);
    const want = squares(world, 2).filter(([, , w]) => w > 0);
    const [col, row] = want[want.length - 1] ?? [0, 0];
    if (bare !== undefined) tap(world, 2, bare[0], bare[1]);
    expect(tap(world, 2, col, row)).not.toContain("mimicPeel");
    if (bare !== undefined) expect(tap(world, 2, bare[0], bare[1])).toContain("mimicPeel");
    expect(mimic(world).phase).toBe("peeled");
    expect(mimic(world).peels).toBe(1);
  });

  it("wears a window run out, then reaches; three reaches in a movement strike the hull", () => {
    const world = install();
    toSign(world);
    for (let r = 1; r <= CFG.mimicReaches; r++) {
      runUntil(world, saw("mimicLapse"), 30);
      expect(mimic(world).phase).toBe("mimicking");
      runUntil(world, saw("mimicReach"));
      if (r < CFG.mimicReaches) {
        expect(mimic(world).reaches).toBe(r);
        toSign(world);
      }
    }
    expect(world.events.some((e) => e.type === "breach")).toBe(true);
    expect(mimic(world).reaches).toBe(0);
  });

  it("draws every arm back a step with a peel", () => {
    const world = install();
    toSign(world);
    runUntil(world, saw("mimicReach"), 40);
    expect(mimic(world).reaches).toBe(1);
    toSign(world);
    paint(world, 2);
    expect(mimic(world).reaches).toBe(0);
  });
});

describe("the movements", () => {
  it("rolls after three pictures: the reaches start again and the navigator reads", () => {
    const world = install();
    toSign(world);
    runUntil(world, saw("mimicReach"), 30);
    for (let n = 0; n < 3; n++) {
      toSign(world);
      paintAll(world);
    }
    runUntil(world, saw("mimicRoll"));
    expect(mimic(world).reaches).toBe(0);
    toSign(world);
    expect(owed(world, 1)).toBeGreaterThanOrEqual(0);
    expect(owed(world, 2)).toBe(-1);
    expect(mimicShapeSize(owed(world, 1))).toEqual({ w: 5, h: 5 });
  });

  it("changes a changing picture on its beat, and the paint stays where it was", () => {
    const world = install([sign(2, true)]);
    toSign(world);
    paint(world, 1, 1);
    const s = mimic(world);
    const was = s.signs[0];
    const painted = [...s.paint];
    const at = s.phaseBeat + CFG.mimicChangeBeats;
    runUntil(world, (w) => w.beat >= at);
    expect(mimic(world).changed).toBe(true);
    expect(s.signs[0]).not.toBe(was);
    expect(mimic(world).paint).toEqual(painted);
  });

  it("splits for both seats, one half each side: one peel waits for the other", () => {
    const world = install([SPLIT, CORE]);
    toSign(world);
    const [a, b] = [owed(world, 1), owed(world, 2)];
    expect(a).toBeGreaterThanOrEqual(0);
    expect(b).toBeGreaterThanOrEqual(0);
    expect(mimicReadBy(mimic(world), 1)).toBe(b);
    expect(mimicReadBy(mimic(world), 2)).toBe(a);
    const mid = MID;
    for (const [col] of squares(world, 1)) expect(col).toBeLessThan(mid);
    for (const [col] of squares(world, 2)) expect(col).toBeGreaterThan(mid);
    paint(world, 1);
    expect(mimic(world).phase).toBe("sign");
    expect(mimicDraws(mimic(world), 1)).toBe(false);
    paint(world, 2);
    expect(mimic(world).phase).toBe("peeled");
    toCore(world);
  });
});

describe("the core", () => {
  it("takes a tap on its tile or beside it, and closes back to the split when run out", () => {
    const world = install([SPLIT, CORE, SPLIT, CORE]);
    toSign(world);
    paintAll(world);
    toCore(world);
    runUntil(world, saw("mimicClose"), 10);
    expect(mimic(world).hits).toBe(0);
    expect(mimic(world).cursor).toBe(0);
    expect(mimic(world).phase).toBe("sign");
    paintAll(world);
    toCore(world);
    expect(slowing(world)).toBe(false);
    expect(strike(world, MID + 2)).not.toContain("mimicHit");
    expect(strike(world, MID + 1)).toContain("mimicHit");
    expect(mimic(world).hits).toBe(1);
    expect(mimic(world).phase).toBe("clench");
  });

  it("plays the whole script through to the fall, and the wave's boss is gone", () => {
    const world = install();
    const seen = new Set<string>();
    for (let i = 0; i < TPB * 400 && world.boss !== null; i++) {
      const s = mimicBoss(world);
      if (s?.phase === "sign" && (!s.steps[s.cursor]?.changes || s.changed)) paintAll(world);
      else if (s?.phase === "core") strike(world);
      else for (const t of tick(world)) seen.add(t);
      for (const e of world.events) seen.add(e.type);
    }
    expect(world.boss).toBeNull();
    for (const t of ["mimicChange", "mimicRoll", "mimicHit", "mimicSpent", "mimicOut"])
      expect(seen.has(t)).toBe(true);
    for (const t of ["mimicLapse", "mimicReach", "breach"]) expect(seen.has(t)).toBe(false);
  });
});

describe("the pictures are the seeded Rng's", () => {
  it("never puts the same picture up twice running", () => {
    const world = install(Array.from({ length: 12 }, () => sign(1)));
    let last = -1;
    for (let n = 0; n < 12; n++) {
      toSign(world);
      const now = owed(world, 2);
      expect(now).not.toBe(last);
      last = now;
      paintAll(world);
    }
  });

  it("hashes the same for the same seed and the same taps", () => {
    const play = (seed: number) => {
      const world = install(SCRIPT, seed);
      toSign(world);
      paint(world, 2, 1);
      tap(world, 2, 0, mimicRows(CFG) - 1);
      runUntil(world, saw("mimicReach"));
      return hashWorld(world);
    };
    expect(play(7)).toBe(play(7));
  });
});
