import {
  type BlisterGesture,
  type BlisterSwipeWay,
  blisterIsUp,
  NO_BEARING,
  type TimedCommand,
  type World,
} from "@neon-spore/sim";
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

/**
 * THE BLISTER's RUB played through by a hand of its own: up out of its pore
 * untouched and calling, then scrubbed — a thumb down on it and turned back
 * twice, two blows of its three — and lifted, all inside the two beats it
 * stays up. It is what `blister:rub` on VERSUS is judged on: a body that
 * answers being scrubbed, so the scrub has to happen on the page, and ON THE
 * FIELD's `BLISTER · RUBBED ONCE` holds one moment of it.
 */
export const BLISTER_RUB_PLAYED: Pose = {
  name: "BLISTER · RUB SCRUBBED TWICE AND LIFTED",
  note: "A RUB blister is up out of its pore for its two beats, three blows owed, its drop wagging to call. Player 2 puts a thumb on it and scrubs, turning back twice — two of its three zigzag strokes lit, two pips gone — and lifts. Player 2's screen, the seat its BY names.",
  lookAt: "whether the body says it is being scrubbed, and how much is left",
  crop: "tile",
  role: "p2",
  span: 3,
  cadenceSeconds: 1.25,
  at: (w) => {
    const c = w.creatures.find(blisterIsUp);
    return c ? { col: c.col, row: c.row } : { col: 4, row: 3 };
  },
  build: () => blisterUp("rub"),
  hand: (w) => {
    const c = w.creatures.find(blisterIsUp);
    if (!c) return [];
    const t = sinceUp(w, "rub");
    const rubbed = (on: boolean, turns: number) =>
      sent(w, { kind: "drag", target: "blisterRub", on, fromMilli: c.id, id: turns });
    const turn = SCRUB.indexOf(t);
    if (turn !== -1) return rubbed(true, turn);
    if (t === LIFTED) return rubbed(false, SCRUB.length - 1);
    return [];
  },
};

/** Ticks from the rub blister coming up: the thumb down, each turn back, and the lift. */
const SCRUB = [40, 65, 90];
const LIFTED = 120;

/**
 * THE BLISTER's TURN played through by a hand of its own: up out of its pore
 * with the knob at the top, then wound clockwise — a whole turn, one blow,
 * and most of a second — and lifted, all inside the two beats it stays up.
 * It is what `blister:turn` on VERSUS is judged on: a body that turns, so the
 * knob has to go round on the page, and ON THE FIELD's `BLISTER · A TURN HALF
 * ROUND` holds it still.
 */
export const BLISTER_TURN_PLAYED: Pose = {
  name: "BLISTER · TURN WOUND ROUND AND LIFTED",
  note: "A TURN blister is up out of its pore for its two beats, three blows owed, the knob at the top of its channel. Player 2 takes the knob and winds it clockwise, a whole turn — one blow — and most of a second, then lifts. Player 2's screen, the seat its BY names.",
  lookAt: "whether the body says which way round, and turns with the knob",
  crop: "tile",
  role: "p2",
  span: 3,
  cadenceSeconds: 1.25,
  at: (w) => {
    const c = w.creatures.find(blisterIsUp);
    return c ? { col: c.col, row: c.row } : { col: 4, row: 3 };
  },
  build: () => blisterUp("turn"),
  hand: (w) => {
    const c = w.creatures.find(blisterIsUp);
    if (!c) return [];
    const t = sinceUp(w, "turn");
    const crank = (on: boolean, at: number) =>
      sent(w, { kind: "drag", target: "blisterTurn", id: c.id, on, fromMilli: at });
    if (t === WOUND_FROM) return crank(true, NO_BEARING);
    if (t > WOUND_FROM && t < LIFT_TURN) return crank(true, ((t - WOUND_FROM) * WIND) % 1000);
    if (t === LIFT_TURN) return crank(false, 0);
    return [];
  },
};

/** Ticks from the turn blister coming up: the knob taken and let go, and
 * thousandths of a turn wound each tick between. */
const WOUND_FROM = 35;
const LIFT_TURN = 115;
const WIND = 22;

/** One command from player 2, on the tick the world stands at. */
export function sent(w: World, command: TimedCommand["command"]): TimedCommand[] {
  return [{ tick: w.tick, player: 2, command }];
}

/** The tick each gesture's blister comes up on, by gesture and way, the same every build; found once, on first use. */
const UP_AT = new Map<string, number>();

/** Ticks since the blister came up, counted from the tick `blisterUp` stops at. */
export function sinceUp(w: World, gesture: BlisterGesture, way?: BlisterSwipeWay): number {
  const key = `${gesture}:${way ?? ""}`;
  let up = UP_AT.get(key);
  if (up === undefined) {
    up = blisterUp(gesture, way).tick;
    UP_AT.set(key, up);
  }
  return w.tick - up;
}

/** A blister of one gesture, just up out of its pore, pointing its way if it has one. */
export function blisterUp(gesture: BlisterGesture, way?: BlisterSwipeWay): World {
  const spawn = {
    beat: 0,
    col: 4,
    kind: "blister",
    color: null,
    row: 3,
    count: 3,
    gesture,
  } as const;
  const w = fresh([way ? { ...spawn, way } : spawn]);
  until(w, "a blister up", (x) => x.creatures.some(blisterIsUp));
  return w;
}
