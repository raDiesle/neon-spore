import type { CreatureKind } from "./creature-kinds.js";
import type { Creature } from "./types.js";
import type { World } from "./world.js";

/**
 * **The shield pushes a creature back up the field, once.**
 *
 * Until 25 September 2026 the shield had nothing to say to anything alive —
 * `docs/spec/roles.md` said so in as many words — and a slick that reached a
 * dome standing in its column, armed on the beat, broke the hull through it.
 * The owner changed that: the shield answers almost every creature now. It
 * does not kill one. It throws it high back up the column it came down, and
 * from the top of that climb the body carries on under its own rule, so the
 * cannon still has to finish it the ordinary way.
 *
 * **Once per creature**, and that is the owner's answer to the question the
 * idea raised: a push that could be taken every time would let a pair hold a
 * body in the air for ever and never say its colour. The second arrival lands
 * on the hull exactly as it did before this file existed.
 *
 * It is THE VOLLEY's move, for a different reason. A volley's climb is the
 * creature — the shell comes off a plate at a time — and stays in `volley.ts`;
 * this one is the shield's, and belongs to no kind. What is shared is the
 * arithmetic of a climb and its picture: the row it turns on is the shield's,
 * `fromRow` a row above it so the body is seen to leave the dome rather than
 * come out of it (`volleyReturn` has the whole argument), and the first step
 * taken on the tick of the push.
 */

/**
 * **The kinds the shield may push**, as a list of what is in rather than what
 * is out, so a creature added tomorrow is not pushed until somebody decides it
 * should be.
 *
 * Every body here comes down onto the hull and is the cannon's to kill. Not
 * here, agreed with the owner: the rocks and THE VOLLEY, which the shield
 * already answers its own way; THE GUM, which is the one body the shield was
 * built never to stop; THE CAROM, THE CRYSTAL and THE COIL, each a rock the
 * shield cannot turn until something has opened it; THE FENCE, THE CLASP and
 * THE MOULT, which have answers of their own; the limpet and the leech, which
 * never break the hull; and every boss. Also not here, because none of them
 * comes down onto the hull the ordinary way: a strand's beads (a thread pushed
 * one bead at a time is not a thread), the mine, the wisp, the balloon, THE
 * GYRE and its mounts, THE CRAWLER, the cairn and the curtain.
 */
const PUSHABLE: readonly CreatureKind[] = [
  "slick",
  "bulb",
  "lure",
  "throb",
  "shell",
  "veil",
  "rind",
  "recoil",
  "lid",
  "weight",
  "magnet",
  "countdown",
  "beatbox",
  "choir",
  "echo",
  "dart",
  "ghost",
  "chute",
];

/** Whether the shield may push this kind at all. */
export function isPushable(kind: CreatureKind): boolean {
  return PUSHABLE.includes(kind);
}

/**
 * Whether the shield would push this body **if it reached the dome now** —
 * a kind it may push, not pushed already. The one place the *once* is read:
 * `hull.ts` asks it to decide which row the body is answered on, and render
 * will ask it to decide what a push is told as.
 */
export function pushOffered(c: Creature): boolean {
  return isPushable(c.kind) && c.pushed !== true;
}

/**
 * Beats of climb this body still has, zero for one that is falling. Read it
 * through here, for `volleyClimbLeft`'s reason.
 */
export function pushRiseLeft(c: Creature): number {
  return c.pushRise ?? 0;
}

/** Whether it is on its way back up rather than coming down. */
export function pushIsClimbing(c: Creature): boolean {
  return pushRiseLeft(c) > 0;
}

/**
 * One beat of the climb. The field's top is the only clamp: a body pushed
 * from high up has nowhere left to go and comes down again from row zero.
 */
export function stepPush(world: World, c: Creature): void {
  c.row = Math.max(0, c.row - world.cfg.shieldPushRows);
  const left = pushRiseLeft(c) - 1;
  c.pushRise = left > 0 ? left : undefined;
}

/**
 * The shield met a body it may push. Returns true: the body **stays on the
 * field**, climbing.
 *
 * It turns on `guardRow` whichever row its fall had reached, and the first
 * beat of the climb is taken here, on the tick of the push — `volleyReturn`'s
 * shape, and its reason: a body that finished the beat going down and turned
 * on the next would be drawn sinking into the dome before it left it.
 */
export function shieldPush(world: World, c: Creature, guardRow: number): boolean {
  c.pushed = true;
  c.pushRise = world.cfg.shieldPushBeats;
  c.fromRow = Math.max(0, guardRow - 1);
  c.fromCol = c.col;
  c.row = guardRow;
  stepPush(world, c);
  world.events.push({ type: "shieldPush", id: c.id, col: c.col, row: guardRow, kind: c.kind });
  return true;
}
