import { describe, expect, test } from "bun:test";
import { type Backlog, type BacklogGroup, buildBacklog } from "../src/backlog.js";

const ROOT = new URL("../../../", import.meta.url);
const read = (rel: string) => Bun.file(Bun.fileURLToPath(new URL(rel, ROOT))).text();

async function realBacklog(): Promise<Backlog> {
  return buildBacklog(
    await read("docs/spec/couplings.md"),
    await read("docs/spec/assists.md"),
    await read("docs/spec/systems.md"),
    await read("docs/spec/ideas.md"),
  );
}

const names = (groups: BacklogGroup[]): string[] =>
  groups.flatMap((g) => g.entries.map((e) => e.name));

/** One group of a page, by its heading. */
const group = (groups: BacklogGroup[], title: string): BacklogGroup => {
  const found = groups.find((g) => g.title === title);
  if (!found) throw new Error(`no group titled ${title}`);
  return found;
};

describe("buildBacklog", () => {
  test("a built thing is not backlog, and the count of what was hidden is kept", async () => {
    const backlog = await realBacklog();

    // Nothing built is on any page. The BESTIARY tab went on 11 September
    // 2026 once every row of bestiary.md 10.1 and 10.2 was built, and the
    // creature ideas read on the mechanics page; a built creature is in the
    // palette and nowhere here.
    const everything = Object.values(backlog).flatMap((gs) => names(gs as BacklogGroup[]));
    for (const built of [
      "Slick",
      "Bulb",
      "Meteor",
      "Dart",
      "Veil",
      "Strand",
      "Crystal",
      "Gum",
      "Choke",
    ])
      expect(everything).not.toContain(built);
    // Retired on 11 September 2026 (docs/decisions.md #28): the glyph, and
    // the nine idea rows of 10.2.
    expect(everything).not.toContain("Glyph");
    expect(everything).not.toContain("The Jammer");
    expect(backlog).not.toHaveProperty("bestiary");
    // And no BOSSES page at all since 16 September 2026, when the owner took
    // the tab off: THE ACT ORDER drew the built bosses straight off
    // `bosses.md` and the ideas beside it had gone the day before with THE
    // SPLICE. `bosses.md` is still parsed — by the two tests that hold a drawn
    // shape to the name it was drawn at — and nothing renders it.
    expect(backlog).not.toHaveProperty("bosses");
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

    // A creature idea reads on the mechanics page, in a group of its own,
    // since the BESTIARY tab went.
    const creatures = group(backlog.mechanics, "CREATURE IDEAS");
    expect(names([creatures])).toContain("Prism");
    expect(names([creatures])).toContain("Wave gate");
    expect(names(backlog.mechanics)).toContain("Reverse wave");
    // The controls read on down the mechanics page rather than having one of
    // their own — a control is a rule that happens to live in a hand.
    expect(names(backlog.mechanics)).toContain("Inverted instructions");

    // A round that is not the field is none of the three above: it has no
    // silhouette, it is not a rule the field plays by, and it does not change
    // what a hand does on a wave. It used to read on down the boss page under
    // its own heading, and since 16 September 2026 it is **not drawn at all**
    // — the owner took that page off and the `### Rounds` bullets stay in
    // `ideas.md` as text. So the rounds are on no page, and neither are the
    // boss ideas, which were cut from the spec itself the day before.
    for (const gone of ["THE LATHE", "THE VAULT", "THE TITHE", "THE WEIGHT"]) {
      expect(names(backlog.mechanics), gone).not.toContain(gone);
    }

    // THE CODEX is off the page as of 13 September 2026, and it left the way
    // THE CHOIR below did with one difference: THE CHOIR became a *creature*
    // where the bullet had imagined a boss, and this became a **fault on a
    // wave**. The owner asked for it that way, so what is built is the two
    // colours swapped for the navigator with nothing on that screen to say so
    // and the air going wrong on the pilot's (`sim/codex.ts`), and the bullet
    // went with the mechanic rather than staying to describe a body nobody is
    // going to build. The card drawn for that body is still on the shapes page,
    // set free (`shape-sheet/src/drafts/bosses.ts`).
    expect(names(backlog.mechanics)).not.toContain("THE CODEX");

    // THE CHOIR is off the page entirely, and it left the way THE GAUGE and
    // SNAKE did: its bullet was cut once the thing existed, because an entry
    // describing something shipped in the future tense is a page that lies to
    // whoever reads it next. It is a creature now rather than the boss the
    // bullet imagined — two bodies in a membrane, opened by shaking the phone
    // — and it is in the bestiary like any other arrival. The act-40 slot
    // still carries the name for a boss built on it later.
    expect(names(backlog.mechanics)).not.toContain("THE CHOIR");

    // And in exactly one of them — a name in two sections is a name that gets
    // worked on twice.
    const everywhere = names(backlog.mechanics);
    expect(new Set(everywhere).size).toBe(everywhere.length);
  });

  test("every group is populated, so a heading renamed in the spec is caught", async () => {
    const backlog = await realBacklog();
    for (const groups of Object.values(backlog)) {
      for (const group of groups as BacklogGroup[]) {
        // A group whose every row is built is populated — the page says
        // "nothing here — all of it is built" and counts them. A heading the
        // parser no longer finds is nothing at all: no rows and none hidden.
        const found = group.entries.length > 0 || group.builtHidden > 0;
        expect({ title: group.title, found }).toEqual({ title: group.title, found: true });
      }
    }
  });
});
