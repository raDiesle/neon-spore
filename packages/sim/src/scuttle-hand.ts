import {
  type ScuttleState,
  scuttleBoss,
  scuttlePartCol,
  scuttleSwingable,
  scuttleSwingCol,
} from "./scuttle.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * **The pilot's thumb on a part THE SCUTTLE already let go of**, off the
 * wire, on the tick.
 *
 * The frame shipped with no handle at all, and the reason was good: it is a
 * fixture and not a body, nothing of it is among the creatures, and
 * `grippable.ts` refuses a hand on a boss. The hole in that is the same one
 * THE LEAD's still is — the one moment a part of the boss is **not** the
 * boss. A hanging part has left its socket and has not landed; for the
 * length of a cadence it is a thing on a thread, and a thing on a thread is
 * something a hand can move.
 *
 * What it buys is **a place**, where every other handle in this game buys
 * time. The part is thrown down the column the pilot put it in rather than
 * its socket's, one column, once a cycle — so a rock due over the shield
 * can be walked off it, and a body due away from the cannon can be walked
 * onto it. That is the whole rule, and it is one sentence in any language:
 * *carry a hanging part one column*.
 *
 * **The pilot's seat, and only his.** He is the one shown every socket and
 * every hanging part, uncoloured and unlocked (`showsScuttleCount`), so a
 * thumb of his on a part tells him nothing about which part is live and the
 * gesture leaks none of the navigator's half. Hers is the colour and the
 * lock; a hand of hers on the frame would be her steering the column her own
 * readout names, which is the fight answering itself. Her press is dropped
 * without a sound, as `queenMark` drops the other seat's.
 *
 * **What it costs is the thumb.** It is off the cannon and the shield while
 * it is on the frame, and this boss throws a part down a column every
 * cadence — so a pilot who reaches up is a pilot not standing anywhere, and
 * the swing is paid for on the beat it is spent, not later.
 *
 * On the tick for `taster-hand.ts`' reason: the carry is where the thumb is
 * now, and a swing answered on the next beat could be answered after the
 * throw it was meant to move. The bar is `scuttleSwingMilli`, cumulative
 * from the grab, so a move the wire coalesced away still arrives
 * (`docs/spec/latency.md`).
 */

/** The pilot's thumb on or off a hanging part, and the one carry it may make. */
export function scuttleHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag" || command.target !== "scuttlePart") return;
  if (player !== 1) return;
  const s = scuttleBoss(world);
  if (s === null) return;
  const socket = command.id ?? -1;
  if (!command.on) {
    // Lifting off a part he is no longer on says nothing: his thumb moved to
    // another one and this is the old one letting go behind it.
    if (s.held === socket) s.held = -1;
    return;
  }
  if (!s.loose.includes(socket) || s.parts[socket] === null) return;
  s.held = socket;
  if (!scuttleSwingable(s)) return;
  swing(world, s, socket, command.fromMilli);
}

/**
 * The carry itself: one column, in the direction the thumb went, and never
 * off the frame.
 *
 * A carry that would take the part off the end of the frame is **not spent**
 * — `scuttleSwingCol` gives back the column it is already in, nothing moves,
 * and the pilot may still carry it the other way. The alternative is a thumb
 * that shoved the wrong way losing the cycle's only swing to a column that
 * never existed, which reads as the game not answering rather than as a
 * choice made badly.
 */
function swing(world: World, s: ScuttleState, socket: number, fromMilli: number): void {
  const cfg = world.cfg;
  if (Math.abs(fromMilli) < cfg.scuttleSwingMilli) return;
  const from = scuttlePartCol(s, cfg, socket);
  const col = scuttleSwingCol(s, cfg, socket, fromMilli > 0 ? 1 : -1);
  if (col === from) return;
  s.swung = socket;
  s.swungCol = col;
  world.events.push({ type: "scuttleSwing", col, socket, from });
}
