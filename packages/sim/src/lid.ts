import { metColor, missedColor } from "./balance.js";
import type { SimConfig } from "./config.js";
import { removeCreature } from "./field.js";
import type { Bullet, Command, Creature } from "./types.js";
import type { World } from "./world.js";

/**
 * THE LID: an armoured eye, and the first body on the field that a hand has to
 * hold **open** while the other seat shoots into it.
 *
 * Two plates meet down the middle of the eye and a cord hangs off the bottom of
 * it. Player 1 takes the cord and pulls it aside; the plates part from the
 * middle outwards, by degrees, in proportion to the tension — and only at full
 * tension is the lens bare. Player 2 fires the lens's own colour up its column.
 * A hand that lifts lets the plates close again, so the opening lasts exactly
 * as long as somebody is holding it.
 *
 * **It is THE CLASP's coupling made continuous, and that is the creature.** A
 * clasp is opened by a *moment* — the ward lands, the shield is off, and the
 * body underneath can be shot whenever the pair get round to it. A lid is
 * opened by a *hold*: the two halves have to happen at the same instant, in
 * two different hands, and neither seat can do the other's. So what the pair
 * has to say is not an order but a count — *now* — and the seat holding the
 * cord has their thumb somewhere other than the cannon strip while they say it.
 *
 * Nothing about it is hidden from either screen, and that is deliberate rather
 * than an omission: THE VEIL already owns the split where one seat can see a
 * colour and the other cannot, and a second copy of that would teach the pair
 * to look for something withheld instead of to synchronise. The colour is
 * authored on the arrival and shines out of the seam the whole way down, the
 * way a shell's does — what the armour buys is not surprise, it is *timing*.
 *
 * `render/lid.ts` draws the eye and its plates, `render/lid-string.ts` the cord
 * and its handle. Everything here is integers and the tick counter.
 */

/**
 * How far open a lid stands, 0..1000 — and so how far the plates have parted,
 * because they are the same number drawn twice.
 *
 * There is no easing anywhere between this and the picture. The gap between
 * the plates *is* player 2's readout of a hand they cannot see, and a readout
 * that lags the rule is a readout that lies at exactly the moment somebody is
 * deciding to fire. `wardenPullMilli` makes the same argument about a hatch.
 */
export function lidOpenMilli(cfg: SimConfig, c: Creature): number {
  const pull = c.lidPullMilli;
  if (pull === undefined) return 0;
  const full = Math.max(1, cfg.lidTautMilli);
  return Math.min(1000, Math.round((Math.abs(pull) * 1000) / full));
}

/**
 * Whether the lens is bare this instant — the only window a shot counts in.
 *
 * **The raw pull against the raw threshold, never the readout above.**
 * `lidOpenMilli` rounds, so a hand a thousandth of a tile short of taut reads
 * as a full thousand and a shot the pair had not earned would land;
 * `wardenEyeOpen` is on the same arrangement for the same reason. The rounding
 * belongs to the picture and must never decide a hit.
 */
export function lidIsOpen(cfg: SimConfig, c: Creature): boolean {
  const pull = c.lidPullMilli;
  return pull !== undefined && Math.abs(pull) >= cfg.lidTautMilli;
}

/** Whether a hand is on this lid's cord at all. Absent is the whole of "no
 * hand": a grab reports zero, so a lid being held from its resting position
 * still has a field, and one nobody has hold of has none. */
export function lidIsHeld(c: Creature): boolean {
  return c.lidPullMilli !== undefined;
}

/**
 * The hand on the cord, and the whole of the gesture.
 *
 * **Only player 1 may pull**, for the reason player 2 is the only one who
 * fires: player 2's panel carries both colours, so a lid either seat could open
 * would be a creature one phone could play. It is the rule THE WARDEN's rope
 * and THE MAZE's string are already on.
 *
 * **One cord at a time**, because it is one hand. A grab on a second lid lets
 * the first one shut — stated here rather than left to the lift, because a
 * `drag` on the way in is the only message that arrives when a finger moves
 * from one handle to another without ever leaving the glass.
 *
 * `fromMilli` is how far the hand has come from where it grabbed, in
 * thousandths of a tile, resolved on the device whose finger it is
 * (`touchDown`, `packages/render/src/touch.ts`) — so a grab reports zero and
 * there is no origin to keep. The **sign** is kept so the cord can be drawn
 * swinging the way the hand went; the **rule** takes its magnitude, because
 * plates on a spring do not care which way you lean.
 */
export function lidHeard(world: World, player: 1 | 2, command: Command): void {
  if (player !== 1 || command.kind !== "drag" || command.target !== "lidString") return;
  if (!command.on) {
    releaseLids(world);
    return;
  }
  const held = world.creatures.find((c) => c.id === command.id && c.kind === "lid");
  if (held === undefined) {
    // A cord whose body has gone — shot, or off the bottom of the field — with
    // a finger still pressed against the glass. Nothing to hold open, and the
    // hand is not on anything else either.
    releaseLids(world);
    return;
  }
  const was = lidIsOpen(world.cfg, held);
  const taut = world.cfg.lidTautMilli;
  for (const c of world.creatures) if (c !== held) c.lidPullMilli = undefined;
  held.lidPullMilli = Math.max(-taut, Math.min(taut, command.fromMilli));
  if (!was && lidIsOpen(world.cfg, held) && held.color !== null) {
    world.events.push({ type: "eyeOpen", col: held.col, color: held.color });
  }
}

/** Every cord let go of, however it happened. */
export function releaseLids(world: World): void {
  for (const c of world.creatures) if (c.kind === "lid") c.lidPullMilli = undefined;
}

/**
 * A shot met a lid.
 *
 * Three answers, and each is charged to the seat that could have prevented it.
 * Plates still across the lens is a *reject* and deliberately not a colour
 * miss — the ammunition may have been exactly right and the hand simply not
 * there yet, which is the pair's timing rather than player 2's choice, and
 * `claspStruck` and `resolveWarden` both make the same argument. The wrong
 * colour into a bare lens is a colour miss and nothing else: the lens has been
 * that colour, on both screens, since the body entered the field.
 *
 * The kill is worth what a veil and a ghost are worth, and for their reason
 * rather than by coincidence: all three are bodies the pair can only reach by
 * doing one thing together at one moment, and a pair that learned one of them
 * priced above the others would be learning that one kind of agreement is
 * worth more than another.
 */
export function lidStruck(world: World, b: Bullet, hit: Creature): void {
  if (!lidIsOpen(world.cfg, hit)) {
    world.events.push({ type: "reject", col: b.col, row: hit.row });
    return;
  }
  if (hit.color !== b.color) {
    missedColor(world);
    world.events.push({ type: "reject", col: b.col, row: hit.row });
    return;
  }
  metColor(world);
  world.score += world.cfg.scoreLidKill;
  world.events.push({ type: "destroy", col: hit.col, row: hit.row, color: hit.color });
  removeCreature(world, hit.id);
}
