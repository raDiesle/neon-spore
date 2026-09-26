import { antiphonHashParts } from "./antiphon-hash.js";
import { batonHashParts } from "./baton-hash.js";
import type { BossState } from "./boss-union.js";
import { curtainHashParts } from "./curtain-hash.js";
import { filamentHashParts } from "./filament-hash.js";
import { gimbalHashParts } from "./gimbal-hash.js";
import { gorgeHashParts } from "./gorge-hash.js";
import { haspHashParts } from "./hasp-hash.js";
import { hiveHashParts } from "./hive-hash.js";
import { instarHashParts } from "./instar-hash.js";
import { keelHashParts } from "./keel-hash.js";
import { leadHashParts } from "./lead-hash.js";
import { ledgerHashParts } from "./ledger-hash.js";
import { mantleHashParts } from "./mantle-hash.js";
import { oculusHashParts } from "./oculus-hash.js";
import { plumbHashParts } from "./plumb-hash.js";
import { ratchetHashParts } from "./ratchet-hash.js";
import { rimeHashParts } from "./rime-hash.js";
import { scuttleHashParts } from "./scuttle-hash.js";
import { seamHashParts } from "./seam-hash.js";
import { sinewHashParts } from "./sinew-hash.js";
import { spoolHashParts } from "./spool-hash.js";
import { stareHashParts } from "./stare-hash.js";
import { surgeHashParts } from "./surge-hash.js";
import { tasterHashParts } from "./taster-hash.js";
import { throatHashParts } from "./throat-hash.js";
import { trivetHashParts } from "./trivet-hash.js";
import { undertowHashParts } from "./undertow-hash.js";
import { valveHashParts } from "./valve-hash.js";
import { viseHashParts } from "./vise-hash.js";
import { wellHashParts } from "./well-hash.js";

/**
 * The fingerprint's share of **the bosses that are a clock** — THE STARE, THE
 * BATON, THE THROAT and THE UNDERTOW.
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
  // THE GORGE: every intake's tally, colour and state (`gorge-hash.ts`).
  if (boss.kind === "gorge") {
    for (const n of gorgeHashParts(boss)) out.push(n);
  }
  // THE CURTAIN: the hem, the soft set, the core and its clocks (`curtain-hash.ts`).
  // THE SINEW: the two hands, the slack, the zone and its clocks (`sinew-hash.ts`).
  if (boss.kind === "sinew") {
    for (const n of sinewHashParts(boss)) out.push(n);
  }
  // THE SURGE: the notches, the pressure, the two thumbs and the lift's tick (`surge-hash.ts`).
  if (boss.kind === "surge") {
    for (const n of surgeHashParts(boss)) out.push(n);
  }
  // THE LEAD: the column, the way, the lean, the stalk and every shot in the air (`lead-hash.ts`).
  if (boss.kind === "lead") {
    for (const n of leadHashParts(boss)) out.push(n);
  }
  // THE SCUTTLE: every socket's part, which hang, which is live, the slack and the clocks (`scuttle-hash.ts`).
  if (boss.kind === "scuttle") {
    for (const n of scuttleHashParts(boss)) out.push(n);
  }
  // THE ANTIPHON: the organs, the rail, the pits, and the clocks (`antiphon-hash.ts`).
  if (boss.kind === "antiphon") {
    for (const n of antiphonHashParts(boss)) out.push(n);
  }
  // THE HIVE: every site's column, colour and seal, the count opened and the clocks (`hive-hash.ts`).
  if (boss.kind === "hive") {
    for (const n of hiveHashParts(boss)) out.push(n);
  }
  // THE INSTAR and THE NETTLE: the whole script, the cursor and phase, and every mark's count (`instar-hash.ts`).
  if (boss.kind === "instar" || boss.kind === "nettle") {
    for (const n of instarHashParts(boss)) out.push(n);
  }
  // THE GIMBAL: the alignments, the cursor and phase, both rings' bearings and both hands' (`gimbal-hash.ts`).
  if (boss.kind === "gimbal") {
    for (const n of gimbalHashParts(boss)) out.push(n);
  }
  // THE SPOOL: the phase, the ribs, the brake's depth, both lengths and the rolled rate (`spool-hash.ts`).
  if (boss.kind === "spool") {
    for (const n of spoolHashParts(boss)) out.push(n);
  }
  // THE HASP: the phase, the hasps, both hands, the heat's two beats, the wind and the bolt (`hasp-hash.ts`).
  if (boss.kind === "hasp") {
    for (const n of haspHashParts(boss)) out.push(n);
  }
  // THE RATCHET: the phase, the teeth, both hands and the bolt (`ratchet-hash.ts`).
  if (boss.kind === "ratchet") {
    for (const n of ratchetHashParts(boss)) out.push(n);
  }
  // THE MANTLE: the thresholds, the cursor and phase, both handles' depths, the
  // spark and the heartbeat finale (`mantle-hash.ts`).
  if (boss.kind === "mantle") {
    for (const n of mantleHashParts(boss)) out.push(n);
  }
  // THE KEEL: the socket, the phase and movement, the joint, the run's cursor,
  // the rock, every segment's lock and the authored order (`keel-hash.ts`).
  if (boss.kind === "keel") {
    for (const n of keelHashParts(boss)) out.push(n);
  }
  // THE VALVE: the phase and movement, the pins, the wheel, the hand, the
  // travel, the pin's thumb, the spark and the marks (`valve-hash.ts`).
  if (boss.kind === "valve") {
    for (const n of valveHashParts(boss)) out.push(n);
  }
  // THE SEAM: the phase, the cursor, the sealed points, the answers owed
  // and the script (`seam-hash.ts`).
  if (boss.kind === "seam") {
    for (const n of seamHashParts(boss)) out.push(n);
  }
  // THE OCULUS: the phase, the cursor, the leaves, the hits, both thumbs
  // and the script (`oculus-hash.ts`).
  if (boss.kind === "oculus") {
    for (const n of oculusHashParts(boss)) out.push(n);
  }
  // THE VISE: the phase, the cursor, the cracks, the hits, both gaps and
  // the script (`vise-hash.ts`).
  if (boss.kind === "vise") {
    for (const n of viseHashParts(boss)) out.push(n);
  }
  // THE RIME: the phase, the cursor, the wipes, the hits, both halves' frost,
  // the reversal counts and the script (`rime-hash.ts`).
  if (boss.kind === "rime") {
    for (const n of rimeHashParts(boss)) out.push(n);
  }
  // THE TRIVET: the phase, the cursor, the feet, the hits, both seats' pads
  // and the script (`trivet-hash.ts`).
  if (boss.kind === "trivet") {
    for (const n of trivetHashParts(boss)) out.push(n);
  }
  // THE PLUMB: the phase, the cursor, the weights, the hits, both seats'
  // leans and the script (`plumb-hash.ts`).
  if (boss.kind === "plumb") {
    for (const n of plumbHashParts(boss)) out.push(n);
  }
  // THE FILAMENT: every filament's tiles, the cursor and phase, the head, the tail and the grabs (`filament-hash.ts`).
  if (boss.kind === "filament") {
    for (const n of filamentHashParts(boss)) out.push(n);
  }
  if (boss.kind === "curtain") {
    for (const n of curtainHashParts(boss)) out.push(n);
  }
  // THE LEDGER: the seam, the socket and every return on the cord
  // (`ledger-hash.ts`).
  if (boss.kind === "ledger") {
    for (const n of ledgerHashParts(boss)) out.push(n);
  }
  // THE TASTER: every blade's edge, thickness and clock (`taster-hash.ts`).
  if (boss.kind === "taster") {
    for (const n of tasterHashParts(boss)) out.push(n);
  }
  // THE WELL: the phase, the angle the face stands at, the hold spent and the
  // thumb's anchor (`well-hash.ts`).
  if (boss.kind === "well") {
    for (const n of wellHashParts(boss)) out.push(n);
  }
  return out;
}
