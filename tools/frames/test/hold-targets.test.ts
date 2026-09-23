import { describe, expect, it } from "bun:test";
import { DRAG_TARGETS } from "@neon-spore/net";
import { parseHold } from "../hold.js";
import { CARRIES, DRAGS, NEEDS_ID, SEAT, TARGET } from "../hold-targets.js";

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

  it("lets go only of a carry: every other handle is still held at the end", () => {
    for (const name of DRAGS) {
      if (CARRIES.includes(name)) continue;
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

describe("the flag's names and the wire's", () => {
  // A name that drifts from `DRAG_TARGETS` builds a command `decodeCommands`
  // and every hand file drop in silence — the frame comes back released while
  // the capture says the hold was sent, which is what `hold.ts` exists to end.
  const wire: readonly string[] = DRAG_TARGETS;

  it("sends nothing the wire does not carry", () => {
    for (const name of DRAGS) expect(wire, name).toContain(TARGET[name] ?? name);
  });

  it("can hold every handle the wire carries", () => {
    const sent = new Set(DRAGS.map((name) => TARGET[name] ?? name));
    for (const target of wire) expect(sent.has(target), target).toBe(true);
  });

  it("holds its other lists to names it knows", () => {
    for (const name of [...NEEDS_ID, ...CARRIES]) expect(DRAGS).toContain(name);
  });
});

describe("the handles the handles lanes drew", () => {
  it("puts each seat's thumb where its hand file listens", () => {
    // `undertow-hand.ts` returns on player 1; the pin's id is the lobe's column.
    expect(shape("undertowPin=0,id=4")[1]).toMatchObject({
      player: 2,
      target: "undertowPin",
      id: 4,
    });
    expect(shape("undertowFree=0")[1]).toMatchObject({ player: 2, on: true });
    // `pulse-hand.ts`: a brace from each seat, on one meter.
    expect(shape("pulseMeter2=0")[1]).toMatchObject({ player: 2, target: "pulseMeter" });
    // `scout-hand.ts`: her line, his prime.
    expect(shape("scoutLine=0")[1]).toMatchObject({ player: 2, on: true });
    expect(shape("scoutPrime=0,y=900")[1]).toMatchObject({ player: 1, on: false });
    // `ledger-hand.ts`: her foot and plug, his bead and cord.
    expect(shape("ledgerSocket=0")[1]?.player).toBe(2);
    expect(shape("ledgerCord=0,y=900")[1]?.player).toBe(1);
  });

  it("lets go of a handle whose hand file reads the lift", () => {
    // `vane-hand.ts`, `snake-controls.ts`, `pinball-hand.ts`: each returns on
    // `command.on` and measures the distance off the command that lets go.
    for (const value of ["vaneHousing=0,y=900", "snakeJaws=0,y=900", "pinTable=1000"]) {
      expect(shape(value)[1]?.on, value).toBe(false);
    }
    expect(shape("vaneArm=0")[1]?.on).toBe(true);
  });

  it("asks an id of the navigator's pinch on THE HIVE and not the pilot's haul", () => {
    expect(() => parseHold("hiveLobe2=0")).toThrow(/say which one with id=N/);
    expect(shape("hiveLobe2=0,id=2")[1]).toMatchObject({ player: 2, target: "hiveLobe", id: 2 });
    expect(() => parseHold("hiveLobe=0,y=900,id=2")).toThrow(/only a handle that hangs off a body/);
  });
});
