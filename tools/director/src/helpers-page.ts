import { AIM_GROUP, BODY_GROUP } from "./helpers-aim.js";
import { BOSS_GROUP } from "./helpers-bosses.js";
import type { HelperDef, HelperGroup } from "./helpers-def.js";
import { FAULT_GROUP } from "./helpers-faults.js";
import { HIDDEN_GROUP } from "./helpers-hidden.js";
import { MARK_GROUP } from "./helpers-marks.js";
import { SHIELD_GROUP } from "./helpers-shield.js";
import { SIREN_GROUP } from "./helpers-siren.js";
import { poseArt } from "./pose-art.js";
import type { Pose } from "./pose-kit.js";
import { poseNamed } from "./poses.js";
import { whenSeen } from "./when-seen.js";

/**
 * CONTROLS › HELPERS — every picture the game draws on the field to explain
 * something rather than to be touched: the siren, the scanner box, the
 * gunsight, EMBER, NEXT TO FALL. The owner asked for it on 10 October 2026,
 * beside ON THE FIELD and in its shape (`field-controls-rows.ts`): a frame of
 * the shipping renderer on the seat that is shown the helper, and under it
 * where it stands, whose screen, what it says and the file that draws it.
 *
 * The drawing vocabulary behind these, piece by piece and for a builder, is
 * `docs/controls-catalogue.md`; this page is the reader's half — what a pair
 * is being told, and on which screen.
 */

/**
 * Grouped by what a helper is about (the owner, 14 October 2026): the shield
 * first, at his word that morning; the siren every split speaks through, and
 * the split itself beside it — the seat not told, the seat that must tell;
 * then the shot, a body, a boss's mark, one boss's own picture, and a control
 * taken by a fault.
 */
export const HELPER_GROUPS: readonly HelperGroup[] = [
  SHIELD_GROUP,
  SIREN_GROUP,
  HIDDEN_GROUP,
  AIM_GROUP,
  BODY_GROUP,
  MARK_GROUP,
  BOSS_GROUP,
  FAULT_GROUP,
];

/** The same width as an ON THE FIELD row's picture, so the two tabs line up. */
const SHOT_WIDTH = 340;

const SEAT_STAMP: Record<HelperDef["role"], string> = {
  p1: "P1'S SCREEN",
  p2: "P2'S SCREEN",
  test: "BOTH HALVES",
};

/** The row's pose, drawn as the screen and cut the row names. */
export function helperPose(h: HelperDef): Pose {
  const named = typeof h.pose === "string" ? poseNamed(h.pose) : h.pose;
  const pose = h.thumb ? { ...named, thumb: h.thumb } : named;
  if (h.zoom) return { ...pose, role: h.role, crop: "tile", at: h.zoom.at, span: h.zoom.span };
  return { ...pose, role: h.role, crop: h.crop ?? pose.crop };
}

function helperRow(h: HelperDef, depth: number): HTMLElement {
  const section = document.createElement("section");
  section.className = "field-control";

  const h3 = document.createElement("h3");
  const stamp = document.createElement("span");
  stamp.className = "stamp";
  stamp.textContent = SEAT_STAMP[h.role];
  h3.dataset.depth = String(depth);
  // CONTENTS lists the name, not the seat stamp run into it.
  h3.dataset.label = h.name;
  h3.append(stamp, document.createTextNode(h.name));
  section.appendChild(h3);

  const shot = document.createElement("div");
  shot.className = "field-control-shot";
  // Drawn when the row nears the screen (`when-seen.ts`): a posed world each.
  whenSeen(shot, () => shot.appendChild(poseArt(helperPose(h), SHOT_WIDTH)));
  section.appendChild(shot);

  const look = document.createElement("p");
  look.className = "field-control-look";
  look.textContent = `Look at ${h.lookAt}`;
  section.appendChild(look);

  const dl = document.createElement("dl");
  const row = (term: string, text: string, cls?: string): void => {
    const dt = document.createElement("dt");
    dt.textContent = term;
    const dd = document.createElement("dd");
    if (cls) dd.className = cls;
    dd.textContent = text;
    dl.append(dt, dd);
  };
  row("WHERE", h.where);
  row("SEAT", h.seat);
  row("SAYS", h.says, "does");
  row("SOURCE", `packages/render/src/${h.source}`);
  if (typeof h.pose === "string")
    row("POSE", `${h.pose} — on the STATES sheet, under its own name`);
  section.appendChild(dl);
  return section;
}

function groupHead(g: HelperGroup, depth: number): HTMLElement {
  const head = document.createElement("div");
  head.className = `field-part depth-${depth}`;
  const h2 = document.createElement("h2");
  h2.dataset.depth = String(depth);
  h2.textContent = g.title;
  const sub = document.createElement("p");
  sub.className = "sub";
  sub.textContent = g.sub;
  head.append(h2, sub);
  return head;
}

/** A group's lab, as ON THE FIELD stands one: a card put up as it nears the screen. */
function labCard(open: (host: HTMLElement) => void): HTMLElement {
  const host = document.createElement("div");
  host.className = "field-lab";
  whenSeen(host, () => open(host));
  return host;
}

let drawn = false;

/** The whole tab, once; each row's picture is drawn as it comes near. */
export function renderHelpers(): void {
  if (drawn) return;
  const body = document.getElementById("helpersBody");
  if (!body) return;
  drawn = true;
  body.replaceChildren();
  for (const g of HELPER_GROUPS) appendGroup(body, g, 1);
}

/** A group's heading, its own rows, then each smaller group under it — the
 * page's outline numbered by CONTENTS as ON THE FIELD's is (`contents-list.ts`). */
function appendGroup(body: HTMLElement, g: HelperGroup, depth: number): void {
  body.appendChild(groupHead(g, depth));
  if (g.table) body.appendChild(g.table());
  if (g.lab) body.appendChild(labCard(g.lab));
  for (const h of g.rows ?? []) body.appendChild(helperRow(h, depth + 1));
  for (const p of g.parts ?? []) appendGroup(body, p, depth + 1);
}

/** Drawn on its own tab's first click — before the sheet is mounted, so a
 * reload at `sub=helpers` replays that click into a listener already here. */
export function bindHelpersTab(): void {
  document
    .querySelector<HTMLButtonElement>('#controlsInnerTabs button[data-tab="helpers"]')
    ?.addEventListener("click", renderHelpers);
}
