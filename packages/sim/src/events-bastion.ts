import type { BastionLayer } from "./bastion.js";

/**
 * What THE BASTION says as it happens, one line per thing the picture and the
 * sound answer.
 *
 * Every event carries `col`, the column it happened over, for the sounds to
 * pan to. A seat is `seat`, nought the pilot; a piece is `piece`, its index in
 * the lit shell's own order.
 */

interface BastionColEvent {
  /** The column it happened over. */
  col: number;
}

export type BastionEvent =
  /** The moon comes in over the field. */
  | ({ type: "bastionEnter" } & BastionColEvent)
  /** A shell lit: which. */
  | ({ type: "bastionLayer"; layer: BastionLayer } & BastionColEvent)
  /** A plate pulled out far enough tears off and flies; `seat` pulled it. */
  | ({ type: "bastionTear"; seat: 0 | 1; piece: number } & BastionColEvent)
  /** A plate let go before it tore snaps back, and starts over. */
  | ({ type: "bastionSnap"; seat: 0 | 1; piece: number } & BastionColEvent)
  /** A thumb went down on the partner's side, and took hold of nothing. */
  | ({ type: "bastionWrong"; seat: 0 | 1 } & BastionColEvent)
  /** A gun shot in its colour at the front blows apart. */
  | ({ type: "bastionGun"; piece: number } & BastionColEvent)
  /** A node begins to charge over its column. */
  | ({ type: "bastionCharge"; piece: number } & BastionColEvent)
  /** The shield met a node's lightning and threw it back: the node bursts. */
  | ({ type: "bastionBurst"; piece: number } & BastionColEvent)
  /** A node's lightning came down with no shield under it, and the node charges again. */
  | ({ type: "bastionArc"; piece: number } & BastionColEvent)
  /** A bolt went down the port into the inner hull; it turns, and the next port opens. */
  | ({ type: "bastionPort"; piece: number } & BastionColEvent)
  /** The lit shell's last piece is off: the shell comes away and the moon shrinks. */
  | ({ type: "bastionShed"; layer: BastionLayer } & BastionColEvent)
  /** A shell's time ran out: its pieces grow back. */
  | ({ type: "bastionRegrow"; layer: BastionLayer } & BastionColEvent)
  /** The last shell is off: the core blows. */
  | ({ type: "bastionSpent" } & BastionColEvent)
  /** The moon is gone; the wave may end. */
  | ({ type: "bastionOut" } & BastionColEvent);
