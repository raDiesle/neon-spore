/**
 * The inline half of `markdown.ts`: bold, italics, code, links and images
 * inside one line. Split out on 26 September 2026 when links out became real
 * links and took the renderer past the 250-line ceiling — what a line contains
 * is a different subject from which block a line starts.
 */

/**
 * A URL in brackets, allowing one level of parentheses inside it. Wikipedia
 * spells half its own titles that way — `Asteroids_(video_game)` — and a
 * pattern that stops at the first `)` leaves the other one standing in the
 * prose as a stray character.
 */
const URL = String.raw`(?:[^()]|\([^()]*\))*`;
const INLINE = new RegExp(
  [
    String.raw`!\[([^\]]*)\]\((${URL})\)`,
    String.raw`\*\*([^*]+)\*\*`,
    String.raw`\*([^*]+)\*`,
    "`([^`]+)`",
    String.raw`\[([^\]]*)\]\((${URL})\)`,
  ].join("|"),
  "g",
);

/**
 * `![alt](url)`, `**bold**`, `*italic*`, `` `code` `` and `[text](url)` — the
 * link keeps its text, and is a link only when it goes out over `https://`.
 * A link into the spec (`bosses.md#…`) has nowhere to go on a sheet and stays
 * its words; a link out is a video or a store page on the research page
 * (`transfers-touch.md`), and a title with its address thrown away is a name
 * the reader has to search for by hand.
 *
 * The image is the one thing here that reaches outside the repository, and
 * `docs/tower-defence.md` is why it exists: that page is a study of other
 * games, and a row saying *the shell cracks visibly as it takes damage* is a
 * picture the reader has to build alone. The art is not ours and the
 * repository is public, so it is linked rather than copied in.
 *
 * Only `https://` is honoured. A trusted file is the only input this renderer
 * ever has, but the rest of it goes through `textContent` for a reason — a
 * renderer that can be talked into markup is one nobody can reason about — and
 * an `src` is the one attribute that would quietly reintroduce that. Anything
 * else falls back to the alt text, which is why every caption in that file
 * reads as a sentence rather than as a filename.
 */
export function inline(target: HTMLElement, text: string): void {
  let last = 0;
  for (const m of text.matchAll(INLINE)) {
    const at = m.index ?? 0;
    if (at > last) target.appendChild(document.createTextNode(text.slice(last, at)));
    if (m[2] !== undefined) target.appendChild(image(m[1] ?? "", m[2]));
    else if (m[3] !== undefined) target.appendChild(tag("b", m[3]));
    else if (m[4] !== undefined) target.appendChild(tag("i", m[4]));
    else if (m[5] !== undefined) target.appendChild(tag("code", m[5]));
    else target.appendChild(link(m[6] ?? "", m[7] ?? ""));
    last = at + m[0].length;
  }
  target.appendChild(document.createTextNode(text.slice(last)));
}

function image(alt: string, src: string): HTMLElement {
  if (!src.startsWith("https://")) return tag("i", alt);
  const img = document.createElement("img");
  img.className = "md-img";
  img.alt = alt;
  img.loading = "lazy";
  // Referrer left off on purpose: these are other people's servers, and the
  // director's own port is nothing they need to be told about.
  img.referrerPolicy = "no-referrer";
  img.src = src;
  return img;
}

function link(text: string, href: string): Node {
  if (!href.startsWith("https://")) return document.createTextNode(text);
  const a = document.createElement("a");
  a.textContent = text;
  a.href = href;
  a.target = "_blank";
  // No referrer for the same reason as `image` above.
  a.rel = "noopener noreferrer";
  return a;
}

function tag(name: string, text: string): HTMLElement {
  const el = document.createElement(name);
  el.textContent = text;
  return el;
}
