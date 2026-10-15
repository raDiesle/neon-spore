import { blisterIsUp, type TimedCommand, type World } from "@neon-spore/sim";
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
 * The hand reads the tick off the world and counts from the tick the blister
 * came up, which `build` reaches the same way every replay.
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
  build: comboUp,
  hand: (w) => {
    const c = w.creatures.find(blisterIsUp);
    if (!c) return [];
    upAt ??= comboUp().tick;
    const t = w.tick - upAt;
    const at = (command: TimedCommand["command"]): TimedCommand[] => [
      { tick: w.tick, player: 2, command },
    ];
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

/** The tick the blister comes up on, the same for every build; found once, on first use. */
let upAt: number | undefined;

/** A COMBO blister, just up out of its pore. */
function comboUp(): World {
  const w = fresh([
    { beat: 0, col: 4, kind: "blister", color: null, row: 3, count: 3, gesture: "combo" },
  ]);
  until(w, "a blister up", (x) => x.creatures.some(blisterIsUp));
  return w;
}
