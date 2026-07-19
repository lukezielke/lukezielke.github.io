---
title: "Hello, world. Again."
description: A small reset, and a place for technical notes that deserve more than a commit message.
tags: [meta, web]
---

Every personal site eventually becomes an archaeology project. This one had a terminal, a virtual file system, and enough JavaScript to pretend it was a very small Linux machine. It was fun—but the interface had become louder than the things it was meant to show.

So this is a reset.

## What belongs here

I’ll use this space for notes from projects, small technical discoveries, security and automation experiments, and the occasional longer explanation of something I had to learn the hard way.

The rules are intentionally simple:

- write when there is something useful to say;
- prefer working code over abstract advice;
- keep the site fast, readable, and independent;
- leave enough context for future me.

## Why Markdown

The blog is deliberately uncomplicated. A post is a Markdown file in `_posts`, with a short block of metadata at the top:

```yaml
---
title: "A useful title"
description: A one-line summary.
tags: [systems, notes]
---
```

GitHub Pages turns it into a page when the repository is pushed. No dashboard, database, or JavaScript framework required.

That feels like the right foundation: less machinery, more room to build.
