import type { SimConfig } from "@neon-spore/sim";
import type { BossCue } from "./boss-cue-shape.js";
import { pointerSeats } from "./desk-seat.js";
import { INSTAR_WORDS, MARK_WORD_OFF } from "./instar-marks.js";
import { instarMarkRadius } from "./instar-place.js";
import { drawInstarRing } from "./instar-ring.js";
import { drawInstarWord, type MarkRoom } from "./instar-word.js";
import type { Layout } from "./layout.js";
import { drawMarkHalo } from "./mark-feedback.js";
import type { ViewRole } from "./view-role.js";

/**
 * **A desk's chord body is drawn as `HOLD BOTH` is drawn** — the second half
 * of *one mouse can never close a chord*. A held mouse on any chord body at
 * the desk is the whole chord (`desk-chord.ts`), and the owner, 3 October
 * 2026: *if its same, it should be same control type used, which means exact
 * same visuals*. So on a screen whose pointer speaks for both seats
 * (`desk-seat.ts` `pointerSeats`), every chord body a step asks for — the
 * `HOLD` cues its reading marks `chord` — wears THE INSTAR's ring and fill,
 * its halo and its word beside it (`instar-marks.ts`), and never a drawing of
 * its own. The reading still says when: the ring goes as the chord is held,
 * as the cue did.
 *
 * A phone's screen is unchanged: one finger stays one pad, and its `HOLD`
 * cue is the one it always had. The bosses' own drawers read no role; this
 * is drawn with the cues (`boss-cue-draw.ts`).
 *
 * A desk key held pins the pointer to one seat for a press, but the screen
 * is not redrawn for it — THE INSTAR's `HOLD BOTH` ring is not either.
 */

const HOLD = { gesture: "hold" } as const;

/** Whether this screen's pointer speaks for both seats with no key held: the desk's TEST screen. */
export function pointerSpeaksForBoth(role: ViewRole): boolean {
  return pointerSeats(role, undefined).length > 1;
}

/** Whether a cue is a chord body this screen draws as THE INSTAR's ring rather than as a cue. */
export function deskChordRing(cue: BossCue, role: ViewRole): boolean {
  return cue.chord === true && pointerSpeaksForBoth(role);
}

/** Every chord body among `cues` as THE INSTAR's `HOLD BOTH` ring, its word clear of the others. */
export function drawDeskChordRings(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  cues: readonly BossCue[],
  time: number,
): void {
  const rings = cues.filter((c) => deskChordRing(c, l.role));
  if (rings.length === 0) return;
  const r = instarMarkRadius(l, cfg);
  const off = r * MARK_WORD_OFF;
  const rooms: MarkRoom[] = rings.map((c) => ({
    left: c.x - off,
    right: c.x + off,
    top: c.y - off,
    bottom: c.y + off,
  }));
  const { kind, word } = INSTAR_WORDS.hold;
  rings.forEach((c, i) => {
    const side = c.x < l.width / 2 ? -1 : 1;
    drawMarkHalo(ctx, c.x, c.y, r, time);
    drawInstarRing(ctx, c.x, c.y, r, HOLD, true, false, 0, time, false);
    const room = { own: rooms[i] as MarkRoom, avoid: rooms.filter((_, j) => j !== i) };
    drawInstarWord(ctx, l, word, c.x + side * off, c.y, side, true, kind, room);
  });
}
