import type { SimEvent, World } from "@neon-spore/sim";
import { choirMembranePath } from "./choir.js";
import { creatureCenter } from "./creature-place.js";
import { drawnRow, hazed, nearness } from "./depth.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * **Two becoming one**, which is the whole of what THE CHOIR's gesture does
 * and, until this file, the one part of it nothing drew.
 *
 * The simulation changes the kind on the instant the gesture lands, so without
 * a transient the pair sees one frame of a membrane and then one frame of a
 * slick — a body that *swapped* rather than a pair that closed. The owner has
 * put the same sentence twice: *when shaking they symbiose into one*, and
 * *two become one, not one becomes two*. That is an event, and an event needs
 * a picture.
 *
 * **It is `ClaspBreakFx`'s shape exactly**, and for that file's own reason: the
 * body is still falling while this runs, so the picture is keyed by the
 * creature's `id` and redrawn wherever that body is on every frame. A position
 * frozen at ingest — right for a lure folding, because a lure is gone — would
 * leave the closing membrane a row behind the slick it is closing into.
 *
 * **What it draws is the same trace with the orbit driven to nought.**
 * `choirMembranePath` is the one copy of what this skin is (`choir.ts`),
 * handed a `close` of 0 at the start and 1 at the end, so the shape that
 * shrinks is the shape that was standing there rather than a second drawing of
 * it that could drift apart from the first.
 *
 * It is drawn **over** the body underneath: `drawLiving` has already put the
 * new slick or bulb on the tile in its colour, and a membrane closing over it
 * is what makes that colour look like it arrived rather than replaced.
 */

/** Seconds the closing takes. Long enough to read as a movement and shorter
 * than a beat, because the pair has a shot to line up and a body that spent a
 * whole beat becoming shootable would be a beat nobody could use. */
const LIFE = 0.34;

interface Closing {
  id: number;
  age: number;
}

export class ChoirMergeFx {
  private live: Closing[] = [];

  ingest(events: readonly SimEvent[]): void {
    for (const e of events) {
      if (e.type !== "choirMerge") continue;
      this.live.push({ id: e.id, age: 0 });
    }
  }

  update(dt: number): void {
    for (const fx of this.live) fx.age += dt;
    this.live = this.live.filter((fx) => fx.age < LIFE);
  }

  clear(): void {
    this.live = [];
  }

  /** `time` is the wall clock the membrane's own drift is sampled at, live
   * rather than frozen: the pair goes on breathing while it closes, so the
   * shape never jumps on the frame the gesture landed. */
  draw(
    ctx: CanvasRenderingContext2D,
    l: Layout,
    world: World,
    beatPhase: number,
    time: number,
  ): void {
    for (const fx of this.live) {
      const c = world.creatures.find((x) => x.id === fx.id);
      // The body was shot inside the closing. There is nothing left to close
      // around, and a membrane still shutting over an empty tile would say the
      // film outlived the thing it was holding.
      if (!c) continue;
      const k = fx.age / LIFE;
      // Eased so the pair rushes together and settles rather than sliding at
      // one speed: what an eye should read is two things falling into each
      // other, and a linear close reads as a machine closing a door.
      const close = 1 - (1 - k) ** 3;
      const { x, y } = creatureCenter(l, c, beatPhase);
      const near = nearness(l, drawnRow(c, beatPhase));
      const skin = hazed(world.cfg, PALETTE.rock, near);
      ctx.save();
      // Fading as it closes, so the colour underneath comes up through it. The
      // film never brightens on its way out — a flash here would read as a hit,
      // and nothing was hit.
      ctx.globalAlpha = (1 - k) * 0.5;
      ctx.fillStyle = skin;
      ctx.fill(choirMembranePath(l, x, y, time, close));
      ctx.globalAlpha = 1 - k;
      ctx.strokeStyle = skin;
      ctx.lineWidth = Math.max(1.4, l.tile * 0.055);
      ctx.stroke(choirMembranePath(l, x, y, time, close));
      ctx.restore();
    }
  }
}
