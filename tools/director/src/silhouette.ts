import { boundsOver, SUBJECTS, type Subject } from "@neon-spore/shape-sheet";

/** Case-insensitive: callers pass a creature's spec name, not a SUBJECTS key. */
function findSubject(name: string): Subject | undefined {
  const key = name.toUpperCase();
  return SUBJECTS.find((s) => s.name === key);
}

/** True once a name has a tuned shape — the rest of the bestiary has none yet. */
export function hasSilhouette(name: string): boolean {
  return findSubject(name) !== undefined;
}

/**
 * The contour at rest, through the same functions the canvas calls. Still,
 * not animated: the shape sheet is where motion is judged, and a panel that
 * ran three wobble loops beside a live simulation would be spending frames on
 * a question it is not asking.
 */
export function silhouette(name: string, stroke: string, box = 58): SVGElement {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", `0 0 ${box} ${box}`);
  svg.setAttribute("width", String(box));
  svg.setAttribute("height", String(box));

  const subject = findSubject(name);
  if (!subject) return svg;

  const b = boundsOver(subject, [0]);
  const scale = (box - 14) / Math.max(b.x1 - b.x0, b.y1 - b.y0);
  const cx = (b.x0 + b.x1) / 2;
  const cy = (b.y0 + b.y1) / 2;

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", subject.path(subject.pointsAt(0)));
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", stroke);
  path.setAttribute("stroke-width", String(2 / scale));
  path.setAttribute(
    "transform",
    `translate(${box / 2} ${box / 2}) scale(${scale.toFixed(4)}) translate(${-cx} ${-cy})`,
  );
  svg.appendChild(path);
  return svg;
}
