import type { World } from "@neon-spore/sim";
import type { BossCue } from "./boss-cue.js";
import type { Layout } from "./layout.js";

/**
 * **What THE WELL is asking for** — page eighteen of the readings, and the
 * first page in the set whose answer is **nothing at all**.
 *
 * It is a page rather than a comment on `cuesOf`'s `default` — which is where
 * THE PULSE's identical answer lives — because the argument is long and because
 * a boss that falls through the default is a boss nobody has read yet. Three
 * entries in this family have now been wrong about a boss that "says nothing",
 * twice by missing a `drawCueText` in the boss's own drawing and once by
 * missing a word a handle had carried since it shipped. THE WELL's own files
 * were grepped first (`well.ts`, `well-draw.ts`, `well-face.ts`,
 * `well-arrivals.ts`, `well-ship.ts`, `well-body.ts`, `touch-well.ts`) and none
 * of them calls it. So this page is the receipt: read on 19 September 2026,
 * against `docs/decisions.md` #34 and the licence test the family has built
 * since, and left silent on purpose.
 */

/** No cue, on any screen, in any frame. One array rather than a fresh `[]` a
 * frame, because `cuesOf` is on the draw path. */
const SILENT: readonly BossCue[] = [];

/**
 * THE WELL. **It says nothing, and it is the one boss in this game that
 * cannot.**
 *
 * The signature is every other reading's so that the switch in `boss-cue.ts`
 * has one shape — a `case` that returned a bare constant would read as an
 * oversight rather than as a decision, which is the thing this page exists to
 * prevent. Both arguments are therefore unused, and deliberately.
 *
 * **There is no moment.** #34 asks for one word *at the moment the fight wants
 * something*, and THE WELL has no moments: no state, no `stepWell`, no clock,
 * no phase, no health, no gesture and no body (`sim/well.ts`, `WellState` is
 * the tag and nothing more). `boss-others.ts` returns before it on every clock
 * there is, `bossFillsWave` is false so everything that falls is the wave
 * author's ordinary bodies, and `bossHoldsWave` is the one `no` in the game —
 * the wave ends when its script is spent, because there is nothing here to
 * finish (`boss-kinds.ts`). A boss that never asks cannot be given a word for
 * what it is asking.
 *
 * **And every word it could say would be a column, which is the one thing #34
 * forbids outright.** This is the finding, and it is a fact about the drawing
 * rather than about the simulation. On the flat field a mark over a body says
 * *here* and the column is still a number the pair has to get out of their
 * mouths. On the clock the mark's own angle **is** the hour: `well-face.ts`
 * draws `colNumber(col)` on the numeral ring at `NUMERAL` of the span, just
 * outside the rim, so a frame at a lane's angle stands in line with that lane's
 * own numeral. The third inherited rule says a place is information; here a
 * place is a *number*, printed beside itself. `SHOOT` on the clock is
 * `SHOOT COLUMN 4` drawn instead of spelled, and there is nowhere on this
 * picture to put a mark that is not in a lane except the seam, which is the one
 * sector that holds nothing.
 *
 * **The two seats, and why neither of them can be given one.**
 *
 * - **The pilot holds the clock and nothing to time.** `showsWell` is
 *   `showsCannon`, so the projection is his alone; his act is to put the
 *   cannon in a lane, and *which lane* is the wave's whole conversation. A
 *   mark that appeared on the lane he should be in would be the answer; one
 *   that appeared on the lane he is *not* in would be the answer by
 *   subtraction, which is THE LEAD's finding (`boss-cue-read-c.ts`). There is
 *   no third thing to say to him: the seam is furniture, drawn bright and
 *   closed from the first frame (`well-face.ts`, `drawSeam`), and a finger in
 *   it is refused outright (`touch-well.ts`, `wellCol` returns null), so a word
 *   there would be an instruction on a thumb the game will not answer.
 * - **The navigator is not drawn the well at all.** She holds the two colours
 *   and the plate, and her screen is the flat field every other wave runs on.
 *   A cue about this boss on her glass would be a mark on a picture she is
 *   never shown — the third inherited rule, failed at the first step — and a
 *   cue about the *field* is a cue about ordinary bodies, which no boss's
 *   reading gives (THE GORGE's fourth silence, THE CAIRN's).
 *
 * **The silence is safe because it is total.** The one way a word's absence
 * tells is by going out at a moment, and nothing here ever goes out: there is
 * no frame of any well wave on either screen that carries a cue, so there is no
 * beat whose emptiness means anything. That is the property
 * `render/test/boss-cue-well.test.ts` asserts, phase by phase and seat by seat.
 *
 * **What the pair actually needs is not a verb, and that is why the briefing
 * grew rather than shrank.** The two things this boss costs are both readings
 * of a picture, and #34 has no line for a reading: the pilot's clock carries no
 * warning marks at all — every body a well wave sends is announced on the
 * navigator's strip and on nothing his shows (`radarBlips` gates on
 * `showsRadar`, and `slick` and `bulb` are both `radar: "p2"`) — and his rings
 * crowd at the rim, four beats of a fall covering a third of a tile where the
 * last beat before the hull covers that much by itself (`BEND` in `well.ts`).
 * Neither is a thing a thumb does, so neither is a cue; both are sentences one
 * seat has to say to the other, which is the wave (`waves/act-8.ts`).
 */
export function wellCues(_l: Layout, _world: World): readonly BossCue[] {
  return SILENT;
}
