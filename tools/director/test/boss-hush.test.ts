import { describe, expect, test } from "bun:test";
import { controlSet } from "@neon-spore/content";
import { computeLayout, type Viewport } from "@neon-spore/render";
import { type BossKind, beatPhase, slowing, step, ticksPerBeat, type World } from "@neon-spore/sim";
import { bossCue } from "../../../packages/render/src/boss-cue.js";
import { bossWorld } from "../src/poses-bosses-kit.js";
import { stageAutopilot } from "../src/stage-autopilot.js";
import { stageField } from "../src/stage-field.js";

/**
 * **Every boss holds its marks still while a window asks for them** — the
 * owner, 27 September 2026, on THE INSTAR: *circles should almost stay where
 * they are*. That boss has its own test (`instar-sway.test.ts`); this is the
 * one every other boss gets a row in.
 *
 * AUTO plays both seats through the boss's wave, and on every tick of an
 * asking window after its first half beat each screen's cue — the middle of
 * the mark it is owed (`boss-cue.ts`) — is read and compared with the tick
 * before. A tick of a window lasts `1000 / slowRateMilli` of a real one, so
 * the speed is in tiles a wall-clock second, and it must stay under a tenth.
 *
 * What this cannot see is a mark moved by anything the cue does not read: the
 * wall clock (`bossCue` takes no `time`), or a pose the cue stands its word
 * clear of — THE SCUTTLE's cue reads the part's row and not its drawn rise.
 * So a boss is given a row only once its draw has been read and its rings
 * are placed off the same state the cue is, and by nothing else.
 */

const VIEWPORT: Viewport = { width: 900, height: 1600, dpr: 2 };
const LIMIT = 0.1; // tiles a wall-clock second

/** The bosses whose marks have been read and hold still; the rest are in `docs/queue.md`. */
const STILL: readonly BossKind[] = ["undertow", "gorge", "curtain", "taster", "lead"];

interface Reading {
  fastest: number;
  samples: number;
}

function walk(kind: BossKind): Reading {
  const world: World = bossWorld(kind);
  const cfg = world.cfg;
  const tpb = ticksPerBeat(cfg);
  const seats = (["p1", "p2"] as const).map((role) => computeLayout(VIEWPORT, cfg, role));
  const test = computeLayout(VIEWPORT, cfg, "test");
  const field = (seat: 1 | 2) => stageField(world, "test", controlSet("default"), cfg, seat, null);
  const auto = stageAutopilot({ layout: () => test, field });
  auto.setMode("both");
  const tickSeconds = 1000 / cfg.tickHz / cfg.slowRateMilli;
  const last: ({ x: number; y: number } | null)[] = [null, null];
  let fastest = 0;
  let samples = 0;
  for (let i = 0; i < 40_000 && world.boss !== null; i++) {
    step(world, auto.commands(world));
    const settled =
      slowing(world) && world.slowAsks && world.tick >= (world.slowFromBeat + 0.5) * tpb;
    seats.forEach((l, k) => {
      const cue = settled ? bossCue(l, world, beatPhase(cfg, world.tick), () => l.hullY) : null;
      const was = last[k] ?? null;
      if (cue !== null && was !== null) {
        const tiles = Math.hypot(cue.x - was.x, cue.y - was.y) / l.tile;
        fastest = Math.max(fastest, tiles / tickSeconds);
        samples++;
      }
      last[k] = cue === null ? null : { x: cue.x, y: cue.y };
    });
  }
  return { fastest, samples };
}

describe("a window holds every boss's marks still", () => {
  for (const kind of STILL) {
    test(`${kind}: each cue moves under a tenth of a tile a second`, () => {
      const { fastest, samples } = walk(kind);
      expect(samples).toBeGreaterThan(0);
      expect(fastest).toBeLessThan(LIMIT);
    });
  }
});
