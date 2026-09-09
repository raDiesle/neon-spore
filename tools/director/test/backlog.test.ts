import { describe, expect, test } from "bun:test";
import { type Backlog, type BacklogGroup, buildBacklog } from "../src/backlog.js";

const ROOT = new URL("../../../", import.meta.url);
const read = (rel: string) => Bun.file(Bun.fileURLToPath(new URL(rel, ROOT))).text();

async function realBacklog(): Promise<Backlog> {
  return buildBacklog(
    await read("docs/spec/bestiary.md"),
    await read("docs/spec/bosses.md"),
    await read("docs/spec/couplings.md"),
    await read("docs/spec/assists.md"),
    await read("docs/spec/systems.md"),
    await read("docs/spec/ideas.md"),
  );
}

const names = (groups: BacklogGroup[]): string[] =>
  groups.flatMap((g) => g.entries.map((e) => e.name));

/** One group of a page, by its heading — the rounds share the boss page. */
const group = (groups: BacklogGroup[], title: string): BacklogGroup => {
  const found = groups.find((g) => g.title === title);
  if (!found) throw new Error(`no group titled ${title}`);
  return found;
};

describe("buildBacklog", () => {
  test("a built thing is not backlog, and the count of what was hidden is kept", async () => {
    const backlog = await realBacklog();

    // The three that exist carry the teaching waves; the page is about the rest.
    expect(names(backlog.bestiary)).not.toContain("Slick");
    expect(names(backlog.bestiary)).not.toContain("Bulb");
    expect(names(backlog.bestiary)).not.toContain("Meteor");
    expect(names(backlog.bestiary)).not.toContain("Dart");
    expect(names(backlog.bestiary)).not.toContain("Veil");
    expect(names(backlog.bestiary)).not.toContain("Strand");
    expect(names(backlog.bestiary)).toContain("Crystal");

    const thirteen = backlog.bestiary[0]!;
    // Slick, bulb, meteor, lure, throb, dart, veil and strand — the five of
    // the first thirteen built after the original three, and the three
    // themselves — plus the pod, which is built and is deliberately not a
    // `CreatureKind`, so `isBuilt` has to know about `POD_KINDS` to see it.
    expect(thirteen.builtHidden).toBe(9);
    expect(thirteen.entries.length + thirteen.builtHidden).toBe(13);

    expect(names(backlog.bosses)).not.toContain("Bulb Queen");
    expect(names(backlog.bosses)).not.toContain("The Mirror");
    expect(names(backlog.bosses)).toContain("The Vessel");
  });

  test("a built coupling drops out, a partly built system does not", async () => {
    const backlog = await realBacklog();
    const mechanics = names(backlog.mechanics);

    // Warding and marking are in the game; announcing is the work left.
    expect(mechanics).not.toContain("Warding");
    expect(mechanics).not.toContain("Marking");
    expect(mechanics).toContain("Announcing");

    // "partly built" is work with a half still missing, and the badge says which.
    const partly = backlog.mechanics
      .flatMap((g) => g.entries)
      .filter((e) => e.kind.includes("partly"));
    expect(partly.length).toBeGreaterThan(0);

    // The spec does not spell the tail the same way twice. These two are in
    // the game and say so as "keep watch, built" and "the pod, built".
    expect(mechanics).not.toContain("THE GRIP");
    expect(mechanics).not.toContain("Power-ups");
  });

  test("a lead line is prose, never a flattened bullet list", async () => {
    const backlog = await realBacklog();
    for (const entry of Object.values(backlog)
      .flat()
      .flatMap((g) => g.entries)) {
      expect({ name: entry.name, runOn: entry.note.includes(" - ") }).toEqual({
        name: entry.name,
        runOn: false,
      });
    }
  });

  test("an idea lands in the section its spec heading puts it under", async () => {
    const backlog = await realBacklog();

    expect(names(backlog.bestiary)).toContain("Prism");
    expect(names(backlog.bestiary)).toContain("Wave gate");
    expect(names(backlog.mechanics)).toContain("Reverse wave");
    // The controls read on down the mechanics page rather than having one of
    // their own — a control is a rule that happens to live in a hand.
    expect(names(backlog.mechanics)).toContain("Inverted instructions");

    // A round that is not the field is none of the three above: it has no
    // silhouette, it is not a rule the field plays by, and it does not change
    // what a hand does on a wave. Before this group existed the whole heading
    // was parsed and then dropped, which is the failure a spec-derived page is
    // supposed to make impossible.
    // The rounds read on down the boss page, under their own heading.
    expect(names(backlog.bosses)).toContain("THE LATHE");
    expect(names(backlog.bosses)).toContain("THE VAULT");

    // THE GAUGE, SNAKE and THE CLAW are all out of the list, and none of them
    // is counted as hidden: their bullets were cut from `docs/spec/ideas.md`
    // once they existed, because an entry describing a shipped round in the
    // future tense is a page that lies to whoever reads it next. THE GAUGE and
    // SNAKE are written up in `docs/spec/interludes.md` instead; THE CLAW was
    // built as a control set and is in `docs/spec/controls.md`.
    //
    // `dropBuilt` is the belt beside that brace and stays: it hides a round by
    // name off `BOSS_KINDS` whether or not anybody remembered to cut the
    // bullet, so the count going to nought is what a tidy page looks like
    // rather than a guard being removed.
    expect(names(backlog.bosses)).not.toContain("THE GAUGE");
    expect(names(backlog.bosses)).not.toContain("SNAKE");
    expect(names(backlog.bosses)).not.toContain("THE CLAW");
    expect(group(backlog.bosses, "ROUND IDEAS").builtHidden).toBe(0);

    // A boss idea sits with the act order rather than among the creatures:
    // it is a whole encounter waiting for a slot, not a thing that falls.
    expect(names(backlog.bosses)).toContain("THE CODEX");
    expect(names(backlog.bestiary)).not.toContain("THE CODEX");

    // THE CHOIR is off the page entirely, and it left the way THE GAUGE and
    // SNAKE did: its bullet was cut once the thing existed, because an entry
    // describing something shipped in the future tense is a page that lies to
    // whoever reads it next. It is a creature now rather than the boss the
    // bullet imagined — two bodies in a membrane, opened by shaking the phone
    // — and it is in the bestiary like any other arrival. The act-40 slot
    // still carries the name for a boss built on it later.
    expect(names(backlog.bosses)).not.toContain("THE CHOIR");
    expect(names(backlog.bestiary)).not.toContain("THE CHOIR");

    // And in exactly one of them — a name in two sections is a name that gets
    // worked on twice.
    const everywhere = [
      ...names(backlog.bestiary),
      ...names(backlog.mechanics),
      ...names([group(backlog.bosses, "ROUND IDEAS")]),
    ];
    expect(new Set(everywhere).size).toBe(everywhere.length);
  });

  test("every group is populated, so a heading renamed in the spec is caught", async () => {
    const backlog = await realBacklog();
    for (const groups of Object.values(backlog)) {
      for (const group of groups as BacklogGroup[]) {
        expect({ title: group.title, entries: group.entries.length > 0 }).toEqual({
          title: group.title,
          entries: true,
        });
      }
    }
  });
});
