import {
  BATON_SOCKET_DARK,
  type BatonBead,
  type BatonState,
  batonFlip,
  batonSocketRow,
} from "./baton.js";
import { batonBeadSlot } from "./baton-arm.js";
import { batonLandTick } from "./baton-bead.js";
import { batonSlow } from "./baton-slow.js";
import { MILLI, type World } from "./world.js";

/**
 * THE BATON's crossing: the merged bead's last flight, the design's step 13
 * (`docs/spec/bosses-choreographed.md` §10).
 *
 * Out of the last socket the merged bead does not cross one socket in three
 * beats; it crosses to the drop in `batonFinalBeats`, and all the way the
 * pair owe it acts, in turn — his trigger sent it, so her shot is next, then
 * his trigger, and so on to the end. **No act is due on a beat** (the owner,
 * 6 October 2026: *if you don't press on the beat it is not a mistake*); what
 * the crossing will not forgive is a gap, more than `batonTurnBottomBeats`
 * since the last act, which is **the miss** and puts the bead back in the
 * last socket to be sent again — a step back, as a slow socket costs, and
 * not the whole arm grown back. It is the same alternation the arm taught,
 * with nothing to land in between. What the acts are is unchanged: the trigger is the trigger
 * (`batonLaunch`) and the shot is a bolt of the bead's colour through it
 * (`batonStruck`), which flips the bead as a landing would, so the colour
 * language runs on to the end.
 */

/** Whose act the next one is: player 1 on the even acts, player 2 on the odd. */
export function batonActor(b: BatonState): 1 | 2 {
  return b.acts % 2 === 0 ? 1 : 2;
}

/**
 * The merged bead leaves the last socket. No swing — the drop is straight
 * down the column the socket hangs in — and the launch is the first act.
 */
export function batonCrossLaunch(world: World, b: BatonState, bead: BatonBead): void {
  b.stage = "crossing";
  b.stageBeat = world.beat;
  b.acts = 0;
  b.actBeat = world.beat;
  bead.final = true;
  batonAct(world, b);
  batonSlow(world, b);
}

/** An act made in turn: counted, and said. */
export function batonAct(world: World, b: BatonState): void {
  b.acts += 1;
  b.actBeat = world.beat;
  world.events.push({ type: "batonAct", col: b.col, act: b.acts - 1 });
}

/**
 * Player 2's bolt through the bead on the crossing, the right colour. Her
 * act if it is her turn, and the bead flips so the next one is the other
 * colour; out of turn it is a bolt through nothing, spent like any other.
 */
export function batonCrossStruck(world: World, b: BatonState, bead: BatonBead): void {
  if (batonActor(b) !== 2) return;
  bead.color = batonFlip(bead.color);
  batonAct(world, b);
}

/**
 * One beat of the crossing. A gap since the last act longer than the bottom
 * socket's turn is the miss; the flight run out is the drop.
 */
export function batonCrossBeat(world: World, b: BatonState, bead: BatonBead): void {
  const cfg = world.cfg;
  if (world.beat - b.actBeat > cfg.batonTurnBottomBeats) {
    miss(world, b, bead);
    return;
  }
  if (world.tick >= batonLandTick(cfg, bead)) drop(world, b, bead);
}

/**
 * The bead comes back into the last socket, the one it left, and sits there
 * to be sent again. The arm stays as it is: the sockets the pair darkened are
 * still dark, and the bead's turn in that socket starts now.
 */
function miss(world: World, b: BatonState, bead: BatonBead): void {
  b.stage = "passing";
  b.stageBeat = world.beat;
  b.acts = 0;
  b.actBeat = -1;
  b.stillBeat = world.beat;
  bead.flying = false;
  bead.final = false;
  bead.flightTick = -1;
  bead.struck = false;
  bead.satBeat = world.beat;
  world.events.push({ type: "batonMissed", col: bead.col, socket: bead.socket });
}

/**
 * Out of the last socket there is nothing to land in: the bead drops as a
 * loose pod, and from here the fight is the maw's (`pods.ts`,
 * `batonBeadTaken`). Both locks open: the last act was his and would have
 * locked him through the beat the pod falls in, and the catch is his to
 * make (the design's step 14). `acts` stays at the count, the record of a
 * crossing made whole.
 */
export function drop(world: World, b: BatonState, bead: BatonBead): void {
  const cfg = world.cfg;
  b.stage = "falling";
  b.stageBeat = world.beat;
  b.lockUntil = [-1, -1];
  b.sockets[batonBeadSlot(cfg, bead)] = BATON_SOCKET_DARK;
  b.handovers += 1;
  b.beads = [];
  const id = world.nextId++;
  b.podId = id;
  world.pods.push({
    id,
    colMilli: bead.col * MILLI,
    // Out of the bottom of the last socket: a row under it, on either arm.
    rowMilli: (batonSocketRow(cfg, b, bead.socket) + 1) * MILLI,
    driftMilli: 0,
    loose: true,
    kind: "purge",
    // A bead is a real cargo. THE BATON's arm is beaten by taking it in.
    husk: false,
    crossMilli: 0,
  });
}
