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

const SEATS: { role: ViewRole; tag: string; name: string; what: string }[] = [
  {
    role: "p1",
    tag: "P1",
    name: "PILOT",
    what: "Slides the cannon, opens the maw, triggers the guard.",
  },
  { role: "p2", tag: "P2", name: "NAVIGATOR", what: "Slides the shield, fires red and cyan." },
  {
    role: "test",
    tag: "BOTH",
    name: "ONE SCREEN",
    what: "Both bands and the test rig, for one person at a desk.",
  },
];

/** What `buildMenu` keeps of the block: the node, and the two ways to paint it. */
export interface SeatBlock {
  seatBlock: HTMLElement;
  paintSeat: (role: ViewRole) => void;
  lockSeats: (locked: boolean, why: string) => void;
}

export function buildSeats(onSeat: (role: ViewRole) => void): SeatBlock {
  const block = el("div", "seats");
  block.append(el("h2", undefined, "SEAT"));
  const note = el("p", "seat-note");
  const buttons = SEATS.map((s) => {
    const button = el("button", "seat-card");
    button.type = "button";
    button.append(el("span", "tag", s.tag));
    button.append(el("span", "name", s.name), el("span", "what", s.what));
    button.addEventListener("click", () => {
      if (button.disabled) return;
      onSeat(s.role);
    });
    block.append(button);
    return { role: s.role, el: button };
  });
  block.append(note);

  return {
    seatBlock: block,
    paintSeat: (role) => {
      for (const b of buttons) b.el.classList.toggle("on", b.role === role);
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
