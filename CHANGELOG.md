# Changelog

All notable changes to Detour are documented here.

## 1.0.2 - 2026-10-21

- Updated Astro to 7.4.1 and other dependencies.
- Updated `AGENTS.md` for Astro 7.
- Files check out with LF line endings on every platform.

## 1.0.1 - 2026-09-14

- Centred the date, read time, and place on the immersive opening where they wrap on a phone.
- The lightbox steps through a gallery by swiping the picture below 48rem; the arrows stay on wider screens.
- Pull quotes set in the body face, italic, rather than the serif.
- Hid the orphan card in the front-page grids on a phone.

## 1.0.0 - 2026-09-13

- Initial commercial release.
- Astro 7 travel magazine theme with front page, article, archive, section, tag, author, search, saved, about, contact, privacy, RSS, robots, sitemap, and 404 routes.
- Markdown and MDX content collections with frontmatter validated at build time, including a `place` field and six article openings — `standard`, `split`, `banner`, `parallax`, `cover`, `immersive` — set per post.
- A front page dealt from the archive with no repeats: a self-rotating three-story slider with the most-read beside it, card grids, a tinted topics sentence, a poster wall, and a section browser that works without JavaScript.
- A 1500px measure on a white page with one claret accent and a tint per section; Cormorant Garamond for headings and Mulish for everything else, both self-hosted.
- Every article image opens in one shared lightbox, whether written as Markdown or as a `Figure` or `Gallery` component.
- Client-side search with a keyboard palette and results page, archive filters by section and length, and a per-browser saved-stories list.
- Feeds for the site, each section, and each author; canonical URLs, sitemap, Open Graph, Twitter/X cards, JSON-LD, and share cards cropped from each cover at build time.
- Provider-neutral newsletter and contact forms, shipping disabled.
- Thirty-six demo stories across six sections with credited Pexels photography.
