import type { SimEvent } from "@neon-spore/sim";
import { type Layout, tileCX, tileCY } from "./layout.js";

/**
 * THE LEAD's run littering the field, past the burst it puts over the column:
 * the torch it leaves behind it and the rock it puts ahead.
 *
 * The design has each fall out of the body; the game has them arrive as the
 * field's own creatures under the ridge, with a puff of sparks
 * (`lead-fx.ts`). This keeps each drop for a beat and hands it to
 * `DROP_LOOK`, and the game draws nothing through it — lifted out on 8
 * October 2026 so a fall could be offered in VERSUS (`lead:drop`) without the
 * field changing until the owner chooses. Held in `LeadFx` and cleared with
 * it in `Effects.reset()`.
 */

/** How many beats a drop is handed to the look for. */
export const DROP_BEATS = 1;

/** One torch or rock on its way out, as a screen places it. */
export interface LeadDropping {
  kind: "torch" | "rock";
  /** The column's centre, the ridge's underside over it, and row 0's centre under it. */
  x: number;
  from: number;
  to: number;
  /** 0 on the beat it dropped, 1 as it is handed back to the field. */
  age: number;
}

/** One frame of every drop under way. */
export interface DropDraw {
  ctx: CanvasRenderingContext2D;
  l: Layout;
  drops: readonly LeadDropping[];
  /** The stalk's foot, as this screen draws it, and whether this screen is shown the column it stands in. */
  foot: { x: number; y: number };
  placed: boolean;
}

export interface DropLook {
  draw: (d: DropDraw) => void;
}

/** What the game draws for a drop beyond the burst: nothing. */
export const DROP_LOOK: DropLook = { draw: () => {} };

interface Held {
  kind: "torch" | "rock";
  x: number;
  from: number;
  to: number;
  left: number;
  life: number;
}

/** The drops of the last beat, as `LeadFx` hears them. */
export class LeadDrops {
  private held: Held[] = [];

  ingest(events: readonly SimEvent[], l: Layout, ridgeBottom: number, spb: number): void {
    for (const e of events) {
      if (e.type !== "leadTorch" && e.type !== "leadRock") continue;
      const life = DROP_BEATS * spb;
      this.held.push({
        kind: e.type === "leadTorch" ? "torch" : "rock",
        x: tileCX(l, e.col),
        from: ridgeBottom,
        to: tileCY(l, 0),
        left: life,
        life,
      });
    }
  }

  update(dt: number): void {
    for (const h of this.held) h.left -= dt;
    this.held = this.held.filter((h) => h.left > 0);
  }

  draw(
    ctx: CanvasRenderingContext2D,
    l: Layout,
    foot: { x: number; y: number },
    placed: boolean,
  ): void {
    if (this.held.length === 0) return;
    const drops = this.held.map((h) => ({
      kind: h.kind,
      x: h.x,
      from: h.from,
      to: h.to,
      age: 1 - h.left / h.life,
    }));
    DROP_LOOK.draw({ ctx, l, drops, foot, placed });
  }

  clear(): void {
    this.held = [];
  }
}
