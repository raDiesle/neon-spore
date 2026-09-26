import type { Wave } from "../wave-types.js";

/**
 * Three waves, between the two halves of act seven: **THE CHOKE**, then
 * **THE LIMPET** and **THE LEECH**.
 *
 * `7a` for `act-7b.ts`'s reason — the order of the files is the order of the
 * game, and this one stands after THE COIL and before THE TWITCH, which is
 * where the owner put it. Its own file rather than a fourth entry in either
 * neighbour because both are at the 250-line ceiling and neither has room
 * for a wave carrying a guide.
 *
 * It is the third thing the act's faults can do to a control, and the one
 * the two before it leave open. THE JAM took the trigger and left the
 * steering; THE COIL took the trigger the other way, stuck down. This takes
 * the **steering** and leaves the trigger: the same thing hangs from the top
 * of the field, its beam is on the cannon strip, and for the whole wave the
 * strip is dead and the cannon walks wall to wall a column a beat
 * (`sim/malfunction.ts`, `steerCol`). Nothing falls to cause it and nothing
 * gets it off — a fault, THE JAM's and THE COIL's kind, authored on the wave
 * and not a body — so the answer is not a place to stand but a beat to
 * fire on. Player 2 fires from a cannon neither of them is steering, on the
 * beat it passes under a body; player 1, the only seat shown the light
 * along the hull toward the column it steps to next (`render/choke-hull.ts`),
 * calls that column ahead. The mistake it punishes is a trigger that waits
 * for a cannon that is not coming back, and a pilot who says nothing
 * because there is nothing to press.
 *
 * It was a body once — a strand that fell, took the cannon, and was tapped
 * off — and the owner asked for it to be the same kind of thing as the
 * other two faults. The tap-off is on the NOT BUILT YET page.
 *
 * **THE LIMPET and THE LEECH are the fourth thing**, and the one that makes
 * *standing still* the mistake. Both are faults now, the same as the three
 * above: the owner settled it on 15 September 2026 — *they should only exist as
 * brush, but once they are placed on a tile, for a defined period of time, the
 * malfunction is applied.* So the lantern fires a body at a control very fast,
 * like a harpoon, and it sticks there; a control that has not been in a new
 * column for `harpoonStillBeats` — a beat and a half, judged between beats and
 * not on them — loses the round, and when the pencil runs out the line is
 * reeled home and the wave goes on (`sim/harpoon.ts`).
 *
 * **What the body used to do is on the NOT BUILT YET page**: the fall down a
 * lane, the fuse counted in beats, and being shaken off by moving enough times.
 * A body that leaves because its owner called it back is a different creature
 * from one the pair shook off, and the owner asked for the first.
 *
 * What the two waves teach is still the split, and it has moved one step: the
 * seat holding the control can feel it failing and can do nothing but keep the
 * thumb moving, and the seat *without* the control is the one with a panel to
 * read it off — so MOVE CANNON! and MOVE SHIELD! are under that seat's dial and
 * over the body, and the word is the whole answer
 * (`render/duty-harpoon.ts`, `render/harpoon-mark.ts`). THE LIMPET carries
 * rocks, because a rock is the thing that asks the plate to *stand* somewhere,
 * and a plate that has to meet a rock and be gone on the next beat is the
 * lesson with its teeth in; THE LEECH carries ordinary targets for the same
 * reason — parking the cannon under a body to line the shot up is the thing it
 * punishes. Both are on the standard panel: nothing new is pressed.
 *
 * **Two placements each, with a gap between them**, which is the whole of what
 * a pencil buys over a fault that held the wave: the pair gets six or eight
 * beats to set up, twelve beats of the control not being theirs, eleven or so
 * back, and then it happens again — THE LIMPET's second window while there are
 * rocks on the field, THE LEECH's over a stretch that already carries targets,
 * because what that wave punishes is the cannon parked under a body to line a
 * shot up and the fault has to be on while there is something worth parking
 * under.
 *
 * 1. Beats 0–8, plain bodies down the lanes the cannon walks through in
 *    its first sweep, so the first pass is a shot that can be made.
 * 2. Beats 14–30, bodies further from the middle, timed a beat or two off
 *    the cannon's pass under them, so player 2 has to wait a pass or fire
 *    early rather than on sight.
 * 3. Beats 38–48, two at once on opposite walls: only one is under the
 *    cannon this sweep, and which is player 1's call.
 *
 * The prose about the wave lives **here, above the array**, and not beside
 * the entry: `tools/director/src/serialize.ts` regenerates everything from
 * `export const WAVES_ACT_7A` down every time somebody saves a wave in the
 * editor, and a comment inside the array is gone the first time they do.
 */
export const WAVES_ACT_7A: Wave[] = [
  {
    id: "theChoke",
    name: "THE CHOKE",
    guide: {
      scene: "theChoke",
    },
    entries: [
      { beat: 0, col: 4, color: "red" },
      { beat: 4, col: 5, color: "cyan" },
      { beat: 8, col: 2, color: "red" },
      { beat: 14, col: 1, color: "cyan" },
      { beat: 20, col: 6, color: "red" },
      { beat: 26, col: 3, color: "cyan" },
      { beat: 30, col: 0, color: "red" },
      { beat: 42, col: 6, color: "red" },
      { beat: 44, col: 0, color: "cyan" },
      { beat: 48, col: 2, color: "cyan" },
    ],
    faults: [{ kind: "steer" }],
  },
  {
    id: "theLimpet",
    name: "THE LIMPET",
    guide: {
      scene: "theLimpet",
    },
    entries: [
      { beat: 0, col: 2, kind: "meteor", color: null },
      { beat: 16, col: 1, kind: "meteor", color: null },
      { beat: 22, col: 5, kind: "meteor", color: null },
      { beat: 30, col: 2, kind: "meteor", color: null },
      { beat: 44, col: 0, kind: "meteor", color: null },
      { beat: 50, col: 5, kind: "meteor", color: null },
    ],
    faults: [
      { kind: "limpet", at: 6, beats: 12 },
      { kind: "limpet", at: 29, beats: 14 },
    ],
  },
  {
    id: "theLeech",
    name: "THE LEECH",
    guide: {
      scene: "theLeech",
    },
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 4, col: 1, color: "cyan" },
      { beat: 18, col: 0, color: "red" },
      { beat: 22, col: 6, color: "cyan" },
      { beat: 28, col: 2, color: "red" },
      { beat: 42, col: 5, color: "cyan" },
      { beat: 48, col: 1, color: "red" },
    ],
    faults: [
      { kind: "leech", at: 8, beats: 12 },
      { kind: "leech", at: 34, beats: 14 },
    ],
  },
];
