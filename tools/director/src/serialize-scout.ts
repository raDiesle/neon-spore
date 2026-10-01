import type { ScoutArena, ScoutHazard, ScoutPoint } from "@neon-spore/sim";

/**
 * A scout wave's arenas, written back into the file its list lives in.
 *
 * `scout-lists.ts` names the file — `scout-arenas.ts` for THE SCOUT,
 * `scout-haul-arenas.ts` for THE HAUL — in PINBALL's board file's
 * arrangement (`serialize-pinball.ts`), for its reason: the wave names the
 * list and the list is regenerated where it lives.
 *
 * **Only the array is replaced**, and everything above the marker is kept byte
 * for byte. **So is the comment over each level**, by its place in the list:
 * the first comment goes back over the first level, and a level added in the
 * editor has none until somebody writes one. By place rather than by content
 * because the comments are written by place — *Level two: …* — and a level's
 * content is exactly what the editor changes.
 *
 * The lines are Biome's own, so a save that changed nothing writes the file it
 * read (`wave-save.test.ts`): a list of places is laid out as Biome lays it
 * out (`list`), and a number over a thousand carries its
 * separator, as every number in the file was written.
 */

const WIDTH = 100;

/** `name` is the list's export — `SCOUT_ARENAS`, or another scout wave's (`scout-lists.ts`). */
export function serializeScoutArenas(
  source: string,
  arenas: readonly ScoutArena[],
  name = "SCOUT_ARENAS",
): string {
  const marker = `export const ${name}: ScoutArena[] = [`;
  const idx = source.indexOf(marker);
  if (idx === -1) throw new Error(`Could not find ${name} array in source`);
  const prefix = source.slice(0, idx + marker.length);
  const notes = levelComments(source.slice(idx + marker.length));
  const body = arenas.map((a, i) => [...(notes[i] ?? []), ...arena(a)].join("\n")).join("\n");
  return `${prefix}\n${body}\n];\n`;
}

/** The doc comment over each level in the array, in order, as its lines. */
export function levelComments(body: string): string[][] {
  const out: string[][] = [];
  let open: string[] | null = null;
  let pending: string[] = [];
  for (const line of body.split("\n")) {
    if (open !== null) {
      open.push(line);
      if (line.trim() === "*/") {
        pending = open;
        open = null;
      }
    } else if (line.startsWith("  /**")) {
      open = [line];
      if (line.trim().endsWith("*/")) {
        pending = open;
        open = null;
      }
    } else if (line === "  {") {
      out.push(pending);
      pending = [];
    }
  }
  return out;
}

function arena(a: ScoutArena): string[] {
  return [
    "  {",
    `    beats: ${a.beats},`,
    // Kept when an arena names one, so a level saved from the editor carries what it carried.
    ...(a.carry === undefined ? [] : [`    carry: ${a.carry},`]),
    ...list("motes", a.motes.map(point)),
    ...list("hazards", a.hazards.map(hazard)),
    "  },",
  ];
}

/**
 * One field of places: on one line when it is one place that fits, one to a
 * line otherwise — Biome breaks a list of two or more objects of several keys
 * however short it is, as Prettier does.
 */
function list(name: string, items: readonly string[]): string[] {
  const flat = `    ${name}: [${items.join(", ")}],`;
  if (items.length <= 1 && flat.length <= WIDTH) return [flat];
  return [`    ${name}: [`, ...items.map((item) => `      ${item},`), "    ],"];
}

function point(p: ScoutPoint): string {
  return `{ colMilli: ${milli(p.colMilli)}, rowMilli: ${milli(p.rowMilli)} }`;
}

function hazard(h: ScoutHazard): string {
  return (
    `{ colMilli: ${milli(h.colMilli)}, rowMilli: ${milli(h.rowMilli)}, ` +
    `vColMilli: ${milli(h.vColMilli)}, vRowMilli: ${milli(h.vRowMilli)} }`
  );
}

/** A number as the file writes one: `3_500`, `-2_600`, `500`. */
export function milli(n: number): string {
  const sign = n < 0 ? "-" : "";
  const digits = String(Math.abs(Math.round(n)));
  return sign + digits.replace(/\B(?=(\d{3})+(?!\d))/g, "_");
}
