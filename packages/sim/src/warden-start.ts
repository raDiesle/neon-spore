import type { WardenEntry } from "./boss-entries.js";
import { NO_SHELL } from "./shell.js";
import { WARDEN_COLS } from "./types.js";
import { NO_TETHER } from "./warden-cycle.js";
import type { World } from "./world.js";

/**
 * THE WARDEN takes the field where it stands and never leaves it: dead centre,
 * at `wardenRow`, five columns wide. There is no starting column to author —
 * a ring placed off centre is a ring with a short side — so the only thing a
 * wave says about it is how many plates it wears.
 *
 * The pupil starts in the middle of the body, which is the column the line
 * comes down in: the first thing the pair see is the rope standing in front of
 * the eye, which is exactly what pulling it aside is for.
 */
export function installWarden(world: World, entry: WardenEntry): void {
  const id = world.nextId++;
  const col = Math.floor((world.cfg.cols - WARDEN_COLS) / 2);
  world.creatures.push({
    id,
    kind: "warden",
    col,
    row: world.cfg.wardenRow,
    fromRow: world.cfg.wardenRow,
    color: null,
    holes: 0,
    petals: 0,
    dragMilli: 0,
    shell: NO_SHELL,
  });
  world.boss = {
    kind: "warden",
    creatureId: id,
    tetherId: NO_TETHER,
    pupilCol: col + Math.floor(WARDEN_COLS / 2),
    pupilDir: 1,
    plates: entry.plates ?? world.cfg.wardenPlates,
    eyeSpent: false,
    pulling: false,
    pullOriginMilli: 0,
    pullOriginYMilli: 0,
    pullMilli: 0,
    pullYMilli: 0,
    pullAnchorX: 0,
    pullAnchorY: 0,
  };
}
