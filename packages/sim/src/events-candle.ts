/**
 * **Everything THE CANDLE does that neither screen already says**, as
 * events.
 *
 * Its own file on `events-undertow.ts`' terms — one boss taken apart rather
 * than incidents that share a body — and one arm of `SimEvent`, so every
 * consumer still switches over the whole list.
 *
 * Where the glow hangs, how many steps it has and which column it faces are
 * all read off `CandleState` every frame (`candle.ts`). What is *not* in the
 * world a frame later is the moment a step went, the moment a flash was
 * swallowed, the moment the flame came off the wick, the moment it lit again,
 * the moment the light went out — so each of these is one such edge. The darkness itself is render's and has no event: it begins on
 * `candleDark` and is counted from there.
 */

/** A column's worth of THE CANDLE, for the events that name one. */
interface CandleColEvent {
  /** The column it happened in. */
  col: number;
}

export type CandleEvent =
  /** The boss is in and the light is going out. Render's four beats start here. */
  | { type: "candleDark" }
  /** A shot up `col` took a step off the glow; `left` is what remains. */
  | ({ type: "candleDim"; left: number } & CandleColEvent)
  /** The glow drifted to `col`. */
  | ({ type: "candleMove" } & CandleColEvent)
  /** It turned to face `col` — the column player 2 must not fire from, on player 1's screen. */
  | ({ type: "candleTurn" } & CandleColEvent)
  /** A flash fired from the column it faces was swallowed; nothing left the muzzle and the glow is `left`. */
  | ({ type: "candleFed"; left: number } & CandleColEvent)
  /** One step left. It stands still now, eats nothing, and takes no shot. */
  | ({ type: "candleLast" } & CandleColEvent)
  /** The pilot pulled the flame off the wick in `col`. What is left takes the beam alone. */
  | ({ type: "candleSmoke" } & CandleColEvent)
  /** The beam was late and the wick lit again in `col`; `left` is the glow it came back with. */
  | ({ type: "candleLit"; left: number } & CandleColEvent)
  /** The last step is gone. The frame is black until the wave-end light. */
  | { type: "candleOut" };
