/**
 * Every editing panel in the director can be put away — one mechanism, not a
 * control added panel by panel. A panel is any `<h2>` marked `data-panel` in
 * the markup; the field (the stage canvas) and the transport row under it
 * carry no such mark and can never collapse — see `docs/queue.md`'s
 * `claude/burn-director-minimize` entry for why those two are exempt and
 * everything else that edits a wave is not.
 *
 * The mechanism is `<details>`/`<summary>`, the same element `details.more`
 * already uses elsewhere on this page: the browser owns open/closed state
 * and the click handler, so this module only has to decide what counts as a
 * panel, group its content, and remember the choice.
 *
 * Two ways in, because the owner asked for both in the same sentence — "which
 * I and claude can minimize": a click on the heading for a human at the
 * keyboard, and a URL parameter for a session driving this page headlessly
 * with no mouse. `?closed=id,id` (or `?closed=all`) overrides the stored
 * state for this load only and is never written back — a session's request
 * does not permanently rearrange the owner's window. The human's own clicks
 * persist in `localStorage`, keyed per panel, so they survive a reload.
 */

const STORE_PREFIX = "director-panel:";

/** Exported so a test can check the key without duplicating the prefix. */
export function storageKey(id: string): string {
  return STORE_PREFIX + id;
}

function readStored(id: string): boolean | null {
  try {
    const v = localStorage.getItem(storageKey(id));
    if (v === "closed") return false;
    if (v === "open") return true;
    return null;
  } catch {
    // Storage can be unavailable (private mode, a headless run with no
    // origin) — collapsing still works for this load, it just does not
    // survive a reload.
    return null;
  }
}

function writeStored(id: string, open: boolean): void {
  try {
    localStorage.setItem(storageKey(id), open ? "open" : "closed");
  } catch {
    // See readStored — nothing to persist to, nothing to do about it.
  }
}

export type Forced = ReadonlySet<string> | "all" | null;

/** Pure: parses `?closed=id,id` (or `?closed=all`) out of a search string. */
export function forcedClosedFromUrl(search: string): Forced {
  const raw = new URLSearchParams(search).get("closed");
  if (raw === null) return null;
  if (raw === "all") return "all";
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );
}

/**
 * Pure: the whole priority order in one place, so a test can check it without
 * a DOM. The URL always wins over storage — it is a one-load override, not a
 * replacement for the human's own choice, so it never gets written back
 * (`wrapOne` only persists in response to the details element's own `toggle`
 * event, which a forced initial value never fires).
 */
export function decideOpen(id: string, forced: Forced, stored: boolean | null): boolean {
  const isForcedClosed = forced === "all" || forced?.has(id) === true;
  if (isForcedClosed) return false;
  return stored ?? true;
}

/**
 * Wraps a marked heading and the content that follows it — up to the next
 * marked heading, or the end of its parent — into one `<details class="panel">`.
 * Collapsing it hides the body and keeps the heading in the `<summary>`, so a
 * put-away panel is never unreachable.
 */
function wrapOne(heading: HTMLElement, forced: Forced): void {
  const id = heading.dataset.panel;
  if (!id) return;
  const parent = heading.parentElement;
  if (!parent) return;

  // Spacing between panels comes from `.panel` in CSS now, not from an
  // inline margin on the heading a lane hand-tuned before this mechanism
  // existed — an inline style would otherwise outrank that rule.
  heading.style.removeProperty("margin-top");

  const details = document.createElement("details");
  details.className = "panel";
  details.dataset.panelId = id;

  const summary = document.createElement("summary");
  details.appendChild(summary);

  const body = document.createElement("div");
  body.className = "panel-body";

  parent.insertBefore(details, heading);
  summary.appendChild(heading);

  let node = details.nextSibling;
  while (node) {
    const next = node.nextSibling;
    if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).dataset.panel) break;
    body.appendChild(node);
    node = next;
  }
  details.appendChild(body);

  details.open = decideOpen(id, forced, readStored(id));

  // Attached after the initial `.open` assignment above, so restoring a
  // stored or forced state never itself counts as the human's own click.
  details.addEventListener("toggle", () => {
    writeStored(id, details.open);
  });
}

/**
 * Finds every `[data-panel]` heading under `root` and makes it collapsible.
 * Call once, before anything else queries the elements a panel's content
 * lives in — moving a node preserves its id, so code that does
 * `document.getElementById(...)` later keeps working regardless of which
 * panel now contains it.
 */
export function initPanels(root: ParentNode = document, search: string = location.search): void {
  const forced = forcedClosedFromUrl(search);
  const headings = Array.from(root.querySelectorAll<HTMLElement>("[data-panel]"));
  for (const heading of headings) {
    wrapOne(heading, forced);
  }
}
