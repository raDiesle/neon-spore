import { describe, expect, it } from "bun:test";
import {
  type BossEntry,
  DEFAULT_CONFIG,
  diastoleChamberCol,
  SceneRun,
  type SimEvent,
  type SpawnEntry,
} from "@neon-spore/sim";

/**
 * A strip act aimed at a body or at the boss: the column resolved out of the
 * world rather than authored, which is what lets a film's shield reach the
 * gaps `mapCol` never names. Cut out of `scene-films.test.ts` on 23 September
 * 2026 with every film's block, which now live one per file (`scene-*.test.ts`).
 */

/**
 * **A strip that goes where the body is.**
 *
 * Every other column in a film is authored: `actCol` puts a `SceneAct`'s `col`
 * through `mapCol`, which on the eleven columns the game ships reaches 0, 2,
 * 3, 5, 7, 8 and 10 and nothing else. A shield authored into the gaps cannot
 * be written at all, and a body standing in one of them goes past whatever was
 * written instead — which is what stopped THE VOLLEY's rehearsal being written.
 *
 * So the column is resolved out of the world, the way a grip's id and a lid
 * cord's id already are, and these are the two halves of that: it lands on the
 * body even in a column no author could have named, and an empty field leaves
 * the press exactly as written rather than quietly moving it somewhere.
 */
describe("a strip act aimed at a body", () => {
  /** A film of one press, on a field holding whatever is passed in. */
  function run(queue: SpawnEntry[], atBody: boolean, authored: number): SceneRun {
    const cfg = { ...DEFAULT_CONFIG, briefings: false };
    return new SceneRun({
      cfg,
      seed: 1,
      wave: 0,
      queue,
      pods: [],
      hasLance: true,
      faults: [],
      boss: null,
      commands: [
        {
          tick: PRESS,
          player: 1,
          command: { kind: "shieldCol", col: authored },
          ...(atBody ? { atBody: true as const } : {}),
        },
      ],
      ticks: 600,
    });
  }

  /** Column 4 is one `mapCol` never reaches on an eleven-column field. */
  const UNREACHABLE = 4;
  /** After the first beat, so the arrival is standing there to be answered. */
  const PRESS = 100;

  function advanceTo(scene: SceneRun, tick: number): void {
    const events: SimEvent[] = [];
    for (let i = 0; i <= tick; i++) scene.advance(events);
  }

  it("lands in a column no authored one could have named", () => {
    const scene = run([{ beat: 0, col: UNREACHABLE, kind: "slick", color: "red" }], true, 0);
    advanceTo(scene, PRESS + 1);
    expect(scene.world.creatures[0]?.col).toBe(UNREACHABLE);
    expect(scene.world.shieldCol).toBe(UNREACHABLE);
  });

  it("leaves the press where it was written when the field is empty", () => {
    const scene = run([], true, 2);
    advanceTo(scene, PRESS + 1);
    expect(scene.world.shieldCol).toBe(2);
  });

  it("changes nothing for an ordinary strip act", () => {
    const scene = run([{ beat: 0, col: UNREACHABLE, kind: "slick", color: "red" }], false, 2);
    advanceTo(scene, PRESS + 1);
    expect(scene.world.shieldCol).toBe(2);
  });
});

/**
 * **A strip that goes where the boss is answered from** — the same hole in
 * `mapCol`, with no body on the field to find. THE DIASTOLE's left chamber
 * hangs over column 4, which no authored column reaches, and its film is a
 * cannon under that chamber; `bossAnswerCol` (`sim/boss-answer.ts`) is what
 * the press and the ghost thumb both ask. One half each: it lands on the
 * boss's column, and a boss with no answer leaves the press as written.
 */
describe("a strip act aimed at the boss", () => {
  function run(boss: BossEntry | null, atBoss: boolean, authored: number): SceneRun {
    const cfg = { ...DEFAULT_CONFIG, briefings: false };
    return new SceneRun({
      cfg,
      seed: 1,
      wave: 0,
      queue: [],
      pods: [],
      hasLance: true,
      faults: [],
      boss,
      commands: [
        {
          tick: 100,
          player: 1,
          command: { kind: "cannonCol", col: authored },
          ...(atBoss ? { atBoss: true as const } : {}),
        },
      ],
      ticks: 600,
    });
  }

  it("lands under THE DIASTOLE's left chamber, a column no authored one reaches", () => {
    const scene = run({ kind: "diastole" }, true, 2);
    for (let i = 0; i <= 101; i++) scene.advance([]);
    expect(scene.world.cannonCol).toBe(diastoleChamberCol(DEFAULT_CONFIG, -1));
    expect(scene.world.cannonCol).toBe(4);
  });

  it("leaves the press where it was written under a boss with no answer", () => {
    const scene = run({ kind: "baton" }, true, 2);
    for (let i = 0; i <= 101; i++) scene.advance([]);
    expect(scene.world.cannonCol).toBe(2);
  });
});
