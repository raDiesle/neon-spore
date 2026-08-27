import {
  hitSlab,
  interludeControls,
  type Layout,
  type Stage,
  type ViewRole,
} from "@neon-spore/render";
import {
  type InterludeEntry,
  interludeDue,
  interludeHolds,
  startInterlude,
  type World,
} from "@neon-spore/sim";
import type { InputBuffer } from "./input.js";

/**
 * The host's half of an interlude: which gap carries one, and the two thumbs
 * that play it.
 *
 * **Where the gap table belongs, and why it is here.** Which interlude sits in
 * which gap is content's — `docs/spec/interludes.md` says so, and it is the
 * same call `buildQueue` makes for a wave. It is in `apps/game` for one turn
 * only because this lane could add no new file under `packages/content`; the
 * shape is already right, so moving it is a `git mv` and an export, and the
 * second interlude is the session that should do it.
 *
 * **Nine gaps, one filled.** Ten acts is nine gaps between them
 * (`docs/spec/interludes.md`), which is more interludes than anybody should
 * build and exactly the right number of slots to have. A table rather than
 * arithmetic over the act length: eleven more rounds are coming and each of
 * them is a decision about *which gap*, not a formula.
 */
const GAPS: Record<number, InterludeEntry> = {
  10: { kind: "gauge" },
};

/**
 * The third thing a `needWave` can mean. `waves.ts` asks this first, and only
 * builds a wave if the answer is no — which is the whole seam an interlude
 * enters through, and it is deliberately the same one a wave enters through.
 *
 * The order it produces is the one THE FORK already argues for: the pair
 * commits with both thumbs, then the round between the acts, then the wave and
 * its card. Nothing arranges that; it falls out of a fork being the only way a
 * `needWave` reaches here between two waves.
 */
export function enterInterludeIfDue(world: World, wave: number): boolean {
  if (!interludeDue(world, wave)) return false;
  const entry = GAPS[wave];
  if (entry === undefined) return false;
  startInterlude(world, entry, wave);
  // `startInterlude` refuses when the switch is off, so this is the answer to
  // "did one actually open", never to "was one wanted".
  return interludeHolds(world);
}

/**
 * Open one now, in front of the wave that is running. For the test build and
 * for a headless check: nine gaps into a run is a long way to press for a
 * round that lasts ninety seconds, and the thing worth looking at is that the
 * field comes back afterwards with the run's hull, scars and score untouched.
 */
export function enterInterlude(world: World): void {
  startInterlude(world, { kind: "gauge" }, world.wave);
}

export interface InterludeBinding {
  canvas: HTMLCanvasElement;
  buffer: InputBuffer;
  world: World;
  layout: () => Layout;
  stage: () => Stage;
  role: () => ViewRole;
}

/**
 * The round's own thumbs. A second listener on the same canvas, exactly as the
 * briefing card has one: the presses underneath are not control presses, the
 * simulation refuses everything but these two while a round is up, and
 * whatever `bindControls` makes of the same touch is dropped before it reaches
 * the ship.
 *
 * The valve is **held**, so it needs the pointer up as well — nothing in the
 * simulation lets go of it on its own, the same contract the lance has. The
 * call is a press and nothing else.
 *
 * Both halves are pushed with the seat they belong to whatever this device is
 * showing. In a room the lockstep scheduler drops the half this device is not
 * sitting in; alone, one person plays both, which is the test view.
 */
export function bindInterlude({
  canvas,
  buffer,
  world,
  layout,
  stage,
  role,
}: InterludeBinding): void {
  /** Pointers currently holding a valve, and which way each pushes. */
  const turning = new Map<number, -1 | 1>();

  const at = (e: PointerEvent): { x: number; y: number } | null => {
    const s = stage();
    const x = e.clientX - s.left;
    const y = e.clientY - s.top;
    if (x < 0 || y < 0 || x > s.width || y > s.height) return null;
    return { x, y };
  };

  const release = (id: number): void => {
    const dir = turning.get(id);
    if (dir === undefined) return;
    turning.delete(id);
    buffer.push(1, { kind: "valve", on: false, dir });
  };

  canvas.addEventListener("pointerdown", (e) => {
    if (!interludeHolds(world)) return;
    const p = at(e);
    if (!p) return;
    const controls = interludeControls(layout(), role());
    if (controls.down && hitSlab(controls.down, p.x, p.y)) {
      turning.set(e.pointerId, -1);
      buffer.push(1, { kind: "valve", on: true, dir: -1 });
      return;
    }
    if (controls.up && hitSlab(controls.up, p.x, p.y)) {
      turning.set(e.pointerId, 1);
      buffer.push(1, { kind: "valve", on: true, dir: 1 });
      return;
    }
    if (controls.call && hitSlab(controls.call, p.x, p.y)) buffer.push(2, { kind: "call" });
  });

  // A thumb that slid off the slab is a thumb that stopped turning. Without
  // this the needle would keep travelling while the finger sat somewhere else
  // on the screen, which is the one way a held control can lie.
  canvas.addEventListener("pointermove", (e) => {
    const dir = turning.get(e.pointerId);
    if (dir === undefined) return;
    const p = at(e);
    const controls = interludeControls(layout(), role());
    const slab = dir < 0 ? controls.down : controls.up;
    if (!p || !slab || !hitSlab(slab, p.x, p.y)) release(e.pointerId);
  });
  canvas.addEventListener("pointerup", (e) => release(e.pointerId));
  canvas.addEventListener("pointercancel", (e) => release(e.pointerId));
}
