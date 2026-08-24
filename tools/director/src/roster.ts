/**
 * Parses the bestiary and boss specs rather than holding a copy of the planned
 * creatures. A list kept beside the spec goes stale silently; the spec is where
 * names are argued about.
 */

import { CREATURES } from "@neon-spore/content";

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

export function parseRoster(bestiary: string, bosses: string): Roster {
  return {
    creatures: parseTable(bestiary, "first thirteen"),
    accepted: parseTable(bestiary, "Newly accepted"),
    bosses: parseBosses(bosses),
  };
}
