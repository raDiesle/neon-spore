import { describe, expect, it } from "bun:test";
import type { Driver } from "../drive.js";
import { parseHold } from "../hold.js";
import type { PressSpec } from "../press-spec.js";
import { reachFirstFrame } from "../reach.js";
import { pressNote, type Sent } from "../report.js";
import type { Fired } from "../until.js";

/**
 * **THE INSTAR through `--hold`.** A capture ran three thousand ticks for an
 * `instarAnswer` with the pilot's thumb on mark 0 and heard nothing: the first
 * step's mark 0 is the navigator's, and every tick the round said
 * `instarRefuse` into a miss that only listed what fired. And a swipe could
 * not be written at all — it arms on the carry and counts on the lift, which
 * is neither a hold nor a carry-and-let-go.
 */

describe("THE INSTAR's swipe", () => {
  it("is the grab, the carry with the thumb down, and the lift, from the named seat", () => {
    const said = parseHold("instarSwipe2=0,y=1600,id=1");
    expect(said.map((s) => s.player)).toEqual([2, 2, 2]);
    expect(said.map((s) => s.command)).toEqual([
      { kind: "drag", target: "instarMark", on: true, fromMilli: 0, fromYMilli: 0, id: 1 },
      { kind: "drag", target: "instarMark", on: true, fromMilli: 0, fromYMilli: 1600, id: 1 },
      { kind: "drag", target: "instarMark", on: false, fromMilli: 0, fromYMilli: 1600, id: 1 },
    ]);
  });

  it("names which mark, like every other thumb on THE INSTAR", () => {
    expect(() => parseHold("instarSwipe=0,y=1600")).toThrow(/id=N/);
  });
});

describe("a thumb on the other seat's mark", () => {
  const refused: Sent[] = [{ tick: 20, player: 1, kind: "drag", heard: false }];
  const fired: Fired[] = [
    { tick: 20, type: "instarRefuse", detail: "mark=0 player=1 col=6" },
    { tick: 75, type: "beat" },
  ];

  it("is named as the other seat's, with the event that said so", () => {
    const said = pressNote(refused, fired);
    expect(said).toContain("instarRefuse (mark=0 player=1 col=6)");
    expect(said).toContain("instarMark2 the navigator's");
  });

  it("is said by a run that waited for an answer and never got one", async () => {
    const d: Driver = {
      advance: async () => null,
      press: async (_one: PressSpec) => {},
      tick: async () => 0,
      heard: () => fired,
      sent: () => refused,
    };
    const run = reachFirstFrame(d, 0, {
      advanceBy: 0,
      until: { event: "instarAnswer", cap: 3000 },
    });
    await expect(run).rejects.toThrow(/unheard: 1 of 1[\s\S]*instarRefuse/);
  });
});
