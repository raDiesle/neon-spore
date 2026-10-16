import type { Color } from "./types.js";

/**
 * What THE GEODE says as it happens, one line per thing the picture and the
 * sound answer.
 *
 * Every event carries `col`, the column it happened over, for the sounds to
 * pan to. A piece is `piece`, its index in the lit level's own order, and a
 * level is `level`, its index in the script.
 */

interface GeodeColEvent {
  /** The column it happened over. */
  col: number;
}

export type GeodeEvent =
  /** The stone sinks in over the field. */
  | ({ type: "geodeEnter" } & GeodeColEvent)
  /** A level's cracks light: the stone starts to come down. */
  | ({ type: "geodeCracks"; level: number } & GeodeColEvent)
  /** A beam in a crack's colour ran down it: that piece breaks in two. */
  | ({ type: "geodeCleave"; level: number; piece: number; color: Color } & GeodeColEvent)
  /** A bolt, or a beam where no crack runs, met the stone: a chip and nothing. */
  | ({ type: "geodeChip"; lance: boolean } & GeodeColEvent)
  /** A beam down a crack of the other colour: the wave is lost. */
  | ({ type: "geodeWrong"; color: Color } & GeodeColEvent)
  /** The lit level's last piece is cut: the pieces fly apart. */
  | ({ type: "geodeSplit"; level: number } & GeodeColEvent)
  /** A level's time ran out: a piece still whole lands on the hull. */
  | ({ type: "geodeStrike"; level: number; piece: number } & GeodeColEvent)
  /** The heart's last crack is cut: the geode is beaten. */
  | ({ type: "geodeShatter" } & GeodeColEvent)
  /** The geode is gone; the wave may end. */
  | ({ type: "geodeOut" } & GeodeColEvent);
