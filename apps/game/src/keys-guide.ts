import type { Command } from "@neon-spore/sim";

/**
 * What a key means while a wave's guide is up, at a desk.
 *
 * A sibling of `keys-round.ts` and the same argument: a state that takes the
 * screen away has its own verbs, and a table next door is better than a dozen
 * more branches in `keys.ts` — which was at its length limit before this
 * existed. Nothing else reaches the ship while a guide is up (`sim/step.ts`),
 * so these four keys are free to mean something else there.
 *
 * **F and G are the two seats separately**, for a desk sitting beside a phone,
 * and each is already that seat's one *held* key. **Space is both at once**,
 * for the person at a desk playing both of them — the same answer the
 * director's stage gives in `TEST`.
 *
 * **Held, not tapped.** The gate's three keys send `on: true` here and
 * `on: false` on the keyup, so a key tapped and let go empties its circle the
 * way a thumb lifted off the glass does (`sim/ready-gate.ts`). That release is
 * sent *unconditionally* by `keys.ts` rather than through this table: one
 * skipped because the guide had just gone would leave a thumb pressed on
 * nobody's screen.
 *
 * **The sideways arrows are NEXT and BACK**, both seats at once — the desk's
 * version of the bar under the film (`render/guide-nav.ts`). Stepping to
 * another wave from inside one wave's guide was never a thing anybody meant to
 * do, and `keys.ts` falls back to that only when no guide is up.
 *
 * The introduction answers none of it. It passes on its own timer and is not a
 * thing to dismiss (the owner's own answer), so a key pressed early cannot skip
 * the wave's name before it has been read — which is why `keys.ts` asks
 * `guideHolds` and not `briefingHolds` before it calls this.
 */

export interface GuideKey {
  player: 1 | 2;
  command: Command;
}

const HOLD_P1: GuideKey[] = [{ player: 1, command: { kind: "brief", on: true } }];
const HOLD_P2: GuideKey[] = [{ player: 2, command: { kind: "brief", on: true } }];
const HOLD_BOTH: GuideKey[] = [...HOLD_P1, ...HOLD_P2];
const turn = (back: boolean): GuideKey[] => [
  { player: 1, command: { kind: "guideStep", back } },
  { player: 2, command: { kind: "guideStep", back } },
];

/** Empty when this key means nothing to a guide, which is most of them. */
export function guideKeyDown(code: string): readonly GuideKey[] {
  switch (code) {
    case "KeyF":
      return HOLD_P1;
    case "KeyG":
      return HOLD_P2;
    case "Space":
      return HOLD_BOTH;
    case "ArrowRight":
      return turn(false);
    case "ArrowLeft":
      return turn(true);
    default:
      return [];
  }
}
