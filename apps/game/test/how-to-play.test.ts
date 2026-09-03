import { describe, expect, it } from "bun:test";

/**
 * HOW TO PLAY is copy, and copy is exactly the thing that goes quietly wrong:
 * a page that describes a game the game stopped being. So what is checked is
 * the two claims it exists to make and the vocabulary it has to make them in —
 * the design words are fixed (hull, cannon, shield, guard, maw, pod, column)
 * and a synonym on the one page a first-timer reads is a synonym the pair then
 * says out loud to each other.
 *
 * There is no DOM in this runner, so this reads the source, the way
 * `input-pc.test.ts` and `view-switch.test.ts` do.
 */

const pages = await Bun.file(
  Bun.fileURLToPath(new URL("../src/menu-pages.ts", import.meta.url)),
).text();
const entries = await Bun.file(
  Bun.fileURLToPath(new URL("../src/menu-entries.ts", import.meta.url)),
).text();
const parts = await Bun.file(
  Bun.fileURLToPath(new URL("../src/menu-parts.ts", import.meta.url)),
).text();

/** Only the page itself, so a word elsewhere in the file cannot stand in for one on it. */
const howTo = pages.slice(pages.indexOf("export function buildHowTo"));

describe("the page a pair reads before their first wave", () => {
  it("is reachable from the front page", () => {
    expect(entries).toContain("HOW TO PLAY");
    expect(entries).toContain('a.show("how")');
    expect(parts).toContain('"how"');
  });

  it("says there are two of you, on two devices, with different jobs", () => {
    expect(howTo).toContain("two of you");
    expect(howTo).toContain("two devices");
    expect(howTo).toContain("different jobs");
  });

  it("names both seats and what each one holds", () => {
    expect(howTo).toContain("PILOT");
    expect(howTo).toContain("NAVIGATOR");
    expect(howTo).toContain("cannon");
    expect(howTo).toContain("shield");
  });

  it("says that nothing the players control travels", () => {
    // The rule the whole field is built on — see CLAUDE.md.
    expect(howTo).toContain("Nothing you control travels");
  });

  it("says that talking is the control scheme", () => {
    expect(howTo).toContain("talking to each other is the control scheme");
  });

  it("uses the fixed vocabulary and invents no synonyms for it", () => {
    for (const word of ["hull", "cannon", "shield", "guard", "maw", "pod", "column"]) {
      expect(howTo, `HOW TO PLAY never says "${word}"`).toContain(word);
    }
    for (const wrong of ["spaceship", "laser", "barrier", "enemy ship", "dodge"]) {
      expect(howTo, `HOW TO PLAY says "${wrong}"`).not.toContain(wrong);
    }
  });
});
