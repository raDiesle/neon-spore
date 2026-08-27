# Choosing a model and a thinking effort

A decision aid for writing prompts. Two dials, in the order you should reach
for them, with worked examples and the measurements behind the advice.

Everything here was learned on this repository on 27 August 2026, across
thirteen parallel agent lanes in one day. Where a rule has a number behind it,
the number is given.

---

## 1. The two dials are not the same dial

**Model** is how good the writing is.
**Effort** is how long it thinks before writing.

A cheap model thinking hard and an expensive model answering off the top are
two different failures, and the second is the one you will actually make,
because nothing stops you. Picking the top model *feels* like being careful.
It is not; it is a way of not deciding.

## 2. How you buy effort

In Claude Code you buy it with words in the prompt. This is a real ladder, not
a figure of speech:

```
think  <  think hard  <  think harder  <  ultrathink
```

**Always name what the thinking is for.** "Think hard" on its own buys depth on
whatever the model found interesting, which is often the file layout when the
hard part was the data model.

```
BAD   Think hard about this refactor.
GOOD  Think hard about what breaks for existing callers before you write anything.

BAD   ultrathink
GOOD  ultrathink about the failure mode when two devices disagree - that is
      the part that is expensive to unpick later.
```

Effort is not a parameter on the `Agent` tool. If you are spawning subagents,
the rung has to be in the prompt text.

## 3. The order of the questions

Ask these in order. Most of the value is in the first two, and they are not
about models at all.

**1. Is this task one thing?**
A task touching twenty files in three packages will cost more than a task
touching four, whatever writes it. Splitting it is worth more than upgrading
it. *(Measured: the cheapest model ran the most expensive lane of the day,
because it had the widest scope and had to be re-run.)*

**2. Will it collide?**
Anything that has to be redone doubles. Two agents in one package, or one task
racing a change you are making yourself, is the expensive mistake - not the
tier. *(Measured: one crowded batch cost two extra full agent turns; every
model choice that day cost less than that, combined.)*

**3. What does it cost to be wrong?**
*Now* you pick the model. Not "how important is this" - what does it cost to
unpick.

**4. What is the hard part?**
Now you pick the effort, and name the hard part in the prompt.

## 4. The table

| The work | Model | Effort |
|---|---|---|
| A design decision, an API shape, a data model, a protocol - the code is the easy half | `opus` | `ultrathink` |
| Something that restructures how a system thinks about itself | `opus` | `think harder` |
| New code following a pattern that already exists in the codebase | `sonnet` | `think hard` |
| UI against a written spec or a reference; a component; a page | `sonnet` | `think` |
| Tests against a module that already exists | `sonnet` | none |
| A wide mechanical sweep - rename, codemod, config across many files | `haiku` | none |
| Review: is this diff correct, is this claim true | `opus` | `think hard` |
| A question you could answer yourself in a minute | `haiku`, or do not ask | none |

## 5. Two rules that override the table

**The unpick test decides `opus`, and nothing else does.**
Not how important the task feels. Ask: if this is wrong, what does fixing it
cost in three months, to someone who has forgotten it was a choice?

- A landing is cheap to redo. -> `sonnet`
- A CSS layout is cheap to redraw. -> `sonnet`, however much it matters
- A field added to a hash two devices compare -> expensive. `opus`
- A public API other code will be written against -> expensive. `opus`
- A database migration that has already run -> expensive. `opus`

**Raise the effort before you raise the model.**
A rung of thinking costs a fraction of a tier, and it is the dial that answers
the failure that actually happens: the hard part went by without being looked
at. `sonnet` told what to think about beats `opus` told nothing.

## 6. Worked examples

Each of these is a real lane from one day's work, with what it got and whether
that was right.

**"Add two creatures from the spec: the Runt and the Throb."**
-> `sonnet`, `think` - *should have been `think hard`.*
The pattern existed (a control-visibility entry, a state machine, a replay
test), so `sonnet` was right. But it added a field to the world fingerprint,
which is the expensive-to-unpick category, and one rung more would have caught
that at the start rather than at the review.

**"Build the briefing card: a wave opens on a card teaching what the pair has
not met."**
-> `opus`, `think hard` - *should have been `ultrathink`.*
It came back having overturned two decisions in the spec, correctly and with
arguments. That is what `opus` is for. The hard part was the shape - derived
versus placed, world state versus per-device storage - and a higher rung would
have spent more of the thinking there.

**"Give the field a background: motes at two depths, a wash, a horizon."**
-> `sonnet`, `think` - *right.*
Visual work against a written spec. Cheap to redraw if wrong. Came back clean
and landed without a rebase. Nothing here would have been improved by `opus`.

**"Build a boss that bends the field instead of the beat."**
-> `opus`, `ultrathink` - *right, and the only `ultrathink` of the day.*
The mechanic had to be a sentence two people could say out loud across a
two-second delay. That is a judgement, the code is the easy half, and a wrong
answer means a boss nobody can talk about. It came back with the sentence.

**"The shape sheet uses a hardcoded list; derive it from the real data."**
-> `sonnet`, `think` - *right.*
Tooling with an existing precedent in the same codebase. It found a real bug
on the way. `opus` would have found the same bug and cost more.

**"Split this 250-line file; it is at its limit and blocking changes."**
-> `sonnet`, `think` - *right.*
The one judgement - where to cut - was small and had a precedent in the file's
own history. Behaviour must not change, which is a constraint, not a decision.

**"Build the first round that is not the main game - it drags in the shell
that eleven more will inherit."**
-> `opus`, `think harder` - *right.*
The thing being built is small. The seam it cuts is inherited by eleven more.
That is the unpick test answering `opus` on a task whose visible size says
otherwise.

## 7. Anti-patterns

**Reaching for the top model by default.**
It is not generous, it is a way of skipping questions 1 and 2 - which is where
the cost actually is.

**Using a bigger model to compensate for a vague prompt.**
A vague prompt makes a strong model confidently build the wrong thing, faster.
Spend the effort on the prompt first. If you cannot say what the hard part is,
the model cannot either.

**`ultrathink` on a task with no judgement in it.**
Renaming a symbol across forty files does not benefit from deliberation. It
benefits from a good regex and a green test suite.

**One giant task instead of three.**
"Refactor the auth system, add SSO, and update the docs" is three tasks that
will collide with each other. Question 1 exists for this.

**Assuming a hard task needs a big model rather than better inputs.**
Often the winning move is `sonnet`, plus the two files it needs to read named
explicitly, plus one sentence saying what the hard part is.

## 8. When the answer is not a model at all

- **The task is transcription** - the spec would run as long as the code.
  Write it yourself, or hand it to a cheap worker. `docs/delegation-cost.md`
  measured the alternative at 6.8 times the cost, 91.5% of it in round trips.
- **You do not know what you want yet.** Ask for two options and their
  trade-offs, cheaply, before commissioning either.
- **You need it verified, not written.** A review pass on an existing diff is
  a different task from writing it, and it is one of the few places where
  paying for `opus` reliably returns the difference.

## 9. The one number worth remembering

The unit of cost is the **turn**, not the token rate. Any task that comes back
for a second pass has doubled, whatever wrote it. That is why scope and
collisions dominate model choice, and it is why the cheapest way to save money
is a prompt precise enough to be answered once.

## 10. What choosing wrong actually costs

One honest caveat first: the table of consequences below is **estimated**.
Thirteen lanes were watched in a day, but none was run twice with different
settings, so there is no controlled counterfactual for any of them. The one
genuinely controlled measurement this repository has is
`docs/delegation-cost.md`, where the same module was built twice and
delegation came out at 6.8 times the cost.

### What was measured

Token spend per lane, by model:

| | Range across the day |
|---|---|
| `sonnet` lanes | 111k - 358k |
| `opus` lanes | 193k - 347k |

**The ranges almost entirely overlap.** The cheapest lane of the day was
`sonnet` (111k, one file, one clear seam). The most expensive lane of the day
was also `sonnet` (358k, twenty files across three packages, plus a rebase).
The model tier explained close to none of the spread. Scope and repeat turns
explained nearly all of it.

That is the single most useful fact on this page, and it argues for spending
your attention on questions 1 and 2 rather than on the table in section 4.

### What is estimated

| Wrong choice | What you get | Estimated cost |
|---|---|---|
| **Model too low** on a judgement task | Comes back green, with a plausible wrong premise. It compiles, the tests pass, and the hard question was never asked | Unbounded. Either you catch it in review (one extra turn, about 2x) or it sits in the code for months |
| **Model too high** | Nothing bad. Slightly more spend, same result | About 1.2-1.5x on that lane. The cheapest mistake available |
| **Effort too low** | The most common failure: green but shallow. The first workable structure, not the right one | About one extra turn if you notice - and you often do not |
| **Effort too high** | Usually harmless; occasionally over-engineering, an abstraction for a problem that did not have one | About 1.1-1.3x, plus the odd piece of code somebody later deletes |
| **Scope too wide** | Measured rather than estimated: the widest lane cost roughly 3x the narrowest and needed a rebase | 2-3x |
| **No subject named for the thinking** | You pay for depth and receive reflections on file layout while the data-model question goes untouched | Full price of the rung, no return |

### The asymmetry is the actual rule

Choosing **too high** costs visibly, boundedly, and now.
Choosing **too low** costs invisibly, unboundedly, and later.

So when you are unsure about the unpick price, go up - the uncertainty is
itself the signal. When the unpick price is clearly low, a layout, a landing,
a contour, go down without guilt.

And when you are unsure whether the task is one thing, that is not a model
question at all. Split it, and ask again.

