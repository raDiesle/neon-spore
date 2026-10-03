import { metColor, missedColor } from "./balance.js";
import { midCol } from "./config.js";
import {
  type MimicState,
  mimicBoss,
  mimicDraws,
  mimicFiring,
  mimicPainted,
  mimicTiles,
} from "./mimic.js";
import { mimicPaintMode } from "./mimic-shapes.js";
import { mimicClenched, mimicPeeled } from "./mimic-step.js";
import { THROAT_MODES } from "./throat.js";
import { throatModeSeat } from "./throat-hand.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * THE MIMIC's hands: the brush set from the panel, and a tile tapped on the
 * board (`mimic.ts`).
 *
 * **The brush is THE THROAT's four buttons** and its rule (`throatModeSeat`):
 * the shots set red and cyan and are the navigator's, the shield and the maw
 * are the pilot's, and a button pressed by the other seat is not on its
 * panel. It is one brush for the pair, whoever is painting.
 *
 * **A tap is `tapTile`**, THE MINE's: a column and a row, the only thing two
 * phones of different widths share. Only a seat with a picture to paint is
 * heard while one is up (`mimicDraws`) — the reader has nothing to paint, and
 * a half already peeled is done. The tile takes the brush, or goes bare if it
 * was already in it, and the picture is judged the instant the tap lands.
 *
 * **The core is tapped in its colour**, by either seat, on its tile or the
 * eight round it: a tap with the brush in another colour is a colour missed on
 * the balance sheet, and the core stays lit (`mimicStruck`).
 */
export function mimicHeard(world: World, player: 1 | 2, command: Command): void {
  const s = mimicBoss(world);
  if (s === null) return;
  if (command.kind === "throatMode") {
    if (throatModeSeat(command.mode) !== player) return;
    const brush = THROAT_MODES.indexOf(command.mode) + 1;
    if (brush === s.brush) return;
    s.brush = brush;
    world.events.push({ type: "mimicBrush", brush, col: midCol(world.cfg) });
    return;
  }
  if (command.kind !== "tapTile") return;
  if (mimicFiring(s)) {
    mimicStruck(world, s, command.col, command.row);
    return;
  }
  if (!mimicDraws(s, player)) return;
  const { col, row } = command;
  const at = col + row * world.cfg.cols;
  if (col < 0 || col >= world.cfg.cols || row < 0 || at >= mimicTiles(world)) return;
  const was = s.paint[at] ?? 0;
  const now = was === s.brush ? 0 : s.brush;
  s.paint[at] = now;
  const side: 0 | 1 = player === 1 ? 0 : 1;
  world.events.push({ type: "mimicPaint", side, at, paint: now, col: midCol(world.cfg) });
  for (const seat of [1, 2] as const) {
    if (mimicDraws(s, seat) && mimicPainted(world, s, seat))
      mimicPeeled(world, s, seat === 1 ? 0 : 1);
  }
}

/**
 * **A tap on the bare core**, while it is lit: in its colour it clenches; in
 * the other, a colour missed and the core still lit. A core lit for either
 * takes any brush — the shield and the maw included, as THE LAMPREY's white
 * gullet takes either shot.
 */
function mimicStruck(world: World, s: MimicState, col: number, row: number): void {
  const mid = midCol(world.cfg);
  if (Math.abs(col - mid) > 1 || Math.abs(row - world.cfg.mimicCoreRow) > 1) return;
  const step = s.steps[s.cursor];
  if (step === undefined) return;
  if (step.color !== "either") {
    if (mimicPaintMode(s.brush) !== step.color) {
      missedColor(world);
      return;
    }
    metColor(world);
  }
  s.hits += 1;
  world.events.push({ type: "mimicHit", hits: s.hits, col: mid });
  mimicClenched(world, s);
}
