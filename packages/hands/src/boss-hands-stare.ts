import { midCol, stareBoss, stareClearShot, type TimedCommand, type World } from "@neon-spore/sim";

type Press = Omit<TimedCommand, "tick">;

/**
 * **THE STARE played right**, for the STATES sheet and the autopilot: the
 * lid pulled the tick the eye starts to charge, and the shut eye shot up the
 * middle on a live pass — but only on a beat whose *next* beat is shut too,
 * so no press can land on the tick the eye opens and no bolt arrives at an
 * open eye (`sim/stare-step.ts`).
 */
export const stareHand = (w: World): Press[] => {
  const s = stareBoss(w);
  if (s === null) return [];
  if (s.phase === "charge") return lidHand(w);
  if (!stareClearShot(s, w.beat)) return [];
  const col = midCol(w.cfg);
  if (w.cannonCol !== col) return [{ player: 1, command: { kind: "cannonCol", col } }];
  return [{ player: 2, command: { kind: "fire", color: "cyan" } }];
};

/** The pilot's thumb pulling the lid to the bottom while the eye charges. */
export const lidHand = (w: World): Press[] => {
  const s = stareBoss(w);
  if (s === null || s.phase !== "charge") return [];
  const fromYMilli = w.cfg.stareLidPullMilli;
  return [
    {
      player: 1,
      command: { kind: "drag", target: "stareLid", on: true, fromMilli: 0, fromYMilli },
    },
  ];
};
