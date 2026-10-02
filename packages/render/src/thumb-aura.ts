import { failHolds } from "@neon-spore/sim";
import { type GripVerdict, type VerdictSpot, verdictsDrawn } from "./grip-verdict.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import type { ViewState } from "./renderer.js";
import type { Touch } from "./touch-hold.js";

/**
 * **The glow round this device's own thumb while it holds a boss's mark.**
 * The owner, 2 October 2026, generic: *when there is hold or push on screen
 * gesture … you cannot see the progress circle with its colour because your
 * thumb is below. so some feedback, maybe around the circle like a green blur
 * beat … and if interrupted or wrong gesture done on the circle to be red. …
 * when starting to press it grows bigger and bigger first quick and then very
 * slow, so people see that something is still ongoing.*
 *
 * So a soft ring is drawn round the finger itself — wider than any thumb, so
 * it shows past the pad — and:
 *
 * - **it grows** from the press, most of the way in a fifth of a second and
 *   then by a little more for as long as the thumb stays (`auraRadius`), so a
 *   hold that is still running is a picture that is still moving;
 * - **it beats green** on the wave's beat while the thumb is down;
 * - **it goes red** when the mark under it is judged wrong — the wrong thumb,
 *   the wrong gesture, a hold let go too early — and stops growing; and it
 *   flashes brighter green when the mark under it is judged right. Both are
 *   the mark's own verdict (`grip-verdict.ts`), never this file's guess.
 *
 * It starts white for `AURA_ONSET_SECONDS`, the time a press takes to reach
 * the simulation and come back judged across a link, so a refused thumb goes
 * from *got you* to red rather than from green to red. A thumb lifted leaves
 * its ring fading for `AURA_LINGER_SECONDS`, which is when a hold let go too
 * early is told so.
 *
 * Per device and never shared, like `ViewState.hand`: the thumbs are the
 * host's, kept with the other per-finger counts (`fingers.ts`), and nothing here reaches the world.
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

/** How long the ring stays white before it beats green, in seconds. */
export const AURA_ONSET_SECONDS = 0.25;
/** How long a lifted thumb's ring takes to fade, in seconds. */
export const AURA_LINGER_SECONDS = 0.5;
/** How long a verdict's flash lasts on the ring, in seconds. */
const FLASH_SECONDS = 0.35;

/**
 * The ring's radius `t` seconds into a press, in tiles: 1.2 at the touch —
 * just past a thumb's pad — over half a tile more in the first fifth of a
 * second, then a slow creep that never quite stops: the owner's *first quick
 * and then very slow*.
 */
export function auraRadius(t: number): number {
  const quick = 1 - Math.exp(-t / 0.08);
  const slow = Math.log(1 + t / 0.6);
  return Math.min(3, 1.2 + 0.6 * quick + 0.25 * slow);
}

/** What a frame hands the rings: `ViewState`'s part of it. */
type AuraView = Pick<ViewState, "world" | "thumbs" | "dt" | "beatPhase">;

/** A canvas transform, as `getTransform` hands it back. */
type Matrix = Pick<DOMMatrix, "a" | "b" | "c" | "d" | "e" | "f">;

interface Aura {
  x: number;
  y: number;
  /** Seconds since the press. */
  age: number;
  /** Seconds since the lift, or null while the thumb is down. */
  lifted: number | null;
  /** The radius, in tiles, the ring stopped at when it went red. */
  stopped: number | null;
  /** Seconds since the last verdict under it, and which way it went. */
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
   * verdicts drawn since `watchVerdicts` read, and the rings put down over
   * everything — a ring under the band would be under the thumb again.
   *
   * None once the wave is lost or over: a thumb still down when the hit
   * landed is holding nothing, and its ring is not drawn over the field held
   * still under the lost screen, nor over the screen (`failHolds`).
   */
  frame(ctx: CanvasRenderingContext2D, l: Layout, view: AuraView): void {
    const spots = verdictsDrawn(ctx);
    if (view.world.over || failHolds(view.world)) {
      this.clear();
      return;
    }
    this.update(view.thumbs, view.dt);
    this.judge(spots, ctx.getTransform(), l);
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
      a.x = t.x;
      a.y = t.y;
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
   * The verdicts drawn this frame (`verdictsDrawn`), in the canvas's pixels,
   * and the transform the stage is drawn in. Each ring takes the nearest one
   * given since its press, within reach of the thumb.
   */
  judge(spots: readonly VerdictSpot[], m: Matrix, l: Layout): void {
    if (spots.length === 0 || this.auras.size === 0) return;
    const det = m.a * m.d - m.b * m.c;
    if (det === 0) return;
    const scale = Math.sqrt(Math.abs(det));
    for (const a of this.auras.values()) {
      let best: VerdictSpot | null = null;
      let bestD = Infinity;
      for (const s of spots) {
        if (s.v === a.taken || s.v.age > a.age) continue;
        // The spot back into the stage's own frame: the transform, undone.
        const dx = s.x - m.e;
        const dy = s.y - m.f;
        const x = (m.d * dx - m.c * dy) / det;
        const y = (m.a * dy - m.b * dx) / det;
        const d = Math.hypot(x - a.x, y - a.y);
        if (d <= Math.max((s.r / scale) * 3, l.tile * 1.5) && d < bestD) {
          best = s;
          bestD = d;
        }
      }
      if (best === null) continue;
      a.taken = best.v;
      a.flash = { age: 0, good: best.v.good };
      if (!best.v.good && a.stopped === null) {
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
  return { x: t.x, y: t.y, age: 0, lifted: null, stopped: null, flash: null, taken: null };
}

function drawAura(ctx: CanvasRenderingContext2D, l: Layout, a: Aura, beatPhase: number): void {
  const red = a.stopped !== null;
  const fade = a.lifted === null ? 1 : 1 - a.lifted / AURA_LINGER_SECONDS;
  const flash = a.flash === null ? 0 : Math.max(0, 1 - a.flash.age / FLASH_SECONDS);
  // The beat: loud on it, gone before the next — the field's own flash shape.
  const beat = red ? 0 : Math.exp(-beatPhase * 5);
  const onset = Math.min(1, a.age / AURA_ONSET_SECONDS);
  const colour = red ? PALETTE.red : onset < 1 ? PALETTE.text : PALETTE.good;
  // Red shakes as it lands: the ring refusing, not just recoloured.
  const shake = red ? Math.sin(a.age * 70) * flash * l.tile * 0.12 : 0;
  const x = a.x + shake;
  const r = l.tile * (a.stopped ?? auraRadius(a.age)) * (1 + 0.06 * beat + 0.08 * flash);
  const glow = (0.32 + 0.3 * beat + 0.35 * flash) * fade;
  ctx.save();
  const g = ctx.createRadialGradient(x, a.y, r * 0.62, x, a.y, r * 1.22);
  g.addColorStop(0, rgba(colour, 0));
  g.addColorStop(0.45, rgba(colour, glow));
  g.addColorStop(1, rgba(colour, 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, a.y, r * 1.22, 0, Math.PI * 2);
  ctx.arc(x, a.y, r * 0.62, 0, Math.PI * 2, true);
  ctx.fill();
  ctx.strokeStyle = rgba(colour, (0.7 + 0.3 * Math.max(beat, flash)) * fade);
  ctx.lineWidth = STROKE.inner * (1.2 + flash);
  ctx.beginPath();
  ctx.arc(x, a.y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}
