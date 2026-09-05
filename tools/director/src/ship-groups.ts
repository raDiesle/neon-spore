/**
 * The cards the SHIP tab is divided into: their names, the order they are read
 * in, and the paragraph under each heading that says what the group *is*.
 *
 * Split out of `ship-fields.ts` when THE VEIL took that file past its 250-line
 * limit, along the seam the file already had in it. What stayed next door is
 * the exhaustive `Record<keyof SimConfig, GroupName>` — the machinery, and the
 * reason the whole arrangement exists: a field added to `SimConfig` and left
 * out of it is a compile error rather than a mechanic that landed invisible.
 * This is the other half, and it is the half that *grows*: every mechanic with
 * a dial of its own arrives here as one name and one paragraph, and nobody
 * reads it top to bottom. The same split `mechanics.ts` and
 * `mechanics-table.ts` already use, for the same reason.
 *
 * Every name is re-exported from `ship-fields.ts`, so nothing that already
 * reaches for one through that file had to move.
 */
export type GroupName =
  | "AIM — colour and column"
  | "GUARD — the shared defence"
  | "MAW — taking a pod in"
  | "POD — shot loose, then caught"
  | "LANCE — a column marked, then spent"
  | "GRIP — a hand on the field"
  | "HULL — damage and repair"
  | "RADAR — what is coming"
  | "THE BEAT"
  | "OPENING — the introduction, the guide and the ready gate"
  | "THE GAUGE — a round with no field in it"
  | "SNAKE — a round the ship is the body of"
  | "PINBALL — a table the ship is the bucket of"
  | "THROB — half a colour, half plating, turning"
  | "THE LURE — a body only one of you can see through"
  | "THE VEIL — a cloud only one of you can see into"
  | "THE WISP — a body only one of you can see at all"
  | "THE GHOST — a body with no column on one screen"
  | "THE ECHO — one body that becomes eight"
  | "THE RIND — one body, three sizes"
  | "THE RECOIL — a shot that sends it the wrong way"
  | "THE CAROM — a rock with something alive in it"
  | "THE VOLLEY — a rock you have to hit back three times"
  | "THE VEER — a rock that changes lane on the way down"
  | "THE STRAND — beads on a thread, shot in order"
  | "THE GYRE — six bodies on a turning rim"
  | "THE LID — an armoured eye held open by a hand"
  | "SCORE"
  | "WARDEN"
  | "VANE"
  | "MIRROR"
  | "MAZE"
  | "QUEEN"
  | "THE FLEET — a chart only one of you can read"
  | "PLUMBING — not a dial a person turns";

/** Display order. Read top to bottom the way the old, shorter list did. */
export const GROUP_ORDER: GroupName[] = [
  "AIM — colour and column",
  "GUARD — the shared defence",
  "MAW — taking a pod in",
  "POD — shot loose, then caught",
  "LANCE — a column marked, then spent",
  "GRIP — a hand on the field",
  "HULL — damage and repair",
  "RADAR — what is coming",
  "THE BEAT",
  "OPENING — the introduction, the guide and the ready gate",
  "THE GAUGE — a round with no field in it",
  "SNAKE — a round the ship is the body of",
  "PINBALL — a table the ship is the bucket of",
  "THROB — half a colour, half plating, turning",
  "THE LURE — a body only one of you can see through",
  "THE VEIL — a cloud only one of you can see into",
  "THE WISP — a body only one of you can see at all",
  "THE GHOST — a body with no column on one screen",
  "THE ECHO — one body that becomes eight",
  "THE RIND — one body, three sizes",
  "THE RECOIL — a shot that sends it the wrong way",
  "THE CAROM — a rock with something alive in it",
  "THE VOLLEY — a rock you have to hit back three times",
  "THE VEER — a rock that changes lane on the way down",
  "THE STRAND — beads on a thread, shot in order",
  "THE GYRE — six bodies on a turning rim",
  "THE LID — an armoured eye held open by a hand",
  "SCORE",
  "WARDEN",
  "VANE",
  "MIRROR",
  "MAZE",
  "QUEEN",
  "THE FLEET — a chart only one of you can read",
  "PLUMBING — not a dial a person turns",
];
// The paragraph under each heading is `ship-notes.ts` next door — the half of
// this file that grows by a mechanic, cut out when THE CAROM took it over the
// limit. Re-exported here so nothing that already reaches for it had to move.
export { GROUP_NOTE } from "./ship-notes.js";

/**
 * Groups that describe the wave in front of you rather than the ship — the
 * four boss groups above, plus THE GAUGE, which only matters in a gap that
 * carries one. Every other group is the same ship on every wave; `SHIP_GROUPS`
 * below is the complement, so a group added to `GROUP_ORDER` and left off this
 * set defaults to the ship sheet rather than vanishing — the "show everything"
 * escape hatch the brief asks for is this default, not a separate view.
 */
export const WAVE_ONLY_GROUPS: ReadonlySet<GroupName> = new Set([
  "WARDEN",
  "VANE",
  "MIRROR",
  "MAZE",
  "QUEEN",
  "THE GAUGE — a round with no field in it",
  "THE FLEET — a chart only one of you can read",
  "SNAKE — a round the ship is the body of",
  "PINBALL — a table the ship is the bucket of",
]);

/** The ship's own dials — the same on every wave, and one click away on the topbar. */
export const SHIP_GROUPS: GroupName[] = GROUP_ORDER.filter((g) => !WAVE_ONLY_GROUPS.has(g));
