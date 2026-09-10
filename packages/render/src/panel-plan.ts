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

/** The shipped arrangement: two rails across the width, a row of buttons
 * under them, each seat's row centred in its share. */
export const PANEL_PLAN: PanelPlan = {
  cannonRow: [0.28, 0.2],
  shieldRow: [0.28, 0.48],
  lobeRow: [0.72, 0.8],
  lobeR: [0.19, 0.14],
  lobeRCap: [0.068, 0.056],
  stripH: 0.24,
  stripHCap: 32,
  solo: [
    { centre: 0.5, maxPitch: 0.28, share: 1 },
    { centre: 0.5, maxPitch: 0.32, share: 1 },
  ],
  test: [
    { centre: 0.23, maxPitch: 0.15, share: 0.46 },
    { centre: 0.72, maxPitch: 0.24, share: 0.46 },
  ],
};
