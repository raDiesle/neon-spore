import { describe, expect, test } from "bun:test";
import { findRestated, orphanedRestated, parseRestated } from "../restated.js";

const SAMPLE = `# Checks, in plainer words

## \`d5df018\` — the swallow

> the wider mouth still reads as swallowing rather than as a flash, not merely smaller

- **subject** the cannon's fire opening while it takes a pod in
- **changed** the opening used to stretch downwards; it now widens sideways
- **decide** does it read as effort, or as a flash that happens to be bigger?
- **where** \`bun run preview\`, any wave with a pod

> whether losing a pod reads as a cost

- **subject** the moment a pod is lost
- **changed** nothing, this is a second entry under the same heading
- **decide** does it feel fair?
- **where** same wave

## \`ada7090\` — the shot wind-up

> the wind-up reads as laying rather than as lag

- **subject** the cannon between the press and the bolt leaving
- **changed** a shot used to fire instantly; it now gathers for half a beat
- **decide** does the pause read as the ship doing something?
- **where** \`bun run preview\`, fire on any wave
`;

describe("parseRestated", () => {
  test("reads subject, changed, decide and where, keyed by the heading's sha", () => {
    const entries = parseRestated(SAMPLE);
    expect(entries).toHaveLength(3);
    expect(entries[0]).toEqual({
      sha: "d5df018",
      text: "the wider mouth still reads as swallowing rather than as a flash, not merely smaller",
      subject: "the cannon's fire opening while it takes a pod in",
      changed: "the opening used to stretch downwards; it now widens sideways",
      decide: "does it read as effort, or as a flash that happens to be bigger?",
      where: "`bun run preview`, any wave with a pod",
    });
  });

  test("a second quote under the same heading keeps the same sha", () => {
    const entries = parseRestated(SAMPLE);
    expect(entries[1]?.sha).toBe("d5df018");
    expect(entries[1]?.text).toBe("whether losing a pod reads as a cost");
  });

  test("a new heading changes the sha for what follows", () => {
    const entries = parseRestated(SAMPLE);
    expect(entries[2]?.sha).toBe("ada7090");
  });

  test("ignores the file's own prose", () => {
    expect(parseRestated("# Checks, in plainer words\n\nSome paragraph.\n")).toEqual([]);
  });
});

describe("findRestated", () => {
  const entries = parseRestated(SAMPLE);

  test("matches on exact text and an abbreviated sha", () => {
    const found = findRestated(
      entries,
      "d5df018",
      "the wider mouth still reads as swallowing rather than as a flash, not merely smaller",
    );
    expect(found?.subject).toBe("the cannon's fire opening while it takes a pod in");
  });

  test("a longer sha than the one in the file still matches, either way round", () => {
    const found = findRestated(
      entries,
      "d5df018abcd",
      "the wider mouth still reads as swallowing rather than as a flash, not merely smaller",
    );
    expect(found).not.toBeNull();
  });

  test("text that no longer matches word for word does not attach", () => {
    // The trailer picked up a trailing clause after the restatement was
    // written — this is the amended-trailer case `orphanedRestated` reports.
    const found = findRestated(
      entries,
      "d5df018",
      "the wider mouth still reads as swallowing rather than as a flash, not merely smaller — looked at one catch in preview, not the shape sheet",
    );
    expect(found).toBeNull();
  });

  test("a sha with nothing in the file matches nothing", () => {
    expect(findRestated(entries, "0000000", "anything")).toBeNull();
  });
});

describe("orphanedRestated", () => {
  const entries = parseRestated(SAMPLE);

  test("nothing is orphaned when every entry attaches", () => {
    const checks = [
      { sha: "d5df018", text: entries[0]?.text ?? "" },
      { sha: "d5df018", text: entries[1]?.text ?? "" },
      { sha: "ada7090", text: entries[2]?.text ?? "" },
    ];
    expect(orphanedRestated(entries, checks)).toEqual([]);
  });

  test("an amended trailer's text leaves its restatement orphaned", () => {
    const checks = [
      {
        sha: "d5df018",
        text: `${entries[0]?.text} — looked at one catch in preview, not the shape sheet`,
      },
      { sha: "d5df018", text: entries[1]?.text ?? "" },
      { sha: "ada7090", text: entries[2]?.text ?? "" },
    ];
    const orphans = orphanedRestated(entries, checks);
    expect(orphans).toHaveLength(1);
    expect(orphans[0]?.subject).toBe("the cannon's fire opening while it takes a pod in");
  });

  test("a sha that fell off the trunk leaves its restatements orphaned", () => {
    expect(orphanedRestated(entries, [])).toEqual(entries);
  });
});
