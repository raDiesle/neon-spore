import {
  BATON_SOCKET_DARK,
  BATON_SOCKET_LIT,
  BATON_SOCKET_SHED,
  type BatonState,
  batonBaseCol,
  batonDark,
  batonFlip,
  batonLandTick,
  batonSocketRow,
} from "./baton.js";
import { NO_SHELL } from "./shell.js";
import { MILLI, type World } from "./world.js";

/**
 * THE BATON's clock: the unfold, the landing, the settle, the shed and the
 * fold.
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

/** Install it from the wave's own `boss:` entry. There is nothing to author. */
export function installBaton(world: World): BatonState {
  const sockets: number[] = [];
  for (let i = 0; i < world.cfg.batonSockets; i++) sockets.push(BATON_SOCKET_LIT);
  return {
    kind: "baton",
    stage: "unfolding",
    stageBeat: world.beat,
    col: batonBaseCol(world.cfg),
    fromCol: batonBaseCol(world.cfg),
    sockets,
    socket: 0,
    flightTick: -1,
    struck: false,
    // Red first, and it alternates from there: the colour language teaches
    // the alternation for free (`docs/spec/bosses-choreographed.md` §10).
    color: "red",
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

/** Beats a sitting bead is given before the arm shakes it home. */
function turnBeats(world: World, b: BatonState): number {
  const cfg = world.cfg;
  return b.handovers >= cfg.batonTightenAfter ? cfg.batonTightTurnBeats : cfg.batonTurnBeats;
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
    if (since >= cfg.batonSockets) enter(world, b, "sitting");
    return;
  }
  shed(world, b);
  if (b.stage === "flying" && world.tick >= batonLandTick(cfg, b.flightTick)) land(world, b);
  else if (b.stage === "sitting" && since >= turnBeats(world, b)) settle(world, b);
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
function land(world: World, b: BatonState): void {
  const cfg = world.cfg;
  b.flightTick = -1;
  if (!b.struck) {
    b.col = b.fromCol;
    enter(world, b, "sitting");
    world.events.push({ type: "batonRelit", col: b.col, socket: b.socket });
    return;
  }
  b.sockets[b.socket] = BATON_SOCKET_DARK;
  b.socket += 1;
  b.handovers += 1;
  b.color = batonFlip(b.color);
  b.fromCol = b.col;
  world.events.push({ type: "batonLanded", col: b.col, socket: b.socket });
  if (b.socket < cfg.batonSockets) {
    enter(world, b, "sitting");
    return;
  }
  enter(world, b, "falling");
  const id = world.nextId++;
  b.podId = id;
  world.pods.push({
    id,
    colMilli: b.col * MILLI,
    rowMilli: cfg.batonSockets * MILLI,
    driftMilli: 0,
    loose: true,
    kind: "purge",
    crossMilli: 0,
  });
}

/** The arm shook a bead that sat too long back to the top socket. The dark sockets stay dark. */
function settle(world: World, b: BatonState): void {
  b.socket = 0;
  b.settles += 1;
  enter(world, b, "sitting");
  world.events.push({ type: "batonSettled", col: b.col, socket: 0 });
}

/**
 * A dead segment lets go: the topmost dark socket the bead is not sitting in
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
  const socket = b.sockets.findIndex((s, i) => s === BATON_SOCKET_DARK && i !== b.socket);
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
