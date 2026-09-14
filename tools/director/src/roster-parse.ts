import { CREATURES } from "@neon-spore/content";
import { BOSS_KINDS, POD_KINDS } from "@neon-spore/sim";
import type { Planned } from "./roster.js";

/**
 * The two shapes the roster is read off the spec in — a bestiary table and
 * the act order's one paragraph of "The Choir (40) · The Vessel (50)" — and
 * the question asked of every name in them, whether the simulation has it.
 *
 * Cut out of `roster.ts` because these are the lines of it that grow:
 * `isBuilt` gains a clause each time something ships that is in neither
 * table it reads, and a reader gains a rule each time the spec writes a slot
 * a new way. What is left next door is what a roster *is* and how a row gets
 * its prose.
 */

/**
 * Whether the simulation actually has this. A creature is looked up by its
 * own key; a boss by the last word of its name, because the spec calls her
 * "Bulb Queen" and the sim calls her `queen`, and it calls a round "THE GAUGE"
 * where the sim calls it `gauge` — the panel used to answer "not built" for a
 * boss that has been in the game since August. It once needed a third table
 * beside these two, because a round that was not the field was in neither; it
 * does not any more, and that is the whole of what `BOSS_KINDS` growing to six
 * bought this file.
 *
 * Exported because `backlog.ts` asks the same question of an idea's name that
 * this file asks of a bestiary row's — a built thing leaves every list it
 * appears on by being built, not by being told about a second time.
 */
export function isBuilt(name: string): boolean {
  const key = name.toLowerCase();
  if (key in CREATURES) return true;
  const last = key.split(/\s+/).at(-1) ?? "";
  // **The last word against the creatures too, and not only against the
  // bosses.** The act order in `bosses.md` names its slots the way a person
  // says them — "The Choir (40)" — and THE CHOIR is a creature now, so the
  // page went on listing a shipped body as something still to build. It is the
  // same allowance the line below already makes for "Bulb Queen", read one
  // table along: what a slot is called and what the simulation calls it differ
  // by the words a person puts in front.
  if (last in CREATURES) return true;
  // A pod is built and is deliberately not a `CreatureKind` — it carries no
  // colour and is never cleared, so it lives outside `CREATURES` entirely
  // (`docs/spec/systems.md` 5.7). It is in neither table this function reads,
  // and the backlog listed a shipped power-up as unbuilt until this line.
  if (POD_KINDS.some((pod) => pod === last) || last === "pod") return true;
  return BOSS_KINDS.some((kind) => kind === last);
}

export function parseTable(text: string, headingEnd: string, ref: string): Planned[] {
  const lines = text.split("\n");
  let foundHeading = false;
  let inTable = false;
  let headerSeen = false;
  const rows: Planned[] = [];

  for (const line of lines) {
    if (!foundHeading && line.includes(headingEnd)) {
      foundHeading = true;
      continue;
    }
    if (!foundHeading) continue;

    if (!inTable) {
      if (line.includes("|")) {
        inTable = true;
      }
    }

    if (!inTable) continue;
    if (line.trim() === "") break;
    if (!line.includes("|")) continue;

    const cells = line.split("|").map((c) => c.trim());
    if (cells.length < 4) continue;

    if (!headerSeen) {
      headerSeen = true;
      continue;
    }

    if (cells.every((c) => c === "" || /^-+$/.test(c))) continue;

    const nameCell = cells[1] ?? "";
    const name = nameCell.replace(/\*\*/g, "").trim();
    if (!name) continue;

    const kind = cells[2] ?? "";
    const note = cells[3] ?? "";
    rows.push({ name, kind, note, built: isBuilt(name), detail: "", ref, plain: [] });
  }

  return rows;
}

export function parseBosses(text: string): Planned[] {
  const lines = text.split("\n");
  const paragraphLines: string[] = [];
  let inParagraph = false;

  for (const line of lines) {
    if (line.includes("·")) {
      inParagraph = true;
      paragraphLines.push(line);
      continue;
    }
    if (inParagraph) {
      if (line.trim() === "") break;
      paragraphLines.push(line);
    }
  }

  if (paragraphLines.length === 0) return [];

  let bossLine = paragraphLines.join(" ");

  const colonIndex = bossLine.indexOf(":");
  if (colonIndex !== -1) {
    bossLine = bossLine.slice(colonIndex + 1).trim();
  }

  const parts = bossLine.split("·").map((p) => p.trim());
  const bosses: Planned[] = [];

  for (const part of parts) {
    const match = part.match(/^(.+?)\s*\(([^)]+)\)/);
    if (!match) continue;
    const name = match[1]!.trim();
    // "The Conductor (30, **THE VANE**)" — the act order writes the boss that
    // took a slot in bold, and a stamp is text rather than markdown.
    const kind = match[2]!.replace(/\*\*/g, "").trim();
    bosses.push({
      name,
      kind,
      note: "",
      built: isBuilt(name),
      detail: "",
      ref: "bosses.md",
      plain: [],
    });
  }

  return bosses;
}
