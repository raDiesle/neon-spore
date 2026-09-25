import { describe, expect, test } from "bun:test";
import { controlSet, INSTAR_SCRIPT } from "@neon-spore/content";
import { computeLayout, type Field, type Viewport } from "@neon-spore/render";
import {
  createWorld,
  DEFAULT_CONFIG,
  faultsNow,
  framePhase,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { bindCueKey } from "../src/stage-cue-key.js";
import { installDom } from "./fake-dom.js";

/**
 * **A held `3` plays the whole scene**, which is the owner's second report of
 * 20 September 2026: *when the first sequence was done, the next sequence
 * does not work with `3`.*
 *
 * It did not, and the reason was that the key armed its thumbs once, on the
 * press. A step landing takes its marks away and the next pose puts new ones
 * somewhere else, so from the second pose on there was a key held over a
 * hand that had nothing in it. The key now looks again on every tick, which
 * is what this pins: one press at the first pose, held, and THE INSTAR's own
 * script is played to the end **without a single strike on the hull** —
 * seven morphs, thirteen marks, both seats and a mark they share, and each
 * one of the six gestures.
 *
 * It is the one test that runs the shipped script rather than a made-up step,
 * on purpose: the figures in `content/instar-script.ts` are what the pair is
 * actually given, and a pacing that fits a test scene but not `armed`'s three
 * eggs inside `instarTogetherBeats` would be a rig that only works on the
 * easy pose (`stage-cue-key.ts`, `pace`).
 */

const CFG = DEFAULT_CONFIG;
const VIEWPORT: Viewport = { width: 900, height: 1600, dpr: 2 };

function fieldOf(world: World, seat: 1 | 2): Field {
  return {
    creatures: world.creatures,
    cannonCol: world.cannonCol,
    shieldCol: world.shieldCol,
    beatPhase: framePhase(world),
    skinY: null,
    beat: world.beat,
    waveBeat: world.waveBeat,
    tick: world.tick,
    seat,
    cfg: CFG,
    boss: world.boss,
    controls: controlSet("default"),
    faults: faultsNow(world),
    well: false,
  };
}

describe("the key over a whole scene", () => {
  test("one press, held, plays THE INSTAR's whole script and never takes a strike", () => {
    const world = createWorld({ ...CFG }, 4);
    startWave(world, 0, [], [], { kind: "instar", steps: INSTAR_SCRIPT });
    const l = computeLayout(VIEWPORT, CFG, "test");
    const dom = installDom();
    const pending: TimedCommand[] = [];
    const seen: string[] = [];
    try {
      const hand = bindCueKey({
        layout: () => l,
        field: () => fieldOf(world, 1),
        world: () => world,
        role: () => "test",
        send: (player, command) => pending.push({ tick: world.tick, player, command }),
      });
      dom.press("3");
      // Long enough for every morph, window and landing in the script, and
      // for the body to hang after the last of them (`instarOutBeats`).
      for (let i = 0; i < ticksPerBeat(CFG) * 160 && world.boss !== null; i++) {
        hand.tick();
        step(world, pending.splice(0));
        for (const e of world.events) if (e.type.startsWith("instar")) seen.push(e.type);
      }
    } finally {
      dom.restore();
    }
    expect(seen).not.toContain("instarStrike");
    expect(seen).not.toContain("instarSlip");
    // Every step landed, and the body down after the last of them.
    expect(seen.filter((e) => e === "instarLand")).toHaveLength(INSTAR_SCRIPT.length);
    expect(seen).toContain("instarDown");
    expect(world.boss).toBeNull();
  });
});
