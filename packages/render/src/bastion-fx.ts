import { type BastionState, type SimConfig, type SimEvent, shieldRow } from "@neon-spore/sim";
import {
  type At,
  BASTION_PLATE_IN,
  BASTION_SHELL_TILES,
  bastionCentre,
  bastionGunAt,
  bastionNodeAt,
  bastionPlateAngle,
  bastionPortAt,
} from "./bastion-shape.js";
import { BastionVerdicts } from "./bastion-verdicts.js";
import { BossHurt } from "./boss-hurt.js";
import type { Burst } from "./effects-boss.js";
import { fieldX } from "./field-flip.js";
import { HullShock } from "./hull-shock.js";
import { type Layout, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * What THE BASTION leaves behind a frame (§11.62, *The receipts*): **the
 * plates torn off**, flying out along their own ways tumbling until they are
 * off the field; **the lightning**, down from a node to the hull when nobody
 * shielded it and up from the shield into the node when somebody did; the
 * hull's shudder as the moon arrives, as a shell comes away and as the core
 * blows; and the bursts every other receipt throws.
 *
 * Every piece off is a counted hit (`BossHurt.jab`), a shell off the blow
 * of a landed sequence (`hit`), and the core blown the last of them.
 *
 * The shell coming away, a shell growing back and the core's swell are the
 * pose, read off the boss (`bastion-pose.ts`, `bastion-shed.ts`). The events
 * carry a piece and a column and no place, so the drawer hands over the boss
 * it drew each frame (`note`), THE LATCH's way. Everything is cleared in
 * `Effects.reset()` (`restart.test.ts`).
 */

/** A plate torn off and flying: which, and how much of its flight is left, 1 to 0. */
export interface Flung {
  piece: number;
  now: number;
}

/** A bolt of lightning: from, to, and how much of its life is left. */
export interface Arc {
  from: At;
  to: At;
  now: number;
}

/** How fast a torn plate flies off and a bolt of lightning fades, per second. */
const FLUNG_DECAY = 0.9;
const ARC_DECAY = 3;
/** The shudders: the arrival, a shell off, the core blown — force, and life in beats. */
const ENTER = [0.2, 0.5] as const;
const SHED = [0.3, 0.6] as const;
const SPENT = [0.6, 1.2] as const;

export class BastionFx {
  private boss: BastionState | null = null;
  private flungOf: Flung[] = [];
  private arcsOf: Arc[] = [];
  /** The knobs' verdicts on a touch (`bastion-verdicts.ts`). */
  readonly marks = new BastionVerdicts();
  /** The hull's shudder as the moon comes in, a shell comes off, and the core blows. */
  readonly shock = new HullShock();
  /** The blow a piece off and a shell off deal. */
  readonly hurt = new BossHurt();

  get flung(): readonly Flung[] {
    return this.flungOf;
  }

  get arcs(): readonly Arc[] {
    return this.arcsOf;
  }

  /** The drawer's word for the moon it drew, which the events do not carry. */
  note(boss: BastionState): void {
    this.boss = boss;
    this.marks.note(boss);
  }

  ingest(
    events: readonly SimEvent[],
    l: Layout,
    cfg: SimConfig,
    beatSeconds: number,
    burst: Burst,
  ): void {
    this.marks.ingest(events);
    for (const e of events) {
      if (!e.type.startsWith("bastion")) continue;
      const c = bastionCentre(l, cfg);
      const offset = (i: number) => this.boss?.steps[this.boss.cursor]?.offsets?.[i] ?? 0;
      switch (e.type) {
        case "bastionEnter":
          this.shock.strike(beatSeconds * ENTER[1], ENTER[0]);
          break;
        case "bastionLayer":
          burst(c.x, c.y, 6, PALETTE.bastionEdge);
          break;
        case "bastionTear": {
          this.flungOf.push({ piece: e.piece, now: 1 });
          const a = bastionPlateAngle(e.piece) - Math.PI / 2;
          const r = ((BASTION_SHELL_TILES.plates + BASTION_PLATE_IN) / 2) * l.tile;
          burst(c.x + Math.cos(a) * r, c.y + Math.sin(a) * r, 10, PALETTE.bastionLight);
          this.hurt.jab();
          break;
        }
        case "bastionSnap": {
          const a = bastionPlateAngle(e.piece) - Math.PI / 2;
          const r = BASTION_PLATE_IN * l.tile;
          burst(c.x + Math.cos(a) * r, c.y + Math.sin(a) * r, 5, PALETTE.bastionEdge);
          break;
        }
        case "bastionGun": {
          const at = bastionGunAt(l, c, 0);
          burst(at.x, at.y, 14, PALETTE.bastionLight);
          burst(at.x, at.y, 6, PALETTE.bastionArmour);
          this.hurt.jab();
          break;
        }
        case "bastionBurst": {
          const node = bastionNodeAt(l, cfg, c, offset(e.piece));
          // Thrown back up off the shield, a row over the hull.
          const shield = { x: fieldX(l, e.col), y: tileCY(l, shieldRow(cfg)) };
          this.arcsOf.push({ from: shield, to: node, now: 1 });
          burst(node.x, node.y, 12, PALETTE.bastionNode);
          this.hurt.jab();
          break;
        }
        case "bastionArc": {
          const node = bastionNodeAt(l, cfg, c, offset(e.piece));
          this.arcsOf.push({ from: node, to: { x: fieldX(l, e.col), y: l.hullY }, now: 1 });
          burst(fieldX(l, e.col), l.hullY, 6, PALETTE.bastionNode);
          break;
        }
        case "bastionPort": {
          const port = bastionPortAt(l, cfg, c, offset(e.piece));
          burst(port.x, port.y, 12, PALETTE.bastionCore);
          this.hurt.jab();
          break;
        }
        case "bastionShed":
          burst(c.x, c.y, 18, PALETTE.good);
          this.shock.strike(beatSeconds * SHED[1], SHED[0]);
          this.hurt.hit();
          break;
        case "bastionRegrow":
          burst(c.x, c.y, 8, PALETTE.red);
          break;
        case "bastionSpent":
          burst(c.x, c.y, 24, PALETTE.bastionCore);
          burst(c.x, c.y, 12, PALETTE.bastionLight);
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
    for (const a of this.arcsOf) a.now = Math.max(0, a.now - ARC_DECAY * step);
    if (this.flungOf.some((f) => f.now <= 0)) this.flungOf = this.flungOf.filter((f) => f.now > 0);
    if (this.arcsOf.some((a) => a.now <= 0)) this.arcsOf = this.arcsOf.filter((a) => a.now > 0);
    this.marks.update(dt);
    this.shock.update(dt);
    this.hurt.update(dt);
  }

  clear(): void {
    this.boss = null;
    this.flungOf = [];
    this.arcsOf = [];
    this.marks.clear();
    this.shock.clear();
    this.hurt.clear();
  }
}
