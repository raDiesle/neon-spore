import {
  type Field,
  type Hold,
  type Layout,
  touchDown,
  touchMove,
  touchUp,
  type ViewRole,
} from "@neon-spore/render";
import {
  briefingHolds,
  type Command,
  guideHolds,
  type SimConfig,
  type World,
  wardenCycle,
  wardenRescuer,
} from "@neon-spore/sim";

/**
 * The stage answers a finger the way the phone does — the same `touch.ts` the
 * game calls, so the control scheme cannot disagree with itself on the screen
 * it is being judged on.
 *
 * It used to place a creature instead, which cost the editor the one thing
 * only it can answer: whether a control can actually be reached in time.
 * Placing belongs to the beat grid beside it, where a column and a beat are
 * both already visible — and where it always worked anyway.
 */

/**
 * Whose hand a grab on the field speaks for. `p1` and `p2` are unambiguous —
 * the role bar has already picked a seat, and the mouse is that seat's only
 * hand. `test` shows both seats on the one screen, so a grab there needs its
 * own answer, and the one real case where it matters is THE WARDEN's tether:
 * only the player who is *not* clamped this cycle may pull it
 * (`wardenRescuer`, `packages/sim/src/warden.ts`), and which player that is
 * flips every cycle — a seat fixed to player 1 would be right half the time
 * and silently refused the other half, which is exactly "only when it's near
 * the ship somehow." Every other grip has no such exclusivity
 * (`packages/sim/src/grip.ts`, either hand may hold anything), so outside the
 * tether the choice is arbitrary; player 1 keeps today's default and leaves
 * `G` — bound to player 2 in `keys.ts` — as the deliberate way to act as the
 * other seat.
 */
export function pointerSeat(role: ViewRole, world: World, cfg: SimConfig): 1 | 2 {
  if (role === "p1") return 1;
  if (role === "p2") return 2;
  if (world.boss?.kind === "warden") return wardenRescuer(wardenCycle(cfg, world.waveBeat));
  return 1;
}

/**
 * What `test` mode should actually be drawn as while a wave's guide is up:
 * stepped through player one's half, then player two's, before ever falling
 * back to the dual view `role` alone would ask for
 * (`packages/render/src/briefing.ts` draws that whenever it is handed
 * `"test"`). `cardStep` is the only thing that ever moves — see the
 * pointerdown handler below — this only reads it.
 *
 * The introduction before the guide is not stepped: it is the same three lines
 * on both screens, so there are no halves to walk through.
 */
export function cardRenderRole(role: ViewRole, world: World, cardStep: 0 | 1 | 2): ViewRole {
  if (role === "test" && guideHolds(world)) {
    if (cardStep === 1) return "p1";
    if (cardStep === 2) return "p2";
  }
  return role;
}

export interface StageTouch {
  canvas: HTMLCanvasElement;
  /** Read fresh: the panel is resizable and the role switches under it. */
  layout: () => Layout;
  /** The field a grab is tested against, and whose hand it is. */
  field: () => Field;
  push: (player: 1 | 2, command: Command) => void;
  /** The world a card is read off — whether one is up at all right now. */
  world: () => World;
  /** Which seat's screen the role bar is holding, the same value `field()`
   * already answers `pointerSeat` with — a card up under `test` has to be
   * stepped in words, one under `p1`/`p2` is already just the one screen the
   * phone would show, so a press dismisses it the way the phone's own
   * `bindBriefing` does. */
  role: () => ViewRole;
  /**
   * Which half of the card `test` mode is showing right now: 0 before either
   * press, 1 once player one's half is up, 2 once player two's is. Director
   * state, not world state — the sim only knows a card is up and who has
   * acked it (`Briefings.ack` in `packages/sim/src/briefing.ts`), never that
   * one screen is reading it in two turns instead of one. Kept beside `role`
   * in `stage.ts`, which is also director state about the same stage.
   */
  cardStep: () => 0 | 1 | 2;
  setCardStep: (step: 0 | 1 | 2) => void;
}

export function bindStageTouch({
  canvas,
  layout,
  field,
  push,
  world,
  role,
  cardStep,
  setCardStep,
}: StageTouch): void {
  const holding = new Map<number, Hold>();
  const at = (e: PointerEvent): { x: number; y: number } => {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  canvas.addEventListener("pointerdown", (e) => {
    // The wave has not started: the press belongs to its opening, not to the
    // cannon. This has to run before `touchDown` below ever sees the press —
    // the same order the phone plays by, where nothing but the ack reaches the
    // ship while the wave is held (`step.ts`) — so the first press after the
    // opening is gone is the first one that can move anything.
    //
    // The phone would not take a press on the introduction at all: it stands
    // for five and a half seconds and passes on its own. Here it does, because
    // this is the tool somebody restarts a wave on twenty times in an
    // afternoon, and making them wait out the timer each time is the thing
    // that would get the whole opening switched off.
    if (briefingHolds(world())) {
      e.preventDefault();
      if (role() === "test" && guideHolds(world()) && cardStep() < 2) {
        setCardStep((cardStep() + 1) as 1 | 2);
        return;
      }
      // The introduction, the third press on a guide in `test`, or the only
      // press `p1`/`p2` ever need — that screen already shows just the one
      // half, so there is nothing to step.
      setCardStep(0);
      push(1, { kind: "brief" });
      push(2, { kind: "brief" });
      return;
    }
    const p = at(e);
    const t = touchDown(layout(), p.x, p.y, field());
    if (!t) return;
    e.preventDefault();
    if (t.hold) holding.set(e.pointerId, t.hold);
    push(t.player, t.command);
  });
  canvas.addEventListener("pointermove", (e) => {
    const hold = holding.get(e.pointerId);
    if (!hold) return;
    const t = touchMove(layout(), hold, at(e).x);
    if (t) push(t.player, t.command);
  });
  // On the window, not the canvas: a thumb that leaves the picture still has
  // to let go of what it was holding.
  const lift = (e: PointerEvent): void => {
    const hold = holding.get(e.pointerId);
    if (!hold) return;
    holding.delete(e.pointerId);
    const t = touchUp(hold, field());
    if (t) push(t.player, t.command);
  };
  window.addEventListener("pointerup", lift);
  window.addEventListener("pointercancel", lift);
}
