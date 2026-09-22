import type { FieldControlDef } from "./field-control-def.js";

/**
 * **The navigator's two hands on THE LEDGER's root**, in a file of its own,
 * the split every boss since THE INSTAR has made.
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
 * **The rules shipped first and the pictures came after.** Both gestures were
 * heard by `sim/ledger-hand.ts` from 19 September 2026 with nothing drawn to
 * take hold of, which is why there were no rows here and
 * `on-field-controls.test.ts` had `ledgerFoot` and `ledgerSocket` as
 * `unbuilt`. The pilot's two — `ledgerBead` and `ledgerCord` — are still
 * there, and are the other half of this lane (`docs/queue.md`).
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
];
