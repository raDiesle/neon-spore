import type { Page } from "playwright-core";

/**
 * **`--auto <both|p1|p2>`: the game's own AUTO plays the seats while the tool
 * steps the ticks.**
 *
 * A boss's receipt — THE VISE's kernel flash, a seam cracking — is a run of
 * correct presses deep, and `--press` is a list of ticks somebody has to know
 * in advance. The hands that play every boss already exist
 * (`packages/hands`), and the phone's TEST panel switches them on
 * (`apps/game/src/autopilot.ts`); this switches the same one from outside, so
 * `--wave "THE VISE" --auto both --until viseHit` is a frame of the first
 * flash rather than a scratch script.
 *
 * The presses go into the page's own buffer on the page's own tick, exactly
 * as they do under the TEST panel, so what is photographed is what AUTO on the
 * phone would have shown.
 */

export type AutoSeats = "both" | "p1" | "p2";

const SEATS: readonly AutoSeats[] = ["both", "p1", "p2"];

/** The flag's value, or undefined when it was not written. */
export function parseAuto(value: string | undefined): AutoSeats | undefined {
  if (value === undefined) return undefined;
  const v = value.trim();
  if (!(SEATS as readonly string[]).includes(v)) {
    throw new Error(`--auto ${value || "(nothing)"}: one of ${SEATS.join(", ")}`);
  }
  return v as AutoSeats;
}

/**
 * Switch AUTO on in the page. After the opening, so the ticks that clear it
 * are the ones every capture has always spent; a build from before the handle
 * had the verb says so by name.
 */
export async function installAuto(page: Page, seats: AutoSeats): Promise<void> {
  await page.evaluate((mode) => {
    const ns = window.neonSpore;
    if (!ns) throw new Error("window.neonSpore missing before --auto");
    if (!ns.setAuto) {
      throw new Error(
        "this build has no window.neonSpore.setAuto — --auto needs a commit at or after the " +
          "one that added it, and a before/after pair cannot play its parent",
      );
    }
    ns.setAuto(mode);
  }, seats);
}
