import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG } from "@neon-spore/sim";
import { CREATURES, controlsForKinds } from "../src/creatures.js";
import {
  buildPods,
  buildQueue,
  controlSetForWave,
  firstOnPanel,
  groupsCoveredBy,
  mechanic,
  mechanicsInWave,
  queueFromWave,
  setHas,
  WAVES,
} from "../src/index.js";
import { DEMONSTRATIONS } from "../src/waves-demo.js";

const beatSeconds = 60 / DEFAULT_CONFIG.bpm;
const secondsToHull = DEFAULT_CONFIG.rows * beatSeconds;
/** The field waves are authored against, and what `queueFromWave` maps from. */
const AUTHORED_COLS = 7;

describe("wave content", () => {
  it("gives every creature at least 4 seconds from entry to impact", () => {
    // The hard constraint from docs/spec/latency.md: a full spoken exchange
    // takes 2.1-3.6 s. Anything that needs an announcement needs 4 s, ideally 5-6.
    expect(secondsToHull).toBeGreaterThanOrEqual(4);
  });

  /**
   * A wave is reached by name from four places — `Demonstration.wave`,
   * `wavesUsingSet`, and the tests that resolve one with
   * `WAVES.findIndex((w) => w.name === name)` — and none of them can tell a
   * second "THE WALL" from the first. Every one of those lookups would quietly
   * point at the earlier wave, so the duplicate would be a wave that exists,
   * is played, and is invisible to everything that names waves. The director
   * can rename a wave from its own screen, which is how one would arrive.
   */
  /**
   * The handle everything points at. A name may be rewritten from the
   * director's own screen; an id may not, which is the whole reason it exists
   * — so two waves sharing one would make every pointer ambiguous in exactly
   * the way a duplicate name does, with nothing to notice it.
   */
  it("gives every wave an id of its own, which nothing renames", () => {
    const seen = new Map<string, number>();
    for (const [i, wave] of WAVES.entries()) {
      expect(wave.id, `wave ${i} (${wave.name}) has no id`).toMatch(/\S/);
      const first = seen.get(wave.id);
      expect(first, `wave ${i} repeats the id of wave ${first}: ${wave.id}`).toBeUndefined();
      seen.set(wave.id, i);
    }
  });

  it("gives every mechanic a demonstration that resolves", () => {
    for (const [mechanic, demo] of Object.entries(DEMONSTRATIONS)) {
      expect(
        WAVES.some((w) => w.id === demo.wave),
        `${mechanic} points at wave id "${demo.wave}", which is not in WAVES`,
      ).toBe(true);
    }
  });

  it("gives every wave a name of its own", () => {
    const seen = new Map<string, number>();
    for (const [i, wave] of WAVES.entries()) {
      const first = seen.get(wave.name);
      expect(first, `wave ${i} repeats the name of wave ${first}: ${wave.name}`).toBeUndefined();
      seen.set(wave.name, i);
    }
  });

  /**
   * `beat` is counted from the start of the wave, so a negative one asks for a
   * creature that entered before the wave did. Nothing rejects it: the queue
   * builder would simply spawn it on the first tick, a beat early and for a
   * reason nobody could read off the file.
   */
  it("counts every entry from the start of its wave, not before it", () => {
    for (const wave of WAVES) {
      for (const [i, entry] of wave.entries.entries()) {
        expect(
          entry.beat,
          `${wave.name} entry ${i} arrives at beat ${entry.beat}`,
        ).toBeGreaterThanOrEqual(0);
      }
      for (const [i, pod] of (wave.pods ?? []).entries()) {
        expect(
          pod.beat,
          `${wave.name} pod ${i} arrives at beat ${pod.beat}`,
        ).toBeGreaterThanOrEqual(0);
      }
    }
  });

  /**
   * A wave with no boss and no entries is a wave that opens, has nothing in
   * it, and ends — which reads as a hang rather than as a wave. Only a boss
   * wave may be empty, because three of the four bosses are the whole encounter
   * and their waves carry nothing else.
   */
  it("gives a wave without a boss something to send", () => {
    for (const wave of WAVES) {
      if (wave.boss) continue;
      expect(wave.entries.length, `${wave.name} has no boss and no entries`).toBeGreaterThan(0);
    }
  });

  /**
   * The union rule, which `CLAUDE.md` and `creatures-table.ts` both state and
   * nothing checked: **a wave shows the union of its creatures' control
   * groups**. A creature declares which of the two groups it demands
   * (`CreatureDef.controls`), a panel can answer some of them
   * (`groupsCoveredBy`), and a wave that puts a guard creature on a panel with
   * no shield on it is a creature the pair is shown and cannot answer.
   *
   * Both halves are *called* rather than spelled out here: a rule re-derived
   * inside a test is a second copy of the rule, and it drifts.
   */
  it("shows the controls its creatures demand", () => {
    for (const [i, wave] of WAVES.entries()) {
      const kinds = queueFromWave(wave, AUTHORED_COLS)
        .map((entry) => entry.kind)
        .filter((kind) => kind in CREATURES);
      const covered = groupsCoveredBy(controlSetForWave(i));
      for (const group of controlsForKinds(kinds)) {
        expect(
          covered,
          `${wave.name} sends something that demands ${group}, on a panel without it`,
        ).toContain(group);
      }
    }
  });

  /**
   * The other half of the union rule, and the one the ladder made necessary.
   *
   * `ControlGroup` is aim and guard, which is coarse enough that a panel with
   * one colour on it and a panel with both look identical to `groupsCoveredBy`
   * — both aim. STANDARD 1 has red and nothing else, and a cyan body authored
   * onto a wave played on it is a body the pair is shown and cannot answer,
   * silently: the cannon goes under it, the shot they have is spent, and the
   * hull pays. So the colour is checked directly, off the same built queue.
   *
   * A lure's authored colour is the disguise's rather than the body's, which
   * is the right one to ask for here anyway: the disguise is what player 2 is
   * being invited to fire at.
   */
  it("only sends a colour the wave's own panel can fire", () => {
    for (const [i, wave] of WAVES.entries()) {
      const set = controlSetForWave(i);
      for (const entry of queueFromWave(wave, AUTHORED_COLS)) {
        if (entry.color === null) continue;
        const lobe = entry.color === "red" ? "fireRed" : "fireCyan";
        expect(
          setHas(set, lobe),
          `${wave.name} sends ${entry.color}, which ${set.name} cannot fire`,
        ).toBe(true);
      }
    }
  });

  it("passes the one-sentence test", () => {
    for (const wave of WAVES) {
      expect(wave.sentence, `${wave.name} has no one-sentence description`).toMatch(/\S/);
      expect(
        wave.sentence.split(".").length,
        `${wave.name}: more than one sentence`,
      ).toBeLessThanOrEqual(2);
    }
  });

  /**
   * A boss is not placed on a wave the way a rock is — she is the whole
   * wave — so a wave file that carries the same boss kind twice is not two
   * designs, it is one design duplicated by accident. This is the assertion
   * that survives a hand edit to a wave file; the director's boss panel no
   * longer offers to add or remove a boss, and its wave list refuses to
   * delete or duplicate a boss wave, but neither of those stops somebody
   * editing `waves.ts` by hand.
   */
  it("gives every boss kind at most one wave", () => {
    const seen = new Map<string, string>();
    for (const wave of WAVES) {
      if (!wave.boss) continue;
      const owner = seen.get(wave.boss.kind);
      expect(owner, `${wave.boss.kind} is on both ${owner} and ${wave.name}`).toBeUndefined();
      seen.set(wave.boss.kind, wave.name);
    }
  });

  /**
   * The guarantee that replaced the derivation. Help used to be a catalogue
   * beside the waves, keyed by subject, and the wave that raised each card was
   * computed by replaying the campaign; that could not go stale, and it also
   * could not say anything about the wave it appeared on. A guide lives in its
   * wave now (`docs/spec/briefings.md`), which means it *can* go stale in the
   * one way that matters — somebody ships a creature, gives it a wave, and
   * says nothing about it. This is the thing that catches them.
   *
   * The same computation the old lookup used, pointed at a different question:
   * not "where does this card go" but "did anybody write it". Run over the
   * whole list in order, because the first wave to carry something is a fact
   * about the order and not about any one wave.
   */
  it("gives the first wave that carries anything new a guide", () => {
    const seen = new Set<string>();
    for (const [i, wave] of WAVES.entries()) {
      const introduced: string[] = [];
      for (const id of mechanicsInWave(wave)) {
        // A `run` mechanic is on for the whole game or for none of it, so no
        // wave introduces one and no wave can be asked to teach it.
        if (mechanic(id).reach === "run") continue;
        if (seen.has(id)) continue;
        seen.add(id);
        introduced.push(id);
      }
      if (introduced.length === 0) continue;
      expect(
        wave.guide,
        `wave ${i + 1} · ${wave.name} is the first to carry ${introduced.join(", ")} and says nothing about it`,
      ).toBeDefined();
    }
  });

  /**
   * The same guarantee for the thing the pair holds rather than the thing
   * falling at them. A panel is as new as a creature the first time it is
   * played — more so on the standard ladder, where what arrives is a button
   * that was not there on the wave before and is not announced by anything on
   * the field. The owner asked for it in those words: a first-time
   * introduction not only for new enemies, but for control panels and for the
   * modifications of one.
   *
   * `firstOnPanel` is *called* rather than re-derived here, because the
   * director's rail asks the same question about a wave that is not on disk
   * yet and two spellings of "is this the first time" would drift.
   */
  it("gives the first wave played on a panel a guide that introduces it", () => {
    for (const [i, wave] of WAVES.entries()) {
      if (!firstOnPanel(WAVES, i)) continue;
      expect(
        wave.guide,
        `wave ${i + 1} · ${wave.name} is the first played on ${controlSetForWave(i).name} and says nothing about it`,
      ).toBeDefined();
    }
  });

  /**
   * The other half, and the reason the first half is not enough: a guide on a
   * wave that introduces nothing is padding, and padding a wave with a guide
   * is the same failure as padding it with entries. Both halves are also
   * written into `.claude/skills/new-wave`, where a session reads them.
   */
  it("gives a guide only to a wave that introduces something", () => {
    const seen = new Set<string>();
    for (const [i, wave] of WAVES.entries()) {
      let introduces = false;
      for (const id of mechanicsInWave(wave)) {
        if (mechanic(id).reach === "run") continue;
        if (seen.has(id)) continue;
        seen.add(id);
        introduces = true;
      }
      // A wave carrying a **rehearsal** is the exception, and there are two
      // reasons rather than one.
      //
      // Wave 1's guide is about the split itself — two screens, two halves of
      // one ship — which is not a creature and belongs to no wave's contents.
      //
      // THE HAND's is about a mechanic with `reach: "run"`. Those are on from
      // the first wave to the last and are carried by no wave's entries, so no
      // wave *introduces* one and the rule above can never ask for one to be
      // taught — and the grip is the assist the whole of wave 6 is built
      // around (docs/spec/assists.md names it as where it is taught). A film
      // is fifty lines of choreography and nobody writes one by accident, so
      // "this wave carries a scene" is a decision somebody made about where a
      // thing is taught, which is exactly what this test cannot see for
      // itself.
      // And a panel arriving is something introduced, by the test above. A
      // wave that hands the pair a button they have never had is a wave with
      // something to say whether or not anything new is falling at them.
      if (wave.guide?.scene !== undefined || introduces || firstOnPanel(WAVES, i)) continue;
      expect(
        wave.guide,
        `wave ${i + 1} · ${wave.name} carries a guide and introduces nothing`,
      ).toBeUndefined();
    }
  });

  it("writes all three halves of every guide it does carry", () => {
    for (const wave of WAVES) {
      if (!wave.guide) continue;
      for (const part of ["both", "p1", "p2"] as const) {
        expect(wave.guide[part], `${wave.name}: guide has no ${part}`).toMatch(/\S/);
      }
    }
  });

  it("authors every column against the 7-column field", () => {
    for (const wave of WAVES) {
      for (const e of wave.entries) {
        expect(e.col, `${wave.name} column out of range`).toBeGreaterThanOrEqual(0);
        expect(e.col, `${wave.name} column out of range`).toBeLessThanOrEqual(6);
      }
    }
  });

  it("authors every pod against the 7-column field, above the hull", () => {
    for (const wave of WAVES) {
      for (const p of wave.pods ?? []) {
        expect(p.col, `${wave.name} pod column out of range`).toBeGreaterThanOrEqual(0);
        expect(p.col, `${wave.name} pod column out of range`).toBeLessThanOrEqual(6);
        // A pod on the hull row would be swallowed or lost on the beat it
        // appeared, before anyone could shoot it loose.
        expect(p.row, `${wave.name} pod row out of range`).toBeGreaterThanOrEqual(0);
        expect(p.row, `${wave.name} pod row on or below the hull`).toBeLessThan(
          DEFAULT_CONFIG.rows - 1,
        );
      }
    }
  });

  it("builds the same pods every time, inside the field", () => {
    for (let i = 0; i < WAVES.length + 6; i++) {
      expect(buildPods(i, 11)).toEqual(buildPods(i, 11));
      for (const cols of [7, 11, 15]) {
        for (const p of buildPods(i, cols)) {
          expect(p.col).toBeGreaterThanOrEqual(0);
          expect(p.col).toBeLessThan(cols);
        }
      }
    }
  });

  it("builds the same queue every time", () => {
    for (let i = 0; i < WAVES.length + 5; i++) {
      expect(buildQueue(i, 11)).toEqual(buildQueue(i, 11));
    }
  });

  it("keeps remapped columns inside the field", () => {
    for (const cols of [7, 9, 11, 15]) {
      for (let i = 0; i < WAVES.length; i++) {
        for (const q of buildQueue(i, cols)) {
          expect(q.col).toBeGreaterThanOrEqual(0);
          expect(q.col).toBeLessThan(cols);
        }
      }
    }
  });
});

/**
 * **§1 of `docs/spec/briefings.md` names a wave by number, and nothing checked
 * it.** The right-hand column of that table is a record of where each teaching
 * block landed — `5 · THE ROCK`, `16 · BULB QUEEN` — and every wave inserted
 * before one of those rows moves all of them by one. It was already wrong
 * before anybody looked: the bosses row read `16–19, 23` while THE VANE had
 * been at 27 for some time, and the bestiary row named a range that reached
 * neither of the two waves its own subjects are taught on.
 *
 * The names are the handles a person reads, so the test keys on them and lets
 * the numbers be what it checks. **A row that names a range instead of its
 * waves fails**, because a range is a cell nothing can check and both of the
 * rows that had one had drifted inside it.
 */
describe("the briefings spec's wave numbers", () => {
  const BRIEFINGS = new URL("../../../docs/spec/briefings.md", import.meta.url);

  /** Each row of §1's table, with the `N · NAME` pairs its wave cell holds. */
  function rows(md: string): { row: string; waves: { wave: number; name: string }[] }[] {
    const from = md.indexOf("## 1 · What has to be taught");
    if (from === -1) throw new Error("briefings.md has no '## 1' section to read");
    const to = md.indexOf("\n## ", from + 1);
    const section = md.slice(from, to === -1 ? undefined : to);
    const out: { row: string; waves: { wave: number; name: string }[] }[] = [];
    for (const line of section.split("\n")) {
      const cells = line.split("|").map((c) => c.trim());
      // A table row of this table: leading empty cell, a block number, and the
      // wave column last. The header and the `|---|` separator have neither.
      if (cells.length < 3 || !/^\d+$/.test(cells[1] ?? "")) continue;
      const waves = [...(cells.at(-2) ?? "").matchAll(/(\d+)\s*·\s*([^,|]+)/g)].map(
        ([, n, name]) => ({
          wave: Number(n),
          name: (name ?? "").trim(),
        }),
      );
      out.push({ row: cells[2] ?? line, waves });
    }
    return out;
  }

  it("reads the table, so a reformatted one cannot pass vacuously", async () => {
    expect(rows(await Bun.file(BRIEFINGS).text()).length).toBeGreaterThanOrEqual(8);
  });

  it("names waves in every row, never a range", async () => {
    for (const { row, waves } of rows(await Bun.file(BRIEFINGS).text())) {
      expect(
        waves.length,
        `briefings.md §1 ${row} names no wave — a range cannot be checked`,
      ).toBeGreaterThan(0);
    }
  });

  it("points every named wave at the wave that carries that name", async () => {
    for (const { row, waves } of rows(await Bun.file(BRIEFINGS).text())) {
      for (const { wave, name } of waves) {
        expect(WAVES[wave - 1]?.name, `briefings.md §1 ${row} says ${wave} · ${name}`).toBe(name);
      }
    }
  });
});
