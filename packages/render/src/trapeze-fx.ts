import { midCol, type SimConfig, type SimEvent, type TrapezeSide } from "@neon-spore/sim";
import { BossHurt } from "./boss-hurt.js";
import type { Burst } from "./effects-boss.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { trapezeZone } from "./trapeze-marks.js";
import { trapezeAnchor, trapezeOnArc } from "./trapeze-shape.js";
import { TrapezeVerdicts } from "./trapeze-verdicts.js";

/**
 * What THE TRAPEZE keeps between frames (§11.56): the receipts its events
 * leave for a moment, and the bursts they throw. **Both screens are thrown
 * the same.** Cleared in `Effects.reset()`.
 *
 * - **A push** flashes its zone and jabs the swing; **a brake** the same zone,
 *   dull, under the word `TOO EARLY`; a shot that slowed it says `TOO LATE`
 *   from below and `WRONG WAY` from the side.
 * - **A swipe that did nothing says why**, in its zone (the owner, 7 October
 *   2026: *I don't understand why nothing happens on a tap*): `NOT YOUR SIDE`,
 *   `WAIT FOR IT` or `TOWARD THE MIDDLE`, off `trapezeWhiff`'s `why`.
 * - **A shot that pushes** jabs the swing as a push does.
 * - **A gong** rings: a ring thrown off it, brighter for every gong kicked,
 *   the alien's legs thrown straight out at it, and the blow every boss
 *   takes on a step landed (`boss-hurt.ts`).
 * - **Which way the alien faces**, eased as it turns round on the seat to
 *   face the next level's gong (`trapeze-alien.ts`).
 * - **The lock** draws its ring closed round the alien; a shot into it is a
 *   flash on its body.
 */

/** How fast each receipt dies away, per second. */
const PUSH_DECAY = 2.5;
const RING_DECAY = 0.9;
const FLASH_DECAY = 3;
const SNAP_DECAY = 4;
const KICK_DECAY = 2.2;
/** How fast the alien turns round on the seat, in widths a second. */
const TURN = 3;
/** How long a word stands, in seconds. */
const WORD_STANDS = 1.1;

/** Why a swipe did nothing (`sim/trapeze-hand.ts`). */
type TrapezeWhiffWhy = Extract<SimEvent, { type: "trapezeWhiff" }>["why"];

/** What a refused swipe says, in the fewest words that say what to change. */
export function trapezeWhiffWord(why: TrapezeWhiffWhy): string {
  if (why === "seat") return "NOT YOUR SIDE";
  if (why === "way") return "TOWARD THE MIDDLE";
  return "WAIT FOR IT";
}

export interface TrapezeWord {
  text: string;
  side: TrapezeSide;
  age: number;
}

export class TrapezeFx {
  /** Each zone's push flash, left then right, 1 as it lands and 0 gone; and whether it was a brake. */
  readonly push: [number, number] = [0, 0];
  readonly braked: [boolean, boolean] = [false, false];
  /** The last gong's ring, 1 as it is kicked, and the level whose gong it was. */
  ring = 0;
  ringStep = 0;
  /** A shot into the alien, and the lock closing on it, each 1 as it lands. */
  flash = 0;
  snap = 0;
  /** The legs thrown out at the gong, 1 as it is kicked. */
  kick = 0;
  /** Which way the alien faces, -1..1, and which way it is turning to (`trapeze-alien.ts`). */
  facing = 1;
  face: -1 | 1 = 1;
  /** The word standing in a zone, or null. */
  word: TrapezeWord | null = null;
  /** The blow a gong deals the swing, and a push's jab. */
  readonly hurt = new BossHurt();
  /** Whether the last touch on each zone and on the alien was right (`trapeze-verdicts.ts`). */
  readonly verdicts = new TrapezeVerdicts();

  ingest(
    events: readonly SimEvent[],
    l: Layout,
    cfg: SimConfig,
    _beatSeconds: number,
    burst: Burst,
  ): void {
    this.verdicts.ingest(events);
    for (const e of events) {
      if (!e.type.startsWith("trapeze")) continue;
      const seat = trapezeOnArc(l, cfg, 0);
      switch (e.type) {
        case "trapezeEnter": {
          const a = trapezeAnchor(l, cfg);
          burst(a.x, Math.max(a.y, l.gridTop), 8, PALETTE.trapezeRope);
          break;
        }
        case "trapezePush":
        case "trapezeBrake": {
          const i = e.zone < 0 ? 0 : 1;
          const brake = e.type === "trapezeBrake";
          this.push[i] = 1;
          this.braked[i] = brake;
          const z = trapezeZone(l, cfg, e.zone);
          burst(z.x + z.w / 2, z.y + z.h / 2, brake ? 3 : 6, PALETTE.hullRim);
          if (brake) this.say("TOO EARLY", e.zone);
          else this.hurt.jab();
          break;
        }
        case "trapezeWhiff":
          this.say(trapezeWhiffWord(e.why), e.zone);
          break;
        case "trapezeLock":
          this.snap = 1;
          break;
        case "trapezeShot":
          this.flash = 1;
          if (e.gain) this.hurt.jab();
          else this.say(e.side ? "WRONG WAY" : "TOO LATE", e.col < midCol(cfg) ? -1 : 1);
          break;
        case "trapezeGong":
          this.ring = 1;
          this.kick = 1;
          this.ringStep = e.gongs - 1;
          this.hurt.hit();
          break;
        case "trapezeMiss":
          burst(seat.x, seat.y, 8, PALETTE.trapezeRopeDark);
          break;
        case "trapezeSpent":
          burst(seat.x, seat.y, 16, PALETTE.trapezeBrassLit);
          break;
        default:
          break;
      }
    }
  }

  private say(text: string, side: TrapezeSide): void {
    this.word = { text, side, age: 0 };
  }

  update(dt: number): void {
    const step = Math.min(dt, 1 / 30);
    for (const i of [0, 1] as const) this.push[i] = Math.max(0, this.push[i] - PUSH_DECAY * step);
    this.ring = Math.max(0, this.ring - RING_DECAY * step);
    this.flash = Math.max(0, this.flash - FLASH_DECAY * step);
    this.snap = Math.max(0, this.snap - SNAP_DECAY * step);
    this.kick = Math.max(0, this.kick - KICK_DECAY * step);
    const turn = this.face - this.facing;
    this.facing += Math.sign(turn) * Math.min(Math.abs(turn), TURN * step);
    if (this.word !== null) {
      this.word.age += step;
      if (this.word.age >= WORD_STANDS) this.word = null;
    }
    this.hurt.update(dt);
    this.verdicts.update(dt);
  }

  clear(): void {
    this.push[0] = 0;
    this.push[1] = 0;
    this.braked[0] = false;
    this.braked[1] = false;
    this.ring = 0;
    this.ringStep = 0;
    this.flash = 0;
    this.snap = 0;
    this.kick = 0;
    this.facing = 1;
    this.face = 1;
    this.word = null;
    this.hurt.clear();
    this.verdicts.clear();
  }
}
