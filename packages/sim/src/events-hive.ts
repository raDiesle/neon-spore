import type { Color } from "./types.js";

/**
 * **Everything THE HIVE does that neither screen already says**, as events.
 *
 * Its own file on `events-lead.ts`' terms — one boss taken apart rather
 * than incidents that share a body — and one arm of `SimEvent`, so every
 * consumer still switches over the whole list.
 *
 * Which sites are open, sealed or swelling is read off `HiveState` every
 * frame (`hive.ts`). What is *not* in the world a frame later is the moment
 * a site opened, the rock a breach spilled, and what a bolt out of the top
 * met — skin, the wrong colour, or the seal. Every one names a column,
 * because the ear pans on one: the site's own, or the middle for the body.
 */

/** A column's worth of THE HIVE, for the ear to pan on. */
interface HiveColEvent {
  /** The column it happened over. */
  col: number;
}

export type HiveEvent =
  /** The body is in over the field, every site shut, hanging over `col` — the middle. */
  | ({ type: "hiveEnter" } & HiveColEvent)
  /** The site at `col` swells: it opens in `hiveSwellBeats`. Only the navigator is shown it. */
  | ({ type: "hiveSwell" } & HiveColEvent)
  /** The site at `col` opened, `color` inside it. Only the pilot is shown the colour. */
  | ({ type: "hiveOpen"; color: Color } & HiveColEvent)
  /** The open breach at `col` spilled a rock down its column. */
  | ({ type: "hiveSpill" } & HiveColEvent)
  /** A bolt left the top at `col` and met skin, a scar or a shut site: nothing. */
  | ({ type: "hiveSkin" } & HiveColEvent)
  /** A bolt of the wrong colour went into the breach at `col`: every open breach spills sooner. */
  | ({ type: "hiveWrong" } & HiveColEvent)
  /** The breach at `col` is sealed for good, `left` sites still unsealed. */
  | ({ type: "hiveSeal"; left: number } & HiveColEvent)
  /** The last site sealed at `col`: the body is beaten and hangs. */
  | ({ type: "hiveDown" } & HiveColEvent)
  /** The body is out, `hiveOutBeats` after the last seal; the wave may end. */
  | ({ type: "hiveOut" } & HiveColEvent);
