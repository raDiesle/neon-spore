import type { BossEntry } from "@neon-spore/sim";

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
 * **`BOSS_GROUP` is here too**, and it arrived with THE CLAW: the file next
 * door had run out of room, and a map from a boss kind to a group is a
 * statement about *groups* rather than about `SimConfig` fields, which is
 * everything that file is. It grows by a boss where `FIELD_GROUP` grows by a
 * mechanic, so the two were never going to fill up at the same rate.
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
  | "THE CLAW — the cannon replaced by an arm"
  | "HULL — damage and repair"
  | "RADAR — what is coming"
  | "THE BEAT"
  | "OPENING — the introduction, the guide and the ready gate"
  | "THE GAUGE — a round with no field in it"
  | "SNAKE — a round the ship is the body of"
  | "PINBALL — a table the ship's cannon fires up into"
  | "THE PULSE — the same song on two screens"
  | "THROB — red one side, cyan the other, turning"
  | "THE COUNT — open on zero, and only the pilot can count"
  | "THE LURE — a body only one of you can see through"
  | "THE VEIL — a cloud only one of you can see into"
  | "THE WISP — a body only one of you can see at all"
  | "THE GHOST — a body with no column on one screen"
  | "THE ECHO — one body that becomes eight"
  | "THE RIND — one body, three sizes"
  | "THE RECOIL — a shot that sends it the wrong way"
  | "THE CAROM — a rock with something alive in it"
  | "THE CRYSTAL — two bodies in one shell, broken at the middle"
  | "THE VOLLEY — a rock you have to hit back three times"
  | "THE FENCE — a live line with a way through it"
  | "THE VEER — a rock that changes lane on the way down"
  | "A CROSSING ROCK — a route any rock can be put on"
  | "THE STRAND — beads on a thread, shot in order"
  | "THE CRAWLER — a worm that walks the ship instead of falling"
  | "THE GYRE — six bodies on a turning rim"
  | "THE LID — an armoured eye held open by a hand"
  | "THE CHOIR — two bodies opened by shaking the phone"
  | "THE BEATBOX — a soundbox counted out on the beat"
  | "THE BALLOON — a body that goes up, opened by two hands at once"
  | "THE GUM — a mass stuck to the ship, swiped off by the seat without the cannon"
  | "THE CHOKE — a body on the cannon, tapped off by the seat whose cannon it was"
  | "THE LIMPET — a body on the plate that goes off if the plate stands still"
  | "THE LEECH — a body on the cannon that goes off if the cannon stands still"
  | "THE MALFUNCTION — a control that acts by itself"
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
  "THE CLAW — the cannon replaced by an arm",
  "HULL — damage and repair",
  "RADAR — what is coming",
  "THE BEAT",
  "OPENING — the introduction, the guide and the ready gate",
  "THE GAUGE — a round with no field in it",
  "SNAKE — a round the ship is the body of",
  "PINBALL — a table the ship's cannon fires up into",
  "THE PULSE — the same song on two screens",
  "THROB — red one side, cyan the other, turning",
  "THE COUNT — open on zero, and only the pilot can count",
  "THE LURE — a body only one of you can see through",
  "THE VEIL — a cloud only one of you can see into",
  "THE WISP — a body only one of you can see at all",
  "THE GHOST — a body with no column on one screen",
  "THE ECHO — one body that becomes eight",
  "THE RIND — one body, three sizes",
  "THE RECOIL — a shot that sends it the wrong way",
  "THE CAROM — a rock with something alive in it",
  "THE CRYSTAL — two bodies in one shell, broken at the middle",
  "THE VOLLEY — a rock you have to hit back three times",
  "THE FENCE — a live line with a way through it",
  "THE MALFUNCTION — a control that acts by itself",
  "THE VEER — a rock that changes lane on the way down",
  "A CROSSING ROCK — a route any rock can be put on",
  "THE STRAND — beads on a thread, shot in order",
  "THE CRAWLER — a worm that walks the ship instead of falling",
  "THE GYRE — six bodies on a turning rim",
  "THE LID — an armoured eye held open by a hand",
  "THE CHOIR — two bodies opened by shaking the phone",
  "THE BEATBOX — a soundbox counted out on the beat",
  "THE BALLOON — a body that goes up, opened by two hands at once",
  "THE GUM — a mass stuck to the ship, swiped off by the seat without the cannon",
  "THE CHOKE — a body on the cannon, tapped off by the seat whose cannon it was",
  "THE LIMPET — a body on the plate that goes off if the plate stands still",
  "THE LEECH — a body on the cannon that goes off if the cannon stands still",
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
  "PINBALL — a table the ship's cannon fires up into",
  "THE PULSE — the same song on two screens",
]);

/** The ship's own dials — the same on every wave, and one click away on the topbar. */
export const SHIP_GROUPS: GroupName[] = GROUP_ORDER.filter((g) => !WAVE_ONLY_GROUPS.has(g));

/**
 * The boss group each `BossEntry` kind shows — a wave that carries `warden`
 * shows WARDEN, and nothing else here changes because of it. `ship.ts` reads
 * this to decide what belongs beside the wave being edited rather than beside
 * the ship, which is the split the SHIP-column brief asked for.
 */
export const BOSS_GROUP: Record<BossEntry["kind"], GroupName> = {
  pinball: "PINBALL — a table the ship's cannon fires up into",
  pulse: "THE PULSE — the same song on two screens",
  queen: "QUEEN",
  warden: "WARDEN",
  mirror: "MIRROR",
  vane: "VANE",
  maze: "MAZE",
  gauge: "THE GAUGE — a round with no field in it",
  fleet: "THE FLEET — a chart only one of you can read",
  snake: "SNAKE — a round the ship is the body of",
};
