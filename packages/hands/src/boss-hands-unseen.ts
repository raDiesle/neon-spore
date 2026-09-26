import {
  type Color,
  type Creature,
  pulseNoteTick,
  pulseRound,
  type TimedCommand,
  type World,
} from "@neon-spore/sim";
import type { Hand } from "./hand.js";

/**
 * **The pair's hands on the two fights about what one of them cannot see** —
 * THE PULSE's veil and THE REPRISE's echo — each a `Hand`
 * (`hand.ts`). No pose reaches either one's end, so neither had a
 * hand anywhere in the director until AUTO wanted one to play them with.
 *
 * A hand reads the world, not a screen, so the thing each fight takes away is
 * not taken from it: the veiled arrow's lane and the echoed body's column are
 * simply there. What the hand plays is the rule the pair is left with once
 * they have said it out loud to each other.
 */

type Press = Omit<TimedCommand, "tick">;

const aim = (col: number): Press => ({ player: 1, command: { kind: "cannonCol", col } });
const fire = (color: Color): Press => ({ player: 2, command: { kind: "fire", color } });

/** The cannon is free: nothing of the pair's is on its way up. */
const free = (w: World): boolean => w.bullets.length === 0 && w.beam === null;

/**
 * THE PULSE: both seats press every arrow on the tick it is due, veiled or
 * not — each arrow has to be hit twice, once by each of them
 * (`sim/pulse.ts`), and a note on its own tick is judged perfect
 * (`pulseJudgeIndex`). A note a seat has already resolved is left alone, so
 * the hand never presses at nothing, which costs (`pulse-controls.ts`).
 */
export const pulseHand: Hand = (w) => {
  const s = pulseRound(w);
  if (s === null || s.phase !== "play") return [];
  const out: Press[] = [];
  s.notes.forEach((note, i) => {
    if (pulseNoteTick(w.cfg, s.startTick, note) !== w.tick) return;
    if (s.judged1[i] === 0)
      out.push({ player: 1, command: { kind: "pulseStep", lane: note.lane } });
    if (s.judged2[i] === 0)
      out.push({ player: 2, command: { kind: "pulseStep", lane: note.lane } });
  });
  return out;
};

/** The body nearest the hull that a bolt can take: the one to answer first. */
function lowest(w: World): Creature | undefined {
  let best: Creature | undefined;
  for (const c of w.creatures) {
    if (c.color === null) continue;
    if (best === undefined || c.row > best.row) best = c;
  }
  return best;
}

/**
 * THE REPRISE: the cannon under the body nearest the hull and a bolt of its
 * colour when the cannon is free, seen or echoed alike. The boss has no move
 * of its own — every body is a slick or a bulb, and a bolt of the right colour
 * takes it (`content/waves/act-10.ts`) — so playing it right is the field
 * played straight, including the half of it nobody can see.
 */
export const repriseHand: Hand = (w) => {
  const body = lowest(w);
  if (body === undefined || body.color === null) return [];
  if (w.cannonCol !== body.col) return [aim(body.col)];
  return free(w) ? [fire(body.color)] : [];
};
