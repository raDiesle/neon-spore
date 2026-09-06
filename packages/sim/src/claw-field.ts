import type { SimConfig } from "./config.js";
import { nextInt, type Rng } from "./rng.js";

/**
 * THE CLAW's wreck field, as arithmetic.
 *
 * The whole round is one question asked of a socket: is there anything in it,
 * and is that thing worth raising. Everything on this page answers that
 * question about a row of small integers, and none of it touches a world — so
 * render/, the director and the tests can all ask what is buried where without
 * pulling a boss in.
 *
 * Its own file and not `claw.ts`, for the reason `fleet-board.ts` is not
 * `fleet.ts`: the round moves state and this does not. What is *here* and not
 * next door is the deal and the drift, and both of them take an `Rng` rather
 * than a world for exactly that reason — they are the only two things in the
 * round that are rolled, and they are rolled out of a value handed in.
 *
 * **A socket is one integer**, an index into `CLAW_HOLDS`. Two devices
 * comparing wreck fields are comparing lists of 0, 1 and 2, and a fingerprint
 * over them is a fingerprint over the round.
 */

/**
 * What one socket of the field can hold. Its own list so a fingerprint can
 * index it, exactly as `POD_KINDS` and `FLEET_DIRS` are — a fourth hold added
 * to the type and not to this list would hash as the third, and two devices
 * would agree about a field they disagree about.
 *
 * `nothing` is a real hold and not the absence of one. The empty sockets are
 * what the wrecks shift *into*, so a field with none of them is a field that
 * never moves — and a field that never moves is not this round.
 */
export const CLAW_HOLDS = ["nothing", "pod", "rock"] as const;
export type ClawHold = (typeof CLAW_HOLDS)[number];

export const CLAW_NOTHING = 0;
export const CLAW_POD = 1;
export const CLAW_ROCK = 2;

/** How many sockets the rail runs over. Never fewer than three: a field the
 * claw cannot be told to move *along* is a field with nothing to say about. */
export function clawCells(cfg: SimConfig): number {
  return Math.max(3, cfg.clawCells);
}

/** Whether the claw may stand there. It is held to the rail rather than
 * wrapped round it: a claw that came out of the far side would make "one more
 * left" a sentence with two answers. */
export function clawOnRail(cfg: SimConfig, cell: number): boolean {
  return cell >= 0 && cell < clawCells(cfg);
}

/** What is buried in that socket, as an index into `CLAW_HOLDS`. */
export function clawHoldAt(cells: readonly number[], cell: number): number {
  return cells[cell] ?? CLAW_NOTHING;
}

/** Pods still down there. Reaching nought is the round, so nothing keeps a
 * second count of it beside the field that already says. */
export function clawPodsLeft(cells: readonly number[]): number {
  return cells.filter((h) => h === CLAW_POD).length;
}

/** Rocks still down there. Display only — a field cleared of pods is won with
 * every rock in the game still buried. */
export function clawRocksLeft(cells: readonly number[]): number {
  return cells.filter((h) => h === CLAW_ROCK).length;
}

/**
 * A fresh wreck field, drawn from the seeded rng.
 *
 * **What is rolled is exactly what one player knows and the other does not**,
 * which is the randomness rule (`docs/spec/structure.md` 7.3) and the same
 * argument THE GAUGE's band makes. An authored field is a field the pilot
 * memorises on the third playthrough, and then nobody has to say anything.
 *
 * Pods first and rocks after, into sockets picked one at a time out of those
 * still free — so the two never land on top of each other and the count is
 * exact rather than approached by rejection.
 */
export function clawDeal(rng: Rng, cfg: SimConfig): number[] {
  const n = clawCells(cfg);
  const cells = new Array<number>(n).fill(CLAW_NOTHING);
  const free: number[] = [];
  for (let i = 0; i < n; i++) free.push(i);
  // One socket is held back from the deal and it is the middle one: the claw
  // opens there, and a round whose first grab could land on something without
  // a word being said teaches the opposite of what it is for. THE FLEET's
  // rehearsal walks away from its own opening square for this reason; here the
  // round itself does it, because there is no coordinate to walk away from.
  const start = clawStartCell(cfg);
  free.splice(free.indexOf(start), 1);

  const bury = (what: number, howMany: number): void => {
    for (let i = 0; i < howMany && free.length > 0; i++) {
      cells[free.splice(nextInt(rng, free.length), 1)[0] as number] = what;
    }
  };
  bury(CLAW_POD, Math.max(1, cfg.clawPods));
  bury(CLAW_ROCK, Math.max(0, cfg.clawRocks));
  return cells;
}

/** Where the claw hangs when the round opens. The middle of the rail is the
 * one socket both seats can name without being told anything. */
export function clawStartCell(cfg: SimConfig): number {
  return Math.floor(clawCells(cfg) / 2);
}

/**
 * One wreck shifted a socket, or `null` when nothing could move.
 *
 * The whole round is here. A wreck picked out of those with a free socket
 * beside them goes one step into it, and the pilot is shown nothing at all —
 * so a direction the navigator finished saying half a second ago is now a
 * socket short, and the correction is the game.
 *
 * It never shifts *onto* anything: a wreck that swapped with its neighbour
 * would take two sockets' worth of the field somewhere in one step, which is a
 * field nobody can talk about. One thing, one socket, into a hole.
 */
export function clawDrift(rng: Rng, cells: number[]): { from: number; to: number } | null {
  const movers: number[] = [];
  for (let i = 0; i < cells.length; i++) {
    if (cells[i] === CLAW_NOTHING) continue;
    if (cells[i - 1] === CLAW_NOTHING || cells[i + 1] === CLAW_NOTHING) movers.push(i);
  }
  if (movers.length === 0) return null;
  const from = movers[nextInt(rng, movers.length)] as number;
  const left = cells[from - 1] === CLAW_NOTHING;
  const right = cells[from + 1] === CLAW_NOTHING;
  // Both sides open is the only draw with a second question in it, and it is
  // taken from the rng rather than fixed: a wreck that always went the same
  // way would be a field the pilot could read off the drift alone.
  const to = left && right ? from + (nextInt(rng, 2) === 0 ? -1 : 1) : left ? from - 1 : from + 1;
  cells[to] = cells[from] as number;
  cells[from] = CLAW_NOTHING;
  return { from, to };
}
