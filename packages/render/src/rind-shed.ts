import { livingPath, livingSilhouette } from "@neon-spore/content";
import { type Color, type SimEvent, type World, wornKind } from "@neon-spore/sim";
import {
  contourClock,
  creatureCenter,
  creatureRadius,
  livingBodyMul,
  rindPrevBodyMul,
} from "./creature-place.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { RIND_LOOK, rindWears } from "./rind-look.js";

/**
 * A layer coming off THE RIND — the event, and where it is drawn.
 *
 * The shed was a step and nothing else before this: one size on one frame, a
 * smaller one on the next, ten particles over it. That step is still exactly
 * what happens — `livingBodyMul` is untouched, and so is the argument for it
 * (`creature-place.ts`: a size that eases is a body breathing, a size that
 * jumps is an event). What was missing is the *sentence* around the jump, and
 * that sentence is now a record: `RIND_LOOK.shed` in `rind-look.ts`, with the
 * shipped picture in `rind-skin.ts` and room beside it for another. This file
 * keeps what is not a look — which body, how big it was and is, which contour
 * it wore — and hands the drawing one frame of that.
 *
 * Pure render, and keyed by the body rather than by a tile: the rind is
 * **still falling** when the layer comes off, so this is redrawn around
 * wherever it is this frame — `ClaspBreakFx`'s rule, arrived at the same way,
 * and the reason `rindShed` carries an `id`.
 */

/** Long enough to be a picture, over well inside the beat it happened on — a
 * beat is 0.625 s at 96 bpm, and the next *again* has to land in a clear field. */
const LIFE = 0.42;

interface Shed {
  /** The body it came off. One size smaller than it was, and still falling. */
  id: number;
  age: number;
  hex: string;
  rim: string;
  /**
   * The contour wobble, frozen at the instant it came off: the body goes on
   * breathing and the husk does not, because it is attached to nothing now —
   * and it starts as exactly the outline the body had, which is what makes the
   * split read as one skin tearing off rather than as two shapes.
   */
  wobble: number;
}

export class RindShedFx {
  private live: Shed[] = [];

  ingest(events: readonly SimEvent[], time: number): void {
    for (const e of events) {
      if (e.type !== "rindShed") continue;
      this.live.push({
        id: e.id,
        age: 0,
        hex: hexFor(e.color),
        rim: rimFor(e.color),
        wobble: contourClock(e.id, time),
      });
    }
  }

  update(dt: number): void {
    for (const fx of this.live) fx.age += dt;
    this.live = this.live.filter((fx) => fx.age < LIFE);
  }

  clear(): void {
    this.live = [];
  }

  draw(ctx: CanvasRenderingContext2D, l: Layout, world: World, beatPhase: number): void {
    for (const fx of this.live) {
      const c = world.creatures.find((x) => x.id === fx.id);
      // The last layer was taken and the body under it killed inside the same
      // half-second. There is nothing left to be a skin *of*, and a husk
      // hanging in the column would say the body is still coming.
      if (!c) continue;
      const { x, y } = creatureCenter(l, c, beatPhase);
      // Both radii off the one rule: the husk is exactly the footprint the body
      // had a moment ago, the crush lands exactly on the one it has.
      const now = creatureRadius(l, c, beatPhase, world.cfg);
      const was = (now * rindPrevBodyMul(c)) / livingBodyMul(c);
      // The contour it was wearing: a look that gives a rind a body of its own
      // is asked for the one it had a layer ago, and everything else wears the
      // body it will become.
      const shape = rindWears(c, world.cfg, 1) ?? livingSilhouette(wornKind(c));
      const unit = Math.max(shape.rx, shape.ry) / (shape.sizeMul ?? 1);
      const path = new Path2D(livingPath(shape, fx.wobble, 28));
      // Through the record and not the paint, so a candidate can stand in for
      // it for the length of one frame (`docs/versus.md`).
      RIND_LOOK.shed({
        ctx,
        x,
        y,
        id: fx.id,
        path,
        unit,
        hex: fx.hex,
        rim: fx.rim,
        t: fx.age / LIFE,
        was,
        now,
      });
    }
  }
}

function hexFor(color: Color): string {
  return color === "red" ? PALETTE.red : PALETTE.cyan;
}

function rimFor(color: Color): string {
  return color === "red" ? PALETTE.redRim : PALETTE.cyanRim;
}
