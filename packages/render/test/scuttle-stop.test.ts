import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { midCol } from "@neon-spore/sim";
import { BoltStops } from "../src/bolt-stop.js";
import { computeLayout, tileCX } from "../src/layout.js";
import { installCanvasGlobals } from "./canvas-stub.js";
import { CFG, FRAME_TIMEOUT_MS, ROLES, VIEWPORT } from "./frame-harness.js";
import { draw, live, socketOver, stood } from "./scuttle-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **A bolt stops on what it meets**, for THE SCUTTLE (`scuttle-stop.ts`),
 * past `core-stop.test.ts`'s row: a part the pilot swung is met where it
 * now hangs, and the column it left is the frame's.
 */

beforeAll(() => installCanvasGlobals());

const MID = midCol(CFG);

describe("THE SCUTTLE stops a bolt", () => {
  it.each(ROLES)(
    "on a swung part where it hangs, and on the frame where it left, on %s",
    (role) => {
      const l = computeLayout(VIEWPORT, CFG, role);
      const world = stood();
      const s = live(world, socketOver(MID));
      s.swung = s.live;
      s.swungCol = MID + 1;
      const stops = new BoltStops();
      draw(world, stops, l);
      const there = stops.meets(MID + 1, tileCX(l, MID + 1), "cyan");
      expect(there?.hit).toBe("target");
      expect(there?.y ?? 0).toBeGreaterThan(l.gridTop);
      expect(stops.meets(MID, tileCX(l, MID), "cyan")?.hit).toBe("body");
    },
  );
});
