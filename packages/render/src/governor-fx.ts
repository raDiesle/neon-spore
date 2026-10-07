import type { SimConfig, SimEvent } from "@neon-spore/sim";
import { BossHurt } from "./boss-hurt.js";
import type { Burst } from "./effects-boss.js";
import { TILT_READ } from "./governor-pose.js";
import { dialAt, governorDial, TRACK_OUT } from "./governor-shape.js";
import { GovernorVerdicts } from "./governor-verdicts.js";
import type { GripVerdicts } from "./grip-verdict.js";
import { HullShock } from "./hull-shock.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * What THE GOVERNOR leaves behind a frame (§11.58, *The receipts*): the
 * **flash on the rim** where a tap or a retap landed, the lit mark's place;
 * the **scrape** a skid leaves along the track behind the needle, where the
 * thumb came down with the needle off the mark; the **hit's flash** in the gap, bigger
 * for every hit; the plating's shudder as the hub lights and as the governor
 * flies apart for good; the bursts its other receipts throw; and its three
 * marks' verdicts on a touch (`governor-verdicts.ts`).
 *
 * Everything else — where the needle is, how high the flyweights fly, which
 * studs are lit — is read off the boss every frame (`governor-draw.ts`).
 *
 * **Both screens are thrown the same**, like the drawing: the taps are one
 * seat's and the brake the other's, but each has to see the other land.
 *
 * **A run's third tap is a run landed**, a retap a step landed and a hub hit
 * a shot landed, so each deals the governor the blow every boss takes
 * (`boss-hurt.ts`); **the other taps count inside a run** and deal the
 * lighter one. A step lighting, a chord planted or slipped, a skid, a sway, a
 * dim, the hub lighting and the spend deal nothing.
 *
 * The events carry no place on the dial, so the fx keeps two: the mark a
 * step lit on (`governorLight`), where its tap flashes, and the needle as it
 * was last drawn (`note`), where a skid scrapes. A fire step run out throws
 * nothing here: the hull it breaks is the governor's own blow
 * (`governor-blow.ts`). The hub's colour is the lit step's and not in
 * `governorHit`, so the drawer tells it every frame, THE FLUE's way.
 * Everything is cleared in `Effects.reset()` (`restart.test.ts`).
 */

/** How strong the plating's shudder is for the hub lit and the governor spent, and how long, in beats. */
const HUB_FORCE = 0.3;
const HUB_BEATS = 0.5;
const SPENT_FORCE = 0.8;
const SPENT_BEATS = 1.2;
/** How fast a tap's flash, a skid's scrape and the hub's flash fade, per second. */
const TAP_DECAY = 5;
const SCRAPE_DECAY = 2.5;
const FLASH_DECAY = 3;

export class GovernorFx {
  private tapNow = 0;
  private tapMilli = 0;
  private scrapeNow = 0;
  private scrapeMilli = 0;
  private flashNow = 0;
  private flashHits = 0;
  private needleMilli = 0;
  private hubHex: string = PALETTE.hullRim;
  /** The shudder down the plating as the hub lights and as the governor is spent. */
  readonly shock = new HullShock();
  /** The blow a run landed, a retap and a hub hit deal the governor; a tap the lighter one. */
  readonly hurt = new BossHurt();
  private readonly said = new GovernorVerdicts();

  /** The mark's, the yoke's and the hub's verdicts on a touch. */
  get verdicts(): GripVerdicts {
    return this.said.verdicts;
  }

  /** The last tap's flash on the rim: how bright it still is, 0..1, and where, in thousandths of a lap. */
  get tap(): { now: number; milli: number } {
    return { now: this.tapNow, milli: this.tapMilli };
  }

  /** The last skid's scrape along the track: how dark it still is, 0..1, and where the needle was. */
  get scrape(): { now: number; milli: number } {
    return { now: this.scrapeNow, milli: this.scrapeMilli };
  }

  /** The hub hit's flash: how bright it still is, 0..1, and the hit it was (1, 2, 3). */
  get flash(): { now: number; hits: number } {
    return { now: this.flashNow, hits: this.flashHits };
  }

  /** The drawer's word for where the needle is and the colour the hub is lit, which the events do not carry. */
  note(needleMilli: number, hubHex: string): void {
    this.needleMilli = needleMilli;
    this.hubHex = hubHex;
  }

  ingest(
    events: readonly SimEvent[],
    l: Layout,
    cfg: SimConfig,
    beatSeconds: number,
    burst: Burst,
  ): void {
    this.said.ingest(events);
    for (const e of events) {
      if (!e.type.startsWith("governor")) continue;
      const d = governorDial(l, cfg, TILT_READ);
      switch (e.type) {
        case "governorEnter":
          burst(d.cx, d.cy, 12, PALETTE.governorBrass);
          break;
        case "governorTick": {
          // The needle caught on the mark: a flash of light off the rim there.
          this.tapNow = 1;
          this.tapMilli = e.markMilli;
          const at = dialAt(d, e.markMilli, TRACK_OUT);
          burst(at.x, at.y, 6, PALETTE.hullRim);
          this.hurt.jab();
          break;
        }
        case "governorRetap":
          this.hurt.hit();
          break;
        case "governorSkid": {
          // The thumb came down with the needle off the mark: it scrapes on past.
          this.scrapeNow = 1;
          this.scrapeMilli = this.needleMilli;
          const at = dialAt(d, this.needleMilli, TRACK_OUT);
          burst(at.x, at.y, 3, PALETTE.rockDark);
          break;
        }
        case "governorSway": {
          const at = dialAt(d, this.needleMilli, TRACK_OUT);
          burst(at.x, at.y, 3, PALETTE.rockDark);
          break;
        }
        case "governorHub":
          burst(d.cx, d.cy, 10, PALETTE.hullRim);
          this.shock.strike(beatSeconds * HUB_BEATS, HUB_FORCE);
          break;
        case "governorDim":
          burst(d.cx, d.cy, 4, PALETTE.rockDark);
          break;
        case "governorHit":
          burst(d.cx, d.cy, 8 + 6 * e.hits, this.hubHex);
          this.flashNow = 1;
          this.flashHits = e.hits;
          this.hurt.hit();
          break;
        case "governorSpent":
          burst(d.cx, d.cy, 24, PALETTE.governorBrass);
          burst(d.cx, d.cy, 10, PALETTE.hullRim);
          this.shock.strike(beatSeconds * SPENT_BEATS, SPENT_FORCE);
          break;
        default:
          break;
      }
    }
  }

  update(dt: number): void {
    const step = Math.min(dt, 1 / 30);
    this.tapNow = Math.max(0, this.tapNow - TAP_DECAY * step);
    this.scrapeNow = Math.max(0, this.scrapeNow - SCRAPE_DECAY * step);
    this.flashNow = Math.max(0, this.flashNow - FLASH_DECAY * step);
    if (this.flashNow === 0) this.flashHits = 0;
    this.shock.update(dt);
    this.hurt.update(dt);
    this.said.update(dt);
  }

  clear(): void {
    this.tapNow = 0;
    this.tapMilli = 0;
    this.scrapeNow = 0;
    this.scrapeMilli = 0;
    this.flashNow = 0;
    this.flashHits = 0;
    this.needleMilli = 0;
    this.hubHex = PALETTE.hullRim;
    this.shock.clear();
    this.hurt.clear();
    this.said.clear();
  }
}
