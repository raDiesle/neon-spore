import { expect, test } from "bun:test";
import { gaugeBandAsks } from "../src/gauge-hand.js";
import { gaugeRoundHeard } from "../src/gauge-round.js";
import {
  type Command,
  createWorld,
  DEFAULT_CONFIG,
  type GaugeState,
  gaugeRound,
  type SimEvent,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "../src/index.js";

/**
 * THE GAUGE's band answering a touch the way every mark does, as far as its
 * split lets it: when it is asked (`gaugeBandAsks`), a thumb landing said once
 * (`gaugeHold`), and a thumb from the wrong seat said nothing at all — the one
 * thing a refusal would tell is what the round keeps from that seat
 * (`gauge-hand.ts`). `gauge-bind.test.ts` holds the bind itself.
 */

const TPB = ticksPerBeat(DEFAULT_CONFIG);

function playing(): { world: World; g: GaugeState } {
  const world = createWorld(DEFAULT_CONFIG, 5);
  startWave(world, 4, [], [], { kind: "gauge" });
  const g = gaugeRound(world);
  if (g === null) throw new Error("the gauge's wave installed no gauge");
  for (let i = 0; g.phase !== "play" && i < 40 * TPB; i++) step(world, []);
  expect(g.phase).toBe("play");
  return { world, g };
}

const band = (on: boolean): Command => ({ kind: "drag", target: "gaugeBand", on, fromMilli: 0 });

/** What one command says, and nothing the tick before it said. */
function said(world: World, player: 1 | 2, command: Command): SimEvent[] {
  world.events.length = 0;
  gaugeRoundHeard(world, player, command);
  return world.events.filter((e) => e.type === "gaugeHold");
}

test("the band is asked only in the play and only while it is wound", () => {
  const { g } = playing();
  expect(gaugeBandAsks(g)).toBe(false);
  g.boundBeat = 3;
  expect(gaugeBandAsks(g)).toBe(true);
  g.phase = "verdict";
  expect(gaugeBandAsks(g)).toBe(false);
});

test("her thumb landing on the wound band is said once", () => {
  const { world, g } = playing();
  g.boundBeat = world.beat;
  expect(said(world, 2, band(true))).toEqual([{ type: "gaugeHold", part: "band" }]);
  expect(said(world, 2, band(true))).toEqual([]);
  expect(g.openThumb).toBe(true);
});

test("the wrong seat's thumb, or a band not wound, says nothing and holds nothing", () => {
  const { world, g } = playing();
  expect(said(world, 2, band(true))).toEqual([]);
  g.boundBeat = world.beat;
  expect(said(world, 1, band(true))).toEqual([]);
  expect(g.openThumb).toBe(false);
});
