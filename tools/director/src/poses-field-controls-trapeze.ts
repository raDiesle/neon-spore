import { type TrapezeStep, trapezeOpenZone, type World } from "@neon-spore/sim";
import { fresh, type Pose, runUntil } from "./pose-kit.js";

/**
 * THE TRAPEZE's controls, **each photographed from the seat whose control it
 * is**, because that is the screen it is drawn loud on. A gallery pose is run
 * to, never set (`.claude/skills/new-boss` §4).
 */

/** Act 13's first level, then its last: P1 left and P2 right, and the lock. */
const PUSH: TrapezeStep[] = [{ ask: "push", gongSide: 1, gongMilli: 10000, beats: 32 }];
const LOCK: TrapezeStep[] = [{ ask: "lock", gongSide: -1, gongMilli: 18000, beats: 48 }];

/** The level lit, and the swing coming back over `zone`. */
function open(zone: -1 | 1): World {
  const w = fresh([], [], { kind: "trapeze", steps: PUSH });
  runUntil(
    w,
    `the ${zone < 0 ? "left" : "right"} zone open`,
    [],
    (x) => x.boss?.kind === "trapeze" && trapezeOpenZone(x.cfg, x.boss) === zone,
  );
  return w;
}

/** The lock level lit, the alien swinging and nothing locked yet. */
function toTap(): World {
  const w = fresh([], [], { kind: "trapeze", steps: LOCK });
  runUntil(w, "the lock level", [], (x) => x.boss?.kind === "trapeze" && x.boss.phase === "level");
  return w;
}

const SWING =
  "THE TRAPEZE: an alien on a swing hung from long ropes over the middle, a gong at the end of the swing.";

const TRAPEZE_LEFT: Pose = {
  name: "TRAPEZE · THE LEFT ZONE OPEN",
  note: `${SWING} The first level is lit and the swing is coming back over the left zone. Player 1's screen, where the zone is drawn loud with its chevrons.`,
  lookAt: "whether the lit zone reads as *swipe here, toward the middle, now*",
  crop: "field",
  role: "p1",
  build: () => open(-1),
};

const TRAPEZE_RIGHT: Pose = {
  name: "TRAPEZE · THE RIGHT ZONE OPEN",
  note: `${SWING} The first level is lit and the swing is coming back over the right zone. Player 2's screen.`,
  lookAt: "whether the badge says whose zone it is at a glance",
  crop: "field",
  role: "p2",
  build: () => open(1),
};

const TRAPEZE_TAP: Pose = {
  name: "TRAPEZE · THE ALIEN TO TAP",
  note: `${SWING} The lock level is lit; the alien wears the halo on player 1's screen, the tap that locks the cannon on it.`,
  lookAt: "whether the alien reads as a thing to tap, and not to shoot yet",
  crop: "field",
  role: "p1",
  build: toTap,
};

export const TRAPEZE_GRIPS: readonly Pose[] = [TRAPEZE_LEFT, TRAPEZE_RIGHT, TRAPEZE_TAP];
