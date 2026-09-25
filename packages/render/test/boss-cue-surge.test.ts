import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type SurgeState,
  startWave,
  step,
  surgeBand,
  surgeBoss,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import { type SurgeWord, surgeWord } from "../src/surge-word.js";
import type { TextBox } from "./canvas-stub.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  runFrames,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE SURGE's second word, and the three silences**
 * (`render/src/surge-word.ts`).
 *
 * The queue said this boss *says nothing on the field at all* and it had said
 * `HOLD` since the grip marks shipped — the same staleness THE SINEW's entry
 * carried. What it had never said is the **lift**, which is the entire boss: the
 * only gesture that counts is both thumbs off the glass within a beat of each
 * other with the pressure at the notch, and the grip, the lance's fill, the
 * ready gate and the warden's tether have all spent the game training the pair
 * to hold on. A boss beaten by letting go with nothing on the field about
 * letting go.
 *
 * What the cases are really about is the **pair** of words: which one a seat
 * gets is that seat's own thumb, so on the beat the pressure is in the band with
 * one thumb on, the holding seat is asked to let go and the other is asked for
 * nothing. Two of the silences are that, and they are what would catch a lane
 * "helping" by putting a word under a thumb already doing its half.
 *
 * And nothing here asserts a magnitude. The pilot is shown the band and not the
 * pressure and the navigator the other way round, so *harder*, *nearly* and *you
 * are over* are the whole encounter and the field says none of them — which is
 * why `HOLD` does not tell under the band from over it. A word that went out at
 * the band's top would be the gauge itself, told by its own absence, to the seat
 * who cannot see it. That case is below.
 *
 * The reading is asked directly, as `boss-cue-sinew.test.ts` asks THE SINEW's:
 * the word stands on the grip mark, and the mark's place rides the bulb's swell
 * and the vent's sink, which are the drawing's rather than the simulation's. The
 * last case runs real frames to prove the two are wired together.
 *
 * The states are set rather than played into:
 * the charge, the vent, the burst and the eversion are proved in
 * `sim/test/surge*.test.ts`.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);

function hung(): { world: World; s: SurgeState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("surge");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB; i++) step(world, []);
  const s = surgeBoss(world);
  if (s === null) throw new Error("the surge wave hung no bulb");
  return { world, s };
}

/** What this seat's mark would carry, with the drawing's one transient passed
 * as the drawing passes it. */
function say(s: SurgeState, player: 1 | 2, refusing = false, warding = false): SurgeWord | null {
  return surgeWord(CFG, s, player, refusing, warding);
}

/** The pressure put in the middle of the notch's band. */
function inBand(s: SurgeState): void {
  const band = surgeBand(s, CFG);
  s.pressureMilli = Math.floor((band.low + band.high) / 2);
}

describe("THE SURGE's word", () => {
  it("offers the charge to a thumb that is off, and says nothing under one that is on", () => {
    const { s } = hung();
    s.heldP1 = true;
    expect(say(s, 2)).toEqual({ kind: "HOLD", word: "HOLD" });
    // The word is the kind, so the screen says one thing (`boss-cue-text.ts`).
    expect(say(s, 1)).toBeNull();
  });

  it("offers it to both while neither has taken hold", () => {
    const { s } = hung();
    expect(say(s, 1)).toEqual({ kind: "HOLD", word: "HOLD" });
    expect(say(s, 2)).toEqual({ kind: "HOLD", word: "HOLD" });
  });

  it("asks a thumb in the band to lift, which is the gesture the game untrains", () => {
    const { s } = hung();
    s.heldP1 = true;
    s.heldP2 = true;
    inBand(s);
    for (const player of [1, 2] as const) {
      expect(say(s, player)).toEqual({ kind: "STILL", word: "LIFT" });
    }
  });

  it("says nothing to the seat whose half of the lift is already done", () => {
    const { s } = hung();
    s.heldP1 = true;
    inBand(s);
    // `liftTick` is waiting on the hand that is still on, and hers is off: she
    // has nothing left to let go of, and the charge is not what this beat wants.
    expect(say(s, 1)).toEqual({ kind: "STILL", word: "LIFT" });
    expect(say(s, 2)).toBeNull();
  });

  it("offers the charge over the band exactly as it does under it", () => {
    const { s } = hung();
    const band = surgeBand(s, CFG);
    s.pressureMilli = Math.max(0, band.low - 1);
    expect(say(s, 1)?.word).toBe("HOLD");
    s.pressureMilli = Math.min(CFG.surgeBurstMilli - 1, band.high + 1);
    // A word that went out here would be the navigator's gauge read out on the
    // pilot's screen, by its own absence.
    expect(say(s, 1)?.word).toBe("HOLD");
    expect(say(s, 2)?.word).toBe("HOLD");
  });

  it("says nothing while the bulb refuses a thumb, or once it has gone out", () => {
    const { world, s } = hung();
    inBand(s);
    s.heldP1 = true;
    expect(say(s, 1, true)).toBeNull();
    expect(say(s, 2, true)).toBeNull();
    s.outBeat = world.beat;
    expect(say(s, 1)).toBeNull();
    expect(say(s, 2)).toBeNull();
  });

  it("draws the word it chose, on the mark whose thumb it is", () => {
    const drawn = (role: ViewRole, set: (s: SurgeState) => void): string[] => {
      const { world, s } = hung();
      set(s);
      const texts: TextBox[] = [];
      runFrames(world, role, 3, {
        every: 3,
        onCanvas: (c) => {
          c.texts = texts;
        },
      });
      return texts.map((t) => t.text);
    };
    const bothOff = (): void => {};
    expect(drawn("p1", bothOff)).toContain("HOLD");
    expect(drawn("p2", bothOff)).toContain("HOLD");
    // The word no canvas in this suite had been handed before this entry: on a
    // mark with a thumb already on it.
    const lifting = (s: SurgeState): void => {
      s.heldP1 = true;
      s.heldP2 = true;
      inBand(s);
    };
    expect(drawn("p1", lifting)).toContain("LIFT");
    expect(drawn("p1", lifting)).not.toContain("HOLD");
    expect(drawn("p2", lifting)).toContain("LIFT");
  });
});

describe("THE SURGE's rock", () => {
  it("takes the pilot's charge off him for the hull, and leaves the navigator's alone", () => {
    const { s } = hung();
    // Both thumbs off, the pressure under the band: the charge is what each
    // mark says, and a rock of the bulb's in the air is worth more than it on
    // the one seat that can answer it.
    expect(say(s, 1)?.word).toBe("HOLD");
    expect(say(s, 1, false, true)).toEqual({ kind: "PRESS", word: "SHIELD" });
    expect(say(s, 2, false, true)?.word).toBe("HOLD");
  });

  it("fills the pilot's silence, on a thumb already down outside the band", () => {
    const { s } = hung();
    s.heldP1 = true;
    s.heldP2 = true;
    expect(say(s, 1)).toBeNull();
    expect(say(s, 1, false, true)).toEqual({ kind: "PRESS", word: "SHIELD" });
    expect(say(s, 2, false, true)).toBeNull();
  });

  it("never takes the lift, which is one beat wide where a rock is ten", () => {
    const { s } = hung();
    s.heldP1 = true;
    s.heldP2 = true;
    inBand(s);
    expect(say(s, 1, false, true)).toEqual({ kind: "STILL", word: "LIFT" });
    expect(say(s, 2, false, true)).toEqual({ kind: "STILL", word: "LIFT" });
  });

  it("says nothing at all while the bulb is refusing a thumb", () => {
    const { s } = hung();
    s.heldP1 = true;
    s.heldP2 = true;
    expect(say(s, 1, true, true)).toBeNull();
    expect(say(s, 2, true, true)).toBeNull();
  });
});
