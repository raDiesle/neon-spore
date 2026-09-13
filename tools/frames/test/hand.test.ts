import { describe, expect, it } from "bun:test";
import { parseHand } from "../hand.js";

/**
 * `--hand` as a string, before a browser is anywhere near it. The pressing
 * itself is proved against the built game in `opening.test.ts`, beside the
 * other captures that need a page.
 */
describe("parseHand", () => {
  it("a thumb on a lobe is that lobe, held", () => {
    expect(parseHand("cannon", "p1")).toEqual({ on: "cannon" });
    expect(parseHand("shield", undefined)).toEqual({ on: "shield" });
  });

  it("the muzzle is the cannon's swelling under the navigator's thumb", () => {
    expect(parseHand("muzzle", "p2")).toEqual({ on: "cannon" });
    expect(parseHand("muzzle=red", "p2")).toEqual({ on: "cannon", carry: "red" });
    expect(parseHand("muzzle=cyan", "p2")).toEqual({ on: "cannon", carry: "cyan" });
  });

  // On the rig and on player 1's screen the same circle is the pilot's slide,
  // so a muzzle asked for there would photograph a different gesture and say
  // nothing about it.
  it("refuses the muzzle on any seat but the navigator's", () => {
    expect(() => parseHand("muzzle", "p1")).toThrow("--seat p2");
    expect(() => parseHand("muzzle", "test")).toThrow("--seat p2");
    expect(() => parseHand("muzzle", undefined)).toThrow("--seat p2");
  });

  it("a colour belongs to the muzzle and is one of the two", () => {
    expect(() => parseHand("cannon=red", "p1")).toThrow("only the muzzle");
    expect(() => parseHand("muzzle=green", "p2")).toThrow("red or towards cyan");
  });

  it("a swelling that does not exist names the ones that do", () => {
    expect(() => parseHand("maw", "p1")).toThrow("cannon, shield, muzzle");
  });
});
