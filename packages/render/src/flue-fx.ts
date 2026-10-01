import type { SimConfig, SimEvent } from "@neon-spore/sim";
import { BossHurt } from "./boss-hurt.js";
import type { Burst } from "./effects-boss.js";
import { fieldX } from "./field-flip.js";
import { FLUE_ENDS } from "./flue-marks.js";
import { FLUE_DAMPER, flueCentre, flueUnitAt, flueUnitR } from "./flue-shape.js";
import { FlueVerdicts } from "./flue-verdicts.js";
import { HullShock } from "./hull-shock.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * What THE FLUE leaves behind a frame (§40, *Presentation*): the short bright
 * **tick** through the slot where each tap landed, THE RATCHET's click's
 * weight; the small **flash** off the ember as a lapse throws the taps away
 * and it starts gliding again; the **flare** of a vent's notch lighting in its end unit; the
 * **thud** of the damper dropping clear, climbing home or held; the core's
 * **flash**, bigger for every hit; the plating's shudder as the core is bared
 * and as the flue swings open for good; and the bursts its other receipts
 * throw.
 *
 * Everything else — where the ember is, how far the damper is open, which
 * notches are lit, how many studs — is read off the boss every frame
 * (`flue-draw.ts`, `flue-pose.ts`).
 *
 * **Both screens are thrown the same**, like the drawing: the taps are one
 * seat's and the stillness the other's, but each has to see the other land.
 *
 * **A vent spent is a step landed**, a damper held one too, and a core hit a
 * shot landed, so each deals the flue the blow every boss takes
 * (`boss-hurt.ts`); **a tap is one hit that counts inside a vent** and deals
 * the lighter one. A step lighting, the ember steadying or stirring, a skid,
 * a lapse, the core bared, the damper choked or shut deal nothing.
 *
 * A fire step run out throws nothing here: the hull it breaks is the boss's
 * own blow (`flue-blow.ts`). The core's colour is the lit step's and not in
 * `flueHit`, so the drawer tells it every frame (`tell`), THE VISE's way.
 * Which touch was right is `verdicts` (`flue-verdicts.ts`). Everything is cleared in `Effects.reset()` (`restart.test.ts`).
 */

/** How far the damper is knocked down by a thud, in tiles, and how fast it settles back. */
const THUD_TILES = 0.08;
const THUD_DECAY = 9;
/** How strong the plating's shudder is for the core bared and the flue spent, and how long, in beats. */
const BARE_FORCE = 0.3;
const BARE_BEATS = 0.5;
const SPENT_FORCE = 0.8;
const SPENT_BEATS = 1.2;
/** How fast a tap's tick, a lapse's flash, a notch's flare and the core's flash fade, per second. */
const TICK_DECAY = 6;
const LAPSE_DECAY = 4;
const FLARE_DECAY = 3;
const FLASH_DECAY = 3;

export class FlueFx {
  private tickNow = 0;
  private lapseNow = 0;
  private readonly flareNow: [number, number] = [0, 0];
  private thudNow = 0;
  private flashNow = 0;
  private flashHits = 0;
  private coreHex: string = PALETTE.hullRim;
  /** The shudder down the plating as the core is bared and as the flue is spent. */
  readonly shock = new HullShock();
  /** The blow a vent spent, a damper held and a core hit deal the flue; a tap the lighter one. */
  readonly hurt = new BossHurt();
  /** Was the last touch on the ember and on the core right (`flue-verdicts.ts`). */
  readonly verdicts = new FlueVerdicts();

  /** How bright the last tap's tick through the slot still is, 0..1 — drawn over the ember, which a tap finds steady. */
  get tick(): number {
    return this.tickNow;
  }

  /** How bright the flash off the ember a lapse left still is, 0..1. */
  get lapse(): number {
    return this.lapseNow;
  }

  /** How bright the flare on vent `i`'s notch still is, 0..1 — the first on the left end. */
  flare(i: 0 | 1): number {
    return this.flareNow[i];
  }

  /** How far the damper is knocked down right now, in tiles. */
  get thud(): number {
    return this.thudNow;
  }

  /** The core hit's flash: how bright it still is, 0..1, and the hit it was (1, 2, 3). */
  get flash(): { now: number; hits: number } {
    return { now: this.flashNow, hits: this.flashHits };
  }

  /** The drawer's word for the colour the core is lit, which `flueHit` does not carry. */
  tell(coreHex: string): void {
    this.coreHex = coreHex;
  }

  ingest(
    events: readonly SimEvent[],
    l: Layout,
    cfg: SimConfig,
    beatSeconds: number,
    burst: Burst,
  ): void {
    this.verdicts.ingest(events);
    for (const e of events) {
      if (!e.type.startsWith("flue")) continue;
      const mid = flueCentre(l, cfg);
      const under = mid.y + flueUnitR(l);
      switch (e.type) {
        case "flueEnter":
          burst(mid.x, mid.y, 12, PALETTE.flueSoot);
          break;
        case "flueLight":
          burst(mid.x, mid.y, 4, PALETTE.hullRim);
          break;
        case "flueTick":
          // The ember tapped where it stopped: a click of light through the slot.
          this.tickNow = 1;
          burst(fieldX(l, e.col), mid.y, 4, PALETTE.hullRim);
          this.hurt.jab();
          break;
        case "flueSkid":
          burst(fieldX(l, e.col), mid.y, 2, PALETTE.rockDark);
          break;
        case "flueLapse":
          // The taps' studs emptied, and the ember let go.
          this.lapseNow = 1;
          burst(mid.x, mid.y - 0.78 * l.tile, 5, PALETTE.rockDark);
          break;
        case "flueVent": {
          const i = e.vents >= 2 ? 1 : 0;
          const end = flueUnitAt(l, cfg, FLUE_ENDS[i]);
          this.flareNow[i] = 1;
          burst(end.x, end.y - 0.4 * l.tile, 10, PALETTE.hullRim);
          this.hurt.hit();
          break;
        }
        case "flueBare":
          burst(mid.x, under, 10, PALETTE.flueSoot);
          this.thudNow = THUD_TILES;
          this.shock.strike(beatSeconds * BARE_BEATS, BARE_FORCE);
          break;
        case "flueHeld":
          burst(mid.x, under, 6, PALETTE.flueSoot);
          this.thudNow = THUD_TILES;
          this.hurt.hit();
          break;
        case "flueShut":
          burst(mid.x, mid.y, 6, PALETTE.flueSootDark);
          this.thudNow = THUD_TILES;
          break;
        case "flueChoke":
          burst(mid.x, under, 4, PALETTE.rockDark);
          break;
        case "flueHit": {
          const core = flueUnitAt(l, cfg, FLUE_DAMPER);
          burst(core.x, core.y, 8 + 6 * e.hits, this.coreHex);
          this.flashNow = 1;
          this.flashHits = e.hits;
          this.hurt.hit();
          break;
        }
        case "flueSpent":
          burst(mid.x, mid.y, 24, PALETTE.flueSoot);
          burst(mid.x, mid.y, 10, PALETTE.hullRim);
          this.shock.strike(beatSeconds * SPENT_BEATS, SPENT_FORCE);
          break;
        default:
          break;
      }
    }
  }

  update(dt: number): void {
    const step = Math.min(dt, 1 / 30);
    this.tickNow = Math.max(0, this.tickNow - TICK_DECAY * step);
    this.lapseNow = Math.max(0, this.lapseNow - LAPSE_DECAY * step);
    for (const i of [0, 1] as const) {
      this.flareNow[i] = Math.max(0, this.flareNow[i] - FLARE_DECAY * step);
    }
    this.thudNow = Math.max(0, this.thudNow - this.thudNow * THUD_DECAY * step);
    if (this.thudNow < 0.002) this.thudNow = 0;
    this.flashNow = Math.max(0, this.flashNow - FLASH_DECAY * step);
    if (this.flashNow === 0) this.flashHits = 0;
    this.shock.update(dt);
    this.hurt.update(dt);
    this.verdicts.update(dt);
  }

  clear(): void {
    this.tickNow = 0;
    this.lapseNow = 0;
    this.flareNow[0] = 0;
    this.flareNow[1] = 0;
    this.thudNow = 0;
    this.flashNow = 0;
    this.flashHits = 0;
    this.coreHex = PALETTE.hullRim;
    this.shock.clear();
    this.hurt.clear();
    this.verdicts.clear();
  }
}
