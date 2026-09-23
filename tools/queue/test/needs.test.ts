import { describe, expect, it } from "bun:test";
import { blocked, blockedBy, needOf, needsTag } from "../needs.js";
import { problemsIn } from "../problems.js";
import { promptFor } from "../prompt.js";
import { type Item, parseItems } from "../queue.js";

const LANE_ONE = `## THE GIMBAL is written and nobody has built its simulation

- **Found:** 2026-09-20, claude/some-lane
- **Files:** \`packages/sim/src/bosses.ts\`

The spec is a full design for a boss nobody has started.
`;

const LANE_TWO = `## THE GIMBAL's picture has never been drawn

- **Found:** 2026-09-20, claude/some-lane
- **Files:** \`packages/content/src/silhouettes.ts\`
- **Needs:** THE GIMBAL is written and nobody has built its simulation
- **Where:** local

A drum inside two rings, six poses, and the payoff frame is a new silhouette.
`;

const FREE = `## Split the wave editor's cell panel

- **Found:** 2026-09-13, claude/some-lane
- **Files:** \`tools/director/src/cell-panel.ts\`

It is 310 lines and does two jobs.
`;

/** The two entries as the listing sees them, in file order. */
const both = (): Item[] => parseItems(`${LANE_ONE}\n${LANE_TWO}`, "queue");

describe("an entry that waits on another one", () => {
  it("reads the Needs: line, and waits on nothing without one", () => {
    const [one, two] = both();
    expect(needOf(two!)).toBe("THE GIMBAL is written and nobody has built its simulation");
    expect(needOf(one!)).toBe("");
  });

  it("names the entry in the way, and that entry is not blocked itself", () => {
    const items = both();
    const [one, two] = items;
    expect(blockedBy(two!, items)?.title).toBe(one!.title);
    expect(blocked(one!, items)).toBe(false);
  });

  it("comes back by itself once the entry it waits on has landed", () => {
    // `queue done` takes the prerequisite out of the file. Nothing else is
    // edited, and the blocked entry is ordinary again the next time the
    // listing is built — which is the whole reason the line names a title.
    const alone = parseItems(LANE_TWO, "queue");
    expect(blocked(alone[0]!, alone)).toBe(false);
  });

  it("fails open on a title that matches nothing, which reads as landed", () => {
    const md = LANE_TWO.replace("THE GIMBAL is written and nobody", "THE GIMLET is written and no");
    const items = parseItems(md, "queue");
    expect(blocked(items[0]!, items)).toBe(false);
    // And it is not a reported problem: a misspelling and a prerequisite that
    // has just landed are the same thing from here (`needs.ts`).
    expect(problemsIn(items)).toEqual([]);
  });

  it("is nobody's blocker but its own when the line quotes its own title", () => {
    const md = LANE_TWO.replace(
      "- **Needs:** THE GIMBAL is written and nobody has built its simulation",
      "- **Needs:** THE GIMBAL's picture has never been drawn",
    );
    const items = parseItems(md, "queue");
    expect(blocked(items[0]!, items)).toBe(false);
  });

  it("is otherwise an ordinary entry a cold session could act on", () => {
    expect(problemsIn(both())).toEqual([]);
  });

  it("is marked on the title line, saying which entry is in the way", () => {
    const items = both();
    expect(needsTag(items[1]!, items)).toContain("WAITS ON");
    expect(needsTag(items[1]!, items)).toContain("nobody has built its simulation");
    expect(needsTag(items[0]!, items)).toBe("");
  });

  it("tells a session handed it by name what has not landed", () => {
    const items = both();
    const said = promptFor(items[1]!, "claude/queue-x", { needs: items[0]!.title });
    expect(said).toContain("Something this entry needs has not landed");
    expect(said).toContain(items[0]!.title);
    // And an unblocked one says nothing about it at all.
    expect(promptFor(items[0]!, "claude/queue-y")).not.toContain("has not landed");
  });
});

describe("the three reasons the automatic pick steps past a free entry", () => {
  it("are separate questions, and an ordinary entry answers no to all of them", () => {
    const items = parseItems(FREE, "queue");
    expect(blocked(items[0]!, items)).toBe(false);
    expect(needsTag(items[0]!, items)).toBe("");
  });
});
