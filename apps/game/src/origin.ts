/**
 * Where the server lives, for both things that talk to it.
 *
 * Same origin by default — one worker serves the game, the rooms and the name
 * registry — with `?relay=` as the escape hatch for the case that is actually
 * common while this is being built: the game off a local preview and the rest
 * off a worker somewhere else.
 *
 * Its own file because the socket and the registry both need it, and the
 * socket already imports the name. A rule two callers share, written down
 * once, rather than a cycle.
 */

/** The override a developer passes on the address, if there is one. */
function override(): string | null {
  return new URL(location.href).searchParams.get("relay");
}

/** `ws://` or `wss://`, for the room socket. */
export function socketOrigin(): string {
  const base = override() ?? `${location.protocol === "https:" ? "wss:" : "ws:"}//${location.host}`;
  return base.replace(/^http/, "ws").replace(/\/$/, "");
}

/** `http://` or `https://`, for the plain routes beside it. */
export function httpOrigin(): string {
  const base = override() ?? location.origin;
  return base.replace(/^ws/, "http").replace(/\/$/, "");
}
