import type { Color, SimEvent } from "@neon-spore/sim";
import { mixHex, rgba } from "./hex.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * A LURE GOING UP, AND THE WHOLE SCREEN WITH IT.
 *
 * The one picture in this game that leaves the field. Everything else drawn
 * here is a thing in a tile, because the field is eleven columns two people
 * talk about and a picture covering them all covers the conversation too. This
 * is the deliberate exception and the only event that earns it: the body
 * player 1 was told to leave alone has just been shot, and the ship is about
 * to be broken in three places for it (`resolveLure`, bullet-hit.ts). A hole
 * in the plating with no explanation above it would read as an arrival nobody
 * saw coming, which is the one thing this was not.
 *
 * **It is drawn over the ship, not under it.** Every other transient in the
 * renderer goes down in the field pass and the hull is painted on top; this
 * one is called last of the frame, from `canvas2d.ts`, after the overlays. A
 * blast the hull occludes is a blast happening somewhere else.
 *
 * **In the body's own colour**, with white only at the core — the only colour
 * either player has ever seen it in, and the same one the burst at the tile
 * and the breaches at the hull carry, so the three read as one event.
 *
 * Five gestures, in the order the eye takes them: a white wash, a fireball out
 * of the tile, a front running off the edges of the screen, streaks thrown
 * along it, and a colour left hanging over everything while the hull is being
 * read. Nothing here is random — every one of them is placed by index, so both
 * phones show the same explosion without the simulation carrying a number
 * about it.
 */

/**
 * How long the whole picture lasts. Longer than anything else the field
 * throws — a fold is 0.45 s — because this one has to be over before the pair
 * looks at the hull bar, and not a frame before that.
 */
const LIFE = 0.9;

/** How much of that is the white wash, which is over almost before it is seen. */
const WASH = 0.13;

/** Streaks thrown out along the front. Fourteen evenly spaced ones drew a
 * clock face; the count is up and every one of them is a different length. */
const SPOKES = 26;

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

/** A stable 0..1 from one integer — `scars.ts`'s hash, for its reason: one
 * streak looks nothing like the next and no number was stored to say so. */
function wobble(i: number): number {
  const n = (Math.imul(i + 1, 1664525) + 1013904223) | 0;
  return ((n >>> 8) % 10000) / 10000;
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

  private drawBlast(c: CanvasRenderingContext2D, l: Layout, b: Blast, u: number, r: number): void {
    c.save();
    // Additive, so the blast lights what is already there instead of hiding
    // it. The hull has to be visible *through* this — it is the thing being
    // broken, and a wash over it takes the subject away.
    c.globalCompositeOperation = "lighter";
    if (u < WASH) this.drawWash(c, l, u);
    this.drawFireball(c, b, u, r);
    this.drawRing(c, l, b, u, r);
    this.drawSpokes(c, b, u, r);
    this.drawAfterglow(c, l, b, u);
    c.restore();
  }

  /** The first three frames: everything white, and no shape at all yet. */
  private drawWash(ctx: CanvasRenderingContext2D, l: Layout, u: number): void {
    ctx.globalAlpha = unit(0.62 * (1 - u / WASH) ** 1.6);
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, l.width, l.height);
  }

  /**
   * The body itself, coming apart: white at the core while something is still
   * burning in the middle, the disguise's colour around it, and `ember` at the
   * edge — what this game already spends on something going wrong.
   *
   * It falls away fast. A gradient that held its colour halfway out drew a
   * pale disc with a hard edge — a bubble over the field rather than light
   * coming off something — so the colour is spent in the middle third and
   * everything past that is haze.
   */
  private drawFireball(ctx: CanvasRenderingContext2D, b: Blast, u: number, reach: number): void {
    // Fast out of the tile and slowing: an explosion is nearly its full size
    // by the time anybody has read it, and everything after that is fading.
    const r = Math.max(1, reach * u ** 0.42 * 0.92);
    const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, r);
    // The core loses its white over the first third and is the body's colour
    // for the rest, so the last thing burning is what was standing there.
    const core = unit(1 - u * 3);
    const fade = (1 - u) ** 1.4;
    g.addColorStop(0, rgba("#FFFFFF", unit(0.95 * fade * (0.4 + 0.6 * core))));
    g.addColorStop(0.14, rgba(mixHex(b.hex, "#FFFFFF", 0.5 * core), unit(0.8 * fade)));
    g.addColorStop(0.36, rgba(b.hex, unit(0.42 * fade)));
    g.addColorStop(0.66, rgba(PALETTE.ember, unit(0.16 * fade)));
    g.addColorStop(1, rgba(PALETTE.ember, 0));
    ctx.globalAlpha = 1;
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * The front of it, running off every edge of the screen.
   *
   * A stroked circle was the first thing drawn here and is the wrong picture:
   * a hard white hoop reads as an outline the explosion is *inside*. This is a
   * shell of light — transparent on both sides of the front and brightest
   * exactly on it — so what travels is an edge rather than a drawn ring.
   */
  private drawRing(
    ctx: CanvasRenderingContext2D,
    l: Layout,
    b: Blast,
    u: number,
    reach: number,
  ): void {
    const r = reach * u ** 0.68 * 1.18;
    // The shell thickens as it goes and thins as it dies, which is what keeps
    // it a front rather than a line that happens to be moving.
    const w = Math.max(l.tile * 0.25, r * 0.16) * (1 - u * 0.55);
    const outer = r + w;
    if (outer < 2) return;
    const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, outer);
    const inner = unit((r - w) / outer);
    const front = unit(r / outer);
    g.addColorStop(0, rgba("#FFFFFF", 0));
    g.addColorStop(inner, rgba(b.hex, 0));
    g.addColorStop(front, rgba("#FFFFFF", unit(0.7 * (1 - u) ** 1.1)));
    g.addColorStop(1, rgba(b.hex, 0));
    ctx.globalAlpha = 1;
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(b.x, b.y, outer, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Streaks thrown along the front, **every one a different length**. Fourteen
   * even bars of one size drew a clock face — the eye read the spacing before
   * it read the light — so the lengths, widths and brightnesses all come off
   * one integer hash, and half of them reach past the front while half fall
   * short, which is what makes the edge ragged instead of drawn.
   */
  private drawSpokes(ctx: CanvasRenderingContext2D, b: Blast, u: number, reach: number): void {
    const front = reach * u ** 0.62;
    const fade = (1 - u) ** 1.5;
    for (let i = 0; i < SPOKES; i++) {
      // Three streams off one integer, none of them in step with the angle:
      // an irrational turn per spoke is what keeps the ring from reading as
      // a wheel with a fixed number of spokes.
      const a = i * 2.399963 + 0.7;
      const k = wobble(i);
      const far = front * (0.5 + 0.8 * k);
      const near = far * (0.18 + 0.3 * wobble(i + 31));
      if (far - near < 1) continue;
      ctx.globalAlpha = unit(fade * (0.25 + 0.55 * wobble(i + 71)));
      // Most of them carry the ember a lure already burns through its own
      // hole with; a few are the body's colour, so the debris belongs to the
      // thing that threw it rather than to the fire alone.
      ctx.strokeStyle = i % 3 === 0 ? b.hex : PALETTE.ember;
      ctx.lineWidth = Math.max(0.6, reach * (0.004 + 0.012 * k) * (1 - u * 0.7));
      ctx.beginPath();
      ctx.moveTo(b.x + Math.cos(a) * near, b.y + Math.sin(a) * near);
      ctx.lineTo(b.x + Math.cos(a) * far, b.y + Math.sin(a) * far);
      ctx.stroke();
    }
  }

  /**
   * What is left once the shape of it has gone: the screen still lit in the
   * colour of the body that did this, fading while the pair reads three new
   * cracks in the hull. The quietest part, and the one still there when they
   * look down.
   */
  private drawAfterglow(ctx: CanvasRenderingContext2D, l: Layout, b: Blast, u: number): void {
    ctx.globalAlpha = unit(0.26 * (1 - u) ** 1.8);
    ctx.fillStyle = b.hex;
    ctx.fillRect(0, 0, l.width, l.height);
  }
}
