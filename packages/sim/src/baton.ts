import { midCol, type SimConfig } from "./config.js";
import type { Color } from "./types.js";

/**
 * THE BATON: whose turn is it.
 *
 * **The question no other boss asks** — *whether the two of you can take
 * turns without either of you deciding whose turn it is.* One arm of sockets
 * hangs down the middle of the field with a bead in the topmost. Player 1
 * launches the bead (the guard press, which is the one verb that seat has
 * with nothing under it while the arm stands); it crosses to the next socket
 * down over three real beats — **THE DRAG, not THE SLOW**: the field does not
 * slow, the bead is simply in the air for a long time
 * (`docs/spec/bosses-choreographed.md` §10) — and while it is in the air
 * player 2 has to put a shot of the bead's colour through it. A bead struck
 * lands and the socket it left goes dark; a bead not struck lands back where
 * it was; a bead that sits too long is shaken back to the base. **Whoever
 * acted is locked out for a beat** (`batonLocks`), so no seat can do both
 * halves — the turn is real because the rule takes the other half away.
 *
 * **It is a fixture and not a body** (`bossFillsWave`): the arm hangs in one
 * column and falls nothing, so the arrivals around it are the ones the wave's
 * own author wrote. The one thing it puts on the field by itself is a shed
 * shell (`batonShed`), and that is the one exception a fixture is allowed:
 * the rock falls down the arm's own column, on the beat the pair's own
 * handovers reached the sixth dark socket, from the row of the socket that
 * went dark first — three numbers no author can write because the pair
 * decides all three during the fight.
 *
 * **Health is the arm.** Every socket the bead has left is dark, and the
 * last handover drops the bead out of the bottom of the arm as a loose pod:
 * the fight ends the way a pod does, in the maw, with player 1 under it.
 *
 * **A second bead**, once `batonTwinAfter` sockets are dark: it lights in the
 * top socket wearing the other colour, and from then on the one trigger
 * launches whichever bead sits lowest and the one shot takes whichever
 * unstruck bead the bolt reaches first — two beads on one alternation, which
 * is the design's step 9 (`docs/spec/bosses-choreographed.md` §10). The
 * bead that reaches the last socket first **waits** there, unlaunchable and
 * unsettling, until the other lands in the socket above it; then the two
 * merge into one, and that one's next flight is **the crossing**: eleven
 * beats long, an act a beat, alternating — his trigger, her shot, his
 * trigger — and one beat missed puts the bead back at the top of an arm
 * whose sockets have all grown back (step 13, `baton-cross.ts`).
 *
 * **Two of its states ask for a thumb on the arm itself** rather than on the
 * panel (`.claude/skills/new-boss` §6.2, `baton-hand.ts`): a dead socket
 * swells before it lets go, and the seat the beat has locked out is the one
 * who may strip it off clean; and the two beads are drawn into one under a
 * thumb each, the one beat of this fight that asks for both at once.
 *
 * The clock, the launch and the landing are `baton-step.ts`, the fingerprint
 * is `baton-hash.ts`, the numbers are `config-baton.ts`, and where a bead is
 * on a tick is `baton-bead.ts`. This file is the shape and the questions
 * asked of it.
 */

/**
 * The stages, in the order `baton-hash.ts` numbers them by.
 *
 * A list rather than a bare union for `STARE_PHASES`' reason: a stage goes
 * into `hashWorld` as its index, so the order is a wire value.
 *
 * - `unfolding` — the arm unfolds downward, one socket a beat. Nothing to press yet.
 * - `passing` — beads are being passed down the arm: each is sitting in a
 *   socket, where player 1 may launch it, or in the air between two, where
 *   player 2 may strike it (`BatonBead.flying`).
 * - `merging` — both beads are at rest in the last two sockets and the pair
 *   is drawing them together, a thumb each, the one beat of this fight that
 *   asks for both at once (`baton-hand.ts`).
 * - `crossing` — the merged bead is on its last flight, out of the last
 *   socket, and the pair owe it an act a beat (`BatonState.acts`).
 * - `falling` — the bead has dropped out of the last socket as a loose pod.
 * - `down` — the pod was taken. The arm folds away and the boss is spent.
 */
export const BATON_STAGES = [
  "unfolding",
  "passing",
  "merging",
  "crossing",
  "falling",
  "down",
] as const;

/** Where the fight is. */
export type BatonStage = (typeof BATON_STAGES)[number];

/**
 * What a socket is. `lit` has not been passed yet, `dark` has, `swell` is a
 * dark one whose shell is coming away and has not let go yet, and `shed` is
 * one whose shell is gone — dropped down the arm as a rock (`batonShed`) or
 * taken off clean by a thumb (`baton-hand.ts`).
 */
export const BATON_SOCKET_LIT = 0;
export const BATON_SOCKET_DARK = 1;
export const BATON_SOCKET_SHED = 2;
export const BATON_SOCKET_SWELL = 3;

/** One bead on the arm: sitting in a socket, or in the air below it. */
export interface BatonBead {
  /** In the air between two sockets. Otherwise sitting in `socket`. */
  flying: boolean;
  /** `world.beat` it last came to rest on — the settle clock counts from here. */
  satBeat: number;
  /** The socket it is in, or is flying out of. */
  socket: number;
  /** `world.tick` the flight began on, -1 while it is not in the air. */
  flightTick: number;
  /** Whether a shot of the right colour has gone through it this flight. */
  struck: boolean;
  /** The colour it carries, which is the colour that takes it. */
  color: Color;
  /** The column it is landing in. Read only while it flies: sitting, its column is its socket's (`batonSocketCol`). */
  col: number;
  /** The column it left from. The same as `col` unless the arm swung for this flight. */
  fromCol: number;
  /** On the crossing: this flight is `batonFinalBeats` long, not `batonFlightBeats`. */
  final: boolean;
}

/** Everything THE BATON remembers between beats. */
export interface BatonState {
  kind: "baton";
  stage: BatonStage;
  /** `world.beat` the current stage began on. */
  stageBeat: number;
  /** The column the arm hangs in — the lead bead's, and where a shed shell falls. */
  col: number;
  /**
   * One entry per socket, base first: `BATON_SOCKET_LIT`, `_DARK`, `_SWELL`
   * or `_SHED`. The silhouette is the health bar.
   */
  sockets: number[];
  /** The beads on the arm, in the order they lit: one, then two, then the merged one. */
  beads: BatonBead[];
  /** Whether the two beads have already become one, so a third never lights. */
  merged: boolean;
  /**
   * Acts made on the crossing so far, the launch being the first. Act `n` is
   * player 1's when `n` is even and player 2's when it is odd, and it is due
   * inside beat `n` of the crossing (`baton-cross.ts`). 0 off the crossing.
   */
  acts: number;
  /**
   * `world.beat` the arm last went still on — the last landing, or the end
   * of the unfold. A sitting bead's turn is counted from here or from its own
   * landing, whichever is later, and never while another bead is in the air:
   * the turn is the pilot's to take *once the arm is still*, and a bead the
   * arm shook home while he was watching the other one fly would be a turn
   * he was never given.
   */
  stillBeat: number;
  /** Sockets passed so far. Decides when the turn tightens and where the arm swings. */
  handovers: number;
  /** Times the arm shook a sitting bead back to the base. */
  settles: number;
  /**
   * The last `world.beat` each seat is locked out through, inclusive: index
   * 0 is player 1, index 1 player 2. -1 is never locked.
   */
  lockUntil: [number, number];
  /** The loose pod the bead became, or -1 before it fell. */
  podId: number;
  /** `world.beat` the arm last shed a shell on, -1 before the first. */
  shedBeat: number;
  /** The socket whose shell is coming away, or -1 while none is (`baton-hand.ts`). */
  swellSocket: number;
  /** `world.beat` that swell began on, -1 while there is none. */
  swellBeat: number;
  /** Strips the locked seat has made on this swell, short of `batonSwellStrips`. */
  stripped: number;
  /** Whose thumbs are down on the arm under `passing`, so a drag counts once: bits as `mergeThumbs`. */
  stripThumbs: number;
  /** Whose thumbs are on the two beads under `merging`: bit 1 player 1's, bit 2 player 2's. */
  mergeThumbs: number;
  /** Beats both thumbs have been down together, running. Reset by either letting go. */
  mergeHeld: number;
  /**
   * `world.beat` the arm came down to one segment on — every socket but the
   * last gone dark or shed, the design's step 12 — and -1 while it is
   * longer. The picture hangs that last segment by a thread from here
   * (`render/baton-draw.ts`); a miss grows the arm back and clears it.
   */
  threadBeat: number;
}

/** Where the arm hangs: dead centre, for THE VANE's and THE WARDEN's reason. */
export function batonBaseCol(cfg: SimConfig): number {
  return midCol(cfg);
}

/**
 * The row a socket sits on: socket 0 is the top row and the arm hangs down
 * from it, one socket a row, so the bead is passed *down* the arm and the
 * last socket is the one nearest the hull — which is where it has to be for
 * the bead to drop out of it into the maw (`baton-step.ts`).
 */
export function batonSocketRow(_cfg: SimConfig, socket: number): number {
  return socket;
}

/** Dark and shed sockets together: how far up the arm the pair has got. */
export function batonDark(b: BatonState): number {
  let dark = 0;
  for (const s of b.sockets) if (s !== BATON_SOCKET_LIT) dark += 1;
  return dark;
}

/**
 * Whether the arm is one segment long: one socket still lit and every other
 * gone. The moment of the design's step 12, remembered in `threadBeat` so
 * the picture can thin the arm over a beat rather than on a frame.
 */
export function batonOneSegment(b: BatonState): boolean {
  return b.sockets.length - batonDark(b) <= 1;
}

/** Whether that seat may touch the ship on this beat. */
export function batonLocked(b: BatonState, player: 1 | 2, beat: number): boolean {
  return beat <= (player === 1 ? b.lockUntil[0] : b.lockUntil[1]);
}

/**
 * The bead furthest down the arm — the one the fight is about, and the one
 * the picture bends the arm at. The first lit wins a tie, so with one bead it
 * is that bead and with two in the top socket it is the original. `null`
 * only once the last one has dropped.
 */
export function batonLead(b: BatonState): BatonBead | null {
  let lead: BatonBead | null = null;
  for (const bead of b.beads) if (lead === null || bead.socket > lead.socket) lead = bead;
  return lead;
}

/** The other colour. A bead struck lands wearing the colour it was not. */
export function batonFlip(color: Color): Color {
  return color === "red" ? "cyan" : "red";
}
