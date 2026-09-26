import {
  type Creature,
  clampPull,
  cordRest,
  lidIsOpen,
  lidSide,
  type PullVec,
  pullIsTaut,
  type TimedCommand,
  type World,
} from "@neon-spore/sim";

/**
 * **THE LID, on AUTO**: an eye whose plates a hand has to hold open while the
 * other seat fires into it (`lid.ts`).
 *
 * Player 1 has both thumbs' worth of it here: the cannon stands under the lid
 * as under any body, and the same seat takes the cord and pulls it to full
 * tension. The field hand holds its fire until the lens is bare. The pull has
 * to stay taut after it is kept on the field (`clampPull`), and a straight
 * pull aside from a lid near a wall runs out of field before it runs out of
 * cord. So the hand tries the ways a pull can go, and takes the first one that
 * is still taut once clamped: down and away from the body, then straight down,
 * straight away, up and away, and straight up.
 */

type Press = Omit<TimedCommand, "tick">;

/** The directions a pull is tried in, x toward `lidSide` and y down the field. */
const WAYS: readonly PullVec[] = [
  { x: 1, y: 1 },
  { x: 0, y: 1 },
  { x: 1, y: 0 },
  { x: 1, y: -1 },
  { x: 0, y: -1 },
];

/** A pull that holds this lid open, or `null` when no way the field allows. */
function tautPull(w: World, lid: Creature): PullVec | null {
  const side = lidSide(w.cfg, lid);
  const rest = cordRest(w.cfg, lid);
  const taut = w.cfg.lidTautMilli;
  for (const way of WAYS) {
    // Asked of the pull as the rule will keep it, cut and clamped, so a way
    // the field shortens is passed over rather than sent.
    const raw = { x: way.x * side * taut, y: way.y * taut };
    if (pullIsTaut(clampPull(w.cfg, rest, raw, taut), taut)) return raw;
  }
  return null;
}

/** Player 1's hand on the cord of `body`, if it is a lid not yet open. */
export function holdLid(w: World, body: Creature | undefined): Press[] {
  if (body?.kind !== "lid" || lidIsOpen(w.cfg, body)) return [];
  const pull = tautPull(w, body);
  if (pull === null) return [];
  const command = {
    kind: "drag",
    target: "lidString",
    on: true,
    id: body.id,
    fromMilli: pull.x,
    fromYMilli: pull.y,
  } as const;
  return [{ player: 1, command }];
}

/** Whether the cannon holds its fire at `body`: a lid with its plates shut. */
export function lidShut(w: World, body: Creature | undefined): boolean {
  return body?.kind === "lid" && !lidIsOpen(w.cfg, body);
}
