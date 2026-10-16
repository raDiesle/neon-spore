import {
  type Color,
  geodeBoss,
  geodeCrackCol,
  geodeLitStep,
  geodeNext,
  type TimedCommand,
  type World,
} from "@neon-spore/sim";

/**
 * **THE GEODE played right**, for the autopilot: the pilot slides the cannon
 * under the first crack still whole and keeps it there, and the navigator
 * holds that crack's colour until the beam goes, then lifts — so a heart's two
 * cracks in one column are a lift and a hold in the other colour, with the
 * cannon never moving. Two pieces stacked in one column fall to the one beam
 * on their own: the first is the one aimed at and the second is in its path.
 *
 * A thumb on the wrong colour, or down while the cannon is still sliding, is
 * lifted first: sliding empties the fill anyway (`sim/lance.ts`), and a hold
 * kept through it would be a bolt — a chip, and the fill to start again.
 */
type Press = Omit<TimedCommand, "tick">;

const aim = (col: number): Press => ({ player: 1, command: { kind: "cannonCol", col } });
const thumb = (on: boolean, color: Color): Press => ({
  player: 2,
  command: { kind: "prime", on, color },
});

export const geodeHand = (w: World): Press[] => {
  const s = geodeBoss(w);
  const step = s === null ? null : geodeLitStep(s);
  const piece = s === null ? -1 : geodeNext(s);
  const crack = step?.cracks[piece];
  if (s === null || crack === undefined) return w.prime === null ? [] : [lift(w)];
  const col = geodeCrackCol(w, s, s.cursor, piece);
  if (w.cannonCol !== col) return w.prime === null ? [aim(col)] : [lift(w)];
  if (w.prime === null) return w.beam === null ? [thumb(true, crack.color)] : [];
  if (w.prime.spent || w.prime.color !== crack.color) return [lift(w)];
  return [];
};

function lift(w: World): Press {
  return thumb(false, w.prime?.color ?? "red");
}
