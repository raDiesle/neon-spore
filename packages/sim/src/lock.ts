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
 * One tick of a locked shot's flight, before it travels: how far it climbs,
 * and any sideways it took instead.
 *
 * **The path is a corner, not a diagonal.** The bolt goes straight up its own
 * column until it is level with the body, turns, and runs straight across into
 * it. That is the owner's rule and it is about the *picture* rather than about
 * the arithmetic: a diagonal arrives at a body from underneath, which is
 * exactly where THE MAGNET's plate is, so a shot the pair had aimed round the
 * side of one still looked as though it had come up through the armour. A
 * corner cannot be misread — the leg that reaches the body is horizontal, and
 * a horizontal bolt has plainly come from one side or the other.
 *
 * **The turn is taken on the tick the climb would pass the body**, and the
 * rest of that tick's travel is spent sideways, so the bolt never overshoots
 * and never stalls. After it, the shot holds the body's own level rather than
 * its own: the body is still falling — slower, if a hand is still on it, which
 * is the other half of what that hand is for — and a bolt that stayed on the
 * row it turned on would watch the thing it promised to hit sink past it. It
 * is a fraction of a tile a beat and it reads as level.
 *
 * **It costs one speed, not two.** The whole of a tick's travel is
 * `bulletTilesPerBeat` whichever leg it is spent on, so there is nothing here
 * to tune: a bolt that crossed sideways faster than it climbs would be two
 * shots wearing one colour.
 *
 * And a locked shot still passes through nothing. It cannot skip a column —
 * sideways travel is a sixth of a tile a tick — so every lane it crosses is a
 * lane `firstAlong` tests at the body's own level on some tick, and a body
 * standing in the way of the horizontal leg is met first and stops it. The
 * lock aims the shot; it does not excuse it from the field.
 *
 * The number it returns is what `sweep` climbs this tick, in thousandths of a
 * tile. It is **signed**: a body that has fallen below the shot's level brings
 * it down by that much, which is how the second leg stays level with the thing
 * it is about.
 */
export function steerShot(world: World, b: Bullet, stepMilli: number): number {
  b.aimMilli = 0;
  const target = lockedBody(world);
  // Nothing held: dumb again, and it climbs the whole step from wherever the
  // hand let go of it.
  if (!target) return stepMilli;
  const gap = bulletMilli(b) - creatureMilli(world, target);
  // Still below it by more than this tick's travel — the first leg, and there
  // is nothing sideways in it.
  if (gap > stepMilli) return stepMilli;
  // The turn: climb only as far as the body's own level, and spend what is
  // left of the step running across. A negative gap is a body that has sunk
  // below the bolt, and the bolt goes down with it.
  const climb = Math.min(gap, stepMilli);
  slide(world, b, target, Math.max(0, stepMilli - Math.abs(climb)));
  return climb;
}

/**
 * The second leg: `amount` thousandths of a tile spent sideways, towards the
 * nearest lane the body actually occupies.
 *
 * A shot already inside the span has nowhere to go and says so with a zero —
 * which is also the answer THE MAGNET reads as *this one came up from
 * underneath* (`magnet.ts`). A two-column body is answered in whichever of its
 * two lanes the bolt is nearest, not dragged to a centre half a tile from
 * either.
 */
function slide(world: World, b: Bullet, target: Creature, amount: number): void {
  if (amount <= 0) return;
  const x = b.col * MILLI + b.driftMilli;
  const lane = creatureLane(world, target);
  const aimAt = Math.max(lane * MILLI, Math.min((lane + spanOf(target) - 1) * MILLI, x));
  const left = aimAt - x;
  if (left === 0) return;
  const move = Math.abs(left) <= amount ? left : Math.sign(left) * amount;
  const to = x + move;
  // Half a tile either way and then the column itself changes. That is what
  // keeps `Bullet.col` the lane the shot is *nearest*, and so the lane the hit
  // test may go on asking about with no idea any of this happened.
  b.col = Math.floor((to + MILLI / 2) / MILLI);
  b.driftMilli = to - b.col * MILLI;
  // Thousandths of a column crossed on this tick, signed. Zero is a bolt on
  // its first leg, climbing, and it is drawn exactly as an unlocked one is.
  // The two things that read it want the same fact from it — which way the
  // tail trails (`render/bullets.ts`), and which side of a magnet the bolt
  // arrived at (`magnet.ts`) — and neither has to know this file's rules.
  b.aimMilli = move;
}
