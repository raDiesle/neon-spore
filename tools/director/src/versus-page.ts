import { VARIANTS } from "../../versus/candidates/index.js";
import { patchedFields, type Slot, slots, type Variant } from "../../versus/variant.js";
import { button, el } from "./dom.js";
import { candidateUrl, openInNewTab } from "./versus-open.js";
import { poseForSlot } from "./versus-pose.js";

/**
 * The ALTERNATIVES list: every open candidate as a door, and nothing drawn.
 *
 * "THE ALTERNATIVES PAGE SHOWS EVERYTHING AT ONCE" was this file's brief, and
 * it still is — every candidate of every slot is on this page, flat, with
 * nothing to pick before you can see what is offered. What changed is that
 * *showing* a candidate no longer means *animating* it here. Nine candidates
 * were eighteen live renderers stepping eighteen worlds at 60 Hz on one page,
 * and the owner met that as the page being unusable rather than as the page
 * being complete. So each row is now what a row always was in words — the
 * name, the sentence, the records it patches and the picture it will be judged
 * on — plus one button that opens exactly that comparison, alone, in a new tab
 * (`versus-one.ts`, reached through `versus-open.ts`).
 *
 * The list itself costs nothing: `poseForSlot` looks a pose up by name and
 * builds no world, so naming the pose on every row is free and is the answer
 * to "what am I even comparing" — the question a row that draws a slick while
 * claiming to be about the strand's bead cannot answer.
 */

export function versusListSection(): HTMLElement {
  const section = el("section");
  section.appendChild(el("h2", "", "ALTERNATIVES"));
  section.appendChild(
    el(
      "p",
      "note",
      "Every open candidate, with the shipped thing it would replace. Nothing " +
        "here is drawn on this page — one button per candidate opens it in a " +
        "new tab, alone, where it is the only thing the browser is animating.",
    ),
  );
  section.appendChild(
    el(
      "p",
      "note",
      "In that tab: left is what the game draws today, right is the same code " +
        "with the candidate's patch held for one draw. Both at 380 × 820 CSS " +
        "pixels, uncapped — a picture that shrinks to fit the window answers " +
        "the 26 px question by making it unanswerable. A second screen appears " +
        "only where the two seats genuinely draw something different; the page " +
        "decides that itself.",
    ),
  );

  const open = slots(VARIANTS);
  if (open.length === 0) {
    section.appendChild(
      el(
        "p",
        "note",
        "No slot is open, which is a correct state and not a broken one. A slot " +
          "is a shape the game already draws and a second answer to it: write one " +
          "under tools/versus/candidates/. `bun run versus` says how.",
      ),
    );
    return section;
  }

  for (const slot of open) section.appendChild(slotBlock(slot));
  return section;
}

/** One slot: its heading, and one door per candidate. */
function slotBlock(slot: Slot): HTMLElement {
  const block = el("div", "versus-slot");
  block.appendChild(el("h3", "", slot.slot.toUpperCase()));
  const pose = poseForSlot(slot.slot);
  block.appendChild(el("p", "versus-showing", `SHOWN ON — ${pose.name}. ${pose.note}`));
  for (const candidate of slot.candidates) block.appendChild(door(candidate));
  return block;
}

/** One candidate, said in words, with the button that draws it. */
function door(candidate: Variant): HTMLElement {
  const card = el("div", "versus-door");
  card.appendChild(
    el("p", "versus-name", `${candidate.name.toUpperCase()} — ${candidate.sentence}`),
  );
  card.appendChild(
    el(
      "p",
      "versus-patch",
      candidate.patches
        .map((p) => `${p.where.file} · ${p.where.symbol} — ${patchedFields(p).join(", ")}`)
        .join("  ·  "),
    ),
  );
  const url = candidateUrl(candidate);
  const open = button(`OPEN ${candidate.name.toUpperCase()} ↗`, "versus-cast");
  open.addEventListener("click", () => openInNewTab(url));
  card.appendChild(open);
  return card;
}
