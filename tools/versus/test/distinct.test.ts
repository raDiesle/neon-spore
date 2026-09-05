import { describe, expect, it } from "bun:test";
import { VARIANTS } from "../candidates/index.js";
import { patchedFields, slots, type Variant } from "../variant.js";

/**
 * Two candidates that fail the same way are one candidate with a rounding
 * error. The vote is expensive — two people, two phones, at tempo — and the
 * only thing that makes it worth casting is that the two answers can lose
 * differently. So a slot whose candidates are near-neighbours is refused here,
 * before anybody looks at it.
 *
 * `variants.test.ts` already holds the structural half of this: every
 * candidate in a slot patches the same records and the same fields. What it
 * cannot see is whether the *values* say two different things, which is the
 * half this file is for.
 */

/** Every patched field of a candidate, as `symbol.field` -> value. */
function values(v: Variant): Map<string, unknown> {
  const out = new Map<string, unknown>();
  for (const p of v.patches) {
    const fields = p.fields as Record<string, unknown>;
    for (const f of patchedFields(p)) out.set(`${p.where.symbol}.${f}`, fields[f]);
  }
  return out;
}

/** What the shipped record says right now, for the same keys. */
function shipped(v: Variant): Map<string, unknown> {
  const out = new Map<string, unknown>();
  for (const p of v.patches) {
    const target = p.target as Record<string, unknown>;
    for (const f of patchedFields(p)) out.set(`${p.where.symbol}.${f}`, target[f]);
  }
  return out;
}

/**
 * Whether two values say the same thing. A function is compared by what it
 * computes rather than by how it is spelled: `tailBack` is the field that
 * carries a shot's whole travel, and two candidates could reach the same curve
 * by different arithmetic and still be one candidate.
 */
function same(a: unknown, b: unknown): boolean {
  if (typeof a === "function" && typeof b === "function") {
    // Only a *curve* can be compared by what it computes, and a curve is a
    // function of one number. A record may also carry a whole drawing —
    // `MouthLook.draw` takes a context, a frame and a skin — and probing one
    // of those with a number crashes inside somebody's candidate rather than
    // reporting anything. Two drawings are two drawings; identity is the only
    // honest answer, and it is the right one, because a candidate that reuses
    // the shipped function is not a candidate.
    //
    // Arity is the first guard and it is not enough on its own: `StrandLook.bead`
    // takes **one argument** and it is a whole drawing, because everything a
    // bead draw needs travels in one record. So the probe is also wrapped —
    // a drawing handed a number throws, and a throw means "this was never a
    // curve", not "the two disagree".
    if (a.length !== 1 || b.length !== 1) return Object.is(a, b);
    const f = a as (n: number) => number;
    const g = b as (n: number) => number;
    try {
      for (let t = 0; t <= 1; t += 0.05) {
        const [x, y] = [f(t), g(t)];
        if (typeof x !== "number" || typeof y !== "number") return false;
        if (Math.abs(x - y) > 1e-9) return false;
      }
    } catch {
      return Object.is(a, b);
    }
    return true;
  }
  return Object.is(a, b);
}

function differences(a: Map<string, unknown>, b: Map<string, unknown>): string[] {
  return [...a.keys()].filter((k) => !same(a.get(k), b.get(k)));
}

describe("a slot's candidates are two answers, not one", () => {
  for (const { slot, candidates } of slots(VARIANTS)) {
    for (const c of candidates) {
      it(`${slot}/${c.name} says something the shipped record does not`, () => {
        // A candidate that agrees with what ships everywhere is a vote whose
        // two phones draw the same picture, which reads as agreement.
        expect(differences(values(c), shipped(c))).not.toEqual([]);
      });

      it(`${slot}/${c.name} has a sentence that is a claim, not a label`, () => {
        // The emitted prompt quotes it verbatim and it is the only durable
        // record of what was being argued about. `.claude/skills/new-wave`'s
        // one-sentence test, applied to a look.
        expect(c.sentence.split(/\s+/).length).toBeGreaterThan(5);
        expect(c.sentence).toMatch(/[—-]/);
      });
    }

    if (candidates.length < 2) continue;
    for (let i = 0; i < candidates.length; i++) {
      for (let j = i + 1; j < candidates.length; j++) {
        const [a, b] = [candidates[i]!, candidates[j]!];
        it(`${slot}: ${a.name} and ${b.name} differ in kind, not in degree`, () => {
          const va = values(a);
          const diff = differences(va, values(b));
          // Half the fields, at least. A pair agreeing on most of what they
          // touch is arguing about a number; this mechanism is for arguing
          // about an answer.
          expect(diff.length * 2).toBeGreaterThanOrEqual(va.size);
        });
      }
    }
  }
});
