import { describe, expect, it } from "bun:test";
import { readCurrent, type Vote, votePrompt } from "../prompt.js";
import { patch, type Variant } from "../variant.js";

/**
 * A vote writes no file, no git, no localStorage and no server call, so after
 * the prompt has been run there is nothing left of the decision except the
 * text this builder produced. Everything below is about the session that
 * pastes it three weeks late with no memory of the vote and no way to ask.
 *
 * The fixtures are plain objects rather than the game's own records on
 * purpose: `test/variants.test.ts` already holds the registry to the live
 * ones, and a string test that moved every time somebody nudged a lobe count
 * would be a test of `silhouettes.ts` wearing a prompt's clothes.
 */

const BULB = { lobes: 9, depth: 0.1, wobble: 0.055, rx: 0.4, ry: 0.42, seed: 3 };
const SWAY = {
  name: "sway-pump",
  note: "slow sway, faster pump, volume held",
  poseAt: (t: number) => ({ dx: Math.sin(t * 1.9) * 0.17, sx: 1 }),
};
const OWN_SKIN = { body: ["#F04AD8", "#B21FA0"], rim: "#FF6FE4", edge: "#FFFFFF" };

function bulb(name: string, sentence: string, lobes: number, depth: number): Variant {
  return {
    slot: "creature:bulb",
    name,
    sentence,
    dir: `tools/versus/candidates/creature-bulb.${name}`,
    patches: [
      patch({
        target: BULB,
        reached: () => BULB,
        where: {
          file: "packages/content/src/silhouettes.ts",
          symbol: "BULB",
          type: "CreatureSilhouette",
        },
        fields: { lobes, depth },
      }),
      patch({
        target: SWAY,
        reached: () => SWAY,
        where: { file: "packages/content/src/own-motion.ts", symbol: "SWAY_PUMP" },
        fields: { poseAt: (t: number) => ({ dx: Math.sin(t * 1.45) * 0.21, sx: 1 }) },
      }),
    ],
  };
}

function hull(name: string, rim: string): Variant {
  return {
    slot: "ship:hull-skin",
    name,
    sentence: `${name} where the ship is violet`,
    dir: `tools/versus/candidates/ship-hull.${name}`,
    patches: [
      patch({
        target: OWN_SKIN,
        reached: () => OWN_SKIN,
        where: { file: "packages/render/src/hull.ts", symbol: "OWN_SKIN", type: "HullSkin" },
        fields: { rim },
      }),
    ],
  };
}

const DEEP = bulb("deep", "six deeper lobes and a slower, wider sway", 6, 0.19);
const FINE = bulb("fine", "twelve shallow lobes, the pump doubled", 12, 0.05);
const WARM = hull("warm", "#FFAE3D");
const COOL = hull("cool", "#3DE0FF");

function vote(over: Partial<Vote> & Pick<Vote, "slot" | "candidates" | "won">): string {
  return votePrompt({
    current: over.won ? readCurrent(over.won) : [],
    why: "six deep lobes still read as lobes at 26 px; twelve fine ones did not",
    head: "2576c56abcdef",
    dirty: false,
    date: "2026-08-27",
    ...over,
  });
}

const adopt = vote({ slot: "creature:bulb", candidates: [DEEP, FINE], won: DEEP });
const keep = vote({ slot: "creature:bulb", candidates: [DEEP, FINE], won: null });
const adoptHull = vote({ slot: "ship:hull-skin", candidates: [WARM, COOL], won: WARM });

/** The header, then one entry per `**N.` step, so two forms can be compared step by step. */
function sections(text: string): Map<string, string> {
  const parts = text.split(/\n(?=\*\*\d\. )/);
  const out = new Map<string, string>([["head", parts[0] ?? ""]]);
  for (const p of parts.slice(1)) out.set(p.slice(2, 3), p);
  return out;
}

/**
 * Every line of `b`, in order, inside `a` — and back the lines of `a` that `b`
 * does not have. A difference nobody named shows up here as an extra line.
 */
function onlyIn(a: string, b: string): string[] {
  const want = b.split("\n");
  const extra: string[] = [];
  let i = 0;
  for (const line of a.split("\n")) {
    if (want[i] === line) i++;
    else extra.push(line);
  }
  expect(i).toBe(want.length);
  return extra;
}

const staged = (s: string): string[] =>
  s
    .split("\n")
    .filter((l) => l.startsWith("        ") && !l.trim().startsWith("bun ") && l.includes("/"))
    .map((l) => l.trim());

describe("the adopt form", () => {
  it("names the decision, the sha and the sentence a person typed", () => {
    expect(adopt).toContain("    slot    creature:bulb");
    expect(adopt).toContain('    won     deep  -  "six deeper lobes and a slower, wider sway"');
    expect(adopt).toContain('    lost    fine  -  "twelve shallow lobes, the pump doubled"');
    expect(adopt).toContain("    voted   2026-08-27, against 2576c56, tree clean");
    expect(adopt).toContain("six deep lobes still read as lobes at 26 px");
    expect(adopt).toContain("**1. ADOPT `deep`.**");
  });

  it("writes every field `old -> new`, and refuses rather than guesses", () => {
    expect(adopt).toContain("lobes   9    ->  6");
    expect(adopt).toContain("depth   0.1  ->  0.19");
    expect(adopt).toContain("value disagreed and what it says instead");
    expect(adopt).toContain("Do not work out which is newer");
  });

  it("takes the left-hand column from the reading, not from the record", () => {
    // The whole staleness guard rests on this. The values are read off the
    // live records at the moment of the vote and carried in the vote; if the
    // builder ever re-read them at paste time, a drifted record would be
    // reported as agreeing with itself and somebody's later edit would go.
    const drifted = vote({
      slot: "creature:bulb",
      candidates: [DEEP, FINE],
      won: DEEP,
      current: [{ depth: 0.1, lobes: 11 }, {}],
    });
    expect(drifted).toContain("lobes   11   ->  6");
    expect(drifted).not.toContain("lobes   9");
  });

  it("emits a grep for every patched symbol and predicts nothing about it", () => {
    expect(adopt).toContain('git grep -n "\\bBULB\\b" -- packages apps tools');
    expect(adopt).toContain('git grep -n "\\bSWAY_PUMP\\b" -- packages apps tools');
    // The one place proposal 3's prompt was wrong was a sentence claiming what
    // a grep would return, and it was wrong about five files.
    expect(adopt).not.toMatch(/nothing else (reads|refers to)/i);
  });

  it("deletes the whole slot by directory, and says what else to edit", () => {
    expect(adopt).toContain("git rm -r tools/versus/candidates/creature-bulb.deep");
    expect(adopt).toContain("git rm -r tools/versus/candidates/creature-bulb.fine");
    expect(adopt).toContain("not the one file you can see");
    expect(adopt).toContain("delete the two `import` lines that named");
    expect(adopt).toContain("`VARIANTS`");
  });

  it("says of a replacement function only what is true of it", () => {
    // `toString` hands back the transpiled body, not the file's spelling, so a
    // claim of byte-identity here would fail step 0 on whitespace — and a
    // refusal that fires on nothing teaches a session to ignore refusals.
    expect(adopt).toContain("`poseAt` is a function");
    expect(adopt).toContain("compare what it computes, not how it is spelled");
    expect(adopt).toContain("and it must compute exactly this instead:");
  });

  it("stages the files it changed, the registry, and the directories it removed", () => {
    expect(staged(sections(adopt).get("7") ?? "")).toEqual([
      "packages/content/src/silhouettes.ts",
      "packages/content/src/own-motion.ts",
      "tools/versus/candidates/index.ts",
      "tools/versus/candidates/creature-bulb.deep/     (deleted)",
      "tools/versus/candidates/creature-bulb.fine/     (deleted)",
      "tools/shape-sheet/shape-sheet.svg               (if step 3 rewrote it)",
      "tools/shape-sheet/motion-sheet.svg              (if step 3 rewrote it)",
    ]);
  });

  it("leaves no wrapper sentinel in the text", () => {
    for (const text of [adopt, keep, adoptHull]) expect(text).not.toContain(String.fromCharCode(1));
  });
});

describe("the keep form differs in five ways and no others", () => {
  const a = sections(adopt);
  const k = sections(keep);

  it("1 and 2 — the `won` row, and every candidate on a `lost` row", () => {
    expect(keep).toContain("    won     current  -  nothing changes in `packages/content`");
    expect(keep).toContain('    lost    deep  -  "six deeper lobes and a slower, wider sway"');
    expect(keep).toContain('    lost    fine  -  "twelve shallow lobes, the pump doubled"');
    const rows = (s: string) => s.split("\n").filter((l) => /^ {4}(won|lost) /.test(l));
    const strip = (s: string) => s.split("\n").filter((l) => !/^ {4}(won|lost) /.test(l));
    expect(strip(a.get("head") ?? "")).toEqual(strip(k.get("head") ?? ""));
    expect(rows(a.get("head") ?? "")).toHaveLength(2);
    expect(rows(k.get("head") ?? "")).toHaveLength(3);
  });

  it("3 — steps 1, 2 and 3 are gone, and so is step 6's `shapes:report`", () => {
    for (const step of ["1", "2", "3"]) {
      expect(a.has(step)).toBe(true);
      expect(k.has(step)).toBe(false);
    }
    expect(keep).not.toContain("bun run shapes");
    expect(keep).toContain("bun run check");
    // Everything else in step 6 survives word for word; the extra lines in the
    // adopt form are all and only the ones about the shape sheet.
    for (const extra of onlyIn(a.get("6") ?? "", k.get("6") ?? "")) {
      if (extra.trim()) expect(extra).toMatch(/shapes|step 1|measurable|exit 0/);
    }
  });

  it("4 — step 7 stages only the registry and the directories it removed", () => {
    expect(staged(k.get("7") ?? "")).toEqual([
      "tools/versus/candidates/index.ts",
      "tools/versus/candidates/creature-bulb.deep/     (deleted)",
      "tools/versus/candidates/creature-bulb.fine/     (deleted)",
    ]);
    const subject = "The subject is a sentence in this history's voice.";
    expect(a.get("7")).toContain(subject);
    expect(k.get("7")).toContain(subject);
  });

  it("5 — the field reading is never named, and a keep names no reader at all", () => {
    expect(adopt).toContain("Do not name how the bulb reads on the field");
    expect(adopt).toContain("each reader");
    expect(adopt).toContain("The vote is the record, and nothing is left waiting on it.");
    expect(keep).toContain("Readers. Name none.");
    expect(keep).not.toContain("Do write exactly one");
  });

  it("steps 0, 4 and 5 are word for word the same", () => {
    for (const step of ["0", "4", "5"]) expect(k.get(step)).toBe(a.get(step));
  });
});

describe("what the patched files decide", () => {
  it("a content-targeting patch carries the shape sheet; a render-targeting one does not", () => {
    // `tools/shape-sheet/shape-sheet.svg` is committed and derived from the
    // records step 1 changes, and nothing in `bun run check` would notice it
    // becoming a lie. Nothing under `packages/render` feeds it.
    expect(adopt).toContain("**3. REGENERATE WHAT IS DERIVED FROM THEM.**");
    expect(adopt).toContain("bun run shapes");
    expect(adopt).toContain("tools/shape-sheet/motion-sheet.svg");
    expect(adoptHull).not.toContain("**3.");
    expect(adoptHull).not.toContain("shape-sheet");
    expect(adoptHull).not.toContain("bun run shapes");
    expect(adoptHull).toContain("bun run check");
  });

  it("a one-file, one-record slot reads as one and not as `1`", () => {
    expect(adoptHull).toContain("**1. ADOPT `warm`.** One file, under `packages/render/src`");
    expect(adoptHull).toContain('git grep -n "\\bOWN_SKIN\\b" -- packages apps tools');
    expect(adoptHull).toContain('rim   "#FF6FE4"  ->  "#FFAE3D"');
  });

  it("names the packages the slot actually touches", () => {
    expect(keep).toContain("nothing changes in `packages/content`");
    expect(vote({ slot: "ship:hull-skin", candidates: [WARM, COOL], won: null })).toContain(
      "nothing changes in `packages/render`",
    );
  });
});

describe("the simulation is not votable", () => {
  it("no emitted prompt asks for a change under `packages/sim`", () => {
    for (const text of [adopt, keep, adoptHull]) {
      const hits = text.split("\n").filter((l) => l.includes("packages/sim"));
      // Exactly one, and it is the prohibition. Never a path in step 1's
      // changes, step 4's `git rm`, or step 7's staging list.
      expect(hits).toHaveLength(1);
      expect(hits[0]).toContain("Do not touch `packages/sim`");
    }
  });

  it("refuses to build a prompt for a patch that lives there", () => {
    const bad: Variant = {
      slot: "sim:speed",
      name: "fast",
      sentence: "everything a third quicker",
      dir: "tools/versus/candidates/sim-speed.fast",
      patches: [
        patch({
          target: { tickHz: 60 },
          reached: () => ({}),
          where: { file: "packages/sim/src/config.ts", symbol: "DEFAULT_CONFIG" },
          fields: { tickHz: 80 },
        }),
      ],
    };
    expect(() => vote({ slot: "sim:speed", candidates: [bad], won: bad })).toThrow(/not votable/);
  });
});

describe("what it will not build", () => {
  it("refuses a slot with nothing in it", () => {
    expect(() => vote({ slot: "creature:bulb", candidates: [], won: null })).toThrow(
      /no candidates/,
    );
  });

  it("refuses a winner from another slot", () => {
    expect(() => vote({ slot: "creature:bulb", candidates: [DEEP], won: WARM })).toThrow(
      /not a candidate/,
    );
  });

  it("refuses a reading that does not line up with the patches", () => {
    expect(() =>
      vote({ slot: "creature:bulb", candidates: [DEEP], won: DEEP, current: [{ lobes: 9 }] }),
    ).toThrow(/current readings/);
  });
});
