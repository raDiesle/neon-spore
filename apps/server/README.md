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
bun run deploy                     # build the game, then push the worker
bun run deploy:dry                 # the same, stopping short of uploading
```

Wrangler is Node-oriented and is deliberately not a dependency of this
workspace; the scripts call it through `npx`.

The deploy is a **root** script and not this package's, because one upload
carries two things and only one of them is here: the worker's code, and the
game's bundle as static assets. Deploying without building the game first
ships whatever `apps/game/dist` happened to hold — an old bundle, or nothing.
So `bun run deploy` runs `build:game` first, and
`bun run --cwd apps/server deploy` is kept only as an alias that calls it.

It needs a Cloudflare login, which wrangler asks for in a browser the first
time (`npx wrangler login`), or a `CLOUDFLARE_API_TOKEN` in the environment.

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

## Two real phones

One upload carries both halves, so there is one command and no separate
front end to host:

```
bun run deploy:game
```

It builds `apps/game/dist` and pushes it with the worker, which serves the
bundle as static assets and the rooms from `/room/:code` on the same origin.
That is what makes the default `?relay=` unnecessary in the shipped game: the
page and the room are the same host, so a phone needs the address and nothing
else.

Then, on the two handsets:

1. Both open the address. Either one taps the indicator in the corner and then
   **CREATE**, which makes a four-character code.
2. The other types it in, or taps **SEND LINK** on the first phone and opens
   what arrives — `?room=ACDE` walks straight into the room. The code stays the
   way in; the link is only a way to deliver one to somebody who is not in the
   same kitchen.
3. When the second phone lands, both count down from three and start together.
   The room hands out the seats, so neither player chooses which half they are
   holding.

**Add it to the home screen when asked.** It is a fullscreen portrait web app
(`apps/game/public/manifest.webmanifest`); installed, it drops the browser's
address bar, which is thirty vertical pixels the field would rather have.

## What a room does

1. The protocol version rides the upgrade as `?v=`, and a build that does not
   match is refused before `acceptWebSocket` — before a seat, a greeting or a
   beat zero stamped for the peer of a run that cannot happen.
2. Two sockets, seats 1 and 2. A third completes the upgrade, is told
   `{"t":"error","code":"full"}` and is closed with 4000. It is deliberately
   *not* a 409: an HTTP refusal reaches the page as a socket that would not
   open, which is what a dead line looks like too, and a player told their
   connection died over a room that is merely busy goes off to check a signal
   that is fine.
3. When the second one lands, beat zero is stamped as `now + 3 s` and **both**
   are told the same number. Neither device picks its own — that is the whole
   reason the room exists rather than a peer-to-peer handshake.
4. That restamping is also how a rejoin works. A phone that dropped and came
   back fills the room again, so a fresh beat zero goes to both, and both throw
   the run away and count down again — the alternative is two devices counting
   from different ticks, which is not lag but two games.
5. A seat that has not said a word in ten seconds is hung up on and stops being
   counted. A socket whose connection simply vanished — a locked screen, a
   tunnel — stays open here until the edge times it out minutes later, and
   without this the phone comes back 900 ms later and is told the room is full
   by the room holding its own seat. Every seat pings every 700 ms, so silence
   that long is a connection that is gone whatever the socket still says.
6. `input`, `confirm` and `hash` are forwarded to the other seat with the
   sender's seat stamped on them, in order and unexamined.
7. `ping` comes back as `pong` carrying two server timestamps, so the client can
   take the room's own handling time back out of the round trip.

The seat is kept as a WebSocket *tag*: hibernation wakes the object with nothing
but its sockets, and a tag survives that where a field does not. The room code
and beat zero go to storage for the same reason.
