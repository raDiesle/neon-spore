import {
  midCol,
  type SpliceState,
  type StareState,
  stareCharging,
  stareClearShot,
  stareOpenLive,
  type World,
} from "@neon-spore/sim";
import type { BossCue } from "./boss-cue.js";
import { cueFrame } from "./boss-cue-frame.js";
import { fieldX } from "./field-flip.js";
import type { Layout } from "./layout.js";
import { stareLidRest } from "./stare-lid.js";
import { stareEye, stareGazeFootY } from "./stare-shape.js";

/**
 * **What the bosses whose ask is a stop are asking for** — page four of the
 * readings, opened for THE STARE. THE SPLICE joined it on 19 September 2026
 * with a `WAIT` and left it silent on 25 September (below).
 *
 * The three pages before this one each mark the place a thumb goes; THE
 * STARE's word marks a place a thumb must **not**. What it wants on an open
 * beat is that no thumb goes anywhere, so it is the fifth kind
 * (`boss-cue.ts`, `CueKind`), the one the simulation can tell was *not*
 * done — and here the stillness is the rule itself, which the picture alone
 * does not say. Its gesture is the lid, below.
 *
 * **Both seats, since 29 September 2026.** The eye no longer picks a seat:
 * an open beat of a live pass freezes the pair, so `STILL` is either seat's,
 * and the lid is either seat's to pull while the eye charges — `PULL` on its
 * ring until a thumb is on it. The two never stand together: one is an open
 * beat and the other the charge after the pass (`sim/stare.ts`).
 */

/**
 * THE STARE. `STILL` at the foot of the gaze — halfway down the field, well
 * clear of the eye — on an open beat of a live pass, and nowhere else: the
 * teaching pass's cyan costs nothing and asks nothing. `FIRE` at the cannon
 * under the eye, aimed at the eye, on a shut live beat whose next beat is
 * shut too (`stareClearShot`) — the navigator's, and the pilot is told `MOVE`
 * if the cannon is not under it. `PULL` **beside** the lid's ring while the
 * eye charges and no thumb is on it yet, so the word is not written over the
 * ring it names; the ring filling is the picture's own answer, and a word
 * under a hand already doing it would be the second prompt.
 */
export function stareCues(l: Layout, world: World, s: StareState): readonly BossCue[] {
  const cfg = world.cfg;
  const eye = stareEye(l, cfg);
  const frame = cueFrame(l);
  if (stareOpenLive(s)) {
    const y = stareGazeFootY(l);
    return [
      {
        seat: null,
        kind: "STILL",
        word: "STILL",
        x: eye.cx,
        y,
        ...frame,
        seed: 61,
        why: STARE_WHY.STILL,
      },
    ];
  }
  if (stareClearShot(s, world.beat)) {
    const col = midCol(cfg);
    if (world.cannonCol !== col) {
      const x = fieldX(l, world.cannonCol);
      return [{ seat: 1, kind: "CARRY", word: "MOVE", x, y: l.hullY, ...frame, seed: 63 }];
    }
    const aim = { x: eye.cx, y: eye.cy, r: eye.ry };
    const x = fieldX(l, col);
    return [
      {
        seat: 2,
        kind: "PRESS",
        word: "FIRE",
        x,
        y: l.hullY,
        ...frame,
        seed: 64,
        aim,
        why: STARE_WHY.FIRE,
      },
    ];
  }
  if (!stareCharging(s) || s.lidSeat !== 0) return [];
  const rest = stareLidRest(l, cfg);
  return [
    {
      seat: null,
      kind: "CARRY",
      word: "PULL",
      x: eye.cx + eye.rx * PULL_BESIDE,
      y: rest.y,
      halfW: rest.r,
      halfH: rest.r,
      seed: 62,
      framed: false,
      why: STARE_WHY.PULL,
    },
  ];
}

/** How far to the side of the lid's ring `PULL` is written, in socket half-widths. */
const PULL_BESIDE = 1.85;

/** What each of THE STARE's words is for — never a column, a colour or a count. */
export const STARE_WHY = {
  STILL: "IT SEES ANY MOVE",
  FIRE: "WHILE IT IS SHUT",
  PULL: "BEFORE IT FIRES",
} as const;

/**
 * **THE SPLICE says nothing, since 25 September 2026.** A `WAIT` rode the
 * number down its straw, on the seat holding the maw, for the beats a second
 * suck would do nothing. The owner took it off: *for the player it is clear to
 * wait* — the number is in the air, on the curve she has been tracing, and the
 * frame round it only covered the thing she was watching.
 *
 * **And what it never said.** Four silences, and they were most of the design.
 *
 * - **No `SUCK`.** The verb of the fight has one place — the mouth the cannon
 *   is standing under — and she is not shown the cannon. A mark there would
 *   hand her his half of the sentence, and a word that went out only while he
 *   was under a mouth would hand her the same thing by its own absence, which
 *   is THE LEAD's finding (`boss-cue-read-c.ts`).
 * - **Nothing to the pilot, ever.** His gesture is the carry and *which mouth*
 *   is the whole of the answer; the picture already refuses to mark the one
 *   owed on either screen (`drawMouths`), and a cue would be that refusal
 *   undone.
 * - **Nothing about the clock.** `N OF M · beats left` is drawn on her screen
 *   alone and reddens at four (`drawClock`), and a hurry-up on his would be her
 *   gauge read out on his glass — THE SURGE's rule (`surge-word.ts`).
 * - **Nothing on the verdict or the settle.** Both are drawn to both seats, the
 *   burst on the mouth and every ring and digit turning good, and a word over a
 *   round already won is a word about nothing.
 */
export function spliceCues(
  _l: Layout,
  _world: World,
  _s: SpliceState,
  _beatPhase: number,
): readonly BossCue[] {
  return [];
}
