/** The two ammunition colours. Colour is bioluminescence, not decoration. */
export type Color = "red" | "cyan";

export type CreatureKind = "manta" | "jelly" | "meteor";

export interface Creature {
  id: number;
  kind: CreatureKind;
  /** Column it occupies. The first two kinds never change lanes. */
  col: number;
  /** Row after the most recent beat. Row `rows` means it has reached the hull. */
  row: number;
  /** Row before the most recent beat, for interpolation in render/. */
  fromRow: number;
  /** null for meteors, which cannot be shot. */
  color: Color | null;
}

export interface Bullet {
  id: number;
  col: number;
  /** Fractional row, counted upwards from the hull. Advances every tick. */
  row: number;
  color: Color;
}

/** A broken segment of the hull. Damage is visible and stays visible. */
export interface Scar {
  col: number;
  /** Beat at which it was made, for the render fade-in. */
  beat: number;
}

export interface GuardStats {
  /** Attempts with the shield in the right column. */
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
  | { kind: "guard" };

export interface TimedCommand {
  /** Simulation tick the command takes effect on. */
  tick: number;
  /** 1 = pilot, 2 = navigator. Kept for validation and statistics. */
  player: 1 | 2;
  command: Command;
}
