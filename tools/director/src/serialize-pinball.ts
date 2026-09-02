import { pinPicture } from "@neon-spore/content";
import type { PinballRound } from "@neon-spore/sim";

/**
 * PINBALL's boards, written back out as the pictures they were drawn as.
 *
 * The one authored boss whose content does not live in an act file. Every
 * other one is a handful of numbers `serialize.ts` puts inline beside the
 * wave; a peg board is forty pieces, and forty rows of coordinates inside
 * `act-4.ts` would be exactly the unreadable thing `pinball-rounds.ts` exists
 * to avoid. So the wave names the list — `rounds: PINBALL_ROUNDS` — and this
 * regenerates the list where it lives.
 *
 * **Only the array is replaced.** `pinball-rounds.ts` also carries `pinBoard`
 * and `pinPicture`, which are the grid itself and must survive a save;
 * `serializeWaveArray` splices an act file the same way and for the same
 * reason. Everything above the marker is kept byte for byte, so the comments
 * an author wrote about *why* a board is shaped as it is stay above it.
 *
 * A board comes back through `pinPicture`, so what is written is exactly what
 * the editor painted — the round trip is the picture, not the pieces.
 */

const MARKER = "export const PINBALL_ROUNDS: PinballRound[] = [";

export function serializePinballRounds(source: string, rounds: readonly PinballRound[]): string {
  const idx = source.indexOf(MARKER);
  if (idx === -1) throw new Error("Could not find PINBALL_ROUNDS array in source");
  const prefix = source.slice(0, idx + MARKER.length);
  const body = rounds.map(serializeRound).join("\n");
  return `${prefix}\n${body}\n];\n`;
}

function serializeRound(round: PinballRound): string {
  const picture = pinPicture(round.pieces)
    .split("\n")
    .map((line) => `      ${line}`)
    .join("\n");
  return [
    "  {",
    `    beats: ${round.beats},`,
    "    pieces: pinBoard(`",
    picture,
    "    `),",
    "  },",
  ].join("\n");
}
