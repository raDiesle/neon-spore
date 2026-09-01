import { describe, expect, it } from "bun:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { judgeBand, VOICE_BUDGET_SECONDS } from "../src/band.js";
import { CATALOGUE } from "../src/catalogue.js";
import { planSound } from "../src/plan.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

/**
 * The longest a single sound may run. Nothing in a game where the pair is
 * talking should still be going four seconds after the thing that caused it —
 * except the ambience, which is a floor rather than an event.
 */
const MAX_SECONDS = 4;
const MAX_AMBIENT_SECONDS = 8;

describe("the catalogue", () => {
  it("holds a lot of sounds, and none of them twice", () => {
    expect(CATALOGUE.length).toBeGreaterThan(100);
    const ids = CATALOGUE.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  for (const def of CATALOGUE) {
    describe(def.id, () => {
      it("is named for the family it is in", () => {
        expect(def.id.startsWith(`${def.family}.`)).toBe(true);
      });

      it("says what it is and what it is for", () => {
        expect(def.blurb.length).toBeGreaterThan(12);
        expect(def.use.length).toBeGreaterThan(12);
        expect(def.layers.length).toBeGreaterThan(0);
      });

      it("mixes inside the range the engine can take", () => {
        expect(def.level).toBeGreaterThan(0);
        expect(def.level).toBeLessThanOrEqual(1);
        for (const l of def.layers) {
          expect(l.gain).toBeGreaterThan(0);
          expect(l.gain).toBeLessThanOrEqual(1);
        }
      });

      const plan = planSound(def);

      it("plans to real numbers", () => {
        for (const v of plan.voices) {
          for (const n of [v.start, v.freq, v.toFreq, v.gain, v.attack, v.hold, v.release, v.pan]) {
            expect(Number.isFinite(n)).toBe(true);
          }
          expect(v.freq).toBeGreaterThan(0);
          expect(v.toFreq).toBeGreaterThan(0);
          expect(v.attack).toBeGreaterThan(0);
          expect(v.release).toBeGreaterThan(0);
          expect(v.hold).toBeGreaterThanOrEqual(0);
          expect(Math.abs(v.pan)).toBeLessThanOrEqual(1);
        }
      });

      it("is over before anyone has to talk over it", () => {
        const cap = def.family === "ambient" ? MAX_AMBIENT_SECONDS : MAX_SECONDS;
        expect(plan.duration).toBeGreaterThan(0);
        expect(plan.duration).toBeLessThanOrEqual(cap);
      });

      it("keeps out of the speech band, or says why it does not", () => {
        const verdict = judgeBand(def, plan);
        expect(verdict.complaint ?? "").toBe("");
        expect(verdict.ok).toBe(true);
      });

      const pierce = def.pierce;
      if (pierce) {
        it("gives a reason for covering a voice, not a label", () => {
          expect(pierce.length).toBeGreaterThan(24);
        });
      }
    });
  }

  it("spends its speech-band permission on very few sounds", () => {
    const piercing = CATALOGUE.filter((s) => s.pierce);
    // Five is not a magic number, it is a ceiling someone has to argue past.
    // Every one of these is a sound the pair hears instead of each other.
    expect(piercing.length).toBeLessThanOrEqual(5);
  });

  it("keeps most of itself out of the band by a wide margin", () => {
    const quiet = CATALOGUE.filter((s) => judgeBand(s, planSound(s)).seconds === 0);
    expect(quiet.length).toBeGreaterThan(CATALOGUE.length / 2);
    expect(VOICE_BUDGET_SECONDS).toBeLessThan(0.2);
  });
});

/**
 * The `status` field is a claim about the rest of the repository, and a claim
 * nobody checks is a catalogue that says a sound is wired up months after it
 * stopped being. So it is checked: the two files that name sounds are read,
 * and every id in them has to be `bound` and every `bound` id has to be in
 * them. This is the whole reason the SOUND tab can be trusted.
 */
describe("status", () => {
  // Every file that names a sound id. `bind-creatures.ts` was split out of
  // `bind.ts` the day THE VEIL arrived, and it took nine bound ids with it —
  // so a list of two files quietly reported eight sounds as played by nothing.
  const wiring = [
    "packages/audio/src/bind.ts",
    "packages/audio/src/bind-creatures.ts",
    "packages/audio/src/mixer.ts",
  ]
    .map((f) => Bun.file(join(ROOT, f)))
    .map(async (f) => await f.text());

  // The 250-line limit is `packages/sim/test/limits.test.ts`'s rule and it
  // already covers `packages/*/src`. It is not restated here.
  it("calls a sound bound exactly when something plays it", async () => {
    const text = (await Promise.all(wiring)).join("\n");
    const wrong: string[] = [];
    for (const def of CATALOGUE) {
      const named = text.includes(`"${def.id}"`);
      if (named && def.status !== "bound") wrong.push(`${def.id} is played but marked spare`);
      if (!named && def.status === "bound")
        wrong.push(`${def.id} is marked bound but nothing plays it`);
    }
    expect(wrong).toEqual([]);
  });
});
