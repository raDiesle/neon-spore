import type { ViewRole } from "@neon-spore/render";
import { VARIANTS } from "../../versus/candidates/index.js";
import { patchedFields, type Slot, slots, type Variant } from "../../versus/variant.js";
import { button, el } from "./checks-dom.js";
import type { Pose } from "./pose-kit.js";
import { POSE_GROUPS } from "./poses.js";
import type { Pair } from "./versus-pair.js";
import { startPair } from "./versus-pair.js";
import { buildVoteBox, type Head, readHead } from "./versus-vote.js";

/**
 * A VERSUS tab on the backlog sheet: every open slot, drawn as two phones.
 *
 * A shape the game already draws got one card on SHAPES, forever. This is
 * where its second answer stands beside it, at 380 × 820 uncapped and moving,
 * so `docs/versus.md`'s question can be asked at all: does it read at 26 px,
 * and does it read at tempo. `versus-pair.ts` is the engine and the invariant;
 * this file is the sheet around it, and `versus-vote.ts` is the vote box
 * inside it. Decision 24 is why a second slot is a switch, never a deletion —
 * every alternative has to be comparable in this one page, at the same time.
 */

const TAB_ID = "versus";
/** The pose the pair opens on — red creatures falling past the player's hull. */
const DEFAULT_POSE = "SLICK · FALLING";
const RATES = [0.25, 0.5, 1, 2];
const ALL_POSES: Pose[] = POSE_GROUPS.flatMap((g) => g.poses);
const SEATS: readonly ViewRole[] = ["p1", "p2"];

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

/** One button per slot, active one lit — built the way `shapes-pair.ts`'s
 * skin bar is built: a row of exclusive buttons, not a dropdown, because the
 * whole point is that every slot is one click away, visible at once. */
function slotSwitcher(open: Slot[], active: Slot, onPick: (s: Slot) => void): HTMLElement {
  const bar = el("div", "versus-slots");
  for (const s of open) {
    const b = button(`${s.slot} (${s.candidates.length})`);
    b.classList.toggle("on", s === active);
    b.addEventListener("click", () => onPick(s));
    bar.appendChild(b);
  }
  return bar;
}

/** The tab button and its empty page, appended before `bindTabs` runs. */
export function mountVersusTab(): void {
  const tabs = document.getElementById("backlogTabs");
  const body = document.getElementById("backlogBody");
  if (!tabs || !body || document.getElementById(`sheet-${TAB_ID}`)) return;

  const tab = button("VERSUS");
  tab.dataset.tab = TAB_ID;
  tabs.appendChild(tab);

  const page = el("div", "sheetpage");
  page.id = `sheet-${TAB_ID}`;
  page.appendChild(
    el(
      "p",
      "note",
      "Every open slot, two phones, one world. Left is what the game draws today; " +
        "right is the same code with the candidate's patch held for one draw. " +
        "Both at 380 × 820 CSS pixels, uncapped — a picture that shrinks to fit " +
        "the window answers the 26 px question by making it unanswerable.",
    ),
  );
  const mount = el("div");
  mount.id = "versusMount";
  page.appendChild(mount);
  body.appendChild(page);
}

let drawn = false;
let activePair: Pair | null = null;

/** Built on first sight of the tab. See `card-page.ts` for the same lazy draw. */
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

  const switcherHost = el("div");
  const body = el("div");
  mount.append(switcherHost, body);

  const show = (slot: Slot): void => {
    activePair?.stop();
    body.replaceChildren();
    switcherHost.replaceChildren(slotSwitcher(open, slot, show));
    activePair = renderSlot(body, slot, open.length);
  };
  const first = open[0];
  if (first) show(first);
}

function renderSlot(root: HTMLElement, slot: Slot, openCount: number): Pair | null {
  const opening = slot.candidates[0];
  if (!opening) return null;
  let candidate: Variant = opening;

  const startPose = ALL_POSES.find((p) => p.name === DEFAULT_POSE) ?? ALL_POSES[0];
  if (!startPose) return null;
  let pose: Pose = startPose;
  let seat: ViewRole = startPose.role ?? "p1";

  root.appendChild(
    el(
      "p",
      "note",
      openCount > 1 ? `${openCount} slots open — this is ${slot.slot}` : `slot ${slot.slot}`,
    ),
  );

  const bar = el("div", "versus-bar");
  const patch = el("p", "versus-patch");
  const stage = el("div", "versus-stage");
  const tag = el("div", "versus-tag");
  const leftBox = el("div", "versus-side");
  const rightBox = el("div", "versus-side");
  const rightName = el("div", "versus-name");
  leftBox.appendChild(el("div", "versus-name", "CURRENT — what the game draws today"));
  rightBox.appendChild(rightName);
  stage.append(leftBox, rightBox, tag);

  const head: Head = { head: "unknown", dirty: true };
  readHead()
    .then((h) => Object.assign(head, h))
    .catch(() => undefined);
  const vote = buildVoteBox(slot, head);
  root.append(bar, patch, stage, vote.root);

  // The seat the pair is drawn for, independent of whatever role the pose
  // itself carries. A patch that touches the hull can read differently from
  // the pilot's half and the navigator's half, and a fixed `pose.role ?? "p1"`
  // meant it could only ever be judged from one of them.
  const applyPose = (): void => pair.setPose({ ...pose, role: seat });

  const pair = startPair(
    { ...pose, role: seat },
    {
      // The guard. Two byte-identical sides under a non-empty patch mean the
      // swap did not take, and a confident vote on a difference nobody intended
      // is worse than no pair at all — so the buttons go, and say why.
      onSettled(identical) {
        vote.setSwapOk(identical);
      },
      onBlink(side) {
        tag.textContent = side === "left" ? "CURRENT" : candidate.name.toUpperCase();
      },
    },
  );
  leftBox.appendChild(pair.left);
  rightBox.appendChild(pair.right);

  const show = (next: Variant): void => {
    candidate = next;
    rightName.textContent = `${next.name.toUpperCase()} — ${next.sentence}`;
    patch.replaceChildren(
      ...next.patches.map((p) =>
        el("span", "", `${p.where.file} · ${p.where.symbol} — ${patchedFields(p).join(", ")}`),
      ),
    );
    pair.setVariant(next);
    vote.setCandidate(next);
  };

  bar.append(
    picker(slot.candidates, (c) => c.name, show),
    picker(
      ALL_POSES,
      (p) => p.name,
      (p) => {
        pose = p;
        applyPose();
      },
      ALL_POSES.indexOf(pose),
    ),
    picker(
      SEATS,
      (r) => (r === "p1" ? "P1'S SCREEN" : r === "p2" ? "P2'S SCREEN" : r.toUpperCase()),
      (r) => {
        seat = r;
        applyPose();
      },
      SEATS.indexOf(seat),
    ),
    toggle("⏸", (paused) => pair.setRunning(!paused)),
    picker(RATES, (r) => `${r}×`, pair.setRate, RATES.indexOf(1)),
    toggle("BLINK", (on) => {
      stage.classList.toggle("is-blink", on);
      pair.setBlink(on);
    }),
    // Named on the button rather than in a note beside it: a magnified pair
    // left on by accident is a claim about 26 px never made at 26 px.
    toggle("2× — NOT TRUE SIZE", (on) => pair.setZoom(on ? 2 : 1)),
  );
  show(candidate);
  return pair;
}
