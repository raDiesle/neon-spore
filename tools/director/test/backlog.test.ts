import { describe, expect, test } from "bun:test";
import { type Backlog, type BacklogGroup, buildBacklog } from "../src/backlog.js";

const ROOT = new URL("../../../", import.meta.url);
const read = (rel: string) => Bun.file(Bun.fileURLToPath(new URL(rel, ROOT))).text();

async function realBacklog(): Promise<Backlog> {
  return buildBacklog(await read("docs/spec/systems.md"), await read("docs/spec/ideas.md"));
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
  test("a built thing is not backlog, and no page holds one", async () => {
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
      // Built on 16 September 2026, and off the page the same day.
      "Mine",
      "Moulting",
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

  test("the page is the shortlist the owner named, spelled the spec's way", async () => {
    const backlog = await realBacklog();

    // The one test that catches a rename. `backlog.ts` keeps these four by
    // name rather than deriving them, so a heading edited in `systems.md` or
    // a bullet edited in `ideas.md` empties a column silently — unless this
    // fails first. It is one of the five places a new concept has to reach,
    // and `concept-places.test.ts` names all five in one message. Exactly, not "contains": a fifth appearing unasked is the
    // page creeping back to what the owner cut it down from.
    expect(names([group(backlog.mechanics, "SYSTEMS")])).toEqual(["Destruction and damage"]);
    expect(names([group(backlog.mechanics, "CREATURE IDEAS")])).toEqual(["Husk"]);
  });

  test("the couplings and the assist forms are off the page entirely", async () => {
    const backlog = await realBacklog();
    const mechanics = names(backlog.mechanics);

    // Both groups went on 16 September 2026, with the two spec files they were
    // read from: every section of either is built or half built, and a page
    // called NOT BUILT YET was carrying them. Announcing was the one coupling
    // with real work left and it is not here either — the owner's rule is the
    // page shows what has work *written down* for it.
    for (const gone of ["Warding", "Marking", "Announcing", "THE GRIP", "The three forms"]) {
      expect({ name: gone, on: mechanics.includes(gone) }).toEqual({ name: gone, on: false });
    }
    expect(backlog.mechanics.map((g) => g.title)).not.toContain("COUPLINGS");
    expect(backlog.mechanics.map((g) => g.title)).not.toContain("ASSIST FORMS");
  });

  test("a half-built system shows what is missing and not what shipped", async () => {
    const backlog = await realBacklog();
    const damage = group(backlog.mechanics, "SYSTEMS").entries[0]!;

    // 5.6's closing paragraph names both halves in one breath. The page takes
    // the second: scars and craters are in the game, and NOT BUILT YET saying
    // so under that heading is the page describing the opposite of itself.
    expect(damage.kind).toBe("partly built");
    expect(damage.note).toStartWith("**Not built:**");
    expect(damage.note).toContain("splinters off the broken edge");
    expect(damage.note).not.toContain("scars on the hull");
    // And nothing behind the expander: the section whole is `systems.md`, and
    // this page is not where the built half is read.
    expect(damage.detail).toBe("");
    expect(damage.ref).toBe("systems.md 5.6");
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

    // The three idea groups that were not named on 16 September stay whole:
    // every mechanic, control and weapon idea the spec holds is on the page,
    // because every one of them is a thing the game does not do.
    //
    // *Reverse wave* used to be the first of these two, and it is gone because
    // it was **built** — the owner replaced its from-below design with THE
    // REPRISE on 16 September 2026 (`bosses.md` 11.15) and the bullet left
    // `ideas.md` the way the page's own preamble says an idea leaves it. An
    // idea that ships is exactly what should stop appearing here, so the
    // canary moved rather than the page.
    expect(names(backlog.mechanics)).toContain("Interference");
    expect(names(backlog.mechanics)).toContain("Inverted instructions");

    // The creature ideas are the cut group, and these two are the proof that
    // it is cut rather than emptied by a parse that stopped finding the
    // heading: they are in `ideas.md`, the shapes drawn at them are still on
    // GRAPHICS, and the page does not draw them.
    expect(names(backlog.mechanics)).not.toContain("Prism");
    expect(names(backlog.mechanics)).not.toContain("Wave gate");

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
        // A group with no entries is a heading the parser no longer finds, now
        // that nothing on this page is hidden for being built: the two cut
        // groups are checked by name above, and the rest are whole.
        const found = group.entries.length > 0;
        expect({ title: group.title, found }).toEqual({ title: group.title, found: true });
      }
    }
  });
});
