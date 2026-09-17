import type { LinkStatus } from "@neon-spore/net";
import type { Difficulty } from "@neon-spore/sim";
import { roomLine } from "./join-words.js";
import type { MenuDom } from "./menu-view.js";
import { PARTNERS_KEPT, type Partner } from "./partners.js";
import { progressLine, readProgress } from "./progress.js";
import { quitBy, quitLine } from "./quit.js";

/**
 * WHAT A LINK CHANGES ON THE FRONT PAGE.
 *
 * The entries, the progress line and the seat lock all say something
 * different once this device is sharing a room, and `bindMainMenu` was the
 * only thing that knew which — a page's worth of `setEntry` calls inside a
 * closure over five other concerns. It is the part of that file with no state
 * of its own: hand it the page, the link and what the device has done, and the
 * same page comes out every time.
 *
 * Lifted out while `menu.ts` sat at its length limit, so the next page added
 * to the menu does not have to be squeezed in beside this.
 */

/**
 * A room is the one case where the menu must **not** stop the world, and it is
 * also what half the lines below are asking about. Exported because
 * `bindMainMenu` asks the same question of the run hold.
 */
export function inRoom(link: LinkStatus | null): boolean {
  return link !== null && link.state !== "solo";
}

/** The level in a word, for a line that is already saying something else. */
const LEVEL_NAME: Record<Difficulty, string> = { easy: "Easy", medium: "Medium", hard: "Hard" };

/**
 * A partner's row, in the owner's own sentence: *Continue game with David ·
 * wave 7*. The wave is on the label rather than in the description because it
 * is half of what the row offers — a pair choose an evening by where they got
 * to — and a label is what a thumb reads on the way past.
 */
export function partnerRow(one: Partner): string {
  const far = one.furthest > 0 ? ` · WAVE ${one.furthest + 1}` : "";
  return `CONTINUE GAME WITH ${one.name.toUpperCase()}${far}`;
}

/** The sentence under it: the tempo they play at, and that there is no code. */
export function partnerLine(one: Partner): string {
  return `${LEVEL_NAME[one.level]}. Back into the room you two share — no code to read out.`;
}

export interface LinkPaint {
  dom: MenuDom;
  /** The link as it last reported itself, or null before there was one. */
  link: LinkStatus | null;
  /**
   * The people this device can carry on with, most recent first — the rows the
   * PLAY page opens on. Only those it can actually reach a room with: a device
   * with no name of its own shares no room with anybody (`pairing.ts`), and a
   * row that cannot be pressed is worse than no row. Handed in rather than read
   * here so the caller keeps the one definition.
   */
  pairs: readonly Partner[];
  /**
   * The room this device was standing in a moment ago, or "" — `last-room.ts`,
   * handed in for `pairRoom`'s reason. It is a different question from the one
   * above: that is *who you play with*, this is *where you just were*, and the
   * second is the one a reload is about.
   */
  held: string;
  /** The wave the field is on, for the line that says which wave was quit. */
  wave: number;
}

/** Cheap, so it is redone rather than diffed. */
export function paintLink({ dom, link, pairs, held, wave }: LinkPaint): void {
  const room = inRoom(link);
  dom.setEntry("single", { on: !room });
  // How far this device has got, under the title. Off in a room, where the wave
  // is the pair's rather than this device's, and off for a device that has
  // never played.
  const far = readProgress();
  // A quit that stands is said here off the wire, where the room's row has
  // nothing to say, and on the room's row in a room (`quit.ts`).
  const quit = quitBy() !== 0 ? quitLine(link, wave) : "";
  dom.setProgress(room ? "" : quit || progressLine(far));
  // No CONTINUE row to paint: it left on 17 September 2026, and a press that
  // begins a wave on two phones is the READY hold on the room screen now
  // (`menu-entries.ts` says where each of its answers went).
  // **The list of people to carry on with**, which is what the PLAY page opens
  // on. Off in a room, where the pair is already together, and off before the
  // first meeting — a pair who have never played have no row and the
  // four-character code is still what a first meeting is for.
  for (let i = 0; i < PARTNERS_KEPT; i++) {
    const one = pairs[i];
    dom.setEntry(`pair${i}`, {
      on: !room && one !== undefined,
      ...(one === undefined ? {} : { label: partnerRow(one), desc: partnerLine(one) }),
    });
  }
  // **And the way back into the room this device was just in**, at the top of
  // the front page rather than a floor down behind PLAY (`menu-rejoin.ts`).
  // Off in a room, where there is nothing to go back to; on without a partner
  // and without a name, because a reload is not a meeting and asks nothing of
  // either of them.
  dom.setRejoin(room ? "" : held);
  dom.setEntry("leave", { on: room });
  // Who is sitting in each seat, on the cards. Blank for a seat the room has
  // not filled or a player who has given no name, which is what the cards said
  // before there were any (`menu-seats.ts`).
  dom.paintNames(link?.names ?? ["", ""]);
  dom.setEntry("room", {
    desc:
      (room && quit) || (link ? roomLine(link) : "Open a room, or type in the code you were told."),
  });
  dom.lockSeats(
    room && (link?.player ?? 0) !== 0,
    room && link?.player
      ? `The room gave you seat ${link.player}. Leave the room to play both halves on this device.`
      : "One device, both seats, or one seat each once you are in a room.",
  );
}
