import {
  BATON_SOCKET_DARK,
  BATON_SOCKET_LIT,
  type BatonBead,
  type BatonState,
  batonBaseCol,
  batonFlip,
} from "./baton.js";
import { batonLandTick } from "./baton-bead.js";
import { batonSlow } from "./baton-slow.js";
import { MILLI, type World } from "./world.js";

/**
 * THE BATON's crossing: the merged bead's last flight, the design's step 13
 * (`docs/spec/bosses-choreographed.md` §10).
 *
 * Out of the last socket the merged bead does not cross one socket in three
 * beats; it crosses to the drop in `batonFinalBeats`, and every one of those
 * beats the pair owe it an act, in turn — his trigger sent it, so her shot
 * is due in the next beat, his trigger in the one after, and so on to the
 * end. Act `n` is due inside beat `n` of the crossing: the launch is act 0
 * in beat 0, and a beat that ends one act short is **the miss**, which puts
 * the bead back in the top socket of an arm whose every socket has grown
 * back. It is the same alternation the arm taught, at the tight cadence,
 * with nothing to land in between — the whole fight said once, without a
 * mistake. What the acts are is unchanged: the trigger is the trigger
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
  bead.final = true;
  batonAct(world, b);
  batonSlow(world, b);
}

/** An act made in turn: counted, and said. */
export function batonAct(world: World, b: BatonState): void {
  b.acts += 1;
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
 * One beat of the crossing. A beat that ended without its act is the miss;
 * the last beat, with every act made, is the drop.
 */
export function batonCrossBeat(world: World, b: BatonState, bead: BatonBead): void {
  const cfg = world.cfg;
  const due = world.beat - b.stageBeat;
  if (b.acts < due) {
    miss(world, b, bead);
    return;
  }
  if (world.tick >= batonLandTick(cfg, bead)) drop(world, b, bead);
}

/**
 * The bead goes back to the top socket and the arm grows every socket back
 * — the shed ones too, because what the design regrows is the arm and not
 * its rocks, which are on the field already. The handovers made stay made:
 * the turn stays tight, and the arm swings and sheds again as soon as the
 * bead has darkened as many sockets as it takes.
 */
function miss(world: World, b: BatonState, bead: BatonBead): void {
  const col = batonBaseCol(world.cfg);
  b.stage = "passing";
  b.stageBeat = world.beat;
  b.acts = 0;
  b.stillBeat = world.beat;
  b.col = col;
  for (let i = 0; i < b.sockets.length; i++) b.sockets[i] = BATON_SOCKET_LIT;
  b.threadBeat = -1;
  // And any shell that was coming away when the crossing began goes with them:
  // the socket under it is lit again, and a swell left pointing at a lit socket
  // would drop a shell off a part of the arm the bead has yet to pass
  // (`baton-shed.ts`).
  b.swellSocket = -1;
  b.swellBeat = -1;
  b.stripped = 0;
  bead.flying = false;
  bead.final = false;
  bead.flightTick = -1;
  bead.struck = false;
  bead.socket = 0;
  bead.satBeat = world.beat;
  bead.col = col;
  bead.fromCol = col;
  world.events.push({ type: "batonMissed", col, socket: 0 });
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
  b.sockets[bead.socket] = BATON_SOCKET_DARK;
  b.handovers += 1;
  b.beads = [];
  const id = world.nextId++;
  b.podId = id;
  world.pods.push({
    id,
    colMilli: bead.col * MILLI,
    rowMilli: cfg.batonSockets * MILLI,
    driftMilli: 0,
    loose: true,
    kind: "purge",
    // A bead is a real cargo. THE BATON's arm is beaten by taking it in.
    husk: false,
    crossMilli: 0,
  });
}
