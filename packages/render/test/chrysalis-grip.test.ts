import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { type ControlSet, controlSet } from "@neon-spore/content";
import {
  bastionTrackAt,
  bastionTrackLen,
  type ChrysalisState,
  type Command,
  chrysalisQuillOf,
  chrysalisRubsOf,
  chrysalisTrackOf,
  step,
  type World,
} from "@neon-spore/sim";
import { type ChrysalisMark, chrysalisMarkAt } from "../src/chrysalis-grip.js";
import { ChrysalisVerdicts } from "../src/chrysalis-verdicts.js";
import { handleCircle } from "../src/handle-place.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { type Field, touchDown, touchUp } from "../src/touch.js";
import { touchMove } from "../src/touch-move.js";
import { hung, posed } from "./chrysalis-harness.js";
import { CFG, FRAME_TIMEOUT_MS, VIEWPORT } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **Real thumbs on THE CHRYSALIS** (`render/src/chrysalis-grip.ts`): whether
 * the knob and the half the picture draws are where a press is taken, on
 * either seat's screen; whether a thumb carried along a quill's track rips
 * it, and one let go short sinks it back; whether a rub on a seat's own half
 * takes hold for the host to count; and whether the partner's mark is
 * pressed through for the simulation to refuse aloud — each answered by the
 * verdict ring (`chrysalis-verdicts.ts`).
 */

const STANDARD: ControlSet = controlSet("default");
const layout = (role: ViewRole): Layout => computeLayout(VIEWPORT, CFG, role);

function field(world: World, seat: 1 | 2): Field {
  return {
    creatures: world.creatures,
    cannonCol: world.cannonCol,
    shieldCol: world.shieldCol,
    beatPhase: 0,
    skinY: null,
    beat: world.beat,
    waveBeat: world.waveBeat,
    tick: world.tick,
    seat,
    cfg: CFG,
    boss: world.boss,
    controls: STANDARD,
    faults: [],
    well: false,
  };
}

function send(world: World, player: 1 | 2, command: Command | null | undefined): string[] {
  step(world, command ? [{ tick: world.tick, player, command }] : []);
  return world.events.map((e) => e.type);
}

function cocoon(world: World): ChrysalisState {
  const s = world.boss;
  if (s?.kind !== "chrysalis") throw new Error("no cocoon");
  return s;
}

function press(world: World, role: ViewRole, seat: 1 | 2, mark: ChrysalisMark) {
  const at = chrysalisMarkAt(layout(role), CFG, cocoon(world), mark);
  return touchDown(layout(role), at.x, at.y, field(world, seat));
}

/** A quill pressed on `seat`'s own knob and carried `milli` along its track — to its end by default. */
function pull(world: World, seat: 1 | 2, milli?: number) {
  const s = cocoon(world);
  const role = seat === 1 ? "p1" : "p2";
  const l = layout(role);
  const down = press(world, role, seat, seat === 1 ? 0 : 1);
  send(world, seat, down?.command);
  if (down?.hold?.kind !== "drag") throw new Error("the press took no hold");
  const i = chrysalisQuillOf(s, seat === 1 ? 0 : 1);
  const track = chrysalisTrackOf(s, i);
  const to = milli ?? bastionTrackLen(CFG, track);
  const moved: string[] = [];
  let at = { x: down.hold.originX, y: down.hold.originY };
  for (let m = Math.min(330, to); ; m = Math.min(to, m + 330)) {
    const p = bastionTrackAt(CFG, track, i, m);
    at = {
      x: down.hold.originX + (p.x / 1000) * l.tile,
      y: down.hold.originY + (p.y / 1000) * l.tile,
    };
    moved.push(...send(world, seat, touchMove(l, down.hold, at.x, at.y)?.command));
    if (m >= to) break;
  }
  return { l, hold: down.hold, at, moved };
}

/** `seat`'s half rubbed `turns` turns, as the host that counts them sends them (`rub-turns.ts`). */
function rub(world: World, seat: 1 | 2, turns: number): string[] {
  const target = seat === 1 ? "chrysalisRubLeft" : "chrysalisRubRight";
  const heard: string[] = [];
  for (let id = 1; id <= turns; id++) {
    const command = { kind: "drag", target, on: true, fromMilli: 0, fromYMilli: 0, id } as const;
    heard.push(...send(world, seat, command));
  }
  return heard;
}

describe("thumbs on THE CHRYSALIS", () => {
  it("answers a press where each knob is drawn, and the handle stands there too", () => {
    const world = hung();
    for (const [role, seat, mark, target] of [
      ["p1", 1, 0, "chrysalisQuillLeft"],
      ["p2", 2, 1, "chrysalisQuillRight"],
    ] as const) {
      const s = posed(world, "quills");
      expect(handleCircle(layout(role), world, target, 0)).toMatchObject(
        chrysalisMarkAt(layout(role), CFG, s, mark),
      );
      const down = press(world, role, seat, mark);
      expect(down?.command).toMatchObject({ target, on: true, fromMilli: 0, fromYMilli: 0 });
      expect(down?.hold?.kind).toBe("drag");
    }
  });

  it("takes hold of a seat's own half of slime for the host to count, and sends nothing yet", () => {
    const world = hung();
    for (const [role, seat, mark, target] of [
      ["p1", 1, 2, "chrysalisRubLeft"],
      ["p2", 2, 3, "chrysalisRubRight"],
    ] as const) {
      posed(world, "slime");
      const down = press(world, role, seat, mark);
      expect(down?.command).toBeNull();
      expect(down?.hold).toMatchObject({ kind: "drag", target, rub: true });
    }
  });

  it("takes no hold on a mark whose skin is not lit", () => {
    const world = hung();
    posed(world, "slime");
    expect(handleCircle(layout("p1"), world, "chrysalisQuillLeft", 0)).toBeNull();
    posed(world, "quills");
    expect(handleCircle(layout("p1"), world, "chrysalisRubLeft", 0)).toBeNull();
    posed(world, "sacs");
    expect(press(world, "p1", 1, 0)).toBeNull();
  });

  it("rips a quill carried along its track to the end, and sinks one let go short", () => {
    const world = hung();
    const s = posed(world, "quills");
    const ripped = pull(world, 1);
    expect(ripped.moved).toContain("chrysalisRip");
    expect(s.goneMask).not.toBe(0);
    const short = pull(world, 2, 800);
    expect(s.pullMilli[1]).toBeGreaterThan(500);
    const up = touchUp(short.l, short.hold, short.at);
    expect(send(world, 2, up?.command)).toContain("chrysalisSnap");
  });

  it("wipes a half rubbed its turns, and that half alone", () => {
    const world = hung();
    const s = posed(world, "slime");
    expect(rub(world, 2, chrysalisRubsOf(s))).toContain("chrysalisWipe");
    expect(s.rubbed).toEqual([0, chrysalisRubsOf(s)]);
  });

  it("presses the partner's mark through, for the simulation to say no", () => {
    const world = hung();
    const s = posed(world, "quills");
    const quill = press(world, "p1", 1, 1);
    expect(quill?.command).toMatchObject({ target: "chrysalisQuillRight", on: true });
    expect(quill?.hold?.kind).toBe("drag");
    expect(send(world, 1, quill?.command)).toContain("chrysalisWrong");
    expect(s.down).toEqual([false, false]);
    posed(world, "slime");
    const half = press(world, "p2", 2, 2);
    expect(half?.hold).toBeNull();
    expect(send(world, 2, half?.command)).toContain("chrysalisWrong");
  });

  it("greens a quill ripped and a half wiped, and reddens the partner's mark pressed", () => {
    const world = hung();
    const v = new ChrysalisVerdicts();
    v.note(posed(world, "quills"));
    pull(world, 2);
    v.ingest(world.events);
    expect(v.verdicts.at(1)?.good).toBe(true);
    send(world, 1, press(world, "p1", 1, 1)?.command);
    v.ingest(world.events);
    expect(v.verdicts.at(1)?.good).toBe(false);
    const s = posed(world, "slime");
    v.note(s);
    rub(world, 1, chrysalisRubsOf(s));
    v.ingest(world.events);
    expect(v.verdicts.at(2)?.good).toBe(true);
    send(world, 1, press(world, "p1", 1, 3)?.command);
    v.ingest(world.events);
    expect(v.verdicts.at(3)?.good).toBe(false);
  });
});
