/**
 * **THE THROAT's numbers**: how many rings the gullet has, where its mouth may
 * be carried, how hard a pump has to be worked and how wide that opens the
 * circle that pulls things in (`throat.ts`, `docs/spec/bosses-choreographed.md`
 * §1).
 *
 * Its own file for the reason `config-stare.ts` gives: `SimConfig` extends
 * it rather than nesting it, so every call site still reads
 * `cfg.throatStrokeMilli`.
 *
 * **The pump's three numbers are one sentence**: a stroke is a thumb carried
 * `throatStrokeMilli` the other way, each stroke adds `throatPumpGainMilli`,
 * and a tick takes `throatPumpDecayMilli` back. A pilot who strokes about
 * twice a second holds the circle near its widest; one who stops sees it
 * close in under three seconds. Change the three together.
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
   * How far the pilot's thumb must travel the other way before it is a new
   * stroke, in thousandths of a tile.
   *
   * 1500: a stroke is a deliberate push down or up of a tile and a half,
   * which a fingertip's jitter is nowhere near. It is a threshold and not a
   * distance — a longer stroke counts the same, so the pump rewards speed
   * rather than reach, as the owner asked.
   */
  throatStrokeMilli: number;
  /** What one stroke adds to the pump, out of 1000. 180: six strokes from
   * still to near the widest circle. */
  throatPumpGainMilli: number;
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
 * rows off the top, a pump that wants about two strokes a second, and six
 * beats of turning inside out at the end.
 */
export const THROAT_DEFAULTS: ThroatConfig = {
  throatRings: 5,
  throatEvertBeats: 6,
  throatSideMarginMilli: 1000,
  throatTopMarginMilli: 2000,
  throatStrokeMilli: 1500,
  throatPumpGainMilli: 180,
  throatPumpDecayMilli: 6,
  throatMinRadiusMilli: 1000,
  throatMaxRadiusMilli: 3200,
  throatRefuseTicks: 30,
};
