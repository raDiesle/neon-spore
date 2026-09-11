import { DEFAULT_CONFIG } from "@neon-spore/sim";

/**
 * What an asset in the LIBRARY is, and what it is told.
 *
 * The LIBRARY is the fourth view on SHAPES, and the first drawn on a canvas
 * rather than as SVG. The other three views are the shape sheet's own: a
 * contour and the parts a card can wear, each rewritten for the page. This
 * one is **the game's own drawing code, run on a card** — the looks the owner
 * decided a VERSUS slot with and asked to keep *because he wants to build
 * more bodies like them*, and the look each of them was judged against. A
 * rewrite of one of those in SVG would be a memory of it; the point of keeping
 * it is that it is the real thing, so the real function is called, on the
 * real body, at a card's size.
 *
 * The types sit apart from the registry so an asset file can import them
 * without importing its siblings — `index.ts` imports every asset, and an
 * asset that imported it back would be a cycle. The same arrangement as
 * `skins/types.ts` and `holders/types.ts`.
 */

/** The page's heartbeat: the game's own tempo, not a number near it. */
export const BEAT_SECONDS = 60 / DEFAULT_CONFIG.bpm;

/** The moment an asset is drawn at. One clock for every card in the frame, so
 * four fringes under four bells jump together and the thing compared is what
 * hangs, never when. */
export interface AssetFrame {
  /** Seconds on the page clock. */
  readonly t: number;
  /** Whole beats since the page opened. */
  readonly beat: number;
  /** 0..1 through the current beat, the same on every card. */
  readonly beatPhase: number;
}

export interface AssetContext {
  readonly ctx: CanvasRenderingContext2D;
  /** The card's width and height in CSS pixels, before the device ratio. */
  readonly w: number;
  readonly h: number;
}

export interface Asset {
  /** Stable, lower-case, used in ids. */
  readonly id: string;
  /** Upper-case, as VERSUS spelled it. */
  readonly label: string;
  /** Which creature this is a look for, and the VERSUS slot it came from. */
  readonly from: string;
  /** Set when the game draws this today; the card says so and the rest are
   * read beside it. */
  readonly inGame?: boolean;
  /** What it is, in plain words, and where on the picture to look. */
  readonly claim: string;
  /** What the owner said about it, or where it might go next. */
  readonly note: string;
  draw(c: AssetContext, f: AssetFrame): void;
}
