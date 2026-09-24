import {
  BATON_SOCKET_DARK,
  BATON_SOCKET_SHED,
  BATON_SOCKET_SWELL,
  type BatonState,
  batonDark,
  batonSocketRow,
} from "./baton.js";
import { NO_SHELL } from "./shell.js";
import type { World } from "./world.js";

/**
 * **THE BATON's arm giving way** — the swell, the shell that drops and the
 * rock it becomes. Split off `baton-step.ts` when the swell took that file
 * over its limit, along the seam its own header had already drawn: everything
 * else there is the bead's clock, and this is the arm's.
 *
 * The thumb that takes a swelling shell off clean is `baton-hand.ts`; it moves
 * `shedBeat` exactly as the drop below does, so a stripped shell and a fallen
 * one leave the arm on the same count.
 *
 * **Only `passing` asks this.** A shell caught half off by the draw waits
 * where it is — the arm is not passing anything and the pair has both thumbs
 * on the beads — and drops on the count it was going to once the arm passes
 * again; a crossing that misses relights the arm and takes the shell with it
 * (`baton-cross.ts`).
 */

/**
 * A dead segment begins to let go: the topmost dark socket no bead is sitting
 * in swells, and `batonSwellBeats` later its shell drops down the arm's own
 * column as a rock — unless the seat the beat has locked out takes it off
 * clean first (`baton-hand.ts`).
 *
 * This is the one thing on the page a boss puts on the field by itself, and
 * the ruling in `docs/spec/bosses-choreographed.md` asks it to say why the
 * wave's author cannot: the column is wherever the arm has swung to, the row
 * is whichever socket went dark first, and the beat is the one the pair's own
 * handovers reached the sixth dark socket on — three numbers decided during
 * the fight by the pair, and none of them writable in advance.
 *
 * **The swell is carved out of the interval and not added to it.** The next
 * one begins `batonShedBeats - batonSwellBeats` after the last shell left, so
 * a pair who never reach for the arm meet the same rocks on the same counts
 * they always did; what the window buys is a shell that need not fall at all.
 */
export function stepBatonShed(world: World, b: BatonState): void {
  const cfg = world.cfg;
  if (batonDark(b) < cfg.batonShedAfter) return;
  if (b.swellSocket >= 0) {
    // A bead shaken home into it in the meantime changes nothing: the shell is
    // the socket's and not the bead's, and this arm already stands beads in
    // sockets whose shells are gone (`settle`).
    if (world.beat - b.swellBeat >= cfg.batonSwellBeats) letGo(world, b, b.swellSocket);
    return;
  }
  const sat = (i: number): boolean => b.beads.some((bead) => !bead.flying && bead.socket === i);
  if (b.shedBeat >= 0 && world.beat - b.shedBeat < cfg.batonShedBeats - cfg.batonSwellBeats) return;
  const socket = b.sockets.findIndex((s, i) => s === BATON_SOCKET_DARK && !sat(i));
  if (socket < 0) return;
  b.sockets[socket] = BATON_SOCKET_SWELL;
  b.swellSocket = socket;
  b.swellBeat = world.beat;
  b.stripped = 0;
  b.stripThumbs = 0;
  world.events.push({ type: "batonSwell", col: b.col, socket });
}

/** The shell nobody took: off the arm and down its column as a rock. */
function letGo(world: World, b: BatonState, socket: number): void {
  const cfg = world.cfg;
  b.sockets[socket] = BATON_SOCKET_SHED;
  b.swellSocket = -1;
  b.swellBeat = -1;
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
