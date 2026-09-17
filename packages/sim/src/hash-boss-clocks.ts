import { batonHashParts } from "./baton-hash.js";
import type { BossState } from "./boss-union.js";
import { candleHashParts } from "./candle-hash.js";
import { curtainHashParts } from "./curtain-hash.js";
import { diastoleHashParts } from "./diastole-hash.js";
import { gorgeHashParts } from "./gorge-hash.js";
import { orreryHashParts } from "./orrery-hash.js";
import { stareHashParts } from "./stare-hash.js";
import { tasterHashParts } from "./taster-hash.js";
import { throatHashParts } from "./throat-hash.js";
import { undertowHashParts } from "./undertow-hash.js";

/**
 * The fingerprint's share of **the bosses that are a clock** — THE STARE, THE
 * DIASTOLE, THE BATON, THE THROAT and THE UNDERTOW.
 *
 * Split out of `hash-boss.ts` when THE UNDERTOW took that file four lines over
 * its 250-line limit, along the seam `bosses-clocks.ts`,
 * `config-boss-clocks.ts` and `boss-entries-clocks.ts` already cut: what is
 * left next door is a boss with a place on the field, and everything here is
 * one whose state is a beat count the pair says out loud. Each already
 * gathers its own numbers beside its own state (`*-hash.ts`); this file is
 * only the five branches, so `bossHashParts` stays one list a reader can
 * hold, and the contract is that file's — a flat list in a fixed order,
 * nothing folded here.
 *
 * Returns nothing for any other boss, so the caller can push it unconditionally.
 */
export function clockHashParts(boss: BossState): number[] {
  const out: number[] = [];
  if (boss.kind === "stare") {
    for (const n of stareHashParts(boss)) out.push(n);
  }
  // THE DIASTOLE, gathered beside the boss like the six above it — and the one
  // whose numbers are *two clocks and the origin they run from*, which is why
  // they matter as much as any board (`diastole-hash.ts`).
  if (boss.kind === "diastole") {
    for (const n of diastoleHashParts(boss)) out.push(n);
  }
  // THE BATON, gathered beside the boss like the seven above it — and the one
  // whose numbers are *two locks*, one per seat, which decide who may touch
  // their own phone this beat (`baton-hash.ts`).
  if (boss.kind === "baton") {
    for (const n of batonHashParts(boss)) out.push(n);
  }
  // THE THROAT, and its two anchor fields are the mouth's position rather than
  // its setup — a device that disagreed about either would judge a fling
  // against a different column (`throat-hash.ts`).
  if (boss.kind === "throat") {
    for (const n of throatHashParts(boss)) out.push(n);
  }
  // THE UNDERTOW, whose numbers are *which columns of the hull are open* —
  // the one thing two devices must not disagree on when one seat is being
  // asked to answer a hole and the other to plate it (`undertow-hash.ts`).
  if (boss.kind === "undertow") {
    for (const n of undertowHashParts(boss)) out.push(n);
  }
  // THE ORRERY, whose numbers are *anchors* rather than positions: nothing
  // about a ring is stepped, so two devices agree about where every gap is
  // exactly when they agree about these, and one beat out is a pair firing
  // into armour on one screen and into the core on the other
  // (`orrery-hash.ts`).
  if (boss.kind === "orrery") {
    for (const n of orreryHashParts(boss)) out.push(n);
  }
  // THE CANDLE: the glow, where it stands, where it faces (`candle-hash.ts`).
  if (boss.kind === "candle") {
    for (const n of candleHashParts(boss)) out.push(n);
  }
  // THE GORGE: every intake's tally, colour and state (`gorge-hash.ts`).
  if (boss.kind === "gorge") {
    for (const n of gorgeHashParts(boss)) out.push(n);
  }
  // THE CURTAIN: the hem, the soft set, the core and its clocks (`curtain-hash.ts`).
  if (boss.kind === "curtain") {
    for (const n of curtainHashParts(boss)) out.push(n);
  }
  // THE TASTER: every blade's edge, thickness and clock (`taster-hash.ts`).
  if (boss.kind === "taster") {
    for (const n of tasterHashParts(boss)) out.push(n);
  }
  return out;
}
