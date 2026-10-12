import type { SimConfig } from "./config.js";
import { hullRow, midCol } from "./config.js";
import {
  LAMPREY_BUTTONS,
  type LampreyButton,
  type LampreyState,
  type LampreyStep,
  lampreyAsks,
  lampreyHolder,
  lampreyStep,
  lampreyTailPull,
  lampreyWorker,
} from "./lamprey.js";
import { lampreyLeapTo, type Tile } from "./lamprey-leap.js";
import { lampreyTowTile } from "./lamprey-tow.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE LAMPREY's plug** (the owner, 10 October 2026: *in another level, the
 * worm bites inside the ship, e.g. tries to pull out the "suck" button by
 * biting it … it gets almost outside like an electrical button*).
 *
 * The eel comes down the middle of the field like a tow
 * (`lamprey-roam.ts`), but all the way: its head goes into the hull, and its
 * teeth close on a button of the worker's panel — the step's `button`, SUCK,
 * SHIELD, RED or CYAN — and pull it out of its socket, `lampreyPlugCreepMilli`
 * a beat from `lampreyPlugStartMilli`. **All the way out is the hull**, as a
 * stay run out is.
 *
 * **The worker pushes it back in**: each press of that button on their panel
 * is `lampreyPlugPushMilli` back toward the socket, and still does whatever
 * the button does. **In** (`lampreyPlugFlushMilli` or less), the teeth have
 * lost it: it creeps out no further, and **only then is the tail there** for
 * the holder (`lampreyTailOffered`) — straight up the field from the hull, an
 * `apart`'s pull. Pulled all the way, the eel comes out of the ship. So the
 * press is what brings the pull: the owner, 12 October 2026, of the pull that
 * used to wait on it and be thrown back if early — *this logic should just not
 * exist in game as its too difficult to understand. instead the player
 * presses, than the visual of pull appears - easy like that.*
 *
 * Every button bitten is kept (`plugs`), for the panel to leave it loose.
 */

/** The tile a plug bites from: the middle column, the head in the hull. */
export function lampreyPlugTile(cfg: SimConfig): Tile {
  return { col: midCol(cfg), row: hullRow(cfg) };
}

/** Whether a step is crawled down the middle of the field at the hull rather than leapt to: a `tow` or a `plug`. */
export function lampreyDescends(step: LampreyStep | undefined): boolean {
  return step?.ask === "tow" || step?.ask === "plug";
}

/** The tile a step crawled down at the hull ends on, or null for one that is leapt to. */
export function lampreyDownTile(cfg: SimConfig, step: LampreyStep | undefined): Tile | null {
  if (step?.ask === "tow") return lampreyTowTile(cfg);
  return step?.ask === "plug" ? lampreyPlugTile(cfg) : null;
}

/** The button the `plug` on is biting, or null with none on. */
export function lampreyPlugButton(s: LampreyState): LampreyButton | null {
  return lampreyAsks(s) === "plug" ? (lampreyStep(s)?.button ?? "intake") : null;
}

/** Whether the bitten button is in far enough for the tail to bring the eel out. */
export function lampreyPlugIn(cfg: SimConfig, s: LampreyState): boolean {
  return s.plugMilli <= cfg.lampreyPlugFlushMilli;
}

/**
 * Down in the hull: the tail laid straight up the field, the button bitten
 * part way out, and the next tile drawn from where the head comes out.
 */
export function lampreyPlugLand(
  world: World,
  s: LampreyState,
  step: LampreyStep,
  after: LampreyStep | undefined,
): void {
  const cfg = world.cfg;
  s.tailX = 0;
  s.tailY = -1000;
  s.plugMilli = cfg.lampreyPlugStartMilli;
  s.plugs.push(LAMPREY_BUTTONS.indexOf(step.button ?? "intake"));
  const out = { col: s.col, row: cfg.lampreyTowRow };
  const next = after === undefined ? null : lampreyLeapTo(world, s, out, after.jump, -1);
  s.nextCol = next?.col ?? -1;
  s.nextRow = next?.row ?? -1;
}

/** Whether the holder's tail is there to be taken: always, but in a plug only once the button is in. */
export function lampreyTailOffered(cfg: SimConfig, s: LampreyState): boolean {
  return lampreyAsks(s) !== "plug" || lampreyPlugIn(cfg, s);
}

/** A beat of the plug: the button pulled further out, unless it is in. True once it is torn out. */
export function lampreyPlugCreep(world: World, s: LampreyState): boolean {
  if (lampreyAsks(s) !== "plug" || lampreyPlugIn(world.cfg, s)) return false;
  s.plugMilli = Math.min(1000, s.plugMilli + world.cfg.lampreyPlugCreepMilli);
  return s.plugMilli >= 1000;
}

/** The panel button a command is a press of, or null: what SUCK, SHIELD, RED and CYAN send. */
export function lampreyButtonPressed(command: Command): LampreyButton | null {
  if (command.kind === "intake") return "intake";
  if (command.kind === "guard") return "guard";
  if (command.kind === "fire") return command.color === "red" ? "fireRed" : "fireCyan";
  if (command.kind === "prime" && command.on) {
    return command.color === "red" ? "fireRed" : "fireCyan";
  }
  return null;
}

/** A press from `player`: the bitten button pushed back in, if it is theirs. */
export function lampreyPlugPressed(
  world: World,
  s: LampreyState,
  player: 1 | 2,
  command: Command,
): void {
  const button = lampreyPlugButton(s);
  if (button === null || lampreyWorker(s) !== player) return;
  if (lampreyButtonPressed(command) !== button) return;
  s.plugMilli = Math.max(0, s.plugMilli - world.cfg.lampreyPlugPushMilli);
  const side: 0 | 1 = player === 1 ? 0 : 1;
  world.events.push({ type: "lampreyPush", side, out: s.plugMilli, col: s.col });
}

/** The tail pulled all the way in a plug, the button in: the eel to come out of the hull. */
export function lampreyPlugPulled(world: World, s: LampreyState): boolean {
  const cfg = world.cfg;
  if (lampreyHolder(s) === null || !lampreyPlugIn(cfg, s)) return false;
  if (lampreyTailPull(s) < cfg.lampreyTailPullMilli) return false;
  s.row = cfg.lampreyTowRow;
  return true;
}
