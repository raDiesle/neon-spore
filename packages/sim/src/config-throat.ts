/**
 * **THE THROAT's numbers**: how many rings the gullet has, where its mouth may
 * be carried, how hard a pump has to be worked and how wide that opens the
 * circle that pulls things in (`throat.ts`, `docs/spec/bosses-choreographed.md`
 * §1).
 *
 * Its own file for the reason `config-stare.ts` gives: `SimConfig` extends
 * it rather than nesting it, so every call site still reads
 * `cfg.throatPumpTurns`.
 *
 * **The pump's two numbers are one sentence**: it is a rub, every turn back
 * of the pilot's thumb counted by the host as every RUB is
 * (`render/rub-turns.ts`), each turn opens a `throatPumpTurns`th of it, and a
 * tick takes `throatPumpDecayMilli` back. A pilot who turns about twice a
 * second holds the circle near its widest; one who stops sees it close in
 * under three seconds. Change the two together.
 */
export interface ThroatConfig {
  /**
   * Ring muscles in the gullet, which is also its health: every right swallow
   * slackens one, and a tube of five slack rings cannot hold its own shape.
   *
   * 5, the design's number. The rings are the health *bar*, so a pair reads
   * how the fight is going off the silhouette and off nothing else (THE
   * QUEEN's bargain, `bosses.md` §11.0).
   */
  throatRings: number;
  /**
   * Beats the eversion takes: the tube pulling itself through its own mouth,
   * ring by ring, with a slow window over the whole of it.
   *
   * 6, one a ring and one over. It is the payoff rather than a rule — the boss
   * is already beaten when it starts.
   */
  throatEvertBeats: number;
  /**
   * How near the side walls the mouth may be carried, in thousandths of a
   * tile from the outer column's centre.
   *
   * 1000, a whole column: the owner asked for space left and right so the
   * mouth is never cut by the frame, and a mouth one column in still reaches
   * the outer column with its circle open.
   */
  throatSideMarginMilli: number;
  /** And how near the top: 2000, two rows, so the mouth and its circle stay
   * under the status bar and the wave's title. */
  throatTopMarginMilli: number;
  /**
   * Turns of the pilot's rub that take the pump from shut to full: each adds
   * `throatPumpGain` (`throat-hand.ts`). A turn is a thumb going back the way
   * it came, any way, as every rub counts — a longer stroke counts the same,
   * so the pump rewards speed rather than reach, as the owner asked.
   *
   * 6: six strokes from still to the widest circle, the six the stroke and its
   * gain of 180 made before the pump was a rub (the owner, 14 October 2026:
   * *use default "rub" instead for less variants*).
   */
  throatPumpTurns: number;
  /** What a tick takes back, out of 1000. 6: an idle pump closes from full in
   * under three seconds at sixty ticks, so the circle is earned all fight. */
  throatPumpDecayMilli: number;
  /** The circle at the first stroke, in thousandths of a tile. 1000: one
   * tile round the mouth, so a body has to be carried to. */
  throatMinRadiusMilli: number;
  /** And at a full pump. 3200: most of a third of the field's width, so a
   * well-worked pump takes a body from across the screen. */
  throatMaxRadiusMilli: number;
  /**
   * Ticks a body in the wrong colour is left alone after it is refused
   * (`throat-suck.ts`).
   *
   * 30, half a second: the shake is drawn and the sound is said once rather
   * than every tick the body sits in the circle.
   */
  throatRefuseTicks: number;
}

/**
 * The defaults, spread into `DEFAULT_CONFIG`.
 *
 * Read as one fight: five rings, a mouth kept a column off the walls and two
 * rows off the top, a pump that wants about two turns a second, and six
 * beats of turning inside out at the end.
 */
export const THROAT_DEFAULTS: ThroatConfig = {
  throatRings: 5,
  throatEvertBeats: 6,
  throatSideMarginMilli: 1000,
  throatTopMarginMilli: 2000,
  throatPumpTurns: 6,
  throatPumpDecayMilli: 6,
  throatMinRadiusMilli: 1000,
  throatMaxRadiusMilli: 3200,
  throatRefuseTicks: 30,
};
