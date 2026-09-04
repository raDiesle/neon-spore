import { guardArmed, mawOpen, ticksPerBeat, type World, wispOnField } from "@neon-spore/sim";
import { Effects } from "./effects.js";
import { FieldPose } from "./field-pose.js";
import { drawBodies, drawFieldBack, drawOverlays, drawShip } from "./frame-passes.js";
import type { Layout } from "./layout.js";
import type { ViewState } from "./renderer.js";

/**
 * One seat's screen inside a guide's rehearsal, drawn through the shipping
 * renderer's own four passes at that seat's role.
 *
 * **It is the game, and not a diagram of the game.** Everything here is the
 * same call the phone makes — the same backdrop, the same radar, the same
 * bodies, the same membrane, the same band with the same strips and lobes on
 * it — because a guide that drew a simplified hull would teach a shape the
 * game does not have and go on teaching it until somebody changed the lobe
 * (`docs/spec/briefings.md` §3.2). It is drawn at the stage's full size, so
 * the only thing the caller does is translate it during a switch.
 *
 * There is one of these per seat, each with its own `Effects`, because a spark
 * is a fact about one picture and one collection shared between the two
 * screens would ingest every event twice. Both are cleared when the loop wraps
 * — a rebuilt world starts `beat`, `tick` and `nextId` at 0 again, and
 * anything cached against those would be read by the next turn as its own
 * (CLAUDE.md, and `test/restart.test.ts`).
 */
export class SeatView {
  private readonly effects = new Effects();
  private readonly pose = new FieldPose();

  reset(): void {
    this.effects.reset();
    this.pose.reset();
  }

  draw(ctx: CanvasRenderingContext2D, l: Layout, view: ViewState): void {
    const { world } = view;
    this.effects.ingest(view.events, l, view.time, (col, row) => idAt(world, col, row), world.cfg);
    this.effects.update(view.dt, l);
    this.effects.coordGrid.update(view.dt, wispOnField(world));

    const isArmed = guardArmed(world);
    const isOpen = mawOpen(world);
    this.pose.update(isArmed, isOpen, world.cannonCol, world.shieldCol, view.dt);

    const flash = Math.max(0, 1 - view.beatPhase * (ticksPerBeat(world.cfg) / 26));
    drawFieldBack(ctx, l, world, view, flash, this.effects.coordGrid.shown);
    drawBodies(ctx, l, world, view, this.effects);
    drawShip(ctx, l, world, view, this.effects, this.pose.mood(world, this.effects), this.pose.at);
    // No scene of its own, and that is the whole of the recursion guard: a
    // rehearsal's config has `briefings` off, so the opening pass finds
    // nothing to draw and a scene can never open a scene.
    drawOverlays(ctx, l, world, view, isArmed, isOpen);
  }
}

function idAt(world: World, col: number, row: number): number {
  const c = world.creatures.find((x) => x.col === col && x.row === row);
  return c ? c.id : 0;
}
