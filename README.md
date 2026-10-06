![StoneForge: a mod loader for Stoneshard](docs/assets/branding/banner-wide.png)

# StoneForgeDocs

Documentation for [StoneForge](https://github.com/StoneForgeTeam/StoneForge), the C# mod loader for Stoneshard, published as a self-hosted site and with [GitBook](https://www.gitbook.com/).

The pages are Markdown under [`docs/`](docs/), with [`docs/SUMMARY.md`](docs/SUMMARY.md) as the table of contents. For GitBook, [`gitbook-docs.yaml`](gitbook-docs.yaml) maps the site's one space to `docs/`, and [`docs/.gitbook.yaml`](docs/.gitbook.yaml) says how to read it.

## Publishing

The same pages are published two ways. Use either or both.

### Self-hosted (GitHub Pages)

[HonKit](https://github.com/honkit/honkit), the open-source successor to the GitBook command line, builds `docs/` into a static site using the same `SUMMARY.md`. [`book.json`](book.json) configures it, and [`honkit/plugin-hints`](honkit/plugin-hints) renders GitBook's `{% hint %}` blocks. [`honkit/plugin-branding`](honkit/plugin-branding) adds the logo, favicon and colours.

Build and preview locally (Node.js 22):

```sh
npm ci
npm run serve    # http://localhost:4000, rebuilds on changes
npm run build    # static site in _book/
```

The [Publish docs](.github/workflows/pages.yml) workflow builds every pull request, and deploys every push to `main` to GitHub Pages. To turn it on, open the repository's **Settings → Pages** and set **Source** to **GitHub Actions**. The site is then served at `https://stoneforgeteam.github.io/StoneForgeDocs/`. `_book/` can be copied to any other static host the same way.

### GitBook

1. In GitBook, create a space, open **Configure** and choose **GitHub Sync**.
2. Select `StoneForgeTeam/StoneForgeDocs` and the `main` branch, with the project directory left as the repository root. GitBook reads `gitbook-docs.yaml` there, then builds the space from `docs/` using `docs/.gitbook.yaml`.
3. Changes pushed to `main` appear on the site; edits made in GitBook are committed back to the repository.

## Editing

- Add a page as a Markdown file under `docs/` and list it in `docs/SUMMARY.md`; pages missing from the summary aren't shown.
- Link between pages with relative paths to the `.md` files, so links work on GitHub, in GitBook and in the self-hosted site.
- Check pages with `npm run build` before pushing. HonKit drops a `#` at the end of a heading, so word headings so they don't end in one ("from C# code", not "from C#").
- Documentation describes the matching StoneForge release. When a StoneForge change alters behavior described here, update the page in the same release.

## Branding

The logo and banner are in [`docs/assets/branding/`](docs/assets/branding/): `logo-64.png` to `logo-1024.png` (pixel art, transparent; scale by whole multiples), `banner-wide.png` (1920x600, for page headers) and `banner.png` (1920x1080, for social previews). The self-hosted site uses them through `honkit/plugin-branding`. On GitBook, set the logo and favicon in the site's customization settings, from the same files.
