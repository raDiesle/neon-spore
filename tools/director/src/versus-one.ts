import type { ViewRole } from "@neon-spore/render";
import { patchedFields, type Slot, type Variant } from "../../versus/variant.js";
import { el } from "./dom.js";
import type { Pose } from "./pose-kit.js";
import { controlsBar } from "./versus-controls.js";
import { SEEN_FLOOR } from "./versus-diff.js";
import { startPair } from "./versus-pair.js";
import { poseForSlot } from "./versus-pose.js";
import { seatPlan } from "./versus-seat.js";
import { LIVE, type ShotParams } from "./versus-shot.js";

/**
 * One candidate, alone, on a page of its own — the live half of VERSUS.
 *
 * This is what used to be a row on a contact sheet of every open candidate at
 * once. The sheet is a list of doors now (`versus-page.ts`): nine candidates
 * meant eighteen renderers stepping worlds nobody was looking at, which the
 * owner met as the page being slow rather than as a page showing him
 * everything. So the comparison did not change — one world, one frame, both
 * sides through the shipping renderer at 380 × 820, uncapped, the patch held
 * for the length of one `draw()` — only how many of them run at once, which
 * is now exactly the one that was asked for.
 *
 * The one thing added: the page **says which picture it is showing**, in
 * words, above the phones. A candidate for the strand's bead drawn on a pose
 * that never puts a strand on the field is a comparison of two identical
 * pictures, and nothing on the old sheet said so — `versus-pose.ts` carries
 * the map and `Pose.note` carries the sentence, so the answer is written
 * where the looking happens.
 *
 * Two more, both from one report — *"I don't see GUARD and INTAKE, all
 * screens show the same"* — and both about a reader who could not find the
 * difference rather than about the difference. **`Pose.lookAt` goes first, in
 * plain words**, naming the thing on screen the vote is about, because a
 * reader who has not found it never reaches the prose under it. And the
 * screens are `seatPlan`'s now rather than a two-way `seatsDiffer`: a seat
 * the candidate does not touch at all is not drawn, so a second phone on the
 * page always carries a second answer.
 */

/**
 * The whole of one candidate: what it is, what it patches, what is on screen,
 * and the phones.
 *
 * There was a vote box under the phones until 9 September 2026 — a reason
 * field and two buttons that put an adoption prompt on the clipboard. The
 * owner said he does not want one and prefers to name the winner in chat, so
 * the page shows and no longer asks, and `bun run versus adopt` applies the
 * name he says.
 */
export function renderCandidate(
  slot: Slot,
  candidate: Variant,
  shot: ShotParams = LIVE,
): HTMLElement {
  const row = el("div", "versus-row");
  const pose = poseForSlot(slot.slot);

  row.appendChild(el("h2", "", `${slot.slot.toUpperCase()} · ${candidate.name.toUpperCase()}`));
  row.appendChild(el("p", "versus-name", candidate.sentence));
  row.appendChild(
    el(
      "p",
      "versus-patch",
      candidate.patches
        .map((p) => `${p.where.file} · ${p.where.symbol} — ${patchedFields(p).join(", ")}`)
        .join("  ·  "),
    ),
  );
  if (pose.lookAt) row.appendChild(el("p", "versus-look", `LOOK AT — ${pose.lookAt}`));
  row.appendChild(el("p", "versus-showing", `WHAT IS ON SCREEN — ${pose.name}`));
  row.appendChild(el("p", "versus-blink-note", pose.note));

  // A screenshot candidate is always one seat, never both — the whole point
  // is a still picture documenting this answer, not a seat-by-seat compare.
  const plan = candidate.screenshot ? null : seatPlan(pose, candidate);
  const screens = plan?.roles ?? (["p1"] as const);
  const screensHost = el("div", "versus-screens");
  for (const role of screens) {
    screensHost.appendChild(renderScreen(slot, pose, role, candidate, screens.length > 1, shot));
  }
  row.append(screensHost);
  if (plan !== null) row.appendChild(sizeNote(plan.share));
  return row;
}

/**
 * How much of the phone this candidate moves, in one sentence under the pair.
 *
 * It is here because every guard in the repository can pass a candidate that
 * nobody can see. `ship:hull-body` / `carapace` was four new stops on the
 * hull's membrane — a strip about thirty pixels tall on a 380 x 820 phone —
 * and `distinct.test.ts` confirmed the values differed, `variants.test.ts`
 * drew it without complaint, and the page's own settled banner stayed quiet,
 * because the two pictures genuinely were not identical. They were also
 * indistinguishable at a glance, which is the only test that matters here.
 *
 * A warning and not a refusal: a candidate may be quiet on purpose, and the
 * owner is the one who decides by looking. What the page owes him is the
 * number and a plain sentence about it (`SEEN_FLOOR`).
 */
function sizeNote(share: number): HTMLElement {
  // Two decimal places under a tenth of a percent, one above: a candidate
  // this small is being read *because* it is small, and "0.0%" is a number
  // that says nothing.
  const said = `${(share * 100).toFixed(share < 0.001 ? 3 : 1)}%`;
  const note = el("p", "versus-size", `THIS PATCH MOVES ${said} OF THE FRAME`);
  if (share < SEEN_FLOOR) {
    note.classList.add("thin");
    note.textContent =
      `THIS PATCH MOVES ${said} OF THE FRAME — that is under the floor a candidate ` +
      "is normally visible at. Look before you vote: two screenshots of this pair may be " +
      "indistinguishable at a glance.";
  }
  return note;
}

/** One screen at one seat: current-vs-candidate side by side, or — for a
 * `screenshot` candidate — the candidate alone. */
function renderScreen(
  slot: Slot,
  pose: Pose,
  role: ViewRole,
  candidate: Variant,
  labelled: boolean,
  shot: ShotParams,
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
    { pose, role, variant: candidate, freezeSeconds: shot.freezeSeconds },
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
  rightBox.prepend(el("div", "versus-name", `${candidate.name.toUpperCase()} — the candidate`));
  leftBox.appendChild(pair.left);
  // `&only=…`: one side, at true size. Both are still *built* — the pair steps
  // two worlds and compares them, and the settled banner is that comparison —
  // so this changes what is mounted and nothing about what is measured.
  if (shot.only === "candidate") stage.append(rightBox, tag);
  else if (shot.only === "current") stage.append(leftBox, tag);
  else stage.append(leftBox, rightBox, tag);
  screen.append(stage, ...controlsBar(stage, pair), banner);
  return screen;
}
