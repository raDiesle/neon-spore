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

describe("buildBacklog", () => {
  test("a built thing is not backlog, and the count of what was hidden is kept", async () => {
    const backlog = await realBacklog();

    // The three that exist carry the teaching waves; the page is about the rest.
    expect(names(backlog.bestiary)).not.toContain("Slick");
    expect(names(backlog.bestiary)).not.toContain("Bulb");
    expect(names(backlog.bestiary)).not.toContain("Meteor");
    expect(names(backlog.bestiary)).toContain("Dart");

    const thirteen = backlog.bestiary[0]!;
    expect(thirteen.builtHidden).toBe(3);
    expect(thirteen.entries.length + thirteen.builtHidden).toBe(13);

    expect(names(backlog.bosses)).not.toContain("Bulb Queen");
    expect(names(backlog.bosses)).not.toContain("The Mirror");
    expect(names(backlog.bosses)).toContain("The Vessel");
  });

  test("a built coupling drops out, a partly built system does not", async () => {
    const backlog = await realBacklog();
    const mechanics = names(backlog.mechanics);

    // Warding is in the game; marking and announcing are the work left.
    expect(mechanics).not.toContain("Warding");
    expect(mechanics).toContain("Marking");

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
    expect(names(backlog.controls)).toContain("Inverted instructions");

    // And in exactly one of them — a name in two sections is a name that gets
    // worked on twice.
    const everywhere = [
      ...names(backlog.bestiary),
      ...names(backlog.mechanics),
      ...names(backlog.controls),
    ];
    expect(new Set(everywhere).size).toBe(everywhere.length);
  });

  test("the parked section keeps both the deferred and the rejected", async () => {
    const backlog = await realBacklog();
    expect(names(backlog.parked)).toContain("Freighter");

    const rejected = backlog.parked.find((g) => g.title === "EXAMINED AND REJECTED");
    expect(rejected?.entries[0]?.detail).toContain("The Fogger");
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
