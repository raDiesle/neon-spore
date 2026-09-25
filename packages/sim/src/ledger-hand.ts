import { midCol } from "./config.js";
import { type LedgerState, ledgerBoss, ledgerPlugs } from "./ledger.js";
import { tearCord } from "./ledger-bead.js";
import { ledgerFootable, ledgerHaulable, ledgerPullable } from "./ledger-gates.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE LEDGER's four hands on its own cord**, off the wire, on the tick.
 *
 * The fight shipped answered entirely from the panel: a bolt up the seam's
 * column in the colour it is showing, the plate carried to a socket, and the
 * trigger on the beat a return lands. One sentence, said eleven times with a
 * different number in it — which is the shape the §6.2 ask names and asks
 * every shipped boss to leave behind (`.claude/skills/new-boss`).
 *
 * What it had instead of a handle was the thing that decided where every
 * handle here had to go: **half of one drawn object is hidden from each seat.**
 * The pilot is shown the returns coming down the cord and how many beats are
 * left of them; the navigator is shown the socket they land in and the column
 * it walks to next, and neither is shown the other's half (`ledger-read.ts`).
 * So a thumb may only be put on the part of the cord its own seat can see,
 * and *whose* hand each movement wants was answered before it was asked.
 *
 * One per movement, and each is that movement's own problem:
 *
 * - `ledgerFoot` — **the navigator's, while the cord is `rooting`.** Two beats
 *   in which nothing can be hit and nothing can be answered, and the fight's
 *   whole geometry is decided in them: where the cord goes in is where the
 *   walk starts, and a root against a wall walks one way for the rest of the
 *   fight while a root in the middle turns. Her thumb carries the foot along
 *   the plating before it seats, `fromMilli` from the column she grabbed it
 *   in. It is hers because the socket is hers to see, and it is the only
 *   gesture in the fight made before the first bill.
 * - `ledgerSocket` — **the navigator's, from `paying` and through `whipping`.**
 *   Her thumb in the socket plugs it, and a return landing on a plugged socket
 *   is **rolled over**: refused, put back on the cord a cadence later, nothing
 *   warded and nothing whipped, with the root sliding under it as it always
 *   does. It is the one answer this fight had none of — a column she cannot
 *   reach in time was a lost wave and nothing else — and it is rationed rather
 *   than timed: `ledgerPlugBeats` for the whole encounter, counted on the beat
 *   (`ledger-step.ts`). A rolled bill is a bill still owed, on a cadence that
 *   is one beat shorter by then.
 * - `ledgerBead` — **the pilot's, while the cord is `whipping`.** From there a
 *   warded return is thrown back up into the seam for free, so the cord itself
 *   is the weapon and the returns are the ammunition: his thumb on the soonest
 *   bead hauls it **one beat down**, once, so a pair that has the plate where
 *   it is going can run the cord faster than the boss meters it out. It is his
 *   because the beads are his to see, and it is refused where it would put two
 *   returns on one beat — the root slides between them, so the second would
 *   land in a column the plate has just left.
 * - `ledgerCord` — **the pilot's, on the `taut` cord.** The last return is the
 *   one the pair must not answer, and the fight held open until they worked
 *   that out by doing nothing. Now it can be finished by hand: his carry hauls
 *   the cord `ledgerHaulMilli` and tears it out of the plating — **but only
 *   while the plate is out of the socket's column**, so the gesture is the same
 *   letting-go said with a hand instead of with a wait, and both seats have to
 *   do it. He cannot see the column he is being refused for. She can.
 *
 * **A seat's thumb on the other's handle is dropped without a sound**, as it is
 * on THE FLEET's chart and THE TASTER's fan. On the tick rather than the beat
 * (`step.ts`): the foot is where the thumb is now, a plug is in when it lands,
 * and the tick the cord comes out is the tick the wave is over.
 *
 * **What each of them is offering is next door** (`ledger-gates.ts`), because
 * the four rings drawn on them have to ask the same four questions and a gate
 * written out twice is a handle that outlives the rule behind it.
 */

/** All four hands at rest, for the cord's own install — their fields, in their file. */
export function ledgerHandsFresh(
  plugBeats: number,
): Pick<LedgerState, "foot" | "plug" | "plugBeats" | "rolled" | "haulMilli"> {
  return { foot: -1, plug: false, plugBeats, rolled: 0, haulMilli: 0 };
}

export function ledgerHandsHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag") return;
  const t = ledgerBoss(world);
  if (t === null || t.outBeat >= 0) return;
  if (command.target === "ledgerFoot" && player === 2) {
    foot(world, t, command.on, command.fromMilli);
  } else if (command.target === "ledgerSocket" && player === 2) {
    plug(world, t, command.on);
  } else if (command.target === "ledgerBead" && player === 1) {
    pull(world, t, command.on);
  } else if (command.target === "ledgerCord" && player === 1) {
    haul(world, t, command.on, command.fromYMilli ?? 0);
  }
}

/**
 * **The foot.** Only while the cord is `rooting`, because a cord that is in
 * cannot be walked and a fight whose socket could be dragged would have no
 * sentence left to say.
 *
 * The carry is a displacement and the column it means is read against the
 * socket she **grabbed** it in, not the one it is in now: a thumb that has
 * come a tile and a half to the right says the same thing on every move after
 * it, so a move coalesced away heals itself on the next one (`command-types.ts`).
 * The walk is re-aimed each time it lands — toward the far wall from wherever
 * the foot is standing — so the first return is never asked for off the field.
 */
function foot(world: World, t: LedgerState, on: boolean, fromMilli: number): void {
  const cfg = world.cfg;
  if (!on) {
    t.foot = -1;
    return;
  }
  if (!ledgerFootable(t, cfg, world.beat)) return;
  if (t.foot < 0) t.foot = t.socket;
  const col = Math.max(0, Math.min(cfg.cols - 1, t.foot + Math.round(fromMilli / 1000)));
  if (col === t.socket) return;
  t.socket = col;
  t.walk = col <= midCol(cfg) ? 1 : -1;
  world.events.push({ type: "ledgerFoot", col });
}

/**
 * **The plug.** In and out with the thumb, and what it costs is counted on the
 * beat rather than here (`stepLedgerHands`): a hand that landed and lifted
 * between two beats has rolled nothing over and is charged nothing for it,
 * which is the same bargain `throatTube`'s cinch strikes — the gesture is
 * *held*, and a fight is a thing you pay for by the beat.
 *
 * A thumb put in a socket the fight will not let her plug is dropped without a
 * sound: there is nothing to refuse until something lands on it.
 */
function plug(world: World, t: LedgerState, on: boolean): void {
  if (!on) {
    t.plug = false;
    return;
  }
  if (t.plug || !ledgerPlugs(t, world.cfg, world.beat)) return;
  t.plug = true;
  world.events.push({ type: "ledgerPlug", col: t.socket, beats: t.plugBeats });
}

/**
 * **The pull.** The soonest return and no other, because that is the one his
 * thumb is on: several may be on the cord at once in `whipping` and they are
 * drawn in the order they land, so the lowest bead is the next bill and the
 * one the pair is talking about. Naming *which* would be a second, weaker way
 * of saying the thing the picture already says (`mazeString`'s missing `id`).
 *
 * Once per return — `pulled` is what says the rest of this grab is a thumb
 * resting on a cord. Being the soonest is also why it never lands on a beat
 * another return holds: the root slides between two landings, so a beat with
 * two bills on it would be a column the plate has just been walked out of, and
 * a haul onto a beat earlier than every other bead cannot make one
 * (`ledger-step.ts`, `landing`).
 */
function pull(world: World, t: LedgerState, on: boolean): void {
  if (!on) return;
  const b = ledgerPullable(t, world.cfg, world.beat);
  if (b === null) return;
  b.beat -= 1;
  b.pulled = true;
  world.events.push({ type: "ledgerPull", col: t.socket, beats: b.beat - world.beat });
}

/**
 * **The haul.** Only on a `taut` cord, and only with the plate somewhere else:
 * the movement is *let it through*, and a hand that could tear the cord out
 * while the socket was still covered would be the pair answering the last
 * return after all, with a gesture instead of a trigger.
 *
 * `fromYMilli` is how far **down** the thumb has come from where it grabbed,
 * cut to `ledgerHaulMilli`, and a carry upward is no carry — THE TASTER's
 * interlock, read the same way. It is reset to nought on a
 * tick the plate is in the column, so a thumb held on the cord through her
 * walking back into the socket has to start again when she leaves it.
 */
function haul(world: World, t: LedgerState, on: boolean, fromYMilli: number): void {
  const cfg = world.cfg;
  if (!on) {
    t.haulMilli = 0;
    return;
  }
  if (!ledgerHaulable(t, cfg, world.beat)) return;
  if (world.shieldCol === t.socket) {
    t.haulMilli = 0;
    return;
  }
  t.haulMilli = Math.max(0, Math.min(cfg.ledgerHaulMilli, Math.round(fromYMilli)));
  if (t.haulMilli < cfg.ledgerHaulMilli) return;
  world.events.push({ type: "ledgerHaul", col: t.socket });
  // The same tear the fifth return makes, out of the file that owns it: a
  // cord pulled out by hand and a cord pulled out by a bill leave the ship in
  // exactly the same state, and a second copy of that would be the one place
  // the two endings could drift apart (`ledger-bead.ts`).
  tearCord(world, t);
}
