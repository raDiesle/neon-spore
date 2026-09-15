import { describe, expect, it } from "bun:test";
import { partnerRow } from "../../../apps/game/src/menu-link.js";
import { CREATOR_TRAIL, JOINER_COMMIT, JOINER_TRAIL, partnerTrail } from "../room-shot.js";

/**
 * **The two walks, against the buttons that are really on the screen.**
 *
 * `room-shot` drives two phones by pressing labels, and a label that has been
 * renamed fails as *no such button* halfway through a two-minute run with a
 * wrangler and a preview up. That is the one failure worth catching cheaply,
 * and it is the one this tool met while it was being written: the button under
 * the code field says ENTER THE ROOM, not JOIN.
 *
 * The room screen's markup is `apps/game/index.html`, so that is what is read
 * — the labels a trail names have to be text a person could press.
 */

const html = await Bun.file(
  Bun.fileURLToPath(new URL("../../../apps/game/index.html", import.meta.url)),
).text();

describe("the trails room-shot presses", () => {
  it("part after NEW GAME, which is the one choice a creator and a joiner share", () => {
    const shared = (trail: readonly string[]): string[] => trail.slice(0, 2);
    expect(shared(CREATOR_TRAIL)).toEqual(shared(JOINER_TRAIL));
    expect(CREATOR_TRAIL.at(-1)).toBe("CREATE");
    expect(JOINER_TRAIL.at(-1)).toBe("JOIN");
  });

  it("names the button under the code field as the markup spells it", () => {
    // The failure this catches: a rename that turns a two-minute run with a
    // relay and a preview into "no such button" halfway through.
    expect(html).toContain(`>${JOINER_COMMIT}<`);
  });

  it("stops the creator on the code, because nothing further is theirs to press", () => {
    // A creator leaves step 3 when the other phone arrives, not on a press
    // (`join-steps.ts`), so a trail with another label on the end would be
    // waiting for a button that is not there.
    expect(CREATOR_TRAIL).toHaveLength(3);
  });

  it("presses a partner's row as menu-link spells it for somebody not yet played with", () => {
    // `--via partners` seeds each phone with the other at wave 0, so the row
    // carries no `· WAVE n` — and the label is `partnerRow`'s, not a copy.
    expect(partnerTrail("ben")).toEqual([
      "PLAY",
      partnerRow({ name: "ben", furthest: 0, level: "medium" }),
    ]);
  });
});
