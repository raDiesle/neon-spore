import { describe, expect, test } from "bun:test";
import { restate, subjectOf, whereToStand } from "../hint.js";

describe("subjectOf", () => {
  test("a run of two or more shouted words is the subject", () => {
    expect(subjectOf("THE RUNT reads as small and helpless beside a slick")).toBe("THE RUNT");
    expect(subjectOf("seven rocks can still be counted in THE CAIRN at boss size")).toBe(
      "THE CAIRN",
    );
    expect(subjectOf("HUSK 1 and HUSK 2 beside POD")).toBe("HUSK 1");
  });

  test("a single shouted word is not enough — it is as likely a unit as a name", () => {
    expect(subjectOf("the timing at 96 BPM")).toBeNull();
    expect(subjectOf("open BESTIARY, any row with ⌖ ON THE FIELD")).toBe("ON THE FIELD");
  });

  test("nothing shouted, nothing named", () => {
    expect(subjectOf("the wash stays under the creatures at 26 px on a phone")).toBeNull();
  });

  test("a trailing apostrophe belongs to the possessive, not the name", () => {
    expect(subjectOf("THE TITHE's body is a slab across seven columns")).toBe("THE TITHE");
  });
});

describe("whereToStand", () => {
  test("render wants the preview", () => {
    expect(whereToStand(["packages/render/src/field.ts"])).toBe("`bun run preview`");
  });

  test("net wants the relay, even alongside render", () => {
    expect(whereToStand(["packages/net/src/status.ts", "packages/render/src/hud.ts"])).toBe(
      "`bun run relay:check`",
    );
  });

  test("the shape sheet, by its own directory or by the tuned silhouettes", () => {
    expect(whereToStand(["tools/shape-sheet/src/subjects.ts"])).toBe("`bun run shapes:page`");
    expect(whereToStand(["packages/content/src/silhouettes.ts"])).toBe("`bun run shapes:page`");
  });

  test("audio wants the sound sheet", () => {
    expect(whereToStand(["packages/audio/src/mixer.ts"])).toBe("the director's ♪ SOUND sheet");
  });

  test("a briefing wants the cards tab, wherever it lives", () => {
    expect(whereToStand(["packages/sim/src/briefing.ts"])).toBe("the director's CARDS tab");
  });

  test("nothing in the table, nothing said", () => {
    expect(whereToStand(["docs/spec/bosses.md"])).toBeNull();
  });
});

describe("restate", () => {
  test("both halves, subject then where", () => {
    expect(restate("THE WARDEN takes a hand off you", ["packages/render/src/hull.ts"])).toBe(
      "THE WARDEN — open `bun run preview`",
    );
  });

  test("only a subject when nothing changed matches the table", () => {
    expect(restate("THE WARDEN is discussed here", ["docs/spec/bosses.md"])).toBe("THE WARDEN");
  });

  test("only a place when nothing is shouted", () => {
    expect(restate("the wash stays under the creatures", ["packages/render/src/field.ts"])).toBe(
      "open `bun run preview`",
    );
  });

  test("nothing to add, nothing said", () => {
    expect(restate("the wash stays under the creatures", ["docs/spec/bosses.md"])).toBeNull();
  });
});
