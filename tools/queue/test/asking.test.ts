import { describe, expect, it } from "bun:test";
import { answerTo, asksTag, waiting } from "../asking.js";
import { problemsIn } from "../problems.js";
import { promptFor } from "../prompt.js";
import { type Item, parseItems } from "../queue.js";

const ASKING = `## THE THROAT's three hand sounds have never been heard by an ear

- **Found:** 2026-09-19, claude/some-lane
- **Files:** \`packages/audio/src/sounds/boss-throat.ts\`
- **Asks:** Does one of the three want re-voicing?

Everything a machine can settle is settled. What is left is three presses.
`;

const ANSWER = "- **Answered:** 21 September 2026 — HAUL wants re-voicing.";
const ANSWERED = ASKING.replace("\nEverything", `${ANSWER}\n\nEverything`);

const PLAIN = `## Split the wave editor's cell panel

- **Found:** 2026-09-13, claude/some-lane
- **Files:** \`tools/director/src/cell-panel.ts\`

It is 310 lines and does two jobs.
`;

const one = (md: string): Item => parseItems(md, "queue")[0]!;

describe("an entry whose ask nobody has answered", () => {
  it("is waiting, and is marked so on the title line", () => {
    const item = one(ASKING);
    expect(item.asks).not.toBe("");
    expect(answerTo(item)).toBe("");
    expect(waiting(item)).toBe(true);
    expect(asksTag(item)).toBe(" — ASKS THE OWNER");
  });

  it("is an ordinary entry otherwise — the gate is not a fault to fix", () => {
    expect(problemsIn([one(ASKING)])).toEqual([]);
  });

  it("is told to put the question first and build nothing", () => {
    expect(promptFor(one(ASKING), "claude/some-lane")).toContain("opens with a question");
  });
});

describe("an entry whose ask has been answered", () => {
  it("stops waiting, and says so rather than going on asking", () => {
    const item = one(ANSWERED);
    expect(answerTo(item)).toContain("HAUL wants re-voicing");
    expect(waiting(item)).toBe(false);
    expect(asksTag(item)).toBe(" — ANSWERED");
  });

  it("reads the last answer, because a re-ask appends under the one it replaces", () => {
    const md = ANSWERED.replace(
      "\n\nEverything",
      "\n- **Answered:** 25 September 2026 — CINCH, not HAUL.\n\nEverything",
    );
    expect(answerTo(one(md))).toContain("CINCH, not HAUL");
  });

  it("hands the session the answer as the spec instead of the question", () => {
    const prompt = promptFor(one(ANSWERED), "claude/some-lane");
    expect(prompt).toContain("has been answered");
    expect(prompt).toContain("HAUL wants re-voicing");
    expect(prompt).not.toContain("opens with a question");
  });
});

describe("an entry that asks nothing", () => {
  it("is never waiting and carries no mark", () => {
    const item = one(PLAIN);
    expect(waiting(item)).toBe(false);
    expect(asksTag(item)).toBe("");
    // And is still told what it is: not a look, lands like any refactor.
    expect(promptFor(item, "claude/some-lane")).toContain("technical improvement");
  });
});

describe("an answer with no question over it", () => {
  // The one way to write this line wrong that the gate cannot see: an
  // `Answered:` under an entry that never asked anything is a lane recording a
  // decision on the wrong entry, and nothing reads it.
  it("is a reported problem rather than a line nobody reads", () => {
    const md = PLAIN.replace("\nIt is 310", `${ANSWER}\n\nIt is 310`);
    expect(problemsIn(parseItems(md, "queue"))[0] ?? "").toContain("Answered:");
  });
});
