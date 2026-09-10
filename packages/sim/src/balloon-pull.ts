import type { SimConfig } from "./config.js";
import type { Command, Creature } from "./types.js";
import type { World } from "./world.js";

/**
 * **The two hands on THE BALLOON**, which is the half of that creature nothing
 * else in this game has: one gesture that two people make at the same instant.
 *
 * Split out of `balloon.ts` at the seam that file names, the one `choir.ts`
 * and `choir-gesture.ts` already cut. Next door is what the *body* is — where
 * it appears, how it climbs, what it costs at the top — and that half is
 * finished. This is what the *hands* do, and it is the half with the coupling
 * in it. What the body does once both hands have reached it — the hold, the
 * split, the pop — is `balloon-rub.ts`, cut off this file when the hold took
 * it past its length.
 *
 * **A side per seat, fixed, and never negotiated.** The pilot has the handle
 * on a balloon's left and carries it left; the navigator has the one on its
 * right and carries it right. Two seats could have been offered either handle,
 * and it would have cost the pair the one sentence this creature exists for:
 * with the sides settled in advance, the only thing left to say out loud is
 * **which balloon**, which is exactly the question a field of several rising
 * bodies cannot answer for them.
 *
 * **One balloon per hand.** A grab on a second lets the first one go, stated
 * here rather than left to the lift for `lidHeard`'s reason: a `drag` on the
 * way in is the only message that arrives when a finger moves from one handle
 * to another without ever leaving the glass.
 *
 * **The pulls live on the body and not on the world**, which is the opposite
 * of THE CHOIR's arm and is the creature rather than an inconsistency. A shake
 * has no column to be in, so it belongs to a seat; a hand on a balloon is on
 * *that balloon*, both screens draw the skin stretching towards whichever
 * sides are being held, and that stretch is each player's only readout of a
 * thumb they cannot see.
 */

/** How far one seat has carried this balloon's handle, in thousandths of a
 * tile and signed the way the field is. Nought for a hand that is not on it. */
export function balloonPull(c: Creature, player: 1 | 2): number {
  return (player === 1 ? c.balloonPullP1 : c.balloonPullP2) ?? 0;
}

/** Whether that seat has a hand on this balloon at all. Absent is the whole of
 * "no hand": a grab reports zero, so a balloon held at rest still has a field
 * and one nobody has hold of has none. */
export function balloonHeld(c: Creature, player: 1 | 2): boolean {
  return (player === 1 ? c.balloonPullP1 : c.balloonPullP2) !== undefined;
}

/**
 * Whether one side is pulled taut — **the raw distance against the raw
 * threshold**, never the readout below.
 *
 * `balloonTension` rounds, so a hand a thousandth of a tile short would read
 * as a full thousand and a rub the pair had not earned would land;
 * `lidIsOpen` is on the same arrangement for the same reason. The rounding
 * belongs to the picture and must never decide the moment.
 *
 * The sign is the side: the pilot's handle counts only when it has gone
 * **left** and the navigator's only when it has gone **right**, so a pair
 * pushing a balloon inward from both sides is a pair squeezing it rather than
 * stretching it, and nothing gives.
 */
export function balloonSideTaut(cfg: SimConfig, c: Creature, player: 1 | 2): boolean {
  const pull = balloonPull(c, player);
  return player === 1 ? pull <= -cfg.balloonTautMilli : pull >= cfg.balloonTautMilli;
}

/**
 * How taut one side is, 0..1000 — and so how far the skin has given on it,
 * because they are the same number drawn twice. A pull the wrong way reads as
 * nought: the picture must say *this side is not doing anything*, which is
 * what the rule above says too.
 */
export function balloonTension(cfg: SimConfig, c: Creature, player: 1 | 2): number {
  const full = Math.max(1, cfg.balloonTautMilli);
  const pull = balloonPull(c, player) * (player === 1 ? -1 : 1);
  return Math.max(0, Math.min(1000, Math.round((pull * 1000) / full)));
}

/** Whether both hands are on this one at once, which is the whole of the
 * gesture. Called by the rule and by the picture, so a body drawn about to
 * give is a body that is. */
export function balloonIsRubbed(cfg: SimConfig, c: Creature): boolean {
  return c.kind === "balloon" && balloonSideTaut(cfg, c, 1) && balloonSideTaut(cfg, c, 2);
}

/**
 * One seat's hand on one of the two handles, off the wire.
 *
 * Which target belongs to which seat is checked here rather than at the hit
 * test, for `choirPulled`'s reason: a device that decided for itself whose
 * gesture a message was would be a device the other one cannot check.
 *
 * `fromMilli` is how far the hand has come from where it grabbed, in
 * thousandths of a tile, resolved on the device whose finger it is
 * (`touchDown`, `packages/render/src/touch.ts`) — so a grab reports zero and
 * there is no origin to keep. It is cut to taut here so the stretch the other
 * seat reads can never run past the moment the skin gives.
 */
export function balloonHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag") return;
  const side = command.target === "balloonLeft" ? 1 : command.target === "balloonRight" ? 2 : null;
  if (side === null || side !== player) return;
  if (!command.on) {
    releaseBalloons(world, player);
    return;
  }
  const held = world.creatures.find((c) => c.id === command.id && c.kind === "balloon");
  if (held === undefined) {
    // A handle whose body has gone — rubbed away, or burst at the top — with a
    // finger still pressed against the glass. Nothing to hold, and the hand is
    // not on anything else either.
    releaseBalloons(world, player);
    return;
  }
  releaseBalloons(world, player);
  const taut = world.cfg.balloonTautMilli;
  const cut = Math.max(-taut, Math.min(taut, Math.round(command.fromMilli)));
  if (player === 1) held.balloonPullP1 = cut;
  else held.balloonPullP2 = cut;
}

/** Every handle this seat is holding, let go of — however it happened. */
export function releaseBalloons(world: World, player: 1 | 2): void {
  for (const c of world.creatures) {
    if (c.kind !== "balloon") continue;
    if (player === 1) c.balloonPullP1 = undefined;
    else c.balloonPullP2 = undefined;
  }
}
