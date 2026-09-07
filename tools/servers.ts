import {
  type ClaimRequest,
  DIRECTOR_BAND,
  DIRECTOR_BASE,
  PREVIEW_BAND,
  PREVIEW_BASE,
} from "./ports.js";

/**
 * The two servers this repository starts and settles a port with, described
 * once.
 *
 * Each of them used to carry its own copy of these five values — the base, the
 * band, the marker it answers with and the two paths it answers on — and a
 * third copy went into anything that wanted to ask one of them who it was. Two
 * copies of "what does the director answer to" is the same class of thing as
 * two copies of where a creature lands: it does not break, it drifts, and the
 * session that finds the drift is the one holding a `curl` that returns
 * nothing from a port it derived correctly.
 *
 * The relay is not here. It is wrangler's server rather than ours, it answers
 * no marker, and `relayPort` derives its number unconditionally for exactly
 * that reason — a descriptor shaped like these two would be claiming it can be
 * settled with, which is the one thing it cannot.
 */
export type ServerName = "director" | "preview";

/** Everything but the tree, which is the caller's — it is the one that differs. */
export type ServerSpec = Omit<ClaimRequest, "tree" | "given"> & {
  /** The environment variable that pins this server's port, when one has to be. */
  env: string;
};

export const SERVERS: Record<ServerName, ServerSpec> = {
  director: {
    base: DIRECTOR_BASE,
    band: DIRECTOR_BAND,
    marker: "neon-spore-director",
    probePath: "/__director",
    quitPath: "/__director/quit",
    env: "DIRECTOR_PORT",
  },
  preview: {
    base: PREVIEW_BASE,
    band: PREVIEW_BAND,
    marker: "neon-spore-preview",
    probePath: "/__preview",
    quitPath: "/__preview/quit",
    env: "PREVIEW_PORT",
  },
};
