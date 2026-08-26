/**
 * One round trip, as four timestamps: the client's clock when the ping left
 * and when the pong landed, and the server's clock when the ping arrived and
 * when the pong left. Two of them are needed to take the server's own handling
 * time out of the measurement.
 */
export interface ClockSample {
  c1: number;
  s1: number;
  s2: number;
  c2: number;
}

/** How far the server's clock is ahead of this device's, from one round trip. */
export function sampleOffset(s: ClockSample): number {
  return (s.s1 - s.c1 + (s.s2 - s.c2)) / 2;
}

/** The round trip with the server's handling time removed. */
export function sampleRtt(s: ClockSample): number {
  return s.c2 - s.c1 - (s.s2 - s.s1);
}

/** Samples kept. Enough for a median to mean something, few enough to follow drift. */
const WINDOW = 7;
/** Samples before the offset is worth believing. */
const MIN_SAMPLES = 3;
/**
 * The whole reason this class exists rather than a single subtraction. A jump
 * in the offset is a jump in when beat zero was, and a beat that moves is the
 * one thing a game built on a shared rhythm cannot survive. So a new median is
 * walked towards at a speed slower than anyone can hear.
 */
const MAX_DRIFT_MS_PER_SECOND = 4;

/**
 * The device clock is never touched, only game time (docs/architecture.md,
 * "Network"). This holds that game-time offset and nothing else.
 */
export class ClockSync {
  private readonly samples: ClockSample[] = [];
  private applied = 0;
  private acquired = false;

  add(sample: ClockSample): void {
    this.samples.push(sample);
    if (this.samples.length > WINDOW) this.samples.shift();
    if (!this.acquired && this.samples.length >= MIN_SAMPLES) {
      // The first acquisition is a jump, and is allowed to be: there is no
      // established beat to disturb yet, because nothing has started.
      this.applied = this.target;
      this.acquired = true;
    }
  }

  /** Walk the applied offset towards the measured one. Never a jump. */
  settle(elapsedMs: number): void {
    if (!this.acquired) return;
    const step = (MAX_DRIFT_MS_PER_SECOND * Math.max(0, elapsedMs)) / 1000;
    const delta = this.target - this.applied;
    this.applied += Math.sign(delta) * Math.min(Math.abs(delta), step);
  }

  /** The median of the window — where the applied offset is heading. */
  get target(): number {
    return median(this.samples.map(sampleOffset));
  }

  /** Server clock minus this device's clock, as the game currently believes it. */
  get offsetMs(): number {
    return this.applied;
  }

  get rttMs(): number {
    return median(this.samples.map(sampleRtt));
  }

  get sampleCount(): number {
    return this.samples.length;
  }

  get ready(): boolean {
    return this.acquired;
  }

  /** A server timestamp — beat zero, above all — in this device's own clock. */
  toLocal(serverMs: number): number {
    return serverMs - this.applied;
  }
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  if (sorted.length % 2 === 1) return sorted[mid] ?? 0;
  return ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2;
}
