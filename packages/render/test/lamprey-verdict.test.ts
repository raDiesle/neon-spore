import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import type { SimEvent, World } from "@neon-spore/sim";
import { rgba } from "../src/hex.js";
import {
  LAMPREY_GULLET,
  LAMPREY_HEAD,
  LAMPREY_TAIL,
  LAMPREY_TOOTH,
  LampreyVerdicts,
} from "../src/lamprey-verdicts.js";
import type { ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, ROLES, runFrames } from "./frame-harness.js";
import { GULLET, posed, stood } from "./lamprey-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE LAMPREY's marks answer a touch the way THE SINEW's do**
 * (`lamprey-verdicts.ts`, `.claude/skills/new-boss` §5): the tail wears the
 * halo on the holder's screen and the partner's ring and clock on the
 * worker's, the lit tooth the other way round, the gullet on both while it is
 * reared; each of the eel's words lands on the mark it names; and the verdict
 * reaches the field's frame on every screen.
 */

beforeAll(installCanvasGlobals);

const HALO = "createRadialGradient";
/** The partner's waiting clock's face, as `drawMarkWait` strokes it. */
const CLOCK = rgba(PALETTE.text, 0.85);
const col = 3;

function frame(role: ViewRole, arrange: (world: World) => void, said: SimEvent[] = []): string {
  const world = stood();
  arrange(world);
  const log: string[] = [];
  runFrames(world, role, 9, {
    every: 3,
    onCanvas: (c) => {
      c.log = log;
    },
    onTick: (tick, w) => {
      w.events.length = 0;
      if (tick === 2) w.events.push(...said);
    },
  });
  return log.join("|");
}

const count = (text: string, what: string) => text.split(what).length - 1;
const halos = (role: ViewRole, arrange: (w: World) => void) => count(frame(role, arrange), HALO);
const clocks = (role: ViewRole, arrange: (w: World) => void) => count(frame(role, arrange), CLOCK);
const loose = (w: World) => {
  posed(w, "leap");
};
const bite = (w: World) => {
  posed(w);
};
const reared = (w: World) => {
  posed(w, "rearing", GULLET);
};

describe("THE LAMPREY's marks asking", () => {
  it("haloes the tail for the holder and the tooth for the worker, each the other's clock", () => {
    // BITE is the pilot's to hold: the navigator taps.
    for (const role of ["p1", "p2"] as const) {
      expect(halos(role, bite)).toBeGreaterThan(halos(role, loose));
      expect(clocks(role, bite)).toBeGreaterThan(clocks(role, loose));
    }
    expect(clocks("test", bite)).toBe(clocks("test", loose));
  });

  it("haloes the gullet on both screens while it is reared, and waits on nobody", () => {
    for (const role of ["p1", "p2"] as const) {
      expect(halos(role, reared)).toBeGreaterThan(halos(role, loose));
      expect(clocks(role, reared)).toBe(clocks(role, loose));
    }
  });
});

describe("THE LAMPREY's verdict on a touch", () => {
  const on = (said: SimEvent[]) => {
    const v = new LampreyVerdicts();
    v.ingest(said);
    return [LAMPREY_TAIL, LAMPREY_HEAD, LAMPREY_TOOTH, LAMPREY_GULLET].map(
      (m) => v.verdicts.at(m)?.good ?? null,
    );
  };

  it("lands each of the eel's words on the mark it names", () => {
    expect(on([{ type: "lampreyGrip", side: 0, col }])).toEqual([true, null, null, null]);
    expect(on([{ type: "lampreyLoose", tooth: 0, col }])).toEqual([null, true, null, null]);
    expect(on([{ type: "lampreySlip", side: 1, col }])).toEqual([null, false, null, null]);
    expect(on([{ type: "lampreyFull", col }])).toEqual([null, false, null, null]);
    expect(on([{ type: "lampreyCrack", side: 1, tooth: 2, col }])).toEqual([
      null,
      null,
      true,
      null,
    ]);
    expect(on([{ type: "lampreySnap", tooth: 2, side: 1, col }])).toEqual([
      null,
      null,
      false,
      null,
    ]);
    expect(on([{ type: "lampreyHit", hits: 1, col }])).toEqual([null, null, null, true]);
    expect(on([{ type: "lampreyBite", side: 0, tooth: 0, row: 6, col }])).toEqual([
      null,
      null,
      null,
      null,
    ]);
  });

  it("forgets on reset", () => {
    const v = new LampreyVerdicts();
    v.ingest([{ type: "lampreySnap", tooth: 0, side: 1, col }]);
    v.clear();
    expect(v.verdicts.at(LAMPREY_TOOTH)).toBeNull();
  });

  it.each(ROLES)("reaches the field's frame, on %s", (role) => {
    const snap: SimEvent[] = [{ type: "lampreySnap", tooth: 0, side: 1, col }];
    expect(count(frame(role, bite, snap), PALETTE.red)).toBeGreaterThan(
      count(frame(role, bite), PALETTE.red),
    );
  });
});
