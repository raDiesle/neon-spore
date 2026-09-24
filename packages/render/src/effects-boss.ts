import type { SimConfig, SimEvent } from "@neon-spore/sim";
import { BossRoster } from "./effects-boss-roster.js";
import type { Layout, ViewRole } from "./layout.js";

/**
 * The transients that belong to **one boss** and are read above the loop:
 * every one here is public, because the boss is drawn as a whole body by
 * `boss-draw.ts` and `boss-draw-clocks.ts` rather than as a handful of
 * particles by `Effects.draw`, and the drawer asks the transient where it is
 * up to (`fx.mirror.armed`, `fleet.spent`, `afterImage.lit`).
 *
 * Cut out of `effects.ts` on 17 September 2026, when THE TASTER's put that
 * roster at 250 lines for the third time and the next boss would have paid
 * for its field by shortening somebody else's paragraph. The seam is the one
 * `effects-body.ts` names — everything `Effects` holds is a property of the
 * ship, a property of a boss, or a particle system the whole field shares —
 * and this is the middle of the three. THE CHOIR's earthquake stays next door:
 * the choir is a creature, and the quake moves the picture rather than a boss.
 *
 * Four verbs, the same four `BodyTransients` agrees on, so `effects-frame.ts`
 * says one word to this object per frame rather than eight. The order inside
 * each is the order the roster had, and the two that are not `clear` —
 * `warden.reset()`, `afterImage.clear()` — are each transient's own name for
 * forgetting. `restart.test.ts` compares a used `Effects` to a fresh one field
 * by field, and this is one field, compared whole.
 *
 * **The roster of fields is `effects-boss-roster.ts`**, the base class this
 * extends, cut off on 22 September 2026 when THE GIMBAL's transient met this
 * page at 245 lines. What is left here is the four verbs.
 */
export class BossTransients extends BossRoster {
  /** `role` is the layout's: a flash lights only the screen whose control
   * made it (`after-image.ts`). */
  ingest(
    events: readonly SimEvent[],
    l: Layout,
    cfg: SimConfig,
    beatSeconds: number,
    time: number,
    role: ViewRole,
    burst: Burst,
  ): void {
    this.mirror.ingest(events);
    this.warden.ingest(events);
    this.gorge.ingest(events, l, burst);
    this.maze.ingest(events);
    this.curtain.ingest(events, l, cfg, beatSeconds, burst);
    this.taster.ingest(events, l, beatSeconds, burst);
    this.sinew.ingest(events, l, cfg, beatSeconds, burst);
    this.ledger.ingest(events, l, cfg, beatSeconds, burst);
    this.surge.ingest(events, l, cfg, beatSeconds, burst);
    this.lead.ingest(events, l, beatSeconds, role, burst);
    this.scuttle.ingest(events, l, cfg, beatSeconds, role, burst);
    this.antiphon.ingest(events, l, cfg, beatSeconds, role, burst);
    this.hive.ingest(events, l, role, burst);
    this.instar.ingest(events, l, burst);
    this.stare.ingest(events, l, cfg, burst);
    this.undertow.ingest(events, l, cfg, beatSeconds, role);
    this.filament.ingest(events, l, cfg, burst);
    this.gimbal.ingest(events, l, cfg, burst);
    this.spool.ingest(events, l, cfg, burst);
    this.hasp.ingest(events, l, cfg, beatSeconds, role, burst);
    this.ratchet.ingest(events, l, cfg, beatSeconds, role, burst);
    this.afterImage.ingest(events, role, time, beatSeconds);
    this.fleet.ingest(events, beatSeconds);
    this.fleetGrip.ingest(events, l, burst);
  }

  /** `burst` is for the fleet alone: a salvo's particles are thrown on the
   * frame it lands, not on the frame the event arrived — a second and a
   * quarter earlier (`fleet-fx.ts`). */
  update(dt: number, l: Layout, burst: Burst): void {
    this.mirror.update(dt);
    this.warden.update(dt);
    this.reprise.update(dt);
    this.gorge.update(dt);
    this.maze.update(dt);
    this.curtain.update(dt);
    this.taster.update(dt);
    this.sinew.update(dt);
    this.ledger.update(dt);
    this.surge.update(dt);
    this.lead.update(dt);
    this.scuttle.update(dt);
    this.antiphon.update(dt);
    this.hive.update(dt);
    this.instar.update(dt);
    this.stare.update(dt);
    this.undertow.update(dt);
    this.filament.update(dt);
    this.gimbal.update(dt);
    this.spool.update(dt);
    this.hasp.update(dt);
    this.ratchet.update(dt);
    this.fleet.update(dt, l, burst);
    this.fleetGrip.update(dt);
  }

  /** The ten drawn under the hull with everything else. The mirror, the
   * maze, the warden, the fleet and the reprise are drawn by the boss pass, the
   * after-image by the renderer between the bodies and the ship, the
   * sinew's shock on the finished ship (`frame-on-ship.ts`) and the stare's
   * flash over the band, last of the frame (`canvas2d.ts`). */
  draw(ctx: CanvasRenderingContext2D, l: Layout): void {
    this.gorge.draw(ctx, l);
    this.curtain.draw(ctx, l);
    this.taster.draw(ctx, l);
    this.sinew.draw(ctx, l);
    this.ledger.draw(ctx, l);
    this.surge.draw(ctx, l);
    this.lead.draw(ctx, l);
    this.scuttle.draw(ctx, l);
    this.antiphon.draw(ctx, l);
    this.instar.draw(ctx, l);
  }

  clear(): void {
    this.mirror.clear();
    this.warden.reset();
    this.fleet.clear();
    this.fleetGrip.clear();
    this.reprise.clear();
    this.afterImage.clear();
    this.gorge.clear();
    this.maze.clear();
    this.curtain.clear();
    this.taster.clear();
    this.sinew.clear();
    this.ledger.clear();
    this.surge.clear();
    this.lead.clear();
    this.scuttle.clear();
    this.antiphon.clear();
    this.hive.clear();
    this.instar.clear();
    this.stare.clear();
    this.undertow.clear();
    this.filament.clear();
    this.gimbal.clear();
    this.spool.clear();
    this.hasp.clear();
    this.ratchet.clear();
  }
}

/** What a boss transient throws its particles through: `Effects`' one spark
 * pool, behind the well's placement (`effects-frame.ts`, `ingestAll`). */
export type Burst = (x: number, y: number, n: number, hex: string) => void;
