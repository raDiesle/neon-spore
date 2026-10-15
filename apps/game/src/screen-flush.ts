/**
 * Make the screen pay for its frame **now**, inside a sweep's timed window.
 *
 * A 2D canvas does not draw when it is drawn on: Chrome records the ops and
 * rasterises them at the commit, after `paint()` has returned. A canvas drawn
 * into another one is the exception — its ops are flushed at the `drawImage`,
 * because the copy needs the pixels. So a sweep that timed `paint()` alone
 * charged a part drawn on an offscreen layer for its flush and the same part
 * drawn on the screen for nothing: on GYRES AGAIN, 15 October 2026, the glance
 * layer read 9 ms where it cost about 4.
 *
 * This copies one pixel of the screen onto a one-pixel **CPU** canvas and reads
 * it, which waits for the GPU to finish the screen. A copy onto a GPU canvas
 * was tried first and measured nothing — it hands the ops over and returns.
 * Not `getImageData` on the screen itself, which read the same: Chrome may take
 * an accelerated canvas off the GPU after a couple of readbacks unless
 * `willReadFrequently` says otherwise, and a sweep that moved the screen to the
 * CPU would be measuring a renderer no player gets. `MEASURE` in
 * `tools/perf/sweep-timing.ts` says what the figures did.
 *
 * Both sweeps call it through the handle (`perf-sweep.ts`, `tools/perf/measure.ts`)
 * after every paint, so the phone and the throttled desktop count the same thing.
 */
export function screenFlusher(screen: HTMLCanvasElement): () => void {
  const scratch = document.createElement("canvas");
  scratch.width = 1;
  scratch.height = 1;
  const ctx = scratch.getContext("2d", { willReadFrequently: true });
  if (!ctx) return () => {};
  return () => {
    ctx.drawImage(screen, 0, 0, 1, 1, 0, 0, 1, 1);
    ctx.getImageData(0, 0, 1, 1);
  };
}
