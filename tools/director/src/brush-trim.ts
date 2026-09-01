/**
 * Cutting a drawn body out of the black it was drawn on.
 *
 * A brush thumbnail used to be a fixed crop — so many tiles across, centred on
 * the creature's tile — and that number had to be guessed once per brush and
 * then guessed again whenever a shape changed. It was wrong in both directions
 * at once: a lure's ring and exclamation reach a tile above the body, a moored
 * pod is barely half a tile across, and one span cannot flatter both. The
 * clasp sat in a box with air all round it while the shell's plating touched
 * the edges.
 *
 * With the frame drawn bare (`ViewState.bare`), the background is exactly
 * black and everything else is the subject, so the box the subject occupies
 * can simply be measured rather than declared. The crop that follows is square
 * and centred on that box, so every thumbnail is the same picture-making rule
 * — as big as it can be while whole — instead of a table of per-brush numbers.
 */

/**
 * How much of the frame's own width is left as air on each side. Small: the
 * point is a body that fills its chip, and a thumbnail is read at 34 px where
 * a generous margin is simply a smaller creature.
 */
const MARGIN = 0.07;

/**
 * Above this, summed over the three channels, a pixel is the subject.
 *
 * Not zero, and the torch is why: its ember tail is a gradient that fades to
 * nothing at the top of the field, and every pixel of it is faintly non-black.
 * At the rock the tail is `rgba(255,122,47,0.3)` — 126 summed — and a third of
 * the way up it is under 45. So the tail's bright end is kept and its long
 * invisible reach is not, which is what "the torch, with its fire" means when
 * it has to fit in a square.
 */
const FLOOR = 78;

/** The box the drawn subject occupies, in the source canvas's own pixels, or
 * null when nothing was drawn at all. */
function subjectBox(
  data: Uint8ClampedArray,
  w: number,
  h: number,
): { x0: number; y0: number; x1: number; y1: number } | null {
  let x0 = w;
  let y0 = h;
  let x1 = -1;
  let y1 = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if ((data[i] ?? 0) + (data[i + 1] ?? 0) + (data[i + 2] ?? 0) <= FLOOR) continue;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }
  return x1 < 0 ? null : { x0, y0, x1, y1 };
}

/**
 * The subject of `src`, centred in a square canvas `size` pixels on a side.
 *
 * Square rather than fitted to the box: the thumbnails sit in a column beside
 * each other and a row of chips that are each a different shape reads as a
 * ransom note. Within the square the subject is centred and as large as the
 * margin allows, which is the whole of the sizing rule.
 */
export function trimToSubject(src: HTMLCanvasElement, size: number): HTMLCanvasElement {
  const out = document.createElement("canvas");
  out.width = size;
  out.height = size;
  const ctx = out.getContext("2d");
  const from = src.getContext("2d", { willReadFrequently: true });
  if (!ctx || !from) return out;
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, size, size);

  const box = subjectBox(
    from.getImageData(0, 0, src.width, src.height).data,
    src.width,
    src.height,
  );
  if (!box) return out;
  const side = Math.max(box.x1 - box.x0, box.y1 - box.y0) + 1;
  const reach = side * (1 + MARGIN * 2);
  const cx = (box.x0 + box.x1 + 1) / 2;
  const cy = (box.y0 + box.y1 + 1) / 2;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(src, cx - reach / 2, cy - reach / 2, reach, reach, 0, 0, size, size);
  return out;
}
