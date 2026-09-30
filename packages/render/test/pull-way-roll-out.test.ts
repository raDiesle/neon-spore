import { describe, expect, it } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * **Every pull handle shows its way**, the owner's generic rule for every
 * boss (`.claude/skills/new-boss/generic.md`): a pull is a channel, a knob
 * and a grab, and no pull mark is a bare circle. The shared knob is
 * `drawPullKnob` (`pull-knob.ts`), and a mark that is not a ring carries the
 * knob's arrow without the knob, `drawPullArrow` — both THE INSTAR's
 * `drawWayArrow` (`way-arrow.ts`) — on the screen of the seat that owns the
 * pull, never on the partner's.
 *
 * Nothing in a file's source says it draws a pull, so the handles are named
 * here: `PULL_HANDLES` is every file that draws one, and a new file calling
 * the knob or the arrow must be added to it. `TO_COME` is the roll-out
 * (`docs/queue.md`); it only shrinks — an entry whose file already calls
 * the knob or the arrow fails here until it is struck.
 */

const PULL_HANDLES: Readonly<Record<string, string>> = {
  "tether.ts": "THE WARDEN",
  "lid-string.ts": "THE LID",
  "stare-lid.ts": "THE STARE",
  "curtain-grip.ts": "THE CURTAIN",
  "maze-string.ts": "THE MAZE",
  "sinew-handles.ts": "THE SINEW",
  "balloon-handles.ts": "THE BALLOON",
  "antiphon-rail-grip.ts": "THE ANTIPHON",
  "fleet-grip-draw.ts": "THE FLEET",
  "cairn-hand.ts": "THE CAIRN",
  "plumb-weight.ts": "THE PLUMB",
  "ledger-haul.ts": "THE LEDGER",
  "valve-draw.ts": "THE VALVE",
  "mantle-handle.ts": "THE MANTLE",
  "capstan-marks.ts": "THE CAPSTAN",
};

const TO_COME: Readonly<Record<string, string>> = {};

/** The knob and the arrow themselves, and a glyph sheet that is not a pull. */
const NOT_HANDLES = new Set(["pull-knob.ts", "way-arrow.ts", "instar-glyphs.ts"]);

/** Chevrons a handle drew for itself before the shared arrow. */
const RETIRED = ["mantle-handle.ts", "capstan-marks.ts"];

const SRC = join(import.meta.dir, "../src");
const read = (f: string) => readFileSync(join(SRC, f), "utf8");
const showsWay = (f: string) => /\bdraw(PullKnob|PullArrow|WayArrow)\(/.test(read(f));

describe("every pull handle shows its way", () => {
  it("draws the shared knob or arrow in every handle but the roll-out's", () => {
    const owing = Object.keys(PULL_HANDLES).filter((f) => TO_COME[f] === undefined && !showsWay(f));
    expect(owing).toEqual([]);
  });

  it("strikes a handle off the roll-out once it shows its way", () => {
    expect(Object.keys(TO_COME).filter(showsWay)).toEqual([]);
  });

  it("names every file that draws the knob or the arrow", () => {
    const drawing = readdirSync(SRC)
      .filter((f) => f.endsWith(".ts") && !NOT_HANDLES.has(f))
      .filter(showsWay);
    expect(drawing.filter((f) => PULL_HANDLES[f] === undefined)).toEqual([]);
  });

  it("keeps no private chevron once a handle is struck", () => {
    const kept = RETIRED.filter(
      (f) => TO_COME[f] === undefined && /\b(drawChevron|const chevron)\b/.test(read(f)),
    );
    expect(kept).toEqual([]);
  });
});
