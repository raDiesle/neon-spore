import { describe, expect, it } from "bun:test";
import { parseHold } from "../hold.js";
import { DRAGS, SEAT, TARGET } from "../hold-targets.js";

/**
 * The six handles the flag could not reach, and the two shapes it builds.
 *
 * `hold.test.ts` beside this file says what `--hold` is for; this one is about
 * the rows added on 21 September 2026, and the thing every one of them can get
 * wrong is the same: **the seat**. A hand file that refuses the other seat
 * refuses it in silence — `maze-hand.ts` returns, `queen-hand.ts` returns,
 * `throat-hand.ts` returns — so a row with the wrong number in it photographs
 * a released handle and reports it as the gesture. Each case below names the
 * file its seat was read off.
 */

/** The two commands a handle builds, as `{ player, on, …}` and nothing else. */
const shape = (value: string): Record<string, unknown>[] =>
  parseHold(value).map((one) => ({ player: one.player, ...one.command }));

describe("the handles on a boss's own picture", () => {
  it("BULB QUEEN's mark is the pilot's, and says which of the two", () => {
    // `queenHeard` reads `command.id` as the side and player 1 alone.
    expect(shape("queenMark=0,id=1")).toEqual([
      { player: 1, kind: "drag", target: "queenMark", on: true, fromMilli: 0, id: 1 },
      { player: 1, kind: "drag", target: "queenMark", on: true, fromMilli: 0, id: 1 },
    ]);
  });

  it("refuses a mark id that is neither of her two, rather than pressing nothing", () => {
    // `command.id === 0 ? -1 : command.id === 1 ? 1 : 0` — a side of zero is a
    // thumb the round hears and does nothing with, which is the silence the
    // whole flag exists to stop.
    expect(() => parseHold("queenMark=0,id=2")).toThrow(/id is one of 0 or 1/);
    expect(() => parseHold("queenMark=0")).toThrow(/say which one with id=N/);
  });

  it("THE FILAMENT is one target and a thumb each, the pilot drawing", () => {
    // `filamentHeard`: seat 0 grabs at the head, seat 1 at the tail.
    expect(shape("filament=1000")).toEqual([
      { player: 1, kind: "drag", target: "filament", on: true, fromMilli: 0 },
      { player: 1, kind: "drag", target: "filament", on: true, fromMilli: 1000 },
    ]);
    expect(shape("filament2=0,y=1000")).toEqual([
      { player: 2, kind: "drag", target: "filament", on: true, fromMilli: 0, fromYMilli: 0 },
      { player: 2, kind: "drag", target: "filament", on: true, fromMilli: 0, fromYMilli: 1000 },
    ]);
  });

  it("THE STARE's lid is whichever seat is free, pulled down", () => {
    // `stareLidHeard` takes either player and reads `fromYMilli`.
    expect(shape("stareLid=0,y=900").map((c) => c.player)).toEqual([1, 1]);
    expect(shape("stareLid2=0,y=900")).toEqual([
      { player: 2, kind: "drag", target: "stareLid", on: true, fromMilli: 0, fromYMilli: 0 },
      { player: 2, kind: "drag", target: "stareLid", on: true, fromMilli: 0, fromYMilli: 900 },
    ]);
  });

  it("THE MAZE's heart is the navigator's alone", () => {
    // `mazeHeartHeard` returns on `player !== 2`, which is why the tear was
    // photographed by writing the boss's fields instead of pressing anything.
    expect(shape("mazeHeart=0,y=900")).toEqual([
      { player: 2, kind: "drag", target: "mazeHeart", on: true, fromMilli: 0, fromYMilli: 0 },
      { player: 2, kind: "drag", target: "mazeHeart", on: true, fromMilli: 0, fromYMilli: 900 },
    ]);
  });

  it("THE THROAT's cinch is hers and stays down", () => {
    // `ringHeard` refuses player 1 and reads nothing but `on`.
    expect(shape("throatRing=0")).toEqual([
      { player: 2, kind: "drag", target: "throatRing", on: true, fromMilli: 0 },
      { player: 2, kind: "drag", target: "throatRing", on: true, fromMilli: 0 },
    ]);
  });

  it("THE THROAT's haul is his, and it is spent on the lift", () => {
    // `tubeHeard` refuses a command with `on` set — a tap would move the mouth
    // by a fingertip's jitter — so the carry ends with the thumb coming off,
    // carrying the distance the lift is read from.
    expect(shape("throatTube=-1500")).toEqual([
      { player: 1, kind: "drag", target: "throatTube", on: true, fromMilli: 0 },
      { player: 1, kind: "drag", target: "throatTube", on: false, fromMilli: -1500 },
    ]);
  });

  it("THE SCUTTLE's part is the pilot's, and says which socket it hangs off", () => {
    // `scuttleHeard` refuses player 2 and reads `command.id` as the socket —
    // row-major over the frame, not one of two sides — so the grab and the
    // carry both carry it, and the carry is the one `swing` measures.
    expect(shape("scuttlePart=1000,id=10")).toEqual([
      { player: 1, kind: "drag", target: "scuttlePart", on: true, fromMilli: 0, id: 10 },
      { player: 1, kind: "drag", target: "scuttlePart", on: true, fromMilli: 1000, id: 10 },
    ]);
  });

  it("refuses a part with no socket, which would be a press on the whole frame", () => {
    // Two hang at once from `scuttleTwinParts` left, and a press on a socket
    // the frame did not let go of is dropped without a sound.
    expect(() => parseHold("scuttlePart=1000")).toThrow(/say which one with id=N/);
  });

  it("is the only handle let go of: every other one is still held at the end", () => {
    for (const name of DRAGS) {
      if (name === "throatTube") continue;
      const value = `${name}=0${name === "queenMark" || name === "scuttlePart" ? ",id=0" : ""}`;
      let built: ReturnType<typeof shape>;
      try {
        built = shape(value);
      } catch {
        // A handle that needs an id it was not given; `hold.test.ts` owns that.
        continue;
      }
      expect(built[built.length - 1]?.on, `${name} lets go`).toBe(true);
    }
  });
});

describe("the tables the seats are read out of", () => {
  it("names every second thumb after a handle the list already has", () => {
    // `TARGET` is how a name per thumb gets back to the one target both seats
    // send, so a key whose value is not itself a handle is a command nothing
    // hears.
    for (const [name, target] of Object.entries(TARGET)) {
      expect(DRAGS, `${name} → ${target}`).toContain(target);
      expect(DRAGS).toContain(name);
    }
  });

  it("gives a seat only to handles it knows", () => {
    for (const name of Object.keys(SEAT)) expect(DRAGS).toContain(name);
  });
});
