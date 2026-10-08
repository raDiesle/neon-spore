import { blisterIsUp, type SimEvent, type World } from "@neon-spore/sim";
import { flatCenter, flatRadius } from "./creature-place.js";
import { drawVerdictRing, GripVerdicts } from "./grip-verdict.js";
import type { Layout } from "./layout.js";

/**
 * **THE BLISTER's verdict**: the green ring every mark in the game throws off
 * a touch that landed (`grip-verdict.ts`), thrown here off every blow that
 * counted (`blisterBlow`).
 *
 * Only green. A blow that does not count is never sent — a press is answered
 * only on a body that is up and only from the seat its `by` allows
 * (`blister-tap.ts`) — so there is no refusal to ring red, and the late tap is
 * its own punishment (`docs/spec/blister.md`).
 *
 * **The ring of the last blow outlives the body.** The blow that finishes it
 * takes it off the field on the same tick, so there is no body to draw round on
 * the frame the verdict arrives. Every frame keeps where each blister up was
 * drawn, and a verdict whose body is gone is drawn there until it fades. Keyed
 * by id, so it is cleared with every other transient on a restart, when ids
 * start again (`restart.test.ts`).
 */
export class BlisterVerdictFx {
  private readonly verdicts = new GripVerdicts();
  private readonly places = new Map<number, Place>();

  ingest(events: readonly SimEvent[]): void {
    for (const e of events) if (e.type === "blisterBlow") this.verdicts.mark(e.id, true);
  }

  update(dt: number): void {
    this.verdicts.update(dt);
  }

  draw(ctx: CanvasRenderingContext2D, l: Layout, world: World, beatPhase: number): void {
    const up = new Set<number>();
    for (const c of world.creatures) {
      if (!blisterIsUp(c)) continue;
      const { x, y } = flatCenter(l, c, beatPhase);
      this.places.set(c.id, { x, y, r: flatRadius(l, world.cfg, c, beatPhase) });
      up.add(c.id);
    }
    for (const [id, p] of this.places) {
      const v = this.verdicts.at(id);
      if (v !== null) drawVerdictRing(ctx, p.x, p.y, p.r, v);
      else if (!up.has(id)) this.places.delete(id);
    }
  }

  clear(): void {
    this.verdicts.clear();
    this.places.clear();
  }
}

/** Where a blister was last drawn, for the ring of the blow that finished it. */
interface Place {
  x: number;
  y: number;
  r: number;
}
