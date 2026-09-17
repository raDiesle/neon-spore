import { MAX_BEARING_STEP, NO_BEARING, TURN } from "./bearing.js";
import type { SimConfig } from "./config.js";
import { ticksPerBeat } from "./config-derived.js";
import { ORRERY_RINGS, type OrreryState, orreryBoss, orreryOrbit } from "./orrery.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * **The pilot's hand on a ring**: the one thing in this fight that can move a
 * gap off a beat the pair has already agreed on.
 *
 * Everything else about THE ORRERY is arithmetic the two of them do out loud —
 * eight beats, six and four, and the beat all three gaps come to the bottom.
 * A hand makes that arithmetic *physical*: a drag on the outermost unbroken
 * ring turns it, so an alignment can be brought forward rather than waited
 * for. It is the design's step 10 and the page calls it THE MAZE's string at
 * boss scale (`docs/spec/bosses-choreographed.md` §2).
 *
 * **It writes an anchor, not a position.** `from[ring]` is where that ring's
 * gap stood on `anchorBeat`, and a gap's place on any beat is arithmetic over
 * it (`orrery.ts`). So a hand adds organs to the anchor and the ring goes on
 * turning at its own cadence around the new one — which is what keeps the
 * boss's central rule intact while a thumb is on it. A hand that stepped a
 * stored slot would have made `orreryNextOpen` a lie the moment it was asked,
 * and that readout is the whole of what player 2 has.
 *
 * **It is a bearing, not a distance**, exactly as THE CLAW's crank is, and for
 * the crank's own reason said about a circle rather than a rope: a finger
 * going round the same ring four times is back where it grabbed four times
 * over, so a displacement is nought at the moments the most has been turned
 * (`crank.ts`). The three numbers it is written in are `bearing.ts`, shared
 * with that mechanism rather than spelled a second time — a thousandth of a
 * turn means one thing in this game.
 *
 * **The ring turns in whole organs.** Organs sit in sockets and a beaded arc
 * is a rhythm, so what a thumb buys is detents: `orreryHandMilliPerOrgan` of
 * travel clicks the ring one organ round and the remainder is banked. This is
 * not decoration — it is the only way the picture can be honest. A ring drawn
 * a third of an organ past its socket is a ring lying about where its gap is,
 * and the shot resolves on the slot. **The look may draw the strain; it must
 * not draw the rotation** (`orreryWoundMilli`).
 *
 * **And it has no flywheel**, against the design's own animation note. A ring
 * that kept a little of the thumb's motion after the lift would be a gap
 * moving with nobody's hand on it, and this is the boss whose rule is that a
 * gap's place is a function of the beat *because one seat's readout is about a
 * beat that has not happened*. The overshoot the design wants is still there
 * and it is the thumb's: a turn and a half an organ means a hand that keeps
 * going past the socket it wanted has bought the next one.
 *
 * **Player 1's, and the seat is checked here**, for `crankHeard`'s reason: a
 * `drag` is one of the kinds no panel may refuse
 * (`content/src/control-sets-keys.ts`), so this is the only place that can say
 * whose gesture it is. The navigator holds both colours and the core's own
 * colour is the one thing she can read off it; the ring is his.
 */

/** No ring under the hand: every one of them is off the boss already. */
export const NO_RING = -1;

/**
 * **Which ring the hand has hold of: the outermost one still standing.**
 *
 * The design gives the pilot the outer ring and stops there, which would make
 * him a spectator for two thirds of a fight whose health *is* the rings. So
 * the hand moves inward as they come off, and the fight gets better rather
 * than thinner: once the outer ring is gone he is turning the middle one,
 * which is drawn true on his screen and a solid grey arc on hers — and at the
 * end he is turning the inner one, which he cannot see at all, on her word
 * alone. That is this boss's own sentence played on a control rather than on a
 * readout.
 */
export function orreryHandRing(b: OrreryState): number {
  return b.broken >= ORRERY_RINGS ? NO_RING : b.broken;
}

/**
 * How far a bearing advances in one tick for a hand that is **not a hand**:
 * the desk keyboard, `bun run frames`'s press line, and a rehearsal's ghost
 * thumb.
 *
 * None of the three can go round a circle, so the rig turns for them — at
 * **one organ a beat**, which is the ring's own drift and is the honest
 * stand-in for exactly the reason the crank's is (`windPerTickMilli`): the
 * outer ring comes round in eight beats and has eight organs on it, so a key
 * held down is worth precisely the cadence the picture is already going at.
 * What that buys a reader is the one comparison the fight is about — the same
 * key held on the *middle* ring, which runs the other way (`orreryDir`), holds
 * a gap still, and the rig shows that without a number being chosen for it.
 *
 * Read off the two numbers that already say it rather than a constant of its
 * own, so a change to the gearing or to the tempo reaches all three rigs in
 * the same edit (`packages/sim/test/copies-table.ts` carries a row against the
 * second copy).
 */
export function orreryTurnPerTickMilli(cfg: SimConfig): number {
  return Math.max(1, Math.round(cfg.orreryHandMilliPerOrgan / ticksPerBeat(cfg)));
}

/** Whether a hand is on it at all, which is what the picture asks. */
export function orreryHandHolds(b: OrreryState): boolean {
  return b.handAtMilli !== NO_BEARING && orreryHandRing(b) !== NO_RING;
}

/**
 * How far the ring is wound against its next detent, in thousandths of a
 * turn, signed the way the slots run — nought when it is sitting square.
 *
 * For the picture, and with one thing it may not be used for: see the header.
 * Drawing this as rotation would put the gap somewhere the rules say it is
 * not.
 */
export function orreryWoundMilli(b: OrreryState): number {
  return b.windMilli;
}

/**
 * One message from the hand on the ring.
 *
 * Read on the tick, from `step`, with the other six hands and for their
 * reason: what turns the ring is the step from one bearing to the next, and a
 * turn answered on the beat would come round in seventy-five-tick lurches
 * under a thumb that is going smoothly.
 */
export function orreryRingHeard(world: World, player: 1 | 2, command: Command): void {
  if (player !== 1 || command.kind !== "drag" || command.target !== "orreryRing") return;
  const b = orreryBoss(world);
  if (b === null) return;
  // The hand off the ring, or a hand that has just gone on: either way there
  // is no reference yet, and a grab that pretended to be at the top of the
  // circle would turn the ring by up to half a turn the finger never made.
  if (!command.on || command.fromMilli < 0) {
    b.handAtMilli = NO_BEARING;
    return;
  }
  const at = ((command.fromMilli % TURN) + TURN) % TURN;
  const was = b.handAtMilli;
  b.handAtMilli = at;
  if (was === NO_BEARING) return;
  const ring = orreryHandRing(b);
  // A ring that came off under the hand takes the gesture with it. The bearing
  // above is still recorded, so the hand that is still down does not turn the
  // next ring by wherever it happened to be when the last one broke.
  if (ring === NO_RING) return;
  const step = (at - was + TURN) % TURN;
  if (step === 0) return;
  wind(world, b, ring, step <= MAX_BEARING_STEP ? step : step - TURN);
}

/**
 * Thumb travel banked, and whole organs paid out of it.
 *
 * **Integers throughout**, so two devices handed the same bearings on the same
 * ticks cannot round the ring apart: thousandths of a turn in, a count of
 * organs and a thousandths remainder out, and `Math.trunc` rather than a floor
 * so turning back out of a bank costs exactly what turning into it bought.
 *
 * A clockwise thumb always adds to the slot number, on every ring, whichever
 * way that ring drifts. So on the outer it hurries the gap along and on the
 * middle — which runs anticlockwise (`orreryDir`) — it fights the drift, and
 * *which of those a turn is* becomes a thing the pair has to know and say. One
 * fixed sense rather than one per ring, because the alternative is a thumb
 * that turns a ring backwards on screen.
 */
function wind(world: World, b: OrreryState, ring: number, turnMilli: number): void {
  const per = Math.max(1, world.cfg.orreryHandMilliPerOrgan);
  const bank = b.windMilli + turnMilli;
  const organs = Math.trunc(bank / per);
  b.windMilli = bank - organs * per;
  if (organs === 0) return;
  const orbit = orreryOrbit(world.cfg, ring);
  if (orbit <= 0) return;
  const at = ((b.from[ring] ?? 0) + organs) % orbit;
  b.from[ring] = at < 0 ? at + orbit : at;
}
