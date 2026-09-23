import type { MechanicId } from "@neon-spore/content";
import type { PlayerId } from "@neon-spore/net";
import type { Difficulty, SimConfig, World } from "@neon-spore/sim";
import { openDemonstration } from "./demo-menu.js";
import type { Intro } from "./intro.js";
import { atLevel, readProgress, updateProgress } from "./progress.js";
import type { CommandSource } from "./relay.js";
import type { RunState } from "./run-state.js";
import type { ShellParts } from "./shell.js";
import type { TestPanel } from "./testing.js";
import type { ViewSwitch } from "./view.js";

/**
 * What `main.ts` hands `bindShell` — beside `main.ts` rather than inside it,
 * `shell-menu.ts`'s own reason: the seat, the tempo and the two ways a wave
 * starts are wiring, not order, and thirty lines of it were the margin
 * between `main.ts` and the ceiling (`docs/queue.md`, 19 September 2026).
 *
 * `ShellParts`'s own order — the link built first, the three screens before
 * it reports — stays where it is, in `shell.ts`; nothing here is that. This
 * is the part that is only a shape, built from the pieces `main.ts` already
 * holds.
 */
export interface MainDeps {
  cfg: SimConfig;
  world: World;
  buffer: CommandSource;
  run: RunState;
  jumpToWave: (wave: number) => void;
  view: ViewSwitch;
  setSound: (on: boolean) => void;
  testPanel: TestPanel;
  intro: Intro;
  /** Beat zero: `main-world.ts`'s `startTogether`, since the clock it resets
   * is the world's opening to own. */
  startTogether: (wave: number) => void;
  /** Writes the run's tempo onto the live config — `main-world.ts`'s `playAt`. */
  playAt: (level: Difficulty) => void;
  /** Both seats' QUIT, from the buffer `main.ts` holds (`quit.ts`). */
  quit: () => void;
}

export function shellWiring(deps: MainDeps): ShellParts {
  return {
    cfg: deps.cfg,
    world: deps.world,
    buffer: deps.buffer,
    run: deps.run,
    jumpToWave: deps.jumpToWave,
    seat: () => deps.view.role(),
    setSeat: (role) => deps.view.set(role, true),
    dealSeat: (role) => deps.view.set(role, false),
    openTuning: () => deps.testPanel.open(),
    setSound: deps.setSound,
    openDemo: (id: MechanicId) => openDemonstration(id, deps.cfg, deps.jumpToWave),
    // Beat zero: the room's wave *and* the room's tempo, so the two phones are
    // playing the same game at the same speed (`sim/difficulty.ts`).
    onStart: (_player: PlayerId, wave, level) => {
      deps.playAt(level);
      deps.startTogether(wave);
    },
    level: () => readProgress().level,
    // Off the wire, the same three things in the same order — and the first
    // wave, because a wave cleared at one tempo was not cleared at another.
    // The row that reaches this asked before it did (`menu-entries.ts`).
    setLevel: (level) => {
      deps.playAt(level);
      updateProgress((p) => atLevel(p, level));
      deps.startTogether(0);
    },
    quit: deps.quit,
    intro: deps.intro,
  };
}
