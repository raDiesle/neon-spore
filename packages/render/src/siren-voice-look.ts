import { drawEarGlyph, drawSpeechGlyph } from "./comms-glyphs.js";

/**
 * The mark at the end of each siren chip — *say it* on the talker's, *listen*
 * on the listener's — as the record VERSUS offers answers through
 * (`siren:voice`, opened 18 October 2026, when the owner asked for an
 * animation of speaking and of listening that reads at a glance).
 *
 * The shipped answer is the still speech bubble and ear of `comms-glyphs.ts`.
 * Each is handed the glyph's middle, its ink and the host's clock, so an
 * answer may move. Its own file, importing nothing it would have to draw with,
 * so a candidate can reach it without the siren's whole import graph.
 */
export interface SirenVoiceLook {
  /** On the talker's lit block, in the block's dark ink. */
  speak: (ctx: CanvasRenderingContext2D, x: number, y: number, ink: string, time: number) => void;
  /** On the listener's dark pill, in its dim ink. */
  listen: (ctx: CanvasRenderingContext2D, x: number, y: number, ink: string, time: number) => void;
}

/** A size up from the 5.4 it was, so the bubble is the first thing on the
 * block: the owner, 18 October 2026, asked for the icon of saying to be
 * louder. */
const SPEAK_S = 6.2;
const LISTEN_S = 5;

export const SIREN_VOICE: SirenVoiceLook = {
  speak: (ctx, x, y, ink) => drawSpeechGlyph(ctx, x, y - 1, SPEAK_S, ink, 1),
  listen: (ctx, x, y, ink) => drawEarGlyph(ctx, x, y, LISTEN_S, ink, 0.95),
};
