import { describe, expect, it } from "bun:test";
import { parseHold } from "../hold.js";

/**
 * `--hold` is the only flag on this tool that builds a `Command` rather than a
 * number, and a wrong one is a picture of a control nobody pressed — the sim
 * drops a command it does not recognise and the frame comes back released,
 * which is exactly what the flag exists to stop. So every shape it accepts and
 * every shape it refuses is written down here.
 */
describe("parseHold", () => {
  it("a thumb on the lance is a held prime, from the pilot", () => {
    expect(parseHold("prime")).toEqual({ player: 1, command: { kind: "prime", on: true } });
  });

  it("a handle is a held drag, at the distance given in thousandths of a tile", () => {
    expect(parseHold("wardenTether=900")).toEqual({
      player: 1,
      command: { kind: "drag", target: "wardenTether", on: true, fromMilli: 900 },
    });
  });

  it("no distance is one whole tile — a hand that has plainly pulled", () => {
    expect(parseHold("mazeString")).toEqual({
      player: 1,
      command: { kind: "drag", target: "mazeString", on: true, fromMilli: 1000 },
    });
  });

  it("a cord says which body it hangs off", () => {
    expect(parseHold("lidString=800,id=3")).toEqual({
      player: 1,
      command: { kind: "drag", target: "lidString", on: true, fromMilli: 800, id: 3 },
    });
  });

  it("a cord without an id is refused rather than guessed at", () => {
    expect(() => parseHold("lidString=800")).toThrow(/id=N/);
  });

  it("an id on a handle there is only one of is a mistake, not a no-op", () => {
    expect(() => parseHold("wardenTether=900,id=3")).toThrow(/only lidString/);
  });

  it("a control that does not exist names the ones that do", () => {
    expect(() => parseHold("wheel=900")).toThrow(/mazeString/);
  });

  it("a distance that is not a number is refused", () => {
    expect(() => parseHold("mazeString=far")).toThrow(/thousandths of a tile/);
  });

  it("prime takes nothing else", () => {
    expect(() => parseHold("prime=900")).toThrow(/no distance/);
  });
});
