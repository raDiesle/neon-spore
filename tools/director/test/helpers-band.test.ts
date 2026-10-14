import { describe, expect, test } from "bun:test";
import { batonBoss, batonLocked, failHolds, lostAsks, mirrorHoldsControls } from "@neon-spore/sim";
import { groupRows } from "../src/helpers-def.js";
import { HELPER_GROUPS, helperPose } from "../src/helpers-page.js";
import { BATON_GREY, WRONG_COLOUR } from "../src/helpers-poses-band.js";

/**
 * The frames CONTROLS › HELPERS draws for the band put out, a wave lost to
 * the wrong colour and the thumb's ring (`helpers-poses-band.ts`), each held
 * on a tick its helper is drawn in. Out of `helpers-page.test.ts` on line
 * count.
 */

const row = (name: string) => {
  const found = HELPER_GROUPS.flatMap(groupRows).find((h) => h.name === name);
  if (found === undefined) throw new Error(`no HELPERS row ${name}`);
  return found;
};

describe("the band put out, the wrong colour and the thumb", () => {
  test("the wrong colour's frame holds the lost field before the question", () => {
    const w = WRONG_COLOUR.build();
    expect(failHolds(w)).toBe(true);
    expect(w.failCause).toBe("wrongColour");
    // `drawFailCause` gives way to the lost screen once it asks.
    expect(lostAsks(w)).toBe(false);
  });

  test("the grey panel's frame has the pilot's seat locked", () => {
    const w = BATON_GREY.build();
    const b = batonBoss(w);
    expect(b !== null && batonLocked(b, 1, w.beat)).toBe(true);
  });

  test("LOCKED — WATCH is drawn over a band THE MIRROR holds", () => {
    expect(mirrorHoldsControls(helperPose(row("LOCKED — WATCH")).build())).toBe(true);
  });

  test("the thumb's ring is handed a thumb, inside the cut it is drawn in", () => {
    const pose = helperPose(row("THE THUMB'S RING"));
    const w = pose.build();
    const thumb = pose.thumb?.(w);
    const at = pose.at?.(w);
    expect(thumb).toBeDefined();
    expect(at).toBeDefined();
    if (thumb === undefined || at === undefined) return;
    const half = (pose.span ?? 0) / 2;
    expect(Math.abs(thumb.col - at.col)).toBeLessThan(half);
    expect(Math.abs(thumb.row - at.row)).toBeLessThan(half);
  });
});
