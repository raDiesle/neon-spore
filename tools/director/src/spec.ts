/**
 * The SPEC tab: every file in `docs/spec/` verbatim, one expander each.
 *
 * The other panels parse the design into entries, and a parse decides what to
 * keep — the naming rules, the categories, the rejected names, the ceiling and
 * the whole of overview, structure, graphics and latency are none of them an
 * entry with a name and a badge. This is the panel that answers "what does the
 * spec actually say" without leaving the editor, so nothing on the page is
 * only reachable by opening the repository beside it.
 */

import { detailBox } from "./markdown.js";

interface SpecFile {
  name: string;
  text: string;
}

const HEADLINE_MAX = 150;

/**
 * The file's opening paragraph, cut to a line. Cut at a word, not mid-word: the
 * first version took the first *line* of it, which is wherever the author's
 * editor wrapped, and every summary ended in the middle of a sentence.
 */
function headline(text: string): string {
  const paragraph: string[] = [];
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim().replace(/^>\s?/, "");
    if (trimmed === "" || trimmed.startsWith("#")) {
      if (paragraph.length > 0) break;
      continue;
    }
    paragraph.push(trimmed);
  }
  const flat = paragraph
    .join(" ")
    .replace(/\*\*/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1");
  if (flat.length <= HEADLINE_MAX) return flat;
  const cut = flat.slice(0, HEADLINE_MAX);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}

export async function renderSpec(): Promise<void> {
  const container = document.getElementById("specFiles");
  if (!container) return;

  try {
    const res = await fetch("/api/spec");
    if (!res.ok) throw new Error(res.statusText);
    const { files } = (await res.json()) as { files: SpecFile[] };

    container.replaceChildren();
    for (const file of files) {
      const wrap = document.createElement("div");
      wrap.className = "spec-file";
      wrap.appendChild(detailBox(file.text, "", `docs/spec/${file.name}`));

      // Outside the expander, not in it: shut, a details element shows only its
      // summary, and a list of nine file names says nothing about which to open.
      const line = headline(file.text);
      if (line) {
        const blurb = document.createElement("p");
        blurb.className = "blurb";
        blurb.textContent = line;
        wrap.appendChild(blurb);
      }
      container.appendChild(wrap);
    }
  } catch {
    container.replaceChildren();
    const msg = document.createElement("p");
    msg.textContent = "no server — read only";
    msg.style.color = "var(--dim)";
    container.appendChild(msg);
  }
}
