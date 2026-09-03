import { afterEach, describe, expect, it } from "bun:test";
import type { Engine } from "../src/engine.js";
import { HEART } from "../src/music/cells.js";
import { planTheme, type Theme } from "../src/music/model.js";
import { MusicPlayer } from "../src/music/player.js";
import { THEMES } from "../src/music/themes.js";
import type { Plan } from "../src/plan.js";

/**
 * The player's arithmetic, which is the whole of it.
 *
 * The engine stops building at 64 live voices and a theme is several hundred,
 * so a piece is handed over a second at a time with an absolute start on each
 * note. Everything that could be wrong about that is a number — how far ahead
 * the first pump reaches, where the second time round starts, when a piece
 * that does not loop is finished — and `MusicPlayer` takes its engine by
 * constructor, so all four are reachable with a fake one.
 */
function fakeEngine(): {
  engine: Engine;
  now: number;
  scheduled: { id: string; when: number }[];
  silenced: number;
} {
  const state = {
    now: 0,
    scheduled: [] as { id: string; when: number }[],
    silenced: 0,
    engine: null as unknown as Engine,
  };
  state.engine = {
    get now() {
      return state.now;
    },
    unlock() {},
    playPlan(plan: Plan, when = 0) {
      state.scheduled.push({ id: plan.id, when });
    },
    silence() {
      state.silenced++;
    },
  } as unknown as Engine;
  return state;
}

/** Two notes a long way apart, so a lookahead has something to stop before. */
const spaced: Theme = {
  id: "music.test",
  title: "Test",
  blurb: "Two notes, four seconds apart.",
  use: "Nothing. It exists to be scheduled.",
  bpm: 60,
  beats: 8,
  notes: [
    { at: 0, cell: HEART },
    { at: 4, cell: HEART },
  ],
};

const players: MusicPlayer[] = [];

/** Every player started here holds a `setInterval`, and a held timer is a test
 * that never ends. */
function playing(engine: Engine): MusicPlayer {
  const player = new MusicPlayer(engine);
  players.push(player);
  return player;
}

afterEach(() => {
  for (const p of players.splice(0)) p.stop();
});

describe("the first pump", () => {
  it("schedules what starts inside the lookahead and stops there", () => {
    const fake = fakeEngine();
    playing(fake.engine).play(spaced);
    expect(fake.scheduled).toHaveLength(1);
    expect(fake.scheduled[0]?.when).toBeCloseTo(0.08, 6);
  });

  it("reaches the rest of the piece as the clock moves under it", () => {
    const fake = fakeEngine();
    const player = playing(fake.engine);
    player.play(spaced);
    fake.now = 4;
    player["pump"]();
    expect(fake.scheduled.map((s) => s.when)).toEqual([0.08, 4.08]);
  });

  it("names the theme it is playing, and nothing once it is stopped", () => {
    const fake = fakeEngine();
    const player = playing(fake.engine);
    player.play(spaced);
    expect(player.playing).toBe("music.test");
    player.stop();
    expect(player.playing).toBeNull();
  });
});

describe("looping", () => {
  it("adds one loop to the offset rather than starting the clock again", () => {
    const fake = fakeEngine();
    const player = playing(fake.engine);
    player.play(spaced, { loop: true });
    fake.now = 20;
    player["pump"]();
    const whens = fake.scheduled.map((s) => s.when);
    // The base was 0.08, the loop is eight seconds: the third note is the
    // first of the second time round.
    expect(whens.slice(0, 4)).toEqual([0.08, 4.08, 8.08, 12.08]);
  });

  it("does not loop a theme with no length to loop, which would schedule forever", () => {
    const fake = fakeEngine();
    const player = playing(fake.engine);
    player.play({ ...spaced, beats: 0 }, { loop: true });
    fake.now = 20;
    player["pump"]();
    expect(fake.scheduled).toHaveLength(2);
  });
});

describe("the end of a piece", () => {
  it("stops itself once the last note has been and gone", () => {
    const fake = fakeEngine();
    const player = playing(fake.engine);
    let ended = 0;
    player.play(spaced, { onEnd: () => ended++ });
    fake.now = 60;
    player["pump"]();
    expect(player.playing).toBeNull();
    expect(ended).toBe(1);
  });

  /**
   * A piece is built a second ahead of the clock, so ■ has to reach what is
   * already scheduled. Without it, pressing two themes in a row plays both.
   */
  it("silences the engine, so stopping is not a promise about a moment from now", () => {
    const fake = fakeEngine();
    const player = playing(fake.engine);
    player.play(spaced);
    player.stop();
    expect(fake.silenced).toBe(1);
  });

  it("does not silence an engine for a player that was not playing", () => {
    const fake = fakeEngine();
    playing(fake.engine).stop();
    expect(fake.silenced).toBe(0);
  });
});

describe("a shipped theme", () => {
  it("hands its first bar over in start order, and every note with a plan", () => {
    const theme = THEMES[0]!;
    const fake = fakeEngine();
    playing(fake.engine).play(theme);
    const plan = planTheme(theme);
    expect(fake.scheduled.length).toBeGreaterThan(0);
    expect(fake.scheduled.length).toBeLessThan(plan.plans.length + 1);
    const whens = fake.scheduled.map((s) => s.when);
    expect([...whens].sort((a, b) => a - b)).toEqual(whens);
  });
});
