import { describe, expect, test } from "bun:test";
import { controlSet } from "@neon-spore/content";
import { computeLayout, type Viewport } from "@neon-spore/render";
import { type BossKind, beatPhase, slowing, step, ticksPerBeat, type World } from "@neon-spore/sim";
import { bossCues, cueSeen } from "../../../packages/render/src/boss-cue.js";
import { bossWorld } from "../src/poses-bosses-kit.js";
import { stageAutopilot } from "../src/stage-autopilot.js";
import { stageField } from "../src/stage-field.js";
import { DRAWN } from "./boss-hush-drawn.js";

/**
 * **Every boss holds its marks still while a window asks for them** — the
 * owner, 27 September 2026, on THE INSTAR: *circles should almost stay where
 * they are*. That boss has its own test (`instar-sway.test.ts`); this is the
 * one every other boss gets a row in.
 *
 * AUTO plays both seats through the boss's wave, and on every tick of an
 * asking window after its first half beat every cue each screen may see — the
 * middle of each mark the boss is asking for (`boss-cue.ts`) — is read and
 * compared with the same cue, by its seed, on the tick before. A cue that
 * gives way to another is a new mark and not a moved one: THE RATCHET's
 * `FIRE` handing over to its bar, THE BATON's cue passing between its marks.
 * A tick of a window lasts `1000 / slowRateMilli` of a real one, so the speed
 * is in tiles a wall-clock second, and it must stay under a tenth.
 *
 * The cue reads no `time`, and it goes once the thumb is doing what it asks,
 * so a boss whose draw moves a mark the cue no longer names, or moves it on
 * the wall clock, is read in `DRAWN` too (`boss-hush-drawn.ts`), from the
 * functions its draw calls:
 * THE MANTLE's brace shudder carries both knobs while the pair hold them,
 * and THE CAPSTAN's rattle shakes and rolls the face a thumb is rubbing.
 * What the cue cannot see is a pose it stands its word clear of — THE
 * SCUTTLE's reads the part's row and not its drawn shiver. So a boss is
 * given a row only once its draw has been read and its rings are placed off
 * the same state the cue is, and by the motions `DRAWN` names. Every boss
 * AUTO has a hand for has one; THE DAVIT waits on its hand (`docs/queue.md`).
 */

const VIEWPORT: Viewport = { width: 900, height: 1600, dpr: 2 };
const LIMIT = 0.1; // tiles a wall-clock second

/** The bosses whose marks have been read and hold still; the rest are in `docs/queue.md`. */
const STILL: readonly BossKind[] = [
  "undertow",
  "gorge",
  "curtain",
  "taster",
  "lead",
  "hasp",
  "ratchet",
  "mantle",
  "keel",
  "oculus",
  "vise",
  "baton",
  "rime",
  "trivet",
  "plumb",
  "grindstone",
  "cyst",
  "capstan",
  "seam",
  "sling",
  "halter",
  "gall",
  "valve",
  "nettle",
  "scuttle",
  "sinew",
  "antiphon",
  "burgee",
];

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
  const drawn = DRAWN[kind] ?? (() => []);
  const last = seats.map(() => new Map<number, { x: number; y: number }>());
  let time = 0;
  let fastest = 0;
  let samples = 0;
  for (let i = 0; i < 40_000 && world.boss !== null; i++) {
    step(world, auto.commands(world));
    time += slowing(world) ? tickSeconds : 1 / cfg.tickHz;
    const settled =
      slowing(world) && world.slowAsks && world.tick >= (world.slowFromBeat + 0.5) * tpb;
    const phase = beatPhase(cfg, world.tick);
    seats.forEach((l, k) => {
      const now = new Map<number, { x: number; y: number }>();
      const cues = settled ? bossCues(l, world, phase, () => l.hullY) : [];
      const seen = cues.filter((cue) => cueSeen(cue, l.role)).map((c) => ({ ...c, id: c.seed }));
      for (const mark of settled ? [...seen, ...drawn(l, world, phase, time)] : []) {
        const was = last[k]?.get(mark.id);
        if (was !== undefined) {
          const tiles = Math.hypot(mark.x - was.x, mark.y - was.y) / l.tile;
          fastest = Math.max(fastest, tiles / tickSeconds);
          samples++;
        }
        now.set(mark.id, { x: mark.x, y: mark.y });
      }
      last[k] = now;
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
