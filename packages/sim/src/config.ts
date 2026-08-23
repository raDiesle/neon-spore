/**
 * Every tunable number of the simulation. Named values, never loose literals —
 * this object is what a comparison screen varies and what a replay pins down.
 */
export interface SimConfig {
  /** Grid width in columns. Waves are authored for 7 and remapped. */
  cols: number;
  /** Grid height in rows. A creature needs `rows` beats from top to hull. */
  rows: number;
  /** Beats per minute of the shared clock. */
  bpm: number;
  /** Fixed simulation rate. Must divide into a whole number of ticks per beat. */
  tickHz: number;
  /** How long before impact player 1 may trigger the shield, in milliseconds. */
  guardWindowMs: number;
  /** Bullet speed, in tiles per beat. */
  bulletTilesPerBeat: number;
  /** Minimum gap between shots, in beats. */
  fireEveryBeats: number;
  /** Hull points regained per second. */
  hullRegenPerSecond: number;
  /** Damage when a creature reaches the hull. */
  damageCreature: number;
  /** Damage when a meteor is not deflected. */
  damageMeteor: number;
}

export const DEFAULT_CONFIG: SimConfig = {
  cols: 11,
  rows: 15,
  bpm: 96,
  tickHz: 120,
  guardWindowMs: 260,
  bulletTilesPerBeat: 12,
  fireEveryBeats: 0.5,
  hullRegenPerSecond: 3,
  damageCreature: 12,
  damageMeteor: 20,
};

/** Ticks per beat. Throws unless it is a whole number — see docs/architecture.md. */
export function ticksPerBeat(cfg: SimConfig): number {
  const exact = (cfg.tickHz * 60) / cfg.bpm;
  const rounded = Math.round(exact);
  if (Math.abs(exact - rounded) > 1e-9) {
    throw new Error(
      `tickHz ${cfg.tickHz} and bpm ${cfg.bpm} give ${exact} ticks per beat. ` +
        `It must be a whole number, otherwise the beat drifts and lockstep breaks.`,
    );
  }
  return rounded;
}
