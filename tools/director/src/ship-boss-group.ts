import type { BossEntry } from "@neon-spore/sim";
import type { GroupName } from "./ship-groups.js";

/**
 * **The boss group each `BossEntry` kind shows.** It arrived in
 * `ship-groups.ts` with THE CLAW, because the file before that had run out of
 * room and a map from a boss kind to a group is a statement about *groups*
 * rather than about `SimConfig` fields; and it left that file on 17 September
 * 2026 when THE SURGE's name took it past 250 lines, for the reason it was
 * always going to: it grows by a boss where `GroupName` grows by a mechanic,
 * and twenty-seven bosses in, the two had filled up together. `Record` over
 * the kind keeps the guard — a boss added to `sim` and left off here is a
 * compile error, not a card that never shows.
 */
/** A wave that carries `warden` shows WARDEN, and nothing else changes because
 * of it: `ship.ts` reads this to decide what belongs beside the wave being
 * edited rather than beside the ship, the split the SHIP-column brief asked for. */
export const BOSS_GROUP: Record<BossEntry["kind"], GroupName> = {
  pinball: "PINBALL — a table the ship's cannon fires up into",
  pulse: "THE PULSE — the same song on two screens",
  splice: "THE SPLICE — straws fed in the order the numbers say",
  queen: "QUEEN",
  warden: "WARDEN",
  cairn: "THE CAIRN — a pile of rocks taken apart by hand",
  mirror: "MIRROR",
  vane: "VANE",
  maze: "MAZE",
  gauge: "THE GAUGE — a round with no field in it",
  fleet: "THE FLEET — a chart only one of you can read",
  snake: "SNAKE — a round the ship is the body of",
  scout: "THE SCOUT — a little ship one of you flies",
  stare: "THE STARE — an eye that freezes whoever it looks at",
  baton: "THE BATON — a bead passed down an arm, one seat a beat",
  throat: "THE THROAT — the boss you answer by feeding it",
  undertow: "THE UNDERTOW — the boss under the floor, answered downward",
  gorge: "THE GORGE — the boss you hurt by not shooting",
  curtain: "THE CURTAIN — the boss that is in the way",
  taster: "THE TASTER — the boss that grows its armour in the colour you have been spending",
  sinew: "THE SINEW — the boss that asks how hard, not when",
  ledger: "THE LEDGER — the boss that bills your own hull for every shot",
  surge: "THE SURGE — the boss beaten by letting go",
  lead: "THE LEAD — the boss you shoot where it will be",
  scuttle: "THE SCUTTLE — the boss that throws itself at you, a part at a time",
  antiphon: "THE ANTIPHON — the boss that grows a thing nobody has a word for",
  hive: "THE HIVE — the boss you seal, and every breach you have not sealed yet is spilling",
  instar: "THE INSTAR — the boss with no panel: its own body is marked where it will hurt you",
  nettle:
    "THE NETTLE — a jellyfish marked for thumbs and for the panel: shoot it, shield it, suck it",
  filament: "THE FILAMENT — the boss whose line one of you draws while the other follows it",
  gimbal: "THE GIMBAL — the boss where the same turn is not the same turn",
  spool: "THE SPOOL — the boss where the line runs out at the speed one of you reads",
  hasp: "THE HASP — the boss where one of you only has to hold on, and cannot",
  ratchet: "THE RATCHET — the boss where every step you take stays taken",
  mantle: "THE MANTLE — the boss both hands have to pull at once, or neither counts",
  keel: "THE KEEL — the boss whose next joint is whichever thumb is nearer",
  valve: "THE VALVE — the boss one hand turns and the other hand stops",
  seam: "THE SEAM — the boss answered with the cannon and the shield, in order",
  oculus: "THE OCULUS — the boss both hands hold shut, then shoot into",
  vise: "THE VISE — the boss two pinches crack, then shoot into",
  rime: "THE RIME — the boss two rubs wipe clear, then shoot into",
  trivet: "THE TRIVET — the boss two chords plant, then shoot into",
  plumb: "THE PLUMB — the boss two phones hold level, then shoot into",
  // The one group with no dial in it, and deliberately: everything about THE
  // WELL is the shape of a picture, and a number that changed how a picture
  // reads belongs in a VERSUS candidate rather than on a slider
  // (`render/src/well.ts`, `docs/versus.md`). The card says so.
  well: "THE WELL — the field drawn inside out on one screen",
  reprise: "THE REPRISE — the wave sent again unseen",
};
