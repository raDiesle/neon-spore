import {
  BEARING_TURN,
  type FilamentState,
  filamentBoss,
  filamentTileAt,
  filamentTiles,
  filamentTracing,
  instarActing,
  instarMarkDone,
  instarPanel,
  instarSeatHears,
  instarStep,
  NO_GRAB,
  type SceneMark,
  sceneBoss,
  surgeBand,
  surgeBoss,
  surgeEverting,
  surgeHeld,
  surgeInBand,
  surgeSealing,
  type TimedCommand,
  type World,
} from "@neon-spore/sim";
import type { Hand } from "./hand.js";

/**
 * **The pair's hands on the bosses a handle answers** — THE SURGE, THE
 * INSTAR, THE FILAMENT — each a `Hand` (`hand.ts`); THE SINEW's are in
 * `boss-hands-sinew.ts`. None of these
 * is shot at: the pair holds a thing on the screen, and what the boss judges
 * is how far, how long and whether both hands did it together. So each hand
 * here is a drag on the boss's own `DragTarget`, re-sent every tick with
 * where the finger is, the way a device reports it, and read against the
 * boss's own predicates for when to let go.
 */

type Press = Omit<TimedCommand, "tick">;

/** A thumb on or off THE SURGE's bulb. */
function bulb(player: 1 | 2, on: boolean): Press {
  return { player, command: { kind: "drag", target: "surgeBulb", on, fromMilli: 0 } };
}

/**
 * THE SURGE: both thumbs on the bulb while the pressure climbs
 * (`surgeChargePerHand` a hand a beat), and both lifted on the one tick
 * once it is inside the notch's band — the second lift is the one judged,
 * and two lifts within a beat of each other are mutual (`surgeLift`,
 * `surgeJudge`). Past the band, the only way down is the burst, so both
 * thumbs stay on for it. With `vent` false the hands never lift: the bulb
 * bursts, which is the sealing.
 */
export function surgeHandWith(vent: boolean): Hand {
  return (w) => {
    const s = surgeBoss(w);
    if (s === null || surgeEverting(s) || surgeSealing(s, w)) return [];
    const on = [bulb(1, true), bulb(2, true)];
    if (!vent || !surgeHeld(s, 1) || !surgeHeld(s, 2)) return on;
    if (surgeInBand(s, w.cfg)) return [bulb(1, false), bulb(2, false)];
    return s.pressureMilli > surgeBand(s, w.cfg).high ? on : [];
  };
}

export const surgeHand: Hand = surgeHandWith(true);

/**
 * A scene's thumbs: every mark of the step that is up, answered in its own
 * gesture by the seat it belongs to, all in the same ticks — a pull carried
 * to its depth and kept there, a tap that lifts between presses, a swipe
 * carried past `instarSwipeMilli` and lifted, a turn wound a quarter a tick,
 * a hold both thumbs stay on (`instar-hand.ts`). A mark answered alone slips
 * when its partner is late (`instarTogetherBeats`), which is why the hand
 * answers them all at once. Its panel marks are the panel's
 * (`boss-hands-scene.ts`, where THE INSTAR's and THE NETTLE's hands are both).
 */
export const sceneThumbs: Hand = (w) => {
  const s = sceneBoss(w);
  if (s === null || !instarActing(s)) return [];
  const marks = instarStep(s)?.marks ?? [];
  const out: Press[] = [];
  marks.forEach((mark, i) => {
    if (instarPanel(mark.gesture)) return;
    if (instarMarkDone(s, i) && mark.gesture !== "hold") return;
    for (const player of [1, 2] as const) {
      if (instarSeatHears(mark.seat, player)) out.push(gesture(w, player, i, mark));
    }
  });
  return out;
};

/** One tick of one mark's gesture, for one thumb (`INSTAR_GESTURES`). */
function gesture(w: World, player: 1 | 2, id: number, mark: SceneMark): Press {
  const even = w.tick % 2 === 0;
  const drag = (on: boolean, fromMilli = 0, fromYMilli = 0): Press => ({
    player,
    command: { kind: "drag", target: "instarMark", on, fromMilli, fromYMilli, id },
  });
  switch (mark.gesture) {
    case "pullDown":
      return drag(true, 0, mark.need);
    case "pullUp":
      return drag(true, 0, -mark.need);
    case "tap":
      return drag(even);
    case "swipeDown":
      return drag(even, 0, w.cfg.instarSwipeMilli);
    case "turn":
      return drag(true, ((w.tick * BEARING_TURN) / 4) % BEARING_TURN);
    case "turnBack":
      return drag(
        true,
        (BEARING_TURN - (((w.tick * BEARING_TURN) / 4) % BEARING_TURN)) % BEARING_TURN,
      );
    case "hold":
      return drag(true);
    // The panel's, never a thumb on the body: the hand above skips them.
    case "shoot":
    case "shield":
    case "suck":
      return drag(false);
  }
}

/**
 * THE FILAMENT's, the trace played right: the pilot grabs the lit end and is
 * carried to the next tile once a beat, the navigator grabs behind him and
 * takes the tile behind his — only ever one behind, so the two never meet
 * before the root, where her arriving is the pull (`sim/filament-hand.ts`).
 * A carry is the whole displacement from the grab's tile, the way a device
 * reports a drag, so the same command sent every tick moves nothing twice.
 */
export const filamentHand: Hand = (w) => {
  const s = filamentBoss(w);
  if (s === null || !filamentTracing(s)) return [];
  const last = (filamentTiles(s)?.length ?? 0) - 1;
  const out: Press[] = [];
  const pilotTo = s.headBeat === w.beat || s.head >= last ? s.head : s.head + 1;
  out.push(carry(s, 1, s.grab[0], pilotTo));
  const behind = s.tail + 1 < s.head || (s.tail + 1 === s.head && s.head === last);
  out.push(carry(s, 2, s.grab[1], behind ? s.tail + 1 : s.tail));
  return out;
};

/** One thumb's press: a grab where there is none, else the carry to tile `to`. */
function carry(s: FilamentState, player: 1 | 2, grab: number, to: number): Press {
  const from = filamentTileAt(s, grab);
  const tile = filamentTileAt(s, to);
  const fromMilli =
    grab === NO_GRAB || from === null || tile === null ? 0 : (tile.col - from.col) * 1000;
  const fromYMilli =
    grab === NO_GRAB || from === null || tile === null ? 0 : (tile.row - from.row) * 1000;
  return { player, command: { kind: "drag", target: "filament", on: true, fromMilli, fromYMilli } };
}
