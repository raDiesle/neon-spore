import { clampQueenCol, initialDropSide } from "./boss.js";
import { installCairn } from "./cairn.js";
import { installFleet } from "./fleet.js";
import { installGauge } from "./gauge-round.js";
import { installMaze } from "./maze-state.js";
import { installMirror } from "./mirror.js";
import { installPinball } from "./pinball-round.js";
import { installPulse } from "./pulse-round.js";
import { installReprise } from "./reprise-state.js";
import { installScout } from "./scout-round.js";
import { NO_SHELL } from "./shell.js";
import { installSnake } from "./snake-round.js";
import { installSplice } from "./splice-round.js";
import { installStare } from "./stare-step.js";
import { installVane } from "./vane.js";
import { installWarden } from "./warden-start.js";
import { installClockBoss, isClockEntry } from "./wave-boss-clocks.js";
import { installWell } from "./well.js";
import type { BossEntry, World } from "./world.js";

/**
 * **Which boss a wave installs, and what each of them leaves on the field.**
 *
 * Cut out of `wave-start.ts` when one more boss took that file six lines over
 * its 250-line limit, and along the seam that file was always going to be cut
 * on: everything left next door is **what a wave resets** — the hull's ticks,
 * the hands, the fault, the panel — which is one fixed list that grows by a
 * field at a time, and this is **what a wave installs**, which grows by a whole
 * branch a round. It took sixteen imports of `install*` with it, and grew by a
 * branch a boss until THE LEAD's put it at 250 exactly, when the
 * choreographed bosses' branches were cut to `wave-boss-clocks.ts` along the
 * seam `bosses-clocks.ts` already cuts — the rounds and the bosses with a
 * *place* stay here.
 *
 * **Every branch says what the boss leaves on the field**, by name and with
 * the reason, rather than only naming an installer. That is the load-bearing
 * half of this file: the fall loop, the hull and a hand all sweep the
 * creatures, so "no creature and no row" is a promise three other files are
 * written against, and a boss that quietly acquired a body would break all
 * three at once. The queen and the warden are the only two that leave one, and
 * they are the last two branches for that reason.
 */
export function installWaveBoss(world: World, boss: BossEntry | null): void {
  if (boss?.kind === "gauge") {
    // No creature, no row and no field at all. THE GAUGE replaces the whole
    // picture for as long as it stands, and `step` returns before a rule of
    // the field runs — so there is nothing of it anywhere but its own screen.
    world.boss = installGauge(world);
  } else if (boss?.kind === "snake") {
    // The same nothing THE GAUGE leaves on the field, for the same reason: the
    // arena is the round's own and the ship is in it as the snake, so there is
    // no body here for the fall loop, the hull or a hand to find.
    world.boss = installSnake(world, boss.rounds);
  } else if (boss?.kind === "pinball") {
    // The same nothing again: the table is the round's own picture and the
    // ship is in it as the bucket, so no body of this boss is on the field for
    // the fall loop, the hull or a hand to find.
    world.boss = installPinball(world, boss.rounds);
  } else if (boss?.kind === "pulse") {
    // The same nothing a third time: four lanes of falling arrows are the
    // round's own picture and the ship is not in it at all, so there is no
    // body here for the fall loop, the hull or a hand to find.
    world.boss = installPulse(world, boss.stages);
  } else if (boss?.kind === "splice") {
    // A row of mouths and a tangle over them, and the field underneath is the
    // field: no creature, no row of its own for the fall loop to find, and
    // every control the ship has still answering. The straws are laid here,
    // from the seeded rng, so both devices draw the same ones (`splice.ts`).
    world.boss = installSplice(world, boss.rounds);
  } else if (boss?.kind === "mirror") {
    world.boss = installMirror(world, boss.rounds);
  } else if (boss?.kind === "maze") {
    // No creature and no row either. THE MAZE is three mouths in the sky and a
    // wheel behind them, so there is nothing of it for the fall loop or a
    // hand to find — the same shape THE VANE has, one branch down.
    world.boss = installMaze(world, boss.rounds);
  } else if (boss?.kind === "fleet") {
    // No creature and no row: a chart is not a body. Nothing of THE FLEET
    // falls, can be warded or can be taken hold of — the ships are squares on
    // a lattice over the field, and the only thing that ever reaches one is a
    // salvo (`fleet.ts`).
    world.boss = installFleet(world, boss);
  } else if (boss?.kind === "vane") {
    // No creature and no row. THE VANE hangs off the top edge rather than
    // standing on the grid, so there is nothing of it for the fall loop, the
    // hull or a hand to find (docs/spec/bosses.md §11.5).
    world.boss = installVane(world, boss);
  } else if (boss?.kind === "well") {
    // Less than any of them: no creature, no row and no rule of the field.
    // THE WELL is a projection — the field drawn inside out on one screen of
    // the two — so the wave under it runs exactly as its author wrote it, and
    // the state it does keep is the angle its own face stands at and the thumb
    // on the seam, which reaches nothing else (`well.ts`).
    world.boss = installWell(world);
  } else if (boss?.kind === "reprise") {
    // No creature and no row, THE VANE's shape exactly: the mechanism hangs at
    // the top middle and everything it ever puts on the field is a body the
    // wave's own author wrote, sent a second time with nothing drawn
    // (`reprise.ts`). Nothing of the boss itself falls, can be warded or can
    // be taken hold of.
    world.boss = installReprise(world.cfg, boss);
  } else if (boss?.kind === "cairn") {
    // A creature and a row, like the Warden and unlike the six above it: the
    // pile is a body standing on the grid, wide enough to have lanes of its
    // own, and a hand has to be able to find it (`cairn.ts`).
    world.boss = installCairn(world, boss);
  } else if (boss?.kind === "scout") {
    // The same nothing THE GAUGE and SNAKE leave on the field, for the same
    // reason: the arena is the round's own picture and the ship is in it as
    // the little one that was put out of it, so there is no body here for the
    // fall loop, the hull or a hand to find (`scout.ts`).
    world.boss = installScout(world, boss.arenas);
  } else if (boss?.kind === "stare") {
    // No creature and no row: the eye is in the sky and takes no damage, so
    // there is nothing of it for the fall loop, the hull or a hand to find.
    // The wave underneath is the wave its author wrote (`stare.ts`).
    world.boss = installStare(world);
  } else if (boss && isClockEntry(boss)) {
    // A boss from the choreographed page: every one of them says what it
    // leaves on the field in its own branch next door (`wave-boss-clocks.ts`).
    installClockBoss(world, boss);
  } else if (boss?.kind === "warden") {
    installWarden(world, boss);
  } else if (boss) {
    const id = world.nextId++;
    world.creatures.push({
      id,
      kind: "queen",
      // Wherever a wave put her, she stands where both her flank torches are
      // on the field — see `clampQueenCol`.
      col: clampQueenCol(world.cfg, boss.col),
      row: world.cfg.queenRow,
      fromRow: world.cfg.queenRow,
      color: null,
      holes: 0,
      petals: boss.petals,
      dragMilli: 0,
      shell: NO_SHELL,
    });
    world.boss = {
      kind: "queen",
      creatureId: id,
      // -1 is not a real phase; it means "has not entered one yet", so the
      // first beat is read as a phase change and she can open on it.
      phase: -1,
      phaseBeat: 0,
      tellCol: -1,
      tellColor: null,
      // Both overwritten before either is ever read: `pickNextBloom` runs on
      // her very first beat, from `enterPhase`.
      weakSide: 1,
      pickBeat: 0,
      spentSide: 0,
      openBeat: -1,
      closeBeat: -1,
      pryBeat: -1,
      holdSide: 0,
      startPetals: boss.petals,
      dropSide: initialDropSide(world),
      releaseBeat: -1,
      releaseSide: 0,
      scratch: [],
    };
  }
}
