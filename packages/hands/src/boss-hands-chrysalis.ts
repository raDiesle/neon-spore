import {
  bastionPlateWay,
  bastionTrackAt,
  bastionTrackLen,
  type ChrysalisState,
  type Color,
  chrysalisBoss,
  chrysalisGone,
  chrysalisLitStep,
  chrysalisNext,
  chrysalisPieceCol,
  chrysalisQuillOf,
  chrysalisSwelling,
  chrysalisTarget,
  chrysalisTrackOf,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";

/**
 * **THE CHRYSALIS played right**, for the autopilot, a skin at a time:
 *
 * - **The slime**: each seat presses its own half and turns the rub back one
 *   more time a message until the half is clear, then lifts.
 * - **The quills**: THE BASTION's plates (`boss-hands-bastion.ts`) — each seat
 *   takes hold of its own next quill, carries it along its track a stride a
 *   message, and lifts.
 * - **The sacs**: the navigator carries the shield under the swelling sac and
 *   the pilot raises it.
 * - **The heart**: the pilot slides the cannon under it, and the navigator
 *   fires its colour — one bolt at a time, so none is left over for the next
 *   beat.
 *
 * **A message a third of a beat**, THE LATCH's reason: the rub and the quills
 * are read from where the simulation last heard them, and a hand that sent
 * again before that landed would send twice.
 */
type Press = Omit<TimedCommand, "tick">;

export const chrysalisHand = (w: World): Press[] => {
  const s = chrysalisBoss(w);
  const step = s === null ? null : chrysalisLitStep(s);
  if (s === null || step === null) return [];
  if (step.skin === "sacs") return shield(w, s);
  if (step.skin === "heart") return shoot(w);
  const paced = w.tick % Math.max(1, Math.floor(ticksPerBeat(w.cfg) / 3)) === 0;
  if (!paced) return [];
  if (step.skin === "slime") return [...rub(s, 0), ...rub(s, 1)];
  return [...quill(w, s, 0), ...quill(w, s, 1)];
};

function rub(s: ChrysalisState, seat: 0 | 1): Press[] {
  const target = seat === 0 ? "chrysalisRubLeft" : "chrysalisRubRight";
  const player = seat === 0 ? 1 : 2;
  const at = s.rubAt[seat];
  const done = chrysalisGone(s, seat);
  if (done) return at < 0 ? [] : [say(player, target, false, at)];
  return [say(player, target, true, at < 0 ? 0 : at + 1)];
}

function say(
  player: 1 | 2,
  target: "chrysalisRubLeft" | "chrysalisRubRight",
  on: boolean,
  id: number,
): Press {
  return { player, command: { kind: "drag", target, on, fromMilli: 0, fromYMilli: 0, id } };
}

function quill(w: World, s: ChrysalisState, seat: 0 | 1): Press[] {
  const target = seat === 0 ? "chrysalisQuillLeft" : "chrysalisQuillRight";
  const player = seat === 0 ? 1 : 2;
  const i = chrysalisQuillOf(s, seat);
  if (i < 0) return [];
  if (!s.down[seat]) return [{ player, command: { kind: "drag", target, on: true, fromMilli: 0 } }];
  if (s.tore[seat]) return [{ player, command: { kind: "drag", target, on: false, fromMilli: 0 } }];
  const track = chrysalisTrackOf(s, i);
  const to = Math.min(bastionTrackLen(w.cfg, track), s.pullMilli[seat] + STRIDE);
  const at =
    track === "straight"
      ? beyond(i, w.cfg.bastionPullMilli + 300)
      : bastionTrackAt(w.cfg, track, i, to);
  const command = { kind: "drag", target, on: true, fromMilli: at.x, fromYMilli: at.y } as const;
  return [{ player, command }];
}

/** How far along its track a quill is carried a message: well inside the stride the simulation allows. */
const STRIDE = 900;

/** A straight quill's way out, `far` along it. */
function beyond(i: number, far: number): { x: number; y: number } {
  const [wx, wy] = bastionPlateWay(i);
  return { x: Math.round((wx * far) / 1000), y: Math.round((wy * far) / 1000) };
}

function shoot(w: World): Press[] {
  const target = chrysalisTarget(w);
  if (target === null) return [];
  const color: Color = target.color;
  const aim: Press = { player: 1, command: { kind: "cannonCol", col: target.col } };
  if (w.cannonCol !== target.col || (w.charge === null ? 0 : 1) + w.bullets.length > 0) {
    return [aim];
  }
  return [aim, { player: 2, command: { kind: "fire", color } }];
}

function shield(w: World, s: ChrysalisState): Press[] {
  if (!chrysalisSwelling(s)) return [];
  const col = chrysalisPieceCol(w, s, chrysalisNext(s));
  if (w.shieldCol !== col) return [{ player: 2, command: { kind: "shieldCol", col } }];
  return [{ player: 1, command: { kind: "guard" } }];
}
