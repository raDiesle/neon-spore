import type { ViewRole, ViewState } from "@neon-spore/render";
import {
  framePhase,
  type SimConfig,
  type SimEvent,
  step,
  type TimedCommand,
  type World,
} from "@neon-spore/sim";
import type { Keys } from "./keys.js";

/**
 * **One tick of the stage's world, and one frame of its picture.**
 *
 * Next door in `stage-loop.ts` is *when* these two are called — a fixed
 * timestep, a catch-up cap, and an observer that stops the whole thing while
 * the canvas is off screen. This is *what they do*, and the two were together
 * in `stage.ts` until that file sat at 250 lines exactly and the lane that got
 * it there had to fold a comment down to buy the last one. The seam is the one
 * the loop already had: nothing here reads the DOM, looks up an element or
 * knows what a transport button is.
 *
 * So the pieces arrive as calls rather than as the objects that own them, the
 * way `stage-afterrun.ts` and `stage-repeat.ts` take theirs — which is also
 * what makes this the first part of the stage's own running that `bun test`
 * can drive. `bindStage` is `ResizeObserver` and `requestAnimationFrame` end to
 * end, so what was in it could only ever be proved in a browser.
 */
export interface StageStepParts {
  cfg: SimConfig;
  /** The world being played, asked for every time: `rebuild` swaps it. */
  world(): World;
  /** Where a frame goes. Narrower than `Canvas2DRenderer` on purpose. */
  renderer: { draw(seen: ViewState): void };
  keys: Pick<Keys, "drain">;
  /** AUTO's commands for this tick, beside the desk's (`stage-autopilot.ts`). */
  auto?(w: World): TimedCommand[];
  /** The transport. False holds the world still while frames keep coming. */
  running(): boolean;
  role(): ViewRole;
  controls(): ViewState["controls"];
  guide(): ViewState["guide"];
  hand(): ViewState["hand"];
  pointer(): ViewState["pointer"];
  /**
   * Said once when the wave's row changes, which is what the map follows: the
   * wave's own beat, not the tick's. It stands on the first row through the
   * introduction and the guide, and on the row the wave ended on through the
   * lost screen and the rest after a clear — the tick counts through all four
   * and the map used to walk on down past the end of the wave with it.
   */
  onBeat(beat: number): void;
  onFrame(): void;
  /**
   * A run that has ended and wants another. `retry` is a lost wave, which has
   * asked on the field's own screen already; the other is a cleared one, and
   * the next wave *here* is the one being edited (`stage-repeat.ts`).
   */
  onNeedWave(retry: boolean): void;
}

export interface StageStep {
  /** One tick, or the paused stand-in for one. The loop's `advance`. */
  advance(): void;
  /** One tick of the world whatever the transport says — what SEEK and the
   * page's own handle step with. */
  stepOnce(): void;
  paint(dt: number): void;
  /** The beat the field is holding. */
  beat(): number;
  /** A fresh world has been stood up: the beat is zero, and said so. */
  opened(): void;
}

export function stageStep(parts: StageStepParts): StageStep {
  const { world, renderer, keys } = parts;
  /**
   * Everything the simulation reported since the last frame. A frame covers
   * several ticks and `world.events` is cleared every one of them, so they are
   * collected here and handed over whole.
   */
  let frameEvents: SimEvent[] = [];
  let lastBeat = -1;

  const stepOnce = (): void => {
    const w = world();
    // Asked before the step, so the tick that clears the wave still moves the
    // map onto the row it cleared on, and every tick of the rest after it
    // leaves it there. A lost wave and a briefing hold `waveBeat` still on
    // their own; a clear's rest keeps counting it (`wave-end.ts`).
    const live = !w.over && w.restBeat === 0;
    const auto = parts.auto?.(w) ?? [];
    step(w, auto.length > 0 ? [...keys.drain(w.tick), ...auto] : keys.drain(w.tick));
    if (w.events.length > 0) {
      frameEvents.push(...w.events);
      for (const e of w.events) if (e.type === "needWave") parts.onNeedWave(e.retry === true);
    }
    if (live && w.waveBeat !== lastBeat) {
      lastBeat = w.waveBeat;
      parts.onBeat(lastBeat);
    }
  };

  return {
    stepOnce,
    advance(): void {
      // Paused, the keys are still drained: a thumb held through a pause is a
      // command that would otherwise arrive on the tick after it, out of the
      // hand that meant it.
      if (!parts.running()) {
        keys.drain(world().tick);
        return;
      }
      stepOnce();
    },
    paint(dt: number): void {
      renderer.draw({
        world: world(),
        beatPhase: framePhase(world()),
        role: parts.role(),
        time: performance.now() / 1000,
        dt,
        events: frameEvents,
        running: parts.running(),
        controls: parts.controls(),
        guide: parts.guide(),
        hand: parts.hand(),
        pointer: parts.pointer(), // whatever a desk's mouse is resting on
      });
      frameEvents = [];
      parts.onFrame();
    },
    beat: () => lastBeat,
    opened(): void {
      lastBeat = 0;
      parts.onBeat(0);
    },
  };
}
