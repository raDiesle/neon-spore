import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { NO_GRAB, type World } from "@neon-spore/sim";
import { Effects } from "../src/effects.js";
import { rgba } from "../src/hex.js";
import { PALETTE } from "../src/palette.js";
import {
  armed,
  BODY,
  count,
  down,
  drawn,
  frame,
  hung,
  L,
  pulled,
  tracing,
} from "./filament-states.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, ROLES } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE FILAMENT's body, its armed filament, the trace with the two thumbs
 * on it, the pull and its end, on all three screens.
 *
 * The states are **set** rather than played to, `instar-frame.test.ts`'s
 * arrangement: `sim/test/filament.test.ts` proves the drawing, the
 * following and the pull, and what this file asks is whether every branch
 * of the picture is one a canvas accepts — armed, traced, pulled, down, out
 * — and what nothing else could catch: that each screen shows **both
 * thumbs** and only the pilot's the way ahead, that a ring is green when its
 * move is open and red when it must wait, that the line's clock reddens as it
 * runs out, and that the whip and the hurt are transients the next run does
 * not inherit.
 */

beforeAll(() => {
  installCanvasGlobals();
  for (const role of ROLES) drawn(hung(), role, 3);
});

describe("THE FILAMENT's body", () => {
  it.each(ROLES)("hangs the body and pulses the armed free end, on %s", (role) => {
    const arm = frame(role, (w) => armed(w, 0));
    expect(arm.calls).toBeGreaterThan(100);
    expect(count(arm.text, BODY)).toBeGreaterThan(0);
    expect(count(arm.text, PALETTE.wispRim)).toBeGreaterThan(0);
    // No thumb is asked for yet: no ring, no word.
    expect(count(arm.text, PALETTE.red)).toBe(0);
  });

  it("shows the way ahead to the pilot alone, and both thumbs on every screen", () => {
    const p1 = frame("p1", (w) => tracing(w, 3, 1));
    const p2 = frame("p2", (w) => tracing(w, 3, 1));
    // The unlit path is dashed in the dim, and only where the pilot looks.
    expect(count(p1.text, PALETTE.dim)).toBeGreaterThan(count(p2.text, PALETTE.dim));
    // The owner, 25 September 2026: each screen follows the partner's thumb too.
    expect(frame("p1", (w) => tracing(w, 4, 1)).text).not.toBe(
      frame("p1", (w) => tracing(w, 4, 3)).text,
    );
    expect(frame("p2", (w) => tracing(w, 3, 1)).text).not.toBe(
      frame("p2", (w) => tracing(w, 4, 1)).text,
    );
  });

  it("draws this screen's ring green when its move is open and red when it must wait", () => {
    const open = frame("p1", (w) => tracing(w, 2, 1));
    // A tile already lit this beat: a second would snap it.
    const soon = frame("p1", (w) => {
      tracing(w, 2, 1).headBeat = w.beat;
    });
    // She is at the window: a tile more would put the line dark.
    const full = frame("p1", (w) => tracing(w, CFG.filamentGapTiles, 0));
    expect(count(open.text, PALETTE.good)).toBeGreaterThan(count(soon.text, PALETTE.good));
    expect(count(soon.text, PALETTE.red)).toBeGreaterThan(count(open.text, PALETTE.red));
    expect(count(full.text, PALETTE.red)).toBeGreaterThan(count(open.text, PALETTE.red));
    // Her next lit tile is his: she waits.
    const hers = frame("p2", (w) => tracing(w, 3, 1));
    const his = frame("p2", (w) => tracing(w, 3, 2));
    expect(count(his.text, PALETTE.red)).toBeGreaterThan(count(hers.text, PALETTE.red));
  });

  it.each(ROLES)("lights the ring under a thumb that has taken hold, on %s", (role) => {
    // A gap of two: both moves are open, so both rings are green.
    const held = frame(role, (w) => tracing(w, 3, 1));
    const bare = frame(role, (w) => {
      tracing(w, 3, 1).grab = [NO_GRAB, NO_GRAB];
    });
    expect(held.text).not.toBe(bare.text);
    expect(count(held.text, PALETTE.goodRim)).toBeGreaterThan(count(bare.text, PALETTE.goodRim));
  });

  it.each(ROLES)(
    "runs the line's clock round the ring it waits on, red at the end, on %s",
    (role) => {
      const fresh = frame(role, (w) => tracing(w, 1, 0));
      const ending = frame(role, (w) => {
        const s = tracing(w, 1, 0);
        s.stillBeat = w.beat - CFG.filamentStallBeats + 1;
      });
      expect(count(ending.text, PALETTE.red)).toBeGreaterThan(count(fresh.text, PALETTE.red));
    },
  );

  it("puts the waiting clock on the partner's ring when the line waits on the partner", () => {
    // A gap of one is his move alone: her screen shows him waited on.
    const face = rgba(PALETTE.text, 0.85);
    expect(count(frame("p2", (w) => tracing(w, 1, 0)).text, face)).toBeGreaterThan(0);
    // At the window it is hers alone: his screen shows her waited on, hers does not show him.
    const full = (w: World) => tracing(w, CFG.filamentGapTiles, 0);
    expect(count(frame("p1", full).text, face)).toBeGreaterThan(0);
    expect(count(frame("p2", full).text, face)).toBe(0);
  });

  it.each(ROLES)("slides a pulled filament up and narrows the body, on %s", (role) => {
    const pull = frame(role, pulled);
    const trace = frame(role, (w) => tracing(w, 3, 1));
    expect(pull.text).not.toBe(trace.text);
    // The heart is struck red while the tools are in it, and only then: a pull is no fault.
    expect(count(pull.text, PALETTE.redRim)).toBeGreaterThan(0);
    expect(count(frame(role, (w) => pulled(w, 2)).text, PALETTE.redRim)).toBe(0);
    expect(count(pull.text, BODY)).toBeGreaterThan(0);
    // The win is green, and a traced line is not.
    expect(count(pull.text, rgba(PALETTE.good, 1).slice(0, 12))).toBeGreaterThan(0);
    // Every filament in the body but the last: a strand fewer to draw.
    const late = frame(role, (w) => tracing(w, 2, 1, 6));
    expect(count(late.text, PALETTE.wisp)).toBeLessThan(count(trace.text, PALETTE.wisp));
  });

  it.each(ROLES)("fades the body once the last filament is out, on %s", (role) => {
    const going = frame(role, down);
    const stood = frame(role, (w) => armed(w, 0));
    expect(count(going.text, BODY)).toBeLessThan(count(stood.text, BODY));
    expect(count(going.text, PALETTE.wispRim)).toBe(0);
    const gone = frame(role, (w) => {
      down(w).phaseBeat = w.beat - CFG.filamentOutBeats - 1;
    });
    expect(count(gone.text, BODY)).toBe(0);
  });

  it("keeps the whip, the dark and the jolt as transients the next run does not inherit", () => {
    const fx = new Effects();
    fx.ingest(
      [
        { type: "filamentSnap", col: 5 },
        { type: "filamentDark", col: 5 },
        { type: "filamentPulled", index: 0, col: 5 },
        { type: "filamentDown", col: 5 },
      ],
      L,
      0,
      () => 0,
      CFG,
    );
    fx.update(1 / 60, L);
    expect(fx.boss.filament.whip).not.toBe(0);
    expect(fx.boss.filament.dark).toBeGreaterThan(0);
    expect(fx.boss.filament.jolt).toBeGreaterThan(0);
    expect(fx.boss.filament.hurt.value).toBeGreaterThan(0);
    expect(fx).not.toEqual(new Effects());
    fx.reset();
    expect(fx).toEqual(new Effects());
  });
});
