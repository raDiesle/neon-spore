import { DUTY_WORD, TALKER } from "@neon-spore/render";
import type { CreatureKind } from "@neon-spore/sim";
import type { HelperGroup } from "./helpers-def.js";
import { SIREN_ON, STRIP_BUSY } from "./helpers-poses.js";

/**
 * CONTROLS › HELPERS, after THE SHIELD: **THE SIREN**, the one picture every
 * split in the game says itself through. The owner, 14 October 2026: *siren
 * is kind of an additional helper tool how to visualize any kind of
 * situations … to tell players what to do.* So it stands on a heading of its own,
 * and under it the roster of what lights it — read off the renderer's own
 * tables (`comms-talker.ts`, `duty-words.ts`) rather than copied, so a
 * creature given a row there is on this page the same day.
 */

export const SIREN_GROUP: HelperGroup = {
  title: "THE SIREN — ONE LAMP FOR EVERY CALL",
  sub:
    "not a helper for one body but the one place every split says itself: " +
    "whenever one screen has what the other has not, it lights, names the seat " +
    "that must speak and gives each seat its job",
  table: sirenRosterTable,
  rows: [
    {
      name: "THE SIREN",
      where:
        "top centre of the field, while anything on it needs a call — top right when a boss holds the middle",
      seat: "BOTH — a chip each side names the seat and what that seat has to do",
      says:
        "Someone has to speak, and whose turn it is. It replaced five private " +
        "marks over five creatures: the pair learns one place to look, and it " +
        "never moves, because the answer — talk — is the same wherever the body is. " +
        "Everything in the roster below lights it.",
      source: "siren.ts, siren-dial.ts, siren-seats.ts — the roster is comms.ts, duty.ts",
      pose: SIREN_ON,
      role: "p2",
      lookAt: "the lit dial at the top and the two chips either side of it",
    },
    {
      name: "THE STRIP AND ITS BLIPS",
      where: "the warning strip along the top, before a body reaches the field",
      seat: "per creature — a torch is on player 1's strip and nobody else's",
      says:
        "What is coming and in which column. An eye over a blip says this one " +
        "will light the siren when it lands. The seat without the blip has to be told.",
      source: "radar-blip.ts, field.ts (drawRadar), comms-glyphs.ts",
      pose: STRIP_BUSY,
      role: "test",
      lookAt: "the blips along the top strip, and the eye over the one that needs a call",
    },
  ],
};

/** One line of the roster: what lights the siren, who speaks, each chip's word. */
export interface RosterLine {
  what: string;
  speaks: string;
  p1: string;
  p2: string;
}

const SPEAKS = { p1: "P1", p2: "P2", both: "BOTH" } as const;

/** The bosses whose split is the whole fight light it for themselves
 * (`comms-boss.ts`, `comms-mimic.ts`): no creature, so no row in `TALKER`. */
const BOSS_LINES: readonly RosterLine[] = [
  {
    what: "THE ANTIPHON",
    speaks: "the seat shown the organ — swaps every level",
    p1: "EXPLAIN SHAPE / CHOOSE SHAPE",
    p2: "CHOOSE SHAPE / EXPLAIN SHAPE",
  },
  {
    what: "THE FLUE",
    speaks: "the panel shown the ember — swaps every other level",
    p1: "SAY WHEN TO SHOOT",
    p2: "SHOOT WHEN TOLD",
  },
  {
    what: "THE MIMIC",
    speaks: "the seat shown the picture — BOTH on a split",
    p1: "TILES · TELL P2 WHERE / TAP WHERE P2 SAYS",
    p2: "TILES · TELL P1 WHERE / TAP WHERE P1 SAYS",
  },
];

/** Every creature that lights the siren, then every boss that lights it itself. */
export function sirenRoster(): RosterLine[] {
  const lines: RosterLine[] = [];
  for (const [kind, talker] of Object.entries(TALKER) as [
    CreatureKind,
    keyof typeof SPEAKS | null,
  ][]) {
    if (talker === null) continue;
    const words: { p1?: string; p2?: string } | null = DUTY_WORD[kind as keyof typeof DUTY_WORD];
    lines.push({
      what: `THE ${kind.toUpperCase()}`,
      speaks: SPEAKS[talker],
      p1: words?.p1 ?? "—",
      p2: words?.p2 ?? "—",
    });
  }
  return [...lines, ...BOSS_LINES];
}

/** The roster drawn as a table, under THE SIREN's heading. */
export function sirenRosterTable(): HTMLElement {
  const table = document.createElement("table");
  table.className = "siren-roster";
  const row = (cells: string[], tag: "th" | "td"): void => {
    const tr = document.createElement("tr");
    for (const c of cells) {
      const cell = document.createElement(tag);
      cell.textContent = c;
      tr.appendChild(cell);
    }
    table.appendChild(tr);
  };
  row(["LIGHTS IT", "WHO SPEAKS", "P1'S CHIP", "P2'S CHIP"], "th");
  for (const l of sirenRoster()) row([l.what, l.speaks, l.p1, l.p2], "td");
  return table;
}
