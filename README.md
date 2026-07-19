# lukezielke.com

Minimal personal site and blog for Luke Zielke. It is built with Jekyll, uses no third-party JavaScript or runtime dependencies, and is designed to deploy directly through GitHub Pages.

## Publish a blog post

1. Copy `_drafts/post-template.md` into `_posts/`.
2. Rename it to `YYYY-MM-DD-your-post-slug.md`.
3. Update the front matter and write the post in Markdown.
4. Commit and push to `main`. GitHub Pages will build and publish it automatically.

Posts appear on both the home page and `/blog/`, newest first.

## Preview locally

If Ruby and Bundler are available:

```bash
bundle exec jekyll serve
```

The site uses only GitHub Pages-supported Jekyll features. The HTML, CSS, and JavaScript can also be inspected without a build; Liquid templates are resolved during deployment.
