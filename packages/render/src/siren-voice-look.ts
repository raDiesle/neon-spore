import { mouthListen, mouthSpeak } from "./siren-voice-mouth.js";

/**
 * The mark at the end of each siren chip — *say it* on the talker's, *listen*
 * on the listener's — as the record VERSUS offered answers through
 * (`siren:voice`, opened 18 October 2026, when the owner asked for an
 * animation of speaking and of listening that reads at a glance).
 *
 * The shipped answer is MOUTH (`siren-voice-mouth.ts`), taken 19 October 2026;
 * the still speech bubble and ear of `comms-glyphs.ts` are what it replaced.
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

export const SIREN_VOICE: SirenVoiceLook = {
  speak: mouthSpeak,
  listen: mouthListen,
};
