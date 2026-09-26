import { type SimConfig, type SimEvent, TRIVET_PLANTS_PER_FOOT } from "@neon-spore/sim";
import { BossHurt } from "./boss-hurt.js";
import type { Burst } from "./effects-boss.js";
import { fieldX } from "./field-flip.js";
import type { SurfaceY } from "./hull-frame.js";
import { drawHullShock } from "./hull-shock.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { trivetCentre, trivetFoot, trivetHubR } from "./trivet-shape.js";

/**
 * What THE TRIVET leaves behind a frame (§30, *Presentation*): the **thud** of
 * a foot driven home — the stand pressed down a touch and a shudder down the
 * plating; the **clamp** snapping shut across an ankle on its second plant, a
 * flare along it; the **flash** of a hub hit, wider for every hit it has
 * taken; the collapse's flash and the harder shudder of three feet buckling
 * at once; and the bursts its twelve receipts throw.
 *
 * Everything else — how far each foot is swung up, how far clamped, whether
 * the hub is lit, how small its face is — is read off the boss every frame
 * (`trivet-draw.ts`, `trivet-pose.ts`).
 *
 * **Both screens are thrown the same**, like the drawing: a chord is one
 * seat's, but the other has to see it land.
 *
 * **A plant is a chord landed**, and a hub hit a shot landed, so both deal the
 * stand the blow every boss takes (`boss-hurt.ts`) — the plants and the hits
 * are its health together (§11.47). A step lighting, a pad slipping, a foot
 * springing back up, the brace, the hub rocking up and the collapse deal
 * nothing.
 *
 * A hub hit is thrown over the column it was shot in, which is the middle
 * but for a lurch's; a needle turned throws the shield's sparks at the hull
 * under its column. A missed hub or needle throws nothing here: the hull it
 * breaks is the boss's own blow (`trivet-blow.ts`, `boss-strike-fx.ts`).
 *
 * The hub's colour is the lit step's and not in `trivetHit`, so the drawer
 * tells it every frame (`tell`), THE VISE's way. Everything is cleared in
 * `Effects.reset()` (`restart.test.ts`).
 */

/** How far the stand is pressed down by a plant, in tiles. */
const THUD_TILES = 0.07;
const THUD_DECAY = 9;
/** How strong the plating's shudder is for a plant and for the collapse, and how long, in beats. */
const THUD_FORCE = 0.4;
const THUD_BEATS = 0.5;
const COLLAPSE_FORCE = 0.8;
const COLLAPSE_BEATS = 1.2;
/** How fast a clamp's flare, a hub flash and the collapse's fade, per second. */
const SNAP_DECAY = 4;
const FLASH_DECAY = 3;

export class TrivetFx {
  private thudNow = 0;
  private readonly snapNow: [number, number] = [0, 0];
  private flashNow = 0;
  private flashHits = 0;
  private collapseNow = 0;
  private shockLeft = 0;
  private shockLife = 1;
  private shockForce = 0;
  private hubHex: string = PALETTE.hullRim;
  /** The blow a plant and a hub hit deal the stand. */
  readonly hurt = new BossHurt();

  /** How far the whole stand is pressed down right now, in tiles. */
  get thud(): number {
    return this.thudNow;
  }

  /** How bright the flare along foot `side`'s clamp still is, 0..1. */
  snap(side: 0 | 1): number {
    return this.snapNow[side];
  }

  /** The hub hit's flash: how bright it still is, 0..1, and the hit it was (1, 2, 3). */
  get flash(): { now: number; hits: number } {
    return { now: this.flashNow, hits: this.flashHits };
  }

  /** How bright the collapse's flash still is, 0..1. */
  get collapse(): number {
    return this.collapseNow;
  }

  /** The drawer's word for the colour the hub is lit, which `trivetHit` does not carry. */
  tell(hubHex: string): void {
    this.hubHex = hubHex;
  }

  ingest(
    events: readonly SimEvent[],
    l: Layout,
    cfg: SimConfig,
    beatSeconds: number,
    burst: Burst,
  ): void {
    for (const e of events) {
      if (!e.type.startsWith("trivet")) continue;
      const mid = trivetCentre(l, cfg);
      const r = trivetHubR(l);
      switch (e.type) {
        case "trivetEnter":
          burst(mid.x, mid.y, 12, PALETTE.trivetMetal);
          break;
        case "trivetLight":
          burst(mid.x, mid.y, 4, PALETTE.trivetSocket);
          break;
        case "trivetSlip":
          burst(...footAt(l, mid, e.side), 5, PALETTE.trivetSocket);
          break;
        case "trivetPlant":
          // Grit off the plate as it bites, the stand pressed down, the plating thudding.
          burst(...footAt(l, mid, e.side), 10, PALETTE.trivetMetal);
          this.thudNow = Math.max(this.thudNow, THUD_TILES);
          this.shock(beatSeconds * THUD_BEATS, THUD_FORCE);
          if (e.level >= TRIVET_PLANTS_PER_FOOT) this.snapNow[e.side] = 1;
          this.hurt.hit();
          break;
        case "trivetSpring":
          burst(...footAt(l, mid, e.side), 6, PALETTE.trivetMetalDark);
          break;
        case "trivetHub":
          burst(mid.x, mid.y, 10, PALETTE.rock);
          break;
        case "trivetBrace":
          burst(...footAt(l, mid, 0), 4, PALETTE.trivetSocket);
          burst(...footAt(l, mid, 1), 4, PALETTE.trivetSocket);
          break;
        case "trivetRock":
          burst(mid.x, mid.y - r * 0.5, 8, PALETTE.trivetMetalDark);
          break;
        case "trivetHit":
          burst(fieldX(l, e.col), mid.y, 8 + 6 * e.hits, this.hubHex);
          this.flashNow = 1;
          this.flashHits = e.hits;
          this.hurt.hit();
          break;
        case "trivetTurn":
          burst(fieldX(l, e.col), l.hullY - r, 10, PALETTE.trivetSocket);
          break;
        case "trivetCollapse":
          burst(mid.x, mid.y, 24, PALETTE.trivetMetal);
          this.collapseNow = 1;
          this.shock(beatSeconds * COLLAPSE_BEATS, COLLAPSE_FORCE);
          break;
        default:
          break;
      }
    }
  }

  private shock(life: number, force: number): void {
    this.shockLife = Math.max(1e-6, life);
    this.shockLeft = this.shockLife;
    this.shockForce = force;
  }

  update(dt: number): void {
    const step = Math.min(dt, 1 / 30);
    this.thudNow = Math.max(0, this.thudNow - this.thudNow * THUD_DECAY * step);
    if (this.thudNow < 0.002) this.thudNow = 0;
    for (const side of [0, 1] as const) {
      this.snapNow[side] = Math.max(0, this.snapNow[side] - SNAP_DECAY * step);
    }
    this.flashNow = Math.max(0, this.flashNow - FLASH_DECAY * step);
    if (this.flashNow === 0) this.flashHits = 0;
    this.collapseNow = Math.max(0, this.collapseNow - FLASH_DECAY * step);
    this.shockLeft = Math.max(0, this.shockLeft - dt);
    if (this.shockLeft === 0) this.shockForce = 0;
    this.hurt.update(dt);
  }

  /** The shudder down the plating as a foot plants or the stand collapses (`frame-on-ship.ts`). */
  drawShock(ctx: CanvasRenderingContext2D, l: Layout, surfaceY: SurfaceY, time: number): void {
    if (this.shockLeft <= 0) return;
    drawHullShock(ctx, l, surfaceY, time, this.shockForce * (this.shockLeft / this.shockLife));
  }

  clear(): void {
    this.thudNow = 0;
    this.snapNow[0] = 0;
    this.snapNow[1] = 0;
    this.flashNow = 0;
    this.flashHits = 0;
    this.collapseNow = 0;
    this.shockLeft = 0;
    this.shockLife = 1;
    this.shockForce = 0;
    this.hubHex = PALETTE.hullRim;
    this.hurt.clear();
  }
}

/** Where outer foot `side` stands planted, in pixels: the pilot's to the left. */
function footAt(l: Layout, mid: { x: number; y: number }, side: 0 | 1): [number, number] {
  const foot = trivetFoot(l, side, 0, 0);
  return [mid.x + foot.x, mid.y + foot.y];
}
