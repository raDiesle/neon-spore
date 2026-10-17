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
import {
  BLISTER_DEATH,
  BLISTER_DEATH_HIT,
  type BlisterDeathPlay,
  type BlisterDying,
  blisterDeathOf,
} from "../src/blister-death.js";
import { BODY_HIT, hitFor } from "../src/body-hit.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  runFrames,
  stubCanvas,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * A blister's death (`blister-death.ts`, `blister-death-fx.ts`): every
 * control has two, a kill plays one picked by its seed, and the body that was
 * up is kept past the blow and handed to the death, which redraws it by its
 * own code. An empty list is every body's kill, the clover's.
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

const SHIPPED_TAP = BLISTER_DEATH.tap.plays;
const HOLD_PLAYS = BLISTER_DEATH.hold.plays;
const setPlays = (g: BlisterGesture, plays: readonly BlisterDeathPlay[]) => {
  (BLISTER_DEATH[g] as { plays: readonly BlisterDeathPlay[] }).plays = plays;
};

afterEach(() => {
  setPlays("tap", SHIPPED_TAP);
  setPlays("hold", HOLD_PLAYS);
});

describe("a blister's death", () => {
  it("ships two deaths for every control, and the kill stands its wedges down", () => {
    for (const g of Object.keys(BLISTER_DEATH) as BlisterGesture[]) {
      expect(BLISTER_DEATH[g].plays.length).toBe(2);
      expect(hitFor("blister", undefined, g)).toBe(BLISTER_DEATH_HIT);
    }
  });

  it("picks either of a control's two, the same for the same kill", () => {
    for (const g of Object.keys(BLISTER_DEATH) as BlisterGesture[]) {
      const picked = new Set<BlisterDeathPlay | null>();
      for (let seed = 0; seed < 64; seed++) {
        expect(blisterDeathOf(g, seed)).toBe(blisterDeathOf(g, seed));
        picked.add(blisterDeathOf(g, seed * 7919 + 13));
      }
      expect(picked).toEqual(new Set(BLISTER_DEATH[g].plays));
    }
  });

  it("draws every one of the fourteen, through the body and its control, start to end", () => {
    const { ctx } = stubCanvas();
    for (const g of Object.keys(BLISTER_DEATH) as BlisterGesture[]) {
      for (const play of BLISTER_DEATH[g].plays) {
        let bodies = 0;
        for (const at of [0, 0.1, 0.3, 0.5, 0.7, 0.9, 1]) {
          play.draw({
            ctx: ctx as unknown as CanvasRenderingContext2D,
            ...{ x: 200, y: 300, r: 20, poreY: 316, gesture: g, spin: 1, seed: 1234 },
            way: { dx: 1, dy: 0 },
            ...{ age: at * play.life, at, tile: 40, time: 3 },
            body: (h, bend) => {
              expect(h).toBeGreaterThanOrEqual(0);
              expect(h).toBeLessThanOrEqual(1);
              bend?.(ctx as unknown as CanvasRenderingContext2D);
              bodies++;
            },
            control: (_alpha, bend) => bend?.(ctx as unknown as CanvasRenderingContext2D),
          });
        }
        expect(bodies).toBeGreaterThan(0);
      }
    }
  });

  it("emptied, is every body's kill", () => {
    setPlays("tap", []);
    expect(blisterDeathOf("tap", 5)).toBeNull();
    expect(hitFor("blister", undefined, "tap")).toBe(BODY_HIT);
  });

  it("names its control on the kill", () => {
    const kills = played().events.filter((e) => e.type === "destroy");
    expect(kills.map((e) => (e.type === "destroy" ? e.gesture : null)).sort()).toEqual([
      "hold",
      "tap",
    ]);
  });

  it("draws the body that was knocked out — for its own control only", () => {
    const seen: BlisterDying[] = [];
    setPlays("tap", [
      {
        life: 0.5,
        draw: (d: BlisterDying) => {
          seen.push(d);
          d.body(1 - d.at);
          d.control(1 - d.at);
        },
      },
    ]);
    setPlays("hold", []);
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
