/**
 * Parses the bestiary and boss specs rather than holding a copy of the planned
 * creatures. A list kept beside the spec goes stale silently; the spec is where
 * names are argued about.
 */

import { CREATURES } from "@neon-spore/content";
import { firstParagraph, parseNumberedSections, type Section } from "./sections.js";

export interface Planned {
  name: string;
  /** "Form" for a creature, "Pillar" for an accepted one, "" for a boss. */
  kind: string;
  note: string;
  /** True when the simulation actually has it. */
  built: boolean;
}

export interface Roster {
  creatures: Planned[];
  accepted: Planned[];
  bosses: Planned[];
}

function isBuilt(name: string): boolean {
  const key = name.toLowerCase();
  return key in CREATURES;
}

function parseTable(text: string, headingEnd: string): Planned[] {
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
    rows.push({ name, kind, note, built: isBuilt(name) });
  }

  return rows;
}

function parseBosses(text: string): Planned[] {
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
    const kind = match[2]!.trim();
    bosses.push({ name, kind, note: "", built: isBuilt(name) });
  }

  return bosses;
}

/** "The Bulb Queen" and "Bulb Queen" name the same boss; strip the article to compare. */
function normalize(name: string): string {
  return name
    .toLowerCase()
    .replace(/^the\s+/, "")
    .trim();
}

/**
 * Only three of the eleven bosses (`docs/spec/bosses.md`) have a worked-out
 * section — the rest are names holding a slot. Where one exists its heading's
 * own tail ("armoured everywhere but the mark") is the fact that matters, so
 * it comes first; the opening paragraph is the fallback for a heading with
 * none, like The Vessel's.
 */
function detailFor(name: string, sections: Section[]): string {
  const section = sections.find((s) => normalize(s.title) === normalize(name));
  if (!section) return "";
  return section.tail || firstParagraph(section.lines);
}

export function parseRoster(bestiary: string, bosses: string): Roster {
  const sections = parseNumberedSections(bosses);
  return {
    creatures: parseTable(bestiary, "first thirteen"),
    accepted: parseTable(bestiary, "Newly accepted"),
    bosses: parseBosses(bosses).map((b) => ({ ...b, note: detailFor(b.name, sections) })),
  };
}
