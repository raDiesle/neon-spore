import {
  currentValues,
  declaration,
  patchedFields,
  type Slot,
  type Variant,
} from "../../versus/variant.js";
import { button, el } from "./checks-dom.js";

/**
 * The vote box: the reason field, the two buttons and the swap-guard banner.
 *
 * Split out of `versus-page.ts` because that file sits at the 250-line
 * ceiling and the slot picker `docs/decisions.md` #24 calls for needed room
 * that this did not. `emit` is the only place the clipboard prompt in
 * `docs/versus.md`'s "The prompt a vote emits" is built — see the docstring on
 * it for what it deliberately is not yet.
 */

/** What a vote was cast against — two fields on the `/api/checks` view. */
export interface Head {
  head: string;
  dirty: boolean;
}

export async function readHead(): Promise<Head> {
  const res = await fetch("/api/checks");
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
 * A vote, on the clipboard.
 *
 * Deliberately **not** the adoption prompt `docs/versus.md` specifies —
 * `tools/versus/prompt.ts` is not built yet, and a half-written text that
 * looks like the real one is worse than none. This says it is a record, so
 * the looking is not lost meanwhile. Every value is `old -> new`, the
 * left-hand column read off the live record and never copied into a tool.
 */
function emit(slot: Slot, won: Variant | null, why: string, head: Head): void {
  const lost = slot.candidates.filter((c) => c !== won).map((c) => c.name);
  const lines = [
    "VERSUS — a vote, recorded. Not the adoption prompt: `tools/versus/prompt.ts`",
    "is not built yet, and this is the decision, so that the looking is not lost.",
    "",
    `    slot    ${slot.slot}`,
    `    won     ${won ? `${won.name} — "${won.sentence}"` : "current — nothing shipped changes"}`,
    `    lost    ${lost.join(", ") || "current"}`,
    `    why     ${why.trim() || "(not typed)"}`,
    `    voted   ${new Date().toISOString().slice(0, 10)}, against ${head.head}, tree ${head.dirty ? "dirty" : "clean"}`,
    "",
  ];
  for (const p of won?.patches ?? []) {
    const was = currentValues(p);
    const fields = p.fields as Record<string, unknown>;
    lines.push(`    patch   ${declaration(p.where)}`);
    for (const f of patchedFields(p)) {
      lines.push(`            ${f}  ${JSON.stringify(was[f])}  ->  ${JSON.stringify(fields[f])}`);
    }
  }
  lines.push("", 'docs/versus.md, "The prompt a vote emits", says what to do with this.');
  void navigator.clipboard?.writeText(lines.join("\n"));
}

/** Built once per slot; `versus-page.ts` calls `setCandidate` on every switch. */
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
