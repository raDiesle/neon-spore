import type { Scene } from "@neon-spore/shape-sheet";
import { inline } from "./markdown.js";
import { type Framed, frameWorld, onCard, PHONE } from "./pose-art.js";
import { drawMarks, drawOverlay, type Placed, placeBodies } from "./scene-art.js";
import { sceneWorld } from "./scene-world.js";

/**
 * A scene, assembled: a real frame of the game with an unbuilt idea standing
 * in it, at the size a phone would draw it.
 *
 * The whole point is the *scale*, so nothing here is allowed to shrink it. The
 * frame is cut at the phone's own width and the card is that many CSS pixels
 * wide, which makes a creature 27 px across on the page because it is 27 px
 * across on the device. A picture that claimed a shape reads at 26 px and then
 * fitted itself to a column would be claiming nothing at all — which is the
 * failure the SHAPES tab cannot avoid and this page exists to fix.
 */

interface Live {
  canvas: HTMLCanvasElement;
  placed: Placed[];
  dpr: number;
}

const live: Live[] = [];
let running = false;

/**
 * Every open scene, redrawn. One loop for all of them, and a disconnected
 * canvas is dropped rather than animated forever — the same arrangement
 * `shape-figure.ts` makes, and for the same reason: these sheets are rebuilt.
 */
function tick(): void {
  requestAnimationFrame(tick);
  const t = performance.now() / 1000;
  let kept = 0;
  for (const l of live) {
    if (!l.canvas.isConnected) continue;
    live[kept++] = l;
    const ctx = l.canvas.getContext("2d");
    if (ctx) drawOverlay(ctx, l.placed, t, l.dpr);
  }
  live.length = kept;
}

/** The two stacked canvases, sized alike, with the marks already on the frame. */
function stack(scene: Scene, framed: Framed): HTMLElement {
  const box = document.createElement("div");
  box.className = "scene-shot";
  const base = framed.canvas;
  box.appendChild(base);

  const to = (x: number, y: number) => onCard(framed, x, y);
  // Read off the frame rather than worked out again: the two canvases have to
  // agree about device pixels exactly, and two answers to "what is the dpr"
  // is how an overlay ends up half a pixel and a scale away from its frame.
  const dpr = base.width / Number.parseFloat(base.style.width);
  const under = base.getContext("2d");
  if (under) drawMarks(under, scene, framed.layout, to, framed.scale, dpr);

  const over = document.createElement("canvas");
  over.className = "over";
  over.width = base.width;
  over.height = base.height;
  over.style.width = base.style.width;
  over.style.height = base.style.height;
  box.appendChild(over);

  const entry = { canvas: over, placed: placeBodies(scene, framed.layout, to, framed.scale), dpr };
  live.push(entry);
  // Painted once, here, before anything is animated. `requestAnimationFrame`
  // does not fire while the page is not compositing — a hidden tab, a headless
  // check, a browser told not to animate — and a scene whose bodies only ever
  // arrive on the first frame would be, in exactly those cases, a picture of
  // an empty field under a caption describing a full one.
  const ctx = over.getContext("2d");
  if (ctx) drawOverlay(ctx, entry.placed, 0, dpr);
  if (!running) {
    running = true;
    requestAnimationFrame(tick);
  }
  return box;
}

/**
 * The scene as a block: the picture, then the claim it is making.
 *
 * The claim is under the picture rather than over it, because the picture is
 * the argument and the sentence is only what to look for. A reader who
 * disagrees with the sentence has the frame right there to disagree from.
 */
export function sceneFigure(scene: Scene): HTMLElement {
  const div = document.createElement("div");
  div.className = "scene";
  const framed = frameWorld(
    sceneWorld(scene),
    scene.role,
    scene.crop ?? "field",
    PHONE.width,
    undefined,
    undefined,
    // No cap: true size is the whole claim, and a cap is a quiet way of
    // breaking it. The sheet scrolls; a lie does not scroll back.
    Number.POSITIVE_INFINITY,
  );
  div.appendChild(stack(scene, framed));

  const claim = document.createElement("p");
  claim.className = "claim";
  inline(claim, scene.claim);
  div.appendChild(claim);

  const seat = document.createElement("p");
  seat.className = "seat";
  seat.textContent = `${scene.role.toUpperCase()}'s screen · 380 × 820, the tile the phone draws · ${
    scene.marks?.map((m) => m.note).join(" · ") ?? "no marks"
  }`;
  div.appendChild(seat);
  return div;
}
