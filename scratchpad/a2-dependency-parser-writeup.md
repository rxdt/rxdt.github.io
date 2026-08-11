# What clicked building a neural dependency parser (CS224n A2)

*Draft to rewrite in your own voice. Honor-code clean: this is about what I
learned and the concepts, not the assignment solution.*

A2 is where word vectors stop being a party trick (`king − man + woman ≈ queen`)
and start doing an actual job. The job is **dependency parsing** — figuring out
which words modify which. Two halves clicked, and they turn out to be the two
halves of most of modern NLP: a way to turn a structured problem into a sequence
of small decisions, and a neural net that makes each decision.

## Part 1 — Parsing as a stack game

The reframe that made it click: you don't parse a sentence by reasoning about the
whole tree at once. You keep a **stack** and a **buffer** and make one of three
moves at a time:

- **SHIFT** — push the next buffer word onto the stack.
- **LEFT-ARC** — the top of the stack is the head, the word beneath it is its
  dependent. Record `(head, dependent)`, pop the dependent.
- **RIGHT-ARC** — the mirror image: the second word is the head, the top is the
  dependent. Record it, pop the top.

Start with just `[ROOT]` on the stack and the whole sentence in the buffer;
you're done when the buffer is empty and the stack is back to just `[ROOT]`. The
entire parse tree falls out of a sequence of those three moves. That's the whole
idea: **a tree is a sequence of decisions.** The `parse_step` logic is ~10 lines;
internalizing the mental model took a lot longer than writing it.

## Part 2 — The net that picks the move

Now the ML question: given the current state, which of the three moves? A plain
feedforward net answers it:

- Pull **36 features** from the current state — the top words on the stack, the
  next words in the buffer, some already-attached dependents — as vocabulary
  indices.
- **Embedding lookup**: index into the embedding matrix and flatten. 36 words ×
  30-dim = a 1080-vector. The aha here: it's *just fancy indexing plus a reshape*
  (`self.embeddings[w].view(batch, 1080)`), no `nn.Embedding` magic. Implementing
  the lookup by hand is what finally demystified embeddings for me.
- **Hidden layer**: `h = ReLU(xW + b1)`, 1080 → 200.
- **Dropout** *after* the ReLU — randomly zero some hidden units so the net can't
  lean on any single one.
- **Logits**: `l = hU + b2`, 200 → 3 scores, one per move.

Two things surprised me:

1. **No softmax at the end.** You output raw logits because `CrossEntropyLoss`
   applies the softmax internally (more numerically stable). Left to my instincts
   I'd have added a softmax and been quietly wrong.
2. **Xavier initialization**, not plain random-uniform, because it keeps the
   signal variance sane as it passes through the layers.

The whole pipeline in one line: **1080 → 200 → 3**. Word indices in, a transition
out.

## Part 3 — Doing it in batches

`minibatch_parse` parses many sentences at once instead of one at a time: keep a
list of unfinished parses, grab a batch, ask the model for each one's next move,
apply them, drop the ones that just finished, repeat. The subtlety that bit me:
the working list is a **shallow copy** — the same objects as the original list —
so I remove finished parses from the working copy but read the final dependencies
off the originals, in the original order.

## The actual lesson

This is the shape of almost everything downstream in the course:
**represent a state → run a net → pick an action → repeat.** Swap "parser state →
transition" for "context → next token" and you've got a language model. A2 is
where the embeddings from A1 stop being a demo and become the *input features* to
a real task — and where "a neural net" stopped being abstract and became, very
concretely, *index, matmul, ReLU, matmul, done.*
