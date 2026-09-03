/**
 * What the network indicator may say. The list is closed on purpose.
 *
 * Open question 10 asks how the Blind One's interference is told apart from a
 * real disconnection. This is the answer's foundation: the indicator's
 * vocabulary belongs to the network layer and to nothing else. A creature that
 * blinds a player may take away any part of that player's picture, but it may
 * never produce one of these states — so a dead indicator always means a dead
 * link, and interference always looks like something the game did.
 */
export type LinkState =
  /** Not in a room. One device, both seats — the desk setup. */
  | "solo"
  /** The socket is opening. */
  | "connecting"
  /** In a room, alone. Waiting for the other phone. */
  | "waiting"
  /** Both present; the clocks have not agreed yet. */
  | "syncing"
  /**
   * Both here, clocks agreed, and the room is waiting on the press.
   *
   * Beat zero used to be stamped the moment the second phone landed, so the
   * pair was dropped onto a field three seconds later whether or not either of
   * them had looked up. Nothing is stamped now until both seats say they are
   * ready, and this is that wait — which may last as long as the two people
   * want it to.
   */
  | "ready"
  /** Both pressed, clocks agreed, beat zero still ahead. */
  | "countdown"
  /** Playing. */
  | "live"
  /** Socket open, peer silent. The simulation is holding its breath. */
  | "stalled"
  /** Socket closed. */
  | "lost"
  /**
   * The room already has two people in it. A third phone typing the code is
   * the ordinary way to reach this, and it is not a network fault — telling
   * someone the connection died sends them to check a signal that is fine.
   */
  | "full"
  /** The two worlds no longer agree. Nothing after this point is a real game. */
  | "desync";

export interface LinkStatus {
  state: LinkState;
  /** The room, once there is one. */
  room: string;
  /** Which seat this device holds, 0 before the room says. */
  player: 0 | 1 | 2;
  /**
   * How many are in the room, as the room itself counts them — 0 with no room,
   * 1 waiting alone, 2 once the other phone is here. The room refuses a third,
   * so it never exceeds two. Carried rather than re-derived from `state`: the
   * screen needs to know the other seat is filled, and a rule that reads that
   * off which `LinkState` we are in is a second copy of the room's own count
   * that drifts the moment a state is added.
   */
  peers: number;
  /** Median round trip in milliseconds, -1 before it is measured. */
  rttMs: number;
  /** Ticks the peer's promise reaches past the simulation. Negative is a stall. */
  slack: number;
  /** Milliseconds until beat zero, 0 once it has passed. */
  countdownMs: number;
  /** Whether this device has pressed START. */
  readyHere: boolean;
  /** Whether the other seat has. Always false while there is no other seat. */
  readyThere: boolean;
  /**
   * What the two people are called, by seat — `names[0]` is player 1's.
   * "" for a seat that is empty or whose player gave no name, which every
   * screen already has a word for.
   */
  names: readonly [string, string];
  /**
   * The lag this device is currently carrying between a touch and the tick it
   * lands on — `InputDelay` in milliseconds, 0 when playing alone. It is the
   * one number that says how the link *feels* rather than how it measures, so
   * it is here beside the round trip rather than derived from it.
   */
  delayMs: number;
  /**
   * How long the run has been waiting on the other phone, in milliseconds, and
   * 0 whenever it is not. A stall is the one fault a player can *do* something
   * about — wait it out, or leave and come back later — and neither choice can
   * be offered without a number to make it on. See `link.ts`, which counts it,
   * and `hold.ts`, which is the card that puts the choice on the screen.
   */
  stalledMs: number;
  /**
   * How long this device has been without a socket, in milliseconds, and 0
   * while it has one. The peer going quiet and this phone losing its own line
   * are different sentences to the player, so they are different numbers here.
   */
  awayMs: number;
  /** The tick the two worlds parted, or null. */
  desyncTick: number | null;
  /**
   * Inputs the peer filed for a tick it had already promised to leave alone,
   * or so far ahead of this run that it is not in it. A `desync` reached this
   * way is a peer that broke the model rather than two worlds that drifted, and
   * the screen says which — the two are found in different places.
   */
  brokenPromises: number;
}

/**
 * The link before there is one: no room, no seat, nothing measured.
 *
 * Written down once because it was written down twice — the room screen and a
 * test each carried their own copy, and every field added to `LinkStatus` had
 * to be added to both or the type check found it in the wrong place. It is the
 * honest starting value for anything that has to hold a status before the link
 * has said anything, which is every screen that draws one.
 */
export const SOLO_STATUS: LinkStatus = {
  state: "solo",
  room: "",
  player: 0,
  peers: 0,
  rttMs: -1,
  slack: 0,
  countdownMs: 0,
  readyHere: false,
  readyThere: false,
  names: ["", ""],
  delayMs: 0,
  stalledMs: 0,
  awayMs: 0,
  desyncTick: null,
  brokenPromises: 0,
};

const LABELS: Record<LinkState, string> = {
  solo: "SOLO",
  connecting: "LINK…",
  waiting: "WAIT",
  syncing: "SYNC",
  ready: "PRESS",
  countdown: "READY",
  live: "LINK",
  stalled: "HOLD",
  lost: "LOST",
  full: "FULL",
  desync: "SPLIT",
};

export function linkLabel(state: LinkState): string {
  return LABELS[state];
}

/** Whether this state is one a player has to do something about. */
export function linkIsFault(state: LinkState): boolean {
  return state === "lost" || state === "desync" || state === "full";
}
