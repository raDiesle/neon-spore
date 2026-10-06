import { type BatonBead, type BatonState, batonLead } from "./baton.js";
import { batonBeadAlongMilli } from "./baton-bead.js";
import type { World } from "./world.js";

/**
 * THE BATON's knock: the wrong colour through a bead in flight throws it back
 * two sockets. Split off `baton-press.ts` when the arm across gave the knock a
 * measure of its own and that file came within thirty lines of its limit; the
 * press that calls it is still `batonStruck` there.
 */

/**
 * A bead knocked back by the wrong colour: out of the air, two sockets up
 * from the one it left, in the column it left from — the arm swung *for* the
 * flight, and the flight did not take. The picture throws it back from where
 * it was along the arm (`backFromMilli`); `rowMilli`, the row the bolt met it
 * on, is said with the event (`batonKicked`).
 */
export function batonKnock(world: World, b: BatonState, bead: BatonBead, rowMilli: number): void {
  const from = bead.socket;
  // Where it was along the arm when the bolt met it — on a hanging arm, the
  // row the bolt met it on; along the arm across, between two columns.
  const along = batonBeadAlongMilli(world.cfg, bead, world.tick);
  if (b.stage === "crossing") {
    b.stage = "passing";
    b.stageBeat = world.beat;
    b.acts = 0;
    b.actBeat = -1;
  }
  bead.flying = false;
  bead.final = false;
  bead.flightTick = -1;
  bead.struck = false;
  bead.socket = Math.max(0, from - 2);
  bead.backTick = world.tick;
  bead.backFromMilli = along;
  bead.satBeat = world.beat;
  bead.col = bead.fromCol;
  b.stillBeat = world.beat;
  b.col = batonLead(b)?.col ?? bead.col;
  world.events.push({
    type: "batonKicked",
    col: bead.col,
    socket: bead.socket,
    rowMilli,
  });
}
