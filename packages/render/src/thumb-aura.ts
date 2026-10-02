import { failHolds } from "@neon-spore/sim";
import type { GripVerdict } from "./grip-verdict.js";
import type { Layout } from "./layout.js";
import { type MarkSpot, marksDrawn, marksOnStage, nearestMark } from "./mark-spots.js";
import type { ViewState } from "./renderer.js";
import { AURA_ONSET_SECONDS, auraRadius, drawAuraRing, FLASH_SECONDS } from "./thumb-aura-ring.js";
import type { Touch } from "./touch-hold.js";

/**
 * **The ring round a boss's mark while this device's own thumb holds it.**
 * The owner, 2 October 2026, generic: *when there is hold or push on screen
 * gesture … you cannot see the progress circle with its colour because your
 * thumb is below. so some feedback, maybe around the circle like a green blur
 * beat … and if interrupted or wrong gesture done on the circle to be red. …
 * when starting to press it grows bigger and bigger first quick and then very
 * slow, so people see that something is still ongoing.* And on the first cut,
 * which ringed the finger a tile and more wide: *it should slowly grow exactly
 * green circle where center is the red circle. the current green is too big.*
 *
 * So the ring is round **the mark**, not the finger, and sized by it:
 *
 * - **it is centred on the mark** the thumb came down on, found among the
 *   marks drawn this frame (`mark-spots.ts`) and followed as the boss moves
 *   it; a press on no mark drawn keeps a small ring on the finger;
 * - **it grows** from just outside the mark, quickly and then slowly
 *   (`auraRadius`), so a hold still running is a ring still opening;
 * - **it beats green** on the wave's beat while the thumb is down;
 * - **it goes red** when the mark is judged wrong — the wrong thumb, the
 *   wrong gesture, a hold let go too early — and stops growing; it flashes
 *   brighter green when it is judged right. Both are the mark's own verdict
 *   (`grip-verdict.ts`), never this file's guess.
 *
 * It starts white for `AURA_ONSET_SECONDS`, the time a press takes to reach
 * the simulation and come back judged across a link, so a refused thumb goes
 * from *got you* to red rather than from green to red. A thumb lifted leaves
 * its ring fading for `AURA_LINGER_SECONDS`, which is when a hold let go too
 * early is told so.
 *
 * Per device and never shared, like `ViewState.hand`: the thumbs are the
 * host's, kept with the other per-finger counts (`fingers.ts`), and nothing
 * here reaches the world.
 */

/** A finger down on a boss's mark, in stage coordinates. */
export interface Thumb {
  id: number;
  x: number;
  y: number;
}

/**
 * Whether the finger behind this press wears the ring: a press on something
 * a boss put up to be taken hold of — every mark, lobe, handle and crank is a
 * `drag` (`touch-hold.ts`). **The command counts as well as the hold**: a
 * thumb on the partner's mark sends its drag and keeps no hold, because the
 * simulation refuses it (`instar-mark-grip.ts`), and that is the very press
 * whose ring has to go red. The cannon, the shield and the band's lobes
 * already show what they are doing by being under the finger, and keep their
 * own ring (`touch-ship.ts`).
 */
export function auraTouch(t: Pick<Touch, "command" | "hold">): boolean {
  return t.hold?.kind === "drag" || t.command?.kind === "drag";
}

export { AURA_ONSET_SECONDS, auraRadius } from "./thumb-aura-ring.js";
/** How long a lifted thumb's ring takes to fade, in seconds. */
export const AURA_LINGER_SECONDS = 0.5;

/** What a frame hands the rings: `ViewState`'s part of it. */
type AuraView = Pick<ViewState, "world" | "thumbs" | "dt" | "beatPhase">;

interface Aura {
  /** The finger, while it is down. */
  fx: number;
  fy: number;
  /** The ring's centre: the mark's, once one is found, else the finger's. */
  x: number;
  y: number;
  /** The mark's radius when it was found, or null while none has been. */
  r: number | null;
  /** Seconds since the press. */
  age: number;
  /** Seconds since the lift, or null while the thumb is down. */
  lifted: number | null;
  /** The radius, in the mark's radii, the ring stopped at when it went red. */
  stopped: number | null;
  /** Seconds since the last verdict on it, and which way it went. */
  flash: { age: number; good: boolean } | null;
  /** The verdict already taken, so one verdict is taken once. */
  taken: GripVerdict | null;
}

export class ThumbAuras {
  private readonly auras = new Map<number, Aura>();
  /**
   * Fingers still down from a run that has ended: a thumb held through a lost
   * wave and its restart is holding nothing in the new one, and gets no ring
   * until it is lifted and pressed again.
   */
  private readonly spent = new Set<number>();

  /**
   * The whole of a frame's part, last of the frame: the thumbs moved, the
   * marks drawn since `watchMarks` read, and the rings put down over
   * everything — a ring under the band would be under the thumb again.
   *
   * None once the wave is lost or over: a thumb still down when the hit
   * landed is holding nothing, and its ring is not drawn over the field held
   * still under the lost screen, nor over the screen (`failHolds`).
   */
  frame(ctx: CanvasRenderingContext2D, l: Layout, view: AuraView): void {
    const spots = marksOnStage(marksDrawn(ctx), ctx.getTransform());
    if (view.world.over || failHolds(view.world)) {
      this.clear();
      return;
    }
    this.update(view.thumbs, view.dt);
    this.anchor(spots, l);
    this.judge(spots, l);
    this.draw(ctx, l, view.beatPhase);
  }

  /** This frame's thumbs. A thumb not in it any more has been lifted. */
  update(thumbs: readonly Thumb[] | undefined, dt: number): void {
    const down = new Set<number>();
    const now = new Set((thumbs ?? []).map((t) => t.id));
    for (const id of this.spent) if (!now.has(id)) this.spent.delete(id);
    for (const t of thumbs ?? []) {
      if (this.spent.has(t.id)) continue;
      down.add(t.id);
      const a = this.auras.get(t.id);
      if (a === undefined || a.lifted !== null) {
        this.auras.set(t.id, fresh(t));
        continue;
      }
      a.fx = t.x;
      a.fy = t.y;
      if (a.r === null) {
        a.x = t.x;
        a.y = t.y;
      }
    }
    for (const [id, a] of this.auras) {
      a.age += dt;
      if (a.flash !== null) a.flash.age += dt;
      if (!down.has(id) && a.lifted === null) a.lifted = 0;
      else if (a.lifted !== null) a.lifted += dt;
      if (a.lifted !== null && a.lifted >= AURA_LINGER_SECONDS) this.auras.delete(id);
    }
  }

  /**
   * Each ring onto its mark, among the marks drawn this frame in the stage's
   * frame: first the one nearest the finger, within a thumb's reach of it;
   * after that the one nearest where the ring is, so it follows a mark the
   * boss carries. Its radius is kept from the first, so a mark that breathes
   * does not shake the ring.
   */
  anchor(spots: readonly MarkSpot[], l: Layout): void {
    for (const a of this.auras.values()) {
      if (a.lifted !== null) continue;
      const from = a.r === null ? { x: a.fx, y: a.fy } : a;
      const reach = (s: MarkSpot) =>
        a.r === null ? Math.max(s.r * 3, l.tile * 1.2) : Math.max(s.r, l.tile * 0.5);
      const s = nearestMark(spots, from, reach, (s) => s.v === undefined);
      if (s === null) continue;
      a.x = s.x;
      a.y = s.y;
      a.r ??= s.r;
    }
  }

  /** Each ring takes the nearest verdict given on its mark since its press. */
  judge(spots: readonly MarkSpot[], l: Layout): void {
    for (const a of this.auras.values()) {
      const reach = (s: MarkSpot) => Math.max(s.r * 1.5, l.tile * 0.8);
      const s = nearestMark(
        spots,
        a,
        reach,
        (s) => s.v !== undefined && s.v !== a.taken && s.v.age <= a.age,
      );
      if (s?.v === undefined) continue;
      a.taken = s.v;
      a.flash = { age: 0, good: s.v.good };
      if (!s.v.good && a.stopped === null) {
        a.stopped = auraRadius(a.age);
        // A slip told after the lift is shown whole before it fades.
        if (a.lifted !== null) a.lifted = 0;
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D, l: Layout, beatPhase: number): void {
    for (const a of this.auras.values()) drawAura(ctx, l, a, beatPhase);
  }

  /** Every ring gone, and the fingers wearing them spent until they lift. */
  clear(): void {
    for (const [id, a] of this.auras) if (a.lifted === null) this.spent.add(id);
    this.auras.clear();
  }
}

function fresh(t: Thumb): Aura {
  return {
    ...{ fx: t.x, fy: t.y, x: t.x, y: t.y, r: null, age: 0 },
    ...{ lifted: null, stopped: null, flash: null, taken: null },
  };
}

function drawAura(ctx: CanvasRenderingContext2D, l: Layout, a: Aura, beatPhase: number): void {
  const red = a.stopped !== null;
  const flash = a.flash === null ? 0 : Math.max(0, 1 - a.flash.age / FLASH_SECONDS);
  // Red shakes as it lands: the ring refusing, not just recoloured.
  const shake = red ? Math.sin(a.age * 70) * flash * l.tile * 0.08 : 0;
  const base = a.r ?? l.tile * 0.5;
  drawAuraRing(ctx, {
    x: a.x + shake,
    y: a.y,
    r: base * (a.stopped ?? auraRadius(a.age)),
    red,
    onset: a.age < AURA_ONSET_SECONDS,
    fade: a.lifted === null ? 1 : 1 - a.lifted / AURA_LINGER_SECONDS,
    flash,
    // The beat: loud on it, gone before the next — the field's own flash shape.
    beat: red ? 0 : Math.exp(-beatPhase * 5),
  });
}
