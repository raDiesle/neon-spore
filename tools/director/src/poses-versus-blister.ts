import { type BlisterGesture, blisterIsUp, type TimedCommand, type World } from "@neon-spore/sim";
import { fresh, type Pose, until } from "./pose-kit.js";

/**
 * THE BLISTER's COMBO played through by a hand of its own: up out of its pore
 * untouched, pressed, its pull carried the whole stroke and lifted — one blow
 * — all inside the two beats it stays up. It is what `blister:combo` on
 * VERSUS is judged on: a body that changes between the press and the pull,
 * so both halves have to be on the page, and ON THE FIELD's `BLISTER ·
 * PRESSED, THE PULL HALF CARRIED` holds the second alone. On the COMPARED
 * LOOKS sheet (`poses-versus-bodies.ts`), cropped to the blister's tiles.
 *
 * Each hand here reads the tick off the world and counts from the tick the
 * blister came up, which `build` reaches the same way every replay.
 */
export const BLISTER_COMBO_PLAYED: Pose = {
  name: "BLISTER · COMBO PRESSED, PULLED AND LIFTED",
  note: "A COMBO blister is up out of its pore for its two beats, three blows owed. Player 2 lets it stand a moment, presses it — the tap's help goes and the pull comes in where it was — carries the knob the whole stroke to the right and lifts: one blow, and it asks for the press again. Player 2's screen, the seat its BY names.",
  lookAt: "whether the body says which half it is waiting for — the press, or the pull",
  crop: "tile",
  role: "p2",
  span: 3,
  cadenceSeconds: 1.2,
  at: (w) => {
    const c = w.creatures.find(blisterIsUp);
    return c ? { col: c.col, row: c.row } : { col: 4, row: 3 };
  },
  build: () => blisterUp("combo"),
  hand: (w) => {
    const c = w.creatures.find(blisterIsUp);
    if (!c) return [];
    const t = sinceUp(w, "combo");
    const at = (command: TimedCommand["command"]) => sent(w, command);
    const stroke = (on: boolean, reach: number) =>
      at({ kind: "drag", target: "blisterSwipe", id: c.id, on, fromMilli: reach, fromYMilli: 0 });
    if (t === PRESS) return at({ kind: "tap", id: c.id });
    if (t >= TAKE && t <= CARRIED) {
      const share = (t - TAKE) / (CARRIED - TAKE);
      return stroke(true, Math.round(share * w.cfg.blisterSwipeMilli));
    }
    if (t === LIFT) return stroke(false, w.cfg.blisterSwipeMilli);
    return [];
  },
};

/** Ticks from the blister coming up: the press, the stroke taken, carried, and lifted. */
const PRESS = 45;
const TAKE = 50;
const CARRIED = 100;
const LIFT = 108;

/**
 * THE BLISTER's LEVER played through by a hand of its own: up out of its pore
 * with the knob at rest on it, the knob carried down its groove into the
 * band, held there the whole hold — the dial going round, one blow — and
 * lifted, all inside the two beats it stays up. It is what `blister:lever`
 * on VERSUS is judged on: a body the knob is drawn out of, so the knob has to
 * travel on the page, and ON THE FIELD's `BLISTER · THE LEVER HELD IN ITS
 * BAND` holds it still. The band lies 0.6 to 1.05 tiles under the body,
 * inside the three tiles every blister pose crops to.
 */
export const BLISTER_LEVER_PLAYED: Pose = {
  name: "BLISTER · LEVER CARRIED INTO ITS BAND AND HELD",
  note: "A LEVER blister is up out of its pore for its two beats, three blows owed, its knob at rest on it. Player 2 takes the knob, carries it down its groove into the band and holds it there until the dial has gone round — one blow — then lifts, and the knob springs back. Player 2's screen, the seat its BY names.",
  lookAt: "whether the knob reads as drawn out of the body, and how far",
  crop: "tile",
  role: "p2",
  span: 3,
  cadenceSeconds: 1.25,
  at: (w) => {
    const c = w.creatures.find(blisterIsUp);
    return c ? { col: c.col, row: c.row } : { col: 4, row: 3 };
  },
  build: () => blisterUp("lever"),
  hand: (w) => {
    const c = w.creatures.find(blisterIsUp);
    if (!c) return [];
    const t = sinceUp(w, "lever");
    const band = Math.round((w.cfg.blisterLeverFromMilli + w.cfg.blisterLeverToMilli) / 2);
    const knob = (on: boolean, depth: number) =>
      sent(w, {
        kind: "drag",
        target: "blisterLever",
        id: c.id,
        on,
        fromMilli: 0,
        fromYMilli: depth,
      });
    if (t >= GRAB && t <= INTO) return knob(true, Math.round(((t - GRAB) / (INTO - GRAB)) * band));
    if (t === LET_GO) return knob(false, band);
    return [];
  },
};

/** Ticks from the lever blister coming up: the knob taken, in the band, and let go. */
const GRAB = 30;
const INTO = 50;
const LET_GO = 130;

/** One command from player 2, on the tick the world stands at. */
function sent(w: World, command: TimedCommand["command"]): TimedCommand[] {
  return [{ tick: w.tick, player: 2, command }];
}

/** The tick each gesture's blister comes up on, the same every build; found once, on first use. */
const UP_AT = new Map<BlisterGesture, number>();

/** Ticks since the blister came up, counted from the tick `blisterUp` stops at. */
function sinceUp(w: World, gesture: BlisterGesture): number {
  let up = UP_AT.get(gesture);
  if (up === undefined) {
    up = blisterUp(gesture).tick;
    UP_AT.set(gesture, up);
  }
  return w.tick - up;
}

/** A blister of one gesture, just up out of its pore. */
function blisterUp(gesture: BlisterGesture): World {
  const w = fresh([{ beat: 0, col: 4, kind: "blister", color: null, row: 3, count: 3, gesture }]);
  until(w, "a blister up", (x) => x.creatures.some(blisterIsUp));
  return w;
}
