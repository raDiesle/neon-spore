import { gripsCreature } from "./grip.js";
import { bulletMilli, creatureLane, creatureMilli } from "./mid-beat.js";
import { type Bullet, type Creature, isMeteorKind, spanOf } from "./types.js";
import { MILLI, type World } from "./world.js";

/**
 * THE LOCK: the hand player 1 already has on the field, read a second way.
 *
 * A finger held on a body slows it — that is THE GRIP and nothing here changes
 * it (`grip.ts`). What this adds is the other half of the same gesture: while
 * **player 1's** hand is on a body, every shot the cannon puts out steers into
 * it, from whatever column it left the muzzle in, and lands. Take the hand off
 * and the shot in the air goes straight up from wherever it had got to, dumb
 * again.
 *
 * **It is player 1's hand and not either seat's**, because player 1 is the
 * seat holding the cannon. The gesture then costs exactly what it is worth: a
 * thumb on the field is a thumb off the strip below it, so a pilot who has
 * locked a body cannot move the cannon while they hold it — the shot goes
 * where the hand is instead of where the muzzle is, which is the trade rather
 * than a bonus. Player 2's hand stays a brake and nothing else.
 *
 * **It removes the column from the conversation and leaves the colour.** The
 * pair still has to agree on red or cyan, because player 2 holds both lobes
 * and the lock says nothing about what a shot is loaded with — a locked bolt
 * of the wrong colour arrives and bounces exactly as it always did. So the
 * sentence changes from *"third from the left, cyan"* to *"cyan"*, which is
 * the whole of what this is for.
 *
 * **It is not a gate on the panel** and needs none. A grip only exists where
 * there is a field to put a finger on, so the lock is live in every ordinary
 * wave and absent from every round that takes the picture away — THE GAUGE,
 * SNAKE, PINBALL and THE FLEET have no creatures for a hand to land on and
 * never reach this file.
 */

/**
 * The body player 1 has locked, or undefined.
 *
 * Two kinds are held and not locked, and both refusals are the same sentence —
 * *a mark that promises a hit must not be drawn over something a shot cannot
 * answer*:
 *
 * - **A rock.** It cannot be shot, and holding rocks is what the grip was
 *   built for (docs/spec/assists.md 6.4). A lock on one would turn the pilot's
 *   own assist into a wall that eats every bolt the pair fires for as long as
 *   the hand stays, which is the exact opposite of the gesture's point.
 * - **A ghost.** Its column is the secret and player 1 is the seat kept from
 *   it (`ghost.ts`), so a shot that found one without being told which lane it
 *   was in would be the whole creature undone. A crossing ghost cannot be
 *   gripped at all; a falling one can, and is drawn to player 1 as a band
 *   across a row with nothing in it about the column — which is exactly the
 *   body a lock must not answer.
 */
export function lockedBody(world: World): Creature | undefined {
  // Asked of each body rather than read off `world.gripP1`: which of the two
  // fields is player 1's is `grip.ts`'s business and nothing else's, and a
  // second reader of that field is exactly the copy `gripsCreature` exists to
  // stop (`copies-table.ts`).
  const c = world.creatures.find((x) => gripsCreature(world, 1, x.id));
  if (!c || isMeteorKind(c.kind) || c.kind === "ghost") return undefined;
  return c;
}

/**
 * Whether this body is the locked one. render/ asks it per creature, so it is
 * a call rather than a comparison against `lockedBody`'s id at three draw
 * sites — the same reason `gripsCreature` exists next door.
 */
export function isLockedOn(world: World, id: number): boolean {
  return lockedBody(world)?.id === id;
}

/**
 * One tick of steering, before the shot travels.
 *
 * **The rule is a proportion and there is no speed in it.** The shot moves
 * across by the same share of what is left sideways as this tick's climb is of
 * what is left upwards — so it arrives exactly, whatever the two distances
 * were, and the last tick before contact closes whatever remains. A cap on how
 * fast it may slide would be a number that decides, for some pairs of
 * distances, that the frame drawn round the body was lying; there is nothing
 * to tune here and so nothing tunable.
 *
 * The consequences are honest rather than hidden. A body nearly level with the
 * muzzle and far to one side is answered by a bolt that whips almost sideways,
 * because that is what reaching it means. A body **below** the shot cannot be
 * reached at all — a shot only goes up — so it stops steering and finishes its
 * climb straight, which is also what a shot fired before the hand went down
 * does for the part of its flight that is already past.
 *
 * And a locked shot passes through nothing: it sweeps its column like any
 * other bolt, so a body that wanders into the diagonal is met first and stops
 * it. The lock aims the shot; it does not excuse it from the field.
 */
export function steerShot(world: World, b: Bullet, stepMilli: number): void {
  const target = lockedBody(world);
  if (!target) {
    b.aimMilli = 0;
    return;
  }
  // How far the body is above the shot right now. Zero or less is a body the
  // climb has already passed, and there is nothing to steer towards.
  const gap = bulletMilli(b) - creatureMilli(world, target);
  if (gap <= 0) {
    b.aimMilli = 0;
    return;
  }
  const x = b.col * MILLI + b.driftMilli;
  // The nearest lane the body actually occupies, which for everything but a
  // wide one is simply the lane it is in. A shot already inside the span is
  // already where it needs to be sideways — a two-column body is answered in
  // whichever of its two columns the bolt is nearest, not dragged to a centre
  // that is half a tile from either.
  const lane = creatureLane(world, target);
  const aimAt = Math.max(lane * MILLI, Math.min((lane + spanOf(target) - 1) * MILLI, x));
  const left = aimAt - x;
  const move = gap <= stepMilli ? left : Math.round((left * stepMilli) / gap);
  const to = x + move;
  // Half a tile either way and then the column itself changes. That is what
  // keeps `Bullet.col` the lane the shot is *nearest*, and so the lane the hit
  // test may go on asking about with no idea any of this happened.
  b.col = Math.floor((to + MILLI / 2) / MILLI);
  b.driftMilli = to - b.col * MILLI;
  // Which way it is going, in thousandths of a column per tile climbed. It is
  // stored rather than recomputed because the only thing that reads it is the
  // tail render/ draws behind the head, and a tail drawn straight down under a
  // shot crossing the field at its own speed points at nowhere the shot has
  // been. A shot that is not steering carries a zero and is drawn as it always
  // was.
  b.aimMilli = stepMilli === 0 ? 0 : Math.round((move * MILLI) / stepMilli);
}
