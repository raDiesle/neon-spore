import type { Color } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE SPEND LEDGER: what the pair has already spent**, per colour, over the
 * last few beats of their own play.
 *
 * Nothing in this game has ever remembered the *players* before. Every boss
 * and every creature remembers itself — its phase, its cadence, its beads —
 * and is answered inside its own cycle. This is one number about the two of
 * them, and it is the machinery `docs/spec/bosses.md`'s *fixed and learnable* has been asking
 * for since THE MOTHER was designed: a boss may react to the pair, but only
 * to **what they spent** and never to *how well they played*, and only where
 * the reaction is announced a full cycle ahead. A ledger of colours spent is
 * exactly that much and no more — it cannot tell a hit from a miss, so a boss
 * reading it cannot punish a pair for being bad at the game.
 *
 * **One count, and it is theirs.** No seat is recorded and none can be: the
 * navigator loads the colour and the pilot holds the column, so a bolt is not
 * either player's to own — which is `balance.ts`' rule about every shared
 * number in this game, arrived at from the other end. THE TASTER's whole
 * sentence depends on it (*"you're nine red to four, give me cyan for the next
 * eight"*), and a ledger split by seat would be two numbers to argue over
 * instead of one to agree about.
 *
 * **Nothing steps it.** A slot is written when a colour leaves the muzzle and
 * read as a pure function of `world.beat` — the discipline `throat.ts` argues
 * for a moving mouth, said about a moving count: a rolling window that was
 * *advanced* once a beat would sit on one side of `onBeat` while everything
 * reading it sat on the other, and the beat a blade's colour sets is decided
 * inside `stepBoss`. So the ring below is keyed by the beat itself, each slot
 * carrying the beat it belongs to, and a window is the slots whose beat is
 * inside it. A slot from before a `resetClock` reads as a beat that is not in
 * any window, so it cannot be counted by mistake (`run.ts`).
 */

/**
 * Beats of spending the world keeps, and therefore the deepest window
 * anything may ask for.
 *
 * A constant and not a `SimConfig` field, because it is not a dial: what a
 * *reader* looks at is its own tunable — `tasterWindowBeats` is thirty and
 * shortens to twelve mid-fight — and this is only how much the ring has room
 * for. Two beats of slack over the deepest window shipped, so widening one is
 * an edit in one file rather than two.
 */
export const SPEND_BEATS = 32;

/** One beat of the pair's spending. */
export interface SpendBeat {
  /** The beat these two counts belong to; `-1` for a slot nothing has written. */
  beat: number;
  /** Bolts and beams of each colour that left the muzzle on it. */
  red: number;
  cyan: number;
}

/**
 * The ring, `SPEND_BEATS` long, indexed by `beat % SPEND_BEATS`. Every slot
 * carries its own beat, so the index is an optimisation and never the truth.
 */
export type SpendLedger = SpendBeat[];

export function newSpendLedger(): SpendLedger {
  const out: SpendLedger = [];
  for (let i = 0; i < SPEND_BEATS; i++) out.push({ beat: -1, red: 0, cyan: 0 });
  return out;
}

/**
 * Nothing spent. Called by `startWave` for the reason `clearSlow` is: the
 * ledger is what the pair has spent **in this fight**, and a taster that
 * opened on the last wave's colours would grow its first blade against a
 * conversation the pair had already finished.
 */
export function clearSpend(world: World): void {
  for (const slot of world.spend) {
    slot.beat = -1;
    slot.red = 0;
    slot.cyan = 0;
  }
}

/**
 * One colour out of the muzzle, bolt or beam.
 *
 * Called from the two places a shot is actually made — `launch` in
 * `bullets.ts` and `releaseLance` in `lance-burn.ts` — and with the colour the
 * shot **is** rather than the one the thumb pressed. THE CODEX is the only
 * thing that can make those differ, and what a boss tastes is the ammunition
 * that went past it: the ledger is the world's record and not either screen's
 * (`codex.ts`).
 */
export function spendShot(world: World, color: Color): void {
  const slot = world.spend[world.beat % SPEND_BEATS];
  if (slot === undefined) return;
  // The slot a lap of the ring ago, reused: the beat it carries is what says
  // whether the two counts on it are this beat's or a stale beat's.
  if (slot.beat !== world.beat) {
    slot.beat = world.beat;
    slot.red = 0;
    slot.cyan = 0;
  }
  if (color === "red") slot.red += 1;
  else slot.cyan += 1;
}

/**
 * How many shots of one colour the pair has spent over the last `beats`
 * beats, this one included.
 *
 * Clamped to the ring's depth rather than throwing: a window deeper than the
 * ledger is a configuration mistake, and the honest answer to it is every
 * beat there is rather than a dead fight.
 */
export function spentOver(world: World, beats: number, color: Color): number {
  const depth = Math.max(1, Math.min(beats, SPEND_BEATS));
  const from = world.beat - depth + 1;
  let n = 0;
  for (const slot of world.spend) {
    if (slot.beat < from || slot.beat > world.beat) continue;
    n += color === "red" ? slot.red : slot.cyan;
  }
  return n;
}

/**
 * **The colour the pair has been leaning on** over the last `beats` beats, and
 * `null` on a dead heat or an empty window.
 *
 * One function rather than a comparison at the call site, because a second
 * copy of *which side of the ledger is winning* is a boss and a readout
 * disagreeing about the pair's own habits — the one thing in this fight both
 * screens have to mean the same by (`packages/sim/test/copies-table.ts` carries
 * the row). A tie is a real answer and not a failure: it is the pair spending
 * evenly, which is the play THE TASTER is trying to teach, and what a caller
 * does about it is the caller's own business.
 */
export function spendLean(world: World, beats: number): Color | null {
  const red = spentOver(world, beats, "red");
  const cyan = spentOver(world, beats, "cyan");
  if (red === cyan) return null;
  return red > cyan ? "red" : "cyan";
}

/**
 * What the ledger puts into `hashWorld`: every slot, whole.
 *
 * All three numbers of each, because a stale slot is only stale by the beat it
 * carries — two devices that disagreed about one of those would disagree about
 * which beats are inside the window and so about the colour the fan is about
 * to grow in. Here rather than in a hash-spend.ts of its own because this is
 * one loop and `hash.ts` is the file at its limit.
 */
export function spendHashParts(ledger: SpendLedger): number[] {
  const out: number[] = [ledger.length];
  for (const slot of ledger) out.push(slot.beat, slot.red, slot.cyan);
  return out;
}
