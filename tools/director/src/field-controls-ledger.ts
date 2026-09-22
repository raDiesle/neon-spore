import type { FieldControlDef } from "./field-control-def.js";

/**
 * **THE LEDGER's four hands**, in a file of its own, the split every boss
 * since THE INSTAR has made.
 *
 * Two rows on two targets and **one circle between them**, which is this
 * boss's arrangement and no other's: the foot is offered while the cord is
 * still `rooting` and the plug from `paying` on, so the two are never on a
 * screen together and both can stand on the root itself. A pair learns one
 * sentence — *your hand is on the root* — and what it does is whatever the
 * fight is doing.
 *
 * The boss's own split is **half of one drawn object hidden from each seat**:
 * the cord fades out above the plating on the pilot's screen so he cannot read
 * which column it is rooted in, and the socket, the lock and the chevron are
 * hers alone (`render/ledger-cord.ts`, `ledger-read.ts`). That is why the seat
 * column below reads the way it does — both of these are on the half of the
 * cord only she can see, and the question was answered before it was asked.
 *
 * **His two are the same question answered the other way round.** Neither
 * stands on the root, because a mark in the faded stretch would put back what
 * the fade takes away: the pull's ring rides the bead it is about, down a cord
 * only he is shown, and the haul's stands still above the fade
 * (`render/ledger-pull.ts`, `ledger-haul.ts`). **No handle in this fight is
 * drawn on both screens and none is dimmed** — the haul's was, for one frame,
 * and it came out a black disc on the cord in the one place her screen never
 * puts a disc.
 *
 * **The rules shipped first and the pictures came after.** All four gestures
 * were heard by `sim/ledger-hand.ts` from 19 September 2026 with nothing drawn
 * to take hold of, which is why there were no rows here and
 * `on-field-controls.test.ts` had every one of them as `unbuilt`. The look is
 * exempt under *a look with no shipped alternative*, twice.
 */
export const LEDGER_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE LEDGER'S FOOT",
    where:
      "on the root of the cord, a tile and a fifth above the plating it is " +
      "going into — " +
      "and it walks under her own thumb, because where the cord is rooted is " +
      "what the carry moves. Drawn on her screen alone, the only handle here " +
      "the other seat is not shown dimmed: it stands in the rooted column, " +
      "which is the half of this fight his screen fades out. Only while the " +
      "cord is rooting, which is the first two beats of the fight and the " +
      "only time it is not in yet (render/ledger-grip.ts)",
    seat: "player 2 only — the root is the half of the cord his screen fades out",
    gesture: "grab and drag",
    does:
      "Walks the foot of the cord along the plating before it seats: the " +
      "carry is read as columns from the one she grabbed it in, so a move " +
      "coalesced away heals itself on the next (sim/ledger-hand.ts, " +
      "ledgerFootable). **The fight's whole geometry is decided in these two " +
      "beats** — a root against a wall walks one way for the rest of the " +
      "encounter and a root in the middle turns — and it is the only gesture " +
      "here made before the first bill. Its dial is what is left of " +
      "ledgerRootBeats, draining: what empties is her chance to choose.",
    source: "touch.ts — ledgerGripUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "ledgerFoot",
    sends: ["drag"],
    pose: "THE LEDGER · ROOTING",
  },
  {
    name: "THE LEDGER'S PLUG",
    where:
      "on the same ring, once the cord is in: above the grommet and clear of " +
      "the white lock that names the column, because that lock is the fight's " +
      "whole instruction and a disc fills opaquely. From paying and through " +
      "whipping, and never on the taut cord (render/ledger-grip.ts)",
    seat: "player 2 only — the socket is hers to see and hers to stand the plate on",
    gesture: "grab and drag",
    does:
      "Stoppers the socket for as long as her thumb is in it. A return that " +
      "lands on a plugged socket is **rolled over** — refused, put back on " +
      "the cord a cadence later, nothing warded and nothing whipped, with the " +
      "root sliding under it as it always does (sim/ledger-hand.ts, " +
      "ledgerPlugs). **It is the one answer this fight had none of**: a " +
      "column she cannot carry the plate to in time was a lost wave and " +
      "nothing else. Rationed rather than timed — ledgerPlugBeats for the " +
      "whole encounter, charged on the beat, so a thumb that landed and " +
      "lifted between two beats costs nothing — and that count is the dial, " +
      "draining, drawn whether or not her thumb is down. Refused on the taut " +
      "cord: the last return is the one return nobody is meant to answer.",
    source: "touch.ts — ledgerGripUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "ledgerSocket",
    sends: ["drag"],
    pose: "THE LEDGER · PAYING",
  },
  {
    name: "THE LEDGER'S PULL",
    where:
      "on the soonest return itself, riding it down the cord — the one bead " +
      "the pair is talking about, so the ring cannot be on a different return " +
      "from the one the press would move. Drawn on his screen alone, behind " +
      "the same gate as the bead: where a return has got to is the half of " +
      "this object she is not shown. Only while the cord is whipping " +
      "(render/ledger-pull.ts)",
    seat: "player 1 only — the beads are his to see and his to answer",
    gesture: "grab and drag",
    does:
      "Hauls that return **one beat down the cord**, once, so a pair that has " +
      "the plate where it is going can run the cord faster than the boss " +
      "meters it out — in whipping a warded return is thrown back up into " +
      "the seam for free, so the cord is the weapon and the returns are the " +
      "ammunition (sim/ledger-hand.ts, ledgerPullable). Never the last " +
      "return, which is the one nobody is meant to answer, never twice, and " +
      "never onto a beat another return already lands on: the root slides " +
      "between two landings, so the second would arrive in a column the " +
      "plate has just been walked out of. Its dial is how far down the cord " +
      "that return has got — what fills is the chance to haul it — and it is " +
      "never drawn held, because the pull is over in the tick it is made and " +
      "the answer is the bead jumping down the cord with its count dropping.",
    source: "touch.ts — ledgerPullUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "ledgerBead",
    sends: ["drag"],
    pose: "THE LEDGER · WHIPPING",
  },
  {
    name: "THE LEDGER'S HAUL",
    where:
      "on the cord itself, a little under half way down from the body — " +
      "above the stretch that fades out on his own screen, so the mark names " +
      "no column, and with better than half the cord left below it for the " +
      "carry. **On his screen alone**, like his other one: a ring fills its " +
      "disc opaquely and a dim one reads as a return, which is the one thing " +
      "her screen never shows. Only on the taut cord (render/ledger-haul.ts)",
    seat: "player 1 only — and the dial he reads the refusal off is his too",
    gesture: "grab and drag",
    does:
      "Tears the cord out of the plating and ends the fight: a carry of " +
      "ledgerHaulMilli **downward** from where he grabbed, cut to that and " +
      "reset to nought by a carry upward (sim/ledger-hand.ts, " +
      "ledgerHaulable). The last return is the one the pair must not answer, " +
      "and the fight held open until they worked that out by doing nothing; " +
      "now it can be finished by hand. **But only while the plate is out of " +
      "the socket's column** — the movement is still *let it through*, said " +
      "with a hand instead of with a wait — and that refusal is silent: the " +
      "handle stands for the whole of taut and what he gets back for pulling " +
      "on a covered socket is a dial that will not fill. He cannot see the " +
      "column he is being refused for. She can, and her dim ring is where " +
      "she reads it (sim/ledger-gates.ts).",
    source: "touch.ts — ledgerPullUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "ledgerCord",
    sends: ["drag"],
    pose: "THE LEDGER · TAUT",
  },
];
