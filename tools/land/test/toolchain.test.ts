import { describe, expect, it } from "bun:test";
import { WANTED } from "../../hooks/bun-pin.ts";
import { oldBunRefusal } from "../toolchain.ts";

/**
 * The one branch `pinRefusal` itself does not carry: a `--sweep` runs no
 * install and moves nothing of its own, so a bun below the pin is not its
 * problem — the landing that already went through this pinned it.
 */
describe("oldBunRefusal", () => {
  it("says nothing when the running bun is the pin or newer", () => {
    expect(oldBunRefusal(WANTED, false)).toBeNull();
  });

  it("refuses with 'moved', off the same comparison as bun run check", () => {
    const said = oldBunRefusal("1.3.11", false)!;
    expect(said).not.toBeNull();
    expect(said[0]).toContain("nothing was moved");
  });

  it("says nothing for a sweep, whatever bun is running it", () => {
    expect(oldBunRefusal("1.3.11", true)).toBeNull();
  });
});
