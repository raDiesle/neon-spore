import { diastoleClampSeat, gorgePinchSeat, gorgePrySeat, type InstarSeat } from "@neon-spore/sim";
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

/**
 * THE STARE's two, and the split is the eyes, **one way and then the
 * other**: while the eye turns and while it looks, the seat it has chosen
 * is named on the *other* seat's screen alone — the one that is not about to
 * be frozen — because what is random in this boss is what one player knows
 * and the other does not (`docs/spec/structure.md`), and seven beats of
 * warning are seven beats in which somebody has to say *it is you*. Once the
 * look has landed, the seat under it is shown that it is: the gaze falling on
 * its own field, and the flash on its own panel if it pressed anyway. By then
 * the telling is over and nothing is given away; what the gaze says is *hands
 * off*, to the one pair of hands it is about (`stare-draw.ts`, `stare-fx.ts`,
 * `sim/stare.ts`). `test` is both.
 */
export const showsStareTarget = (role: ViewRole, watching: 1 | 2): boolean =>
  role === "test" || role !== `p${watching}`;
export const showsStareWatched = (role: ViewRole, watching: 1 | 2): boolean =>
  role === "test" || role === `p${watching}`;
/**
 * And the lid's handle, on the screen of the seat whose thumb it is: the one
 * the eye is *not* looking at, which is the screen already told who. The lid
 * itself — how far down it is — is on every screen, since a watched seat has
 * to see the lid come down to know it is free; only the ring and its word
 * are the puller's (`stare-lid.ts`, `sim/stare.ts` `stareLidFree`).
 */
export const showsStareLid = (role: ViewRole, watching: 1 | 2): boolean =>
  showsStareTarget(role, watching);

/**
 * THE FILAMENT's two, and the split is the eyes, each way, on **one line**:
 * the pilot is shown **the distance ahead** — the whole armed filament,
 * faint, from its free end up to the root and the lead into the body, the
 * part he has drawn lit behind his thumb — and nothing of the navigator's
 * thumb: where she is on the lit part is hers to say. The navigator is
 * shown **the distance behind** — the lit tiles from the free end up to her
 * thumb and the one lit tile past it, the next she may take — and nothing of
 * the unlit path, the head, or the lead: how far ahead he is, and which way
 * the line turns next, are his to say. The gap between the two thumbs is
 * the number neither screen has whole, and it is the sentence this boss
 * exists to make them say (`sim/filament.ts`, `filament-draw.ts`,
 * `docs/spec/bosses.md` §11.33). `test` is both.
 */
export const showsFilamentAhead = (role: ViewRole): boolean => role !== "p2";
export const showsFilamentBehind = (role: ViewRole): boolean => role !== "p1";

/**
 * THE DIASTOLE's clamp, on the screen of the seat whose thumb it is — the
 * pilot's, and the boss says so rather than this file (`diastoleClampSeat`,
 * `sim/diastole-open.ts`). It is the seat that is shown the alone chamber
 * grey and cannot see it beat, on purpose: the ring says *this, and your
 * thumb*, never *when*, and the beat stays the navigator's to say. The
 * held chamber itself — squeezed shut under the clamp — is on every screen,
 * the way THE STARE's lid is; only the ring and its word are the clamper's
 * (`diastole-clamp.ts`). `test` is both.
 */
export const showsDiastoleClamp = (role: ViewRole): boolean =>
  role === "test" || role === `p${diastoleClampSeat}`;

/**
 * THE GORGE's two thumbs, each on the screen of the seat whose thumb it is,
 * and the boss says which (`gorgePinchSeat`, `gorgePrySeat`,
 * `sim/gorge-hand.ts`): the pinch is the pilot's, the seat holding the cannon
 * on the column and shown the count; the pry is the navigator's, the seat
 * shown the mouth's colour and loading the beam. The other seat's screen
 * draws no ring for it, so a press there has nothing to refuse
 * (`gorge-grip.ts`). `test` is both.
 */
export const showsGorgePinch = (role: ViewRole): boolean =>
  role === "test" || role === `p${gorgePinchSeat}`;
export const showsGorgePry = (role: ViewRole): boolean =>
  role === "test" || role === `p${gorgePrySeat}`;

/**
 * THE GIMBAL's two rings, one to a seat, and this is the whole boss: the
 * pilot is shown **the outer ring** — its rim, its teeth, and his own mark on
 * it — and the navigator **the inner**, with hers. Neither is ever shown the
 * other's ring at all, so neither can check the other's bearing against their
 * own, and neither can see that the inner ring is gripped from the far face
 * and answers a turn backwards (`gimbalShownMilli`, `sim/gimbal.ts`). That
 * reflection is the fight: *round to the right, a quarter* means two
 * different turns in the two seats, and the pair has to find the word for the
 * one they both mean before three alignments run out. A screen with both
 * rings on it would let one of them simply steer the other, and there would
 * be nothing to agree about (`gimbal-draw.ts`, `docs/spec/bosses.md` §11.34).
 * Which ring is whose is said by geometry rather than colour — the outer is
 * the larger and is pinned top and bottom, the inner pinned at its sides —
 * because both are rock grey and neither is ever shot (§18, *Colour*).
 * `test` is both, which is the only screen the right angle is visible on.
 */
export const showsGimbalOuter = (role: ViewRole): boolean => role !== "p2";
export const showsGimbalInner = (role: ViewRole): boolean => role !== "p1";

/**
 * THE BELLOWS's two handles, one to a seat, and this is the only thing it
 * keeps from anybody: the pilot is shown **the pull** — the rail and bar under
 * his own chamber, at the depth his thumb has it — and the navigator **the
 * push**, under hers. Neither is shown the other's handle at all.
 *
 * Both are shown the whole lung, and that is the point rather than an
 * oversight: how far each chamber is drawn out is exactly what *now* and *not
 * yet* are said about, and a seat that could not see the other's chamber would
 * have nothing to take a turn against. What a screen must not carry is the
 * *other* seat's rail — a handle drawn where no thumb at that desk can reach
 * it is a thing to point at instead of a thing to say, and this fight is only
 * the saying (`bellows-handle.ts`, `sim/bellows.ts`). The split here is the
 * beat, not the eyes, which is the one boss where that is true. `test` is
 * both, and is the only screen the two handles are seen working in turn on.
 */
export const showsBellowsPull = (role: ViewRole): boolean => role !== "p2";
export const showsBellowsPush = (role: ViewRole): boolean => role !== "p1";

/**
 * THE SPOOL's two halves of one sentence (§21). The pilot is shown **the
 * brake** — the rail, and the knob at the depth his thumb has it — and never
 * the zone: he feels a depth and is told nothing of what it is worth. The
 * navigator is shown **the gauge** — the zone, and where the paid-out length
 * is against it — and has no brake to feel.
 *
 * Both are shown the spool and the line, and how fast the line runs is on
 * both screens: it is the thing the pair say *faster* and *slower* about, and
 * hiding it would leave her a gauge and nothing to see it answered in. What
 * neither holds is the other's half — a depth with its meaning, or a zone
 * with a hand on it (`spool-brake.ts`, `spool-gauge.ts`, `sim/spool.ts`).
 * `test` is both.
 */
export const showsSpoolBrake = (role: ViewRole): boolean => role !== "p2";
export const showsSpoolZone = (role: ViewRole): boolean => role !== "p1";
