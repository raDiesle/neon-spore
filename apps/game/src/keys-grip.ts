import type { Command, Creature, SimConfig } from "@neon-spore/sim";
import { NO_GRIP, nearestHull } from "@neon-spore/sim";

/**
 * **What the desk rig's grip key takes hold of, and what it does with it.**
 *
 * Cut out of `keys.ts` when a key too many took that file over its 250-line
 * limit, along the seam `keys-round.ts` and `keys-guide.ts` already cut: next
 * door is the *rig* — which key sends which command, and the repeat clock the
 * held ones run on — and this is the one question any of those keys has to
 * answer about the world in front of it. A phone never asks it: there, the
 * grip is a finger on a body and the body is whichever one is under it.
 *
 * Which body a hand may take is `sim/grip.ts`'s `nearestHull`, asked and not
 * answered here — the director's stage keyboard asks the same question, and
 * for a day the two rigs each had a copy of the answer.
 */

/**
 * One press, and whose hand it is.
 *
 * The rig used to send a whole gesture as one player, because it only ever had
 * one gesture: `G` is player 2's hand. THE WARDEN's rope is player 1's and
 * only player 1's (`sim/warden-rope.ts` — player 2's panel carries both
 * colours, so a fight either seat could pull would be a fight one phone could
 * play), so the seat is now part of what this file returns rather than
 * something the call site knows.
 */
export interface DeskPress {
  player: 1 | 2;
  command: Command;
}

/**
 * **The desk rig's whole hand: the hold, the carry and the release.**
 *
 * A phone sends THE PUSH as a finger sliding across the field, so the distance
 * it reports is measured and the id is whatever was under the thumb. A desk has
 * neither. What it has is `G` for the hold and two keys beside it for the
 * carry, which means this file has to *keep* the two things a pointer carries
 * on its own — which body was taken, and how far the hand has come from where
 * it grabbed.
 *
 * The distance is the part a key cannot fake per press: a `drag` is cumulative
 * from the grab and never an increment (`sim/command-types.ts`), so a press
 * adds `cfg.gripPushMilli` to a running total and sends the total. The count
 * of columns already spent stays where it belongs, on the simulation's own
 * `GripPush.cols`, and nothing here re-derives it.
 *
 * **THE WARDEN's rope is the same three keys and a different gesture.** A
 * tether refuses a hand — it is in `UNGRIPPABLE`, and has been since the rope
 * stopped being *held* and started being *dragged* by a handle — so a `grip`
 * naming one is thrown away and `G` did nothing whatever on the one wave it
 * was written for. What the rope takes is the drag a pointer sends, which a
 * key can synthesise the same way it synthesises THE PUSH's: a running total,
 * a `gripPushMilli` a press.
 */
export interface DeskGrip {
  /** `G` down. A rope on the field is taken in preference to anything else;
   * otherwise the nearest body this seat can hold, and the carry starts from
   * nought either way. */
  take(creatures: readonly Creature[], player: 1 | 2): DeskPress[];
  /** One press of a carry key: one `gripPushMilli` further from the grab, or
   * one further down the rope. */
  carry(dir: -1 | 1): DeskPress[];
  /** `G` up. The hold ends, the rope goes slack, and the distance is forgotten
   * with both. */
  release(): DeskPress[];
}

export function deskGrip(cfg: SimConfig): DeskGrip {
  let held = NO_GRIP;
  /** Which seat asked for the hold, so the carry and the release are its hand
   * and not whichever one the call site last had in mind. */
  let seat: 1 | 2 = 2;
  let milli = 0;
  let pulling = false;
  let pullYMilli = 0;

  /** The rope, said the way a thumb says it. `fromMilli` and `fromYMilli` are
   * a displacement from the grab and this rig grabs at nought, so the total is
   * the whole of the message (`sim/warden-rope.ts`). */
  const rope = (on: boolean, y: number): Command => ({
    kind: "drag",
    target: "wardenTether",
    on,
    fromMilli: 0,
    fromYMilli: y,
  });

  return {
    take(creatures, player) {
      // THE WARDEN's rope wins outright whatever else is falling, because it
      // is the only thing on the field a hand is the *only* answer to: a rock
      // a hand misses is still a rock the shield can meet, and a line nobody
      // pulls costs the hull and the plate both.
      if (creatures.some((c) => c.kind === "tether")) {
        pulling = true;
        pullYMilli = 0;
        held = NO_GRIP;
        milli = 0;
        return [{ player: 1, command: rope(true, 0) }];
      }
      held = nearestHull(creatures, player);
      seat = player;
      milli = 0;
      return held === NO_GRIP ? [] : [{ player, command: { kind: "grip", id: held } }];
    },
    carry(dir) {
      // The rope is carried **down**, and never back above where the hand took
      // it. A pull is cut to length and then kept on the field
      // (`sim/handle-pull.ts`), and down is the one direction the field always
      // has room for from where a rope hangs — the same choice a film makes
      // for the same reason (`content/src/scene-script.ts`). So one key is a
      // step further and the other lets a step of it back.
      if (pulling) {
        pullYMilli = Math.max(0, pullYMilli + dir * cfg.gripPushMilli);
        return [{ player: 1, command: rope(true, pullYMilli) }];
      }
      // Nothing in hand is nothing to carry. Sending a drag naming `NO_GRIP`
      // would be dropped by `gripPushHeard` anyway, and it would clear a
      // carry the *other* seat's hand had earned on its way past.
      if (held === NO_GRIP) return [];
      milli += dir * cfg.gripPushMilli;
      return [
        {
          player: seat,
          command: { kind: "drag", target: "gripBody", on: true, fromMilli: milli, id: held },
        },
      ];
    },
    release() {
      const out: DeskPress[] = [];
      // A hand lifting off the rope lets the tension go and the gate shuts
      // with it, which is a thing the simulation is told rather than a thing
      // it notices (`sim/warden-rope.ts`).
      if (pulling) out.push({ player: 1, command: rope(false, pullYMilli) });
      pulling = false;
      pullYMilli = 0;
      held = NO_GRIP;
      milli = 0;
      // And the grip release unconditionally, the way the keyup next door has
      // always sent it: a release for a grip that never took is a no-op in the
      // simulation, and one skipped because `nearestHull` found nothing on the
      // *down* would leave a hand on a body that arrived in between.
      out.push({ player: seat, command: { kind: "grip", id: NO_GRIP } });
      return out;
    },
  };
}
