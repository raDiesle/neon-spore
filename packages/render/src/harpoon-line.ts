import { HARPOON_KINDS, type HarpoonKind, isHarpoonKind, type SimEvent } from "@neon-spore/sim";
import { vesicleAt } from "./fault-emitter.js";
import { strokeGlow } from "./glow.js";
import type { HeldHarpoons } from "./harpoon-place.js";
import { rgba } from "./hex.js";
import { type Layout, tileCX } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * **THE LINE**: the thing at the top of the field firing a body at a control,
 * and reeling it back when the pencil runs out.
 *
 * The owner's point 1 of 14 September 2026 — *it fires the leech very fast,
 * like a harpoon, at the cannon, where it sticks* — and his point 5, *when the
 * timer runs out it is reeled in like a fishing line back to the alien.* He
 * said the general form of it again on 15 September, about every fault at
 * once: *visuals fired and triggered from this blue enemy — it should look like
 * that blue enemy is triggering or shooting it.*
 *
 * **The cable is the steady part and it is not an effect.** For as long as a
 * body is on a control under a fault there is a line from the lantern's vesicle
 * to it, drawn off the world every frame — so it cannot be left behind by a
 * restart, cannot drift out of step with the body it is attached to, and is
 * right on the first frame after a reload mid-wave. What is remembered here is
 * only the two things that have a *duration* and no state in the world: the
 * flight out, which is over before the body's first beat is, and the reel back,
 * which happens after the body has already gone.
 *
 * **The flight is fast enough to be a hit rather than a journey.** A sixth of a
 * second for the length of the field: the pair sees the line arrive and does
 * not see it travel, which is the difference between a harpoon and a rope being
 * lowered. The reel is slower — it is the good news, and it is the one moment
 * in this fault the pair is allowed to watch.
 */

/** Seconds the line takes to reach the control, and to come home. */
const FIRE = 0.16;
const REEL = 0.34;
/** Pulses a second travelling down a held cable, and how long one is. */
const PULSE_HZ = 1.6;
const PULSE = 0.18;

interface Throw {
  kind: HarpoonKind;
  /** Where the far end is going, or coming from. */
  x: number;
  y: number;
  /** Seconds since it started. */
  age: number;
  /** How long it runs. */
  life: number;
  /** Out from the lantern, or home to it. */
  home: boolean;
}

export class HarpoonLineFx {
  private throws: Throw[] = [];

  ingest(events: readonly SimEvent[], l: Layout): void {
    for (const e of events) {
      if (e.type !== "clingGrip" && e.type !== "clingFreed") continue;
      if (!isHarpoonKind(e.kind)) continue;
      // **Where the control is, not where the body was authored.** A grip
      // pushed by the fault carries the control's own column already
      // (`sim/harpoon.ts`); one pushed by the creature that fell down a lane
      // carries it too, and that is the one case this draws for a body the
      // lantern never fired. It is a line to a body on the hull either way,
      // and the steady cable below refuses it — see `held`.
      this.throws.push({
        kind: e.kind,
        x: tileCX(l, e.col),
        y: l.hullY,
        age: 0,
        life: e.type === "clingGrip" ? FIRE : REEL,
        home: e.type === "clingFreed",
      });
    }
  }

  update(dt: number): void {
    for (const t of this.throws) t.age += dt;
    this.throws = this.throws.filter((t) => t.age < t.life);
  }

  reset(): void {
    this.throws = [];
  }

  /**
   * The flights, and the cables of whatever is currently held.
   *
   * `held` is where each body is *drawn*, which is `stuckClingerAt`'s answer
   * and not `creatureCenter`'s: a body on a control rides the eased lobe the
   * ship pass drew, and a cable that ran to the body's own column instead
   * ended a third of a tile to one side of the thing it is attached to. The
   * first picture of a placed leech showed exactly that
   * (`harpoon-place.ts`).
   */
  draw(ctx: CanvasRenderingContext2D, l: Layout, held: HeldHarpoons, time: number): void {
    // Nothing out and nothing held costs nothing at all — not even the
    // `save`/`restore` pair, which is a real op on every frame of every wave
    // that has no such fault and which `wave-budget.test.ts` counts.
    if (this.throws.length === 0 && held.size === 0) return;
    const v = vesicleAt(l);
    ctx.save();
    for (const kind of HARPOON_KINDS) {
      const at = held.get(kind);
      // A cable, while the line is out and the body is on the control. The
      // flight draws its own partial line, so the two never overlap: a throw
      // still running is the whole of the picture until it lands.
      const flying = this.throws.find((t) => t.kind === kind && !t.home);
      if (at && !flying) cable(ctx, l, v, at, time, 1);
    }
    for (const t of this.throws) {
      const share = Math.min(1, t.age / t.life);
      // Out: the far end travels away from the lantern. Home: it travels back.
      const reach = t.home ? 1 - share : share;
      const to = { x: v.x + (t.x - v.x) * reach, y: v.y + (t.y - v.y) * reach };
      // A reel fades as it comes: the line is being taken in, not switched off.
      cable(ctx, l, v, to, time, t.home ? 1 - share * 0.7 : 1);
      head(ctx, l, to, t.home ? 1 - share : 1);
    }
    ctx.restore();
  }
}

/** One line from the vesicle to a point, with a pulse travelling down it. */
function cable(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  v: { x: number; y: number },
  to: { x: number; y: number },
  time: number,
  alpha: number,
): void {
  if (alpha <= 0) return;
  const line = new Path2D();
  line.moveTo(v.x, v.y);
  line.lineTo(to.x, to.y);
  // The fade handed to the glow, which sets its own alpha and would draw the
  // reel's line whole otherwise; and set again for the bead, which it left at 1.
  strokeGlow(ctx, line, PALETTE.arc, Math.max(1, l.tile * 0.05), 0.5, alpha);
  ctx.globalAlpha = alpha;
  // A bright bead running from the lantern to the body, once every PULSE_HZ:
  // the one thing that says which end of this is doing it to the other.
  const phase = (time * PULSE_HZ) % 1;
  const a = Math.max(0, phase - PULSE);
  const bead = new Path2D();
  bead.moveTo(v.x + (to.x - v.x) * a, v.y + (to.y - v.y) * a);
  bead.lineTo(v.x + (to.x - v.x) * phase, v.y + (to.y - v.y) * phase);
  ctx.strokeStyle = rgba(PALETTE.arcRim, 0.9);
  ctx.lineWidth = Math.max(1, l.tile * 0.07);
  ctx.stroke(bead);
  ctx.globalAlpha = 1;
}

/** The barb on the end of a line still in the air. */
function head(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  at: { x: number; y: number },
  alpha: number,
): void {
  if (alpha <= 0) return;
  ctx.globalAlpha = alpha;
  ctx.fillStyle = PALETTE.arcRim;
  ctx.beginPath();
  ctx.arc(at.x, at.y, Math.max(1, l.tile * 0.12), 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}
