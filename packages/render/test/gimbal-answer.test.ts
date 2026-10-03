import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import {
  BEARING_TURN,
  gimbalShownMilli,
  INNER,
  NO_BEARING,
  OUTER,
  type World,
} from "@neon-spore/sim";
import { gimbalFaceMilli } from "../src/gimbal-shape.js";
import { computeLayout } from "../src/layout.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, ROLES, VIEWPORT } from "./frame-harness.js";
import { drawn, frame, hung, leaking, still, turning, words } from "./gimbal-frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * What THE GIMBAL's cradle says back: the fold that keeps true true, the
 * knurl under a thumb, the one word to each seat, and the kicks a shear and
 * a seam hit throw. The six poses themselves are `gimbal-frame.test.ts`;
 * both pages set them through `gimbal-frame-harness.ts`.
 */

beforeAll(() => {
  installCanvasGlobals();
  for (const role of ROLES) drawn(hung(), role, 3);
});

const L = computeLayout(VIEWPORT, CFG, "test");

describe("THE GIMBAL's cradle answering", () => {
  it("mirrors both the ring and its mark together, so true stays true under the fold", () => {
    // `gimbalFaceMilli` is the one place a true bearing becomes a drawn one,
    // and the ring and the mark both go through it. A fold that reached one
    // and not the other would put the mark where the ring can never be — so
    // the check is that the mirror is the same function for both, whichever
    // ring and whichever seat, rather than a drawn frame: no wave puts this
    // boss under a flip, and `computeLayout` only folds one the wave names
    // (`field-flip.ts`).
    const folded = { ...L, flip: true };
    for (const ring of [OUTER, INNER] as const) {
      for (const milli of [0, 125, 400, 750, 999]) {
        expect(gimbalFaceMilli(L, milli, ring)).toBe(gimbalShownMilli(milli, ring));
        expect(gimbalFaceMilli(folded, milli, ring)).toBe(
          (BEARING_TURN - gimbalShownMilli(milli, ring)) % BEARING_TURN,
        );
      }
    }
  });

  it("lights the knurl under a thumb, on the rim that thumb is on and no other", () => {
    // The knurl is the visible half of the hit test (`gimbal-grip.ts`): a rim
    // is drawn with it whenever an alignment is up, and it is lit only while
    // that seat's hand is reported on it. So the tell is a screen that changes
    // when its own seat takes hold and does not when the other seat does.
    const held = (outer: number, inner: number) => (w: World) => {
      const s = turning(w, 200, 200);
      s.handMilli = [outer, inner];
    };
    const loose = held(NO_BEARING, NO_BEARING);
    expect(frame("p1", held(300, NO_BEARING)).text).not.toBe(frame("p1", loose).text);
    expect(frame("p2", held(NO_BEARING, 300)).text).not.toBe(frame("p2", loose).text);
    // And neither seat is told the other's hand is on, which is the rule the
    // rings themselves are drawn under.
    expect(frame("p1", held(NO_BEARING, 300)).text).toBe(frame("p1", loose).text);
    expect(frame("p2", held(300, NO_BEARING)).text).toBe(frame("p2", loose).text);
  });

  it("says one word to each seat, on that seat's own ring", () => {
    // The one boss whose reading answers with two cues on one beat
    // (`boss-cue-read-y.ts`): a word on his rim and a word on hers, never in
    // the same place and never a direction. The still drum asks for nothing.
    const up = (w: World) => {
      turning(w, 200, 200);
    };
    const quiet = words(frame("p1", still));
    expect(words(frame("p1", up))).toBeGreaterThan(quiet);
    expect(words(frame("p2", up))).toBe(words(frame("p1", up)));
    // And the test screen, which is nobody's seat and holds both rings, still
    // carries one: the drawer takes the first cue a screen may see and stops,
    // so no screen ever says two things to do at once (`boss-cue.ts`).
    expect(words(frame("test", up))).toBe(words(frame("p1", up)));
    // And the leak is the one word with no seat on it: both screens get it.
    expect(words(frame("p1", leaking))).toBeGreaterThan(quiet);
    expect(words(frame("p2", leaking))).toBe(words(frame("p1", leaking)));
  });

  it.each(ROLES)("moves the whole cradle when a tooth comes off, on %s", (role) => {
    // The reactions are applied to the context and never to a path, so what a
    // shear changes is where everything is drawn rather than what is drawn
    // (`gimbal-fx.ts`). A frame with one thrown at it is a different frame.
    const quiet = frame(role, (w) => turning(w, 200, 200));
    const kicked = frame(role, (w) => turning(w, 200, 200), {
      type: "gimbalShear",
      teeth: 2,
      col: 5,
    });
    expect(kicked.text).not.toBe(quiet.text);
    expect(kicked.calls).toBeGreaterThan(50);
  });

  it.each(ROLES)("glares when the seam lands on the hull, on %s", (role) => {
    const quiet = frame(role, leaking);
    const hit = frame(role, leaking, { type: "gimbalSeamHit", col: 5 });
    expect(hit.text).not.toBe(quiet.text);
  });

  it("keeps nothing of one run in the next", () => {
    // Every pose is read off the world: two runs of the same state are the
    // same frame, and nothing outlives one (`gimbal-draw.ts` keeps no state).
    expect(frame("test", (w) => turning(w, 300, 600)).text).toBe(
      frame("test", (w) => turning(w, 300, 600)).text,
    );
  });
});
