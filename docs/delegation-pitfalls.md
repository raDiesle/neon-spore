# Delegation pitfalls, catalogued

Delegation is off by default now — `docs/delegation-cost.md` measured why, and
`CLAUDE.md` says what still earns it. The machinery is untouched and still
correct for the tasks it fits. This file is the field notes from actually
running it hard: about forty delegated runs in one session, roughly a third of
which failed at least once. If delegation is turned back on for more of what
gets written, these are the concrete ways it broke, so they are not
rediscovered at the same price.

## The reply cap, not the context window

`max_tokens: 8192` in `.aider.model.settings.yml` is the guard against a doom
loop — the first delegation on this repo burned 65,000 output tokens repeating
one clause. It is also what cut roughly a quarter of the runs in this session
mid-edit, and the way it fails is easy to misread.

GLM-5.2 bills its reasoning as output. On a task that needs real deliberation —
every cut run here was a **test-writing task** — it spends seven or eight
thousand tokens thinking before the first edit block, and the reply ends
mid-sentence. Aider then prints something like:

```
Model openrouter/z-ai/glm-5.2 has hit a token limit!
Output tokens: ~8,220 of 1,048,576
```

That reads like the run came close to the context window. It did not: the
denominator printed is the model's context, not the cap that actually stopped
it. Across every run in the session with token data, the **largest input the
worker was ever sent was 26,000 tokens** against a 262k–1M window — nowhere
near a real limit. Don't spend time on context-window theories when this
message appears; check the reply length first.

**Mitigation in place:** an escalation slot in `.aider.model.settings.yml`
(`openrouter/moonshotai/kimi-k2.7-code`, `max_tokens: 16384`) landed every task
the default worker was cut on, in this session, without exception on the first
try. Escalate by editing `.aider.conf.yml`'s `model:` line to point at it, run
the delegation, then set it back — don't leave the escalated model as the
default, since it is the more expensive one and the default worker lands most
tasks fine.

Even 16,384 was not always enough — one test-repair task hit 16,431 of a
262,144 window and still got cut. When a task needs splitting because of the
cap, **split by case, not by re-running the same spec smaller.** Re-running an
identical spec after a miss is a doom loop even if each individual attempt only
costs cents: nothing about the spec changed, so nothing about the outcome will.
Narrow the *scope* — one test case per delegation instead of seven — rather
than shortening the same broad ask and hoping.

## No-op runs: "the run changed nothing"

Aider scans the spec text and the target files for anything that looks like a
repository path, and offers to add each one to the chat. `yes-always: true`
accepts every offer, so the reply that should have carried the edit is spent
on that exchange instead, and the worker reports the work done while
`git diff` stays empty. `tools/delegate/run.ts`'s read-only pre-scan
(`tools/delegate/mentions.ts`) exists specifically to close this hole by
handing every mentioned path over before the run starts — but it only covers
paths in the spec and target files at the *start*; it cannot pre-empt a path
the worker's own reply mentions mid-run.

One instance worth naming because it is not obvious: a **prohibition** is just
as dangerous as an instruction. A spec line reading *"do not touch queue.ts"*
still gets `queue.ts` offered and accepted — the wrapper's scan sees the path
regardless of the sentence around it. Never name a file in a spec unless it is
either the target or already on the read-only list; say the constraint without
the filename if you can.

**Prose specs are the worst case.** A markdown task cites its own subject's
paths in the text it's asking the worker to write, so a document task can
re-trigger the mention absorption on every attempt no matter how the spec is
reworded — rewording doesn't help, because the mentions come from the file
being edited, not from how the ask is phrased. Two doc tasks in this session
missed twice, at both the default and the escalated model, for this reason and
were written directly in the session instead, per the two-misses rule already
in `.claude/skills/delegate`.

## The worker edits files outside its whitelist to keep the tree green

Observed twice: once the worker duplicated an interface it needed into a
second, unlisted file rather than importing it, to satisfy a type error it
could see but had no permission to fix at the source; once it touched a second
test file beyond the one it was assigned when a shared assertion broke. Both
times `bun run check` came back green, which is exactly why this needs a human
diff review and not just a green check — **the whitelist is a token budget and
an instruction, not a sandbox.** `bun run delegate` enforces nothing at the
filesystem level; it only tells the worker what it may edit and hopes it
listens. Read the full diff, not only the target files, every time.

## Config-editing footguns (not aider's fault, but bit this session)

Piping `.aider.conf.yml` through a script that opens it for writing without
reading it first can truncate it to zero bytes if the script errors mid-write.
Aider then fails immediately and unhelpfully:

```
aider: error: The config file doesn't appear to contain 'key: value' pairs
```

which looks like a corrupted install rather than an empty file. It's
recoverable only if something else has an intact copy — a git-tracked file
does, since `git diff` shows the truncation immediately. Diff config files
after any scripted edit before trusting them; don't rely on the run itself to
surface the problem, since the error message doesn't say what actually broke.

## What worked without qualification

- **Escalating once after two misses**, exactly as `.claude/skills/delegate`
  already prescribes, resolved every stuck task in this session. It was never
  needed a second time on the same task.
- **`BROWSER=echo`** in `tools/delegate/run.ts` (already landed) stops a cut
  run from popping a literal browser window on the desktop — aider offers to
  open a help URL when a reply is cut, and `yes-always` used to accept that
  offer too.
- Full counts, cost and the measurement this file's numbers are drawn from are
  in `docs/delegation-cost.md` — this file is pitfalls, that one is the
  arithmetic.
