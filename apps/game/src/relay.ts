import {
  type ClientMessage,
  decodeServer,
  encode,
  PROTOCOL_VERSION,
  type ServerMessage,
} from "@neon-spore/net";
import type { TimedCommand } from "@neon-spore/sim";

/**
 * Where local presses come from. `InputBuffer` is the one in the game; the
 * narrow shape is so a headless check can hand over a scripted thumb without
 * dragging the whole DOM in behind it (`tools/relay-check`).
 */
export interface CommandSource {
  drain(tick: number): TimedCommand[];
}

export interface Relay {
  /** Dropped silently if the socket is not open. Nothing here is worth queueing. */
  send(message: ClientMessage): void;
  close(): void;
}

export interface RelayHandlers {
  message: (message: ServerMessage) => void;
  /** Closed, refused or errored — from the outside these are one thing. */
  dropped: () => void;
  /**
   * The socket is open. Optional so `tools/relay-check`, which builds a
   * `RelayHandlers` of its own, keeps compiling without it — the callback
   * exists so `link.ts` can fire its first clock ping the moment there is a
   * socket to send it on, instead of waiting for the first frame's timer.
   */
  opened?: () => void;
}

/**
 * The socket, and only the socket. `link.ts` gets messages in and messages out
 * and never touches a `WebSocket`, which is what lets `tools/relay-check` drive
 * the real client code with nothing of the browser present but this one class.
 *
 * A frame that does not decode is dropped here, where it is one lost packet,
 * rather than three layers down where it is a desync nobody can explain.
 */
export function openRelay(code: string, on: RelayHandlers): Relay {
  const socket = new WebSocket(relayUrl(code));
  let closed = false;

  // The version handshake belongs to the socket, not to the game above it: a
  // room running a different protocol should say so before anything else does.
  socket.addEventListener("open", () => {
    if (closed) return;
    socket.send(encode({ t: "join", v: PROTOCOL_VERSION }));
    on.opened?.();
  });
  socket.addEventListener("message", (e) => {
    if (closed || typeof e.data !== "string") return;
    const message = decodeServer(e.data);
    if (message) on.message(message);
  });
  const dropped = (): void => {
    if (!closed) on.dropped();
  };
  socket.addEventListener("close", dropped);
  socket.addEventListener("error", dropped);

  return {
    send(message) {
      if (!closed && socket.readyState === WebSocket.OPEN) socket.send(encode(message));
    },
    close() {
      closed = true;
      socket.close(1000, "left");
    },
  };
}

/**
 * Where the relay lives. Same origin by default — one worker serves the game
 * and the rooms — with `?relay=` as the escape hatch for the case that is
 * actually common while this is being built: the game off a local preview and
 * the rooms off a worker somewhere else.
 */
function relayUrl(code: string): string {
  const override = new URL(location.href).searchParams.get("relay");
  const base = override ?? `${location.protocol === "https:" ? "wss:" : "ws:"}//${location.host}`;
  return `${base.replace(/^http/, "ws").replace(/\/$/, "")}/room/${code}`;
}
