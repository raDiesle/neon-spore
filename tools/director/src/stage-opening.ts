import { waveHasGuide } from "@neon-spore/content";
import { type Layout, lostHit, navHit, onNavBar } from "@neon-spore/render";
import {
  type Command,
  guidePage,
  guidePages,
  introHolds,
  lostAsks,
  onReadyPage,
  type World,
} from "@neon-spore/sim";

/**
 * A press on the stage while a wave's opening is up.
 *
 * The wave has not started, so the press belongs to its opening and not to the
 * cannon. It answers exactly what the phone answers — the introduction, the
 * four buttons on a page of a stepped guide, and the hold that fills the gate
 * — from exactly the same geometry (`render/guide-nav.ts`), so a button here
 * cannot be somewhere the phone's is not. The gate is the whole page minus that
 * bar, on the owner's instruction, and so it is here too.
 *
 * One thing is deliberately unlike the phone: **the introduction takes a
 * press.** On a phone it stands for five and a half seconds and passes on its
 * own. Here it does not have to, because this is the tool somebody restarts a
 * wave on twenty times in an afternoon, and making them wait out the timer each
 * time is the thing that would get the whole opening switched off.
 *
 * The lost screen is answered here too (`render/lost-screen.ts`): its buttons
 * are where the phone draws them, and a press on any of them speaks for both
 * seats, which is what the phone's press does as well. `lostHit` names them as
 * the commands they send, so there is nothing to translate.
 *
 * Its own file beside `stage-touch.ts` because that file is about the *ship* —
 * a hold, a hand, a column — and this is about the two screens in front of it.
 * They only ever shared one listener.
 *
 * `seats` is whose thumbs this screen speaks for, worked out by the caller —
 * `test` is both, one hand filling both circles, which is the owner's own answer
 * for a desk with one mouse and two seats to read (`render/ready-circles.ts`).
 * Returns the seats whose thumbs are now down, so the caller can let them go on
 * the lift, or `null` when the press did not begin a hold.
 */
export interface OpeningPress {
  world: World;
  layout: Layout;
  /** Whose thumbs this screen speaks for — `test` is both at once. */
  seats: readonly (1 | 2)[];
  point: { x: number; y: number };
  push: (player: 1 | 2, command: Command) => void;
  /** REPLAY, which is the renderer's and not the world's. */
  replay: () => void;
}

export function openingPress(p: OpeningPress): readonly (1 | 2)[] | null {
  const { world, layout, seats, point, push } = p;
  if (lostAsks(world)) {
    const hit = lostHit(layout, point.x, point.y, waveHasGuide(world.wave));
    if (hit) {
      push(1, { kind: hit });
      push(2, { kind: hit });
    }
    return null;
  }
  if (introHolds(world)) {
    push(1, { kind: "brief" });
    push(2, { kind: "brief" });
    return null;
  }
  // A guide is paged rather than held through: the four buttons are where they
  // are drawn, and only the gate has anything to hold.
  // SKIP is every page forward and the hold, on the same tick, and nothing
  // lets go of it — the phone's own (`apps/game/src/briefing.ts`). REPLAY on
  // the gate is every page back to the first.
  const nav = navHit(layout, point.x, point.y);
  const turn = (back: boolean, times = 1): void => {
    for (const seat of seats)
      for (let i = 0; i < times; i++) push(seat, { kind: "guideStep", back });
  };
  if (nav === "skip") {
    turn(false, guidePages(world));
    hold(seats, push);
  } else if (nav === "replay" && onReadyPage(world, seats[0]!)) {
    turn(true, guidePage(world, seats[0]!));
  } else if (nav === "replay") p.replay();
  else if (nav) turn(nav === "back");
  if (nav) return null;
  if (!onReadyPage(world, seats[0]!) || onNavBar(layout, point.y)) return null;
  return hold(seats, push);
}

function hold(
  seats: readonly (1 | 2)[],
  push: (player: 1 | 2, command: Command) => void,
): readonly (1 | 2)[] {
  for (const seat of seats) push(seat, { kind: "brief", on: true });
  return seats;
}
