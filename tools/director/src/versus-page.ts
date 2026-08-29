import type { ViewRole } from "@neon-spore/render";
import { VARIANTS } from "../../versus/candidates/index.js";
import { patchedFields, type Slot, slots, type Variant } from "../../versus/variant.js";
import { button, el } from "./checks-dom.js";
import type { Pose } from "./pose-kit.js";
import { startPair } from "./versus-pair.js";
import { poseForSlot } from "./versus-pose.js";
import { seatsDiffer } from "./versus-seat.js";
import { buildVoteBox, type Head, readHead } from "./versus-vote.js";

/**
 * The ALTERNATIVES sheet: a contact sheet, not an instrument.
 *
 * `docs/queue.md`'s "THE ALTERNATIVES PAGE SHOWS EVERYTHING AT ONCE" is this
 * file's whole brief, in the owner's own words. Everything open is rendered
 * at once, flat, with no control touched: every candidate of every slot gets
 * its own row, the shipped thing on the left and that one candidate on the
 * right, repeated down the page — never a matrix, never a slot switcher,
 * never a seat dropdown. `versus-pose.ts` picks the pose that puts a slot's
 * own animation on screen, `versus-seat.ts` decides — honestly, by rendering
 * and comparing, not by guessing — whether a row needs the other seat drawn
 * beside it, and `versus-pair.ts` is the engine underneath each screen.
 */

const TAB_ID = "versus";
const RATES = [0.25, 0.5, 1, 2];

function toggle(label: string, on: (state: boolean) => void): HTMLButtonElement {
  const b = button(label);
  b.addEventListener("click", () => {
    const next = b.dataset.state !== "on";
    b.dataset.state = next ? "on" : "off";
    b.classList.toggle("on", next);
    on(next);
  });
  return b;
}

function picker<T>(items: readonly T[], name: (x: T) => string, on: (x: T) => void, at = 0) {
  const sel = document.createElement("select");
  items.forEach((item, i) => {
    const opt = document.createElement("option");
    opt.value = String(i);
    opt.textContent = name(item);
    sel.appendChild(opt);
  });
  sel.value = String(at);
  sel.addEventListener("change", () => {
    const item = items[Number(sel.value)];
    if (item) on(item);
  });
  return sel;
}

/** The tab button and its empty page, appended before `bindTabs` runs. */
export function mountVersusTab(): void {
  const tabs = document.getElementById("backlogTabs");
  const body = document.getElementById("backlogBody");
  if (!tabs || !body || document.getElementById(`sheet-${TAB_ID}`)) return;

  const tab = button("ALTERNATIVES");
  tab.dataset.tab = TAB_ID;
  tabs.appendChild(tab);

  const page = el("div", "sheetpage");
  page.id = `sheet-${TAB_ID}`;
  page.appendChild(
    el(
      "p",
      "pagewhat",
      "Every open candidate, beside the shipped thing it would replace, at once — " +
        "a colour, a shape, a motion put on two phones at tempo and voted on.",
    ),
  );
  page.appendChild(
    el(
      "p",
      "note",
      "Left is what the game draws today; right is the same code with the " +
        "candidate's patch held for one draw. Both at 380 × 820 CSS pixels, " +
        "uncapped — a picture that shrinks to fit the window answers the 26 px " +
        "question by making it unanswerable. A second screen appears only where " +
        "the two seats genuinely draw something different; the page decides that " +
        "itself.",
    ),
  );
  const mount = el("div");
  mount.id = "versusMount";
  page.appendChild(mount);
  body.appendChild(page);
}

let drawn = false;

/** Built on first sight of the tab. See `guide-page.ts` for the same lazy draw. */
export function drawVersus(): void {
  if (drawn) return;
  drawn = true;
  const mount = document.getElementById("versusMount");
  if (!mount) return;
  const open = slots(VARIANTS);
  if (open.length === 0) {
    const none =
      "No slot is open, which is a correct state and not a broken one. A slot " +
      "is a shape the game already draws and a second answer to it: write one " +
      "under tools/versus/candidates/. `bun run versus` says how.";
    mount.appendChild(el("p", "note", none));
    return;
  }

  const totalScreens = open.reduce((n, s) => n + s.candidates.length, 0);
  if (totalScreens > 10) {
    mount.appendChild(
      el(
        "p",
        "note",
        `${totalScreens} candidates are open — past what this page tries to keep ` +
          "animating at once. Nothing here throttles it; that is the honest report " +
          "rather than a quiet stutter, and the next lane to add a slot should read it.",
      ),
    );
  }

  readHead()
    .then((head) => {
      for (const slot of open) mount.appendChild(renderSlot(slot, head));
    })
    .catch(() => {
      const head: Head = { head: "unknown", dirty: true };
      for (const slot of open) mount.appendChild(renderSlot(slot, head));
    });
}

/** One slot: its heading, and one row per candidate — never a switcher. */
function renderSlot(slot: Slot, head: Head): HTMLElement {
  const section = el("div");
  section.appendChild(el("h2", "", slot.slot.toUpperCase()));
  const pose = poseForSlot(slot.slot);
  for (const candidate of slot.candidates) {
    section.appendChild(renderRow(slot, candidate, pose, head));
  }
  return section;
}

/** One candidate against the shipped thing — one or two screens, decided by
 * `seatsDiffer`, never by a picker. */
function renderRow(slot: Slot, candidate: Variant, pose: Pose, head: Head): HTMLElement {
  const row = el("div", "versus-row");
  row.appendChild(
    el("p", "versus-name", `${candidate.name.toUpperCase()} — ${candidate.sentence}`),
  );
  row.appendChild(
    el(
      "p",
      "versus-patch",
      candidate.patches
        .map((p) => `${p.where.file} · ${p.where.symbol} — ${patchedFields(p).join(", ")}`)
        .join("  ·  "),
    ),
  );

  const screens = seatsDiffer(pose, candidate) ? (["p1", "p2"] as const) : (["p1"] as const);
  const screensHost = el("div", "versus-screens");
  for (const role of screens) {
    screensHost.appendChild(renderScreen(pose, role, candidate, screens.length > 1));
  }
  row.append(screensHost);

  const vote = buildVoteBox(slot, head);
  vote.setCandidate(candidate);
  row.appendChild(vote.root);
  return row;
}

/** One current-vs-candidate screen at one seat. */
function renderScreen(
  pose: Pose,
  role: ViewRole,
  candidate: Variant,
  labelled: boolean,
): HTMLElement {
  const screen = el("div", "versus-screen");
  if (labelled) {
    screen.appendChild(
      el("p", "versus-screen-label", role === "p1" ? "P1'S SCREEN" : "P2'S SCREEN"),
    );
  }
  const stage = el("div", "versus-stage");
  const tag = el("div", "versus-tag");
  const leftBox = el("div", "versus-side");
  const rightBox = el("div", "versus-side");
  leftBox.appendChild(el("div", "versus-name", "CURRENT — what the game draws today"));
  rightBox.appendChild(el("div", "versus-name", " "));
  stage.append(leftBox, rightBox, tag);

  const banner = el("div", "versus-banner");
  const pair = startPair(
    { pose, role, variant: candidate },
    {
      onSettled(identical) {
        banner.textContent = identical
          ? "THE SWAP DID NOT TAKE — or this candidate is the current one"
          : "";
        banner.classList.toggle("on", identical);
      },
      onBlink(side) {
        tag.textContent = side === "left" ? "CURRENT" : candidate.name.toUpperCase();
      },
    },
  );
  leftBox.appendChild(pair.left);
  rightBox.appendChild(pair.right);

  const bar = el("div", "versus-bar");
  bar.append(
    toggle("⏸", (paused) => pair.setRunning(!paused)),
    picker(RATES, (r) => `${r}×`, pair.setRate, RATES.indexOf(1)),
    toggle("BLINK", (on) => {
      stage.classList.toggle("is-blink", on);
      pair.setBlink(on);
    }),
    toggle("2× — NOT TRUE SIZE", (on) => pair.setZoom(on ? 2 : 1)),
  );
  screen.append(
    stage,
    el(
      "p",
      "versus-blink-note",
      "BLINK superimposes the two sides and flips between them once a second — " +
        "the astronomer's trick for a difference too small to catch side by side.",
    ),
    bar,
    banner,
  );
  return screen;
}
