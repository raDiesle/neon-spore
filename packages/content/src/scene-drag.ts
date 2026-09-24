import type { DragTarget, SceneCommand, SimConfig } from "@neon-spore/sim";
import type { SceneAct } from "./scene-act-types.js";
import { actCol } from "./scene-script.js";
import { ringCommands, turnsRound } from "./scene-turn.js";

/**
 * **A hand carrying a handle**, turned into the stream of `drag` messages a
 * rehearsal's runner sends — how far, along which axis, and in how many steps.
 *
 * Cut off `scene-script.ts` when that file went over its 250-line limit, along
 * the seam it already had a heading at. Next door is what a *press* is, which
 * is one command and at most one release; this is the one act that is a dozen,
 * and the only one that has to know anything about the handles themselves —
 * how far each of them goes, and which way.
 *
 * **A handle that is turned is `scene-turn.ts`'s**, and a carry stops at the
 * door: a bearing has no destination and no axis, so nothing below it has an
 * answer for one. `dragCommands` hands those straight over.
 */

/**
 * How far a handle is carried when the film does not say: as far as it goes.
 *
 * The three numbers are the simulation's own, and are read off the config
 * rather than repeated here — `packages/sim/test/purity.test.ts` exists to
 * catch exactly the second copy this would otherwise be.
 */
function tautMilli(target: DragTarget, cfg: SimConfig): number {
  if (target === "lidString") return cfg.lidTautMilli;
  if (target === "wardenTether") return cfg.wardenTautMilli;
  // A held body has no taut at all — it is carried a tile at a time and may be
  // carried again — so what a film that does not say means is one column.
  if (target === "gripBody") return cfg.gripPushMilli;
  // An arrow has no taut either: it does not travel, it is a switch a hand
  // throws, and the distance is the one that counts as thrown
  // (`choirArrowHeard`). The side is read off the target rather than authored —
  // carrying one the wrong way is a thing the *pair* can do and not a thing a
  // film would be written to do.
  if (target === "choirLeft") return -cfg.choirPullMilli;
  if (target === "choirRight") return cfg.choirPullMilli;
  // A balloon's two handles are the arrows' arrangement again, with a body
  // between them: each is carried **outward**, away from the skin, and taut is
  // the stretch at which it gives (`sim/balloon-pull.ts`). The sign is the
  // side, so a film says which handle and never how far.
  if (target === "balloonLeft") return -cfg.balloonTautMilli;
  if (target === "balloonRight") return cfg.balloonTautMilli;
  // THE SINEW's two are pulled down as far as a hand reaches, and a film
  // about this boss almost never wants that: the sum of the two pulls has to
  // land inside a zone, so a page writes `toMilli` for each hand. Left out,
  // it is one hand at the band's limit — the last fibre's own number.
  if (target === "sinewLeft" || target === "sinewRight") return cfg.sinewReachMilli;
  // THE SURGE's bulb is not carried at all: a thumb on the glass charges it
  // and the lift is the gesture (`sim/surge-hand.ts` reads neither distance).
  if (target === "surgeBulb") return 0;
  // THE CANDLE's wick is a pull with a bottom to it: the flame is off the
  // wick at `candlePinchMilli` and not a thousandth before
  // (`sim/candle-hand.ts`), so a film that does not say means all the way
  // down — there is no half-pull that does anything.
  if (target === "candleWick") return cfg.candlePinchMilli;
  // THE CURTAIN's hem is the same pull turned over: it is carried **up**, and
  // the gap over the core opens at `curtainLiftMilli` and not a thousandth
  // before (`sim/curtain-hand.ts`). The sign is the direction, so a film that
  // does not say means all the way to the top — and a film that wrote this
  // number positive would be a hand pulling the hem down over the core it is
  // meant to be baring.
  if (target === "curtainHem") return -cfg.curtainLiftMilli;
  // THE HIVE's underside is hauled **down**, and the mass relaxes the
  // thousandth it has come far enough (`sim/hive-hand.ts`); the carry is
  // cumulative from the grab and the deepest it reached is what counts, so a
  // film that does not say means the whole haul. The same handle in the
  // navigator's hand (`hand: 2`) is a pinch on one lobe, which reads no
  // distance at all and is carried this far for nothing.
  if (target === "hiveLobe") return cfg.hiveHaulMilli;
  // THE SPOOL's brake is a depth rather than a distance to anywhere
  // (`sim/spool-hand.ts`), so a film about it writes `toMilli` every time; left
  // out, it is the whole reach, which is the slowest the line runs.
  if (target === "spoolBrake") return cfg.spoolReachMilli;
  return cfg.mazeTurnMilli;
}

/**
 * Which way a handle is carried.
 *
 * **Down**, for the two that are pulled: a pull is clamped to stay on the
 * field (`sim/handle-pull.ts`), and down is the one direction the field always
 * has room for from where a cord or a rope hangs. Carried sideways by the same
 * distance, a lid in the third column runs out of field and is clipped short
 * of taut — the plates then never part, which is a film that shows the gesture
 * and not the point of it.
 *
 * **Across**, for the ones that are not pulled at all: a wheel is turned by the
 * x of the hand and nothing else (`sim/maze-controls.ts`), a held body is
 * carried into a *column* (`sim/grip-push.ts`), and an arrow is carried
 * **outward** off its own edge — the sign of `fromMilli` and nothing else.
 */
function pullsDown(target: DragTarget): boolean {
  return (
    // And never a ring, which is the one handle that is not carried anywhere at
    // all: it is turned, and this predicate answered `true` for it for a day —
    // a film would have sent a stream of downward pixels at a control reading
    // thousandths of a turn, which does not throw and does not show
    // (`scene-turn.ts`, and `docs/queue.md` for how it was found).
    !turnsRound(target) &&
    target !== "mazeString" &&
    target !== "gripBody" &&
    target !== "choirLeft" &&
    target !== "choirRight" &&
    target !== "balloonLeft" &&
    target !== "balloonRight"
  );
}

/**
 * A hand on a cord, carried and let go.
 *
 * **It travels rather than jumping.** A single command at the taut distance
 * would be a hand that teleported, and the whole of what a page about a handle
 * has to show is the carrying: the plates parting, the hatch coming up. So the
 * pull is a handful of commands from the grab to the far end, which is also
 * what a real thumb sends — a `drag` is cumulative from the grab, so each one
 * supersedes the last and a film that drops one heals itself
 * (`sim/command-types.ts`).
 *
 * The seat is not authored, and for every handle but one it is the pilot's:
 * the navigator carries both colours and fires, so a handle either of them
 * could reach would be a round one phone could play (`render/handles.ts`).
 * **A balloon's right handle is the exception and is the whole creature** —
 * one body with a handle on each side, one hand from each phone, and the skin
 * gives only when both are taut at the same instant (`sim/balloon-pull.ts`
 * refuses a side that is not the seat that sent it) — and THE SINEW's right
 * handle is the same arrangement on a boss. So the seat is read off
 * the target here, the way a press reads its seat off `ControlDef.player`,
 * rather than being a field a film could get wrong.
 */
export function dragSeat(target: DragTarget, hand?: 1 | 2): 1 | 2 {
  // THE SURGE's bulb is the one handle both seats hold, so the target cannot
  // say and the act does (`SceneAct.hand`); the pilot's when it does not.
  // THE HIVE's lobe is the other: the pilot's haul on a clenched mass, or the
  // navigator's pinch on a swelling site (`sim/hive-hand.ts`).
  if (target === "surgeBulb" || target === "hiveLobe") return hand ?? 1;
  // And THE SINEW's right handle, the second: one handle per seat, each
  // pulled down, and the sum is the two of them (`sim/sinew-hand.ts`).
  return target === "balloonRight" || target === "sinewRight" ? 2 : 1;
}

/**
 * Whether the runner has to find this handle's body at the moment the hand
 * goes down.
 *
 * The two that hang off an ordinary arrival: a lid's cord and a balloon's two
 * handles. A wave may send three of either down at once, so the grab has to
 * say *which*, by an id no author can know — and the column is the thing they
 * do know, because it is the thing they wrote the arrival in. A maze has one
 * string and a warden one rope, so neither needs it.
 */
function byColumn(target: DragTarget): boolean {
  return target === "lidString" || target === "balloonLeft" || target === "balloonRight";
}

export function dragCommands(act: SceneAct, cfg: SimConfig): SceneCommand[] {
  const target = act.drag as DragTarget;
  // A ring is turned, and everything below this line is about a distance and
  // an axis (`scene-turn.ts`).
  if (turnsRound(target)) return ringCommands(act, cfg);
  const player = dragSeat(target, act.hand);
  const to = act.toMilli ?? tautMilli(target, cfg) * (act.dir ?? 1);
  const until = act.until ?? act.tick;
  // The carry and the letting go are two clocks, not one. A film about a lid
  // has to fire *while* the cord is held — the plates shut the instant it is
  // released — so the hand reaches the end of its travel at `by` and stays
  // there until `until`. Absent, they are the same tick, which is a hand that
  // carries and immediately lets go.
  const span = Math.max(1, (act.by ?? until) - act.tick);
  const steps = Math.max(1, Math.min(PULL_STEPS, span));
  const out: SceneCommand[] = [];
  for (let i = 0; i < steps; i++) {
    const at = act.tick + Math.round((span * i) / steps);
    out.push({
      tick: at,
      player,
      command: {
        kind: "drag",
        target,
        on: true,
        ...carry(target, Math.round((to * i) / (steps - 1 || 1))),
      },
      // Every one of them, not only the grab: a lid may have fallen a row
      // between two of these, and the id is the address of the cord rather
      // than of where it was.
      // A held body needs no column: it is named by the hand that is already
      // on it, which is the only address that survives the body being carried
      // out of the column it was found in (`sim/scene-aim.ts`).
      ...(byColumn(target) ? { dragCol: actCol(act, cfg.cols) } : {}),
    });
  }
  out.push({
    tick: until,
    player,
    command: { kind: "drag", target, on: false, ...carry(target, 0) },
  });
  return out;
}

/** How many messages one carry is spelled in. Enough that the plates are seen
 * parting rather than found apart, and few enough to stay a gesture. */
const PULL_STEPS = 6;

/** One distance, on the axis this handle is carried along. */
function carry(target: DragTarget, milli: number): { fromMilli: number; fromYMilli: number } {
  return pullsDown(target)
    ? { fromMilli: 0, fromYMilli: milli }
    : { fromMilli: milli, fromYMilli: 0 };
}
