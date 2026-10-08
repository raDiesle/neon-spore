import type { DragTarget, SceneCommand, SimConfig } from "@neon-spore/sim";
import type { SceneAct } from "./scene-act-types.js";
import { tautMilli } from "./scene-drag-taut.js";
import { pumpCommands } from "./scene-pump.js";
import { actCol } from "./scene-script.js";
import { ringCommands } from "./scene-turn.js";

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
 * **How far a handle goes is `scene-drag-taut.ts`'s**, one number per handle.
 * **A handle that is turned is `scene-turn.ts`'s** — THE CLAW's crank, which a
 * film authors as a press rather than a drag, so nothing here meets one.
 */

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
    target !== "mazeString" &&
    target !== "gripBody" &&
    target !== "choirLeft" &&
    target !== "choirRight" &&
    target !== "balloonLeft" &&
    target !== "balloonRight" &&
    target !== "trapezePushLeft" &&
    target !== "trapezePushRight"
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
/** The handles that go round rather than along (`scene-turn.ts`). */
const TURNED: ReadonlySet<DragTarget> = new Set(["gimbalOuter", "gimbalInner", "haspWheel"]);

/** The handles only the navigator's thumb moves. */
const NAVIGATORS: ReadonlySet<DragTarget> = new Set([
  "balloonRight",
  "sinewRight",
  "gimbalInner",
  "haspWheel",
  "ratchetCatch",
  "throatAim",
  // THE LATCH's right grip is the navigator's, the left the pilot's, in every
  // level but a `cross` (`sim/latch.ts`), which a film writes `hand` for.
  "latchGripRight",
]);

export function dragSeat(target: DragTarget, hand?: 1 | 2): 1 | 2 {
  // THE SURGE's bulb is the one handle both seats hold, so the target cannot
  // say and the act does (`SceneAct.hand`); the pilot's when it does not.
  // THE HIVE's lobe is the other: the pilot's haul on a clenched mass, or the
  // navigator's pinch on a swelling site (`sim/hive-hand.ts`); THE UNDERTOW's tap is either's.
  if (target === "surgeBulb" || target === "hiveLobe" || target === "undertowTap") return hand ?? 1;
  // THE SCOUT's two are each one seat's, but the seats swap every arena
  // (`scoutPilot`), so a film about its second level writes the hand: the
  // line is the navigator's and the prime the pilot's when it does not.
  if (target === "scoutLine") return hand ?? 2;
  if (target === "scoutPrime") return hand ?? 1;
  // THE ANTIPHON's rail is the chooser's, and the chooser swaps every level
  // (`antiphonChooser`): the navigator's on the first.
  if (target === "antiphonRail") return hand ?? 2;
  // THE TRAPEZE's two zones are the pilot's on the left and the navigator's
  // on the right in a `push` level, and either's in a `call` level, drawn by
  // chance (`sim/trapeze-hand.ts`); its lock is the pilot's.
  if (target === "trapezePushLeft" || target === "trapezeLock") return hand ?? 1;
  if (target === "trapezePushRight") return hand ?? 2;
  // And THE SINEW's right handle, the second: one handle per seat, each
  // pulled down, and the sum is the two of them (`sim/sinew-hand.ts`).
  // THE GIMBAL's inner ring, THE HASP's wheel and THE RATCHET's catch are the
  // navigator's, by geometry and by the design (`sim/gimbal-hand.ts`,
  // `sim/hasp-hand.ts`, `sim/ratchet-hand.ts`), and so is THE THROAT's mouth
  // (`sim/throat-hand.ts`).
  return NAVIGATORS.has(target) ? 2 : 1;
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
  const player = dragSeat(target, act.hand);
  // A ring or a wheel is turned, not carried: a bearing, not a distance.
  if (TURNED.has(target)) return ringCommands(act, player, cfg);
  // THE UNDERTOW's tap is a press with nothing carried: one down, one up, and
  // the lobe it is on found by the runner (`sim/scene-aim.ts`). THE TRAPEZE's
  // lock is the same press on the alien.
  if (target === "undertowTap" || target === "trapezeLock") {
    const tap = { kind: "drag", target, fromMilli: 0, fromYMilli: 0 } as const;
    return [
      { tick: act.tick, player, command: { ...tap, on: true } },
      { tick: act.until ?? act.tick + 1, player, command: { ...tap, on: false } },
    ];
  }
  // A pump is stroked back and forth, not carried (`scene-pump.ts`).
  if (target === "throatPump") return pumpCommands(act, player, cfg);
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
    // A prime and THE TRAPEZE's swipes are read on the letting go, by how far
    // the thumb had travelled (`sim/scout-hand.ts`, `sim/trapeze-hand.ts`), so
    // they let go where they got to.
    command: {
      kind: "drag",
      target,
      on: false,
      ...carry(target, LIFT_READ.has(target) ? to : 0),
    },
  });
  return out;
}

/** The handles read on the letting go, by how far the thumb had travelled. */
const LIFT_READ: ReadonlySet<DragTarget> = new Set([
  "scoutPrime",
  "trapezePushLeft",
  "trapezePushRight",
]);

/** How many messages one carry is spelled in. Enough that the plates are seen
 * parting rather than found apart, and few enough to stay a gesture. */
const PULL_STEPS = 6;

/** One distance, on the axis this handle is carried along. */
function carry(target: DragTarget, milli: number): { fromMilli: number; fromYMilli: number } {
  return pullsDown(target)
    ? { fromMilli: 0, fromYMilli: milli }
    : { fromMilli: milli, fromYMilli: 0 };
}
