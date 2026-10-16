import type { Wave } from "@neon-spore/content";
import type { PinballRound } from "@neon-spore/sim";
import { serializePinballRounds } from "./serialize-pinball.js";
import { serializeScoutArenas } from "./serialize-scout.js";
import type { WaveFiles } from "./waves-acts.js";

/**
 * The two pieces of authored boss content a save writes beside the acts:
 * PINBALL's boards and THE SCOUT's arenas. Cut out of `waves-acts.ts` when
 * the re-cut by play order (`waves-recut.ts`) needed its room.
 */

/**
 * PINBALL's boards, if the list holds a pinball wave. Returns the files it
 * wrote, so the caller's Biome pass covers them.
 *
 * **Exactly one pinball wave may own the list.** Two would both be serialized
 * into `PINBALL_ROUNDS` and the second would win silently, which is the
 * failure mode this whole route was rewritten to make impossible — so a second
 * one is left alone and says so in the log rather than being written. A
 * second pinball wave wants a second list, and that is an authoring decision
 * rather than something a save should make on its own.
 */
export async function writeBoards(waves: readonly Wave[], files: WaveFiles): Promise<string[]> {
  const owners = waves.filter((w) => w.boss?.kind === "pinball");
  if (owners.length === 0) return [];
  if (owners.length > 1) {
    console.log(`${owners.length} pinball waves share one board list — none written`);
    return [];
  }
  const boss = owners[0]?.boss;
  if (boss === undefined || boss.kind !== "pinball") return [];
  const rounds: readonly PinballRound[] = boss.rounds;
  const source = await Bun.file(files.boards.file).text();
  await Bun.write(files.boards.file, serializePinballRounds(source, rounds));
  return [files.boards.rel];
}

/**
 * THE SCOUT's arenas: each scout wave's levels into its own list, under
 * `writeBoards`' rule — exactly one wave may own a list, so a second wave of
 * the same id, or a scout wave with no list in `scout-lists.ts`, is left alone
 * and says so.
 */
export async function writeArenas(waves: readonly Wave[], files: WaveFiles): Promise<string[]> {
  const rels: string[] = [];
  const scouts = waves.filter((w) => w.boss?.kind === "scout");
  for (const w of scouts) {
    if (!files.arenas.some((a) => a.wave === w.id))
      console.log(`scout wave ${w.id} has no arena list — its levels not written`);
  }
  for (const list of files.arenas) {
    const owners = scouts.filter((w) => w.id === list.wave);
    if (owners.length > 1) console.log(`${owners.length} waves own ${list.name} — none written`);
    const boss = owners.length === 1 ? owners[0]?.boss : undefined;
    if (boss === undefined || boss.kind !== "scout") continue;
    const source = await Bun.file(list.file).text();
    await Bun.write(list.file, serializeScoutArenas(source, boss.arenas, list.name));
    rels.push(list.rel);
  }
  return rels;
}
