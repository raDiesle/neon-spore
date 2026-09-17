import type { SimConfig, SimEvent } from "@neon-spore/sim";
import { AfterImage } from "./after-image.js";
import { CurtainFx } from "./curtain-fx.js";
import { FleetFx } from "./fleet-fx.js";
import { GorgeFx } from "./gorge-fx.js";
import type { Layout, ViewRole } from "./layout.js";
import { LeadFx } from "./lead-fx.js";
import { LedgerFx } from "./ledger-fx.js";
import { RepriseFx } from "./reprise-fx.js";
import { ScuttleFx } from "./scuttle-fx.js";
import { MirrorFx } from "./simon-fx.js";
import { SinewFx } from "./sinew-fx.js";
import { SurgeFx } from "./surge-fx.js";
import { TasterFx } from "./taster-fx.js";
import { WardenFx } from "./warden-fx.js";

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
 */
export class BossTransients {
  /**
   * THE MIRROR's own transients. Public: the boss is drawn as a whole ship
   * rather than as particles, and `canvas2d` reads `armed` and `intake` off
   * it to build the mirror's hull mood.
   */
  readonly mirror = new MirrorFx();
  /** THE WARDEN's one transient: the line whipping down after it is torn.
   * Public for the mirror's reason — the boss is drawn as a whole body by
   * `boss-draw.ts`, not as a handful of particles here. */
  readonly warden = new WardenFx();
  /** THE FLEET's salvoes between the muzzle and the square. Public for the
   * mirror's reason, and asked questions as well as drawn: the marks and the
   * scars check with it before calling a square spent (`fleet-fx.ts`). */
  readonly fleet = new FleetFx();
  /**
   * THE REPRISE's swallow: the moment the count of owed bodies went down, which
   * is the only sign either seat gets that an unseen body has entered the field.
   * Driven from the boss pass rather than fed by an event — an unseen arrival
   * deliberately pushes none — and kept here because it outlives its frame
   * (`reprise-fx.ts`).
   */
  readonly reprise = new RepriseFx();
  /** THE CANDLE's after-image: which columns of the dark field were lit, by
   * what, and how long ago. Public and drawn by the renderer between the
   * bodies and the ship rather than here — it is a mask over the field, not
   * a thing on it (`after-image.ts`, `candle-dark.ts`). */
  readonly afterImage = new AfterImage();
  /** THE GORGE's beads leaving at the end, and the bursts its receipts throw
   * on the way there — read above the loop, the way the mirror's are
   * (`gorge-fx.ts`). */
  readonly gorge = new GorgeFx();
  /** THE CURTAIN's sheet coming down once torn, and its receipts' bursts
   * (`curtain-fx.ts`). */
  readonly curtain = new CurtainFx();
  /** THE TASTER's blades tumbling off the crest, the shiver down the fan as it
   * re-edges, and the colour each blade wore when it went (`taster-fx.ts`). */
  readonly taster = new TasterFx();
  /** THE SINEW's snap: the whip it leaves in the mass, the flash over the
   * field and the shock down the plating, and its receipts' bursts — asked
   * for the whip by the drawer (`sinew-fx.ts`, `sinew-draw.ts`). */
  readonly sinew = new SinewFx();
  /** THE LEDGER's three moments: the whip a warded return throws back up the
   * cord, the shock the ship takes from the rooting and from a return nobody
   * answered, and the flash of the tear — asked for the whip by the drawer
   * (`ledger-fx.ts`, `ledger-draw.ts`). */
  readonly ledger = new LedgerFx();
  /** THE SURGE's vent and burst: the row the bulb sinks through, the jolt
   * through the body, the jet out of the seam, and its receipts' bursts —
   * asked for the sink and the jolt by the drawer (`surge-fx.ts`,
   * `surge-draw.ts`). */
  readonly surge = new SurgeFx();
  /** THE LEAD's spring, whip and tumbling bead, and its receipts' bursts —
   * asked for the angle by the drawer every frame, and told where the stalk
   * stood (`lead-fx.ts`, `lead-draw.ts`). */
  readonly lead = new LeadFx();
  /** THE SCUTTLE's jolt and tumbling plate, and its receipts' bursts — asked
   * for the jolt by the drawer every frame, and told where the live part
   * hung (`scuttle-fx.ts`, `scuttle-draw.ts`). */
  readonly scuttle = new ScuttleFx();

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
    this.curtain.ingest(events, l, cfg, beatSeconds, burst);
    this.taster.ingest(events, l, beatSeconds, burst);
    this.sinew.ingest(events, l, cfg, beatSeconds, burst);
    this.ledger.ingest(events, l, cfg, beatSeconds, burst);
    this.surge.ingest(events, l, cfg, beatSeconds, burst);
    this.lead.ingest(events, l, beatSeconds, role, burst);
    this.scuttle.ingest(events, l, cfg, beatSeconds, role, burst);
    this.afterImage.ingest(events, role, time, beatSeconds);
    this.fleet.ingest(events, beatSeconds);
  }

  /** `burst` is for the fleet alone: a salvo's particles are thrown on the
   * frame it lands, not on the frame the event arrived — a second and a
   * quarter earlier (`fleet-fx.ts`). */
  update(dt: number, l: Layout, burst: Burst): void {
    this.mirror.update(dt);
    this.warden.update(dt);
    this.reprise.update(dt);
    this.gorge.update(dt);
    this.curtain.update(dt);
    this.taster.update(dt);
    this.sinew.update(dt);
    this.ledger.update(dt);
    this.surge.update(dt);
    this.lead.update(dt);
    this.scuttle.update(dt);
    this.fleet.update(dt, l, burst);
  }

  /** The six drawn under the hull with everything else. The mirror, the
   * warden, the fleet and the reprise are drawn by the boss pass, the
   * after-image by the renderer between the bodies and the ship, and the
   * sinew's shock on the finished ship (`frame-on-ship.ts`). */
  draw(ctx: CanvasRenderingContext2D, l: Layout): void {
    this.gorge.draw(ctx, l);
    this.curtain.draw(ctx, l);
    this.taster.draw(ctx, l);
    this.sinew.draw(ctx, l);
    this.ledger.draw(ctx, l);
    this.surge.draw(ctx, l);
    this.lead.draw(ctx, l);
    this.scuttle.draw(ctx, l);
  }

  clear(): void {
    this.mirror.clear();
    this.warden.reset();
    this.fleet.clear();
    this.reprise.clear();
    this.afterImage.clear();
    this.gorge.clear();
    this.curtain.clear();
    this.taster.clear();
    this.sinew.clear();
    this.ledger.clear();
    this.surge.clear();
    this.lead.clear();
    this.scuttle.clear();
  }
}

/** What a boss transient throws its particles through: `Effects`' one spark
 * pool, behind the well's placement (`effects-frame.ts`, `ingestAll`). */
export type Burst = (x: number, y: number, n: number, hex: string) => void;
