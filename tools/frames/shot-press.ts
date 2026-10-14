import type { Page } from "playwright-core";

/**
 * **`--press`: a thumb held on a point of an element**, for `bun run shot`.
 *
 * `--click` presses a selector and lets go in the same instant, which is all a
 * button wants and nothing a canvas does: a ring on the field is taken by a
 * press that *stays*, and what is worth photographing is what it leaves behind.
 * Proving that ▶ TRY IT keeps a take (`field-takes.ts`) meant pressing THE
 * LEAD's ring for a second, waiting three beats, closing the window and opening
 * ▤ STILLS — a throwaway Playwright script, because the browser pane could not
 * stand in either: a hidden pane runs no animation frame, and TRY IT steps
 * nothing without one.
 *
 * `<selector>@fx,fy[,ms[,after]]`: the point as fractions of the element's box
 * from its top left, so the same flag reaches the same ring at any `--size`;
 * how long it is held, default a second; and how long to wait after the lift,
 * default nothing. The mouse is Playwright's own, so the page hears the
 * pointer events a thumb sends, not a synthetic `click`.
 *
 * **Name the box you can see, not a canvas inside it.** TRY IT draws the
 * phone scaled and moved so the control fills its window, so its canvas's
 * box runs far past the window's edges and a fraction of it lands nowhere
 * near the ring. The press goes to whatever is on top at the point, so
 * `.try-window@0.5,0.48` reaches the canvas under it. The run that proved
 * this, 14 October 2026:
 * `--path "/?sheet=states&inner=controlsets&sub=field" --click
 * ".field-try-row .field-try:first-child" --press ".try-window@0.503,0.48,1500,1500"`
 * — THE ANTIPHON's rail, held and let go, and the readout said TAKE KEPT.
 *
 * Its own file because `shot-flags.ts` and `shot-state.ts` are each one flag
 * from crowded, and a press is parsed and performed in a dozen lines that
 * belong together.
 */

export interface Press {
  selector: string;
  /** The point, as fractions of the element's box from its top left. */
  fx: number;
  fy: number;
  /** Milliseconds the press is held, and waited after the lift. */
  ms: number;
  after: number;
}

/** Read `--press`'s argument. Throws on one that names no point. */
export function parsePress(value: string): Press {
  const at = value.lastIndexOf("@");
  const nums =
    at < 1
      ? []
      : value
          .slice(at + 1)
          .split(",")
          .map(Number);
  const [fx, fy, ms = 1000, after = 0] = nums;
  const ok =
    fx !== undefined &&
    fy !== undefined &&
    nums.length <= 4 &&
    nums.every((n) => Number.isFinite(n) && n >= 0) &&
    fx <= 1 &&
    fy <= 1;
  if (!ok) {
    throw new Error(
      `--press wants <selector>@fx,fy[,ms[,after]] with fx, fy fractions of its box, got ${JSON.stringify(value)}`,
    );
  }
  return { selector: value.slice(0, at), fx, fy, ms, after };
}

/** Hold the press, lift it, and wait. `false` when no element matched or it has no box. */
export async function holdPress(page: Page, press: Press): Promise<boolean> {
  const el = page.locator(press.selector).first();
  if ((await el.count()) === 0) return false;
  await el.scrollIntoViewIfNeeded();
  const box = await el.boundingBox();
  if (box === null) return false;
  await page.mouse.move(box.x + box.width * press.fx, box.y + box.height * press.fy);
  await page.mouse.down();
  await page.waitForTimeout(press.ms);
  await page.mouse.up();
  await page.waitForTimeout(press.after);
  return true;
}
