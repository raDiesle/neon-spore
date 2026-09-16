import { describe, expect, it } from "bun:test";
import { controlSetForWave, WAVES } from "@neon-spore/content";
import { parseHold } from "../hold.js";
import { parsePress } from "../press.js";
import { pressPlan } from "../press-plan.js";
import type { PressSpec } from "../spec.js";

/**
 * `--hold` is the only flag on this tool that builds a `Command` rather than a
 * number, and a wrong one is a picture of a control nobody pressed — the sim
 * drops a command it does not recognise and the frame comes back released,
 * which is exactly what the flag exists to stop. So every shape it accepts and
 * every shape it refuses is written down here.
 */
describe("parseHold", () => {
  it("a thumb on a colour is a held prime, from the navigator", () => {
    expect(parseHold("prime")).toEqual([
      { player: 2, command: { kind: "prime", on: true, color: "red" } },
    ]);
    expect(parseHold("prime=cyan")).toEqual([
      { player: 2, command: { kind: "prime", on: true, color: "cyan" } },
    ]);
  });

  it("a handle is the grab and then the pull, in thousandths of a tile", () => {
    expect(parseHold("wardenTether=900")).toEqual([
      { player: 1, command: { kind: "drag", target: "wardenTether", on: true, fromMilli: 0 } },
      { player: 1, command: { kind: "drag", target: "wardenTether", on: true, fromMilli: 900 } },
    ]);
  });

  it("a rope carried down says so with y, and the grab is at zero on both axes", () => {
    expect(parseHold("wardenTether=0,y=7000")).toEqual([
      {
        player: 1,
        command: { kind: "drag", target: "wardenTether", on: true, fromMilli: 0, fromYMilli: 0 },
      },
      {
        player: 1,
        command: {
          kind: "drag",
          target: "wardenTether",
          on: true,
          fromMilli: 0,
          fromYMilli: 7000,
        },
      },
    ]);
  });

  it("no distance is one whole tile — a hand that has plainly pulled", () => {
    expect(parseHold("mazeString")).toEqual([
      { player: 1, command: { kind: "drag", target: "mazeString", on: true, fromMilli: 0 } },
      { player: 1, command: { kind: "drag", target: "mazeString", on: true, fromMilli: 1000 } },
    ]);
  });

  it("a cord says which body it hangs off, on the grab as well as the pull", () => {
    expect(parseHold("lidString=800,id=3")).toEqual([
      {
        player: 1,
        command: { kind: "drag", target: "lidString", on: true, fromMilli: 0, id: 3 },
      },
      {
        player: 1,
        command: { kind: "drag", target: "lidString", on: true, fromMilli: 800, id: 3 },
      },
    ]);
  });

  it("a cord without an id is refused rather than guessed at", () => {
    expect(() => parseHold("lidString=800")).toThrow(/id=N/);
  });

  it("an id on a handle there is only one of is a mistake, not a no-op", () => {
    expect(() => parseHold("wardenTether=900,id=3")).toThrow(/hangs off a body/);
  });

  it("takes THE BALLOON's two, and puts the right one in the navigator's hand", () => {
    // The first handle here that is not the pilot's. Both sides of one body
    // held at once is the only state this creature can be photographed giving
    // in, and it needs two seats to reach (`sim/balloon-pull.ts`).
    expect(parseHold("balloonLeft=-1600,id=4").map((h) => h.player)).toEqual([1, 1]);
    expect(parseHold("balloonRight=1600,id=4").map((h) => h.player)).toEqual([2, 2]);
    expect(() => parseHold("balloonLeft=-1600")).toThrow(/id=N/);
  });

  it("a control that does not exist names the ones that do", () => {
    expect(() => parseHold("wheel=900")).toThrow(/mazeString/);
  });

  it("a distance that is not a number is refused", () => {
    expect(() => parseHold("mazeString=far")).toThrow(/thousandths of a tile/);
  });

  it("a y that is not a number is refused the same way", () => {
    expect(() => parseHold("wardenTether=0,y=down")).toThrow(/thousandths of a tile/);
  });

  it("prime takes nothing else", () => {
    expect(() => parseHold("prime=900")).toThrow(/red or on cyan/);
    expect(() => parseHold("prime=red,id=2")).toThrow(/no distance/);
  });
});

/**
 * The waves these presses are checked against, because a press is now checked
 * against **the panel the wave is played on** rather than against a table in
 * the tool (`press.ts`). Resolved by name and by set rather than written as
 * numbers: an index moves every time a wave is inserted, and a test pinned to
 * one would start asking about a different panel without saying so.
 */
const waveOn = (setId: string): number => {
  const i = WAVES.findIndex((_, at) => controlSetForWave(at).id === setId);
  if (i === -1) throw new Error(`no wave is played on the ${setId} panel`);
  return i;
};
/** The ordinary panel: cannon, guard, maw, shield and the two colours. */
const FIELD = waveOn("default");
const FLEET = waveOn("fleet");
const CLAW = waveOn("claw");
/** THE SPLICE's, and the one that found this: a maw under the navigator. */
const SPLICE = waveOn("splice");

describe("parsePress", () => {
  it("reads a shot as two presses on one tick line", () => {
    expect(parsePress("60:1:cannonCol=3,64:2:fire=red", FIELD)).toEqual([
      { tick: 60, player: 1, command: { kind: "cannonCol", col: 3 } },
      { tick: 64, player: 2, command: { kind: "fire", color: "red" } },
    ]);
  });

  it("sorts them, so they may be written in whatever order reads best", () => {
    const sorted = parsePress("64:2:fire=cyan,60:1:cannonCol=0", FIELD);
    expect(sorted.map((p) => p.tick)).toEqual([60, 64]);
  });

  it("reads the two presses that have nothing to say about themselves", () => {
    expect(parsePress("40:1:guard", FIELD)).toEqual([
      { tick: 40, player: 1, command: { kind: "guard" } },
    ]);
    expect(parsePress("0:1:intake", FIELD)).toEqual([
      { tick: 0, player: 1, command: { kind: "intake" } },
    ]);
  });

  it("refuses a press from the seat that does not hold that control", () => {
    // Nobody sent it, so the frame would come back with nothing in it and
    // nothing said anywhere.
    expect(() => parsePress("60:2:cannonCol=3", FIELD)).toThrow(/player 1's/);
    expect(() => parsePress("60:1:fire=red", FIELD)).toThrow(/player 2's/);
  });

  it("refuses a shot that is neither colour", () => {
    expect(() => parsePress("60:2:fire=green", FIELD)).toThrow(/red or cyan/);
  });

  it("refuses a control it does not know", () => {
    expect(() => parsePress("60:1:wiggle", FIELD)).toThrow(/unknown control/);
  });

  it("refuses a seat that is not a seat, and a tick that is not one", () => {
    expect(() => parsePress("60:3:guard", FIELD)).toThrow(/seat is 1 or 2/);
    expect(() => parsePress("-1:1:guard", FIELD)).toThrow(/whole number of ticks/);
    expect(() => parsePress("x:1:guard", FIELD)).toThrow(/whole number of ticks/);
  });

  it("refuses a value where none belongs, and none where one does", () => {
    expect(() => parsePress("60:1:guard=3", FIELD)).toThrow(/takes no value/);
    expect(() => parsePress("60:1:cannonCol", FIELD)).toThrow(/takes a value/);
  });

  it("refuses an empty press rather than pressing nothing", () => {
    expect(() => parsePress("", FIELD)).toThrow(/nothing to press/);
  });

  it("steps THE FLEET's sights by name, and lobs from the seat that holds the trigger", () => {
    expect(parsePress("20:2:aim=left", FLEET)[0]?.command).toEqual({
      kind: "aim",
      dcol: -1,
      drow: 0,
    });
    expect(parsePress("20:2:aim=down", FLEET)[0]?.command).toEqual({
      kind: "aim",
      dcol: 0,
      drow: 1,
    });
    expect(parsePress("90:1:salvo", FLEET)[0]?.command).toEqual({ kind: "salvo" });
  });

  it("refuses THE FLEET's two from the wrong chair, which is the whole fight", () => {
    expect(() => parsePress("90:2:salvo", FLEET)).toThrow(/player 1's/);
    expect(() => parsePress("20:1:aim=left", FLEET)).toThrow(/player 2's/);
  });

  it("refuses a direction the sights cannot step", () => {
    expect(() => parsePress("20:2:aim=sideways", FLEET)).toThrow(/left, right, up, down/);
  });

  it("takes the grip from either seat, because it is the one that is not split", () => {
    expect(parsePress("10:1:grip=4", FIELD)[0]?.command).toEqual({ kind: "grip", id: 4 });
    expect(parsePress("10:2:grip=4", FIELD)[0]?.player).toBe(2);
  });
});

/**
 * **The maw is player 1's on the ship and player 2's on two bosses**, and the
 * seat check used to be a table in the tool that only knew the first of those.
 * So a picture of THE SPLICE had to be taken with the press attributed to a
 * seat that never sent it, and the tool said the round would refuse something
 * the round accepts perfectly well. These four are the whole finding.
 */
describe("the seat a press is checked against is the wave's own panel", () => {
  it("gives the ordinary field's maw to the pilot", () => {
    expect(parsePress("0:1:intake", FIELD)[0]?.player).toBe(1);
    expect(() => parsePress("0:2:intake", FIELD)).toThrow(/player 1's/);
  });

  it("gives THE SPLICE's and THE CLAW's to the navigator, under either name", () => {
    for (const wave of [SPLICE, CLAW]) {
      expect(parsePress("240:2:intake", wave)[0]?.command).toEqual({ kind: "intake" });
      expect(parsePress("240:2:mawTake", wave)[0]?.command).toEqual({ kind: "intake" });
      expect(() => parsePress("240:1:intake", wave)).toThrow(/player 2's/);
    }
  });

  it("still names a control nothing knows, whatever panel is up", () => {
    expect(() => parsePress("60:1:mawTake", FIELD)).not.toThrow();
    expect(() => parsePress("60:1:wiggle", SPLICE)).toThrow(/unknown control/);
  });
});

/**
 * The two things a grip press could not do, each of which cost a lane a
 * picture and neither of which failed out loud: an id nobody outside the page
 * can know, and a press written at the tick the capture stops on.
 */
describe("a grip that names a body rather than a number", () => {
  it("takes `first` and `lowest`, and leaves the id for the page to fill in", () => {
    for (const word of ["first", "lowest"] as const) {
      const [one] = parsePress(`10:2:grip=${word}`, FIELD);
      expect(one?.pick).toBe(word);
      expect(one?.command).toEqual({ kind: "grip", id: 0 });
    }
  });

  it("still takes a number, and says both ways out when it is neither", () => {
    expect(parsePress("10:1:grip=4", FIELD)[0]?.pick).toBeUndefined();
    expect(() => parsePress("10:1:grip=nearest", FIELD)).toThrow(/first or lowest/);
  });
});

describe("the tick line a run of presses walks", () => {
  const at = (tick: number): PressSpec => ({ tick, player: 1, command: { kind: "guard" } });

  it("leaves a tick after the last press, so the command is heard at all", () => {
    // The bug: `send` pushes into the buffer and `drain` stamps it on the next
    // tick `advance` runs, so a press at the very end sat in a buffer nothing
    // emptied and the frame came back with nothing pressed.
    const plan = pressPlan([at(200)], 200);
    expect(plan).toEqual([{ advance: 199, press: at(200) }, { advance: 1 }]);
  });

  it("still stops on the tick the caller asked for", () => {
    for (const presses of [[at(0)], [at(60)], [at(200)], [at(10), at(60), at(199)]]) {
      const total = pressPlan(presses, 200).reduce((sum, s) => sum + s.advance, 0);
      expect(total).toBe(200);
    }
  });

  it("walks the presses in order, each after the ticks that come before it", () => {
    expect(pressPlan([at(10), at(60)], 240)).toEqual([
      { advance: 10, press: at(10) },
      { advance: 50, press: at(60) },
      { advance: 180 },
    ]);
  });

  it("advances nothing at all when the capture does not", () => {
    expect(pressPlan([at(0)], 0)).toEqual([{ advance: 0, press: at(0) }, { advance: 0 }]);
  });
});
