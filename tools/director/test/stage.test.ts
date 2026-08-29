import { describe, expect, it } from "bun:test";
import { controlSetForWave } from "@neon-spore/content";
import { computeLayout, type ViewRole } from "@neon-spore/render";
import {
  ackBriefing,
  briefingHolds,
  type Command,
  createWorld,
  DEFAULT_CONFIG,
  PAIR_ON,
  startWave,
} from "@neon-spore/sim";
import { bindStageTouch, pointerSeat } from "../src/stage-touch.js";

/**
 * THE DIRECTOR DRAWS "TAP TO RESTART" AND NOTHING IS LISTENING.
 *
 * `balance.ts` (in `packages/render`, not owned here) writes "tap to restart"
 * onto the after-run screen. The director never answered that instruction:
 * `bindStageTouch` binds `pointerdown` on `#stage`, but a pointerdown that
 * finds no field command (there is none once `world.over`) does nothing, and
 * `▣ SHEET` (`#endRun`) only ever called `endRun` — a second press re-ended an
 * already-ended run, so the button read as dead too.
 *
 * Both dismissals now live in `stage-afterrun.ts`, which is dependency-injected
 * the same way `stage-interlude.ts` is (a stub canvas and a stub button rather
 * than `document.getElementById`), so this is a real behavioural test — the
 * canvas click restarts, and a second `#endRun` press un-ends the run — rather
 * than the source-regex `stage.ts` itself would have needed, since `bindStage`
 * is still `ResizeObserver` and `requestAnimationFrame` end to end and this
 * repo's test runner carries no DOM. Whether the field actually comes back at
 * tempo is a browser question, not a `bun test` one — see the `Check:` trailer
 * on the commit that added this file.
 */

type Listener = () => void;

/** The smallest clickable thing: an element that remembers who is listening. */
function stubClickable() {
  const listeners: Listener[] = [];
  return {
    el: {
      addEventListener: (type: string, fn: Listener) => {
        if (type === "click") listeners.push(fn);
      },
      textContent: "",
    } as unknown as HTMLElement,
    click: (): void => {
      for (const fn of listeners) fn();
    },
  };
}

// Reassigned fresh by every `armed()` call, so each test's button carries only
// its own listener — `bindStageAfterRun` looks it up once, by id, itself.
let currentEndRunBtn = stubClickable();
(globalThis as unknown as { document: unknown }).document = {
  getElementById: (id: string) => (id === "endRun" ? currentEndRunBtn.el : null),
};

const { bindStageAfterRun } = await import("../src/stage-afterrun.js");

function armed() {
  let world = createWorld(DEFAULT_CONFIG, 10);
  let running = true;
  let rebuilds = 0;
  let paintPlays = 0;
  const canvas = stubClickable();
  currentEndRunBtn = stubClickable();
  const endRunBtn = currentEndRunBtn;
  const handle = bindStageAfterRun({
    canvas: canvas.el as unknown as HTMLCanvasElement,
    world: () => world,
    rebuild: () => {
      rebuilds++;
      world = createWorld(DEFAULT_CONFIG, 10);
    },
    setRunning: (r) => {
      running = r;
    },
    paintPlay: () => {
      paintPlays++;
    },
  });
  return {
    canvas,
    endRunBtn,
    handle,
    world: () => world,
    running: () => running,
    rebuilds: () => rebuilds,
    paintPlays: () => paintPlays,
  };
}

describe("the stage answers its own after-run screen", () => {
  it("a click on the canvas does nothing while the run is live", () => {
    const s = armed();
    s.canvas.click();
    expect(s.rebuilds()).toBe(0);
  });

  it("a click on the canvas restarts the wave once the run is over", () => {
    const s = armed();
    s.world().over = true;
    s.canvas.click();
    expect(s.rebuilds()).toBe(1);
  });

  it("a first ▣ SHEET press ends the run and pauses", () => {
    const s = armed();
    s.endRunBtn.click();
    expect(s.world().over).toBe(true);
    expect(s.running()).toBe(false);
    expect(s.paintPlays()).toBe(1);
    expect(s.endRunBtn.el.textContent).toBe("▣ FIELD");
  });

  it("a second ▣ SHEET press un-ends the run in place instead of re-ending it", () => {
    const s = armed();
    s.endRunBtn.click();
    s.endRunBtn.click();
    expect(s.world().over).toBe(false);
    expect(s.running()).toBe(true);
    expect(s.rebuilds()).toBe(0); // un-ending, not rebuilding
    expect(s.endRunBtn.el.textContent).toBe("▣ SHEET");
  });

  it("the handle repaints the label to match whatever `over` is now", () => {
    const s = armed();
    s.world().over = true;
    s.handle.paint();
    expect(s.endRunBtn.el.textContent).toBe("▣ FIELD");
  });
});

/**
 * `↺ WAVE` REPLAYS THE WAVE'S OPENING THE WAY A FRESH PAIR MEETS IT.
 *
 * `stage.ts`'s `rebuild()` calls `createWorld` before every `startWave`, and
 * `createWorld` always hands back a fresh `Briefings` (`met: 0`). So with
 * both PAIR_ON toggles lit — briefings and THE FORK, the two switches the
 * owner's "card and briefing" both refers to — resetting a wave is never
 * "what has this run already taught", it is always "what would a pair who
 * has met nothing see", the same fresh-pair rule `wave-briefing.ts` already
 * uses on purpose for the CARDS gallery. This test does the same two calls
 * `rebuild()` makes, without a DOM, and checks the card opens immediately
 * and reopens identically on the next reset rather than staying dismissed.
 */
describe("a fresh reset opens the wave's card, every time", () => {
  const cfg = { ...DEFAULT_CONFIG, ...PAIR_ON };
  const queue = [{ beat: 0, col: 0, kind: "slick" as const, color: null }];

  it("the card is up the instant the wave starts, not after a delay", () => {
    const world = createWorld(cfg, 0);
    startWave(world, 0, queue);
    expect(briefingHolds(world)).toBe(true);
  });

  it("dismissing it does not survive a rebuild — the next world is fresh again", () => {
    const first = createWorld(cfg, 0);
    startWave(first, 0, queue);
    // "opening" is due on every first wave alongside "slick" (`briefing.ts`),
    // so this wave opens two cards — both dismissed here, one pair at a time.
    while (briefingHolds(first)) {
      ackBriefing(first, 1);
      ackBriefing(first, 2);
    }
    expect(briefingHolds(first)).toBe(false);

    // `rebuild()` never reuses `first` — it builds a new `World`, exactly as
    // `stage.ts:112` does, so `met` cannot have carried anything forward.
    const second = createWorld(cfg, 0);
    startWave(second, 0, queue);
    expect(briefingHolds(second)).toBe(true);
  });
});

/**
 * THE STAGE IS THE BUTTON, AND A CARD IN `test` STEPS THROUGH IT.
 *
 * `bindStageTouch`'s own `pointerdown` listener now answers a card the way
 * `apps/game/src/briefing.ts` answers one on the phone — the press, not a
 * separate `✓ CARD` button (now gone from `stage-transport.ts`). The one
 * thing the phone never had to decide is which half to show, because a phone
 * only ever holds one seat; `test` holds both, so the field is stepped:
 * first press reveals player one's half, second player two's, third puts the
 * card away — and only then does a press reach the cannon.
 *
 * `push` here plays the sim's own part for a `brief` command
 * (`ackBriefing`, `packages/sim/src/step.ts`) rather than pulling in the
 * whole scheduler: this file is testing the director's wiring, and
 * `packages/sim/test/briefing.test.ts` already owns whether `ackBriefing`
 * itself is correct.
 */
describe("bindStageTouch steps a `test`-mode card and swallows the press until it is gone", () => {
  const VIEWPORT = { width: 400, height: 800, dpr: 1 };
  const cfg = { ...DEFAULT_CONFIG, ...PAIR_ON };
  // A single creature keeps this to exactly two cards due: "opening" (every
  // first wave) and "slick" (what the queue actually contains) — enough to
  // prove a card that opens right behind the one just dismissed starts its
  // own step over from player one, not from wherever the last card left off.
  const queue = [{ beat: 0, col: 0, kind: "slick" as const, color: null }];

  type Listener = (e: unknown) => void;

  function stubCanvas() {
    const on = new Map<string, Listener[]>();
    const add =
      (map: Map<string, Listener[]>) =>
      (type: string, fn: Listener): void => {
        const list = map.get(type) ?? [];
        list.push(fn);
        map.set(type, list);
      };
    (globalThis as { window?: unknown }).window = { addEventListener: add(on) };
    return {
      canvas: {
        addEventListener: add(on),
        getBoundingClientRect: () => ({
          left: 0,
          top: 0,
          width: VIEWPORT.width,
          height: VIEWPORT.height,
        }),
      } as unknown as HTMLCanvasElement,
      fire(type: string, e: unknown): void {
        for (const fn of on.get(type) ?? []) fn(e);
      },
    };
  }

  function armed(role: ViewRole) {
    const world = createWorld(cfg, 0);
    startWave(world, 0, queue);
    let step: 0 | 1 | 2 = 0;
    const sent: { player: 1 | 2; command: Command }[] = [];
    const stub = stubCanvas();
    bindStageTouch({
      canvas: stub.canvas,
      layout: () => computeLayout(VIEWPORT, cfg, role),
      field: () => ({
        creatures: world.creatures,
        beatPhase: 0,
        seat: pointerSeat(role, world, cfg),
        wardenRow: cfg.wardenRow,
        controls: controlSetForWave(world.wave),
      }),
      push: (player, command) => {
        sent.push({ player, command });
        // Stand-in for `step()`: the sim only acks a `brief` while a card
        // holds, and only that command means anything then (`step.ts`).
        if (command.kind === "brief") ackBriefing(world, player);
      },
      world: () => world,
      role: () => role,
      cardStep: () => step,
      setCardStep: (s) => {
        step = s;
      },
    });
    const layout = computeLayout(VIEWPORT, cfg, role);
    const press = (): void =>
      stub.fire("pointerdown", {
        pointerId: 1,
        clientX: VIEWPORT.width / 2,
        clientY: layout.cannonStrip.y,
        preventDefault: () => {},
      });
    return { press, sent, world, step: () => step };
  }

  it("presses one and two swallow, revealing nothing the sim ever hears about", () => {
    const s = armed("test");
    s.press();
    expect(s.step()).toBe(1);
    expect(s.sent).toEqual([]);
    s.press();
    expect(s.step()).toBe(2);
    expect(s.sent).toEqual([]);
    expect(briefingHolds(s.world)).toBe(true);
  });

  it("the third press dismisses the card up, and the next one starts its own step over", () => {
    const s = armed("test");
    s.press();
    s.press();
    s.press(); // dismiss "opening"
    expect(s.sent).toEqual([
      { player: 1, command: { kind: "brief" } },
      { player: 2, command: { kind: "brief" } },
    ]);
    expect(s.step()).toBe(0);
    expect(briefingHolds(s.world)).toBe(true); // "slick" is still due

    s.press(); // "slick"'s own player one, not player two
    expect(s.step()).toBe(1);
  });

  it("only the press that empties the queue lets the next one reach the cannon", () => {
    const s = armed("test");
    for (let i = 0; i < 6; i++) s.press(); // both cards, three presses each
    expect(briefingHolds(s.world)).toBe(false);
    s.sent.length = 0;

    s.press();
    expect(s.sent).toEqual([
      { player: 1, command: { kind: "cannonCol", col: expect.any(Number) } },
    ]);
  });

  it("a single seat's own screen (p1/p2) is dismissed on the one press it gets, unstepped", () => {
    const s = armed("p1");
    s.press();
    expect(s.sent).toEqual([
      { player: 1, command: { kind: "brief" } },
      { player: 2, command: { kind: "brief" } },
    ]);
    // `cardStep` never left 0 — `role() !== "test"` never steps at all.
    expect(s.step()).toBe(0);
  });
});
