import { describe, expect, it } from "bun:test";
import type { Driver } from "../drive.js";
import { reachFirstFrame } from "../reach.js";
import type { PressSpec } from "../spec.js";
import type { Fired } from "../until.js";

/**
 * **`--until` with presses that go on past the event.** The wait was handed to
 * the last stretch of the press plan only, so a run pressing a guard every
 * beat and waiting for `shieldPush` walked past the push blind and reported it
 * missed (`reach.ts`). And `--until-on N` stepped on from the event with no
 * presses at all, so a press inside those N ticks was never heard.
 */

/** A driver with a script instead of a page: `event` fires on `tick`, and a
 * press is logged on the tick it was sent. */
function scripted(tick: number, event: string): Driver & { at: number } {
  const heard: Fired[] = [];
  const state = {
    at: 0,
    async advance(n: number, until?: string): Promise<number | null> {
      const end = state.at + n;
      let stop: number | null = null;
      if (tick > state.at && tick <= end) {
        heard.push({ tick, type: event });
        if (until === event) stop = tick;
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

const guard = (tick: number): PressSpec => ({ tick, player: 1, command: { kind: "guard" } });
const said = (d: Driver): string[] => d.heard().map((f) => `${f.type}@${f.tick}`);

describe("--until with presses past the event", () => {
  it("stops on the event between two presses, and sends none after it", async () => {
    const d = scripted(640, "shieldPush");
    const press = [guard(100), guard(700), guard(800)];
    const until = { event: "shieldPush", cap: 3000 };
    const at = await reachFirstFrame(d, 0, { advanceBy: 0, press, until });
    expect(at).toBe(640);
    expect(d.at).toBe(640);
    expect(said(d)).toEqual(["pressed:guard@100", "shieldPush@640"]);
  });

  it("hears the presses inside --until-on's ticks, and none beyond them", async () => {
    const d = scripted(640, "shieldPush");
    const press = [guard(100), guard(700), guard(900)];
    const until = { event: "shieldPush", cap: 3000, on: 150 };
    const at = await reachFirstFrame(d, 0, { advanceBy: 0, press, until });
    expect(at).toBe(640);
    expect(d.at).toBe(790);
    expect(said(d)).toEqual(["pressed:guard@100", "shieldPush@640", "pressed:guard@700"]);
  });

  it("counts the step on from where the run began, not from tick zero", async () => {
    const d = scripted(640, "shieldPush");
    d.at = 40;
    const press = [guard(660)];
    const until = { event: "shieldPush", cap: 3000, on: 50 };
    await reachFirstFrame(d, 40, { advanceBy: 0, press, until });
    // The press is at 660 on the run's own line, which starts at tick 40: the
    // event is 600 in, so the press is 60 past it — beyond a step on of 50.
    expect(said(d)).toEqual(["shieldPush@640"]);
    expect(d.at).toBe(690);
  });
});
