import { describe, expect, it } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { cueHelper } from "../src/cue-helper.js";
import { saysTap } from "../src/handle-word.js";
import { INSTAR_WORDS } from "../src/instar-marks.js";

/**
 * **Every tap on the field is THE PRESS LAB's drop** — the owner, 15 October
 * 2026: *they should follow our standard tap control visuals*, of THE
 * BLISTER's first and then of all of them (`press-drop.ts`). A `TAP` cue
 * wears it through `cue-helper.ts`; THE INSTAR's and THE NETTLE's tap marks
 * through `instar-marks.ts`; THE LAMPREY's tooth through `lamprey-marks.ts`.
 *
 * **`TO_COME` is the roll-out, and it only shrinks.** A file still drawing a
 * tap its own way — THE INSTAR's red ring with a tap in it, the thumbprint's
 * circle — is listed here until a lane gives it the drop; a tap built after
 * 15 October 2026 is never put on it.
 */
const TO_COME: readonly string[] = [];

const SRC = new URL("../src/", import.meta.url);
const FILES = readdirSync(SRC).filter((f) => f.endsWith(".ts"));
const text = (f: string): string => readFileSync(new URL(f, SRC), "utf8");

/** A file drawing its own tap: THE INSTAR's ring asked for one, or the thumbprint drawn. */
function drawsOwnTap(file: string): boolean {
  const source = text(file);
  const ringTap = source.includes("drawInstarRing(") && /gesture: "tap"/.test(source);
  return ringTap || source.includes("drawThumbprint(");
}

describe("the press drop's roll-out", () => {
  it("leaves no tap drawn its own way, but what is still to come", () => {
    expect(FILES.filter((f) => drawsOwnTap(f) && !TO_COME.includes(f))).toEqual([]);
  });

  it("lists only files that exist and still owe one", () => {
    expect(TO_COME.filter((f) => !FILES.includes(f))).toEqual([]);
    expect(TO_COME.filter((f) => !drawsOwnTap(f))).toEqual([]);
  });

  it("makes every tap word a press, and writes none of them", () => {
    const taps = Object.values(INSTAR_WORDS).filter((w) => saysTap(w.word));
    expect(taps.length).toBeGreaterThan(0);
    for (const { word } of [...taps, { word: "TAP" }]) expect(cueHelper(word)).toBe("press");
  });
});
