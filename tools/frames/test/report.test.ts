import { describe, expect, it } from "bun:test";
import { isPhotographable, splitEntries } from "../run.js";

/**
 * The feasibility count `bun run frames --report` prints — `docs/queue.md`'s
 * brief asks for that number to be reported honestly before any bulk capture,
 * and this pins the two judgment calls it rests on: how many `**badge**`
 * entries one restated file holds, and which of them a frame can settle.
 */
describe("splitEntries", () => {
  it("counts one entry for a single-badge file", () => {
    const text = `## \`abc1234\` — a title\n\n- **badge** implementation\n- **subject** x\n`;
    expect(splitEntries(text)).toHaveLength(1);
  });

  it("counts two entries for a file with two `**badge**` blocks, like docs/checks/16efb33.md", () => {
    const text = [
      "## `16efb33` — sun stripes falling into the back water",
      "",
      "> question one",
      "",
      "- **badge** implementation",
      "- **subject** a",
      "",
      "> question two",
      "",
      "- **badge** implementation",
      "- **subject** b",
      "",
    ].join("\n");
    expect(splitEntries(text)).toHaveLength(2);
  });
});

describe("isPhotographable", () => {
  it("is true for a check whose where names a preview wave", () => {
    const entry =
      "- **badge** implementation\n- **decide** does the stripe read as light?\n- **where** `bun run preview`, any wave\n";
    expect(isPhotographable(entry)).toBe(true);
  });

  it("is false for a check about sound", () => {
    const entry =
      "- **badge** implementation\n- **decide** does the deflect sound land on the beat?\n- **where** `bun run preview`, headphones on\n";
    expect(isPhotographable(entry)).toBe(false);
  });

  it("is false for a check that needs two devices", () => {
    const entry =
      "- **badge** implementation\n- **decide** do both devices agree?\n- **where** two devices in a room\n";
    expect(isPhotographable(entry)).toBe(false);
  });

  it("is false for a relay check", () => {
    const entry =
      "- **badge** implementation\n- **decide** does the desync ledger catch it?\n- **where** `bun run relay:check`\n";
    expect(isPhotographable(entry)).toBe(false);
  });
});
