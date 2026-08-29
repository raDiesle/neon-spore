import { drawTorchRock, PALETTE, STROKE } from "@neon-spore/render";
import { BEAT_SECONDS, CYCLE_BEATS, HOLDERS, type HolderContext } from "./holders/index.js";
import { drawQueenFrame, mountQueenVariants, type QueenShot } from "./holders/queen-panel.js";

/**
 * The BULB QUEEN VARIANTS tab. Two sections, one clock:
 *
 * - Three ways for her to be holding a torch — the original HOLDERS
 *   question, kept here as the record of what CRADLE was chosen against.
 * - Three whole-body drafts, CRADLE at both flanks in all three, spread on a
 *   second axis: how much of her condition the body itself admits. See
 *   `holders/queen-panel.ts` and `holders/queen-shared.ts`.
 *
 * **One clock, not six.** Every card — torch or whole body — is handed the
 * same `t` this file's own loop computes, never a clock of its own. Three (or
 * six) cards letting go, or blooming, at private moments reads as noise; the
 * thing being compared is how each *holds* and how each *lets go*, which can
 * only be judged if they do it together. This is the same rule
 * `skins/types.ts` states for its own page.
 *
 * Nothing here writes anything and nothing here is wired into the game. The
 * shipped queen still draws a bare rock in the flank column; these are the
 * alternatives beside it, for the owner to choose from or throw away.
 */

const CARD_W = 300;
const CARD_H = 210;

/** Three beats holding, then one letting go. */
function releaseAt(cycleBeat: number, beat: number): number {
  return cycleBeat === CYCLE_BEATS - 1 ? beat : 0;
}

function card(index: number): { wrap: HTMLElement; canvas: HTMLCanvasElement } {
  const holder = HOLDERS[index];
  if (!holder) throw new Error(`no holder at ${index}`);

  const wrap = document.createElement("div");
  wrap.className = "plan holder-card";

  const head = document.createElement("div");
  head.className = "head";
  const name = document.createElement("span");
  name.className = "name";
  name.textContent = holder.name;
  head.appendChild(name);
  wrap.appendChild(head);

  const canvas = document.createElement("canvas");
  canvas.className = "holder-shot";
  wrap.appendChild(canvas);

  const claim = document.createElement("p");
  claim.className = "blurb";
  claim.textContent = holder.claim;
  wrap.appendChild(claim);

  const note = document.createElement("p");
  note.className = "note";
  note.textContent = holder.note;
  wrap.appendChild(note);

  return { wrap, canvas };
}

/** The queen's flank, suggested rather than drawn: an edge for a holder to leave. */
function flank(ctx: CanvasRenderingContext2D, c: HolderContext): void {
  ctx.save();
  ctx.beginPath();
  ctx.arc(c.bodyX, c.bodyY, c.bodyR, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.background;
  ctx.fill();
  ctx.strokeStyle = PALETTE.hull;
  ctx.lineWidth = STROKE.outline * 1.4;
  ctx.globalAlpha = 0.55;
  ctx.stroke();
  ctx.restore();
}

export function renderHolders(): void {
  const mount = document.getElementById("holderCards");
  if (!mount) return;
  mount.replaceChildren();

  const shots: { canvas: HTMLCanvasElement; index: number }[] = [];
  for (let i = 0; i < HOLDERS.length; i++) {
    const { wrap, canvas } = card(i);
    mount.appendChild(wrap);
    shots.push({ canvas, index: i });
  }

  // Same page, one clock: the three whole-body drafts below the torch cards
  // are handed the very `t` this loop already computes, never a clock of
  // their own — see `queen-panel.ts`.
  const queenShots: QueenShot[] | null = mountQueenVariants();

  const start = performance.now();

  // The loop ends itself when the mount is gone: the sheet rebuilds its cards
  // on each open, so a stale frame has nothing to draw into and stops. No flag
  // to keep in step with the DOM, and nothing for a caller to remember.
  const frame = (): void => {
    if (document.getElementById("holderCards") !== mount) return;
    const t = (performance.now() - start) / 1000;
    const beats = t / BEAT_SECONDS;
    const cycleBeat = Math.floor(beats) % CYCLE_BEATS;
    const beat = beats - Math.floor(beats);
    const release = releaseAt(cycleBeat, beat);

    for (const shot of shots) {
      const holder = HOLDERS[shot.index];
      if (!holder) continue;
      const dpr = Math.min(3, window.devicePixelRatio || 1);
      shot.canvas.width = CARD_W * dpr;
      shot.canvas.height = CARD_H * dpr;
      shot.canvas.style.width = `${CARD_W}px`;
      shot.canvas.style.height = `${CARD_H}px`;
      const ctx = shot.canvas.getContext("2d");
      if (!ctx) continue;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, CARD_W, CARD_H);

      const rockR = CARD_H * 0.17;
      // The rock drifts out as it is let go, so a release reads as the rock
      // leaving rather than as the holder changing shape around it.
      const drift = release * rockR * 0.9;
      const c: HolderContext = {
        ctx,
        w: CARD_W,
        h: CARD_H,
        rockX: CARD_W * 0.62 + drift,
        rockY: CARD_H * 0.5,
        rockR,
        bodyX: CARD_W * 0.06,
        bodyY: CARD_H * 0.5,
        bodyR: CARD_H * 0.42,
        drawRock() {
          ctx.save();
          ctx.translate(c.rockX, c.rockY);
          drawTorchRock(ctx, c.rockR, t);
          ctx.restore();
        },
      };

      flank(ctx, c);
      holder.draw(c, { t, beat, release });
    }

    if (queenShots) drawQueenFrame(queenShots, t);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
