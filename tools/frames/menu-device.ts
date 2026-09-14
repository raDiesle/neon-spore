/**
 * WHAT KIND OF DEVICE THE MENU IS PHOTOGRAPHED AS — a thumb by default, a
 * mouse only when asked.
 *
 * A viewport is a size and nothing else. `bun run menu-shot` opened 390x844,
 * which is the right size, in a plain desktop context, which is the wrong
 * *pointer*: headless Chromium answers `pointer: fine` and `hover: hover`
 * however narrow the window is. So everything the app decides by `atADesk()`
 * — the menu's CONTROLS row, the keyboard hint over the field, the splash
 * trail — photographed in its desk form under a picture that read as a phone.
 *
 * Found on 14 September 2026, the day the CONTROLS row became desk-only: the
 * capture showed a row no phone will have, and there was no way to take the
 * picture that would have proved it. The unit tests held the behaviour; the
 * tool could not show it.
 *
 * **The default is the phone**, because that is what this tool is for: the
 * menu is portrait mobile web and a desk is the exception. `--desk` is the
 * exception's flag, for the case where the desk form is the thing being
 * judged.
 *
 * `hasTouch` is what turns `pointer: coarse` on; `isMobile` is what makes
 * Chromium honour the viewport meta tag the way a phone does. Both, because
 * either alone is a device that exists nowhere — a desk with a touchscreen,
 * or a phone that reports a mouse.
 *
 * Nothing here opens a browser, which is why it is a file of its own: reading
 * what was asked for is the half that can be held by a test.
 */

/** The two context options that separate a thumb from a mouse. */
export interface MenuDevice {
  hasTouch: boolean;
  isMobile: boolean;
}

/** The device `menu-shot`'s command line asks for. `--desk` is the only word
 * that matters here; every other flag is read where it is used. */
export function menuDevice(args: readonly string[]): MenuDevice {
  const desk = args.includes("--desk");
  return { hasTouch: !desk, isMobile: !desk };
}
