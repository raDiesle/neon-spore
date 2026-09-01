import { el } from "./dom.js";
import { GALLERY_CATEGORIES, GALLERY_CLIPS, type GalleryClip } from "./gallery-clips.js";

/**
 * "COLLECTED LOOKS": external hand-painted frame sequences, grouped by the
 * kind of effect they could one day stand in for. Nothing here is wired to
 * anything the game draws and nothing here has a shipped counterpart to vote
 * against — CLAUDE.md's *A look with no shipped alternative* exemption is the
 * whole reason this section may exist without a VERSUS pair. It is a place to
 * look, not a decision. Mounted into `raster-page.ts`'s page the way
 * `mountVersusSection` is; card data lives in `gallery-clips.ts`.
 */

export function gallerySection(): HTMLElement {
  const section = el("section");
  section.appendChild(el("h2", "", "COLLECTED LOOKS"));
  section.appendChild(
    el(
      "p",
      "note",
      "Hand-painted frame sequences from outside this repo, played back one " +
        "after another — not generated, not on the field, not compared against " +
        "anything shipped. Collected here by the kind of effect they could one " +
        "day stand in for.",
    ),
  );
  for (const category of GALLERY_CATEGORIES) {
    section.appendChild(el("p", "gallery-cat", category));
    const clips = GALLERY_CLIPS.filter((c) => c.category === category);
    if (clips.length === 0) {
      section.appendChild(el("p", "gallery-empty", "nothing collected yet."));
      continue;
    }
    const row = el("div", "holder-row");
    for (const clip of clips) row.appendChild(clipCard(clip));
    section.appendChild(row);
  }
  return section;
}

function clipCard(clip: GalleryClip): HTMLElement {
  const card = el("div", "plan holder-card");
  const head = el("div", "head");
  head.appendChild(el("span", "name", clip.name));
  head.appendChild(el("span", "stamp", `${clip.frames.length} frames`));
  card.appendChild(head);
  const img = document.createElement("img");
  img.className = "holder-shot";
  img.width = 220;
  img.height = 220;
  img.alt = clip.name;
  img.dataset.galleryClip = clip.id;
  card.appendChild(img);
  return card;
}

/**
 * Starts every clip's own frame loop — called once, lazily, from
 * `raster-page.ts`'s `drawRaster`, the same point the burst demos start
 * theirs. A plain `<img>` whose `src` is swapped on a timer: there is no atlas
 * here and nothing has to agree with anything, so the wall clock these frames
 * play on (CLAUDE.md rule 2 — never in `sim` or `content`, and this is
 * neither) is exactly the right clock.
 */
export function drawGallery(): void {
  for (const clip of GALLERY_CLIPS) {
    const img = document.querySelector<HTMLImageElement>(`img[data-gallery-clip="${clip.id}"]`);
    if (img) playClip(img, clip);
  }
}

function playClip(img: HTMLImageElement, clip: GalleryClip): void {
  let i = 0;
  let last = 0;
  img.src = clip.frames[0] ?? "";
  const step = (now: number): void => {
    if (!img.isConnected) return;
    if (now - last >= clip.frameMs) {
      i = (i + 1) % clip.frames.length;
      img.src = clip.frames[i] ?? "";
      last = now;
    }
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
