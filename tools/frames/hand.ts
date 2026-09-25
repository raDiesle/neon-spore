import type { Page } from "playwright-core";
import type { HandSpec } from "./spec.js";

/**
 * `--hand` on the command line: **this phone's own finger on the ship**, which
 * was the one thing on the screen the tool had no way to put there.
 *
 * `--press` sends commands into the world and `--hold` sets the simulation's
 * drags, but the ring under a thumb (`render/ship-hand.ts`) is the input
 * layer's — `view.hand`, filled from pointer events and read by the frame —
 * so no command reaches it. The lane that drew that ring on THE WELL's cannon
 * had to start a preview, open a browser pane, stub `setPointerCapture` and
 * dispatch a synthetic `pointerdown` at the lobe's pixel to get its one
 * picture, and threw the procedure away.
 *
 *   --hand cannon            player 1's thumb on the cannon lobe, held
 *   --hand shield            the shield lobe, held — the guard under player 1,
 *                            the slide under player 2
 *   --hand muzzle            player 2's thumb resting on the muzzle (`--seat p2`)
 *   --hand muzzle=red        the same thumb carried towards red; `=cyan` the other way
 *   --hand-over              a mouse over the swelling with nothing pressed
 *
 * **A real pointer, not the ring's setter.** The page answers *where the grab
 * circle is* (`neonSpore.shipGrab`, in screen pixels, flat hull or THE WELL by
 * which one the screen is drawing) and this presses there with the browser's
 * own mouse, so the picture goes through the same listeners a thumb does —
 * `touchDown` decides what the press takes hold of, the seat and the wave's
 * panel apply, and a press that a real finger could not make lights nothing.
 * `apps/game/src/handle.ts` says why the setter is not exposed instead.
 *
 * The muzzle is the cannon's swelling under the *navigator's* thumb, which is
 * why it needs `--seat p2`: on the rig and on player 1's screen the same
 * circle is the pilot's slide. A carry is the grab radius and a little more,
 * which clears the swipe threshold (`render/touch-hand.ts`, 0.6 of a tile
 * against a 0.7-tile circle) without leaving the lobe behind.
 */
export function parseHand(value: string, seat: string | undefined): HandSpec {
  const [target = "", color] = value.split("=");
  if (target === "cannon" || target === "shield") {
    if (color !== undefined) throw new Error(`--hand ${value}: only the muzzle takes a colour`);
    return { on: target };
  }
  if (target !== "muzzle") {
    throw new Error(`--hand ${value}: one of cannon, shield, muzzle, muzzle=red|cyan`);
  }
  if (seat !== "p2") {
    throw new Error("--hand muzzle: the muzzle is the navigator's — say --seat p2");
  }
  if (color !== undefined && color !== "red" && color !== "cyan") {
    throw new Error("--hand muzzle: a thumb is carried towards red or towards cyan");
  }
  return color === undefined ? { on: "cannon" } : { on: "cannon", carry: color };
}

/** How far past the grab radius a carried muzzle travels, as a fraction of it. */
const CARRY = 1.2;

/**
 * Put the hand on the ship, and leave it there for the picture.
 *
 * `hover` moves the mouse over the swelling and presses nothing — the desk's
 * half of the ring, dim (`ShipHandWatch.over`). Otherwise the button goes down
 * on the circle's centre and stays down; a carry then moves it sideways by a
 * little more than the radius, which is the swipe the lift would read as that
 * colour. Nothing is lifted: a lift is a command, and `--press` has those.
 */
export async function putHand(page: Page, hand: HandSpec, hover: boolean): Promise<void> {
  const grab = await page.evaluate((on) => window.neonSpore?.shipGrab?.(on) ?? null, hand.on);
  if (!grab) {
    throw new Error(
      "--hand: this build's window.neonSpore has no shipGrab — the flag needs a build from " +
        "13 September 2026 or later",
    );
  }
  // The hull answers a finger only where the player turned TOUCH THE SHIP on
  // (`apps/game/src/settings.ts` `shipTouch`), and a fresh browser has not.
  // Read on every press, so storing it here is in time for the one below.
  await page.evaluate(() => {
    const key = "neon-spore.settings";
    const held = JSON.parse(localStorage.getItem(key) ?? "{}") as Record<string, unknown>;
    localStorage.setItem(key, JSON.stringify({ ...held, shipTouch: true }));
  });
  await page.mouse.move(grab.clientX, grab.clientY);
  if (hover) return;
  await page.mouse.down();
  if (hand.carry) {
    const dx = grab.r * CARRY * (hand.carry === "red" ? -1 : 1);
    await page.mouse.move(grab.clientX + dx, grab.clientY, { steps: 4 });
  }
}
