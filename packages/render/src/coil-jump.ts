import type { SimConfig, SimEvent, World } from "@neon-spore/sim";
import { drawBolt } from "./bolt.js";
import { showsCoilCharge } from "./coil.js";
import { creatureCenter } from "./creature-place.js";
import { halo } from "./glow.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * The charge leaving a dome that has just failed and crossing the field to the
 * next one.
 *
 * The owner asked for this in as many words: *"bolts jump from the removed
 * dome shield object to the next one, removing shield again and jumping again
 * to next one"*. `ClaspStrikeFx` next door is the same light travelling the
 * other way — up out of the hull, into the body the ward reached — and this is
 * that picture with both ends on the field. `drawBolt` is the one shape they
 * share (`bolt.ts`).
 *
 * **One end is frozen and the other is looked up every frame**, and the
 * asymmetry is the creature. Where the charge *left* is a place: that dome is
 * a rock now, dropping at thirteen rows a beat and out of the picture before
 * the bolt has crossed half the field, so the honest thing to draw from is the
 * tile it failed in. Where it is *going* is a body, still crossing two lanes a
 * beat for the whole flight — so the far end is `coilJump`'s `id`, on
 * `ClaspBreakFx`'s terms and for the reason the owner gave that file: a column
 * and a row name a place, and only an id names the thing that moved.
 *
 * **And it is drawn on player 1's screen alone.** `showsCoilCharge` is the
 * gate. The navigator holds the only plate and has to be *told* which column
 * comes open next; a bolt on both screens would be the pair being handed the
 * one sentence this creature exists to make them say.
 *
 * Pure render, like everything else in `effects-body.ts`: the simulation lit
 * the next dome on the beat the first one failed and has no idea this is being
 * drawn. Nothing here is ever read back into a world.
 */

/** One charge in flight, aged in seconds. Keyed by the body it is reaching for. */
export interface CoilJump {
  /** The dome the charge is travelling to. It is still an `coil` until it lands. */
  id: number;
  /** The tile the charge left, frozen: what threw it is a falling rock by now. */
  x: number;
  y: number;
  age: number;
  /** Seconds the flight lasts, from `coilJumpBeats` at this tempo. */
  life: number;
}

/** Bolts per charge. Two rather than the strike's three: this one is on screen
 * for three beats instead of a quarter of a second, and three overlapping
 * crackling lines that long read as a rope rather than as a discharge. */
const BOLTS = 2;

export class CoilJumpFx {
  private live: CoilJump[] = [];

  /**
   * Every `coilJump` in this frame's events. The life is frozen at ingest —
   * `coilJumpBeats` at the tempo the wave was played at — which is
   * `ClaspBreakFx`'s arrangement and its reason: the flight is counted in
   * beats by the simulation, and a picture that re-read the tempo every frame
   * would stretch or snap if the beat ever moved under it.
   */
  ingest(events: readonly SimEvent[], l: Layout, cfg: SimConfig, beatSeconds: number): void {
    for (const e of events) {
      if (e.type !== "coilJump") continue;
      this.live.push({
        id: e.id,
        x: tileCX(l, e.col),
        y: tileCY(l, e.row),
        age: 0,
        life: cfg.coilJumpBeats * beatSeconds,
      });
    }
  }

  update(dt: number): void {
    for (const fx of this.live) fx.age += dt;
    this.live = this.live.filter((fx) => fx.age < fx.life);
  }

  clear(): void {
    this.live = [];
  }

  draw(ctx: CanvasRenderingContext2D, l: Layout, world: World, beatPhase: number): void {
    if (!showsCoilCharge(l)) return;
    for (const fx of this.live) {
      const c = world.creatures.find((x) => x.id === fx.id);
      // The dome may have been opened by the ward before the charge reached
      // it, in which case there is nothing left for this bolt to be aimed at
      // and it simply stops — the pair got there first, which is the whole
      // point of being able to see it coming.
      if (c?.kind !== "coil") continue;
      const t = Math.min(1, fx.age / fx.life);
      const to = creatureCenter(l, c, beatPhase);
      // The bolt reaches only as far as the charge has come, so the pilot is
      // watching something *arrive* rather than a line joining two bodies.
      const x1 = fx.x + (to.x - fx.x) * t;
      const y1 = fx.y + (to.y - fx.y) * t;
      for (let k = 0; k < BOLTS; k++) {
        // Redrawn from a different seed a few times a second, so the charge
        // crackles along its path instead of holding one shape.
        const seed = k * 211 + Math.floor(fx.age * 60) * 23 + fx.id;
        drawBolt(ctx, fx.x, fx.y, x1, y1, l.tile, seed, k === 0 ? 0.9 : 0.55, 1.4);
      }
      // The head of it, brightening as it closes. This is the thing the pilot
      // is actually reading: not the line, but which dome it is nearly at.
      halo(ctx, x1, y1, l.tile * (0.5 + 0.9 * t), PALETTE.shieldRim, 0.3 + 0.45 * t);
    }
  }
}
