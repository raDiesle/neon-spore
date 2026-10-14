import {
  lidCordFromMilli,
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
 * The pilot's thumb on THE LID's cord, carried `milli` along the way the cord
 * runs (`sim/lid-way.ts`) **and laid on its bow** (`sim/lid-bow.ts`): the cord
 * bends, and a thumb pulled straight along its way strays off and drops it.
 *
 * One of these is a hand that stays down: the pull is kept on the body until it
 * is let go, so a pose sends it once and the thing it opened stays open for the
 * length of the replay (`sim/lid.ts`).
 */
export const pullCord = (w: World, tick: number, id: number, milli: number): TimedCommand => {
  const body = w.creatures.find((c) => c.id === id && c.kind === "lid");
  const at =
    body === undefined ? { fromMilli: 0, fromYMilli: milli } : lidCordFromMilli(w.cfg, body, milli);
  return { tick, player: 1, command: { kind: "drag", target: "lidString", on: true, ...at, id } };
};
/**
 * The pilot's thumb on THE WARDEN's rope, carried `milli` of taut **along its
 * bow** (`sim/warden-bow.ts`): the rope is not a cord that runs straight
 * down, and a thumb pulled straight down it strays off and drops it.
 */
export const pullRope = (w: World, tick: number, id: number, milli: number): TimedCommand => {
  const b = w.boss;
  const at =
    b?.kind === "warden"
      ? wardenRopeFromMilli(w.cfg, b, milli)
      : { fromMilli: 0, fromYMilli: milli };
  return {
    tick,
    player: 1,
    command: { kind: "drag", target: "wardenTether", on: true, ...at, id },
  };
};
export const hold = (tick: number, player: 1 | 2, id: number): TimedCommand => ({
  tick,
  player,
  command: { kind: "grip", id },
});
