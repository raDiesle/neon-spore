import {
  demonstrationConfig,
  demonstrationIndex,
  demonstrationWave,
  MECHANIC_IDS,
  type MechanicId,
  mechanic,
} from "@neon-spore/content";
import type { SimConfig } from "@neon-spore/sim";

/**
 * The DEMOS page: one row per mechanic, read out of `DEMONSTRATIONS`
 * (`packages/content/src/waves-demo.ts`) rather than typed out here a second
 * time. `MECHANIC_IDS` is the closed registry `DEMONSTRATIONS` is total over,
 * so a mechanic added to the sim gets a row here for free the moment
 * `waves-demo.ts` says where it lives — nothing in this file needs editing
 * when that happens.
 */
export interface DemoRow {
  id: MechanicId;
  what: string;
  waveName: string;
}

/** Every mechanic, in registry order. */
export function demoRows(): DemoRow[] {
  return MECHANIC_IDS.map((id) => ({
    id,
    what: mechanic(id).what,
    waveName: demonstrationWave(id).name,
  }));
}

/**
 * Switches `cfg` to the demonstration's config, in place, and jumps to its
 * wave. `cfg` is mutated rather than replaced because every reader in
 * `apps/game` — `world.cfg`, the progression's closure, the input band — holds
 * this same object by reference; replacing it would leave all of them reading
 * the old one. `tools/director/src/pair-panel.ts` mutates the same `cfg` for
 * the same reason.
 *
 * `demonstrationWave` throws first if the name has gone missing from `WAVES`,
 * so a broken registry entry fails loudly here rather than jumping to wave 0
 * in silence.
 */
export function openDemonstration(
  id: MechanicId,
  cfg: SimConfig,
  jumpToWave: (wave: number) => void,
): void {
  demonstrationWave(id);
  Object.assign(cfg, demonstrationConfig(id, cfg));
  jumpToWave(demonstrationIndex(id));
}
