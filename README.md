# StoneForgeDocs

Documentation for [StoneForge](https://github.com/StoneForgeTeam/StoneForge), the C# mod loader for Stoneshard, published with [GitBook](https://www.gitbook.com/).

The pages are Markdown under [`docs/`](docs/). [`docs/SUMMARY.md`](docs/SUMMARY.md) is the table of contents, and [`.gitbook.yaml`](.gitbook.yaml) points GitBook at that folder.

## Publishing

The site is synced with GitBook's Git Sync:

1. In GitBook, create a space, open **Configure** and choose **GitHub Sync**.
2. Select `StoneForgeTeam/StoneForgeDocs` and the `main` branch. GitBook reads `.gitbook.yaml` and builds the space from `docs/`.
3. Changes pushed to `main` appear on the site; edits made in GitBook are committed back to the repository.

## Editing

- Add a page as a Markdown file under `docs/` and list it in `docs/SUMMARY.md`; pages missing from the summary aren't shown.
- Link between pages with relative paths to the `.md` files, so links work both on GitHub and in GitBook.
- Documentation describes the matching StoneForge release. When a StoneForge change alters behavior described here, update the page in the same release.
