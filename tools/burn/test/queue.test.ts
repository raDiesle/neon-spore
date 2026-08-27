import { describe, expect, test } from "bun:test";
import {
  clashes,
  crowding,
  type LaneFact,
  nextLane,
  parseQueue,
  render,
  statusOf,
} from "../queue.js";

const QUEUE = `# Queue

Preamble that is not a lane.

## THE BRIEFING BEFORE A WAVE
_claude/burn-briefings-a1 · packages/sim/src/briefing.ts packages/content/src/briefings.ts_

A card before the first wave that shows a creature.
Done when the card can be dismissed by either player.

## A FIELD THAT IS NOT FLAT
_claude/burn-field-b2 · packages/render/src/field.ts_

Depth behind the grid.
`;

function fact(over: Partial<LaneFact> = {}): LaneFact {
  return { exists: true, atTip: false, ahead: 2, worktree: "", ...over };
}

describe("parseQueue", () => {
  test("reads a lane's branch and the paths it owns", () => {
    const lanes = parseQueue(QUEUE);
    expect(lanes).toHaveLength(2);
    expect(lanes[0]?.branch).toBe("claude/burn-briefings-a1");
    expect(lanes[0]?.owns).toEqual([
      "packages/sim/src/briefing.ts",
      "packages/content/src/briefings.ts",
    ]);
  });

  test("keeps the brief verbatim, and the preamble out of it", () => {
    const lanes = parseQueue(QUEUE);
    expect(lanes[0]?.brief).toContain("Done when the card can be dismissed");
    expect(lanes[0]?.brief).not.toContain("Preamble");
  });

  test("drops a heading with no branch under it", () => {
    expect(parseQueue("## A THOUGHT\n\nno branch line\n")).toEqual([]);
  });
});

describe("statusOf", () => {
  test("waiting when no branch exists", () => {
    expect(statusOf(undefined)).toBe("waiting");
    expect(statusOf(fact({ exists: false }))).toBe("waiting");
  });
  test("a lane sitting on the trunk's tip with nothing of its own has landed", () => {
    expect(statusOf(fact({ ahead: 0, atTip: true }))).toBe("landed");
  });

  // The bug this replaced: `git switch -c lane main` leaves a tip that is an
  // ancestor of the trunk, so ancestry alone reported an agent which had not
  // yet written a line as finished. Landing is a fast-forward, so a landed
  // lane sits *on* the tip and an opened one sits behind it.
  test("a lane opened at an older trunk has not landed, it is empty", () => {
    expect(statusOf(fact({ ahead: 0, atTip: false }))).toBe("opened");
  });

  test("commits the trunk has not got outrank both", () => {
    expect(statusOf(fact({ ahead: 3, atTip: false }))).toBe("flying");
  });
});

describe("clashes", () => {
  test("names two lanes that own the same file", () => {
    const lanes = parseQueue(QUEUE);
    const both = [...lanes, { ...lanes[1]!, branch: "claude/burn-other-c3" }];
    expect(clashes(both)).toHaveLength(1);
  });

  test("a directory contains a file inside it", () => {
    const lanes = parseQueue(
      "## A\n_a · packages/render_\n\nx\n\n## B\n_b · packages/render/src/field.ts_\n\ny\n",
    );
    expect(clashes(lanes)[0]).toContain("packages/render");
  });

  test("disjoint lanes do not clash", () => {
    expect(clashes(parseQueue(QUEUE))).toEqual([]);
  });
});

describe("nextLane", () => {
  test("is the first with no branch", () => {
    const lanes = parseQueue(QUEUE);
    const facts = new Map([["claude/burn-briefings-a1", fact()]]);
    expect(nextLane(lanes, facts)?.branch).toBe("claude/burn-field-b2");
  });

  test("is nothing when every lane has one", () => {
    const lanes = parseQueue(QUEUE);
    const facts = new Map(lanes.map((lane) => [lane.branch, fact()]));
    expect(nextLane(lanes, facts)).toBeNull();
  });
});

describe("render", () => {
  test("counts the three states in its heading", () => {
    const lanes = parseQueue(QUEUE);
    const facts = new Map([["claude/burn-briefings-a1", fact({ ahead: 0, atTip: true })]]);
    expect(render(lanes, facts)).toContain("1 landed, 0 in flight, 1 waiting");
  });

  test("says so when there is nothing queued", () => {
    expect(render([], new Map())).toContain("--candidates");
  });

  // A lane that has already landed cannot conflict with anything, so its
  // paths are free again — warning about them would train the eye past the
  // warning that matters.
  test("ignores a landed lane when it looks for clashes", () => {
    const lanes = parseQueue(
      "## A\n_a · packages/render_\n\nx\n\n## B\n_b · packages/render_\n\ny\n",
    );
    const facts = new Map([["a", fact({ ahead: 0, atTip: true })]]);
    expect(render(lanes, facts)).not.toContain("ownership clash");
  });
});

describe("crowding", () => {
  const THREE = `## A
_a · packages/sim/src/briefing.ts_

x

## B
_b · packages/sim/src/fork.ts_

y

## C
_c · packages/render/src/backdrop.ts_

z
`;

  // The failure this was written for: three lanes with perfectly disjoint
  // files, all inside packages/sim, all adding a line to config.ts, types.ts
  // and hashWorld — the files owned by nobody because everybody needs them.
  test("names the package two lanes share, and not the one only a third is in", () => {
    const found = crowding(parseQueue(THREE));
    expect(found).toHaveLength(1);
    expect(found[0]).toContain("packages/sim");
    expect(found[0]).toContain("2 lanes");
  });

  test("a lane alone in its package is not crowding", () => {
    expect(crowding(parseQueue("## A\n_a · packages/sim/src/fork.ts_\n\nx\n"))).toEqual([]);
  });

  test("one lane owning two files in a package does not crowd itself", () => {
    const one = parseQueue("## A\n_a · packages/sim/src/fork.ts packages/sim/src/vane.ts_\n\nx\n");
    expect(crowding(one)).toEqual([]);
  });
});
