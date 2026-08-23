/**
 * Fixed-timestep driver. Wall-clock time exists here and nowhere below:
 * the simulation only ever hears "one tick has passed".
 */
export interface Loop {
  stop(): void;
}

export function startLoop(tickHz: number, onTick: () => void, onFrame: () => void): Loop {
  const tickMs = 1000 / tickHz;
  let last = performance.now();
  let accumulator = 0;
  let running = true;

  const frame = (now: number): void => {
    if (!running) return;
    // Cap the catch-up so a backgrounded tab does not run 10 000 ticks at once.
    accumulator += Math.min(250, now - last);
    last = now;
    while (accumulator >= tickMs) {
      onTick();
      accumulator -= tickMs;
    }
    onFrame();
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);

  return {
    stop() {
      running = false;
    },
  };
}
