# What clicked exploring word vectors (CS224n A1)

*Draft to rewrite in your own voice. Honor-code clean: about the phenomena and
what I learned, not the assignment solution. Numbers measured on
`glove-wiki-gigaword-200`.*

A1 builds word vectors two ways and then pokes at what they actually encode. The
two ways: **count-based** (build a word×word co-occurrence matrix, then
Truncated-SVD it down to a few dimensions) and **prediction-based** (GloVe).
Different machinery, one governing idea — Firth, 1957: *"You shall know a word by
the company it keeps."* Both turn the company a word keeps into a vector.

## The core move: contexts → geometry

Count-based made it concrete. Count how often each word lands in every other
word's window → a big sparse matrix where a word *is* its row of co-occurrence
counts. SVD squeezes that to k dimensions while preserving the structure, so
*doctor* and *hospital* end up near each other because they keep similar company.
GloVe produces nicer vectors, but the payload is identical: a word is a point
whose position summarizes its contexts. To compare two, you don't measure
distance — you measure **angle** (cosine similarity), so magnitude doesn't matter,
direction does.

## The thing that actually clicked (and surprised me)

The sentence I'll remember A1 for: **embeddings encode shared context, not shared
meaning — so antonyms sit *closer* than synonyms.** Receipts from GloVe:

- cos(up, down) = **0.846**, but cos(up, upward) = **0.343**. The antonym "down"
  is a *nearer* neighbor of "up" than the synonym "upward" is.
- distance(buy, sell) = **0.104** < distance(buy, purchase) = **0.186**. The
  antonym beats the synonym again.

Why: antonyms slot into *identical* frames — "prices went ___", "turn it ___" —
so they keep almost the same company, so they point almost the same direction.
The vector captures the *axis of contrast* (up↔down), not which end you mean. That
one fact reorganized how I think about these things: they're a compression of
contexts, and contexts don't distinguish opposites.

## The failure modes fall out of the same fact

Once "a vector = a blur of its contexts" clicked, the weird results stopped being
weird:

- **Polysemy is an averaged smear.** `hand : glove :: foot : ?` returns
  "45,000-square", not "sock" — because the *square-foot* sense is so frequent in
  the corpus that it dominates the single vector. `python`'s neighbors span Monty
  Python (cleese, spamalot), the language (php, perl), and the snake
  (reticulatus) *only because* all three senses are roughly equally frequent;
  usually one sense wins and buries the rest.
- **Bias is baked in.** `man : profession` and `woman : profession` return visibly
  different job lists. The vectors faithfully learned the associations in the
  text — including the ones we'd rather they hadn't.

## The lesson

A word vector is a summary of the company a word keeps. That single idea explains
the magic (analogies, clustering), the traps (antonyms nearer than synonyms, the
polysemy smear), and the ethics (bias) all at once. Analogies work when the
contrast axis is clean; they break when frequency or polysemy muddies it. That's
the intuition I want going into the rest of the course — and it's exactly why the
next step is to *learn* vectors task-first (A2) instead of just counting contexts.

---

*Ship note: the sharpest standalone post here is the "antonyms sit closer than
synonyms" one (your IDEAS.md #1) — one bar chart, three paragraphs. This writeup
is the umbrella; that's the single post to publish first. The `embedding-probe`
CLI in your IDEAS.md is the natural companion artifact and lines up with your
eval/measurement signature.*
