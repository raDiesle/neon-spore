/** The two ammunition colours. Colour is bioluminescence, not decoration. */
export type Color = "red" | "cyan";

export type CreatureKind = "slick" | "bulb" | "meteor";

export interface Creature {
  id: number;
  kind: CreatureKind;
  /** Column it occupies. The first two kinds never change lanes. */
  col: number;
  /** Row after the most recent beat. Row `hullRow` means it has reached the hull. */
  row: number;
  /** Row before the most recent beat, for interpolation in render/. */
  fromRow: number;
  /** null for meteors, which cannot be shot. */
  color: Color | null;
  /**
   * Craters left by shots. A meteor keeps its size and stays indestructible —
   * the holes are the only trace. render/ places crater `k` from the id.
   */
  holes: number;
}

export interface Bullet {
  id: number;
  col: number;
  /** Tile row, counted from the hull upwards. Bullets sit on tile centres. */
  row: number;
  /** Progress towards the next tile, 0..999. Interpolation only. */
  subMilli: number;
  color: Color;
}

/** A broken segment of the hull. Damage is visible and stays visible. */
export interface Scar {
  col: number;
  /** Beat at which it was made, for the render fade-in. */
  beat: number;
}

export interface GuardStats {
  /** Every meteor that reached the hull. The denominator of the HUD balance. */
  tries: number;
  /** Right column and right moment. */
  deflected: number;
  /** Right column, wrong moment — the interesting failure class. */
  mistimed: number;
}

/** Player commands. One flat list, so a replay is just a list of these. */
export type Command =
  | { kind: "cannonCol"; col: number }
  | { kind: "shieldCol"; col: number }
  | { kind: "fire"; color: Color }
  | { kind: "guard" }
  | { kind: "restart" };

export interface TimedCommand {
  /** Simulation tick the command takes effect on. */
  tick: number;
  /** 1 = pilot, 2 = navigator. Kept for validation and statistics. */
  player: 1 | 2;
  command: Command;
}
