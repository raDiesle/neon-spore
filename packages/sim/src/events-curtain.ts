import type { Color } from "./types.js";

/**
 * **Everything THE CURTAIN does that neither screen already says**, as
 * events.
 *
 * Its own file on `events-gorge.ts`' terms — one boss taken apart rather
 * than incidents that share a body — and one arm of `SimEvent`, so every
 * consumer still switches over the whole list.
 *
 * Where the fabric hangs, which lobes stand and which are soft, and where
 * the core is are all read off `CurtainState` and its body every frame
 * (`curtain.ts`). What is *not* in the world a frame later is the moment the
 * fabric moved, a lobe came off, the core took a hit or fired, the sheet
 * tore — so each of these is one such edge, and every one names a column,
 * because a column is the whole of what the pair has to say to each other.
 */

/** A column's worth of THE CURTAIN, for the events that name one. */
interface CurtainColEvent {
  /** The column it happened in. */
  col: number;
}

export type CurtainEvent =
  /** The fabric is unrolled across `col` onward, `width` columns of it, every lobe standing. */
  | ({ type: "curtainUnroll"; width: number } & CurtainColEvent)
  /** The core stands in `col`, in `color`: where its shadow falls through the fabric. */
  | ({ type: "curtainShadow"; color: Color } & CurtainColEvent)
  /** A lobe over `col` is soft this cycle: a shot into it takes it off. */
  | ({ type: "curtainSoft" } & CurtainColEvent)
  /** The hands carried the fabric `stride` columns the way `dir` says; `col` is its left edge now. */
  | ({ type: "curtainShove"; dir: -1 | 1; stride: number } & CurtainColEvent)
  /** Nobody held it and it rolled a column back over the core; `col` is its left edge now. */
  | ({ type: "curtainReroll"; dir: -1 | 1 } & CurtainColEvent)
  /** The lobe over `col` came off; `left` is how many still hang. */
  | ({ type: "curtainLobeOff"; left: number } & CurtainColEvent)
  /** The core took a hit in its own colour; `left` is how many more it takes. */
  | ({ type: "curtainCoreHit"; left: number } & CurtainColEvent)
  /** The core let a rock go down `col`. */
  | ({ type: "curtainFire" } & CurtainColEvent)
  /** The hem was bare and the shove tore the sheet off the rail: the core hangs naked in `col`. */
  | ({ type: "curtainTear" } & CurtainColEvent)
  /** The last hit: the core is out in `col`, and the fight is over. */
  | ({ type: "curtainOut" } & CurtainColEvent);
