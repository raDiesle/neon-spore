import { describe, expect, test } from "bun:test";
import { blocking, type Handoff, optional, render } from "../handoff.js";
import { parseParked } from "../parked.js";

const CLEAR: Handoff = {
  branch: "claude/thing-9f2",
  landed: true,
  ahead: 0,
  pushed: true,
  dirty: [],
  green: true,
  asks: [],
  waiting: 0,
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

  test("a check waiting for an eye does not — it is an offer, not a debt", () => {
    expect(blocking({ ...CLEAR, waiting: 3 })).toEqual([]);
    expect(blocking({ ...CLEAR, parked: ["a director sheet"] })).toEqual([]);
  });
});

describe("optional", () => {
  test("checks and parked ideas are both offered", () => {
    const spare = optional({ ...CLEAR, waiting: 2, parked: ["a director sheet"] });
    expect(spare.some((s) => s.includes("bun run checks"))).toBe(true);
    expect(spare.some((s) => s.includes("docs/parked.md"))).toBe(true);
  });

  test("an unpushed branch is offered, because nothing is lost by it", () => {
    expect(optional({ ...CLEAR, pushed: false })).toEqual(["claude/thing-9f2 is not on origin"]);
  });
});

describe("render", () => {
  test("the clear block says so in its first line and claims nothing else", () => {
    const out = render(CLEAR);
    expect(out).toContain("✅ NOTHING WAITING");
    expect(out).toContain("the desk is clear");
    expect(out).not.toContain("⚑");
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
