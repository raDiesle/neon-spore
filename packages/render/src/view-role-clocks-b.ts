import type { InstarSeat } from "@neon-spore/sim";
import type { ViewRole } from "./view-role.js";

/**
 * **The clock bosses' halves, page two** — what each seat is shown of the
 * bosses from `docs/spec/bosses-choreographed.md` built after THE LEAD.
 *
 * Cut from `view-role-clocks.ts` on 17 September 2026, when THE LEAD's two
 * had put that page at 247 lines, for the reason that page was cut from
 * `view-role.ts`: every one of these hangs over the top of the field with
 * nothing of itself on the grid, each brings a predicate with a paragraph
 * over it, and the page is the half that grows. Nothing re-exports these:
 * every drawer that asks one names this file (`.claude/skills/new-boss`).
 *
 * The rules are the ones the first page states: `test` is one person holding
 * both seats and is shown both halves, a fact is kept from the seat that
 * would otherwise have nothing to ask for, and a split that is *symmetric* —
 * a different thing kept from each seat — is what makes a fight two counts
 * rather than one count and one witness.
 */

/**
 * THE SCUTTLE's two, and the split is the eyes, each way: the pilot is
 * shown **the count** — every socket of the frame, the ones still holding a
 * part plated over and the ones emptied open on the violet under them, so
 * how many throws are left is his to read and say; the navigator is shown
 * **the live part** — which of the parts hanging loose is the one a shot
 * can take, in the colour it has to be, and the lock on the column the next
 * throw lands in. On her screen every socket is plated whether or not a
 * part is in it, so the count is not hers; on his no hanging part is
 * coloured and nothing is locked, so which one to shoot, and what with, is
 * not his. His *how long we have* and her *this one, red* are the fight,
 * and a screen with both on it would have no one to say either to
 * (`scuttle-shape.ts`, `scuttle-draw.ts`, `sim/scuttle.ts`). `test` is both.
 */
export const showsScuttleCount = (role: ViewRole): boolean => role !== "p2";
export const showsScuttleLive = (role: ViewRole): boolean => role !== "p1";

/**
 * THE ANTIPHON's two, and the split is the eyes again, each way, but on a
 * thing neither seat can point at: the pilot is shown **the organ** — the
 * contour the body has grown, hanging under the middle of the body in the
 * body's own violet, with no column under it and no colour on it, so what
 * it *is* is his to put into words; the navigator is shown **the rail** —
 * every candidate at its column in its colour, the organ among them
 * unmarked, and the beats left before it sinks — so which of them he is
 * describing, and the column and colour a bolt has to be, are hers. On her
 * screen the whole rail pushes out of the body together, so the organ is
 * not given away by being the one that grows; on his nothing stands at a
 * column at all. His *three lobes, the bottom one long* and her *column
 * four, red, six beats* are the fight (`antiphon-shape.ts`,
 * `antiphon-draw.ts`, `sim/antiphon.ts`). `test` is both.
 */
export const showsAntiphonOrgan = (role: ViewRole): boolean => role !== "p2";
export const showsAntiphonRail = (role: ViewRole): boolean => role !== "p1";

/**
 * THE HIVE's two, and the split is the eyes, each way — with each fact
 * kept from the seat whose hands could answer it. The pilot is shown
 * **the colour** of every open breach, and he cannot fire: what he can do
 * is slide the cannon under one, so *four is red* is his to say and the
 * navigator's to fire. The navigator is shown **the swell** — which site
 * bulges in the beats before it opens, and which two once they come in
 * pairs — and she cannot move the cannon: *the next one is at seven* is
 * hers to say and his to slide to. On his screen every site is shut, open
 * or scarred and nothing bulges; on hers every open breach is the same
 * grey. The split was flipped once before a line was drawn: the other way
 * round she fires what she sees and he slides to what he sees, and nobody
 * says anything (`docs/spec/bosses.md` §11.14, `hive-draw.ts`,
 * `sim/hive.ts`). `test` is both.
 */
export const showsHiveColor = (role: ViewRole): boolean => role !== "p2";
export const showsHiveSwell = (role: ViewRole): boolean => role !== "p1";

/**
 * THE INSTAR's one, and the split is **the hands, not the eyes**: both
 * screens see the same body in the same pose, and every mark on it, because
 * a mark is only worth anything if the seat that is *not* asked for it can
 * watch it being answered and say so. What differs is which of the marks a
 * screen calls its own: on that seat the ring is bright and the word over
 * it is the gesture; on the other the ring is dim and the word is the
 * owner's name. The simulation refuses the wrong thumb regardless
 * (`sim/instar-hand.ts`) — this is only how the picture says whose it is
 * before anyone finds out the hard way (`instar-marks.ts`). `both` is
 * everyone's, and `test` is both seats.
 */
export const instarMarkIsMine = (role: ViewRole, seat: InstarSeat): boolean =>
  role === "test" || seat === "both" || (role === "p1") === (seat === "p1");
