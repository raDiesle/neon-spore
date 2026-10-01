import type { MenuPage } from "./menu-parts.js";

/**
 * Whether this device has been let into the rig, so the menu opens on TESTING.
 *
 * The owner, 1 October 2026: *"When I entered in game app the test mode by
 * clicking 3 times in logo, it should remember it in the device."* The three
 * presses on the spore (`menu-view.ts`) were the whole of the door, every time:
 * a tester reloading to look at one wave pressed it three times again on every
 * visit, and on every ☰.
 *
 * **In by the spore, out by BACK.** The three presses store it; the TESTING
 * page's own BACK, the one way from the rig to the front page, clears it — so a
 * tester who wants to see what a player sees has a way to, and nothing a player
 * can press without the spore ever turns it on. The seat the rig picks is
 * remembered on its own already (`view.ts`); this is only the page.
 */

export const TEST_MODE_KEY = "neon-spore.test-mode";

/** The page the menu opens on: TESTING in place of the front page, once in. */
export function landingPage(asked: MenuPage, testMode: boolean): MenuPage {
  return testMode && asked === "root" ? "testing" : asked;
}

/** Wrapped like `last-wave.ts`: private browsing keeps nothing, and a device
 * that cannot remember is a device that presses the spore again. */
export function readTestMode(): boolean {
  try {
    return localStorage.getItem(TEST_MODE_KEY) === "1";
  } catch {
    return false;
  }
}

export function writeTestMode(on: boolean): void {
  try {
    if (on) localStorage.setItem(TEST_MODE_KEY, "1");
    else localStorage.removeItem(TEST_MODE_KEY);
  } catch {
    // Nothing to persist to — the spore is still the door.
  }
}
