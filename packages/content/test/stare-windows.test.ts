import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  type SimConfig,
  stareBoss,
  startWave,
  step,
  ticksPerBeat,
} from "@neon-spore/sim";
import { WAVES } from "../src/index.js";

/**
 * THE STARE's wave is authored *against the eye's own cycle*, and until this
 * file existed that was a sentence in `act-7c.ts`'s comment and nothing more.
 *
 * The rule the comment states: **a rock is entered inside a look and a colour
 * inside a working window.** A rock is answered by the dome, which is player
 * 1's, and a colour by the trigger, which is player 2's — so a look that takes
 * one seat is one the pair can still play through, and a colour needs both
 * seats free. It held when it was written and stopped holding the moment
 * `stareTellBeats` or `stareLookGrowBeats` moved, because every window and
 * every look moves with them. Both moved on 17 September 2026 and every one of
 * the six rocks fell out of its look; nothing was red.
 *
 * So the windows are **measured off a real eye** here rather than restated:
 * step an empty wave with the boss installed and record which beats it is away
 * for and which it is looking on. A change to any of the five numbers in
 * `config-stare.ts` re-measures them, and the wave's own rows are then held
 * against what the eye actually does.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);

/** `[from, to)` in beats, for each phase the eye passes through. */
type Span = { phase: string; from: number; to: number };

/** The eye's phases over `n` beats of an empty wave — nothing else to end it. */
function spans(n: number): Span[] {
  const world = createWorld(CFG, 3);
  startWave(world, 6, [], [], { kind: "stare" });
  const out: Span[] = [];
  for (let i = 0; i < n * TPB; i++) {
    const eye = stareBoss(world);
    const phase = eye === null ? "gone" : eye.phase;
    const last = out.at(-1);
    if (last === undefined || last.phase !== phase) {
      if (last !== undefined) last.to = world.beat;
      out.push({ phase, from: world.beat, to: n });
    }
    step(world, []);
  }
  return out;
}

function stareWave() {
  const wave = WAVES.find((w) => w.id === "theStare");
  if (wave === undefined) throw new Error("no wave called theStare");
  return wave;
}

/** The last beat any entry is authored on, so nothing is measured short. */
function lastBeat(): number {
  return Math.max(...stareWave().entries.map((e) => e.beat));
}

describe("THE STARE's arrivals sit in the eye's own cycle", () => {
  it("enters every rock inside a look, where only one seat is frozen", () => {
    const looks = spans(lastBeat() + 4).filter((s) => s.phase === "looking");
    expect(looks.length).toBeGreaterThan(0);
    const rocks = stareWave().entries.filter((e) => e.kind === "meteor");
    expect(rocks.length).toBeGreaterThan(0);
    for (const rock of rocks) {
      const inside = looks.some((l) => rock.beat >= l.from && rock.beat < l.to);
      // Named in the failure, because the fix is always "move the beat into a
      // look" and the looks are what a reader has not got in front of them.
      expect({
        rock: rock.beat,
        looks: looks.map((l) => `${l.from}-${l.to}`),
        inside,
      }).toMatchObject({ inside: true });
    }
  });

  it("enters every colour inside a working window, where both seats are free", () => {
    const windows = spans(lastBeat() + 4).filter((s) => s.phase === "away");
    expect(windows.length).toBeGreaterThan(0);
    const colours = stareWave().entries.filter((e) => e.kind !== "meteor");
    expect(colours.length).toBeGreaterThan(0);
    for (const colour of colours) {
      const inside = windows.some((w) => colour.beat >= w.from && colour.beat < w.to);
      expect({
        colour: colour.beat,
        windows: windows.map((w) => `${w.from}-${w.to}`),
        inside,
      }).toMatchObject({ inside: true });
    }
  });

  it("leaves a rock clear beats between the eye opening and the hull", () => {
    // A rock falls a tile a beat from row 0 to the hull's last row, so one
    // entered on beat b is at the hull on b + (rows - 1) = b + 14. What makes a
    // look survivable is the gap between the look ending and that arrival: the
    // frozen seat gets its dome back before the rock lands, or the look was not
    // a look but a loss. Four is the floor rather than the aim — every rock the
    // wave authors today clears six or more, and the one that set that figure
    // was the tightest of the old cycle.
    const looks = spans(lastBeat() + 4).filter((s) => s.phase === "looking");
    const rocks = stareWave().entries.filter((e) => e.kind === "meteor");
    const clear = rocks.map((rock) => {
      const look = looks.find((l) => rock.beat >= l.from && rock.beat < l.to);
      if (look === undefined) throw new Error(`rock on beat ${rock.beat} is in no look`);
      return { rock: rock.beat, clear: rock.beat + CFG.rows - 1 - look.to };
    });
    expect(clear).toEqual([
      { rock: 20, clear: 9 },
      { rock: 23, clear: 12 },
      { rock: 47, clear: 6 },
      { rock: 51, clear: 10 },
      { rock: 80, clear: 6 },
      { rock: 85, clear: 11 },
    ]);
    for (const row of clear) expect(row.clear).toBeGreaterThanOrEqual(4);
  });
});
