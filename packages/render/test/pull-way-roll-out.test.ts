import { describe, expect, it } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { itCosts } from "../../../tools/test/figure.js";
import { treeText } from "../../../tools/test/tree-text.js";

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
  "stare-lash-pull.ts": "THE STARE",
  "curtain-grip.ts": "THE CURTAIN",
  "maze-string.ts": "THE MAZE",
  "gimbal-knob.ts": "THE GIMBAL",
  "hasp-knob.ts": "THE HASP",
  "crank-dial.ts": "THE CLAW",
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
  "throat-grip.ts": "THE THROAT",
  "oculus-levers.ts": "THE OCULUS",
  "lamprey-handles.ts": "THE LAMPREY",
};

const TO_COME: Readonly<Record<string, string>> = {};

/** The knob and the arrow themselves, and a glyph sheet that is not a pull. */
const NOT_HANDLES = new Set(["pull-knob.ts", "way-arrow.ts", "instar-glyphs.ts"]);

/** Chevrons a handle drew for itself before the shared arrow. */
const RETIRED = ["mantle-handle.ts", "capstan-marks.ts"];

const SRC = join(import.meta.dir, "../src");
const read = (f: string) => readFileSync(join(SRC, f), "utf8");
const DRAWS_WAY = /\bdraw(PullKnob|PullArrow|WayArrow)\(/;
const showsWay = (f: string) => DRAWS_WAY.test(read(f));

/**
 * The one case that reads the whole of `render/src`, twelve hundred files. It
 * read them one `readFileSync` at a time and timed out at bun's five seconds
 * at a load average of thirty-two on 30 September 2026, 5.9 s alone; it reads
 * them through `treeText` now, sixty-four at a time — 280 to 530 ms over four
 * runs at a load average of thirty-seven — and has a figure scaled to the load
 * (`tools/test/figure.ts`) instead of the flat default. So 200. The other three
 * read the fifteen handles and stay under bun's default.
 */
const WHOLE_SRC_MS = 200;

describe("every pull handle shows its way", () => {
  it("draws the shared knob or arrow in every handle but the roll-out's", () => {
    const owing = Object.keys(PULL_HANDLES).filter((f) => TO_COME[f] === undefined && !showsWay(f));
    expect(owing).toEqual([]);
  });

  it("strikes a handle off the roll-out once it shows its way", () => {
    expect(Object.keys(TO_COME).filter(showsWay)).toEqual([]);
  });

  itCosts(WHOLE_SRC_MS, "names every file that draws the knob or the arrow", async () => {
    const files = readdirSync(SRC).filter((f) => f.endsWith(".ts") && !NOT_HANDLES.has(f));
    const texts = await treeText(files.map((f) => join(SRC, f)));
    const drawing = files.filter((_, i) => DRAWS_WAY.test(texts[i] as string));
    expect(drawing.filter((f) => PULL_HANDLES[f] === undefined)).toEqual([]);
  });

  it("keeps no private chevron once a handle is struck", () => {
    const kept = RETIRED.filter(
      (f) => TO_COME[f] === undefined && /\b(drawChevron|const chevron)\b/.test(read(f)),
    );
    expect(kept).toEqual([]);
  });
});
