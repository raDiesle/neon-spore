/**
 * The page's half of `/api/waves`: loading the wave list off disk, and saving
 * it back without clobbering somebody else's edit.
 *
 * The load is answered with a token — a fingerprint of the three act files as
 * they were at that moment (`waves-api.ts`) — and the save sends it back. If
 * the files have moved since, the server refuses with 409 and writes nothing;
 * the only honest thing this page can then do is say so and let the author
 * reload, because it is holding a list that no longer has a base.
 *
 * It lives here rather than in `main.ts` for the reason `shipped.ts` does:
 * `main.ts` is a file about wiring panels together, and it is at its line
 * limit.
 */

import type { Wave } from "@neon-spore/content";
import { refuse, type Store } from "./state.js";

export interface WaveIo {
  /** Write the store back to the act files, if nothing else has since loaded. */
  save(): Promise<void>;
  /** Read the act files, replacing the bundled fallback. */
  load(): Promise<void>;
}

interface Wiring {
  store: Store;
  setStatus: (text: string, cls?: string) => void;
  /** After a save: the status line, now that the store is clean again. */
  repaint: () => void;
  /** After a load: the whole page, against a wave list it has not seen. */
  refresh: () => void;
}

export function bindWaveIo({ store, setStatus, repaint, refresh }: Wiring): WaveIo {
  /**
   * Which revision of the act files this page's list came off. Empty until the
   * first load answers — a save before then would be a save with no base, and
   * the server refuses one.
   */
  let token = "";

  async function save(): Promise<void> {
    const bad = refuse(store.waves);
    if (bad) {
      setStatus(bad, "bad");
      return;
    }
    setStatus("saving…");
    try {
      const res = await fetch("/api/waves", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ waves: store.waves, token }),
      });
      const body = (await res.json()) as { error?: string; token?: string };
      if (!res.ok) throw new Error(body.error ?? res.statusText);
      // Biome runs after the write, so the files this page is now based on are
      // not the ones it sent. The server hashes them again and says which.
      if (body.token) token = body.token;
      store.dirty = false;
      repaint();
    } catch (err) {
      setStatus(`save failed: ${String(err)}`, "bad");
    }
  }

  async function load(): Promise<void> {
    try {
      const res = await fetch("/api/waves");
      if (!res.ok) throw new Error(res.statusText);
      const body = (await res.json()) as { waves: Wave[]; token: string };
      store.waves = body.waves;
      token = body.token;
    } catch {
      // No server — the bundled copy is still worth editing, just not saving.
      setStatus("no server — read only", "bad");
    }
    store.index = Math.min(store.index, store.waves.length - 1);
    refresh();
  }

  return { save, load };
}
