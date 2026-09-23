import { describe, expect, it } from "bun:test";
import type { Driver } from "../drive.js";
import { parseFrameSpec } from "../flags.js";
import type { PressSpec } from "../press-spec.js";
import { reachFirstFrame } from "../reach.js";
import { backTick, type Fired, firedNote, missedNote } from "../until.js";
import { DEFAULT_UNTIL_TICKS, parseUntil } from "../until-flags.js";

/**
 * **STOPPING ON THE TICK SOMETHING HAPPENED.**
 *
 * `--ticks` is an absolute `world.tick`, which is the right primitive and the
 * wrong question: nobody wants tick 1137, they want the breach, and that is a
 * different tick in every wave. The finding this file answers cost one lane
 * three sweeps of fourteen frames apiece to photograph a hole in the skin.
 *
 * The browser half is not testable here and is not pretended to be. What is
 * tested is everything either side of the `page.evaluate`: the flag and its two
 * refusals, the tick line the presses are laid along when the end of the run is
 * an event rather than a number, and the words a miss comes back with — which
 * are the whole value of the flag when the guess is wrong.
 */

const waves = [{ name: "THE DRIFT" }, { name: "THE SHELL" }];

describe("--until", () => {
  it("takes an event and how far to look, and defaults the distance", () => {
    const { spec } = parseFrameSpec(["<sha>", "--wave", "1", "--until", "breach"], waves);
    expect(spec.until).toEqual({ event: "breach", cap: DEFAULT_UNTIL_TICKS });
    const further = parseFrameSpec(
      ["<sha>", "--wave", "1", "--until", "waveFailed", "--until-ticks", "8000"],
      waves,
    ).spec;
    expect(further.until).toEqual({ event: "waveFailed", cap: 8000 });
  });

  it("is absent from every capture that did not ask for it", () => {
    expect(parseFrameSpec(["<sha>", "--wave", "1"], waves).spec.until).toBeUndefined();
  });

  it("refuses the two flags that would put the picture somewhere else", () => {
    // `--ticks` names one moment and this names another; a default cannot be
    // told from a choice, so the flag being *written* is what is read.
    expect(() =>
      parseFrameSpec(["<sha>", "--wave", "1", "--until", "breach", "--ticks", "400"], waves),
    ).toThrow(/--ticks/);
    // A rehearsal is painted rather than stepped, so nothing in front of that
    // camera fires an event at all.
    expect(() =>
      parseFrameSpec(["<sha>", "--wave", "1", "--until", "breach", "--opening", "guide"], waves),
    ).toThrow(/rehearsal/);
  });

  it("refuses a flag where the event should be", () => {
    expect(() => parseUntil("--frames", DEFAULT_UNTIL_TICKS, { ticks: false })).toThrow(
      /needs an event/,
    );
    expect(() => parseUntil("", DEFAULT_UNTIL_TICKS, { ticks: false })).toThrow(/needs an event/);
  });

  it("holds a press to the distance it will look, not to --ticks", () => {
    expect(() =>
      parseFrameSpec(
        [
          "<sha>",
          "--wave",
          "1",
          "--until",
          "breach",
          "--until-ticks",
          "200",
          "--press",
          "900:2:fire=red",
        ],
        waves,
      ),
    ).toThrow(/--until-ticks 200/);
    // Inside the distance it is an ordinary press on the way to the event.
    const ok = parseFrameSpec(
      ["<sha>", "--wave", "1", "--until", "breach", "--press", "900:2:fire=red"],
      waves,
    ).spec;
    expect(ok.press?.[0]?.tick).toBe(900);
  });
});

/**
 * **The other end of a rest**, which is where half the pictures are.
 *
 * `--until needWave` photographs the frame the between-waves screen has just
 * left: the screen is up for the 450 ticks that *end* on that event. One
 * capture of it cost a sweep of all ninety-seven waves in the headless
 * simulation, looking for the single one that clears with nothing pressed, so
 * that a hand-counted offset could go after `--ticks`. `--until-back N` is
 * that offset, counted by the tool.
 */
describe("--until-back", () => {
  it("rides on the event, as a number of ticks before it", () => {
    const { spec } = parseFrameSpec(
      ["<sha>", "--wave", "1", "--until", "needWave", "--until-back", "200"],
      waves,
    );
    expect(spec.until).toEqual({ event: "needWave", cap: DEFAULT_UNTIL_TICKS, back: 200 });
  });

  it("is absent from a plain --until, which still means the event's own tick", () => {
    const { spec } = parseFrameSpec(["<sha>", "--wave", "1", "--until", "breach"], waves);
    expect(spec.until?.back).toBeUndefined();
  });

  it("refuses to be written without an event to count back from", () => {
    // Silently doing nothing would hand back the ordinary `--ticks 120`
    // picture, which looks like an answer.
    expect(() => parseFrameSpec(["<sha>", "--wave", "1", "--until-back", "200"], waves)).toThrow(
      /needs an event/,
    );
  });

  it("refuses a step back of nothing", () => {
    const had = { ticks: false, back: "0" };
    expect(() => parseUntil("needWave", DEFAULT_UNTIL_TICKS, had)).toThrow(/at least one tick/);
    expect(() =>
      parseUntil("needWave", DEFAULT_UNTIL_TICKS, { ticks: false, back: "soon" }),
    ).toThrow(/--until-back soon/);
  });

  it("names the tick the second pass stops on", () => {
    expect(backTick({ event: "needWave", cap: 3000, back: 200 }, 2475, 50)).toBe(2275);
  });

  it("refuses a step back that lands in the wave's own opening", () => {
    // Clamping it would take a picture of the first tick there was and let the
    // reader believe it was the one asked for — the rule `--ticks` is held to.
    expect(() => backTick({ event: "breach", cap: 3000, back: 400 }, 300, 50)).toThrow(
      /250 ticks to step back through, not 400/,
    );
  });
});

/** A driver with a script instead of a page: the named event fires on the tick
 * given, and everything else is counted. */
function fakeDriver(fires: { tick: number; type: string }, from = 0): Driver & { at: number } {
  const heard: Fired[] = [];
  const state = {
    at: from,
    async advance(n: number, until?: string): Promise<number | null> {
      const end = state.at + n;
      let stop: number | null = null;
      if (fires.tick > state.at && fires.tick <= end) {
        heard.push({ tick: fires.tick, type: fires.type });
        if (until === fires.type) stop = fires.tick;
      }
      state.at = stop ?? end;
      return stop;
    },
    async press(one: PressSpec): Promise<void> {
      heard.push({ tick: state.at, type: `pressed:${one.command.kind}` });
    },
    async tick(): Promise<number> {
      return state.at;
    },
    heard: (): readonly Fired[] => heard,
    sent: () => [],
  };
  return state;
}

describe("reaching the first frame", () => {
  it("stops on the tick the event fired, not at the end of the distance", async () => {
    const d = fakeDriver({ tick: 640, type: "breach" });
    const at = await reachFirstFrame(d, 0, { advanceBy: 0, until: { event: "breach", cap: 3000 } });
    expect(at).toBe(640);
    expect(d.at).toBe(640);
  });

  it("still lays the presses along the way", async () => {
    const d = fakeDriver({ tick: 640, type: "breach" });
    const press: PressSpec[] = [{ tick: 100, player: 1, command: { kind: "fire" } }];
    await reachFirstFrame(d, 0, { advanceBy: 0, press, until: { event: "breach", cap: 3000 } });
    expect(d.heard().map((f) => f.type)).toEqual(["pressed:fire", "breach"]);
  });

  it("counts the ticks it was given when nothing is waited for", async () => {
    const d = fakeDriver({ tick: 640, type: "breach" });
    const at = await reachFirstFrame(d, 0, { advanceBy: 300 });
    expect(at).toBeNull();
    expect(d.at).toBe(300);
  });

  it("refuses to hand back a picture of a moment that never came", async () => {
    const d = fakeDriver({ tick: 90, type: "hit" });
    const run = reachFirstFrame(d, 40, { advanceBy: 0, until: { event: "breach", cap: 200 } });
    // The words name what did fire, which is the sweep the caller would
    // otherwise go and take.
    await expect(run).rejects.toThrow(/hit@90/);
  });
});

describe("what fired", () => {
  const log: Fired[] = [
    { tick: 12, type: "beat" },
    { tick: 60, type: "beat" },
    { tick: 84, type: "destroy" },
  ];

  it("names each kind once, on the tick it first fired", () => {
    expect(firedNote(log)).toBe("fired: beat@12 (x2), destroy@84");
  });

  it("carries the first firing's own fields, so a handle can be aimed at one", () => {
    // Which socket THE SCUTTLE let go of is drawn from the seeded `Rng`, and
    // `--hold scuttlePart=…,id=N` aimed at the wrong one is dropped without a
    // sound. A type and a tick cannot answer it; the event always could.
    const said = firedNote([
      { tick: 300, type: "scuttleLoose", detail: "col=7 socket=5 live=true throwBeat=7" },
      { tick: 525, type: "scuttleLoose", detail: "col=3 socket=11 live=true throwBeat=10" },
    ]);
    expect(said).toBe("fired: scuttleLoose@300 (col=7 socket=5 live=true throwBeat=7) (x2)");
  });

  it("says so when the world was never stepped", () => {
    expect(firedNote([])).toMatch(/nothing/);
  });

  it("says how far it looked and from where", () => {
    const words = missedNote({ event: "breach", cap: 200 }, 40, log);
    expect(words).toContain("200 ticks from world.tick 40");
    expect(words).toContain("destroy@84");
    expect(words).not.toContain("--hold");
  });

  it("says a bare hold was never in the wait", () => {
    const words = missedNote({ event: "surgeRock", cap: 3000 }, 18, log, true);
    expect(words).toContain("bare --hold goes on only after this wait");
    expect(words).toContain("@<tick>");
  });
});
