import { type Layout, navHit, onReadyButton } from "@neon-spore/render";
import { type Command, guideStepped, introHolds, onReadyPage, type World } from "@neon-spore/sim";

/**
 * A press on the stage while a wave's opening is up.
 *
 * The wave has not started, so the press belongs to its opening and not to the
 * cannon. It answers exactly what the phone answers — the introduction, BACK
 * and NEXT on a page of a stepped guide, and the hold on the gate — from
 * exactly the same geometry (`render/guide-nav.ts`, `render/ready-page.ts`), so
 * a button here cannot be somewhere the phone's is not.
 *
 * One thing is deliberately unlike the phone: **the introduction takes a
 * press.** On a phone it stands for five and a half seconds and passes on its
 * own. Here it does not have to, because this is the tool somebody restarts a
 * wave on twenty times in an afternoon, and making them wait out the timer each
 * time is the thing that would get the whole opening switched off.
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
export function openingPress(
  world: World,
  layout: Layout,
  seats: readonly (1 | 2)[],
  point: { x: number; y: number },
  push: (player: 1 | 2, command: Command) => void,
): readonly (1 | 2)[] | null {
  if (introHolds(world)) {
    push(1, { kind: "brief" });
    push(2, { kind: "brief" });
    return null;
  }
  if (!guideStepped(world)) return hold(seats, push);

  // A stepped guide is paged rather than held through: BACK and NEXT are where
  // they are drawn, and only the gate has anything to hold.
  const nav = navHit(layout, point.x, point.y);
  if (nav) {
    for (const seat of seats) push(seat, { kind: "guideStep", back: nav === "back" });
    return null;
  }
  if (!onReadyPage(world, seats[0]!) || !onReadyButton(layout, point.x, point.y)) return null;
  return hold(seats, push);
}

function hold(
  seats: readonly (1 | 2)[],
  push: (player: 1 | 2, command: Command) => void,
): readonly (1 | 2)[] {
  for (const seat of seats) push(seat, { kind: "brief", on: true });
  return seats;
}
