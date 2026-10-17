import { afterEach, beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import {
  type BlisterGesture,
  blisterIsUp,
  createWorld,
  type SpawnEntry,
  step,
  type TimedCommand,
  ticksPerBeat,
} from "@neon-spore/sim";
import { BLISTER_DEATH, type BlisterDying } from "../src/blister-death.js";
import { BODY_HIT, hitFor } from "../src/body-hit.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, runFrames } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * A blister's death (`blister-death.ts`, `blister-death-fx.ts`): the seam
 * every `blister:death-*` candidate on VERSUS fills. Shipped, every record is
 * empty and the kill is every body's; filled, the body that was up is kept
 * past the blow and handed to the death, which redraws it by its own code.
 */

beforeAll(installCanvasGlobals);

const blister = (col: number, gesture: BlisterGesture): SpawnEntry => ({
  beat: 0,
  col,
  kind: "blister",
  color: null,
  row: 3,
  by: 2,
  gesture,
});

/** A TAP blister and a HOLD one, both tapped or held from player 2 until gone. */
function played() {
  const tpb = ticksPerBeat(CFG);
  return runFrames(createWorld(CFG, 3, [blister(2, "tap"), blister(6, "hold")]), "p2", tpb * 8, {
    every: 2,
    onTick: (tick, w) => {
      const inputs: TimedCommand[] = [];
      for (const c of w.creatures) {
        if (!blisterIsUp(c)) continue;
        if (c.blisterGesture === "hold") {
          inputs.push({ tick: w.tick, player: 2, command: { kind: "grip", id: c.id } });
        } else if (tick % (tpb / 2) === 1) {
          inputs.push({ tick: w.tick, player: 2, command: { kind: "tap", id: c.id } });
        }
      }
      step(w, inputs);
    },
  });
}

afterEach(() => {
  (BLISTER_DEATH.tap as { play: unknown }).play = null;
});

describe("a blister's death", () => {
  it("ships empty for every control, and the kill is every body's", () => {
    for (const g of Object.keys(BLISTER_DEATH) as BlisterGesture[]) {
      expect(BLISTER_DEATH[g].play).toBeNull();
      expect(hitFor("blister", undefined, g)).toBe(BODY_HIT);
    }
  });

  it("names its control on the kill", () => {
    const kills = played().events.filter((e) => e.type === "destroy");
    expect(kills.map((e) => (e.type === "destroy" ? e.gesture : null)).sort()).toEqual([
      "hold",
      "tap",
    ]);
  });

  it("filled, draws the body that was knocked out — for its own control only", () => {
    const seen: BlisterDying[] = [];
    (BLISTER_DEATH.tap as { play: unknown }).play = {
      life: 0.5,
      draw: (d: BlisterDying) => {
        seen.push(d);
        d.body(1 - d.at);
        d.control(1 - d.at);
      },
    };
    // The clover's wedges stand down for the control that goes its own way.
    expect(hitFor("blister", undefined, "tap").pieces.wedges).toBeLessThan(3);
    expect(hitFor("blister", undefined, "hold")).toBe(BODY_HIT);
    played();
    expect(seen.length).toBeGreaterThan(3);
    expect(new Set(seen.map((d) => d.gesture))).toEqual(new Set(["tap"]));
    expect(seen.every((d) => d.at >= 0 && d.at <= 1 && d.r > 0)).toBe(true);
    // And it is drawn where the body stood, above its pore.
    expect(seen.every((d) => d.poreY > d.y)).toBe(true);
  });
});
