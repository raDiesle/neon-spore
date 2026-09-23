import { poseArt } from "./pose-art.js";
import type { Pose, PoseGroup } from "./pose-kit.js";

/**
 * One STATES group on the page: its heading, its note and its row of cards,
 * filled lazily. Cut out of `states-page.ts` on 23 September 2026 when naming
 * the group and the card for `bun run shot --click` took that file within
 * thirty lines of its ceiling; the seam was already here, since everything in
 * this file is one group and nothing in it knows about the sheet around it.
 */

const CARD = 210;

function card(pose: Pose): HTMLElement {
  const div = document.createElement("div");
  div.className = "state";
  div.dataset.pose = pose.name;

  const frame = document.createElement("div");
  frame.className = "shot";
  try {
    frame.appendChild(poseArt(pose, CARD));
  } catch (e) {
    // A pose that can no longer reach its own state is a caption without a
    // picture, and that is worth seeing rather than hiding: it means the
    // simulation moved and this list did not. `test/poses.test.ts` fails on
    // the same thing, which is where it should be caught first.
    frame.classList.add("is-broken");
    const why = document.createElement("span");
    why.textContent = "✕";
    why.title = e instanceof Error ? e.message : String(e);
    frame.appendChild(why);
  }
  div.appendChild(frame);

  const name = document.createElement("div");
  name.className = "name";
  name.textContent = pose.name;
  div.appendChild(name);

  if (pose.role && pose.role !== "test") {
    const seat = document.createElement("span");
    seat.className = "seat";
    seat.textContent = pose.role === "p1" ? "PILOT'S SCREEN" : "NAVIGATOR'S SCREEN";
    div.appendChild(seat);
  }

  const note = document.createElement("p");
  note.className = "blurb";
  note.textContent = pose.note;
  div.appendChild(note);
  return div;
}

/**
 * One group's own watcher, shared across every group's `section`: thirty-odd
 * of them exist on the page at once, and a group scrolled into view is the
 * one thing every one of these entries has in common, so one observer sorts
 * them by `entry.target` rather than the page carrying thirty.
 */
let sectionWatcher: IntersectionObserver | null = null;
const sectionFillers = new WeakMap<Element, () => void>();

function watchSection(el: Element, fill: () => void): void {
  if (typeof IntersectionObserver !== "function") {
    fill();
    return;
  }
  sectionFillers.set(el, fill);
  sectionWatcher ??= new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const seen = sectionFillers.get(entry.target);
      if (!seen) continue;
      sectionFillers.delete(entry.target);
      sectionWatcher?.unobserve(entry.target);
      seen();
    }
  });
  sectionWatcher.observe(el);
}

/**
 * One group: its heading and note drawn at once, its row of cards filled the
 * moment the group scrolls into view or its heading is clicked — never
 * before. Card art is a hand walked to a state (`pose-art.ts`), and
 * thirty-odd of them run synchronously in `renderStates`' one pass before
 * this; a click or a scroll spreads that cost over the time it takes to
 * reach the group, rather than paying all of it before the tab's first card
 * is on the page.
 */
export function section(group: PoseGroup): HTMLElement {
  const el = document.createElement("section");
  // **Named where a tool can ask for it**, in the words a reader already sees:
  // `bun run shot --click` runs plain CSS, CSS cannot match a heading's text,
  // and before this a group was `section:nth-of-type(n)` counted by hand. A
  // card carries its pose's name the same way, as `data-pose`.
  el.dataset.group = group.title;

  const h2 = document.createElement("h2");
  h2.textContent = group.title;
  el.appendChild(h2);

  const note = document.createElement("p");
  note.className = "note";
  note.textContent = group.note;
  el.appendChild(note);

  const row = document.createElement("div");
  row.className = "states-row";
  el.appendChild(row);

  let filled = false;
  const fill = (): void => {
    if (filled) return;
    filled = true;
    for (const pose of group.poses) row.appendChild(card(pose));
  };
  h2.addEventListener("click", fill);
  watchSection(el, fill);

  return el;
}
