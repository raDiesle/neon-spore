import type { ViewRole } from "@neon-spore/render";
import { VARIANTS } from "../../versus/candidates/index.js";
import { patchedFields, type Slot, slots, type Variant } from "../../versus/variant.js";
import { el } from "./checks-dom.js";
import type { Pose } from "./pose-kit.js";
import { controlsBar } from "./versus-controls.js";
import { startPair } from "./versus-pair.js";
import { poseForSlot } from "./versus-pose.js";
import { seatsDiffer } from "./versus-seat.js";
import { buildVoteBox, type Head, readHead } from "./versus-vote.js";

/**
 * The ALTERNATIVES section: a contact sheet, not an instrument.
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
 *
 * No longer its own tab: folded into OTHER GRAPHICS (`raster-page.ts`) beside
 * the baked-animation candidates, because both pages are the same kind of
 * thing — a look offered beside what ships, never in place of it — and a
 * separate ALTERNATIVES button was one more tab to click through to see
 * either. `mountVersusSection` appends this section's own intro and mount
 * point into the host page handed to it, rather than building a tab and a
 * page of its own the way it used to.
 */

/**
 * Appends the ALTERNATIVES intro and its empty mount point into `host` — the
 * OTHER GRAPHICS page — rather than building a tab and a page of its own.
 * Idempotent the way the old `mountVersusTab` was, guarded on the mount
 * point's own id rather than a tab-and-page id that no longer exists here.
 */
export function mountVersusSection(host: HTMLElement): void {
  if (document.getElementById("versusMount")) return;

  host.appendChild(el("h2", "", "ALTERNATIVES"));
  host.appendChild(
    el(
      "p",
      "note",
      "Every open candidate, beside the shipped thing it would replace, at once — " +
        "a colour, a shape, a motion put on two phones at tempo and voted on.",
    ),
  );
  host.appendChild(
    el(
      "p",
      "note",
      "Left is what the game draws today; right is the same code with the " +
        "candidate's patch held for one draw. Both at 380 × 820 CSS pixels, " +
        "uncapped — a picture that shrinks to fit the window answers the 26 px " +
        "question by making it unanswerable. A second screen appears only where " +
        "the two seats genuinely draw something different; the page decides that " +
        "itself. A candidate shown as a screenshot (`versus-page.ts`'s `renderScreen`) " +
        "drops the CURRENT side entirely — one picture, not a compare.",
    ),
  );
  const mount = el("div");
  mount.id = "versusMount";
  host.appendChild(mount);
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

  // A screenshot candidate is always one seat, never both — the whole point
  // is a still picture documenting this answer, not a seat-by-seat compare.
  const screens = candidate.screenshot
    ? (["p1"] as const)
    : seatsDiffer(pose, candidate)
      ? (["p1", "p2"] as const)
      : (["p1"] as const);
  const screensHost = el("div", "versus-screens");
  for (const role of screens) {
    screensHost.appendChild(renderScreen(slot, pose, role, candidate, screens.length > 1));
  }
  row.append(screensHost);

  const vote = buildVoteBox(slot, head);
  vote.setCandidate(candidate);
  row.appendChild(vote.root);
  return row;
}

/** One screen at one seat: current-vs-candidate side by side, or — for a
 * `screenshot` candidate — the candidate alone. */
function renderScreen(
  slot: Slot,
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
  const rightBox = el("div", "versus-side");
  // A stable hook for `bun run shot` to grab one candidate's own screen.
  rightBox.dataset.versusKey = `${slot.slot}/${candidate.name}/${role}`;

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
  rightBox.appendChild(pair.right);

  if (candidate.screenshot) {
    // No CURRENT side at all: `pair.left` is built but never mounted here —
    // the whole point of a screenshot row is one picture documenting this
    // answer, not a compare. `freeze`, not `setRunning(false)`, so the frame
    // it holds carries no `hud.ts` "PAUSED" caption.
    window.setTimeout(() => pair.freeze(), candidate.screenshot.freezeSeconds * 1000);
    stage.append(rightBox);
    screen.append(stage, banner);
    return screen;
  }

  const leftBox = el("div", "versus-side");
  leftBox.appendChild(el("div", "versus-name", "CURRENT — what the game draws today"));
  rightBox.prepend(el("div", "versus-name", " "));
  leftBox.appendChild(pair.left);
  stage.append(leftBox, rightBox, tag);
  screen.append(stage, ...controlsBar(stage, pair), banner);
  return screen;
}
