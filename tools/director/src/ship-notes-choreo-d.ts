import type { GroupName } from "./ship-groups.js";

/**
 * The paragraph under each **choreographed boss's** card, the fourth page —
 * THE DAVIT and every boss built after it.
 *
 * Cut out of `ship-notes-choreo-c.ts` on 26 September 2026, when that page
 * stood at 241 lines and THE DAVIT's paragraph was sixteen more. The seam is
 * the one the pages before it were cut along — the order they were built in,
 * which nothing depends on. Spread into `CHOREO_NOTES` in place, so the
 * totality guard is unchanged. The next boss's paragraph goes here.
 *
 * THE CYST's came over on 27 September 2026, when THE HASP's story grew its
 * paragraph on page three: the last boss on the page goes, never the one
 * being worked on. It left with THE CYST on 8 October 2026.
 */
export const CHOREO_NOTES_D = {
  "THE CAPSTAN — the boss one hand rocks for the other to wear":
    "Asked for in docs/spec/bosses-choreographed.md §37: a drum over the " +
    "middle column on a cradle one seat rocks with a pull past " +
    "capstanPullMilli — a thumb carried across the drum — while the other wipes the " +
    "bared face's band, THE RIME's RubCount. Only the bared face wears; the " +
    "hidden one keeps its wear. The left mark is the pilot's pull and the " +
    "navigator's thumb, the right the other way; a band not lit stops one " +
    "short of capstanWearThreshold. Both bright bare the core, shot in its " +
    "colour. A hold step wants capstanHoldBeats beats of pull and rub, " +
    "either way round; run out, it covers the core and is asked again. A " +
    "band window run out is tried again with its wear; a fire step run out " +
    "is a hull hit, which is the wave. The pull is a thumb on the drum's " +
    "middle and the rub a thumb on either end (render/capstan-grip.ts) — see " +
    "sim/capstan.ts, sim/capstan-step.ts, sim/capstan-hand.ts, " +
    "sim/capstan-shot.ts, sim/config-capstan.ts.",
  "THE GALL — the alien tapped, pulled and thrown across the hull":
    "Asked for in docs/spec/bosses-choreographed.md §38, reworked by the " +
    "owner on 8 October 2026: a small alien on a seam across the hull, below " +
    "the middle, sitting on one of four points. The seat whose half it is on " +
    "taps it a leap's taps, then pulls it up toward the top of the field, " +
    "gallPullMilli or more; it flies for gallLeapBeats under THE SLOW and " +
    "lands on a point of the other half, drawn off the seeded Rng, where the " +
    "next step's clock starts. A fire step lights it in a colour, shot in its " +
    "column. Any step run out is a hull hit, which is the wave — see " +
    "sim/gall.ts, sim/gall-step.ts, sim/gall-hand.ts, sim/gall-shot.ts, " +
    "sim/config-gall.ts.",
  "THE TRAPEZE — an alien swung up to a gong":
    "Reworked by the owner, 7 October 2026 (docs/spec/bosses-choreographed.md " +
    "§39): an alien on a swing hung from long ropes, trapezeRopeMilli from " +
    "trapezeAnchorMilli above the grid, swinging on its own and dying down " +
    "trapezeDampMilli a beat. A swipe toward the middle in a zone, while the " +
    "swing comes back over it, pushes it trapezePushMilli higher; while it " +
    "goes out it brakes it trapezeBrakeMilli. High enough, the alien kicks the " +
    "level's gong. Four levels: P1 left and P2 right; who swipes a side drawn " +
    "by chance; shots from below; the pilot's tap locking the cannon for " +
    "trapezeLockBeats, a shot from the side. A level run out is the alien at " +
    "the hull, which is the wave. No SLOW — see sim/trapeze.ts, " +
    "sim/trapeze-step.ts, sim/trapeze-hand.ts, sim/trapeze-shot.ts, " +
    "sim/config-trapeze.ts.",
  "THE FLUE — an ember one seat sees and the other shoots":
    "Reworked by the owner, 5 October 2026 (docs/spec/bosses.md §11.57): " +
    "an ember runs end to end along a slot across the top of the field, " +
    "flueSpanMilli either side of the middle, and only the pilot is drawn " +
    "it. The cannon is held under the middle column. Each level asks one " +
    "weapon — a bolt or the beam — in one colour, with its own ember speed, " +
    "THE SLOW at its own strength and the end it sets off from, and is met " +
    "once or more; the pilot says when, early by the " +
    "shot's own delay, and the navigator fires. A shot is judged at the " +
    "flue, within flueHitMilli of the ember; anything else spends one of " +
    "flueShots and beams the ember back to its end, held flueBeamBeats; " +
    "the last one spent is a hull hit, which is the wave. " +
    "See sim/flue.ts, sim/flue-step.ts, sim/flue-shot.ts, sim/flue-lead.ts, " +
    "sim/config-flue.ts.",
  "THE GOVERNOR — a needle each of you taps on your own mark":
    "Asked for in docs/spec/bosses-choreographed.md §43 and reworked on the " +
    "owner's word of 6 October 2026: a needle running round a dial mid-hull " +
    "on its own, quick. Every tap step lights a mark for each seat, and " +
    "each taps as the needle crosses its own, within governorMarkMilli — " +
    "TAPS ON A MOVING TARGET, both seats at once. Later steps light three " +
    "and four marks, numbered, to be tapped in order. The taps before the " +
    "first shot light the hub; then the needle's lit tip is shot under THE " +
    "SLOW, through a gap in the bottom of the rim, by a bolt that meets it " +
    "there within governorDownMilli of the bottom (7 October 2026). A tap step run out is tried again with what was landed " +
    "kept, a retap run out dims the hub until it is made, and a fire step " +
    "run out is a hull hit, which is the wave. See sim/governor.ts, " +
    "sim/governor-mark.ts, sim/governor-step.ts, sim/governor-hand.ts, " +
    "sim/governor-turn.ts, sim/governor-shot.ts, sim/config-governor.ts.",
  "THE LAMPREY — an eel one of you holds by the tail for the other to pull off":
    "Asked for in docs/spec/bosses-choreographed.md §41, and rebuilt on the " +
    "owner's word of 5 October 2026: an eel leaping across the field to a " +
    "fresh tile a stay, further each stay, and biting into it under THE SLOW. " +
    "One seat holds the tail; the other pulls the head up off the tile (a " +
    "pull), taps the lit tooth (a teeth), or pulls the head while the holder " +
    "drags the tail the other way at once (an apart). A gullet stay is shot " +
    "in its colour. Any stay run out bites through to the hull, which is the " +
    "wave. See sim/lamprey.ts, sim/lamprey-step.ts, sim/lamprey-leap.ts, " +
    "sim/lamprey-hand.ts, sim/lamprey-shot.ts, sim/config-lamprey.ts.",
  "THE MIMIC — a sign one of you reads for the other to draw":
    "Asked for in docs/spec/bosses-choreographed.md §42: a mantle with " +
    "eight arms that holds a frame, and a picture of squares in it on one " +
    "seat's screen only. The other seat taps it into the frame a tile at a " +
    "time; the frame is centred on row mimicFrameRow and as big as the " +
    "step's pictures. No panel, no brush, one colour, no SLOW. Tapping a " +
    "painted tile clears it. A whole, exact picture " +
    "peels and draws the arms back up a step; one not finished in its " +
    "window is worn on the skin for mimicMimicBeats, then an arm reaches a " +
    "step down, and mimicReaches reaches in a movement strike the hull. " +
    "Pictures for the pilot, a roll, pictures for the navigator that change " +
    "mimicChangeBeats in, a roll, then split boards each seat reads for the " +
    "other, each baring a core on row mimicCoreRow to tap. " +
    "See sim/mimic.ts, sim/mimic-frame.ts, sim/mimic-shapes.ts, sim/mimic-hand.ts.",
  "THE LATCH — a rope you haul down in turns, never both letting go":
    "Brief §2 of docs/spec/bosses-cinematic.md, built as a tug of war: a " +
    "slime has hooked the hull with a rope, and each seat has one grip on it, " +
    "the pilot's left and the navigator's right. They take turns: the grip " +
    "whose turn it is carries the rope down as far as the thumb goes, at most " +
    "latchReachMilli, while the other holds; letting go after latchStrokeMilli " +
    "passes the turn. A knot is latchKnotMilli, so two pulls at least. Both " +
    "hands off at once and the rope slips back to the last knot. A yank level rears for latchRearBeats every " +
    "latchYankEveryBeats and yanks: both hands must be holding. A cross level " +
    "swaps the grips. A level run out tears the hull. No SLOW. " +
    "See sim/latch.ts, sim/latch-step.ts, sim/latch-hand.ts, sim/config-latch.ts.",
  "THE BASTION — a metal moon you take apart, one layer at a time":
    "The owner's brief of 8 October 2026, in THE HALTER's place: a moon of " +
    "armour shells, each taken off by a different job and the moon smaller " +
    "for each. Plates: four a side, each pulled out past bastionPullMilli " +
    "along its own way; let go short and it snaps back. Ring: the pilot turns " +
    "the moon by its rim (bastionRimMilli), the navigator shoots the gun within " +
    "bastionFrontMilli of the front in its colour. Lattice: a node charges " +
    "bastionChargeBeats, the shield under it throws it back; unanswered it " +
    "charges again after bastionGapBeats. Port: only the navigator sees it; the " +
    "cannon under it, either colour. A shell run out grows back. THE SLOW on each. " +
    "See sim/bastion.ts, sim/bastion-step.ts, sim/bastion-hand.ts, sim/bastion-shot.ts.",
} satisfies Partial<Record<GroupName, string>>;
