import { ASSETS, type AssetContext, BEAT_SECONDS } from "./library/index.js";

/**
 * The LIBRARY view on GRAPHICS (SHAPES until 11 September 2026): the game's
 * own looks, each on a card, drawn by the game's own code.
 *
 * `library/types.ts` says why the view is a canvas and the other three are
 * SVG. This file is the loop: one `requestAnimationFrame`, one clock, every
 * card handed the same `t` and the same beat, the way `holders-panel.ts` does
 * for the queen's drafts and `skins/types.ts` insists on for its page — four
 * jellyfish hopping at four private moments would be noise, and the thing
 * compared is what hangs under each, which can only be judged if they hop
 * together.
 *
 * The loop ends itself when its mount is gone: the view rebuilds its cards on
 * each open, so a stale frame has nothing to draw into and stops. While the
 * view is hidden behind another it draws nothing and waits.
 */

const CARD_W = 300;
const CARD_H = 300;

function card(index: number): { wrap: HTMLElement; canvas: HTMLCanvasElement } {
  const asset = ASSETS[index];
  if (!asset) throw new Error(`no asset at ${index}`);

  const wrap = document.createElement("div");
  wrap.className = "plan holder-card library-card";

  const head = document.createElement("div");
  head.className = "head";
  const name = document.createElement("span");
  name.className = "name";
  name.textContent = asset.inGame ? `${asset.label} *` : asset.label;
  head.appendChild(name);
  const from = document.createElement("span");
  from.className = "from";
  from.textContent = asset.from;
  head.appendChild(from);
  wrap.appendChild(head);

  const canvas = document.createElement("canvas");
  canvas.className = "holder-shot";
  wrap.appendChild(canvas);

  const claim = document.createElement("p");
  claim.className = "blurb";
  claim.textContent = asset.claim;
  wrap.appendChild(claim);

  const note = document.createElement("p");
  note.className = "note";
  note.textContent = asset.inGame ? `IN THE GAME — ${asset.note}` : asset.note;
  wrap.appendChild(note);

  return { wrap, canvas };
}

export function renderLibrary(): void {
  const mount = document.getElementById("libraryCards");
  if (!mount) return;
  mount.replaceChildren();

  const shots: { canvas: HTMLCanvasElement; index: number }[] = [];
  for (let i = 0; i < ASSETS.length; i++) {
    const { wrap, canvas } = card(i);
    mount.appendChild(wrap);
    shots.push({ canvas, index: i });
  }

  const start = performance.now();
  const frame = (): void => {
    if (document.getElementById("libraryCards") !== mount) return;
    if (mount.offsetParent === null) {
      requestAnimationFrame(frame);
      return;
    }
    const t = (performance.now() - start) / 1000;
    const beats = t / BEAT_SECONDS;
    const beat = Math.floor(beats);
    const beatPhase = beats - beat;

    for (const shot of shots) {
      const asset = ASSETS[shot.index];
      if (!asset) continue;
      const dpr = Math.min(3, window.devicePixelRatio || 1);
      // A fresh canvas is 300 by 150, which is this card's width exactly, so
      // the height is the one that tells a first frame from a resize.
      if (shot.canvas.width !== CARD_W * dpr || shot.canvas.height !== CARD_H * dpr) {
        shot.canvas.width = CARD_W * dpr;
        shot.canvas.height = CARD_H * dpr;
        shot.canvas.style.width = `${CARD_W}px`;
        shot.canvas.style.height = `${CARD_H}px`;
      }
      const ctx = shot.canvas.getContext("2d");
      if (!ctx) continue;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, CARD_W, CARD_H);
      const c: AssetContext = { ctx, w: CARD_W, h: CARD_H };
      asset.draw(c, { t, beat, beatPhase });
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
