import type { LinkStatus, PlayerId } from "@neon-spore/net";
import type { InputBuffer } from "./input.js";

/**
 * Who pressed QUIT on the lost screen, for the menu to say.
 *
 * The press is a command, so the simulation is what knows who gave it: the
 * `quit` event carries the seat (`sim/wave-fail.ts`). The run is over on both
 * phones the same tick, and a screen comes up on both saying whose press it
 * was, because the phone that did not press it is otherwise looking at a
 * screen it never asked for: in a room the room screen, whose two READY holds
 * start the pair again (`join-room.ts` `mayHold`); off the wire the menu on
 * PLAY, where the way back in is — the owner's decisions of 13 and 17
 * September 2026. Held here, on its own, the way a sign-in is
 * (`sign-in.ts`): the wave progression hears the event, the shell opens the
 * screen, and the screen reads the name — three files, one fact.
 *
 * Cleared the moment a wave opens, on any path: a run that has started is not
 * one anybody quit.
 */
let by: PlayerId | 0 = 0;
let heard: (player: PlayerId) => void = () => {};

export function sayQuit(player: PlayerId): void {
  by = player;
  heard(player);
}

export function clearQuit(): void {
  by = 0;
}

/** The seat that quit, or 0 while nobody has since a wave last opened. */
export function quitBy(): PlayerId | 0 {
  return by;
}

/**
 * **The press itself**, from either of the two places a run is left: the lost
 * screen's QUIT (`lost.ts`) and the question the back gesture asks over a live
 * field (`back-ask.ts`). Both seats' commands go in whichever seat this device
 * holds — in a room the scheduler drops the half this device is not sitting
 * in, so the answer arrives signed by the seat that gave it, which is what
 * tells the other phone who quit (`sim/commands.ts`, `sim/wave-fail.ts`).
 */
export function pressQuit(buffer: InputBuffer): void {
  buffer.push(1, { kind: "quit" });
  buffer.push(2, { kind: "quit" });
}

/** The shell's ear: one listener, replaced rather than added to. */
export function onQuit(listen: (player: PlayerId) => void): void {
  heard = listen;
}

/**
 * The greeting while a quit stands. Which phone said it depends on which seat
 * this device holds: its own press is "you", the other's is the name the room
 * gave that seat, or the seat's number when it gave none. Off the wire both
 * seats are this device, so the press is always its own.
 */
export function quitLine(link: LinkStatus | null, wave: number): string {
  const player = by;
  if (player === 0) return "";
  const mine = link === null || link.state === "solo" || link.player === player;
  const name = link?.names[player - 1] || `Seat ${player}`;
  const who = mine ? "You" : name;
  const next =
    link !== null && link.state !== "solo"
      ? "The room is still open: both hold READY, and it starts again."
      : "PLAY starts it again.";
  return `${who} pressed QUIT on wave ${wave + 1}. The run is over. ${next}`;
}
