import {
  type DragTarget,
  type TimedCommand,
  type World,
  wardenRopeFromMilli,
} from "@neon-spore/sim";

/**
 * **The commands a pose presses, spelled short.** A pose is mostly a list of
 * these, and the list of builders gains one for every verb a new pose has to
 * press — which is why they are a file of their own and not the tail of
 * `pose-kit.ts`: that file is the apparatus, a world put into one named
 * state, and it had one line left. The kit re-exports every one of these,
 * so a pose still imports from the kit alone.
 */

/** Commands, spelled short — a pose is mostly a list of these. `prime` is player 2's thumb on a colour: down fills the cannon lobe, up is the ordinary shot (`sim/lance.ts`). */
export const aim = (tick: number, col: number): TimedCommand => ({
  tick,
  player: 1,
  command: { kind: "cannonCol", col },
});
export const ward = (tick: number, col: number): TimedCommand => ({
  tick,
  player: 2,
  command: { kind: "shieldCol", col },
});
export const guard = (tick: number): TimedCommand => ({
  tick,
  player: 1,
  command: { kind: "guard" },
});
export const suck = (tick: number): TimedCommand => ({
  tick,
  player: 1,
  command: { kind: "intake" },
});
export const prime = (tick: number, on: boolean, color: "red" | "cyan" = "red"): TimedCommand => ({
  tick,
  player: 2,
  command: { kind: "prime", on, color },
});
export const shoot = (tick: number, color: "red" | "cyan"): TimedCommand => ({
  tick,
  player: 2,
  command: { kind: "fire", color },
});
/**
 * The pilot's thumb on a hanging cord, dragged `milli` thousandths of a tile
 * **down the field** from where it grabbed.
 *
 * One of these is a hand that stays down: the pull is kept on the body until it
 * is let go, so a pose sends it once and the thing it opened stays open for the
 * length of the replay (`sim/lid.ts`).
 *
 * Downward and not sideways, and that is the whole reason this is a helper
 * rather than a literal at each pose. The cord runs one way, the first the
 * field holds the whole of (`sim/lid-way.ts`), and that is down for a lid
 * with room under it — which is also where a thumb actually goes. A sideways
 * pull along a cord that runs down counts nothing.
 */
export const pullCord = (
  tick: number,
  id: number,
  milli: number,
  target: DragTarget = "lidString",
): TimedCommand => ({
  tick,
  player: 1,
  command: { kind: "drag", target, on: true, fromMilli: 0, fromYMilli: milli, id },
});
/**
 * The pilot's thumb on THE WARDEN's rope, carried `milli` of taut **along its
 * bow** (`sim/warden-bow.ts`): the rope is not a cord that runs straight
 * down, and a thumb pulled straight down it strays off and drops it.
 */
export const pullRope = (w: World, tick: number, id: number, milli: number): TimedCommand => {
  const b = w.boss;
  const at = b?.kind === "warden" ? wardenRopeFromMilli(w.cfg, b, milli) : null;
  const cmd = pullCord(tick, id, milli, "wardenTether");
  return at === null ? cmd : ({ ...cmd, command: { ...cmd.command, ...at } } as TimedCommand);
};
export const hold = (tick: number, player: 1 | 2, id: number): TimedCommand => ({
  tick,
  player,
  command: { kind: "grip", id },
});
