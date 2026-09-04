import { describe, expect, it } from "bun:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { judgeBand, VOICE_BUDGET_SECONDS } from "../src/band.js";
import { CATALOGUE } from "../src/catalogue.js";
import { THEMES } from "../src/music/themes.js";
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
 * Every file that names a sound id. `bind-creatures.ts` was split out of
 * `bind.ts` the day THE VEIL arrived, and it took nine bound ids with it — so
 * a list of two files quietly reported eight sounds as played by nothing.
 * `mixer-boss.ts` came off `mixer.ts` the same way, with the queen's and THE
 * MIRROR's cues in it. `bind-carom.ts` came off `bind-creatures.ts` in its own
 * turn, with THE CAROM's four. `docs/spec/audio.md` names this list as well,
 * and "the document" below holds the two together so a sixth file cannot be
 * added to one alone.
 */
const WIRING = [
  "packages/audio/src/bind.ts",
  "packages/audio/src/bind-creatures.ts",
  "packages/audio/src/bind-carom.ts",
  "packages/audio/src/bind-volley.ts",
  "packages/audio/src/mixer.ts",
  "packages/audio/src/mixer-boss.ts",
];

/**
 * The `status` field is a claim about the rest of the repository, and a claim
 * nobody checks is a catalogue that says a sound is wired up months after it
 * stopped being. So it is checked: every file that names a sound is read, and
 * every id in them has to be `bound` and every `bound` id has to be in them.
 * This is the whole reason the SOUND tab can be trusted.
 */
describe("status", () => {
  const wiring = WIRING.map((f) => Bun.file(join(ROOT, f))).map(async (f) => await f.text());

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

const AUDIO_DOC = join(ROOT, "docs", "spec", "audio.md");

/** `family` → how many are bound and how many there are, from `CATALOGUE`. */
function actualFamilies(): Map<string, [number, number]> {
  const rows = new Map<string, [number, number]>();
  for (const def of CATALOGUE) {
    const row = rows.get(def.family) ?? [0, 0];
    row[1] += 1;
    if (def.status === "bound") row[0] += 1;
    rows.set(def.family, row);
  }
  return rows;
}

/**
 * Section 3's grain table and the sentence under it, as the document writes
 * them. A row's first column is the grain's name in backticks; the sentence
 * that follows names the three shapers the table deliberately leaves out.
 *
 * Sliced to the section first, because section 4's rows are the same shape and
 * would otherwise be counted as grains.
 */
function documentedGrains(text: string): { rows: string[]; shapers: string[] } {
  const start = text.indexOf("## 3 ");
  const end = text.indexOf("## 4 ", start);
  if (start < 0 || end < 0) return { rows: [], shapers: [] };
  const section = text.slice(start, end);
  const rows = [...section.matchAll(/^\| `(\w+)` \|[^|]*\|[^|]*\|$/gm)].map((m) => m[1] as string);
  const line = /^(.*) shape a grain rather than adding one/m.exec(section);
  const shapers = line ? [...line[1]!.matchAll(/`(\w+)`/g)].map((m) => m[1] as string) : [];
  return { rows, shapers };
}

/** Every grain `grain.ts` exports, in the order it exports them. */
function exportedGrains(source: string): string[] {
  return [...source.matchAll(/^export function (\w+)\(/gm)].map((m) => m[1] as string);
}

/**
 * Section 4's table, as the document writes it. A row names one family or
 * several (`` `assist` · `signal` ``) and ends in "N of M", except `music`,
 * which is not in `CATALOGUE` at all and ends in an em dash.
 */
function documentedFamilies(text: string): Map<string, [number, number] | null> {
  const rows = new Map<string, [number, number] | null>();
  for (const line of text.split("\n")) {
    const row = /^\|((?:\s*`\w+`\s*·?)+)\|[^|]*\|\s*(?:(\d+) of (\d+)|—)\s*\|$/.exec(line);
    if (!row) continue;
    const families = [...row[1]!.matchAll(/`(\w+)`/g)].map((m) => m[1]!).sort();
    rows.set(families.join(" · "), row[2] ? [Number(row[2]), Number(row[3])] : null);
  }
  return rows;
}

/**
 * A document is not compiled, so every number in one is a claim nothing holds
 * to the code. These are the claims in `docs/spec/audio.md` that a new sound
 * silently falsifies — the family table, the spare count, and the list of
 * files the `status` test above reads. The table had drifted in every row and
 * the spare count by twelve before anyone counted.
 */
describe("docs/spec/audio.md", () => {
  it("has a family row for every family in the catalogue, and no other", async () => {
    const documented = documentedFamilies(await Bun.file(AUDIO_DOC).text());
    const named = [...documented.keys()]
      .flatMap((k) => k.split(" · "))
      .filter((f) => f !== "music");
    expect(named.sort()).toEqual([...actualFamilies().keys()].sort());
  });

  it("counts each row's bound and spare the way the catalogue does", async () => {
    const documented = documentedFamilies(await Bun.file(AUDIO_DOC).text());
    const actual = actualFamilies();
    for (const [key, counts] of documented) {
      if (!counts) continue; // `music`, which is not in CATALOGUE
      const sum = key
        .split(" · ")
        .reduce<[number, number]>(
          (acc, f) => [acc[0] + (actual.get(f)?.[0] ?? 0), acc[1] + (actual.get(f)?.[1] ?? 0)],
          [0, 0],
        );
      expect(counts, key).toEqual(sum);
    }
  });

  it("names every grain `grain.ts` exports in section 3, and no other", async () => {
    // The table had already gone stale once: `noise` was added to `grain.ts`
    // and the table stayed nine rows long, with every test green. The rows and
    // the three shapers the prose excludes have to account for the exports
    // exactly — a new grain is a change to the game's voice, and the document
    // is where that is argued.
    const { rows, shapers } = documentedGrains(await Bun.file(AUDIO_DOC).text());
    const source = await Bun.file(join(ROOT, "packages", "audio", "src", "grain.ts")).text();
    expect([...rows, ...shapers].sort()).toEqual(exportedGrains(source).sort());
  });

  it("does not let a grain be listed as a shaper as well", async () => {
    const { rows, shapers } = documentedGrains(await Bun.file(AUDIO_DOC).text());
    expect(rows.length).toBeGreaterThan(0);
    expect(shapers.length).toBeGreaterThan(0);
    expect(rows.filter((r) => shapers.includes(r))).toEqual([]);
  });

  it("says how many are spare out of how many there are", async () => {
    const text = await Bun.file(AUDIO_DOC).text();
    const said = /(\d+) of the (\d+) are `spare`/.exec(text);
    expect(said, "section 5 no longer states the spare count").not.toBeNull();
    const spare = CATALOGUE.filter((s) => s.status === "spare").length;
    expect([Number(said![1]), Number(said![2])]).toEqual([spare, CATALOGUE.length]);
  });

  it("names the same wiring files the status test reads", async () => {
    const text = await Bun.file(AUDIO_DOC).text();
    const start = text.indexOf("The `BOUND` stamp");
    const end = text.indexOf("claims to be spare.", start);
    expect(start >= 0 && end > start, "the BOUND paragraph has been renamed").toBe(true);
    // Odd positions in a backtick split are what was inside the backticks.
    const named = text
      .slice(start, end)
      .split("`")
      .filter((part, i) => i % 2 === 1 && part.endsWith(".ts"))
      .sort();
    expect(named).toEqual(WIRING.map((f) => f.split("/").pop()!).sort());
  });

  it("lists every music theme in section 8, and no theme that was dropped", async () => {
    const text = await Bun.file(AUDIO_DOC).text();
    const ids = THEMES.map((t) => t.id.replace(/^music\./, "")).sort();
    const rows = [...text.matchAll(/^\| `(\w+)` \|[^|]*\|[^|]*\|$/gm)].map((m) => m[1]!);
    expect(rows.filter((r) => ids.includes(r)).sort()).toEqual(ids);
  });
});
