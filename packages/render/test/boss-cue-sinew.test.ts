import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type SinewState,
  sinewBoss,
  sinewSum,
  sinewZone,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import { sinewWord } from "../src/sinew-word.js";
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
 * **THE SINEW's word, and the three silences**
 * (`render/src/sinew-word.ts`).
 *
 * It said `PULL` on a free ring and `SWAY` once the mass was falling, and it
 * said both of them **only while the ring was free** — so the one hand the fall
 * is asking anything of, the one already on, was the hand told nothing. That is
 * the first case below and it is a defect rather than a gap.
 *
 * What the rest are about is the slack, which is the only mechanic in this fight
 * nobody can diagnose from a screen: from `sinewDecayFibres` parted the tendon
 * creeps slack under a hand, only **both** hands off resets it
 * (`sim/sinew-hand.ts`), and she watches her own sum fall with her hand
 * perfectly still while he is shown nothing at all.
 *
 * And what no case here asserts is a magnitude, in either direction: *harder*,
 * *ease off* and *you are over* are this encounter, and the zone is on his
 * screen and the sum on hers (`showsSinewZone`, `showsSinewSum`). A field that
 * said any of them would be one seat's gauge read out on the other's glass.
 *
 * The reading is asked directly. Every other boss's words go through `bossCue`,
 * and this one's cannot: the word stands on the handle, and the handle's place
 * is the drawing's rather than the simulation's (`sinew-handles.ts`). The last
 * case runs a real frame to prove the two are wired together.
 *
 * The states are set rather than played into, as in `sinew-frame.test.ts`: the
 * pull, the hold, the snap and the fall are proved in `sim/test/sinew*.test.ts`.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);

function hung(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("sinew");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB; i++) step(world, []);
  return world;
}

function tendon(world: World): SinewState {
  const s = sinewBoss(world);
  if (s === null) throw new Error("the sinew wave hung no tendon");
  return s;
}

/** What the handle would say for this seat, with the drawing's two transients
 * passed as the drawing passes them. */
function say(
  world: World,
  player: 1 | 2,
  { falling = false, swinging = false } = {},
): { kind: string; word: string } | null {
  return sinewWord(world.cfg, tendon(world), player, falling, swinging);
}

/** One hand on at half its reach. */
function hand(s: SinewState, player: 1 | 2, milli = Math.floor(CFG.sinewReachMilli / 2)): void {
  if (player === 1) s.pullP1Milli = milli;
  else s.pullP2Milli = milli;
}

/** The sum put inside the zone, with both hands on. */
function inZone(world: World): SinewState {
  const s = tendon(world);
  s.zoneLowMilli = CFG.sinewZoneLowMilli;
  hand(s, 1, Math.floor(CFG.sinewZoneLowMilli * 0.6));
  hand(s, 2, Math.floor(CFG.sinewZoneLowMilli * 0.6));
  if (!(sinewSum(s) >= sinewZone(s, CFG).low && sinewSum(s) <= sinewZone(s, CFG).high)) {
    throw new Error("the arrangement did not put the sum in the zone");
  }
  return s;
}

/** The tendon gone slack past saving: both hands at their reach can no longer
 * make the zone's foot, which is the beat pulling harder stops being possible. */
function spent(world: World): SinewState {
  const s = tendon(world);
  s.fibres = CFG.sinewFibres - CFG.sinewDecayFibres;
  s.zoneLowMilli = CFG.sinewZoneLowMilli;
  s.slackMilli = CFG.sinewReachMilli * 2 - CFG.sinewZoneLowMilli + 1;
  return s;
}

describe("THE SINEW's word", () => {
  it("asks a hand already on the ring to sway the falling mass", () => {
    const world = hung();
    const s = tendon(world);
    hand(s, 1);
    hand(s, 2);
    // The walk wants both hands carried the same way past `sinewSwayMilli`
    // (`sim/sinew-step.ts`), so the held hand is the only hand it is asking.
    for (const player of [1, 2] as const) {
      expect(say(world, player, { falling: true })).toEqual({ kind: "CARRY", word: "SWAY" });
    }
  });

  it("offers the pull to a free ring, and to that seat only", () => {
    const world = hung();
    hand(tendon(world), 2);
    expect(say(world, 1)).toEqual({ kind: "CARRY", word: "PULL" });
    // Hers is on and the sum is nowhere near the zone: the pair's own
    // conversation, and the field says nothing about how much further.
    expect(say(world, 2)).toBeNull();
  });

  it("asks the hand in the zone to hold, which is the verb the pair gets wrong", () => {
    const world = hung();
    inZone(world);
    for (const player of [1, 2] as const) {
      expect(say(world, player)).toEqual({ kind: "HOLD", word: "HOLD" });
    }
  });

  it("says nothing about a sum over the zone's top", () => {
    const world = hung();
    const s = inZone(world);
    hand(s, 1, CFG.sinewReachMilli);
    hand(s, 2, CFG.sinewReachMilli);
    // Over the top and about to snap. *Ease off* is the sum read out on the
    // pilot's screen and the zone read out on the navigator's, so neither
    // hears it.
    expect(sinewSum(s)).toBeGreaterThan(sinewZone(s, CFG).high);
    expect(say(world, 1)).toBeNull();
    expect(say(world, 2)).toBeNull();
  });

  it("asks both hands to lift once no pull can reach the zone", () => {
    const world = hung();
    const s = spent(world);
    hand(s, 1, CFG.sinewReachMilli);
    hand(s, 2, CFG.sinewReachMilli);
    for (const player of [1, 2] as const) {
      expect(say(world, player)).toEqual({ kind: "STILL", word: "LIFT" });
    }
  });

  it("takes the free ring's pull away with it, rather than arguing with itself", () => {
    const world = hung();
    const s = spent(world);
    hand(s, 2, CFG.sinewReachMilli);
    // Only both hands off resets the slack, so a pull offered to his free ring
    // is the one thing that would stop her release from working.
    expect(say(world, 2)).toEqual({ kind: "STILL", word: "LIFT" });
    expect(say(world, 1)).toBeNull();
  });

  it("says nothing while the handles are swinging, or once the mass is down", () => {
    const world = hung();
    const s = inZone(world);
    expect(say(world, 1, { swinging: true })).toBeNull();
    expect(say(world, 2, { swinging: true })).toBeNull();
    s.outBeat = world.beat;
    expect(say(world, 1)).toBeNull();
    expect(say(world, 2, { falling: true })).toBeNull();
  });

  it("draws the word it chose, on the seat whose thumb it is", () => {
    const drawn = (role: ViewRole, set: (world: World, s: SinewState) => void): string[] => {
      const world = hung();
      set(world, tendon(world));
      const texts: TextBox[] = [];
      runFrames(world, role, 3, {
        every: 3,
        onCanvas: (c) => {
          c.texts = texts;
        },
      });
      return texts.map((t) => t.text);
    };
    const bothFree = (): void => {};
    expect(drawn("p1", bothFree)).toContain("PULL");
    expect(drawn("p2", bothFree)).toContain("PULL");
    // His hand on and the sum short of the zone: his ring says nothing now, and
    // hers is still being offered the pull.
    const his = (_w: World, s: SinewState): void => hand(s, 1);
    expect(drawn("p1", his)).not.toContain("PULL");
    expect(drawn("p2", his)).toContain("PULL");
    // And the two words no canvas in this suite had been handed before, both of
    // them over a ring with a thumb already on it.
    expect(
      drawn("p1", (world, s) => {
        s.fibres = 0;
        s.fallBeat = world.beat;
        hand(s, 1);
      }),
    ).toContain("SWAY");
    expect(
      drawn("p2", (world, s) => {
        spent(world);
        hand(s, 2, CFG.sinewReachMilli);
      }),
    ).toContain("LIFT");
  });
});
