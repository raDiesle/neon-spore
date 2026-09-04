import { type SimConfig, ticksPerBeat } from "./config.js";
import type { BossEntry, PodEntry, SpawnEntry } from "./entries.js";
import type { SimEvent } from "./events.js";
import { step } from "./step.js";
import type { Command } from "./types.js";
import { startWave } from "./wave-start.js";
import { createWorld, type World } from "./world.js";

/**
 * A rehearsal: a small world, played out on a loop, so a guide can *show* the
 * thing it is asking for instead of describing it.
 *
 * ## Why it is a real simulation and never a painted picture
 *
 * The obvious way to animate a guide is to draw the moment: a blob here, a
 * cannon there, a bolt between them, all placed by hand against a clock. That
 * is a second copy of where a creature lands and what a shot does, and it goes
 * on being a copy for as long as it exists — the exact class of drift
 * `packages/sim/test/purity.test.ts` carries a table against. A rehearsal that
 * missed would keep missing after the fall speed changed, and nobody would
 * find out, because nothing tests a painting.
 *
 * So a scene is played rather than drawn. The queue is spawned by
 * `spawnArrivals`, the fall is `onBeat`'s, the shot is `fire` and the hit is
 * `resolve` — all of it the rules the pair is about to play by, and if any of
 * them changes the rehearsal changes with it.
 *
 * ## What it is handed, and what it is not
 *
 * `SceneScript` is a **built** queue, exactly as `startWave` takes one: waves
 * live in `content/` and nothing here may point back at them, so a runner is
 * handed its spawns rather than fetching them. `packages/content/src/scenes.ts`
 * is what authors one and turns it into this shape; the same direction, and
 * the same reason, as every other queue in the game.
 *
 * ## The loop, and why it is rebuilt rather than rewound
 *
 * A wrap builds a **fresh** `World` from the same seed. There is no rewind: a
 * world is a large mutable thing with a random stream in it, and putting one
 * back is a second definition of what a world is made of that would go stale
 * the first time a field was added. Building costs one `createWorld` every
 * `ticks` — a few times a minute — and cannot be wrong.
 *
 * Because a rebuilt world starts its `tick`, `beat` and `nextId` at 0 again,
 * anything the renderer cached against them belongs to the loop just ended:
 * see CLAUDE.md on those three not being monotonic. `wrapped` is how the caller
 * is told, and `packages/render/src/guide-scene.ts` clears both mini-views'
 * `Effects` on it.
 */

export interface SceneCommand {
  /** Tick within the loop, 0..`ticks`-1. */
  tick: number;
  player: 1 | 2;
  command: Command;
}

export interface SceneScript {
  /**
   * The rehearsal's own configuration. A demonstration is allowed a shorter
   * field and a quicker beat than a wave — it is a picture of the rules, not a
   * round of them — and every one of those is a named field of `SimConfig`
   * rather than a number in a drawing.
   */
  cfg: SimConfig;
  seed: number;
  /** Which wave this rehearses. The backdrop and the panel are read off it. */
  wave: number;
  /** Built by the caller, the way `startWave`'s is. */
  queue: SpawnEntry[];
  pods: PodEntry[];
  boss: BossEntry | null;
  /** Sorted by tick. What the ghost thumb is doing, as presses. */
  commands: readonly SceneCommand[];
  /** How long one turn of the loop is, in ticks. */
  ticks: number;
}

/**
 * One rehearsal, mid-loop. The caller owns the clock — a scene runs on wall
 * time like every other animation and is shared with nobody, so there is
 * nothing here to keep two devices agreeing about.
 */
export class SceneRun {
  world: World;
  /** Ticks into the current turn of the loop, 0..`ticks`-1. */
  tick = 0;
  /** How many turns have finished. Only ever compared for a change. */
  turn = 0;
  private next = 0;
  private due: SceneCommand[] = [];

  constructor(private readonly script: SceneScript) {
    // Fail loudly here rather than mid-guide: an authored tempo that does not
    // divide the tick rate is a beat that drifts, and `ticksPerBeat` is where
    // the game says so.
    ticksPerBeat(script.cfg);
    this.world = build(script);
  }

  /**
   * Back to a tick of the loop, with everything that led to it having really
   * happened: a fresh world from the same seed, then the ticks up to `toTick`
   * run and thrown away.
   *
   * **This is what makes a page repeatable.** A guide is a stack of pages now
   * and a seat reads one for as long as it likes (`guide-steps.ts`), so a page
   * has to be played again from its own first tick — and the world it opens on
   * is the world the ticks before it left, never a pose built to look like one.
   * A rewind would be that pose: a world is a large mutable thing with a random
   * stream in it, and putting one back is a second definition of what a world
   * is made of. Replaying is a few hundred ticks of the real `step`, which is
   * cheaper than it sounds and cannot be wrong.
   */
  restart(toTick: number): void {
    this.world = build(this.script);
    this.tick = 0;
    this.next = 0;
    const spent: SimEvent[] = [];
    while (this.tick < Math.min(toTick, this.script.ticks - 1)) {
      spent.length = 0;
      this.advance(spent);
    }
  }

  /**
   * One tick. Pushes what the world reported into `events` — the caller's
   * `Effects` want them and `world.events` is cleared by the next tick — and
   * answers whether the loop wrapped, which is when everything cached against
   * this world stops meaning anything.
   */
  advance(events: SimEvent[]): boolean {
    this.due.length = 0;
    const { commands } = this.script;
    while (this.next < commands.length && commands[this.next]!.tick <= this.tick) {
      const c = commands[this.next]!;
      this.due.push({ ...c, tick: this.world.tick });
      this.next += 1;
    }
    step(this.world, this.due);
    events.push(...this.world.events);
    this.tick += 1;
    if (this.tick < this.script.ticks) return false;
    this.world = build(this.script);
    this.tick = 0;
    this.next = 0;
    this.turn += 1;
    return true;
  }
}

function build(script: SceneScript): World {
  const world = createWorld(script.cfg, script.seed);
  // `hasGuide` false, and `cfg.briefings` is off in a scene's own config: a
  // rehearsal held behind its own opening would be a guide inside a guide,
  // waiting for two thumbs that are not there.
  startWave(world, script.wave, script.queue, script.pods, script.boss, false);
  return world;
}
