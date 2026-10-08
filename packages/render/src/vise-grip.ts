import {
  midCol,
  type SimConfig,
  type ViseState,
  type ViseStep,
  viseDone,
  viseSeedCol,
  type World,
} from "@neon-spore/sim";
import { fieldX } from "./field-flip.js";
import type { Circle, Layout } from "./layout.js";
import { NO_SPAN, type SlowSpan } from "./slow-hush.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";
import { viseArrived } from "./vise-pose.js";
import { viseCentre, viseKernel, viseLift, viseRadius } from "./vise-shape.js";
import { viseBite, viseLunge, viseSeedAt, viseSpit } from "./vise-story.js";
import { viseSwing, viseSwung } from "./vise-sway.js";

/**
 * **The hand on THE VISE** — the first of its hands lanes, and the one that
 * makes the case answer a hand at all (§11.45).
 *
 * Its own page for `oculus-grip.ts`' reason: the case a finger is answered on
 * is the one `drawVise` puts on the screen this frame, at the same middle and
 * the same drop into frame, and all this file adds is *whether* a press takes
 * hold of a lobe.
 *
 * **One thumb carries a lobe shut.** It was a pinch, two fingertips of one
 * seat closing on the lobe, until the owner ruled on 8 October 2026 that a
 * player never has two fingers down at once, since a PC has one pointer. What
 * the press takes now is a drag, and how far the thumb has come is what shuts
 * the lobe (`vise-carry.ts`); the simulation still hears a gap.
 *
 * **Geometry says whose lobe is whose, on both phones.** The left lobe is
 * Player 1's and the right Player 2's (`sim/vise-hand.ts`), both screens draw
 * the whole case, and a finger on the other seat's side falls through to
 * whatever is behind it, as the simulation would refuse it anyway.
 *
 * **A lobe is taken in its zone, not on its shell.** The shell is a tile
 * wide — six millimetres on a phone — and a thumb carried two tiles from it
 * has to start somewhere it can travel. §28 draws the zones as THE MANTLE's
 * screen halves, and that is what a press is taken on: this seat's side of
 * the spine, the width of the field, over the rows the case stands in and
 * half a tile either way. A thumb that wanders out of the zone after the
 * press still counts, because the lift is what lets go.
 *
 * **The case takes a hand whenever it stands**, from the drop into frame
 * until it splits: the simulation records a gap whenever the case is present,
 * so a lobe already carried shut when a seam lights is counted from its
 * first beat.
 */

/** Half a tile of zone above and below the case, so a finger at its tip is not refused on a pixel. */
const MARGIN = 0.5;

/** Whether the case is there to be taken hold of: every phase but the split. */
export function viseTakesHand(s: ViseState): boolean {
  return !viseDone(s);
}

/** A seat's side of the spine: the pilot's the left, the navigator's the right. */
export function viseSide(seat: 1 | 2): -1 | 1 {
  return seat === 1 ? -1 : 1;
}

/** The case's middle where it stands this frame, lifted while it is still dropping in. */
function caseAt(l: Layout, cfg: SimConfig, s: ViseState, beat: number, beatPhase: number) {
  const home = viseCentre(l, cfg);
  return { x: home.x, y: home.y - viseLift(l, viseArrived(s, cfg, beat, beatPhase)) };
}

/**
 * A seat's lobe as a circle: the round in the middle of that half-shell, which
 * is where the ghost thumb stands and what `handleCircle` answers. The press
 * is taken on the whole zone (`viseLobeUnder`); this is the lobe it names.
 */
export function viseLobeCircle(
  l: Layout,
  cfg: SimConfig,
  s: ViseState,
  seat: 1 | 2,
  beat: number,
  beatPhase: number,
  slow: SlowSpan = NO_SPAN,
): Circle {
  const at = caseAt(l, cfg, s, beat, beatPhase);
  const { rx } = viseRadius(l);
  const swing = viseSwing(cfg, s, beat, beatPhase, slow);
  const c = viseSwung(l, { x: (viseSide(seat) * rx) / 2, y: 0 }, swing);
  return { x: at.x + c.x, y: at.y + c.y, r: rx / 2 };
}

/** The same for the world as it stands, for the placement and the ghost hand. */
export function viseLobeStanding(
  l: Layout,
  world: World,
  s: ViseState,
  seat: 1 | 2,
  beatPhase: number,
): Circle {
  return viseLobeCircle(l, world.cfg, s, seat, world.beat, beatPhase, world);
}

/**
 * What a shot on THE VISE is fired at, for the world as it stands: the kernel
 * on a fire step, the spat seed hanging over its column on a spit — the circle
 * the cue's crosshair rides (`boss-cue-read-zf.ts`). The case's thud and shake
 * are left out, as the lobes' circles leave them; its lunge is not.
 */
export function viseShotStanding(
  l: Layout,
  world: World,
  s: ViseState,
  step: ViseStep,
  beatPhase: number,
): Circle {
  const cfg = world.cfg;
  const at = caseAt(l, cfg, s, world.beat, beatPhase);
  const y = at.y + viseLunge(viseBite(s, cfg, world.beat, beatPhase), l.hullY - at.y);
  if (step.ask === "spit") {
    const seedX = fieldX(l, viseSeedCol(midCol(cfg), step)) - at.x;
    const seed = viseSeedAt(l, viseSpit(s, cfg, world.beat, beatPhase), seedX);
    return { x: at.x + seed.x, y: y + seed.y, r: seed.r };
  }
  const k = viseKernel(l);
  return { x: at.x + k.x, y: y + k.y, r: k.r };
}

/**
 * A press in this seat's zone: a hold on its lobe that **says nothing yet** —
 * a thumb not carried has shut nothing, and the gap goes out on the move
 * (`touch-move.ts`). `bossOf(field, "vise")` is `null` on every wave without
 * it. The spine itself is either seat's, so a finger laid dead centre is
 * never refused on a pixel.
 */
export function viseLobeUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const s = bossOf(field, "vise");
  if (s === null || !viseTakesHand(s)) return null;
  const at = caseAt(l, field.cfg, s, field.beat, field.beatPhase);
  const reach = viseRadius(l).ry + MARGIN * l.tile;
  if (Math.abs(y - at.y) > reach) return null;
  if (x < l.gridLeft || x > l.gridLeft + l.gridWidth) return null;
  const seat = field.seat;
  if ((x - at.x) * viseSide(seat) < 0) return null;
  const target = seat === 1 ? "viseLobeLeft" : "viseLobeRight";
  return {
    player: seat,
    command: null,
    hold: {
      kind: "drag",
      target,
      player: seat,
      originX: x,
      originY: y,
      closes: field.cfg.viseOpenMilli,
    },
  };
}
