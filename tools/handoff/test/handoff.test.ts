import { describe, expect, test } from "bun:test";
import { blocking, followUps, type Handoff, render } from "../handoff.js";
import { parseParked } from "../parked.js";

const CLEAR: Handoff = {
  branch: "claude/thing-9f2",
  landed: true,
  ahead: 0,
  pushed: true,
  dirty: [],
  green: true,
  asks: [],
  parked: [],
  offline: false,
};

describe("blocking", () => {
  test("a landed, clean, unquestioned session holds nobody up", () => {
    expect(blocking(CLEAR)).toEqual([]);
  });

  test("a question holds it up", () => {
    expect(blocking({ ...CLEAR, asks: ["with the bulb or against it"] })).toEqual(["1 question"]);
  });

  test("work that never landed holds it up", () => {
    expect(blocking({ ...CLEAR, landed: false, ahead: 2 })).toEqual(["2 commit(s) not on main"]);
  });

  test("a red tree holds it up", () => {
    expect(blocking({ ...CLEAR, green: false })).toEqual(["the tree is red"]);
  });

  test("a parked idea does not — nobody has decided to do it", () => {
    expect(blocking({ ...CLEAR, parked: ["a director sheet"] })).toEqual([]);
  });
});

describe("followUps", () => {
  test("a parked idea is offered in its own words, not as a count", () => {
    const ideas = ["the director could show the parked list beside TO CHECK"];
    expect(followUps({ ...CLEAR, parked: ideas })).toEqual(ideas);
  });

  test("a long list is cut, because the block has to fit a phone", () => {
    const many = Array.from({ length: 9 }, (_, i) => `idea ${i}`);
    expect(followUps({ ...CLEAR, parked: many })).toHaveLength(6);
  });
});

describe("render", () => {
  test("the clear block says so in its first line and claims nothing else", () => {
    const out = render(CLEAR);
    expect(out).toContain("✅ NOTHING WAITING");
    expect(out).toContain("nothing postponed");
    expect(out).not.toContain("⚑");
  });

  test("a parked idea is printed in full, so it can be judged without opening it", () => {
    const idea = "the director could show the parked list beside TO CHECK";
    expect(render({ ...CLEAR, parked: [idea] })).toContain(idea);
  });

  test("the outstanding check list is never a row — it is always non-empty", () => {
    expect(render(CLEAR)).not.toContain("bun run checks");
  });

  test("what was cut is said, rather than silently dropped", () => {
    const many = Array.from({ length: 8 }, (_, i) => `idea ${i}`);
    expect(render({ ...CLEAR, parked: many })).toContain("and 2 more — docs/parked.md");
  });

  test("a block that is held up names what by", () => {
    const out = render({
      ...CLEAR,
      asks: ["with the bulb or against it"],
      landed: false,
      ahead: 1,
    });
    expect(out).toContain("⚑ YOUR MOVE");
    expect(out).toContain("1 question");
    expect(out).toContain("with the bulb or against it");
    expect(out).toContain("1 commit(s) ahead of origin/main");
  });

  test("an unreachable origin does not turn into a landing", () => {
    expect(render({ ...CLEAR, offline: true })).toContain("origin unreachable");
  });

  test('the landing is stated against origin/main by name, never just "main"', () => {
    expect(render({ ...CLEAR, branch: "main" })).toContain("is on origin/main");
  });

  test("a long dirty list is cut rather than allowed to fill a phone", () => {
    const dirty = ["a.ts", "b.ts", "c.ts", "d.ts", "e.ts", "f.ts"];
    expect(render({ ...CLEAR, dirty })).toContain("and 2 more");
  });
});

describe("parseParked", () => {
  test("one entry per heading, with the line under it", () => {
    const md = [
      "# Parked",
      "",
      "prose about the file",
      "",
      "## The director could show the parked list",
      "_2026-08-27 · claude/thing-9f2_",
      "",
      "why it was not done now.",
      "",
      "## A second idea",
      "",
      "no origin line at all.",
    ].join("\n");
    expect(parseParked(md)).toEqual([
      { title: "The director could show the parked list", origin: "2026-08-27 · claude/thing-9f2" },
      { title: "A second idea", origin: "" },
    ]);
  });

  test("an empty file parks nothing", () => {
    expect(parseParked("# Parked\n\nnothing here yet.\n")).toEqual([]);
  });
});
