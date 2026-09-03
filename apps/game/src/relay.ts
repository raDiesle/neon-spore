import {
  type ClientMessage,
  decodeServer,
  encode,
  NAME_PARAM,
  PROTOCOL_VERSION,
  type ServerMessage,
  VERSION_PARAM,
} from "@neon-spore/net";
import type { TimedCommand } from "@neon-spore/sim";
import { readName } from "./nickname.js";

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
 * How the socket itself is made. The browser's is the default and the only one
 * that ships; a test injects its own so the listeners below can be driven the
 * way a real socket drives them. It takes the room code rather than a URL, so
 * nothing but the default ever reads `location`.
 */
export type SocketFactory = (code: string) => WebSocket;

const browserSocket: SocketFactory = (code) => new WebSocket(relayUrl(code));

/**
 * The socket, and only the socket. `link.ts` gets messages in and messages out
 * and never touches a `WebSocket`, which is what lets `tools/relay-check` drive
 * the real client code with nothing of the browser present but this one class.
 *
 * A frame that does not decode is dropped here, where it is one lost packet,
 * rather than three layers down where it is a desync nobody can explain.
 */
export function openRelay(
  code: string,
  on: RelayHandlers,
  socketFor: SocketFactory = browserSocket,
): Relay {
  const socket = socketFor(code);
  let closed = false;
  /**
   * One loss is one report. A socket that fails to connect or dies abnormally
   * fires `error` and then `close`, and the caller counts reconnection attempts
   * — so an unlatched pair of events spends two of the six on one drop and
   * gives up after three.
   */
  let reported = false;

  socket.addEventListener("open", () => {
    if (closed) return;
    on.opened?.();
  });
  socket.addEventListener("message", (e) => {
    if (closed || typeof e.data !== "string") return;
    const message = decodeServer(e.data);
    if (message) on.message(message);
  });
  const dropped = (): void => {
    if (closed || reported) return;
    reported = true;
    on.dropped();
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
  // The version rides the upgrade rather than a first message. A `join` frame
  // could only be read after the socket was already seated and greeted — and
  // if this was the second phone, after beat zero had been stamped for the
  // peer. A room that cannot play with this build must say so before any of
  // that happens, which means before `acceptWebSocket`.
  const origin = base.replace(/^http/, "ws").replace(/\/$/, "");
  // The name rides the upgrade beside the version, for the same reason: the
  // room hands out a seat and greets both phones before any message could be
  // read, so a name sent afterwards would arrive after the screen that wanted
  // it had already drawn. Encoded, because a name may hold a space.
  const name = encodeURIComponent(readName());
  return `${origin}/room/${code}?${VERSION_PARAM}=${PROTOCOL_VERSION}&${NAME_PARAM}=${name}`;
}
