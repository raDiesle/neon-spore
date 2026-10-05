import {
  type AntiphonState,
  antiphonChooser,
  antiphonExplainer,
  gorgeTapSeat,
  type InstarSeat,
} from "@neon-spore/sim";
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
 * THE ANTIPHON's two, and the split is the eyes, on a thing neither seat can
 * point at — and **the seats swap every level** (`antiphonExplainer`, the
 * owner, 5 October 2026: *every level the roles of p1 and p2 switch*). The
 * explainer is shown **the organ**, standing under the rail in the middle,
 * so what it *is* is theirs to put into words; the chooser is shown **the
 * rail** — every candidate on its vein, the organ among them unmarked — and,
 * where the organ stands, a shape that is no shape at all, so which of them
 * is being described is theirs. The explainer's *three lobes, the bottom one
 * long* and the chooser's *the left one?* are the fight (`antiphon-shape.ts`,
 * `antiphon-draw.ts`, `sim/antiphon.ts`). `test` is both.
 */
export const showsAntiphonOrgan = (role: ViewRole, s: AntiphonState): boolean =>
  role === "test" || role === (antiphonExplainer(s) === 1 ? "p1" : "p2");
export const showsAntiphonRail = (role: ViewRole, s: AntiphonState): boolean =>
  role === "test" || role === (antiphonChooser(s) === 1 ? "p1" : "p2");

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

/**
 * THE STARE's one, since 29 September 2026: the eye freezes **both** seats on
 * an open beat, so the gaze, the lid and its ring are on every screen, and
 * the only split left is the flash of a caught press, which lights the
 * panel of the seat that pressed (`stare-fx.ts`). `test` is both.
 */
export const showsStareCaught = (role: ViewRole, seat: 1 | 2): boolean =>
  role === "test" || role === `p${seat}`;

/**
 * THE FILAMENT's two. Since 25 September 2026 both thumbs and the lit run are
 * on every screen — the owner: *player 2 should more clearly see what player
 * 1 is doing right now* — so the split is what is left of it: **the way
 * ahead**, the unlit path from the head to the root and the lead into the
 * body, is the pilot's alone, and which way the line turns next is his to
 * say. `Ahead` is also whose ring this screen draws as its own, bright with
 * its verb; `Behind` the navigator's. The other ring is drawn dim, with the
 * waiting clock when the line waits on it (`filament-draw.ts`,
 * `filament-turn-draw.ts`, `docs/spec/bosses.md` §11.33). `test` is both.
 */
export const showsFilamentAhead = (role: ViewRole): boolean => role !== "p2";
export const showsFilamentBehind = (role: ViewRole): boolean => role !== "p1";

/**
 * THE GORGE's tap, on the screen of the seat whose thumb it is, and the boss
 * says which (`gorgeTapSeat`, `sim/gorge-hand.ts`): the pilot's, the seat
 * shown the counts and the order. The other seat's screen draws no mark for
 * it, so a press there has nothing to refuse (`gorge-grip.ts`). `test` is both.
 */
export const showsGorgeTap = (role: ViewRole): boolean =>
  role === "test" || role === `p${gorgeTapSeat}`;
