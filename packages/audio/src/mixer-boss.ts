/**
 * The bosses' half of what the simulation does not report.
 *
 * A boss is the one thing on the field with a clock of its own, and both of
 * the clocks matter to the pair: the queen's armour has two beats open in it
 * and THE MIRROR spends its count-in before performing, and neither edge is an
 * event. So they are heard the same way the cannon's column is — by comparing
 * this frame's world to the last one's, out of `Memory`.
 *
 * It is beside `mixer.ts` rather than in it because that file was at the
 * 250-line limit, and this is the seam: everything here is about a boss, takes
 * the same `play` the mixer would have used, and touches only the boss fields
 * of the remembered frame. `catalogue.test.ts` reads this file for sound ids
 * along with `bind.ts` and the mixer, so a boss cue that stops being played
 * still fails the `bound` check.
 */

import type { Creature, World } from "@neon-spore/sim";
import { panForCol } from "./bind.js";
import type { Memory } from "./memory.js";

/** The mixer's own `play`, handed over so nothing here needs an engine. */
export type Play = (id: string, pan?: number) => void;

/** Whichever boss is installed, and the two things each of them does on a clock. */
export function soundBoss(world: World, cols: number, first: boolean, m: Memory, play: Play): void {
  const boss = world.boss;
  // One pass for the three things this file wants out of the creature list.
  // It used to run a `find` for the queen, a `filter` to count torches — an
  // array allocated to read its length — and a second `find` for the first
  // torch, on every frame of every wave, boss or no boss.
  const queenId = boss?.kind === "queen" ? boss.creatureId : null;
  let queen: Creature | undefined;
  let firstTorch: Creature | undefined;
  let torches = 0;
  for (const c of world.creatures) {
    if (c.kind === "torch") {
      torches++;
      firstTorch ??= c;
    }
    if (c.id === queenId) queen = c;
  }
  const kind = boss?.kind ?? "";
  if (kind !== m.bossKind) {
    if (kind === "queen") play("boss.arrive");
    if (kind === "mirror") play("mirror.arrive");
    m.bossKind = kind;
    m.bossCol = -1;
    m.queenOpen = false;
    m.mirrorPhase = "";
  }

  if (boss?.kind === "queen") {
    if (queen && queen.col !== m.bossCol) {
      if (!first && m.bossCol >= 0) play("boss.queenStep", panForCol(queen.col, cols));
      m.bossCol = queen.col;
    }
    // Her armour is the whole fight: the two beats it is open are the only
    // two the pair can spend, and both edges of them are worth hearing.
    const open = boss.openBeat >= 0 && world.beat >= boss.openBeat && world.beat < boss.closeBeat;
    if (open && !m.queenOpen) play("boss.queenOpen", panForCol(queen?.col ?? 0, cols));
    if (!open && m.queenOpen) play("boss.queenShut", panForCol(queen?.col ?? 0, cols));
    m.queenOpen = open;
  }

  if (boss?.kind === "mirror" && boss.phase !== m.mirrorPhase) {
    // `lead` is the count-in: the beats it spends before performing.
    if (boss.phase === "lead") play("mirror.countIn");
    m.mirrorPhase = boss.phase;
  }

  // A torch is the one arrival too fast to be talked about, so it announces
  // itself twice: the alarm, and the weight of the thing falling.
  if (!first && torches > m.torches) {
    play("boss.torchWarn");
    play("boss.torchDrop", panForCol(firstTorch?.col ?? 0, cols));
  }
  m.torches = torches;
}
