import { describe, expect, it } from "bun:test";
import { CATALOGUE, planSound } from "@neon-spore/audio";
import { SUBJECTS } from "@neon-spore/shape-sheet";
import { NO_SUBJECT, subjectFor, triggerFor } from "../src/sound-link.js";

/**
 * The SOUND sheet draws every sound beside the thing that triggers it. Two
 * ways that goes quietly wrong: a table entry names a contour `shape-sheet`
 * does not have, so the row shows a question mark that means "not drawn yet"
 * when it really means "typo"; or a new sound is added and nothing thought
 * about what it is attached to.
 */
describe("what a sound is attached to", () => {
  it("resolves every sound in the catalogue to something", () => {
    for (const def of CATALOGUE) {
      expect(subjectFor(def), def.id).toBeDefined();
      expect(triggerFor(def).length).toBeGreaterThan(12);
    }
  });

  it("never names a contour the shape sheet does not have", () => {
    const known = new Set(SUBJECTS.map((s) => s.name));
    const wrong = CATALOGUE.map(subjectFor)
      .filter((s) => s.kind === "shape")
      .map((s) => (s as { name: string }).name)
      .filter((name) => !known.has(name));
    expect([...new Set(wrong)]).toEqual([]);
  });

  it("gives every bound sound a picture, or a written reason there is none", () => {
    const blank = CATALOGUE.filter((d) => d.status === "bound")
      .filter((d) => subjectFor(d).kind === "none")
      .filter((d) => !(d.id in NO_SUBJECT))
      .map((d) => d.id);
    expect(blank).toEqual([]);
  });

  it("keeps the exceptions to sounds that exist, with a reason and not a label", () => {
    const ids = new Set(CATALOGUE.map((d) => d.id));
    for (const [id, why] of Object.entries(NO_SUBJECT)) {
      expect(ids.has(id), `${id} is excused but is not in the catalogue`).toBe(true);
      expect(why.length, id).toBeGreaterThan(30);
    }
  });

  it("plots something for every sound — an empty plan would draw an empty box", () => {
    for (const def of CATALOGUE) {
      const plan = planSound(def);
      expect(plan.voices.length, def.id).toBeGreaterThan(0);
      expect(plan.duration, def.id).toBeGreaterThan(0);
    }
  });
});
