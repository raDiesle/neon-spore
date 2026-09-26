import { describe, expect, it } from "bun:test";
import { WAVES, type WordedGuide } from "@neon-spore/content";
import { CEILING, CLEAN } from "../clean.js";
import { BUDGET, findings, sentences, words } from "../measure.js";
import { playerText, type TextEntry } from "../text.js";

const subject = (entry: TextEntry): string => entry.id.split(" · ")[0] ?? entry.id;

/** The waves whose guide is still words rather than a film. */
function worded(): { name: string; guide: WordedGuide }[] {
  return WAVES.flatMap((w) =>
    w.guide && w.guide.scene === undefined ? [{ name: w.name, guide: w.guide }] : [],
  );
}

describe("the measure", () => {
  it("passes the register the boss guides are already written in", () => {
    expect(findings("1. Load the colour your partner calls.", "half")).toEqual([]);
    expect(findings("2. Fire once, up the lit column.", "half")).toEqual([]);
    expect(findings("Sink all five ships before the clock runs out.", "both")).toEqual([]);
  });

  it("fails the register the prose guides are written in", () => {
    const shell =
      "A slick or a bulb in plating a size too big for it, split down the middle: " +
      "one piece in front of each of its two columns, and its colour showing through the cracks.";
    const rules = findings(shell, "both").map((f) => f.rule);
    expect(rules).toContain("over-budget");
    expect(rules).toContain("long-sentence");
    expect(rules).toContain("clause-load");
  });

  /**
   * The two that cost the most to get right, so they are held by name: a comma
   * between two single words is a list a player says in one breath, and a word
   * that merely ends in `-en` is not a participle. Both were live false
   * positives against the shipped text before they were fixed.
   */
  it("counts a spoken list as one breath, not as four clauses", () => {
    const step = "1. Move the sights one square a press: LEFT, RIGHT, UP, DOWN.";
    expect(findings(step, "half")).toEqual([]);
  });

  it("does not read `is between` or `is fourteen` as a passive", () => {
    expect(findings("2. Say STOP when the needle is between the marks.", "half")).toEqual([]);
    expect(findings("4. The window is fourteen beats.", "half")).toEqual([]);
  });

  it("reads a real passive, and says who should be doing it", () => {
    const found = findings("3. Your colours are dead. A rock is warded.", "half");
    expect(found.map((f) => f.rule)).toContain("passive");
  });

  it("bans a semicolon and an em dash outright", () => {
    expect(findings("Hold it; then let go.", "half")[0]?.rule).toBe("held-breath");
    expect(findings("Hold it — then let go.", "half")[0]?.rule).toBe("held-breath");
  });

  it("names the word to use instead of the one it found", () => {
    const found = findings("3. Cannon in the middle lane.", "half");
    expect(found).toHaveLength(1);
    expect(found[0]?.rule).toBe("word");
    expect(found[0]?.detail).toContain("column");
  });

  it("splits on full stops only, and counts words the way a reader does", () => {
    expect(sentences("One. Two? Three!")).toHaveLength(3);
    expect(words("  a  b   c ")).toBe(3);
  });
});

describe("the inventory", () => {
  it("reaches every wave's name and worded guide, and every mechanic", () => {
    const entries = playerText();
    const ids = new Set(entries.map((e) => e.id));
    // Read off the waves rather than counted: a filmed guide carries no words
    // since 25 September 2026, and a floor under the count fell with every
    // guide that became a film, until moving it was a step of every such lane.
    for (const wave of WAVES) expect(ids, wave.name).toContain(`${wave.name} · name`);
    for (const wave of worded()) {
      expect(ids, wave.name).toContain(`${wave.name} · both`);
      expect(ids, wave.name).toContain(`${wave.name} · P1 · half`);
      expect(ids, wave.name).toContain(`${wave.name} · P2 · half`);
    }
    expect(entries.some((e) => e.kind === "what")).toBe(true);
    expect(Object.keys(BUDGET).sort()).toEqual(["both", "half", "name", "what"]);
  });

  it("reaches the six sentences the game draws outside a wave", () => {
    const cards = playerText().filter((e) => subject(e).endsWith(" CARD"));
    expect(new Set(cards.map(subject))).toEqual(new Set(["LINE CARD", "SCREEN CARD"]));
    expect(cards.filter((e) => e.kind === "what")).toHaveLength(6);
  });

  it("reaches the three names on the screen chooser's cards", () => {
    const names = playerText().filter((e) => e.id.startsWith("SCREEN CARD") && e.kind === "name");
    expect(names.map((e) => e.text)).toEqual(["PLAYER 1", "PLAYER 2", "ONE SCREEN"]);
  });

  it("makes one entry per line, because a numbered step is read one at a time", () => {
    const steps = playerText().filter((e) => /^\d\.\s/.test(e.text));
    // Every numbered line the worded guides hold, and no more — a count read
    // off the guides, because a floor fell with every guide taken off.
    const written = worded()
      .flatMap(({ guide }) => [guide.both, guide.p1, guide.p2].flatMap((t) => t.split("\n")))
      .filter((line) => /^\d\.\s/.test(line.trim()));
    expect(steps).toHaveLength(written.length);
    for (const step of steps) expect(step.text).not.toContain("\n");
  });
});

describe("the contract", () => {
  /**
   * `CLEAN` only grows: once a subject's text has been rewritten it is held to
   * the rules for good, and this is the assertion that holds it.
   */
  it("holds every subject on CLEAN to all six rules", () => {
    const held = new Set(CLEAN);
    for (const entry of playerText()) {
      if (!held.has(subject(entry))) continue;
      expect(findings(entry.text, entry.kind), `${entry.id}: ${entry.text}`).toEqual([]);
    }
  });

  /**
   * `CEILING` only falls, and it is the half that catches a *new* wave written
   * in the old register — `CLEAN` cannot, because a name nobody has rewritten
   * was never on it.
   */
  it("lets no more lines fail than the ceiling allows", () => {
    const failing = playerText().filter((e) => findings(e.text, e.kind).length > 0);
    expect(failing.length).toBeLessThanOrEqual(CEILING);
  });

  it("carries no subject that has left the game", () => {
    const subjects = new Set(playerText().map(subject));
    for (const name of CLEAN) expect(subjects.has(name), `${name} is on CLEAN and gone`).toBe(true);
  });

  it("keeps CLEAN sorted and unique, so a rewrite lane inserts rather than appends", () => {
    expect([...CLEAN]).toEqual([...new Set(CLEAN)]);
    expect([...CLEAN]).toEqual([...CLEAN].sort());
  });
});
