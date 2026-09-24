import { BATON_SOCKET_SHED, BATON_SOCKET_SWELL, type BatonState, batonLocked } from "./baton.js";
import { batonSlow } from "./baton-slow.js";
import { batonBoss } from "./baton-step.js";
import type { SimConfig } from "./config.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE BATON's two thumbs on its own arm** — the states that are answered on
 * the picture rather than on the panel (`.claude/skills/new-boss` §6.2).
 *
 * Everything else in this fight is the trigger and the shot, one seat a beat,
 * and the seat that acted is locked out of the ship for the beat after
 * (`batonLocks`). That lock is the boss, and until now it was a beat with
 * nothing in it: the locked seat sat and watched. **Both gestures here are
 * that beat given something to do**, and neither of them touches the ship.
 *
 * **The strip.** A dead socket does not let go all at once any more: its shell
 * swells for `batonSwellBeats` first (`BATON_SOCKET_SWELL`), and only then
 * drops down the arm's own column as the rock it has always dropped. Inside
 * that window `batonSwellStrips` presses take it off clean and nothing falls
 * — each a fresh thumb, since a drag held on the arm repeats its press every
 * move (`stripThumbs`) — and **every one has to be the locked seat's**. Which seat that is, is the metronome's own
 * answer, so the mark stands on one screen and moves to the other with the
 * turn; a pair who stop handing over have nobody locked and nobody who may
 * strip, and the shells come down on them. The other seat's press is
 * **refused with a sound** rather than dropped in silence, for THE INSTAR's
 * reason: both screens draw the arm, so the seat can see the thing it was
 * refused (`instar-hand.ts`).
 *
 * **The draw.** Two beads at rest in the last two sockets no longer become one
 * on the beat they arrive: the arm goes to `merging` and the pair has
 * `batonMergeWindowBeats` to draw them together with a thumb each — player 1
 * on the upper bead, player 2 on the one that waited, by geometry and never by
 * colour (`bosses-choreographed.md`'s rule). It counts only while **both** are
 * down, and either letting go puts the count back to nought: THE INSTAR's
 * *together means together*, arriving in the one fight whose whole content is
 * that the two of them may never act on the same beat. The window closing
 * short of it shakes the bead that waited back to the top socket, which is the
 * price a bead that sat too long pays anywhere else on this arm.
 *
 * Both are read **on the tick**, from `boss-hands.ts`: a strip is a press when
 * it lands, and a hold is where the thumb is now.
 */

/** The socket whose bead is this seat's to draw, under `merging`. */
export function batonMergeSocket(cfg: SimConfig, player: 1 | 2): number {
  return cfg.batonSockets - (player === 1 ? 2 : 1);
}

/** That seat's bit in `mergeThumbs`. */
function bit(player: 1 | 2): number {
  return player === 1 ? 1 : 2;
}

/** Whether this seat's thumb is down on its bead. */
export function batonDrawing(b: BatonState, player: 1 | 2): boolean {
  return (b.mergeThumbs & bit(player)) !== 0;
}

/** Whether both are, which is the only state the count runs in. */
export function batonDrawn(b: BatonState): boolean {
  return b.mergeThumbs === 3;
}

/**
 * Whether a shell is coming away and this seat is the one who may take it —
 * which is the seat the beat has locked out of the ship, and nobody at all on
 * a beat neither of them acted in.
 */
export function batonMayStrip(b: BatonState, player: 1 | 2, beat: number): boolean {
  return b.stage === "passing" && b.swellSocket >= 0 && batonLocked(b, player, beat);
}

function refuse(world: World, b: BatonState, socket: number): void {
  world.events.push({ type: "batonRefused", col: b.col, socket });
}

/**
 * The strip: a fresh press by the locked seat loosens the shell, and the last
 * of `batonSwellStrips` takes it away in the hand. The socket is shed with no
 * rock under it, and `shedBeat` moves as it would have on the drop — so the
 * arm's next shell begins swelling on exactly the count it was going to. A
 * thumb already down counts nothing until it has been lifted, whatever it is
 * over; a refused press is refused once, not every move of the drag.
 */
function strip(world: World, b: BatonState, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag") return;
  if (!command.on) {
    b.stripThumbs &= ~bit(player);
    return;
  }
  const socket = b.swellSocket;
  if (socket < 0 || command.id !== socket || (b.stripThumbs & bit(player)) !== 0) return;
  b.stripThumbs |= bit(player);
  if (!batonLocked(b, player, world.beat)) {
    refuse(world, b, socket);
    return;
  }
  b.stripped += 1;
  if (b.stripped < world.cfg.batonSwellStrips) {
    world.events.push({ type: "batonStripped", col: b.col, socket });
    return;
  }
  b.sockets[socket] = BATON_SOCKET_SHED;
  b.swellSocket = -1;
  b.swellBeat = -1;
  b.shedBeat = world.beat;
  world.events.push({ type: "batonStripped", col: b.col, socket });
  batonSlow(world, b);
}

/**
 * The draw: a thumb down on this seat's own bead, or lifted off it. Nothing is
 * counted here — the count is a beat's worth and runs in `baton-pair.ts` — so
 * a thumb put down and taken up inside one beat buys the pair nothing, which
 * is what *together* has to mean for a gesture read on the tick.
 */
function draw(world: World, b: BatonState, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag") return;
  const mine = batonMergeSocket(world.cfg, player);
  if (command.id !== mine) {
    if (command.on) refuse(world, b, command.id ?? mine);
    return;
  }
  const was = batonDrawing(b, player);
  if (was === command.on) return;
  b.mergeThumbs = command.on ? b.mergeThumbs | bit(player) : b.mergeThumbs & ~bit(player);
  if (command.on) world.events.push({ type: "batonHeld", col: b.col, socket: mine, player });
}

/** Every thumb THE BATON's own arm answers, by the stage the arm is in. */
export function batonHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag" || command.target !== "batonSocket") return;
  const b = batonBoss(world);
  if (b === null) return;
  if (b.stage === "passing") strip(world, b, player, command);
  else if (b.stage === "merging") draw(world, b, player, command);
}

/** Whether the socket is the one whose shell is coming away this beat. */
export function batonSwelling(b: BatonState, socket: number): boolean {
  return b.swellSocket === socket && b.sockets[socket] === BATON_SOCKET_SWELL;
}
