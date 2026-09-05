import type { Color, SimEvent } from "@neon-spore/sim";
import { rgba } from "./hex.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * A LURE GOING UP, AND THE WHOLE SCREEN WITH IT.
 *
 * The one picture in this game that leaves the field. Everything else drawn
 * here is a thing in a tile — a burst at a body, a crack in the hull, a ring
 * closing on a point — because the field is eleven columns two people talk
 * about and a picture that covers them all covers the conversation too. This
 * is the deliberate exception, and it is the only event that earns it: the
 * body player 1 was told to leave alone has just been shot, and the ship is
 * about to be broken in three places at once for it (`resolveLure`,
 * bullet-hit.ts). A hole in the plating with no explanation above it would
 * read as an arrival nobody saw coming, which is the one thing this was not.
 *
 * **It is drawn over the ship, not under it.** Every other transient in the
 * renderer goes down in the field pass and the hull is painted on top; this
 * one is called last of the frame, from `canvas2d.ts`, after the overlays. A
 * blast that the hull occludes is a blast happening somewhere else.
 *
 * **In the body's own colour**, with white only at the core. A lure wears a
 * slick's red or a bulb's cyan and that is the only colour either player has
 * ever seen it in, so it is the colour the ship is lit by when it goes — the
 * same rule the burst at the tile and the breaches at the hull both follow, so
 * the three read as one event rather than three.
 *
 * Five gestures, in the order the eye takes them: a white wash the instant it
 * happens, a fireball out of the tile, a ring running off the edges of the
 * screen, spokes thrown along it, and a colour left hanging over everything
 * while the hull is being read. Nothing here is random — the spokes are placed
 * by index, so both phones show the same explosion without the simulation
 * carrying a single number about it.
 */

/**
 * How long the whole picture lasts. Longer than anything else the field
 * throws — a fold is 0.45 s — because this one has to be over before the pair
 * looks at the hull bar, and not a frame before that.
 */
const LIFE = 0.9;

/** How much of that is the white wash, which is over almost before it is seen. */
const WASH = 0.13;

/** Spokes thrown out along the shockwave. Enough to read as a burst, few
 * enough that each one is a line rather than a fringe. */
const SPOKES = 14;

interface Blast {
  x: number;
  y: number;
  /** The disguise's colour: what both players were looking at. */
  hex: string;
  /** Seconds left. */
  left: number;
}

/** 0..1, whatever comes in. */
function unit(v: number): number {
  return Math.max(0, Math.min(1, v));
}

export class LureBlastFx {
  private blasts: Blast[] = [];

  /**
   * Every `lureHit` in this frame's events. Its own `ingest` rather than a
   * case in `effects.ts`, the way `LureVanishFx` and `MirrorFx` have theirs:
   * the tile arithmetic belongs beside the drawing that uses it.
   */
  ingest(events: readonly SimEvent[], l: Layout): void {
    for (const e of events) {
      if (e.type !== "lureHit") continue;
      this.spawn(tileCX(l, e.col), tileCY(l, e.row), e.color);
    }
  }

  spawn(x: number, y: number, color: Color): void {
    this.blasts.push({
      x,
      y,
      hex: color === "red" ? PALETTE.red : PALETTE.cyan,
      left: LIFE,
    });
  }

  update(dt: number): void {
    for (const b of this.blasts) b.left -= dt;
    this.blasts = this.blasts.filter((b) => b.left > 0);
  }

  clear(): void {
    this.blasts = [];
  }

  draw(ctx: CanvasRenderingContext2D, l: Layout): void {
    if (this.blasts.length === 0) return;
    // Far enough that the fireball and the ring both leave the stage rather
    // than stopping inside it: the corner furthest from the blast, and a
    // little past it. A picture that ends on screen is an object; one that
    // runs off every edge is what the screen is inside of.
    for (const b of this.blasts) {
      const reach = Math.hypot(Math.max(b.x, l.width - b.x), Math.max(b.y, l.height - b.y)) * 1.05;
      this.drawBlast(ctx, l, b, unit(1 - b.left / LIFE), reach);
    }
  }

  private drawBlast(
    ctx: CanvasRenderingContext2D,
    l: Layout,
    b: Blast,
    u: number,
    reach: number,
  ): void {
    ctx.save();
    // Additive, so the blast lights what is already there instead of hiding
    // it. The hull has to be visible *through* this: it is the thing being
    // broken, and a wash that painted over it would take the subject away at
    // the moment the picture is about it.
    ctx.globalCompositeOperation = "lighter";

    if (u < WASH) this.drawWash(ctx, l, u);
    this.drawFireball(ctx, b, u, reach);
    this.drawRing(ctx, l, b, u, reach);
    this.drawSpokes(ctx, b, u, reach);
    this.drawAfterglow(ctx, l, b, u);

    ctx.restore();
  }

  /** The first three frames: everything white, and no shape at all yet. */
  private drawWash(ctx: CanvasRenderingContext2D, l: Layout, u: number): void {
    ctx.globalAlpha = unit(0.62 * (1 - u / WASH) ** 1.6);
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, l.width, l.height);
  }

  /**
   * The body itself, coming apart. White at the core while there is still
   * something burning in the middle, the disguise's colour around it, and
   * `ember` at the edge — the colour this game already spends on something
   * going wrong, and the same one that burns through the hole in a lure.
   */
  private drawFireball(ctx: CanvasRenderingContext2D, b: Blast, u: number, reach: number): void {
    // Fast out of the tile and slowing: an explosion is nearly its full size
    // by the time anybody has read it, and everything after that is fading.
    const r = Math.max(1, reach * u ** 0.42);
    const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, r);
    // The core loses its white over the first third and is the body's colour
    // for the rest, so the last thing burning is what was standing there.
    const core = unit(1 - u * 3);
    g.addColorStop(0, rgba("#FFFFFF", unit(0.9 * (1 - u) ** 1.2 * (0.45 + 0.55 * core))));
    g.addColorStop(0.34, rgba(b.hex, unit(0.75 * (1 - u) ** 1.3)));
    g.addColorStop(0.72, rgba(PALETTE.ember, unit(0.4 * (1 - u) ** 1.6)));
    g.addColorStop(1, rgba(PALETTE.ember, 0));
    ctx.globalAlpha = 1;
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  /** The front of it, running off every edge of the screen. */
  private drawRing(
    ctx: CanvasRenderingContext2D,
    l: Layout,
    b: Blast,
    u: number,
    reach: number,
  ): void {
    const r = reach * u ** 0.68 * 1.18;
    if (r < 1) return;
    ctx.globalAlpha = unit(0.85 * (1 - u) ** 1.1);
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = Math.max(0.6, l.tile * 0.42 * (1 - u));
    ctx.beginPath();
    ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  /**
   * Streaks along the front. Placed by index rather than by a random stream:
   * the two phones draw the same explosion, and there is nothing in the world
   * for them to have agreed about it through. The lengths alternate off a
   * plain trig wobble so the spread does not read as a wheel.
   */
  private drawSpokes(ctx: CanvasRenderingContext2D, b: Blast, u: number, reach: number): void {
    ctx.globalAlpha = unit(0.7 * (1 - u) ** 1.4);
    ctx.strokeStyle = PALETTE.ember;
    ctx.lineWidth = Math.max(0.6, reach * 0.012 * (1 - u));
    ctx.beginPath();
    for (let i = 0; i < SPOKES; i++) {
      const a = (i / SPOKES) * Math.PI * 2;
      const far = reach * u ** 0.6 * (0.72 + 0.26 * Math.sin(i * 2.399 + 1.1));
      const near = far * 0.55;
      ctx.moveTo(b.x + Math.cos(a) * near, b.y + Math.sin(a) * near);
      ctx.lineTo(b.x + Math.cos(a) * far, b.y + Math.sin(a) * far);
    }
    ctx.stroke();
  }

  /**
   * What is left over the whole stage once the shape of it has gone: the
   * screen still lit in the colour of the body that did this, fading while the
   * pair reads three new cracks in the hull. It is the quietest part of the
   * picture and the one that carries the cost, because it is still there when
   * they look down.
   */
  private drawAfterglow(ctx: CanvasRenderingContext2D, l: Layout, b: Blast, u: number): void {
    ctx.globalAlpha = unit(0.26 * (1 - u) ** 1.8);
    ctx.fillStyle = b.hex;
    ctx.fillRect(0, 0, l.width, l.height);
  }
}
