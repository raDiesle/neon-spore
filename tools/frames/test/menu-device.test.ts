import { describe, expect, it } from "bun:test";
import { menuDevice } from "../menu-device.js";

/**
 * Which way round `bun run menu-shot`'s default goes, which is the whole of
 * what this decides.
 *
 * It is worth a test rather than a line in the tool because the failure has no
 * symptom: a desk context at 390x844 photographs a page that looks exactly
 * like a phone's and is not one, and the only thing that would have said so is
 * a row — CONTROLS, the keyboard hint, the splash trail — quietly present in a
 * picture taken to prove it absent. Nothing throws and nothing looks wrong.
 */

describe("menuDevice", () => {
  it("is a thumb when nothing is said, because that is what the menu is read on", () => {
    expect(menuDevice([])).toEqual({ hasTouch: true, isMobile: true });
  });

  it("is a mouse under --desk, for the case where the desk form is what is judged", () => {
    expect(menuDevice(["--desk"])).toEqual({ hasTouch: false, isMobile: false });
  });

  /** Both together, or the context is a device that exists nowhere: a desk
   * with a touchscreen, or a phone reporting a mouse. */
  it("turns both options the same way, never one of them", () => {
    for (const args of [[], ["--desk"]]) {
      const { hasTouch, isMobile } = menuDevice(args);
      expect(hasTouch).toBe(isMobile);
    }
  });

  it("reads the flag wherever on the line it was typed", () => {
    expect(menuDevice(["out.png", "--page", "SETTINGS", "--desk"]).hasTouch).toBe(false);
    expect(menuDevice(["--desk", "out.png"]).hasTouch).toBe(false);
  });

  /** A flag that only starts the same way is not this one: `--desktop` would
   * be a caller meaning something else, and answering it as `--desk` is a
   * picture of the wrong device with nothing to say so. */
  it("is not turned on by a flag that merely begins the same way", () => {
    expect(menuDevice(["--desktop"]).hasTouch).toBe(true);
  });
});
