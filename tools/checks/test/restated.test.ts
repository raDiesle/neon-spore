import { describe, expect, test } from "bun:test";
import {
  asImagePath,
  findRestated,
  isDirectorLink,
  orphanedRestated,
  parseRestated,
} from "../restated.js";

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

describe("parseRestated — before/after", () => {
  const WITH_BEFORE_AFTER = `## \`0980374\` — the mark

> can you tell at a glance which waves carry a boss?

- **badge** implementation
- **subject** wave list gets a third mark
- **changed** a card-first wave now carries its own mark
- **decide** does the mark read as a fourth fact or blur into one dot?
- **before** two marks in the list: gold boss glyph, cyan control glyph
- **after** a third, mint card mark on any wave that opens on a briefing
- **where** \`bun run dev\`, the wave list on the left
`;

  test("before and after are read as real fields, not folded into prose", () => {
    const [entry] = parseRestated(WITH_BEFORE_AFTER);
    expect(entry?.before).toBe("two marks in the list: gold boss glyph, cyan control glyph");
    expect(entry?.after).toBe("a third, mint card mark on any wave that opens on a briefing");
  });

  test("an entry with neither field leaves them undefined, not empty strings", () => {
    const [entry] = parseRestated(SAMPLE);
    expect(entry?.before).toBeUndefined();
    expect(entry?.after).toBeUndefined();
  });

  test("`before: nothing, this is new` is kept as written, not read as missing", () => {
    const md = WITH_BEFORE_AFTER.replace(
      "- **before** two marks in the list: gold boss glyph, cyan control glyph",
      "- **before** nothing, this is new",
    );
    expect(parseRestated(md)[0]?.before).toBe("nothing, this is new");
  });
});

describe("asImagePath", () => {
  test("a path under docs/checks/ ending in an image extension is kept", () => {
    expect(asImagePath("docs/checks/0980374-before.png")).toBe("docs/checks/0980374-before.png");
  });

  test("prose is not mistaken for a path", () => {
    expect(asImagePath("nothing, this is new")).toBeNull();
  });

  test("a path outside docs/checks/ is not treated as a captured frame", () => {
    expect(asImagePath("apps/game/dist/frame.png")).toBeNull();
  });

  test("a docs/checks/ file with no image extension is not a frame", () => {
    expect(asImagePath("docs/checks/0980374.md")).toBeNull();
  });
});

describe("isDirectorLink", () => {
  test("a full URL is a link", () => {
    expect(isDirectorLink("http://localhost:4174/?tab=cards")).toBe(true);
  });

  test("a path relative to the director's own origin is a link", () => {
    expect(isDirectorLink("/?tab=cards")).toBe(true);
    expect(isDirectorLink("?tab=cards")).toBe(true);
  });

  test("a shell command in backticks is not a link", () => {
    expect(isDirectorLink("`bun run dev`, the wave list on the left")).toBe(false);
  });
});
