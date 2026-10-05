import type { SceneStep } from "@neon-spore/sim";

/**
 * **THE INSTAR's lips trembling under a shove**: the second and third bites
 * of the breath push back against every thumb on a jaw once a beat
 * (`sim/instar-step.ts` `pushBack`, `instarShove`), and the lip that was
 * shoved jumps outward and quivers as it settles (`instar-head.ts`). Harder
 * at the third bite's push, which is twice the second's
 * (`instar-script-breath.ts`) — the owner's *player really feels when
 * pulling it is required to be stronger*.
 *
 * Its own file because `instar-fx.ts` holds everything else the body leaves
 * behind a frame and was within a few lines of its limit. Cleared with it.
 */

/** How far a lip shoved at full strength jumps outward, in head radii, and how fast it quivers. */
const TREMBLE = 0.09;
const TREMBLE_HZ = 13;

/** A lip's outward offset under a shove of strength `k`, in pixels: most of
 * it a jump open, the rest a quiver; `phase` so the two lips are not in step.
 * Drawn by the face-on head (`instar-head.ts` `frontJaws`). */
export function tremble(k: number, time: number, r: number, phase: number): number {
  if (k <= 0) return 0;
  return k * r * TREMBLE * (0.6 + 0.4 * Math.sin(time * Math.PI * 2 * TREMBLE_HZ + phase));
}

/** A shove of this many thousandths trembles its lip at full strength. */
const FULL_MILLI = 500;
const DECAY = 4;

export class LipShove {
  /** Which lip each mark of this step pulls, if it pulls one. */
  private lips: ("up" | "down" | null)[] = [];
  private upNow = 0;
  private downNow = 0;

  /** How hard the upper lip is trembling right now, 0..1. */
  get up(): number {
    return this.upNow;
  }

  /** How hard the lower lip is trembling right now, 0..1. */
  get down(): number {
    return this.downNow;
  }

  /** Told by the drawer which marks this step pulls which lip. */
  place(step: SceneStep | null): void {
    this.lips =
      step === null
        ? []
        : step.marks.map((m) =>
            m.gesture === "pullDown" ? "up" : m.gesture === "pullUp" ? "down" : null,
          );
  }

  /** Mark `mark` shoved back by `pushMilli`. */
  hit(mark: number, pushMilli: number): void {
    const k = Math.min(1, pushMilli / FULL_MILLI);
    const lip = this.lips[mark];
    if (lip === "up") this.upNow = Math.max(this.upNow, k);
    if (lip === "down") this.downNow = Math.max(this.downNow, k);
  }

  update(dt: number): void {
    this.upNow = settle(this.upNow, DECAY * dt);
    this.downNow = settle(this.downNow, DECAY * dt);
  }

  clear(): void {
    this.lips = [];
    this.upNow = 0;
    this.downNow = 0;
  }
}

/** A decaying amount one frame on, and nought once it is too small to see. */
function settle(v: number, k: number): number {
  const next = Math.max(0, v - v * k);
  return next < 0.002 ? 0 : next;
}
