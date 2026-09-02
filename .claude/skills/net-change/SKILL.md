---
name: net-change
description: Change the wire protocol, the lockstep scheduler, the clock or the relay in Neon Spore — the files that must move together, the distrust rule, and what proves it. Use when touching packages/net, apps/server, apps/game/src/link.ts or relay.ts, adding a message type or a Command, or working on two-device play.
---

# A change that crosses the wire

Two devices run the same simulation and exchange inputs. Everything here
protects one promise: *I have scheduled nothing before tick N.* A change that
breaks it does not fail a test, it desyncs a game a minute later and reads like
a network bug.

## The files, and they move together

| File | Owns |
|---|---|
| `packages/net/src/protocol.ts` | every message on the wire, and how to distrust one |
| `packages/net/src/command-codec.ts` | validating a `Command` that arrived from outside |
| `packages/net/src/lockstep.ts` | the scheduler and the promise |
| `packages/net/src/status.ts` | what the network indicator may say, and nothing else may |
| `apps/game/src/link.ts` | the client: the wall clock and the socket, and nothing below holds either |
| `apps/server/src/room.ts` | the Durable Object: seats, beat zero, relay, clock sync |

A new message type touches the first and the last two, always. A new `Command`
variant touches `packages/sim/src/command-types.ts` **and**
`command-codec.ts` — a variant added without a decoder branch is rejected on the
wire, so the feature works solo and fails in a room.

## The four rules

1. **Decode without trusting.** Anything that is not a message this version
   knows comes back `null` rather than a half-built object. A frame with one bad
   command in it is dropped whole: a half-applied input is worse than a missing
   one. Numbers are checked for being finite integers, enums for membership.
2. **The relay never looks inside a `Command`.** A server that understood the
   game would be a second implementation of the rules, and the reason for
   lockstep is that there is exactly one.
3. **The timestamp is taken when the screen is touched**, never when the packet
   arrives — otherwise the player with the worse connection is punished.
4. **A new field on `World` goes into `hashWorld`.** The fingerprint is the only
   thing that catches the failure this whole layer exists to prevent, and
   `packages/sim/test/hash-coverage.test.ts` fails when it is forgotten.

## Proving it

`bun test packages/net` proves the scheduler against a wire the test controls.
It proves nothing about the Durable Object, the seat handout or the order a real
socket delivers in. For that, and only with a wrangler running:

```bash
bun run --cwd apps/server dev     # prints its port
bun run relay:check
bun run relay:check ws://127.0.0.1:8800 8 --split
```

`--split` reaches into one of the two worlds on purpose, to prove the desync
detector is watching rather than merely present. Kill the wrangler when done.

If you could not run it — no wrangler, a sandbox with no network — say
**unverified** in the report and name what a person should run. Do not offer a
green `bun test` as though it covered the relay.

## The one thing that is not a bug

A wave's introduction holds the field still while the tick counter keeps
counting, so the peer's promises keep arriving and the link stays live. A
deliberate pause is different: it stops the tick, and the peer correctly sees a
stall. Read `packages/sim/src/step.ts` before concluding the indicator is wrong.
