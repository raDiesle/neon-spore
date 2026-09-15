import type { LinkStatus } from "@neon-spore/net";
import { DIFFICULTIES, type Difficulty } from "@neon-spore/sim";
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

/**
 * CONTINUE's own sentence, which is the row saying which of its three answers
 * this press will be (`menu.ts`).
 *
 * The parted run comes first and not last: it is the one case where a field is
 * open under the menu and going back to it is worth nothing, because the world
 * on the other phone is no longer this one. The pair is told what happened in
 * the words the rest of the game uses for it — *out of step* — and what the two
 * of them have to do about it, which is press the same thing at the same time.
 */
function continueLine(link: LinkStatus | null, opened: boolean, wave: number): string {
  // Pressed here and not yet there: the row is the only thing on either screen
  // that can say what this phone is waiting for, which is why the press leaves
  // the menu up (`menu.ts`).
  if (link?.readyHere && !link.readyThere) {
    return "Waiting for the other phone. The wave starts the moment they press it too.";
  }
  if (link?.state === "desync") {
    return "The two phones have gone out of step. Both press it, and the wave starts again together.";
  }
  if (opened) return `Back to wave ${wave + 1}.`;
  return "Both of you press it, and the wave starts on the two phones together.";
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

/** The DIFFICULTY row's own sentence, by level: what this one *is*, before the
 * warning every one of them carries. */
const LEVEL_WORD: Record<Difficulty, string> = {
  easy: "Easy — a fifth slower than the game as it ships.",
  medium: "Medium — the game as it has always been played.",
  hard: "Hard — a quarter faster, on the same waves.",
};

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
  /** Whether anything has been played yet — which of CONTINUE's three answers
   * this press is, and therefore what its line says. */
  opened: boolean;
  /** The wave the field is on, for CONTINUE's line while one is open. */
  wave: number;
}

/** Cheap, so it is redone rather than diffed. */
export function paintLink({ dom, link, pairs, held, opened, wave }: LinkPaint): void {
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
  // **CONTINUE is offered only while both phones are in the room**, which is the
  // owner's rule and is about what a press can honestly do: the wave belongs to
  // two devices, so one of them starting it alone is two people playing two
  // different games. Until then the room's own line says who is missing, and a
  // device on its own reaches the field through the room or through the rig.
  //
  // Its sentence is which of CONTINUE's three answers this press will be
  // (`menu.ts`): back to a field that is already running, the room's START, or —
  // off the wire, where the row is not drawn — the furthest wave reached here.
  dom.setEntry("continue", {
    on: room && (link?.peers ?? 0) >= 2,
    desc: continueLine(link, opened, wave),
  });
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
  // **The difficulty, and which of the three is on.** The room's answer where
  // there is a room — a level is a tempo and the pair plays one — and this
  // device's where there is not. The row that opens the page says it, and the
  // page's own three rows carry the mark, because a page of three settings with
  // nothing saying which one you are on is three settings you have to guess at.
  const level = link?.level ?? far.level;
  dom.setEntry("level", { desc: `${LEVEL_WORD[level]} Changing it starts the run again.` });
  for (const one of DIFFICULTIES) {
    dom.setEntry(one, { label: one === level ? `${one.toUpperCase()} · ON` : one.toUpperCase() });
  }
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
