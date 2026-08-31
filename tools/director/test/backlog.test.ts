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
    [],
    [],
    // The real file, so the "every group is populated" guard below covers the
    // tab that was named after it and did not show it until somebody asked.
    await read("docs/parked.md"),
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
    expect(names(backlog.bestiary)).not.toContain("Dart");
    expect(names(backlog.bestiary)).toContain("Veil");

    const thirteen = backlog.bestiary[0]!;
    // Slick, bulb, meteor, lure, throb and dart — the three of the first
    // thirteen built after the original three, and the three themselves.
    expect(thirteen.builtHidden).toBe(6);
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
    expect(names(backlog.controls)).toContain("Inverted instructions");

    // A round that is not the field is none of the three above: it has no
    // silhouette, it is not a rule the field plays by, and it does not change
    // what a hand does on a wave. Before this group existed the whole heading
    // was parsed and then dropped, which is the failure a spec-derived page is
    // supposed to make impossible.
    expect(names(backlog.rounds)).toContain("THE LATHE");
    expect(names(backlog.rounds)).toContain("THE VAULT");

    // THE GAUGE is built — `packages/sim/src/gauge.ts`, and `BOSS_KINDS` now
    // carries it — and a built round leaves the backlog by being built, the
    // same way a creature or a boss does. It used to need a third table beside
    // those two, because a round was in neither of them; it does not any more.
    expect(names(backlog.rounds)).not.toContain("THE GAUGE");
    expect(backlog.rounds[0]!.builtHidden).toBe(1);

    // A boss idea sits with the act order rather than among the creatures:
    // it is a whole encounter waiting for a slot, not a thing that falls.
    expect(names(backlog.bosses)).toContain("THE CHOIR");
    expect(names(backlog.bestiary)).not.toContain("THE CHOIR");

    // And in exactly one of them — a name in two sections is a name that gets
    // worked on twice.
    const everywhere = [
      ...names(backlog.bestiary),
      ...names(backlog.mechanics),
      ...names(backlog.controls),
      ...names(backlog.rounds),
    ];
    expect(new Set(everywhere).size).toBe(everywhere.length);
  });

  test("the parked section keeps both the deferred and the rejected", async () => {
    const backlog = await realBacklog();
    expect(names(backlog.parked)).toContain("Freighter");

    const rejected = backlog.parked.find((g) => g.title === "EXAMINED AND REJECTED");
    expect(rejected?.entries[0]?.detail).toContain("The Fogger");
  });

  // The group used to say "not rejected, not queued" of a section that mostly
  // reads as refused — the owner's own word for it — with one entry, THE
  // CONDUCTOR, that genuinely is deferred rather than rejected. A reader has
  // to be able to tell those two apart, and tell both apart from something
  // nobody has looked at yet (PARKED BY A SESSION, above).
  test("a refused idea is not filed beside the one that was only deferred", async () => {
    const backlog = await realBacklog();
    const turnedDown = backlog.parked.find((g) => g.title === "IDEAS TURNED DOWN");
    const deferred = backlog.parked.find((g) => g.title === "DEFERRED, NOT REFUSED");

    expect(turnedDown?.entries.map((e) => e.name)).toContain("Freighter");
    expect(turnedDown?.entries.map((e) => e.name)).not.toContain(
      "THE CONDUCTOR, bending the tempo",
    );

    expect(deferred?.entries.map((e) => e.name)).toContain("THE CONDUCTOR, bending the tempo");
    expect(deferred?.entries.map((e) => e.name)).not.toContain("Freighter");
  });

  // The tab is called PARKED and showed the spec's deferrals and rejections,
  // which are a different thing wearing the same word — so what a session
  // actually parked was nowhere, and stayed nowhere until somebody asked.
  test("what a session parked is under the tab named after it", async () => {
    const backlog = await realBacklog();
    const mine = backlog.parked.find((g) => g.title === "PARKED BY A SESSION");
    expect(mine?.entries.length ?? 0).toBeGreaterThan(0);
    expect(mine?.entries.every((e) => e.name.length > 0)).toBe(true);
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
