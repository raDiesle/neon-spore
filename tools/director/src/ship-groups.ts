import { WAVE_ONLY_GROUPS } from "./ship-groups-wave.js";

/**
 * The cards the ship's dials are divided into: their names, the order they are read
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
  | "THE CAIRN — a pile of rocks taken apart by hand"
  | "THE SCOUT — a little ship one of you flies"
  | "THE STARE — an eye that freezes whoever it looks at"
  | "THE BATON — a bead passed down an arm, one seat a beat"
  | "THE THROAT — the boss you answer by feeding it"
  | "THE UNDERTOW — the boss under the floor, answered downward"
  | "THE GORGE — the boss you hurt by not shooting"
  | "THE CURTAIN — the boss that is in the way"
  | "THE TASTER — the boss that grows its armour in the colour you have been spending"
  | "THE SINEW — the boss that asks how hard, not when"
  | "THE LEDGER — the boss that bills your own hull for every shot"
  | "THE SURGE — the boss beaten by letting go"
  | "THE LEAD — the boss you shoot where it will be"
  | "THE SCUTTLE — the boss that throws itself at you, a part at a time"
  | "THE ANTIPHON — the boss that grows a thing nobody has a word for"
  | "THE HIVE — the boss you seal, and every breach you have not sealed yet is spilling"
  | "THE INSTAR — the boss with no panel: its own body is marked where it will hurt you"
  | "THE NETTLE — a jellyfish marked for thumbs and for the panel: shoot it, shield it, suck it"
  | "THE FILAMENT — the boss whose line one of you draws while the other follows it"
  | "THE GIMBAL — the boss where the same turn is not the same turn"
  | "THE SPOOL — the boss where the line runs out at the speed one of you reads"
  | "THE HASP — the boss where one of you only has to hold on, and cannot"
  | "THE RATCHET — the boss where every step you take stays taken"
  | "THE MANTLE — the boss both hands have to pull at once, or neither counts"
  | "THE KEEL — the boss whose next joint is whichever thumb is nearer"
  | "THE VALVE — the boss one hand turns and the other hand stops"
  | "THE SEAM — the boss answered with the cannon and the shield, in order"
  | "THE OCULUS — the boss both hands hold shut, then shoot into"
  | "THE VISE — the boss two pinches crack, then shoot into"
  | "THE RIME — the boss two rubs wipe clear, then shoot into"
  | "THE TRIVET — the boss two chords plant, then shoot into"
  | "THE PLUMB — the boss two phones hold level, then shoot into"
  | "THE SLING — the boss two draws loose, then shoot into"
  | "THE GRINDSTONE — the boss two thumbs grind true, then shoot into"
  | "THE CYST — the boss one hand stills for the other to crack"
  | "THE DAVIT — the boss one hand steers for the other to loose"
  | "THE SPLICE — straws fed in the order the numbers say"
  | "THE REPRISE — the wave sent again unseen"
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
  | "THE MINE — a tile one of you says and the other has to find"
  | "THE MOULT — a rock and a cargo by turns, and the turn is the call"
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
  | "THE GUM — a drop either hand swipes out of the field"
  | "THE WEIGHT — a load only two thumbs at once take down"
  | "THE LIMPET — a body on the plate that goes off if the plate stands still"
  | "THE MALFUNCTION — a control that acts by itself"
  | "WARDEN"
  | "VANE"
  | "MIRROR"
  | "MAZE"
  | "QUEEN"
  | "THE FLEET — a chart only one of you can read"
  | "THE WELL — the field drawn inside out on one screen"
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
  "THE SCOUT — a little ship one of you flies",
  "THE STARE — an eye that freezes whoever it looks at",
  "THE BATON — a bead passed down an arm, one seat a beat",
  "THE THROAT — the boss you answer by feeding it",
  "THE UNDERTOW — the boss under the floor, answered downward",
  "THE GORGE — the boss you hurt by not shooting",
  "THE CURTAIN — the boss that is in the way",
  "THE TASTER — the boss that grows its armour in the colour you have been spending",
  "THE SINEW — the boss that asks how hard, not when",
  "THE LEDGER — the boss that bills your own hull for every shot",
  "THE SURGE — the boss beaten by letting go",
  "THE LEAD — the boss you shoot where it will be",
  "THE SCUTTLE — the boss that throws itself at you, a part at a time",
  "THE ANTIPHON — the boss that grows a thing nobody has a word for",
  "THE HIVE — the boss you seal, and every breach you have not sealed yet is spilling",
  "THE INSTAR — the boss with no panel: its own body is marked where it will hurt you",
  "THE NETTLE — a jellyfish marked for thumbs and for the panel: shoot it, shield it, suck it",
  "THE FILAMENT — the boss whose line one of you draws while the other follows it",
  "THE GIMBAL — the boss where the same turn is not the same turn",
  "THE SPOOL — the boss where the line runs out at the speed one of you reads",
  "THE HASP — the boss where one of you only has to hold on, and cannot",
  "THE RATCHET — the boss where every step you take stays taken",
  "THE MANTLE — the boss both hands have to pull at once, or neither counts",
  "THE KEEL — the boss whose next joint is whichever thumb is nearer",
  "THE VALVE — the boss one hand turns and the other hand stops",
  "THE SEAM — the boss answered with the cannon and the shield, in order",
  "THE OCULUS — the boss both hands hold shut, then shoot into",
  "THE VISE — the boss two pinches crack, then shoot into",
  "THE RIME — the boss two rubs wipe clear, then shoot into",
  "THE TRIVET — the boss two chords plant, then shoot into",
  "THE PLUMB — the boss two phones hold level, then shoot into",
  "THE SLING — the boss two draws loose, then shoot into",
  "THE GRINDSTONE — the boss two thumbs grind true, then shoot into",
  "THE CYST — the boss one hand stills for the other to crack",
  "THE DAVIT — the boss one hand steers for the other to loose",
  "PINBALL — a table the ship's cannon fires up into",
  "THE PULSE — the same song on two screens",
  "THROB — red one side, cyan the other, turning",
  "THE COUNT — open on zero, and only the pilot can count",
  "THE LURE — a body only one of you can see through",
  "THE VEIL — a cloud only one of you can see into",
  "THE WISP — a body only one of you can see at all",
  "THE MINE — a tile one of you says and the other has to find",
  "THE MOULT — a rock and a cargo by turns, and the turn is the call",
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
  "THE WEIGHT — a load only two thumbs at once take down",
  "THE GUM — a drop either hand swipes out of the field",
  "THE LIMPET — a body on the plate that goes off if the plate stands still",
  "WARDEN",
  "VANE",
  "MIRROR",
  "MAZE",
  "QUEEN",
  "THE CAIRN — a pile of rocks taken apart by hand",
  "THE FLEET — a chart only one of you can read",
  "THE WELL — the field drawn inside out on one screen",
  "THE SPLICE — straws fed in the order the numbers say",
  "THE REPRISE — the wave sent again unseen",
  "PLUMBING — not a dial a person turns",
];

// The set this is the complement of is `ship-groups-wave.ts` next door, cut
// out when THE BELLOWS's group brought this file within seventeen lines of
// the limit. Re-exported here so nothing that already reached for it moved.
export { WAVE_ONLY_GROUPS } from "./ship-groups-wave.js";
// The paragraph under each heading is `ship-notes.ts` next door — the half of
// this file that grows by a mechanic, cut out when THE CAROM took it over the
// limit. Re-exported here so nothing that already reaches for it had to move.
export { GROUP_NOTE } from "./ship-notes.js";

/** The ship's own dials — the same on every wave, and one click away on the topbar. */
export const SHIP_GROUPS: GroupName[] = GROUP_ORDER.filter((g) => !WAVE_ONLY_GROUPS.has(g));

// A boss kind to its group. Cut out when THE SURGE's name took this file past
// 250 (`ship-boss-group.ts`), and re-exported so nothing that reached for it
// here had to move.
export { BOSS_GROUP } from "./ship-boss-group.js";
