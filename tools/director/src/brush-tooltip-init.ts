import { attachBrushTooltips } from "./brush-tooltip.js";

/**
 * The one line that wires `attachBrushTooltips` (`brush-tooltip.ts`) into the
 * page. Its own file, loaded by `index.html` as a second `<script src>`
 * alongside `main.ts`'s, rather than added to `main.ts` itself — `main.ts` is
 * outside this feature's paths.
 */
const brushes = document.getElementById("brushes");
if (brushes) attachBrushTooltips(brushes);
