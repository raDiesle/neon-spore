import { harpoonDangerMilli, type World } from "@neon-spore/sim";
import { halo } from "./glow.js";
import type { HullFrame } from "./hull-frame.js";
import type { LobePositions } from "./hull-mood.js";
import type { HullSkin } from "./hull-skin.js";
import { type Layout, tileCX } from "./layout.js";
import { rimSpan } from "./shield.js";

/**
 * **THE CONTROL HEATING UP UNDER A HARPOON.**
 *
 * The owner's point 6, on 14 September 2026: *the cannon turns a dangerous
 * colour while it is stuck — each time the move-timer restarts after a move
 * the glow starts from the beginning and grows toward a colour that says about
 * to explode.* THE LIMPET's entry says the same thing about the dome.
 *
 * **The whole of the growth is `harpoonDangerMilli`** (`sim/harpoon.ts`), which
 * is the share of the still-count already spent — nought the tick after a move
 * and a thousand on the tick the round is lost. So the restart on a move is not
 * this file's doing and cannot drift from the rule it is drawing: the number
 * this reads goes back to nought on the same tick the simulation clears the
 * count, because it *is* that count.
 *
 * **The colour is the seat's own and is reached rather than borrowed.** The
 * owner asked for it to come from the `HullSkin` and never from `PALETTE`, and
 * that is not a formality — a red laid over a violet ship and an amber one
 * would be the same warning in a colour neither of them owns, which is the one
 * thing the two skins exist to avoid (`seat-skin.ts`). The ramp runs from the
 * skin's own `rim` to its `edge`, which is the brightest thread that skin has:
 * a lobe going white-hot in its own hue. Violet and gold both read as heat at
 * the top of their range, and neither of them reads as *the other seat*.
 *
 * **It quickens.** A glow that only brightened would say *worse* without
 * saying *soon*; the pulse goes from something slow to about four beats a
 * second, so the thing a player catches out of the corner of an eye is the
 * rate. The last fifth is held near the top of the ramp rather than pulsed all
 * the way down, because a warning that goes dark on the tick before it goes off
 * is a warning that flickers out exactly when it matters.
 */

/** How near the loss each control is, nought to one. Absent is nothing stuck.
 * Two numbers and not one: a wave may place both pencils over the same beats
 * (`sim/fault-placed.ts`), and one field could only ever draw one of them. */
export interface HarpoonDanger {
  cannon: number;
  shield: number;
}

/** Radius of the heat over a lobe, in tiles, at nothing and at full. */
const R_FROM = 0.7;
const R_TO = 1.5;
/** Pulses a second, at nothing and at full. */
const HZ_FROM = 1.1;
const HZ_TO = 4;
/** How deep the pulse dips below the ramp. Shallower as it climbs: see above. */
const DIP = 0.34;

/** One channel of the ramp, blended `t` of the way from `a` to `b`. */
function mix(a: string, b: string, t: number, at: number): number {
  const from = Number.parseInt(a.slice(at, at + 2), 16);
  const to = Number.parseInt(b.slice(at, at + 2), 16);
  return Math.round(from + (to - from) * t);
}

/** The skin's own rim carried `t` of the way to its brightest thread. */
export function dangerColor(skin: HullSkin, t: number): string {
  const hex = (n: number) => n.toString(16).padStart(2, "0");
  const r = mix(skin.rim, skin.edge, t, 1);
  const g = mix(skin.rim, skin.edge, t, 3);
  const b = mix(skin.rim, skin.edge, t, 5);
  return `#${hex(r)}${hex(g)}${hex(b)}`;
}

/** How bright the heat is this frame: the ramp, pulsed, quickening. */
export function dangerGlow(danger: number, time: number): number {
  const beat = Math.sin(time * Math.PI * 2 * (HZ_FROM + (HZ_TO - HZ_FROM) * danger));
  // The dip shallows as the ramp climbs, so the last of it never goes dark.
  return Math.max(0, danger * (1 - DIP * (1 - danger) * (0.5 - beat / 2)));
}

/**
 * The heat over whichever controls are held, under the ship's own light.
 *
 * Drawn on **both** screens, which is not an oversight: a control that is about
 * to cost the round is the one thing in this game neither seat may be the only
 * one to know, and it is the seat *without* the control that has to say so
 * (`duty-harpoon.ts` writes the word). What differs per screen is the colour,
 * because the skin does.
 */
export function drawHarpoonDanger(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  danger: HarpoonDanger | undefined,
  time: number,
  f: HullFrame,
  at: LobePositions,
  surface: (x: number) => { x: number; y: number },
  skin: HullSkin,
): void {
  if (!danger) return;
  if (danger.cannon > 0) {
    const tip = surface(f.cannonX);
    heat(ctx, l, danger.cannon, time, tip.x, tip.y, skin);
  }
  if (danger.shield > 0) {
    // Every segment of the body rather than the middle of its span: the dome
    // is a chain of bumps, and one light over the centre of a shield spread
    // across four columns would leave both of its ends cold. `rimSpan` is
    // asked first only for its own answer to *is there a dome at all*.
    if (rimSpan(l, at)) {
      for (const seg of at.shield) {
        const p = surface(tileCX(l, seg.col));
        heat(ctx, l, danger.shield, time, p.x, p.y, skin);
      }
    }
  }
}

function heat(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  danger: number,
  time: number,
  x: number,
  y: number,
  skin: HullSkin,
): void {
  const glow = dangerGlow(danger, time);
  if (glow <= 0) return;
  // The radius is off the ramp and not off the pulse: the heat spreads as the
  // count runs down and breathes inside that, rather than the thing itself
  // growing and shrinking twice a second.
  const r = l.tile * (R_FROM + (R_TO - R_FROM) * danger);
  halo(ctx, x, y, r, dangerColor(skin, danger), glow);
}

/**
 * How near each control is to costing the round, read off the world.
 *
 * Undefined when nothing is stuck, which is the ordinary case and the one
 * worth keeping cheap: the field is absent on every frame of every wave that
 * placed no such pencil, so nothing downstream even looks.
 */
export function harpoonDanger(world: World): HarpoonDanger | undefined {
  const cannon = harpoonDangerMilli(world, "leech") / 1000;
  const shield = harpoonDangerMilli(world, "limpet") / 1000;
  if (cannon <= 0 && shield <= 0) return undefined;
  return { cannon, shield };
}
