import { describe, expect, it } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { saysKind } from "../src/boss-cue-shape.js";

/**
 * **A cue's word is what the thumb does, never what it does to the boss.**
 *
 * The owner, 30 September 2026, on THE VALVE's `FREEZE`: *the helping text
 * should say that player needs to do, not the effect. so the player action
 * is then to tap, not to freeze … this is generic rule set.* So every word a
 * cue stands on the field with is a gesture — `TAP`, `HOLD`, `PULL` — or the
 * name of the button it is pressed on (`FIRE`, `SHIELD`, `SUCK`), and what
 * the gesture is *for* goes on the small `why` line under it (`TO FREEZE THE
 * WHEEL`). `decisions.md` #34 has the rule; this test holds it.
 *
 * It reads the words out of the source rather than out of a world, because a
 * reading's word only exists in the state that asks for it and a new boss is
 * a new state nobody has built yet. Two shapes are read: the third argument
 * of `markAt`, and a `word: "…"` literal. A `CALL` is exempt — its word is
 * one the pair says out loud, not one a thumb does — and so is anything a
 * ternary picks, which this scan does not see; the reading's own test does.
 */

const SRC = join(import.meta.dir, "../src");

/** Gestures, and the buttons a gesture is made on. The first word is read. */
const THUMB = new Set([
  "TAP",
  "HOLD",
  "RELEASE",
  "MOVE",
  "PULL",
  "PUSH",
  "SWIPE",
  "FLING",
  "SHOVE",
  "SWAY",
  "TURN",
  "TWIST",
  "WIND",
  "ROCK",
  "LIFT",
  "RUB",
  "SHAKE",
  "PINCH",
  "WIPE",
  "RAKE",
  "WAIT",
  "STILL",
  "REPEAT",
  "DRAW",
  "FOLLOW",
  "FIRE",
  "SHOOT",
  "SHIELD",
  "SUCK",
  "EAT",
]);

function cueWords(): { file: string; word: string }[] {
  const out: { file: string; word: string }[] = [];
  for (const file of readdirSync(SRC).filter((f) => f.endsWith(".ts"))) {
    const text = readFileSync(join(SRC, file), "utf8");
    for (const m of text.matchAll(/markAt\(\s*[^,]+,\s*"(\w+)",\s*"([^"]+)"/g)) {
      if (m[1] !== "CALL") out.push({ file, word: m[2] ?? "" });
    }
    for (const m of text.matchAll(/\bword:\s*"([^"]+)"/g)) out.push({ file, word: m[1] ?? "" });
  }
  return out;
}

const WORDS = cueWords();

describe("the words a cue says", () => {
  it("are found at all, so the scan below is reading something", () => {
    expect(WORDS.length).toBeGreaterThan(50);
  });

  it("each begin with a gesture or a button, never with the effect", () => {
    const wrong = WORDS.filter(
      ({ word }) => !THUMB.has((word.split(" ")[0] ?? "").replace(/!$/, "")),
    ).map(({ file, word }) => `${file}: ${word}`);
    expect(wrong).toEqual([]);
  });

  it("wear a kind line only where it says something the word does not", () => {
    expect(saysKind("PRESS", "TAP")).toBe(false);
    expect(saysKind("HOLD", "PULL DOWN")).toBe(false);
    expect(saysKind("CARRY", "MOVE")).toBe(false);
    expect(saysKind("HOLD", "HOLD")).toBe(false);
    expect(saysKind("PRESS", "FIRE")).toBe(true);
    expect(saysKind("HOLD", "SHIELD")).toBe(true);
    expect(saysKind("CALL", "SET")).toBe(true);
  });
});
