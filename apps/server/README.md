# Server — the relay

One Cloudflare Durable Object per room, over WebSocket, using the hibernation
API. It relays inputs, hands out the beat zero point and answers clock syncs.
Nothing else — the simulation runs on both devices.

It never looks inside a `Command` and holds no copy of the world. A server that
understood the game would be a second implementation of the rules, and the
reason for lockstep is that there is exactly one.

| File | Contains |
|---|---|
| `src/index.ts` | the worker: `/room/:code` and `/net/health`, nothing else |
| `src/room.ts` | the Durable Object — seats, beat zero, relay, clock sync |

The protocol, the scheduler and the clock live in `packages/net`, which both
sides import. That is the point of the package: the room and the browser cannot
drift apart about what a field means.

## Running it

```
bun run --cwd apps/server dev      # wrangler dev, on 8787
bun run --cwd apps/server deploy
```

Wrangler is Node-oriented and is deliberately not a dependency of this
workspace; the scripts call it through `npx`.

`wrangler.jsonc` lives at the repository root because one worker serves both
things: the built game from `apps/game/dist` as static assets, and the rooms
from this code. An asset match wins, so `/room/ACDE` only ever reaches the
worker.

Whether a relay is really answering:

```
curl -s http://localhost:8787/net/health
```

Only the relay answers `{"app":"neon-spore-relay","ok":true}` — the same
question `/__preview` answers for the game server, and for the same reason.

## Playing against it from somewhere else

The game connects to its own origin by default. While this is being built the
common case is the other one: the game off `bun run preview` on 4173, the rooms
off a worker somewhere else. `?relay=` says where.

```
http://localhost:4173/?relay=ws://localhost:8787
```

## What a room does

1. Two sockets, seats 1 and 2. A third is refused with 409.
2. When the second one lands, beat zero is stamped as `now + 3 s` and **both**
   are told the same number. Neither device picks its own — that is the whole
   reason the room exists rather than a peer-to-peer handshake.
3. `input`, `confirm` and `hash` are forwarded to the other seat with the
   sender's seat stamped on them, in order and unexamined.
4. `ping` comes back as `pong` carrying two server timestamps, so the client can
   take the room's own handling time back out of the round trip.

The seat is kept as a WebSocket *tag*: hibernation wakes the object with nothing
but its sockets, and a tag survives that where a field does not. The room code
and beat zero go to storage for the same reason.
