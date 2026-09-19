import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import type { ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { count, drawn, frame, grown, hung, pullWord } from "./antiphon-frame-harness.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, ROLES } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE ANTIPHON's rail, on all three screens — the mirror of the organ, at
 * `antiphon-frame.test.ts`: the same states, set rather than played to, but
 * read from her side, and the one thing nothing else in the suite could
 * catch, that the **rail** is on the navigator's screen and not the pilot's.
 */

beforeAll(() => {
  installCanvasGlobals();
  for (const role of ROLES) drawn(hung(), role, 3);
});

describe("THE ANTIPHON's rail", () => {
  it("puts the rail on the navigator's screen and not the pilot's", () => {
    // A rail out is the candidates' rims in their colours where it is shown,
    // and the window's thread under it; on the pilot's the same rail is nothing.
    const railed = (role: ViewRole) => frame(role, (w) => void grown(w)).text;
    const none = (role: ViewRole) => frame(role, () => {}).text;
    const rim = (text: string, hex: string) => count(text, hex);
    expect(rim(railed("p2"), PALETTE.redRim)).toBeGreaterThan(rim(none("p2"), PALETTE.redRim));
    expect(rim(railed("p2"), PALETTE.cyanRim)).toBeGreaterThan(rim(none("p2"), PALETTE.cyanRim));
    expect(rim(railed("test"), PALETTE.redRim)).toBeGreaterThan(rim(none("test"), PALETTE.redRim));
    expect(rim(railed("p1"), PALETTE.redRim)).toBe(rim(none("p1"), PALETTE.redRim));
    expect(count(railed("p2"), PALETTE.shieldRim)).toBeGreaterThan(
      count(railed("p1"), PALETTE.shieldRim),
    );
    // And nothing on her screen marks the organ: the organ moved to another
    // candidate's place is the same picture.
    const organIs = (col: number) =>
      frame("p2", (w) => {
        const s = grown(w);
        const c = s.rail.find((r) => r.col === col);
        if (c) s.organs = [{ ...c, grownBeat: w.beat - CFG.antiphonGrowBeats }];
      }).text;
    expect(organIs(4)).toBe(organIs(6));
  });

  it("rings the candidates she may still pull, and strokes the ones she has", () => {
    // The ring and the stroke are both the dim tone, so a count cannot tell
    // one from the other; what a crossing has to be is a *different picture*
    // on her screen and the same one on his, which is the leak that matters.
    const railed = (role: ViewRole) => frame(role, (w) => void grown(w)).text;
    const crossed = (role: ViewRole) =>
      frame(role, (w) => {
        grown(w).crossed = [0];
      }).text;
    expect(crossed("p2")).not.toBe(railed("p2"));
    expect(crossed("p1")).toBe(railed("p1"));
  });

  it("fills the ring under her thumb, and says nothing of it on his screen", () => {
    const held = (role: ViewRole) =>
      frame(role, (w) => {
        grown(w).heldRail = 0;
      });
    const loose = (role: ViewRole) => frame(role, (w) => void grown(w));
    expect(count(held("p2").text, PALETTE.text)).toBeGreaterThan(
      count(loose("p2").text, PALETTE.text),
    );
    expect(held("p1").text).toBe(loose("p1").text);
  });

  it("says PULL once under her rail, and never on his screen", () => {
    // One word under the middle of the rail rather than one per candidate: a
    // word on the candidate she should cross off would be her own reading
    // handed back to her (`boss-cue-read-p.ts`).
    const world = hung();
    grown(world);
    expect(pullWord(drawn(world, "p2", 3).words).length).toBe(1);
    expect(pullWord(drawn(world, "p1", 3).words)).toEqual([]);
  });

  it("takes the word away while her thumb is on a candidate", () => {
    const world = hung();
    grown(world).heldRail = 1;
    expect(pullWord(drawn(world, "p2", 3).words)).toEqual([]);
  });
});
