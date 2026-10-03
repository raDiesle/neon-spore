import { type SimConfig, type SimEvent, VALVE_PINS } from "@neon-spore/sim";
import type { Burst } from "./effects-boss.js";
import { fieldX } from "./field-flip.js";
import { type Layout, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";
import { valveHoleCentre } from "./valve-pins.js";
import { type Point, valveSocket } from "./valve-shape.js";

/**
 * **What THE VALVE's story throws** (`sim/valve-story.ts`): the burst each of
 * its twelve events leaves, and whether it is a step landed or a blow on the
 * hull, which `valve-fx.ts` turns into the drum's hurt and the hull's shock.
 * Its own page because the fx file is at its length with the thirteen.
 *
 * - **An ask opening** — the jet, the shudder, the film, the strain — puffs
 *   where it will be answered: steam out of the first slot, iron off the
 *   drum, pale film off the face, white off the seam.
 * - **An ask answered** — the cap, the brace, the dry face, the seal — flares
 *   white where the thumbs were, the socket or the slot, and is a step landed.
 * - **An ask run out** — the blow, the shake, the smear, the rough open —
 *   lands on the hull under the middle column in red, where `bossStrikesHull`
 *   struck, and shudders it.
 *
 * Points on the drum are at rest, unlisted, like the rest of its bursts.
 */
export type StoryBlow = "landed" | "struck" | null;

/** The burst for one of the story's events, and what it deals; `undefined` for an event not the story's. */
export function valveStoryBurst(
  e: SimEvent,
  l: Layout,
  cfg: SimConfig,
  c: Point,
  burst: Burst,
): StoryBlow | undefined {
  const on = (p: Point): Point => ({ x: c.x + p.x, y: c.y + p.y });
  const slot = on(valveHoleCentre(l, 0, VALVE_PINS));
  const socket = on(valveSocket(l).at);
  const hull = (): StoryBlow => {
    if (!("col" in e)) return null;
    burst(fieldX(l, e.col), tileCY(l, cfg.rows - 1), 16, PALETTE.red);
    return "struck";
  };
  switch (e.type) {
    case "valveJet":
      burst(slot.x, slot.y, 8, PALETTE.text);
      return null;
    case "valveShudder":
      burst(c.x, c.y, 8, PALETTE.rock);
      return null;
    case "valveFilm":
      burst(c.x, c.y, 8, PALETTE.text);
      return null;
    case "valveStrain":
      burst(c.x, c.y, 6, PALETTE.hullRim);
      return null;
    case "valveCap":
      burst(slot.x, slot.y, 10, PALETTE.hullRim);
      return "landed";
    case "valveBrace":
      burst(socket.x, socket.y, 12, PALETTE.hullRim);
      return "landed";
    case "valveDry":
      burst(c.x, c.y, 12, PALETTE.hullRim);
      return "landed";
    case "valveSeal":
      burst(socket.x, socket.y, 12, PALETTE.hullRim);
      return "landed";
    case "valveBlow":
    case "valveShake":
    case "valveSmear":
    case "valveRough":
      return hull();
    default:
      return undefined;
  }
}
