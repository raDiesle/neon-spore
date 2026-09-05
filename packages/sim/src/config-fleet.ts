/**
 * THE FLEET's numbers — the chart, the clock and what running out of it costs
 * (`fleet.ts`, `docs/spec/bosses.md` 11.6).
 *
 * Its own file for the reason `config-gauge.ts` gives: `SimConfig` extends it
 * rather than nesting it, so every call site still reads `cfg.fleetRows`, and
 * the split is about how much of one file a reader has to hold at once. A
 * fight is a subject of its own.
 *
 * Everything here is beats or whole tiles. Nothing is in milliseconds and
 * nothing is a fraction: the chart is squares, and a coordinate two people say
 * out loud has to be a whole number on both phones.
 */
export interface FleetConfig {
  /**
   * How many rows of the field the chart covers, counted from the top. The
   * width is the field's own — a chart narrower than the grid would give the
   * pair two column vocabularies at once, and the whole fight is one.
   *
   * The rows below it are open water between the chart and the ship: the
   * sights never reach there, so nothing the pair says can mean a square that
   * is not on the board.
   */
  fleetRows: number;
  /**
   * Beats the pair has to sink the whole fleet in. Running out costs exactly
   * `damageFleet` and ends the wave.
   */
  fleetRoundBeats: number;
  /**
   * Beats between two salvoes, landed or not. A thumb held on the button is
   * slower than a pair who talk — the same rule THE GAUGE's call plays by, and
   * for the same reason: a round whose fastest strategy is hammering one
   * control is a round with nothing to say in it.
   */
  fleetSalvoRestBeats: number;
  /**
   * What running out of time takes off the hull, in whole points.
   *
   * Named for the `damage*` family rather than the `fleet*` one, because that
   * is the question a reader is asking when they find it: everything else in
   * this file is the chart, and this is the only line here that can end a run.
   */
  damageFleet: number;
  /** Score for a salvo that finds a hull. */
  scoreFleetHit: number;
  /** Score for the salvo that takes the last square of a ship. */
  scoreFleetSunk: number;
  /** Score for the last ship of the fleet. */
  scoreFleetDown: number;
}

/**
 * The defaults, spread into `DEFAULT_CONFIG`.
 *
 * `fleetRows` at 10 against the field's eleven columns is a chart of 110
 * squares — the classic hundred, near enough, on a grid this game already has.
 * The five rows left under it are the water the ship sits in.
 *
 * `fleetRoundBeats` at 160 is a hundred seconds at 96 BPM. A five-ship fleet
 * is seventeen squares to hit, and the sights step one square a press, so the
 * clock is generous to a pair who name a square and mean, and short for a pair
 * who walk the sights about looking for one.
 */
/**
 * Beats a salvo's shell spends in the air, from the muzzle to the square.
 *
 * A number the *pictures* need and the rules do not: nothing in `fleet.ts`
 * waits for it — a salvo is resolved on the tick it is pressed, because two
 * devices must agree about a hit without either of them drawing anything. It
 * lives here anyway, and not in `packages/render`, because two consumers read
 * it and neither may import the other: the renderer flies the shell for this
 * long and withholds the mark until it lands (`fleet-shell.ts`), and the mixer
 * holds the splash or the clang back by the same amount so the ear and the eye
 * agree about when the thing arrived (`bind.ts`). A second copy of it is a
 * sound that lands a second before its own picture.
 *
 * Two beats is 1.25 seconds at 96 BPM — long enough that the arc is watched
 * rather than glimpsed, and longer than `fleetSalvoRestBeats`, so a pair
 * firing as fast as the rule allows have two shells in the air at once. The
 * picture carries that (`fleet-fx.ts`); the simulation never sees it.
 */
export const FLEET_SHELL_BEATS = 2;

export const FLEET_DEFAULTS: FleetConfig = {
  fleetRows: 10,
  fleetRoundBeats: 160,
  fleetSalvoRestBeats: 1,
  // Two rocks' worth, the same figure THE GAUGE's failure costs, and for the
  // same reason: it has to hurt enough that the pair play the round, and the
  // number itself is the owner's to turn once they have lost one.
  damageFleet: 20,
  scoreFleetHit: 120,
  scoreFleetSunk: 400,
  scoreFleetDown: 1500,
};
