import { SCREEN_WORDS } from "@neon-spore/content";
import type { ViewRole } from "@neon-spore/render";
import { el } from "./menu-parts.js";

/**
 * THE SEAT, AS THREE CARDS WITH THE JOB WRITTEN ON EACH.
 *
 * It was a row of three buttons labelled P1, P2 and TEST, which is the
 * shortest thing that could be written and says nothing at all to the person
 * holding the phone: the whole point of two devices is that the two of you do
 * different jobs, and the choice is which job. So the card carries the name of
 * the job and the sentence that describes it, and the letters stay only as the
 * tag the rest of the game already uses.
 *
 * Lifted out of `menu-view.ts` while that file was at its length limit and the
 * menu was still growing a page a week. It is a whole control with its own
 * cards and its own lock, and nothing outside the three functions it returns
 * ever touches them — which is why it comes away without `buildMenu` changing
 * shape at all.
 */

const SEATS: { role: ViewRole; seat?: 1 | 2; tag: string; name: string; what: string }[] = [
  {
    role: "p1",
    seat: 1,
    tag: "P1",
    ...SCREEN_WORDS.p1,
  },
  {
    role: "p2",
    seat: 2,
    tag: "P2",
    ...SCREEN_WORDS.p2,
  },
  {
    role: "test",
    tag: "BOTH",
    ...SCREEN_WORDS.test,
  },
];

/** What `buildMenu` keeps of the block: the node, and the three ways to paint it. */
export interface SeatBlock {
  seatBlock: HTMLElement;
  paintSeat: (role: ViewRole) => void;
  lockSeats: (locked: boolean, why: string) => void;
  /**
   * The two people's names, as the room last said them.
   *
   * The tag on a card is P1 or P2 until the room knows who is sitting there,
   * and then it is the person: a card that says DAVID · NAVIGATOR is the one
   * sentence a pair setting up actually needs, and the letters were only ever
   * the game's way of saying it with nothing to go on. The third card is the
   * rig and has no person to name.
   */
  paintNames: (names: readonly [string, string]) => void;
}

export function buildSeats(onSeat: (role: ViewRole) => void): SeatBlock {
  const block = el("div", "seats");
  block.append(el("h2", undefined, "SCREEN"));
  const note = el("p", "seat-note");
  const buttons = SEATS.map((s) => {
    const button = el("button", "seat-card");
    button.type = "button";
    const tag = el("span", "tag", s.tag);
    button.append(tag);
    button.append(el("span", "name", s.name), el("span", "what", s.what));
    button.addEventListener("click", () => {
      if (button.disabled) return;
      onSeat(s.role);
    });
    block.append(button);
    return { role: s.role, seat: s.seat, tag, plain: s.tag, el: button };
  });
  block.append(note);

  return {
    seatBlock: block,
    paintSeat: (role) => {
      for (const b of buttons) b.el.classList.toggle("on", b.role === role);
    },
    paintNames: (names) => {
      for (const b of buttons) {
        const given = b.seat === undefined ? "" : (names[b.seat - 1] ?? "").trim();
        b.tag.textContent = given === "" ? b.plain : given.toUpperCase();
      }
    },
    lockSeats: (locked, why) => {
      for (const b of buttons) {
        b.el.disabled = locked;
        b.el.classList.toggle("locked", locked);
      }
      note.textContent = why;
      block.classList.toggle("held", locked);
    },
  };
}
