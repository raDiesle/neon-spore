import { QUEEN_VARIANTS } from "./index.js";
import { queenCycleAt } from "./queen-cycle.js";

/**
 * Mounting for the three whole-body BULB QUEEN VARIANTS, kept apart from
 * `holders-panel.ts` so that file stays about the torch-only cards it already
 * owned. `holders-panel.ts` drives both from the one `requestAnimationFrame`
 * loop it already runs — passing this module the same `t` it hands the torch
 * cards — because a comparison between things pulsing on private clocks is
 * not a comparison, and that already had to be true for three torches before
 * it had to be true for three whole bodies too.
 */

const CARD_W = 320;
const CARD_H = 260;

function card(
  name: string,
  claim: string,
  note: string,
): { wrap: HTMLElement; canvas: HTMLCanvasElement } {
  const wrap = document.createElement("div");
  wrap.className = "plan holder-card";

  const head = document.createElement("div");
  head.className = "head";
  const nameEl = document.createElement("span");
  nameEl.className = "name";
  nameEl.textContent = name;
  head.appendChild(nameEl);
  wrap.appendChild(head);

  const canvas = document.createElement("canvas");
  canvas.className = "holder-shot";
  wrap.appendChild(canvas);

  const claimEl = document.createElement("p");
  claimEl.className = "blurb";
  claimEl.textContent = claim;
  wrap.appendChild(claimEl);

  const noteEl = document.createElement("p");
  noteEl.className = "note";
  noteEl.textContent = note;
  wrap.appendChild(noteEl);

  return { wrap, canvas };
}

export interface QueenShot {
  canvas: HTMLCanvasElement;
  index: number;
}

/** Builds the three cards fresh, the same way `renderHolders` rebuilds its own on every open. Returns null if the sheet markup is not there yet. */
export function mountQueenVariants(): QueenShot[] | null {
  const mount = document.getElementById("queenVariantCards");
  if (!mount) return null;
  mount.replaceChildren();

  const shots: QueenShot[] = [];
  for (let i = 0; i < QUEEN_VARIANTS.length; i++) {
    const variant = QUEEN_VARIANTS[i];
    if (!variant) continue;
    const { wrap, canvas } = card(variant.name, variant.claim, variant.note);
    mount.appendChild(wrap);
    shots.push({ canvas, index: i });
  }
  return shots;
}

/** One frame, at the caller's own `t` — never its own clock. */
export function drawQueenFrame(shots: QueenShot[], t: number): void {
  const cycle = queenCycleAt(t);
  for (const shot of shots) {
    const variant = QUEEN_VARIANTS[shot.index];
    if (!variant) continue;
    const dpr = Math.min(3, window.devicePixelRatio || 1);
    shot.canvas.width = CARD_W * dpr;
    shot.canvas.height = CARD_H * dpr;
    shot.canvas.style.width = `${CARD_W}px`;
    shot.canvas.style.height = `${CARD_H}px`;
    const ctx = shot.canvas.getContext("2d");
    if (!ctx) continue;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, CARD_W, CARD_H);
    variant.draw(ctx, CARD_W, CARD_H, cycle);
  }
}
