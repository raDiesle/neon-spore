import { type BlisterSwipeWay, blisterIsUp } from "@neon-spore/sim";
import type { Pose } from "./pose-kit.js";
import { blisterUp, sent, sinceUp } from "./poses-versus-blister.js";

/**
 * THE BLISTER's SWIPE played through by a hand of its own, once for each of
 * two ways: up out of its pore, a stroke carried the whole way and lifted —
 * one blow — and a second taken and held half way. It is what
 * `blister:swipe` on VERSUS was judged on (SLUG and ZIP taken, 15 October
 * 2026): a body built round the channel has
 * to follow the way the stroke is authored to go, so the slot opens on the
 * stroke DOWN, the one that runs past the pore's lip (`BlisterBodyLook.beyond`),
 * and the COMPARED LOOKS sheet carries the stroke UP beside it — the way ON
 * THE FIELD's `BLISTER · A STROKE HALF CARRIED` points.
 */
export function swipePlayed(way: BlisterSwipeWay, name: string): Pose {
  return {
    name,
    note: `A SWIPE blister is up out of its pore for its two beats, three blows owed, its channel running ${way}. Player 2 takes the knob, carries it the whole stroke and lifts — one blow — then takes it again and holds it half way. Player 2's screen, the seat its BY names.`,
    lookAt: "whether the body says which way to stroke, and goes with the knob",
    crop: "tile",
    role: "p2",
    span: 5,
    cadenceSeconds: 1.25,
    at: (w) => {
      const c = w.creatures.find(blisterIsUp);
      return c ? { col: c.col, row: c.row } : { col: 4, row: 3 };
    },
    build: () => blisterUp("swipe", way),
    hand: (w) => {
      const c = w.creatures.find(blisterIsUp);
      if (!c) return [];
      const t = sinceUp(w, "swipe", way);
      const full = w.cfg.blisterSwipeMilli;
      const stroke = (on: boolean, reach: number) =>
        sent(w, { kind: "drag", target: "blisterSwipe", id: c.id, on, ...offset(way, reach) });
      if (t >= TAKE && t <= CARRIED) return stroke(true, carried(t, TAKE, CARRIED, full));
      if (t === LIFT) return stroke(false, full);
      if (t >= RETAKE && t <= HALF) return stroke(true, carried(t, RETAKE, HALF, full / 2));
      return [];
    },
  };
}

/** Ticks from the blister coming up: the stroke taken, carried the whole way, lifted, taken again and half carried. */
const TAKE = 30;
const CARRIED = 80;
const LIFT = 84;
const RETAKE = 95;
const HALF = 115;

/** How far the thumb has come at tick `t`, carried evenly from `from` to `to`. */
function carried(t: number, from: number, to: number, reach: number): number {
  return Math.round(((t - from) / (to - from)) * reach);
}

/** The thumb's offset from where it pressed, `reach` thousandths along the way. */
function offset(way: BlisterSwipeWay, reach: number): { fromMilli: number; fromYMilli: number } {
  if (way === "left" || way === "right")
    return { fromMilli: way === "left" ? -reach : reach, fromYMilli: 0 };
  return { fromMilli: 0, fromYMilli: way === "up" ? -reach : reach };
}

export const BLISTER_SWIPE_DOWN_PLAYED = swipePlayed(
  "down",
  "BLISTER · SWIPE STROKED DOWN AND LIFTED",
);
export const BLISTER_SWIPE_UP_PLAYED = swipePlayed("up", "BLISTER · SWIPE STROKED UP AND LIFTED");
