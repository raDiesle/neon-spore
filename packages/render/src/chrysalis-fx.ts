import { midCol, type SimConfig, type SimEvent, shieldRow } from "@neon-spore/sim";
import { BossHurt } from "./boss-hurt.js";
import {
  type At,
  CHRYSALIS_SKIN_TILES,
  chrysalisCentre,
  chrysalisPoreAt,
  chrysalisSacAt,
  QUILL_ROOT,
  QUILL_TIP,
  quillAt,
} from "./chrysalis-shape.js";
import type { Burst } from "./effects-boss.js";
import { fieldX } from "./field-flip.js";
import { HullShock } from "./hull-shock.js";
import { type Layout, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * What THE CHRYSALIS leaves behind a frame (§11.63, *The receipts*): **the
 * quills ripped out**, flying off along their ways tumbling; **the slime
 * wiped off**, globs of it dropping down the field; **the spores**, falling
 * down a sac's column to the hull when nobody shielded it and thrown back up
 * from the shield into the sac when somebody did; the hull's shudder as the
 * cocoon comes in, as a skin peels and as the grub dies; and the bursts every
 * other receipt throws.
 *
 * Every piece off is a counted hit (`BossHurt.jab`), a skin off the blow of a
 * landed sequence (`hit`), and the grub dying the last of them.
 *
 * The events carry a piece and a column, and that is all it needs: a quill
 * is placed by its index, a sac and a pore by their column. Everything is
 * cleared in `Effects.reset()` (`restart.test.ts`).
 */

/** A quill ripped out and flying: which, and how much of its flight is left, 1 to 0. */
export interface FlungQuill {
  piece: number;
  now: number;
}

/** A glob of slime dropping from where it was wiped. */
export interface Glob {
  x: number;
  y: number;
  now: number;
}

/** Spores on their way, from one point to another, and how much of the way is left. */
export interface Spores {
  from: At;
  to: At;
  now: number;
}

/** How fast a quill flies off, a glob drops and a cloud of spores travels, per second. */
const FLUNG_DECAY = 0.9;
const GLOB_DECAY = 0.8;
const SPORE_DECAY = 1.6;
/** The shudders: the arrival, a skin off, the grub dying — force, and life in beats. */
const ENTER = [0.15, 0.5] as const;
const SHED = [0.3, 0.6] as const;
const SPENT = [0.55, 1.2] as const;

export class ChrysalisFx {
  private flungOf: FlungQuill[] = [];
  private globsOf: Glob[] = [];
  private sporesOf: Spores[] = [];
  /** The hull's shudder as the cocoon comes in, a skin peels, and the grub dies. */
  readonly shock = new HullShock();
  /** The blow a piece off and a skin off deal. */
  readonly hurt = new BossHurt();

  get flung(): readonly FlungQuill[] {
    return this.flungOf;
  }

  get globs(): readonly Glob[] {
    return this.globsOf;
  }

  get spores(): readonly Spores[] {
    return this.sporesOf;
  }

  ingest(
    events: readonly SimEvent[],
    l: Layout,
    cfg: SimConfig,
    beatSeconds: number,
    burst: Burst,
  ): void {
    for (const e of events) {
      if (!e.type.startsWith("chrysalis")) continue;
      const c = chrysalisCentre(l, cfg);
      const off = "col" in e ? e.col - midCol(cfg) : 0;
      switch (e.type) {
        case "chrysalisEnter":
          this.shock.strike(beatSeconds * ENTER[1], ENTER[0]);
          break;
        case "chrysalisSkin":
          burst(c.x, c.y, 6, PALETTE.chrysalisRidge);
          break;
        case "chrysalisRub": {
          const side = e.seat === 0 ? -1 : 1;
          burst(c.x + side * l.tile * 1.8, c.y, 3, PALETTE.chrysalisSheen);
          break;
        }
        case "chrysalisWipe": {
          const side = e.seat === 0 ? -1 : 1;
          const r = CHRYSALIS_SKIN_TILES.slime * l.tile;
          for (const across of [0.3, 0.6, 0.85]) {
            this.globsOf.push({ x: c.x + side * r * across, y: c.y + r * 0.6, now: 1 });
          }
          burst(c.x + side * r * 0.5, c.y, 14, PALETTE.chrysalisSlime);
          this.hurt.jab();
          break;
        }
        case "chrysalisRip": {
          this.flungOf.push({ piece: e.piece, now: 1 });
          const at = quillAt(l, c, e.piece, (QUILL_ROOT + QUILL_TIP) / 2);
          burst(at.x, at.y, 10, PALETTE.chrysalisQuill);
          burst(at.x, at.y, 6, PALETTE.chrysalisSpore);
          this.hurt.jab();
          break;
        }
        case "chrysalisSnap": {
          const at = quillAt(l, c, e.piece, QUILL_ROOT + 0.5);
          burst(at.x, at.y, 5, PALETTE.chrysalisRidge);
          break;
        }
        case "chrysalisBurst": {
          const sac = chrysalisSacAt(l, cfg, c, off);
          const shield = { x: fieldX(l, e.col), y: tileCY(l, shieldRow(cfg)) };
          this.sporesOf.push({ from: shield, to: sac, now: 1 });
          burst(sac.x, sac.y, 14, PALETTE.chrysalisSpore);
          burst(sac.x, sac.y, 6, PALETTE.chrysalisSac);
          this.hurt.jab();
          break;
        }
        case "chrysalisSpray": {
          const sac = chrysalisSacAt(l, cfg, c, off);
          this.sporesOf.push({ from: sac, to: { x: fieldX(l, e.col), y: l.hullY }, now: 1 });
          break;
        }
        case "chrysalisHeart": {
          const pore = chrysalisPoreAt(l, cfg, c, off);
          burst(pore.x, pore.y, 14, PALETTE.chrysalisGrub);
          burst(pore.x, pore.y, 6, "#FFFFFF");
          this.hurt.jab();
          break;
        }
        case "chrysalisShed":
          burst(c.x, c.y, 18, PALETTE.good);
          this.shock.strike(beatSeconds * SHED[1], SHED[0]);
          this.hurt.hit();
          break;
        case "chrysalisRegrow":
          burst(c.x, c.y, 8, PALETTE.red);
          break;
        case "chrysalisSpent":
          burst(c.x, c.y, 24, PALETTE.chrysalisGrub);
          burst(c.x, c.y, 12, PALETTE.chrysalisSpore);
          this.shock.strike(beatSeconds * SPENT[1], SPENT[0]);
          this.hurt.hit();
          break;
        default:
          break;
      }
    }
  }

  update(dt: number): void {
    const step = Math.min(dt, 1 / 30);
    for (const f of this.flungOf) f.now = Math.max(0, f.now - FLUNG_DECAY * step);
    for (const g of this.globsOf) g.now = Math.max(0, g.now - GLOB_DECAY * step);
    for (const s of this.sporesOf) s.now = Math.max(0, s.now - SPORE_DECAY * step);
    if (this.flungOf.some((f) => f.now <= 0)) this.flungOf = this.flungOf.filter((f) => f.now > 0);
    if (this.globsOf.some((g) => g.now <= 0)) this.globsOf = this.globsOf.filter((g) => g.now > 0);
    if (this.sporesOf.some((s) => s.now <= 0))
      this.sporesOf = this.sporesOf.filter((s) => s.now > 0);
    this.shock.update(dt);
    this.hurt.update(dt);
  }

  clear(): void {
    this.flungOf = [];
    this.globsOf = [];
    this.sporesOf = [];
    this.shock.clear();
    this.hurt.clear();
  }
}
