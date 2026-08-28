import { VARIANTS } from "../../versus/candidates/index.js";
import {
  currentValues,
  declaration,
  patchedFields,
  type Slot,
  slots,
  type Variant,
} from "../../versus/variant.js";
import { button, el } from "./checks-dom.js";
import type { Pose } from "./pose-kit.js";
import { POSE_GROUPS } from "./poses.js";
import { startPair } from "./versus-pair.js";

/**
 * A VERSUS tab on the backlog sheet: one open slot, drawn as two phones.
 *
 * A shape the game already draws got one card on SHAPES, forever. This is
 * where its second answer stands beside it, at 380 × 820 uncapped and moving,
 * so `docs/versus.md`'s question can be asked at all: does it read at 26 px,
 * and does it read at tempo. `versus-pair.ts` is the engine and the invariant;
 * this file is the sheet around it, riding the backlog sheet's own header,
 * close button and Esc the way `card-page.ts` does and drawn lazily on first
 * click for the same reason.
 */

const TAB_ID = "versus";
/** The pose the pair opens on — red creatures falling past the player's hull. */
const DEFAULT_POSE = "SLICK · FALLING";
const RATES = [0.25, 0.5, 1, 2];
const ALL_POSES: Pose[] = POSE_GROUPS.flatMap((g) => g.poses);

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

  const tab = button("VERSUS");
  tab.dataset.tab = TAB_ID;
  tabs.appendChild(tab);

  const page = el("div", "sheetpage");
  page.id = `sheet-${TAB_ID}`;
  page.appendChild(
    el(
      "p",
      "note",
      "One open slot, two phones, one world. Left is what the game draws today; " +
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

/** Built on first sight of the tab. See `card-page.ts` for the same lazy draw. */
export function drawVersus(): void {
  if (drawn) return;
  drawn = true;
  const mount = document.getElementById("versusMount");
  if (!mount) return;
  const open = slots(VARIANTS);
  const first = open[0];
  if (!first) {
    const none =
      "No slot is open, which is a correct state and not a broken one. A slot " +
      "is a shape the game already draws and a second answer to it: write one " +
      "under tools/versus/candidates/. `bun run versus` says how.";
    mount.appendChild(el("p", "note", none));
    return;
  }
  mount.appendChild(renderSlot(first, open.length));
}

/** What a vote was cast against — two fields on the `/api/checks` view. */
interface Head {
  head: string;
  dirty: boolean;
}

async function readHead(): Promise<Head> {
  const res = await fetch("/api/checks");
  if (!res.ok) throw new Error(res.statusText);
  const v = (await res.json()) as Partial<Head>;
  return { head: v.head ?? "unknown", dirty: v.dirty !== false };
}

function renderSlot(slot: Slot, openCount: number): HTMLElement {
  const root = el("div", "versus");
  const opening = slot.candidates[0];
  if (!opening) return root;
  let candidate: Variant = opening;

  const pose = ALL_POSES.find((p) => p.name === DEFAULT_POSE) ?? ALL_POSES[0];
  if (!pose) return root;
  const heading = openCount > 1 ? `${openCount} slots open; this is ` : "slot ";
  root.appendChild(el("p", "note", heading + slot.slot));

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

  const why = document.createElement("textarea");
  why.placeholder = "why — the sentence that outlives the vote";
  const buttons = el("div", "versus-buttons");
  const banner = el("div", "versus-banner");
  const vote = el("div", "versus-vote");
  vote.append(why, buttons, banner);
  root.append(bar, patch, stage, vote);
  const head: Head = { head: "unknown", dirty: true };
  readHead()
    .then((h) => Object.assign(head, h))
    .catch(() => undefined);

  const pair = startPair(pose, {
    // The guard. Two byte-identical sides under a non-empty patch mean the
    // swap did not take, and a confident vote on a difference nobody intended
    // is worse than no pair at all — so the buttons go, and say why.
    onSettled(identical) {
      banner.textContent = identical
        ? "THE SWAP DID NOT TAKE — or this candidate is the current one"
        : "";
      banner.classList.toggle("on", identical);
      buttons.style.display = identical ? "none" : "";
    },
    onBlink(side) {
      tag.textContent = side === "left" ? "CURRENT" : candidate.name.toUpperCase();
    },
  });
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
    buttons.replaceChildren(
      cast("KEEP CURRENT", () => emit(slot, null, why.value, head)),
      cast(`ADOPT ${next.name.toUpperCase()}`, () => emit(slot, next, why.value, head)),
    );
  };

  bar.append(
    picker(slot.candidates, (c) => c.name, show),
    picker(ALL_POSES, (p) => p.name, pair.setPose, ALL_POSES.indexOf(pose)),
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
  return root;
}

function cast(label: string, on: () => void): HTMLButtonElement {
  const b = button(label, "versus-cast");
  b.addEventListener("click", () => {
    on();
    b.textContent = `${label} — COPIED`;
    setTimeout(() => {
      b.textContent = label;
    }, 1600);
  });
  return b;
}

/**
 * A vote, on the clipboard.
 *
 * Deliberately **not** the adoption prompt `docs/versus.md` specifies —
 * `tools/versus/prompt.ts` is not built yet, and a half-written text that
 * looks like the real one is worse than none. This says it is a record, so
 * the looking is not lost meanwhile. Every value is `old -> new`, the
 * left-hand column read off the live record and never copied into a tool.
 */
function emit(slot: Slot, won: Variant | null, why: string, head: Head): void {
  const lost = slot.candidates.filter((c) => c !== won).map((c) => c.name);
  const lines = [
    "VERSUS — a vote, recorded. Not the adoption prompt: `tools/versus/prompt.ts`",
    "is not built yet, and this is the decision, so that the looking is not lost.",
    "",
    `    slot    ${slot.slot}`,
    `    won     ${won ? `${won.name} — "${won.sentence}"` : "current — nothing shipped changes"}`,
    `    lost    ${lost.join(", ") || "current"}`,
    `    why     ${why.trim() || "(not typed)"}`,
    `    voted   ${new Date().toISOString().slice(0, 10)}, against ${head.head}, tree ${head.dirty ? "dirty" : "clean"}`,
    "",
  ];
  for (const p of won?.patches ?? []) {
    const was = currentValues(p);
    const fields = p.fields as Record<string, unknown>;
    lines.push(`    patch   ${declaration(p.where)}`);
    for (const f of patchedFields(p)) {
      lines.push(`            ${f}  ${JSON.stringify(was[f])}  ->  ${JSON.stringify(fields[f])}`);
    }
  }
  lines.push("", 'docs/versus.md, "The prompt a vote emits", says what to do with this.');
  void navigator.clipboard?.writeText(lines.join("\n"));
}
