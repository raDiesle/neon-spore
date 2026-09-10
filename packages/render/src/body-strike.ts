import { hasOwnBody, livingPoints, livingSilhouette } from "@neon-spore/content";
import type { SimEvent } from "@neon-spore/sim";
import { type HitLook, hitFor } from "./body-hit.js";
import { contourClock, livingRadius, livingScale } from "./creature-place.js";
import { colorTrio } from "./creature-tint.js";
import type { SurfaceY } from "./hull-frame.js";
import { type Layout, tileCX, tileCY } from "./layout.js";

/**
 * A body on the beat it is struck, drawn where it stood after it is gone.
 *
 * One of `BodyTransients`' pictures of a creature's last moment, and the
 * plainest of them: fed by `destroy`, frozen at the tile the shot landed in,
 * drawn under the hull and dropped on a restart. What it draws is not here at
 * all — it is `HitLook.strike`, reached through `hitFor` so a candidate can
 * stand in for it for the length of one frame (`docs/versus.md`). A record
 * with `life` 0 — the slick's — ingests nothing here, and its kill is the
 * sparks and the pieces it always was.
 *
 * **The outline is cut on the frame of the hit and never again**, for
 * `debris.ts`'s reason: the body is gone from the world on the frame the
 * event arrives, so the contour it wore is the one thing the strike has to
 * draw from, and it is handed over in pixels so a frame costs no scaling.
 *
 * **The floor is read on the frame, off the ship's drawn skin.** What a strike
 * leaves behind lies on the hull, and the hull is a curve: `surfaceY` is the
 * same sampler a worm walks on (`hull-frame.ts`), so a stain lands where the
 * eye sees the skin at that column and not on the flat `hullY` the pieces
 * fall to. Without a ship on the frame it is `hullY`, which is the only line
 * there is.
 */

interface Live {
  readonly look: HitLook;
  readonly x: number;
  readonly y: number;
  readonly hex: string;
  readonly rim: string;
  readonly dark: string;
  readonly outline: readonly { readonly x: number; readonly y: number }[];
  readonly rx: number;
  readonly ry: number;
  readonly tile: number;
  readonly t: number;
  readonly seed: number;
  age: number;
}

export class BodyStrikeFx {
  private live: Live[] = [];

  /** Every `destroy` in this frame's events whose kind asks for a strike. */
  ingest(events: readonly SimEvent[], l: Layout, time: number): void {
    for (const e of events) {
      if (e.type !== "destroy") continue;
      const look = hitFor(e.kind, e.of);
      if (look.life <= 0 || !hasOwnBody(e.kind)) continue;
      const shape = livingSilhouette(e.kind);
      // The plain footprint, as `effects-break.ts` cuts it: there is no
      // creature left to ask how big it was.
      const r = livingRadius(l.tile, 1);
      const scale = livingScale(shape, r);
      const seed = Math.imul(e.col + 1, 73856093) ^ Math.imul(e.row + 1, 19349663);
      const t = contourClock(seed, time);
      const trio = colorTrio(e.color);
      this.live.push({
        look,
        x: tileCX(l, e.col),
        y: tileCY(l, e.row),
        hex: trio.hex,
        rim: trio.rim,
        dark: trio.dark,
        outline: livingPoints(shape, t).map((p) => ({ x: p.x * scale, y: p.y * scale })),
        rx: shape.rx * scale,
        ry: shape.ry * scale,
        tile: l.tile,
        t,
        seed,
        age: 0,
      });
    }
  }

  update(dt: number): void {
    for (const s of this.live) s.age += dt;
    this.live = this.live.filter((s) => s.age < s.look.life);
  }

  draw(ctx: CanvasRenderingContext2D, l: Layout, surfaceY?: SurfaceY): void {
    for (const s of this.live) {
      ctx.save();
      ctx.translate(s.x, s.y);
      s.look.strike(ctx, {
        hex: s.hex,
        rim: s.rim,
        dark: s.dark,
        outline: s.outline,
        rx: s.rx,
        ry: s.ry,
        tile: s.tile,
        floor: (surfaceY ? surfaceY(s.x) : l.hullY) - s.y,
        age: s.age,
        life: s.look.life,
        t: s.t,
        seed: s.seed,
      });
      ctx.restore();
    }
  }

  clear(): void {
    this.live = [];
  }
}
