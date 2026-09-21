import { type ControlSet, controlSays } from "@neon-spore/content";
import type { Command, SimConfig, SimEvent } from "@neon-spore/sim";
import { bandLobes } from "./band-lobes.js";
import type { Layout, ViewRole } from "./layout.js";
import { PALETTE } from "./palette.js";
import { stareEye } from "./stare-shape.js";
import { showsStareWatched } from "./view-role-clocks-b.js";

/**
 * What THE STARE leaves behind a frame: the **flash** of a press it caught.
 *
 * Everything else about the boss is drawn off the world every frame — the
 * cowl, the eye, how far it has turned, the count, the seat's name
 * (`stare-draw.ts`). The catch is one tick in the simulation and the only
 * thing in the fight that *happens* rather than turns, so it is kept here
 * for THE HIVE's reason: a flash that was up for one frame would be a
 * flicker, and the pair has to see which of them it was. Cleared in
 * `Effects.reset()` (`restart.test.ts`).
 *
 * **It is drawn on the button, over everything.** The event names the command
 * that was caught and the seat that sent it, and what lights up is the circle
 * that sent it — called last of the frame from `canvas2d.ts` after the band is
 * down, because a flash on a button has to stand *on* the button.
 *
 * Which circle is not worked out here. The lobes come from the same
 * `bandLobes` that drew them and each one is asked `controlSays`, which is
 * `content`'s own table read backwards (`control-sender.ts`); a map from
 * command kinds to buttons kept in this file would be a second copy of the
 * band's plan, and it is what stood in the way of this until 21 September
 * 2026. **The wash is what is left when no button sent it**: a swipe on the
 * hull, a thumb on a boss, a strip — presses with no circle of their own,
 * where the seat's whole panel is the truest thing the picture can point at.
 *
 * On the other seat's screen there is no flash: that seat did nothing, and the
 * eye going white and the hull's own breach (`breach-strike.ts`) are what it
 * sees. Both are told by the same seat predicate the look itself is drawn by.
 *
 * The burst goes out of the eye rather than the hull, on both screens: it is
 * the eye that caught the thumb.
 *
 * **The lid's two are read here as well** (18 September 2026): the lid
 * landing is a puff of rock off the brow, and the eye forcing it up is a
 * lesser flash with no seat — both transients, both on both screens, since
 * the lid itself is. A lid let go is no event of the picture's at all: the
 * ring empties and the flap rises, and that is read off the state.
 */

/** How fast the flash falls away — a beat and a bit at the game's tempo. */
const FLASH_DECAY = 3;
/** How much of the panel the flash is worth at its brightest. */
const FLASH_ALPHA = 0.55;
/** How far past the button's own edge the flash spills, as a share of it. */
const FLASH_SPREAD = 1.35;

export class StareFx {
  private flashNow = 0;
  private seat: 0 | 1 | 2 = 0;
  /** The press the eye punished, for finding the circle it came through. */
  private verb: Command | null = null;

  /** How bright the flash is right now, one on the tick and falling. */
  get flash(): number {
    return this.flashNow;
  }

  /** Which seat was caught, while the flash is up. */
  get caught(): 0 | 1 | 2 {
    return this.seat;
  }

  ingest(
    events: readonly SimEvent[],
    l: Layout,
    cfg: SimConfig,
    burst: (x: number, y: number, n: number, hex: string) => void,
  ): void {
    for (const e of events) {
      if (e.type === "stareCaught") {
        this.flashNow = 1;
        this.seat = e.player;
        this.verb = e.command;
        const eye = stareEye(l, cfg);
        burst(eye.cx, eye.cy, 18, PALETTE.red);
      } else if (e.type === "stareShut") {
        // The lid landing: a puff of the cowl's own rock off the brow, on
        // both screens, and no seat — nothing was caught.
        const eye = stareEye(l, cfg);
        burst(eye.cx, eye.cy - eye.ry, 8, PALETTE.rock);
      } else if (e.type === "stareOpen" && e.forced) {
        // The eye forcing the lid up goes white, half as hard as a catch and
        // with no panel under it: the strain is the eye's, not a seat's.
        this.flashNow = Math.max(this.flashNow, 0.5);
      }
    }
  }

  /** The flash falling away. */
  update(dt: number): void {
    const step = Math.min(dt, 1 / 30);
    this.flashNow = Math.max(0, this.flashNow - this.flashNow * FLASH_DECAY * step);
    if (this.flashNow < 0.01) {
      this.flashNow = 0;
      this.seat = 0;
      this.verb = null;
    }
  }

  /** The button that was caught, lit over the band — see the file's head. */
  drawCaught(ctx: CanvasRenderingContext2D, l: Layout, role: ViewRole, set: ControlSet): void {
    const seat = this.seat;
    const verb = this.verb;
    if (this.flashNow <= 0 || seat === 0) return;
    if (!showsStareWatched(role, seat)) return;
    const lobe =
      verb === null
        ? undefined
        : bandLobes(l, set, seat).find((b) => controlSays(b.control.id, verb));
    ctx.save();
    ctx.globalAlpha = FLASH_ALPHA * this.flashNow;
    ctx.fillStyle = PALETTE.red;
    if (lobe === undefined) {
      ctx.fillRect(0, l.bandTop, l.width, l.height - l.bandTop);
    } else {
      ctx.beginPath();
      ctx.arc(lobe.circle.x, lobe.circle.y, lobe.circle.r * FLASH_SPREAD, 0, Math.PI * 2);
      ctx.fill();
      // A rim on it, so the flash reads as a light coming off the button
      // rather than as a disc laid over one.
      ctx.strokeStyle = PALETTE.redRim;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    ctx.restore();
  }

  clear(): void {
    this.flashNow = 0;
    this.seat = 0;
    this.verb = null;
  }
}
