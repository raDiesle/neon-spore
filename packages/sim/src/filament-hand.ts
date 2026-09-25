import {
  type FilamentState,
  type FilamentTile,
  filamentBoss,
  filamentGap,
  filamentIndexOf,
  filamentTileAt,
  filamentTiles,
  filamentTracing,
  NO_GRAB,
} from "./filament.js";
import { pullFilament, strikeFilament } from "./filament-step.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * Two thumbs on THE FILAMENT: the pilot's drawing it, the navigator's
 * following.
 *
 * Both are the one `drag` at the `filament` target, and a drag carries a
 * displacement from where it grabbed, in thousandths of a tile. What makes
 * the drag a **trace** is that the grab is at a tile the simulation already
 * knows — the pilot's thumb grabs at the head, the navigator's at the tail —
 * so the displacement resolves to a tile of the field, the nearest one, and
 * that tile is either the next on the filament or it is nothing. A thumb
 * resting, wandering off the line or moving backwards does nothing; only the
 * next tile counts, and it counts once.
 *
 * **The pilot** (player 1) lights the next tile. Two in one beat — the head
 * already moved this `world.beat` — is faster than a tile a beat, and the
 * filament snaps; a thumb that reaches two tiles ahead in one move snaps it
 * too, because the tile between was never drawn. And having lit a tile, if
 * the navigator is now further behind than `filamentGapTiles`, the filament
 * goes dark: he drew what she could not keep up with.
 *
 * **The navigator** (player 2) moves along the lit part. Her next tile is the
 * head's is the thumbs colliding, and the filament recoils — unless the head
 * is the root, in which case her thumb arriving there is the filament traced
 * end to end and it is pulled. The one asymmetry: she may reach his tile
 * only when it is the last, which is the design's *pull the filament out
 * together* said as a rule.
 *
 * **The wrong seat's thumb does nothing**, silently: there is no mark to be
 * refused on, only a line, and the line each seat is shown says whose it is
 * (`docs/spec/bosses-choreographed.md` §17, *what each seat sees*).
 *
 * **Every fault is a strike on the hull**, which is the wave (the owner, 25
 * September 2026: *when any player failed, then wave is over and must be
 * repeated*), and the filament back to its free end for a hull that cannot
 * be struck (`strikeFilament`, `filament-step.ts`): head, tail, the beats and
 * both grabs to nought. A thumb still down after one has to lift and grab
 * again, because its grab origin was a tile that is no longer lit. Every move
 * that counts restarts the line's clock (`stillBeat`, `filament-turn.ts`).
 */

const PILOT = 1;

/** The nearest whole tile to a displacement in thousandths, integers only. */
function tilesOf(milli: number): number {
  return Math.floor((milli + 500) / 1000);
}

/** The tile a thumb's displacement from its grab resolves to on the field. */
function thumbTile(
  s: FilamentState,
  grab: number,
  command: Extract<Command, { kind: "drag" }>,
): FilamentTile | null {
  const origin = filamentTileAt(s, grab);
  if (origin === null) return null;
  return {
    col: origin.col + tilesOf(command.fromMilli),
    row: origin.row + tilesOf(command.fromYMilli ?? 0),
  };
}

export function filamentHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag" || command.target !== "filament") return;
  const s = filamentBoss(world);
  if (s === null || !filamentTracing(s)) return;
  const seat = player === PILOT ? 0 : 1;
  if (!command.on) {
    s.grab[seat] = NO_GRAB;
    return;
  }
  const grab = s.grab[seat];
  if (grab === NO_GRAB) {
    // The grab: at the head for the pilot, the tail for the navigator, and
    // the grab itself moves nothing.
    s.grab[seat] = player === PILOT ? s.head : s.tail;
    return;
  }
  const tile = thumbTile(s, grab, command);
  if (tile === null) return;
  const idx = filamentIndexOf(s, tile);
  if (player === PILOT) draw(world, s, idx, tile);
  else follow(world, s, idx, tile);
}

function draw(world: World, s: FilamentState, idx: number, tile: FilamentTile): void {
  if (idx <= s.head) return;
  if (idx > s.head + 1 || s.headBeat === world.beat) {
    world.events.push({ type: "filamentSnap", col: tile.col });
    strikeFilament(world, s, tile.col, tile.row);
    return;
  }
  s.head = idx;
  s.headBeat = world.beat;
  s.stillBeat = world.beat;
  world.events.push({ type: "filamentDrawn", col: tile.col, row: tile.row });
  if (filamentGap(s) > world.cfg.filamentGapTiles) {
    world.events.push({ type: "filamentDark", col: tile.col });
    strikeFilament(world, s, tile.col, tile.row);
  }
}

function follow(world: World, s: FilamentState, idx: number, tile: FilamentTile): void {
  // Only the next tile, and only a lit one: past the head is nothing drawn.
  if (idx !== s.tail + 1 || idx > s.head) return;
  if (idx === s.head) {
    const tiles = filamentTiles(s);
    if (tiles !== null && idx === tiles.length - 1) {
      s.tail = idx;
      world.events.push({ type: "filamentFollowed", col: tile.col, row: tile.row });
      pullFilament(world, s);
      return;
    }
    world.events.push({ type: "filamentRecoil", col: tile.col });
    strikeFilament(world, s, tile.col, tile.row);
    return;
  }
  s.tail = idx;
  s.stillBeat = world.beat;
  world.events.push({ type: "filamentFollowed", col: tile.col, row: tile.row });
}
