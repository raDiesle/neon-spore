import { readCurrent, votePrompt } from "../../versus/prompt.js";
import type { Slot, Variant } from "../../versus/variant.js";
import { button, el } from "./dom.js";

/**
 * The vote box: the reason field, the two buttons and the swap-guard banner.
 *
 * Split out of what is now `versus-page.ts` because that file sat at the
 * 250-line ceiling and the slot picker `docs/decisions.md` #24 calls for
 * needed room that this did not. It is mounted by `versus-one.ts`, one vote
 * per look, on the look's own page. `emit` is the only place the clipboard
 * prompt in `docs/versus.md`'s "The prompt a vote emits" is reached from;
 * `tools/versus/prompt.ts` is what builds it.
 */

/** What a vote was cast against — two fields on the `/api/notes` view. */
export interface Head {
  head: string;
  dirty: boolean;
}

export async function readHead(): Promise<Head> {
  const res = await fetch("/api/notes");
  if (!res.ok) throw new Error(res.statusText);
  const v = (await res.json()) as Partial<Head>;
  return { head: v.head ?? "unknown", dirty: v.dirty !== false };
}

export interface VoteBox {
  readonly root: HTMLElement;
  /** Rebuild the two buttons for a newly chosen candidate. */
  setCandidate(next: Variant): void;
  /** The swap guard: `true` once the two sides came back byte-identical. */
  setSwapOk(identical: boolean): void;
}

function cast(label: string, on: () => void): HTMLButtonElement {
  const b = button(label, "versus-cast");
  b.addEventListener("click", () => {
    on();
    b.textContent = `${label} — COPIED`;
    setTimeout(() => {
      b.textContent = label;
    }, 1600);
  });
  return b;
}

/**
 * A vote, on the clipboard — the adoption prompt `docs/versus.md` specifies,
 * built by `tools/versus/prompt.ts`.
 *
 * This used to copy a four-line record instead, and say twice that the builder
 * was not written yet. It was: `prompt.ts` and its four companions were
 * typechecked, linted and tested while nothing in the director imported one, so
 * the text that document argues for at length had never once reached a
 * clipboard. Nothing about the record is lost — `votePrompt` carries the same
 * header rows and the same `old -> new` per field, and the steps, the refusals
 * and the reader grep besides.
 *
 * **`readCurrent` is called here and nowhere earlier.** The left-hand column
 * has to be what the live record says at the moment of the vote: a copy of a
 * shipped value taken any sooner is the drift this arrangement exists to
 * prevent, and step 0 of the prompt turns a disagreement into a refusal.
 */
function emit(slot: Slot, won: Variant | null, why: string, head: Head): void {
  const text = votePrompt({
    slot: slot.slot,
    candidates: slot.candidates,
    won,
    current: won ? readCurrent(won) : [],
    // The one thing the prompt cannot fill in for itself, and a blank line
    // under `why` reads as a vote nobody thought about rather than one nobody
    // wrote down.
    why: why.trim() || "(not typed)",
    head: head.head,
    dirty: head.dirty,
    date: new Date().toISOString().slice(0, 10),
  });
  void navigator.clipboard?.writeText(text);
}

/** Built once per candidate; `versus-one.ts` calls `setCandidate` before mounting it. */
export function buildVoteBox(slot: Slot, head: Head): VoteBox {
  const why = document.createElement("textarea");
  why.placeholder = "why — the sentence that outlives the vote";
  const buttons = el("div", "versus-buttons");
  const banner = el("div", "versus-banner");
  const root = el("div", "versus-vote");
  root.append(why, buttons, banner);

  return {
    root,
    setCandidate(next) {
      buttons.replaceChildren(
        cast("KEEP CURRENT", () => emit(slot, null, why.value, head)),
        cast(`ADOPT ${next.name.toUpperCase()}`, () => emit(slot, next, why.value, head)),
      );
    },
    setSwapOk(identical) {
      banner.textContent = identical
        ? "THE SWAP DID NOT TAKE — or this candidate is the current one"
        : "";
      banner.classList.toggle("on", identical);
      buttons.style.display = identical ? "none" : "";
    },
  };
}
