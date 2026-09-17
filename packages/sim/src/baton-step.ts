import {
  BATON_SOCKET_DARK,
  BATON_SOCKET_LIT,
  BATON_SOCKET_SHED,
  type BatonBead,
  type BatonState,
  batonBaseCol,
  batonDark,
  batonFlip,
  batonLead,
  batonSocketRow,
  batonWaiting,
} from "./baton.js";
import { batonLandTick } from "./baton-bead.js";
import { batonMerge, batonTwin } from "./baton-pair.js";
import { NO_SHELL } from "./shell.js";
import { MILLI, type World } from "./world.js";

/**
 * THE BATON's clock: the unfold, the landing, the settle, the shed and the
 * fold. The second bead and the merge are next door in `baton-pair.ts`.
 *
 * Everything that changes a socket happens **on the beat** and from
 * `stepBoss`: a landing, a settle and a shed are all things the pair counts
 * to, and a bead that landed between two beats would land on a count nobody
 * said. The two things that happen on the **tick** are the two presses, and
 * they are next door in `baton-press.ts` — a launch arrives with player 1's
 * trigger and a strike with the bolt that reaches the bead, because a press
 * that waited for the next beat would put a queue between *going* and the
 * going.
 */

/** A bead at rest in `socket`, the colour it starts in. */
export function bead(world: World, socket: number, color: BatonBead["color"]): BatonBead {
  const col = batonBaseCol(world.cfg);
  return {
    flying: false,
    satBeat: world.beat,
    socket,
    flightTick: -1,
    struck: false,
    color,
    col,
    fromCol: col,
  };
}

/** Install it from the wave's own `boss:` entry. There is nothing to author. */
export function installBaton(world: World): BatonState {
  const sockets: number[] = [];
  for (let i = 0; i < world.cfg.batonSockets; i++) sockets.push(BATON_SOCKET_LIT);
  return {
    kind: "baton",
    stage: "unfolding",
    stageBeat: world.beat,
    col: batonBaseCol(world.cfg),
    sockets,
    // Red first, and it alternates from there: the colour language teaches
    // the alternation for free (`docs/spec/bosses-choreographed.md` §10).
    beads: [bead(world, 0, "red")],
    merged: false,
    stillBeat: world.beat,
    handovers: 0,
    settles: 0,
    lockUntil: [-1, -1],
    podId: -1,
    shedBeat: -1,
  };
}

/** The boss, if it is the one installed. Narrowing in one place rather than six. */
export function batonBoss(world: World): BatonState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "baton" ? boss : null;
}

function enter(world: World, b: BatonState, stage: BatonState["stage"]): void {
  b.stage = stage;
  b.stageBeat = world.beat;
}

/**
 * Beats a sitting bead is given before the arm shakes it home. Tight only
 * while there is one bead: two on one alternation are already a press every
 * beat, and a tight turn on top would shake one home while the other's
 * launch still has player 1 locked.
 */
function turnBeats(world: World, b: BatonState): number {
  const cfg = world.cfg;
  const tight = b.handovers >= cfg.batonTightenAfter && b.beads.length === 1;
  return tight ? cfg.batonTightTurnBeats : cfg.batonTurnBeats;
}

/** One beat of the arm. */
export function stepBaton(world: World, b: BatonState): void {
  const cfg = world.cfg;
  const since = world.beat - b.stageBeat;
  if (b.stage === "down") {
    // Nulled here rather than at the take, so the picture has the whole fold
    // to run before the wave is allowed to end under it (`bossHoldsWave`).
    if (since >= cfg.batonDownBeats) world.boss = null;
    return;
  }
  if (b.stage === "unfolding") {
    if (since >= cfg.batonSockets) {
      enter(world, b, "passing");
      b.stillBeat = world.beat;
      for (const bead of b.beads) bead.satBeat = world.beat;
    }
    return;
  }
  if (b.stage !== "passing") return;
  shed(world, b);
  for (const bead of [...b.beads])
    if (bead.flying && world.tick >= batonLandTick(cfg, bead.flightTick)) land(world, b, bead);
  if (b.stage === "passing" && !b.beads.some((bead) => bead.flying)) {
    const turn = turnBeats(world, b);
    for (const bead of b.beads) {
      if (batonWaiting(cfg, b, bead)) continue;
      if (world.beat - Math.max(bead.satBeat, b.stillBeat) >= turn) settle(world, b, bead);
    }
  }
  batonTwin(world, b);
  batonMerge(world, b);
}

/**
 * The bead comes down in the next socket, or back in the one it left.
 *
 * Struck, the socket it left goes dark for good, the bead wears the other
 * colour, and the handover counts. Out of the last socket there is nothing
 * to land in: the bead drops as a loose pod, and from here the fight is the
 * maw's (`pods.ts`, `batonBeadTaken`). Not struck, it lands where it was and
 * the socket relights — and if the arm had swung, it lands in the column it
 * left, because the arm swung *for* that flight and the flight did not take.
 */
function land(world: World, b: BatonState, bead: BatonBead): void {
  const cfg = world.cfg;
  bead.flying = false;
  bead.flightTick = -1;
  bead.satBeat = world.beat;
  b.stillBeat = world.beat;
  if (!bead.struck) {
    bead.col = bead.fromCol;
    b.col = batonLead(b)?.col ?? bead.col;
    world.events.push({ type: "batonRelit", col: bead.col, socket: bead.socket });
    return;
  }
  b.sockets[bead.socket] = BATON_SOCKET_DARK;
  bead.socket += 1;
  b.handovers += 1;
  bead.color = batonFlip(bead.color);
  bead.fromCol = bead.col;
  b.col = batonLead(b)?.col ?? bead.col;
  world.events.push({ type: "batonLanded", col: bead.col, socket: bead.socket });
  if (bead.socket < cfg.batonSockets) return;
  enter(world, b, "falling");
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

/**
 * The arm shook a bead that sat too long back to the top socket. The dark
 * sockets stay dark. A bead already in the top socket is left as it is,
 * clock and all: it has nowhere to go, and its clock is what ranks it
 * against the other bead for the trigger (`batonLaunchable`).
 */
function settle(world: World, b: BatonState, bead: BatonBead): void {
  if (bead.socket === 0) return;
  bead.socket = 0;
  bead.satBeat = world.beat;
  b.settles += 1;
  world.events.push({ type: "batonSettled", col: bead.col, socket: 0 });
}

/**
 * A dead segment lets go: the topmost dark socket no bead is sitting in
 * drops its shell down the arm's own column as a rock.
 *
 * This is the one thing on the page a boss puts on the field by itself, and
 * the ruling in `docs/spec/bosses-choreographed.md` asks it to say why the
 * wave's author cannot: the column is wherever the arm has swung to, the row
 * is whichever socket went dark first, and the beat is the one the pair's own
 * handovers reached the sixth dark socket on — three numbers decided during
 * the fight by the pair, and none of them writable in advance.
 */
function shed(world: World, b: BatonState): void {
  const cfg = world.cfg;
  if (batonDark(b) < cfg.batonShedAfter) return;
  if (b.shedBeat >= 0 && world.beat - b.shedBeat < cfg.batonShedBeats) return;
  const sat = (i: number): boolean => b.beads.some((bead) => !bead.flying && bead.socket === i);
  const socket = b.sockets.findIndex((s, i) => s === BATON_SOCKET_DARK && !sat(i));
  if (socket < 0) return;
  b.sockets[socket] = BATON_SOCKET_SHED;
  b.shedBeat = world.beat;
  const row = batonSocketRow(cfg, socket);
  world.creatures.push({
    id: world.nextId++,
    kind: "meteor",
    span: 1,
    col: b.col,
    row,
    fromRow: row,
    color: null,
    holes: 0,
    petals: 0,
    dragMilli: 0,
    shell: NO_SHELL,
  });
  world.events.push({ type: "batonShed", col: b.col, row });
}
