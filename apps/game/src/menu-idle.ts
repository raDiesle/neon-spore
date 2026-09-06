/**
 * `?menuidle=<hz>` — how often the field is repainted while the main menu is
 * up. An **alternative, offered**: unset, the game paints every frame exactly
 * as it always has.
 *
 * What it is about. `startLoop`'s `onFrame` calls `paint()` unconditionally.
 * The `menu` hold stops the *world* from ticking but nothing stops the
 * *drawing*, so while the menu is up the device draws a complete field frame —
 * hull, bodies, band, HUD — sixty times a second. `#menu .sky` is
 * `position: fixed; inset: 0` over it with `backdrop-filter: blur(5px)
 * saturate(1.35)` and a scrim that runs from `rgba(7, 6, 15, 0.93)` at the top
 * to fully opaque by 30% of the height. So the phone pays for a frame, and then
 * pays again to blur that frame, to show at most 7% of it in the top third —
 * and this is the first screen a player sees and the one a phone sits on
 * longest.
 *
 * **Why it is offered rather than landed.** The world is held, but the picture
 * is not still: `paint` is handed `performance.now()`, so the shimmer in the
 * water and the hull's own breathing go on moving whatever the simulation is
 * doing. Slowing the repaint therefore changes what a player sees, however
 * faintly, and `CLAUDE.md`'s *A look is offered, never replaced* makes that the
 * owner's to judge — by opening the game twice on the phone, once with the flag
 * and once without. It cannot go through `tools/versus`: the pair there draws
 * one world twice through two renderers inside a single frame, and the question
 * here is how often a frame happens at all.
 *
 * There is no default rate baked in. `?menuidle=10` is ten repaints a second,
 * `?menuidle=0` is none at all after the first — the extreme, and the one that
 * says plainly whether anything visible is being lost.
 */

const PARAM = "menuidle";

/** The rate asked for, or `null` for the shipped behaviour: paint every frame. */
export function menuIdleHz(url: string): number | null {
  const value = new URL(url, "http://game.invalid/").searchParams.get(PARAM);
  if (value === null) return null;
  const hz = Number(value);
  return Number.isFinite(hz) && hz >= 0 ? hz : null;
}

export interface MenuIdle {
  /**
   * Seconds since the last painted frame, or `null` when this one should be
   * skipped. `now` is `performance.now()`; `holding` is whether the menu is up
   * *and* nothing is animating over it.
   */
  due: (now: number, holding: boolean) => number | null;
}

/**
 * The gate. `hz` of `null` is the shipped game and every call is due.
 *
 * It returns the gap rather than a boolean because a skipped frame's time
 * belongs to the next painted one: the renderer's `dt` drives every effect that
 * fades, and handing it one frame's worth after four were skipped would run
 * those at a quarter speed instead of at the same speed in fewer steps.
 */
export function createMenuIdle(hz: number | null): MenuIdle {
  // Capped the way `frame.ts` caps its own: a backgrounded tab comes back with
  // seconds on the clock, and no effect should advance by all of them at once.
  const MAX_DT = 0.05;
  let lastPaint = 0;
  return {
    due(now, holding) {
      const gap = (now - lastPaint) / 1000;
      if (hz === null || !holding) {
        lastPaint = now;
        return Math.min(MAX_DT, gap);
      }
      // `hz` of 0 is "once, and then not again": the first frame after the menu
      // comes up still paints, because `lastPaint` was set by the frame before.
      if (hz === 0 || gap < 1 / hz) return null;
      lastPaint = now;
      return Math.min(MAX_DT, gap);
    },
  };
}
