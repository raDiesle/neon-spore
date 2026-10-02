import { describe, expect, it } from "bun:test";
import { gorgeHeard } from "../src/gorge-hand.js";
import {
  gorgeAsks,
  gorgeBottom,
  gorgeOffers,
  gorgeTapSeat,
  midCol,
  type World,
} from "../src/index.js";
import { beats, CFG, hit, ORDERED, open, RING, ROW, sack, sate } from "./gorge-kit.js";

/**
 * THE GORGE's one thumb (`gorge-hand.ts`): **player 1's tap on the ring's
 * bottom bubble**, `gorgeOpenTaps` of which open it to shots. Which bubbles a
 * seat is offered and asked for (`gorgeOffers`, `gorgeAsks`), that the press
 * is gated on the offer and nothing else, and that the taps are lost when the
 * ring turns the bubble away. One receipt per rule; the rules of the bubbles
 * themselves are `gorge.test.ts`.
 */

function tap(world: World, player: 1 | 2, id: number, on = true): string[] {
  world.events.length = 0;
  gorgeHeard(world, player, {
    kind: "drag",
    target: "gorgeLobe",
    on,
    fromMilli: 0,
    fromYMilli: 0,
    id,
  });
  return world.events.map((e) => e.type);
}

/** Bubble `i`'s colour, the one it still wants first. */
function wanted(world: World, i: number): "red" | "cyan" {
  const k = sack(world).intakes[i];
  return k !== undefined && k.gotRed < k.needRed ? "red" : "cyan";
}

describe("THE GORGE's tap", () => {
  it("is the pilot's", () => {
    expect(gorgeTapSeat).toBe(1);
  });

  it("offers nothing on a row: the cannon and the shot are the whole of it", () => {
    const g = sack(open([ROW]));
    expect(gorgeOffers(g, CFG, 1)).toEqual([]);
    expect(gorgeOffers(g, CFG, 2)).toEqual([]);
  });

  it("offers the pilot the ring's shut bottom bubble, and the navigator nothing", () => {
    const g = sack(open([RING]));
    expect(gorgeOffers(g, CFG, 1)).toEqual([gorgeBottom(g)]);
    expect(gorgeAsks(g, CFG, 1)).toEqual([gorgeBottom(g)]);
    expect(gorgeOffers(g, CFG, 2)).toEqual([]);
  });

  it("spits a shot into a shut bubble, and takes one once gorgeOpenTaps have opened it", () => {
    const world = open([RING]);
    const g = sack(world);
    const i = gorgeBottom(g);
    expect(hit(world, i, wanted(world, i))).toContain("gorgeSpit");
    for (let n = 1; n <= CFG.gorgeOpenTaps; n++) expect(tap(world, 1, i)).toEqual(["gorgeTap"]);
    expect(gorgeOffers(g, CFG, 1)).toEqual([]);
    expect(hit(world, i, wanted(world, i))).toEqual(["gorgeSwallow"]);
  });

  it("drops the navigator's press, a lift, and a press on any bubble but the bottom", () => {
    const world = open([RING]);
    const g = sack(world);
    const i = gorgeBottom(g);
    expect(tap(world, 2, i)).toEqual([]);
    expect(tap(world, 1, i, false)).toEqual([]);
    expect(tap(world, 1, (i + 1) % g.intakes.length)).toEqual([]);
    expect(g.intakes[i]?.taps).toBe(0);
  });

  it("says the event in the middle column, on the ring's row", () => {
    const world = open([RING]);
    tap(world, 1, gorgeBottom(sack(world)));
    const e = world.events[0];
    expect(e?.type === "gorgeTap" && e.col).toBe(midCol(CFG));
    expect(e?.type === "gorgeTap" && e.row).toBe(CFG.gorgeRow + CFG.gorgeRingRows);
  });

  it("loses the taps when the ring turns the bubble away", () => {
    const world = open([RING]);
    const g = sack(world);
    const i = gorgeBottom(g);
    tap(world, 1, i);
    tap(world, 1, i);
    beats(world, CFG.gorgeTurnBeats);
    expect(gorgeBottom(g)).not.toBe(i);
    expect(g.intakes[i]?.taps).toBe(0);
  });

  it("asks only for a bubble that is due: on an ordered ring, the bottom waits its turn", () => {
    const world = open([{ ...ORDERED, ring: true }]);
    const g = sack(world);
    const i = gorgeBottom(g);
    const due = g.intakes[i]?.order === g.next;
    expect(gorgeOffers(g, CFG, 1)).toEqual([i]);
    expect(gorgeAsks(g, CFG, 1)).toEqual(due ? [i] : []);
  });

  it("offers nothing once the bottom bubble is full", () => {
    const world = open([RING]);
    const g = sack(world);
    const i = gorgeBottom(g);
    for (let n = 0; n < CFG.gorgeOpenTaps; n++) tap(world, 1, i);
    sate(world, i);
    expect(gorgeOffers(g, CFG, 1)).toEqual([]);
  });
});
