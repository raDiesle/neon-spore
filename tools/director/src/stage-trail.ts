import { FIELD_TRAIL_SCALE, SplashTrail } from "@neon-spore/render";

/**
 * THE MOUSE'S OWN INK, ON THE DIRECTOR'S FIELD.
 *
 * The game lays a string of slime under a travelling pointer
 * (`apps/game/src/trail.ts`), and the director drew none of it: it renders the
 * field itself into `#stage` and never touches `apps/game`, so the binding —
 * the overlay, the media query, the frame loop — simply had no second copy.
 * The picture is shared; only the wiring was missing.
 *
 * **Over the field and nowhere else.** The game's overlay is the whole
 * viewport because the whole viewport is the game. Here the window is mostly
 * tool — wave lists, brush cards, a transport row — and ink crossing those
 * would be noise over things a person is reading. So the surface is cut to the
 * stage canvas: same rectangle, same rounded corner, and a stroke that runs
 * off the edge is clipped by the canvas rather than followed.
 *
 * The rest matches the game deliberately: `pointer-events: none` so it is
 * never in the way of a click on a control, `mix-blend-mode: screen` so the
 * ink can only add light to the HUD under it, and a frame loop that a pointer
 * event starts and the last dying blob stops.
 */
export interface StageTrail {
  stop(): void;
}

/**
 * Bind the trail to a stage canvas, or do nothing at all.
 *
 * The two gates are the game's, for the game's reasons: `pointer: fine` is
 * what tells a mouse from a thumb, and a desk that has asked for less motion
 * gets none of a thing that exists only to be looked at.
 */
export function bindStageTrail(stage: HTMLCanvasElement): StageTrail {
  const nothing = { stop: () => {} };
  if (typeof window.matchMedia !== "function") return nothing;
  if (!window.matchMedia("(pointer: fine)").matches) return nothing;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return nothing;

  const canvas = document.createElement("canvas");
  canvas.className = "stage-trail";
  Object.assign(canvas.style, {
    position: "fixed",
    pointerEvents: "none",
    mixBlendMode: "screen",
    borderRadius: "8px",
    // Above the field, below the column splitter at 5 and the KEYBINDINGS
    // modal at 30 — the trail is decoration and must never be the top thing
    // on the page (`director-field.css`, `director-columns.css`).
    zIndex: "4",
  });
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    canvas.remove();
    return nothing;
  }

  const trail = new SplashTrail();
  // This surface is the field and nothing else, so it never wears the full
  // size the game keeps for its menu — the fraction is the game's own
  // (`packages/render/src/splash-trail.ts`), called rather than repeated.
  trail.scale = FIELD_TRAIL_SCALE;
  let w = 0;
  let h = 0;

  /**
   * Follow the stage.
   *
   * The panel is resizable and the column widths move under it, so the
   * rectangle is read from the canvas rather than remembered. Only a change
   * of *size* touches `width`/`height`: assigning either clears the surface,
   * and a stage that merely slid sideways would lose the ink on it.
   */
  const place = (rect: DOMRect): void => {
    canvas.style.left = `${rect.left}px`;
    canvas.style.top = `${rect.top}px`;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    if (rect.width === w && rect.height === h) return;
    w = rect.width;
    h = rect.height;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  place(stage.getBoundingClientRect());

  let running = false;
  let last = 0;
  const frame = (now: number): void => {
    if (!running) return;
    // Three frames of catch-up at most, whatever the gap was — the game's own
    // loop says why (`apps/game/src/trail.ts`): sixty additive fills aged onto
    // one spot in a single step go white.
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    place(stage.getBoundingClientRect());
    trail.update(dt);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    trail.draw(ctx);
    if (trail.idle) {
      running = false;
      return;
    }
    requestAnimationFrame(frame);
  };

  const wake = (): void => {
    if (running) return;
    running = true;
    last = performance.now();
    requestAnimationFrame(frame);
  };

  const move = (e: PointerEvent): void => {
    if (e.pointerType !== "mouse") return;
    const rect = stage.getBoundingClientRect();
    place(rect);
    trail.push(e.clientX - rect.left, e.clientY - rect.top);
    wake();
  };
  // Leaving the field ends the stroke and nothing else — what is already on
  // the glass runs down it, and the next entry starts a new stroke instead of
  // being joined to where the hand left.
  const leave = (): void => trail.lift();

  stage.addEventListener("pointermove", move, { passive: true });
  stage.addEventListener("pointerdown", move, { passive: true });
  stage.addEventListener("pointerleave", leave);

  return {
    stop() {
      running = false;
      stage.removeEventListener("pointermove", move);
      stage.removeEventListener("pointerdown", move);
      stage.removeEventListener("pointerleave", leave);
      canvas.remove();
    },
  };
}
