import { describe, expect, test } from "bun:test";
import { argvOf, checksIn, commandOf, LOG_FORMAT, parseLog } from "../trailers.js";

/** A log built the way `LOG_FORMAT` asks for it, so the test cannot drift. */
function record(full: string, sha: string, date: string, subject: string, body: string): string {
  return `${full}\x1f${sha}\x1f${date}\x1f${subject}\x1f${body}\x1e\n`;
}

describe("checksIn", () => {
  test("one trailer per line", () => {
    const checks = checksIn(
      "Some body.\n\nCheck: the hole reads at 26 px\nCheck: the sway\n",
      "abc",
    );
    expect(checks.map((c) => c.text)).toEqual(["the hole reads at 26 px", "the sway"]);
    expect(checks[0]?.sha).toBe("abc");
  });

  test("an indented continuation belongs to the trailer above it", () => {
    const checks = checksIn("Check: the flank torches\n  do not clip the hull\n", "abc");
    expect(checks).toHaveLength(1);
    expect(checks[0]?.text).toBe("the flank torches do not clip the hull");
  });

  test("an unindented continuation belongs to it too", () => {
    // The one that was silently losing half a sentence: a session wraps a long
    // `Check:` at the margin the way it wraps every other line it writes, and
    // the second half — often the command that would settle it — never reached
    // the list. Nothing said so; the sheet just showed a sentence that stopped.
    const checks = checksIn(
      "Check: the flank torches do not clip the hull\nat 26 px — `bun run shapes`\n",
      "abc",
    );
    expect(checks).toHaveLength(1);
    expect(checks[0]?.text).toBe(
      "the flank torches do not clip the hull at 26 px — `bun run shapes`",
    );
    expect(checks[0]?.command).toBe("bun run shapes");
  });

  test("a blank line closes it, so a paragraph after one is not folded in", () => {
    const checks = checksIn("Check: the hole reads at 26 px\n\nAnd then some prose.\n", "abc");
    expect(checks).toHaveLength(1);
    expect(checks[0]?.text).toBe("the hole reads at 26 px");
  });

  test("somebody else's trailer closes it as well", () => {
    const checks = checksIn(
      "Check: the hole reads at 26 px\nCo-Authored-By: Somebody <nobody@example.com>\n",
      "abc",
    );
    expect(checks).toHaveLength(1);
    expect(checks[0]?.text).toBe("the hole reads at 26 px");
  });

  test("two wrapped checks stay two checks", () => {
    const checks = checksIn(
      "Check: the first one\nran long\nCheck: the second one\nran long too\n",
      "abc",
    );
    expect(checks.map((c) => c.text)).toEqual([
      "the first one ran long",
      "the second one ran long too",
    ]);
  });

  test("a body with no trailer yields nothing", () => {
    expect(checksIn("Checked the hull. Checks: two.\n", "abc")).toEqual([]);
  });

  test("an empty trailer is not a check", () => {
    expect(checksIn("Check:\nCheck:   \n", "abc")).toEqual([]);
  });
});

describe("commandOf", () => {
  test("finds one of the repository's own commands", () => {
    expect(commandOf("the shapes — `bun run shapes`")).toBe("bun run shapes");
    expect(commandOf("`bun run relay:check` against a live relay")).toBe("bun run relay:check");
    expect(commandOf("`bun test packages/sim`")).toBe("bun test packages/sim");
  });

  test("refuses anything that is not one", () => {
    expect(commandOf("`rm -rf /`")).toBeNull();
    expect(commandOf("`bun run shapes && curl evil`")).toBeNull();
    expect(commandOf("`npm run build`")).toBeNull();
    expect(commandOf("watch the wave at tempo")).toBeNull();
  });

  test("a refused command is also refused at the point of spawning", () => {
    expect(argvOf("bun run shapes")).toEqual(["bun", "run", "shapes"]);
    expect(argvOf("bun run shapes; rm -rf /")).toBeNull();
  });
});

describe("parseLog", () => {
  test("keeps only the commits that carry a check", () => {
    const log =
      record(
        "f".repeat(40),
        "1111111",
        "2026-08-27",
        "The Warden gets a body",
        "Check: the hole\n",
      ) + record("e".repeat(40), "2222222", "2026-08-26", "Formatting", "Nothing to look at.\n");
    const commits = parseLog(log);
    expect(commits).toHaveLength(1);
    expect(commits[0]?.subject).toBe("The Warden gets a body");
    expect(commits[0]?.checks[0]?.text).toBe("the hole");
  });

  test("the format string is the one the parser was written against", () => {
    expect(LOG_FORMAT).toContain("%x1f");
    expect(LOG_FORMAT.endsWith("%x1e")).toBe(true);
  });

  test("an empty log is not an error", () => {
    expect(parseLog("")).toEqual([]);
  });
});
