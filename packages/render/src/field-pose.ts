import { chargeMilli, type World } from "@neon-spore/sim";
import { claspResonanceIn } from "./clasp.js";
import type { Effects } from "./effects.js";
import { type Glide, glideTo } from "./glide.js";
import type { HullMood, LobePositions } from "./hull.js";
import { ShieldBody } from "./shield.js";

/**
 * The ship's pose, eased — where the two lobes are and how the membrane is
 * feeling, neither of which the world holds.
 *
 * The world snaps the cannon and the shield to whole columns, because a column
 * is what two devices can agree on; a lobe that teleported would read as two
 * shapes swapped rather than one body moving, so the eye is given a continuous
 * position that chases the discrete one and is never read back (`glide.ts`).
 *
 * Its own class because there are two things drawing a field now. The renderer
 * has one of these, and so does each of the two mini-screens a guide's
 * rehearsal is drawn into (`guide-mini.ts`) — and the alternative was the same
 * six lines of easing written out twice, which is precisely the drift
 * `packages/sim/test/purity.test.ts` keeps a table against next door.
 */
export class FieldPose {
  /** Eased 0..1 towards the armed state, so the shield swells instead of snapping. */
  private armed = 0;
  /**
   * The same for the maw. Eased harder than the shield: the lobe has to travel
   * through flat and out the other side, and a snap would read as two shapes
   * rather than one turning inside out.
   */
  private intake = 0;
  /**
   * Where the two lobes are, in fractional columns. The shield follows with a
   * whole chain of them and crawls.
   */
  private cannon: Glide = { value: Number.NaN, velocity: 0 };
  private shield = new ShieldBody();

  /**
   * Back to rest. `startWave` puts both lobes in the middle and closes the
   * shield, and the ship should *be* like that on the first frame of the new
   * run rather than sliding there from wherever the last one left it — the
   * eased pose is the last render state that outlives a world.
   */
  reset(): void {
    this.armed = 0;
    this.intake = 0;
    this.cannon = { value: Number.NaN, velocity: 0 };
    this.shield.reset();
  }

  /**
   * One frame of chasing the world. `isArmed` and `isOpen` are handed in
   * rather than read here because the caller already asked the sim for both —
   * the band draws from the same two answers, and a second copy of that
   * arithmetic is what made the button go dark a tick early and stay dark
   * through a ward.
   */
  update(
    isArmed: boolean,
    isOpen: boolean,
    cannonCol: number,
    shieldCol: number,
    dt: number,
  ): void {
    this.armed += ((isArmed ? 1 : 0) - this.armed) * Math.min(1, dt * 8);
    this.intake += ((isOpen ? 1 : 0) - this.intake) * Math.min(1, dt * 11);
    glideTo(this.cannon, cannonCol, dt);
    this.shield.update(shieldCol, dt);
  }

  get at(): LobePositions {
    return { cannon: this.cannon.value, shield: this.shield.segments };
  }

  /**
   * How the membrane is feeling this frame. `lay` comes straight off the world
   * while a shot is in the muzzle — the tick it leaves is fixed for both
   * devices, so an ease there would have one cannon working ahead of the other
   * — and off the renderer's own echo afterwards (`shot-charge.ts`).
   */
  mood(world: World, effects: Effects): HullMood {
    const laying = chargeMilli(world) / 1000;
    return {
      armed: this.armed,
      // Read straight off the world every frame rather than stored: it is a
      // fact about where two things are standing right now.
      resonance: claspResonanceIn(world),
      intake: this.intake,
      chew: effects.chew,
      charge: effects.charge,
      lay: laying > 0 ? laying : effects.layEcho.phase,
    };
  }
}
