import type { GroupName } from "./ship-groups.js";

/**
 * **Which cards belong beside the wave rather than beside the ship.**
 *
 * The last rows of `ship-groups.ts` — the set, and only the set — came across
 * on 22 September 2026, when THE BELLOWS's group left that file seventeen
 * lines from its 250-line limit and the queue named it as one of the five a
 * choreographed boss has to touch. The end of the chain went, the way
 * `boss-others-b.ts` and `events-rounds.ts` took theirs the same day: what
 * stayed next door is the `GroupName` union and `GROUP_ORDER`, the closed list
 * a reader holds in one screen, and `SHIP_GROUPS`, which is this set's
 * complement and is derived rather than written.
 *
 * The import above is a type, so nothing points back: `ship-groups.ts`
 * re-exports this name, the way it already re-exports `GROUP_NOTE` and
 * `BOSS_GROUP`, and a value edge in both directions would be a cycle that
 * evaluates `GROUP_ORDER` before it exists.
 */
/**
 * Groups that describe the wave in front of you rather than the ship — the
 * four boss groups above, plus THE GAUGE, which only matters in a gap that
 * carries one. Every other group is the same ship on every wave; `SHIP_GROUPS`
 * below is the complement, so a group added to `GROUP_ORDER` and left off this
 * set defaults to the ship sheet rather than vanishing — the "show everything"
 * escape hatch the brief asks for is this default, not a separate view.
 */
export const WAVE_ONLY_GROUPS: ReadonlySet<GroupName> = new Set([
  "THE WELL — the field drawn inside out on one screen",
  "WARDEN",
  "THE CAIRN — a pile of rocks taken apart by hand",
  "VANE",
  "MIRROR",
  "MAZE",
  "QUEEN",
  "THE GAUGE — a round with no field in it",
  "THE FLEET — a chart only one of you can read",
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
  "THE FILAMENT — the boss whose line one of you draws while the other follows it",
  "THE GIMBAL — the boss where the same turn is not the same turn",
  "THE SPOOL — the boss where the line runs out at the speed one of you reads",
  "THE HASP — the boss where one of you only has to hold on, and cannot",
  "THE RATCHET — the boss where every step you take stays taken",
  "PINBALL — a table the ship's cannon fires up into",
  "THE PULSE — the same song on two screens",
  "THE SPLICE — straws fed in the order the numbers say",
  "THE REPRISE — the wave sent again unseen",
]);
