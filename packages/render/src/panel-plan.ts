/**
 * WHERE THE CONTROLS STAND ON THE PANEL, AS A RECORD.
 *
 * `computeLayout` placed the two strips and the button row with literals, and
 * `bandLobes` spread a seat's buttons with three more. They were the last
 * numbers about the panel that were not a record, and they are the ones that
 * decide the *arrangement* — which is what the owner asked for on 10 September
 * 2026 when he said every ship so far looked the same from its basis, and
 * wanted designs that were different from fresh. A ship that keeps a rail
 * across the width and two buttons in fixed sockets is a skin on the same
 * body however it is painted.
 *
 * **Both readers take the same record, so the drawing and the touch cannot
 * disagree.** `layout.ts` reads the rows and the radius, `band-lobes.ts` reads
 * the spread, and `touch.ts`, `hover.ts`, the guides and the captions all ask
 * those two — nothing else in the game knows where a button is. And the layout
 * is rebuilt every frame from the stage (`canvas2d.ts`), so a candidate
 * arrangement patched round `draw()` moves the buttons *and* the hit regions
 * for the length of that frame, which is what makes it honest in the pair.
 *
 * Every number is a share: of the band's height, of the screen's width, of a
 * seat's half. The shipped values are exactly what the two files carried.
 */

/** The placement of one seat's row of buttons, as shares of the width. */
export interface LobeSpread {
  /** The middle of the seat's share. */
  readonly centre: number;
  /** The most two neighbours may be apart, so a short row stays where the
   * pair learned it (`band-lobes.ts`). */
  readonly maxPitch: number;
  /** How much of the width the seat may spread over. */
  readonly share: number;
}

export interface PanelPlan {
  /** The cannon strip's row as a share of the band's height, solo and test. */
  readonly cannonRow: readonly [solo: number, test: number];
  readonly shieldRow: readonly [solo: number, test: number];
  /** The button row, likewise. */
  readonly lobeRow: readonly [solo: number, test: number];
  /** A button's radius as a share of the band's height, and the cap on it as
   * a share of the width; each solo and test. */
  readonly lobeR: readonly [solo: number, test: number];
  readonly lobeRCap: readonly [solo: number, test: number];
  /** A strip's height as a share of the band's height, and its cap in px. */
  readonly stripH: number;
  readonly stripHCap: number;
  /** Where each seat's buttons spread, solo and in the shared test view. */
  readonly solo: readonly [p1: LobeSpread, p2: LobeSpread];
  readonly test: readonly [p1: LobeSpread, p2: LobeSpread];
}

/** The shipped arrangement, GLAND's since 11 September 2026: the buttons out
 * at the thumbs and the rail a little lower than before, so the spine runs
 * through the body's middle. Before it the rows were `0.28`/`0.72` solo and
 * each seat's row was centred with a pitch of `0.28`–`0.32`. */
export const PANEL_PLAN: PanelPlan = {
  cannonRow: [0.3, 0.22],
  shieldRow: [0.3, 0.5],
  lobeRow: [0.74, 0.8],
  lobeR: [0.19, 0.14],
  lobeRCap: [0.068, 0.056],
  stripH: 0.24,
  stripHCap: 32,
  solo: [
    { centre: 0.5, maxPitch: 0.58, share: 1 },
    { centre: 0.5, maxPitch: 0.58, share: 1 },
  ],
  test: [
    { centre: 0.24, maxPitch: 0.26, share: 0.48 },
    { centre: 0.74, maxPitch: 0.26, share: 0.48 },
  ],
};
