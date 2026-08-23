/**
 * Every tunable number of the simulation. Named values, never loose literals —
 * this object is what a comparison screen varies and what a replay pins down.
 */
export interface SimConfig {
  /** Grid width in columns. Waves are authored for 7 and remapped. */
  cols: number;
  /** Grid height in rows. The hull occupies the last one. */
  rows: number;
  /** Beats per minute of the shared clock. */
  bpm: number;
  /** Fixed simulation rate. Must divide into a whole number of ticks per beat. */
  tickHz: number;
  /** How long after player 1 triggers the shield it stays armed, in milliseconds. */
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
  /** Craters a single meteor can carry. Older ones are forgotten. */
  maxHoles: number;
  /** Breaks the hull remembers. Older ones are forgotten. */
  maxScars: number;
  /** Beats of quiet between a wave being cleared and the next one starting. */
  waveRestBeats: number;
  /** Score for destroying a creature. */
  scoreDestroy: number;
  /** Score for deflecting a meteor. */
  scoreDeflect: number;
  /** Score for clearing a wave. */
  scoreWave: number;
  /** How many beats ahead the radar strip shows an arrival. Read by render/. */
  radarLead: number;
  /** How long a bullet takes to glide between two tiles, in ms. Read by render/. */
  bulletGlideMs: number;
}

export const DEFAULT_CONFIG: SimConfig = {
  cols: 11,
  rows: 15,
  bpm: 96,
  tickHz: 120,
  guardWindowMs: 600,
  bulletTilesPerBeat: 12,
  fireEveryBeats: 0.5,
  hullRegenPerSecond: 3,
  damageCreature: 12,
  damageMeteor: 20,
  maxHoles: 10,
  maxScars: 30,
  waveRestBeats: 3,
  scoreDestroy: 100,
  scoreDeflect: 150,
  scoreWave: 300,
  radarLead: 4,
  bulletGlideMs: 130,
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

/**
 * The row the hull occupies. A creature that arrives here has reached it, so a
 * creature entering at row 0 travels `rows - 1` beats — 8.75 s at the defaults,
 * which is the 4-second rule from docs/spec/latency.md with room to spare.
 */
export function hullRow(cfg: SimConfig): number {
  return cfg.rows - 1;
}
