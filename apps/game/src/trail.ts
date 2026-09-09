import { clearSurface, FIELD_TRAIL_SCALE, SplashTrail } from "@neon-spore/render";

/**
 * The mouse's own canvas.
 *
 * `SplashTrail` draws the ink; this decides where it lands and when. The two
 * are apart because they answer different questions — the picture is a render
 * concern and belongs beside every other thing this game draws, and a
 * document-wide overlay, a media query and a frame loop are the host's.
 *
 * **A surface of its own, over everything.** The owner asked for the trail on
 * the menu and the join screen as well as on the field, and those are DOM
 * sheets stacked over `#stage` (`index.html`) — ink drawn into the game's own
 * canvas would go under them and be invisible on exactly the screens where a
 * mouse spends most of its time. So this is a second canvas, fixed to the
 * viewport, `pointer-events: none` so it is never in the way of a click, and
 * over the sheets rather than under them.
 *
 * **`screen`, so it can never hide a word.** Blending the ink onto the page
 * with `mix-blend-mode: screen` means it only ever adds light: the trail
 * crosses the join code, the seat pills and the wave's own HUD without taking
 * anything away from them, which is the one thing that would have made this
 * unshippable over a screen a player has to read.
 *
 * **It stops when the mouse does.** The frame loop is started by a pointer
 * event and ends itself the moment the last blob dies, so an idle desk costs
 * one listener and no frames at all.
 *
 * **Full size on a sheet, much smaller on the field.** The owner asked for
 * both in the same sentence, and the reason is what the pointer is doing in
 * each place. On the menu and the room screen it is the only thing moving and
 * the ink is the answer to it; on the field it crosses a picture two people
 * are reading columns off, and ink at that size is weather over the thing they
 * are talking about. So the size follows the screen, by the one fraction
 * `FIELD_TRAIL_SCALE` that the director's own field uses too.
 */
export interface SplashTrailBinding {
  stop(): void;
}

export interface SplashTrailParts {
  /**
   * Whether the field is what the pointer is over — no menu, no room screen,
   * no intro. `apps/game/src/main.ts` answers it from the world's own hold,
   * which is the same question those sheets already answer when they stop the
   * game (`run-state.ts`).
   */
  onField: () => boolean;
}

/**
 * Bind the trail, or do nothing at all.
 *
 * Nothing is created on a phone: `pointer: fine` is the same signal the key
 * hint is gated on (`key-hint.ts`), and it is the difference between a mouse
 * and a thumb everywhere else in this app too. A desk that has asked for less
 * motion is also left alone — the trail is decoration by definition, and it is
 * the first thing that should go when someone has said they do not want things
 * moving at them.
 */
export function bindSplashTrail(p: SplashTrailParts): SplashTrailBinding {
  const nothing = { stop: () => {} };
  if (typeof window.matchMedia !== "function") return nothing;
  if (!window.matchMedia("(pointer: fine)").matches) return nothing;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return nothing;

  const canvas = document.createElement("canvas");
  canvas.className = "splash-trail";
  Object.assign(canvas.style, {
    position: "fixed",
    inset: "0",
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    mixBlendMode: "screen",
    // Over the sheets. `key-hint.ts` sits at 8 deliberately so a sheet covers
    // it; this one is the opposite case and says so here rather than leaving a
    // reader to wonder which of the two numbers is the mistake.
    zIndex: "9999",
  });
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    canvas.remove();
    return nothing;
  }

  const trail = new SplashTrail();
  let dpr = 1;
  const resize = (): void => {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();

  let running = false;
  let last = 0;
  const frame = (now: number): void => {
    if (!running) return;
    // **Three frames, and no more, however long the gap was.** The game's own
    // loop caps catch-up at a quarter-second and runs every tick of it; this
    // one throws the gap away instead, because there is nobody to be fair to.
    // A tab that stalls and comes back with half a second on the clock would
    // otherwise age the whole trail in one step — every blob arriving at the
    // middle of its life on the same frame, and sixty additive fills stacked
    // on one spot go white. Skipped time is time nobody was watching.
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    trail.update(dt);
    // The whole surface, in device pixels — the transform on this context
    // scales a `clearRect` like any other rectangle, and a desk zoomed out
    // below 100% would leave ink standing where the wipe fell short
    // (`render/surface-clear.ts`).
    clearSurface(ctx);
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
    // Read per event rather than remembered: the menu opens and closes under a
    // pointer that never left the glass, and the next stroke should be the
    // size of the screen it is actually on.
    trail.scale = p.onField() ? FIELD_TRAIL_SCALE : 1;
    trail.push(e.clientX, e.clientY);
    wake();
  };
  // The pointer leaving the window ends the stroke and nothing else: the loop
  // is already running and carries what is out to the end of its life, so the
  // ink drains off the glass rather than being switched off (`lift`).
  const leave = (): void => trail.lift();

  window.addEventListener("pointermove", move, { passive: true });
  window.addEventListener("pointerdown", move, { passive: true });
  window.addEventListener("pointerleave", leave);
  window.addEventListener("resize", resize);

  return {
    stop() {
      running = false;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", move);
      window.removeEventListener("pointerleave", leave);
      window.removeEventListener("resize", resize);
      canvas.remove();
    },
  };
}
