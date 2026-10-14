import type { SimConfig, SimEvent } from "@neon-spore/sim";
import { BossHurt } from "./boss-hurt.js";
import type { Burst } from "./effects-boss.js";
import { fieldX } from "./field-flip.js";
import { HullShock } from "./hull-shock.js";
import { type At, hydraCentre, hydraCoilAt, hydraEyeHeadAt } from "./hydra-shape.js";
import { HydraVerdicts } from "./hydra-verdicts.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * What THE HYDRA leaves behind a frame (§11.64, *The receipts*): **a head
 * cut off**, falling and tumbling down the field with its jaws slack; **a
 * coil turned off**, its rings slackening and dropping away; **a maw
 * quenched**, steam boiling up off it; **the head that struck**, lunging on
 * a neck stretched down to the hull; the hull's shudder as the body comes
 * in, as a level is stopped and as it is beaten; and the bursts every other
 * receipt throws.
 *
 * **The events carry a piece, and the picture knows where it was**: the
 * drawer notes every head where it draws it (`note`), and a receipt starts
 * from the place noted — so a cut head falls from where the pair saw it,
 * however far its window had let it come. The notes are cleared as a new
 * level comes and in `Effects.reset()` (`restart.test.ts`).
 *
 * Every head stopped is a counted hit (`BossHurt.jab`), a level stopped the
 * blow of a landed sequence (`hit`), and the beaten body the last of them.
 */

/** Something let go of the body and falling: from where, which way it turns, and how much of its fall is left, 1 to 0. */
export interface Fallen {
  at: At;
  angle: number;
  side: -1 | 1;
  now: number;
}

/** The head that struck, stretched from where it was to the column on the hull. */
export interface Lunge {
  from: At;
  to: At;
  now: number;
}

/** How fast a head falls, a coil drops, steam boils and a lunge is spent, per second. */
const FALL_DECAY = 0.75;
const STEAM_DECAY = 0.9;
const LUNGE_DECAY = 0.8;
/** The shudders: the arrival, a level stopped, the body beaten — force, and life in beats. */
const ENTER = [0.2, 0.6] as const;
const CLEARED = [0.3, 0.6] as const;
const SPENT = [0.55, 1.2] as const;

export class HydraFx {
  private notes = new Map<number, { at: At; angle: number }>();
  private headsOf: Fallen[] = [];
  private coilsOf: Fallen[] = [];
  private steamOf: Fallen[] = [];
  private lungeOf: Lunge | null = null;
  /** The hull's shudder as the body comes in, a level is stopped, and it is beaten. */
  readonly shock = new HullShock();
  /** The blow a head stopped and a level stopped deal. */
  readonly hurt = new BossHurt();
  /** What the marks said back to the last touch on each (`hydra-verdicts.ts`). */
  readonly marks = new HydraVerdicts();

  get heads(): readonly Fallen[] {
    return this.headsOf;
  }

  get coils(): readonly Fallen[] {
    return this.coilsOf;
  }

  get steam(): readonly Fallen[] {
    return this.steamOf;
  }

  get lunge(): Lunge | null {
    return this.lungeOf;
  }

  /** Where the drawer drew piece `i` of the level out this frame. */
  note(i: number, at: At, angle: number): void {
    this.notes.set(i, { at, angle });
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
      if (!e.type.startsWith("hydra")) continue;
      const c = hydraCentre(l, cfg);
      const seen = "piece" in e ? this.notes.get(e.piece) : undefined;
      const side: -1 | 1 = "col" in e && fieldX(l, e.col) < c.x ? -1 : 1;
      switch (e.type) {
        case "hydraEnter":
          this.shock.strike(beatSeconds * ENTER[1], ENTER[0]);
          break;
        case "hydraHeads":
          this.notes.clear();
          burst(c.x, c.y, 8, PALETTE.hydraScale);
          break;
        case "hydraCut":
          if (seen !== undefined) {
            this.headsOf.push({ ...seen, side, now: 1 });
            burst(seen.at.x, seen.at.y, 14, PALETTE.hydraIchor);
            burst(seen.at.x, seen.at.y, 6, PALETTE.hydraScale);
          }
          this.hurt.jab();
          break;
        case "hydraGlance":
          if (seen !== undefined) burst(seen.at.x, seen.at.y, 4, PALETTE.hydraScale);
          break;
        case "hydraLap": {
          const at = hydraCoilAt(l, cfg, e.seat);
          burst(at.x, at.y, 4, PALETTE.hydraScale);
          break;
        }
        case "hydraUncoil": {
          const at = hydraCoilAt(l, cfg, e.seat);
          this.coilsOf.push({ at, angle: 0, side, now: 1 });
          burst(at.x, at.y, 14, PALETTE.hydraIchor);
          this.hurt.jab();
          break;
        }
        case "hydraPoke":
          if (seen !== undefined) {
            burst(seen.at.x, seen.at.y, 10, PALETTE.hydraIris);
            burst(seen.at.x, seen.at.y, 8, PALETTE.hydraIchor);
          }
          this.hurt.jab();
          break;
        case "hydraMiss": {
          const at = hydraEyeHeadAt(l, cfg, e.seat);
          burst(at.x, at.y, 3, PALETTE.hydraSmoke);
          break;
        }
        case "hydraMaw":
          if (seen !== undefined) burst(seen.at.x, seen.at.y, 6, PALETTE.hydraFire);
          break;
        case "hydraQuench":
          if (seen !== undefined) {
            this.steamOf.push({ ...seen, side, now: 1 });
            burst(seen.at.x, seen.at.y, 12, PALETTE.hydraFire);
          }
          this.hurt.jab();
          break;
        case "hydraCleared":
          burst(c.x, c.y, 18, PALETTE.good);
          this.shock.strike(beatSeconds * CLEARED[1], CLEARED[0]);
          this.hurt.hit();
          break;
        case "hydraStrike": {
          const from = seen?.at ?? c;
          this.lungeOf = { from, to: { x: fieldX(l, e.col), y: l.hullY }, now: 1 };
          break;
        }
        case "hydraSpent":
          burst(c.x, c.y, 24, PALETTE.hydraIchor);
          burst(c.x, c.y, 12, PALETTE.hydraSpot);
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
    for (const f of this.headsOf) f.now = Math.max(0, f.now - FALL_DECAY * step);
    for (const f of this.coilsOf) f.now = Math.max(0, f.now - FALL_DECAY * step);
    for (const f of this.steamOf) f.now = Math.max(0, f.now - STEAM_DECAY * step);
    if (this.lungeOf !== null) {
      this.lungeOf.now = Math.max(0, this.lungeOf.now - LUNGE_DECAY * step);
      if (this.lungeOf.now <= 0) this.lungeOf = null;
    }
    if (this.headsOf.some((f) => f.now <= 0)) this.headsOf = this.headsOf.filter((f) => f.now > 0);
    if (this.coilsOf.some((f) => f.now <= 0)) this.coilsOf = this.coilsOf.filter((f) => f.now > 0);
    if (this.steamOf.some((f) => f.now <= 0)) this.steamOf = this.steamOf.filter((f) => f.now > 0);
    this.shock.update(dt);
    this.hurt.update(dt);
    this.marks.update(dt);
  }

  clear(): void {
    this.notes.clear();
    this.headsOf = [];
    this.coilsOf = [];
    this.steamOf = [];
    this.lungeOf = null;
    this.shock.clear();
    this.hurt.clear();
    this.marks.clear();
  }
}
