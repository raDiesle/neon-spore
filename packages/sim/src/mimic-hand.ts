import { midCol } from "./config.js";
import { type MimicState, mimicBoss, mimicDraws, mimicFiring, mimicTiles } from "./mimic.js";
import { mimicInFrame, mimicPainted } from "./mimic-frame.js";
import { mimicClenched, mimicPeeled } from "./mimic-step.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * THE MIMIC's hand: a tile tapped on the board (`mimic.ts`). **There is no
 * panel** (`controls: "scene"`, the owner, 5 October 2026), so nothing else
 * is heard.
 *
 * **A tap is `tapTile`**, THE MINE's: a column and a row, the only thing two
 * phones of different widths share. Only a seat with a picture to paint is
 * heard while one is up (`mimicDraws`) — the reader has nothing to paint, and
 * a half already peeled is done — and only inside its own frame
 * (`mimicInFrame`): a tap anywhere else paints nothing. The tile is painted,
 * or goes bare if it already was, and the picture is judged the instant the
 * tap lands.
 *
 * **The core is tapped**, by either seat, on its tile or the eight round it.
 */
export function mimicHeard(world: World, player: 1 | 2, command: Command): void {
  const s = mimicBoss(world);
  if (s === null || command.kind !== "tapTile") return;
  if (mimicFiring(s)) {
    mimicStruck(world, s, command.col, command.row);
    return;
  }
  if (!mimicDraws(s, player)) return;
  const { col, row } = command;
  const at = col + row * world.cfg.cols;
  if (col < 0 || col >= world.cfg.cols || row < 0 || at >= mimicTiles(world)) return;
  if (!mimicInFrame(world, s, player, col, row)) return;
  const now = (s.paint[at] ?? 0) === 0 ? 1 : 0;
  s.paint[at] = now;
  const side: 0 | 1 = player === 1 ? 0 : 1;
  world.events.push({ type: "mimicPaint", side, at, paint: now, col: midCol(world.cfg) });
  for (const seat of [1, 2] as const) {
    if (mimicDraws(s, seat) && mimicPainted(world, s, seat))
      mimicPeeled(world, s, seat === 1 ? 0 : 1);
  }
}

/** **A tap on the bare core**, while it is lit: it clenches. */
function mimicStruck(world: World, s: MimicState, col: number, row: number): void {
  const mid = midCol(world.cfg);
  if (Math.abs(col - mid) > 1 || Math.abs(row - world.cfg.mimicCoreRow) > 1) return;
  s.hits += 1;
  world.events.push({ type: "mimicHit", hits: s.hits, col: mid });
  mimicClenched(world, s);
}
