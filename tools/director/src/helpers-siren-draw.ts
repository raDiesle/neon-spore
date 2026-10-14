import type { HelperGroup } from "./helpers-def.js";
import { type SirenState, sirenLit, sirenReads, sirenStateParts } from "./helpers-siren-states.js";
import { builtWorld, frameWorld } from "./pose-art.js";
import { whenSeen } from "./when-seen.js";

/**
 * THE SIREN's every-state rows drawn (`helpers-siren-states.ts`): a heading
 * CONTENTS lists, the top of player 1's phone beside the top of player 2's,
 * and under them which chip is lit and what each phone reads.
 */

/** The phone's own width (`pose-frame.ts`'s PHONE), so the siren's words are
 * the size a player reads them at. Two side by side fit a wide page; a phone
 * stacks them. */
const SHOT_WIDTH = 380;

const SEATS = [
  ["p1", "P1'S SCREEN"],
  ["p2", "P2'S SCREEN"],
] as const;

function litText(lit: { p1: boolean; p2: boolean } | null): string {
  if (!lit) return "none — the siren is not drawn";
  if (lit.p1 && lit.p2) return "BOTH — P1 and P2 both speak";
  return lit.p1 ? "P1 — P1 speaks, P2 listens" : "P2 — P2 speaks, P1 listens";
}

function stateRow(s: SirenState): HTMLElement {
  const section = document.createElement("section");
  section.className = "field-control siren-state";
  const h3 = document.createElement("h3");
  h3.dataset.depth = "3";
  h3.textContent = s.pose.name.replace(/^SIREN · /, "");
  section.appendChild(h3);

  const dl = document.createElement("dl");
  const row = (term: string, text: string, cls?: string): HTMLElement => {
    const dt = document.createElement("dt");
    dt.textContent = term;
    const dd = document.createElement("dd");
    if (cls) dd.className = cls;
    dd.textContent = text;
    dl.append(dt, dd);
    return dd;
  };
  row("WHEN", s.when);
  // Filled with the pictures: a world is built only when its row nears the
  // screen (`when-seen.ts`), and the words are read off that world.
  const lit = row("LIT", "…");
  const p1 = row("P1 READS", "…");
  const p2 = row("P2 READS", "…");
  row("MEANS", s.means, "does");
  row("SOURCE", `packages/render/src/${s.source}`);

  const pair = document.createElement("div");
  pair.className = "siren-state-pair";
  const shots = SEATS.map(([seat, label]) => {
    const fig = document.createElement("figure");
    const cap = document.createElement("figcaption");
    cap.textContent = label;
    const shot = document.createElement("div");
    shot.className = "field-control-shot";
    fig.append(cap, shot);
    pair.appendChild(fig);
    return [seat, shot] as const;
  });
  whenSeen(pair, () => {
    const w = builtWorld(s.pose);
    for (const [seat, shot] of shots)
      shot.appendChild(frameWorld(w, seat, "top", SHOT_WIDTH).canvas);
    lit.textContent = litText(sirenLit(s, w));
    p1.textContent = sirenReads(s, w, "p1") ?? "—";
    p2.textContent = sirenReads(s, w, "p2") ?? "—";
  });
  section.append(pair, dl);
  return section;
}

function drawStates(states: readonly SirenState[]): HTMLElement {
  const list = document.createElement("div");
  list.className = "siren-states";
  for (const s of states) list.appendChild(stateRow(s));
  return list;
}

/** The three groups THE SIREN's heading carries after its own rows. */
export const SIREN_STATE_PARTS: readonly HelperGroup[] = sirenStateParts(drawStates);
