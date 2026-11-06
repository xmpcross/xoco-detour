# Customization Guide

Use this guide when adapting Detour for a real travel publication.

## Site Settings

Edit [src/config/site.ts](./src/config/site.ts) first. It controls the site name, tagline, default metadata, canonical domain, language and date locale, the editor's byline, contact details, social links, feed settings, newsletter form settings, and navigation labels.

Update `siteConfig.siteUrl` before building for production. Canonical URLs, social image URLs, RSS, robots, sitemap, and JSON-LD all depend on it, and [astro.config.mjs](./astro.config.mjs) reads it from there rather than duplicating it.

## One Writer, or More

Detour ships as a one-name publication, and the layout takes that seriously: **the byline appears on the article and on the author archive, and nowhere else**. It is not on the cards, the feature rows, the opening columns or the chart, because a site published under one name printing it forty times on a front page tells a reader nothing they did not already know.

`siteConfig.editor` names the person the About page is built around, and [src/config/authors.ts](./src/config/authors.ts) holds portraits keyed by the `author.name` used in post frontmatter. `siteConfig.editor.name` has to match, or the About page skips the byline block entirely.

Nothing in the theme assumes one name, though. The byline, the avatar, the per-author archive at `/author/<name>/`, the per-author feed, and the `coauthors` array in frontmatter all keep working as names are added — put a portrait in `authorProfiles` and it is picked up everywhere; a name with no entry falls back to a monogram avatar. If you grow a masthead worth naming on the front page, add the byline to [src/components/ui/PostMeta.astro](./src/components/ui/PostMeta.astro) and it reaches every archive row at once.

What the theme does not ship is a contributors index page. For a masthead worth listing, add a `/author/index.astro` that maps over `getAllAuthors()` and link it from `secondaryNavigation`.

## Sections and Tints

Sections (the content model still calls them categories) live in one place: [src/config/categories.ts](./src/config/categories.ts). Add, remove, or rename them there, then update posts so every `category` frontmatter value still matches the allowed list.

`categoryTints` gives every section a colour. Each value names one of the `--tint-*` tokens in [src/styles/global.css](./src/styles/global.css), and that colour is the ground of every panel where the section is the subject:

- the section names in the front page's topics sentence,
- the panel in the front page's section browser,
- the header block on the section's own archive page.

Nothing else on the site is tinted, which is what makes a colour mean "this section" rather than "this is decorated". If you add a section, add a tint for it — the type is exhaustive, so a missing one fails the build rather than rendering untinted.

`categoryLayouts` controls how each section archive presents its posts:

- `grid` uses the card grid — the same grid as the front page: two cards to a row on a phone and three from `48rem` up, and no more than three at any width. A fourth column makes the photographs too small to be worth leading with.
- `list` uses the archive ledger, one image-led row per post. Slow Travel ships on `list` so both are demonstrated.

`categorySlug` derives URLs from the section name, lowercasing it and turning spaces and ampersands into hyphens — so `City Guides` becomes `/category/city-guides/`.

The section bar in the header, the site menu, the footer, the topics sentence on the front page, the section browser, and the section dropdown in the archive filters are all generated from that same list. You do not edit navigation labels or URLs separately.

`categoryMeta` carries two strings per section: `description`, printed under the section heading and used in its metadata, and `blurb`, the short line under each tab in the section browser.

## The Measure

The whole site is set inside 1500px and centred. That number is `--frame` in [src/styles/global.css](./src/styles/global.css), and `.container` is the only thing that reads it.

The page is not boxed. The ground, the header rule and the footer slab run the full width of the window; only the type inside them stops at the measure. Change `--frame` and every block follows.

A block that wants to run edge to edge uses `.bleed`, which is a negative gutter — it cancels `.container`'s own padding rather than escaping to `100vw`. That is why nothing on the site needs a scrollbar-width fudge, and why there is no horizontal overflow at any width.

## The Front Page Blocks

[src/pages/index.astro](./src/pages/index.astro) is dealt from the top down. Each block takes the next slice of the archive through `take()`, so nothing repeats between them:

1. **`HomeHero`** — three stories on a slider, each a photograph with its section, headline and standfirst centred under it, and the most-read in a column beside.
2. **Grid** — the next nine as `card`s.
3. **`TopicsLine`** — the sections written out as one large sentence, centred on the page, each name highlighted in its own tint.
4. **Poster wall** — eight `poster` cards, drawn from `getEditorsPicks`.
5. **`CategoryBrowser`** — the sections one at a time, as tinted panels.
6. **Grid** — six more, with their standfirsts.

Two of those draw from the whole archive again, and each is a _criterion_ rather than a position: the poster wall is "flagged in frontmatter" and the browser is "by section". A story qualifying for one while also running further up the page is the right answer, not a duplicate.

Every block hides itself when it has nothing to show. To reorder, move the JSX; to drop one, delete it and the `take()` call that feeds it.

## Cards

[src/components/PostCard.astro](./src/components/PostCard.astro) has four variants. They differ in crop and in how much type they carry, never in whether the picture leads:

- **`card`** — 3:2 cover, the section in small claret capitals, the headline. Centred, with nothing else in it. The default, and what every grid carries.
- **`poster`** — 4:5 cover with the headline set over the foot of it.
- **`compact`** — a square thumbnail beside the headline, for lists.
- **`plain`** — no picture at all: the caption strip and the headline.

A card carries no date and no read time. Those are facts about a story, not reasons to read one, and twenty of them across a grid is the noise that stops a page of photographs being a page of photographs. The archive rows carry the section and the date on one line under the headline — [src/components/ui/PostMeta.astro](./src/components/ui/PostMeta.astro) — and the read time is on the article, where a reader has asked for the detail.

`.grid-posts` is the grid they sit in: two columns on a phone and three from `48rem` up, and no more than three at any width — inside a 1500px measure, a fourth column makes the photographs too small to lead with. Set `--post-cols` on the grid to fix a different count. Adding `.grid-posts--flush` drops a trailing part-filled row rather than leaving one or two cards hanging; the rules are written per column count, so a grid with its own `--post-cols` needs its own.

## The Slider

[src/components/HomeHero.astro](./src/components/HomeHero.astro) is a scroll container with snap points, not a script that moves things. A swipe, a trackpad, a wheel and the arrow keys all work before any JavaScript runs, and the dots are anchors into the track, so they move the slider with scripting off too.

What the script adds is the rotation. Each dot fills across while its slide is up and the slide changes the moment the fill lands: the mark is the clock rather than a readout of one, so the two can never disagree and holding one holds the other. It stops the moment a reader is anywhere near the block — pointer over it, focus inside it, tab in the background, block scrolled off screen — because a slide that moves while it is being read is a slide the reader has to chase back.

The interval is the `duration` prop, 7000ms by default; it reaches the fill as `--opening-duration` and nothing else holds the number. `prefers-reduced-motion` turns the fill off in the stylesheet, which turns the rotation off with it — with no animation there is no `animationend` to advance on, and the slider is swipe and click only.

The photograph is held under the width of its column (`--slide-media`, 42rem) so the headline and the standfirst land inside the first screen rather than below the fold.

Three slides is the shipped count. It takes whatever `getFeatured` returns, so flag three posts `featured: true` to choose them.

## The Section Browser

[src/components/CategoryBrowser.astro](./src/components/CategoryBrowser.astro) renders **every** section as a panel on the server, each under its own heading. Only once the script has run does the list of sections become a `tablist` and the panels start hiding each other.

That ordering is the point: with scripting off the block is a plain stack of sections and nothing is hidden behind a control that does not work. If you restyle it, keep `[data-tabbed]` doing the hiding rather than moving it into the markup.

`limit` sets how many stories a panel carries — the first becomes the picture, the rest become rows. The default of `5` fills the panel at the shipped proportions.

## Post Frontmatter

Validated by [src/content.config.ts](./src/content.config.ts). A bad field fails the build rather than shipping.

| Field              | Required | Notes                                                                      |
| ------------------ | -------- | -------------------------------------------------------------------------- |
| `title`, `excerpt` | yes      | The excerpt is the standfirst, the card line, and the meta description.    |
| `category`         | yes      | Must match `categories`.                                                   |
| `date`             | yes      | Drives every listing order.                                                |
| `updatedDate`      | no       | Printed at the foot of the article.                                        |
| `author`           | yes      | `{ name, role }`.                                                          |
| `coauthors`        | no       | More `{ name, role }`, read after the lead.                                |
| `tags`             | no       | Tag archives at `/tag/<tag>/`.                                             |
| `cover`            | yes      | `src`, `alt`, `creditName`, `creditUrl`, optional `showInPost` and `side`. |
| `storyLayout`      | no       | See below. Defaults to `standard`.                                         |
| `place`            | no       | "Lisbon, Portugal". Printed in the title block and indexed for search.     |
| `featured`         | no       | Puts the post at the top of the front page. Newest flagged wins.           |
| `editorsPick`      | no       | Promotes into the poster wall.                                             |
| `trending`         | no       | Promotes into the Most read chart.                                         |
| `draft`            | no       | Excluded from every listing, feed and index.                               |

Posts live in [src/content/posts](./src/content/posts), one folder per post, with `cover.jpg` and any inline images beside the `index.md`.

## Article Openings

`storyLayout` picks one of six treatments in [src/components/PostHero.astro](./src/components/PostHero.astro). All six share one title block — the section, the headline, the standfirst, then the byline with the date, the read time and the place beside it — so nothing moves from one story to the next:

- **`standard`** — type first, then the cover at the same width as a picture inside the article.
- **`split`** — the cover takes one half of the screen and the type the other, on a ground of its own. `cover.side` picks the half the picture gets, `left` or `right`, and defaults to `left`. Below `64rem` the two stack, picture first. It is the one field any other opening ignores.
- **`banner`** — an edge-to-edge strip, with the title block on a card riding up onto the foot of it.
- **`parallax`** — type first, then a tall strip the photograph moves inside as the page scrolls.
- **`cover`** — the photograph carries the headline, at a fixed height.
- **`immersive`** — the type centred on a cover exactly one viewport tall, with the header lifted onto the artwork. See [The Header and the Menu](#the-header-and-the-menu).

A post with `cover.showInPost: false` falls back to `standard` and renders no picture.

The credit is part of the title block on every opening that does not leave room under the picture for it — `split`, `banner`, `cover` and `immersive` all print it as the block's last line, under Share and Save.

The parallax drift is a scroll-driven CSS animation — `animation-timeline: view()` — so nothing listens to scroll and nothing runs on the main thread. Two details in `.posthero-parallax` are load-bearing and worth leaving alone: the frame uses `overflow: clip` rather than `hidden`, because `hidden` makes an element a scroll container and the timeline would resolve against a box that never moves; and the easing comes from `var(--ease-linear)`, because a fully static `animation` shorthand gets `view()` folded into it by the minifier and dropped. Browsers without view timelines, and readers who have asked for reduced motion, get the strip with the picture sitting still in it.

The site menu offers one live example of each layout, derived from the archive by `storyLayoutExamples()` in [src/lib/posts.ts](./src/lib/posts.ts) — so a layout nothing currently uses is simply absent from it.

## Article Body

Plain `.md` posts get headings, lists, pull quotes, images and code.

**Every image in an article behaves the same way**, however it was written: it steps outside the reading column and it opens in the lightbox. An image written as plain Markdown with an italic line under it is promoted into a real `<figure>` with a lightbox button by the script in [src/pages/post/[slug].astro](./src/pages/post/%5Bslug%5D.astro) — so a post does not have to import a component to get a captioned, enlargeable photograph:

```md
![Alt text that describes the photograph](./inline.jpg)

_What it shows. Photo: Name._
```

`.mdx` posts can additionally import two components from [src/components/content](./src/components/content):

- **`Figure`** — one image with a caption, a credit, and a click-to-enlarge view. `wide` breaks it out of the reading column.
- **`Gallery`** — a set of images. Two or three sit still and share the row; four or more become a slider, because past three the tiles get too small to be worth looking at. Captions show in the lightbox rather than under the tiles.

All three — promoted Markdown images, `Figure`, and `Gallery` — share one lightbox and one set of arrows, rendered once per article by [src/components/content/Lightbox.astro](./src/components/content/Lightbox.astro). Promotion happens in the browser rather than in a rehype plugin so the content stays plain; with scripting off the image is still an image and the caption is still a caption, styled identically, just not enlargeable.

## Read Time

Counted from the prose at build time by `readMinutes()` in [src/lib/posts.ts](./src/lib/posts.ts), at 200 words a minute, never less than one. Code blocks, HTML, URLs and Markdown punctuation are stripped first, so a story heavy with any of them is not counted as though a reader had to read it.

It is printed in the article title block beside the byline and the date, and it feeds the length filter on the archive.

## The Header and the Menu

[src/components/SiteHeader.astro](./src/components/SiteHeader.astro) is two rows: Menu at the left, the logo centred, Search and Saved at the right; then a hairline bar carrying every section with About at the end. On a phone the first row collapses to the logo at the left and the controls at the right, and the section bar is hidden below `64rem` — it would be a sideways scroller of the same sections the menu already lists in full.

Menu opens the drawer in [src/components/SiteDrawer.astro](./src/components/SiteDrawer.astro), laid out as a contents page: the sections as one compact list, then the post layouts and the site pages in two short columns, then the signup and the social links. It traps focus while open and restores it on close.

The panel comes in on the side the Menu control is on — from the left from `48rem` up, and from the right on a phone, where the control sits at the other end of the bar. A link in it is marked with an `↗` only when it actually leaves the site, so adding an external URL to `secondaryNavigation` is enough to get one.

The header hides on the way down and comes back on the way up, so a long article is read without it and a reader who wants out never has to scroll to the top. Away from the top it returns as its first row only — Menu, the logo, Search and Saved — and the section bar reappears once the reader is back at the top of the page. The collapsed header keeps its full-height footprint in the flow, so the page never shifts under the reader when the bar goes.

An article that opens with the `immersive` hero sets `has-overlay-header` on `<body>`, which lifts the bar onto the photograph: no ground, no rules, white type, and out of the flow — which is what makes that hero one viewport tall rather than a viewport plus a bar. The bar scrolls away with the picture and returns solid and fixed on the way back up, as the first row only.

## Archive Filters

[src/components/ArchiveFilters.astro](./src/components/ArchiveFilters.astro) puts one Filters button under the page header on the archive and section pages, and a dialog with two dropdowns behind it: section, and length.

Length filters on read time — under five minutes, five to ten, over ten — and works across the whole archive rather than the current page, by reading the same `/search-index.json` the search surfaces use. Its state lives in the query string, so a filtered view can be shared and survives the back button. Section is a place rather than a filter: choosing another one goes to that section's page and carries the length along.

With JavaScript off the button does nothing and the list stands as rendered.

## Images

Covers and inline images are imported through Astro's image pipeline, so they are resized, converted and hashed at build time. Supply a real `alt` on every cover; the theme uses `alt=""` itself wherever an image is decorative and the headline beside it already says what the picture is.

Three crops cover the whole site, as `--ratio-*` tokens: `wide` (3:2) for cards and article covers, `tall` (4:5) for posters and browser panels, and `card` (5:4) for the most-read thumbnails beside the slider. Keeping to three is what lets a poster, a thumbnail and a grid card cut the same photograph the same way.

Images inside the reading column are capped at roughly half the viewport height and cropped rather than shrunk, so a portrait photograph does not become a full screen of one picture.

## Newsletter and Contact

Both forms are provider-neutral and both ship disabled, saying so in the UI. Set `enabled: true` and an `action` in `siteConfig.newsletter` or `siteConfig.contact` and they post to whatever endpoint you name. `emailFieldName` exists because providers disagree about what to call the field.

The newsletter block lives across the top of the footer, so a page ends once rather than twice.

## Pages

`about`, `contact`, `privacy`, `search`, `saved` and `404` are ordinary pages in [src/pages](./src/pages). The About page counts its own figures from the archive — stories, first published date, busiest section — so they stay true as the site grows rather than going stale in a config file.

[src/components/PageHeader.astro](./src/components/PageHeader.astro) opens all of them. It is a ruled block by default; `tint` sets it in a section's colour, and `panel` sets it in the same box on a neutral ground — which is what About and Contact use, because a tint on the page would read as a section.

## Search

One build-time index at `/search-index.json`, built by [src/lib/search.ts](./src/lib/search.ts). No service, no API key.

Two surfaces read it: the palette in the header (`/` or `⌘K`) and the results page. Both rank with the same function, so a story cannot place differently depending on where it was searched from. Ranking is in tiers — a headline hit outranks a section or tag hit, which outranks a mention in the excerpt — and matching is on word starts, so a half-typed word still reaches the right story. A post's `place` is indexed alongside its tags.

Add a field to `SearchItem` and it reaches the palette, the results page, the reading list and the archive filters at once.

## Saved Stories

A per-browser reading list. [src/components/SavedRuntime.astro](./src/components/SavedRuntime.astro) owns the storage and publishes `window.detourSaved`; every Save control talks to that, and `/saved/` reads it back. No accounts and no backend, so a reader clearing their browser clears their list — which the page says.

The page paints the site's standard cards into a grid, each with the control that takes it off the list in the corner of its cover. The bookmark in the header grows a dot once the list is not empty. It is a link rather than a control, so it works with JavaScript off — the page it points at is the one that needs the script, and it says so itself.

Saving a story raises a toast from [src/components/SaveToast.astro](./src/components/SaveToast.astro) for the one thing a reader cannot guess: that the list lives in this browser. It auto-dismisses after seven seconds, holds while hovered or focused, closes on Escape, and is suppressed on `/saved/` itself, where the card disappearing is already the confirmation.

Both the dot and the toast are painted from an event rather than by polling: `SavedRuntime` fires `detour:saved-change` with `{ slug, saved, count }` on every add and removal. The storage key is `detour:saved`; change it if you fork the theme onto a domain that already used it. To drop the feature, remove the two `SaveButton` usages, the header bookmark, the `/saved/` page, and its entry in `secondaryNavigation`.

## Feeds

`/rss.xml` for everything, one per section at `<its page>rss.xml`, and one per author. All three come from [src/lib/feeds.ts](./src/lib/feeds.ts), so a reader who subscribes to one section gets the same item shape as a reader who subscribes to everything.

`siteConfig.rss.fullContent` puts the rendered article in the feed; `limit` caps the item count.

## Social Cards

Every page's share image is cropped to 1200x630 at build time in [src/layouts/BaseLayout.astro](./src/layouts/BaseLayout.astro), from the post's own cover where there is one. Both dimensions are clamped to the source, because Astro will not enlarge an image and the `og:image:width` would otherwise be a number no scraper could verify.

`siteConfig.socialImage` is the fallback, and `publisherLogo` is the raster logo in structured data — point that at a real logo before launch.

## Structured Data

[src/lib/schema.ts](./src/lib/schema.ts) emits `Article` with linked `Person` bylines, a `BreadcrumbList` on every article, and `WebSite` with a search action the site actually answers. Nothing is asserted that the page does not also print, and every URL is absolute.

## Theme Tokens

Everything visual is a custom property at the top of [src/styles/global.css](./src/styles/global.css): the neutral ramp, the accent, the tints, the type scale, the weights, the radii, the measure, the section gap, and the easing curves.

Radii are `--r-xs` through `--r-xl`. Set them all to `0` for a squared-off site; nothing else has to change.

## Fonts

Two, both self-hosted in `public/fonts`, with no external requests. They divide by job, and the division has no exceptions:

- **Cormorant Garamond** sets every heading, from the slider headline down to a card title.
- **Mulish** sets everything else: standfirsts, excerpts, article prose, labels, the navigation and every control.

The logo is neither: it is a drawing, in [src/assets/logo.svg](./src/assets/logo.svg). Replace that one file with your own and the header, the drawer and their responsive sizes all follow. It is inlined rather than loaded as an image, so keep `fill="currentColor"` on the `<svg>` and drop any `width`/`height` — it then takes its colour from the type around it and its size from `--logo-height`, which is one number in [src/styles/global.css](./src/styles/global.css).

`txt-d` through `txt-h5` are the serif; `txt-l` through `txt-xs` and `.label` are the sans. A reader should never have to work out why two titles on the same page are set in different faces.

A garamond sets optically smaller than a text serif, so every heading step in the scale is a shade larger than it looks like it should be, at regular weight and with no negative tracking. Tracking a garamond in closes its counters and the elegance goes with them.

To swap one: drop the `woff2` into `public/fonts`, replace the `@font-face` block, point `--font-display` (headings) or `--font-sans` (everything else) at it, and update the preload in [src/layouts/BaseLayout.astro](./src/layouts/BaseLayout.astro). Keep the fallback stack metrically close or the page will shift as the font lands. `--font-mono` is a system stack used by code blocks only.

## Colour

White, ink, one colour that is not ink, and a tint per section.

The page is white and stays white. **The masthead has no colour of its own** — the logo is ink on the page ground, the way a magazine cover is and a website usually is not, and it is the reason the photographs under it are the first colour a reader meets. `--band` and `--band-foreground` still exist, so a site that wants a coloured bar has one line to change.

**The mark** (`--accent`) is a deep claret, from the `--claret-*` ramp. It labels a section over a card, underlines the one link that has to be found, and fills the one button. `--accent-ink` is the version used as text; `--accent-foreground` is the type laid over a fill. It is never a field behind reading.

There is no dark mode. Every surface is a shade of paper, and a photograph of a place belongs on paper. If you add one, the tints are the work: they are picked to carry body copy at AA on a light ground and would each need a dark counterpart.

## Print

There is no print button — an article is not a form, and every browser already has one. What the theme ships is a print sheet for the readers who reach for it: chrome comes off, the reading column becomes the page, links print their destinations, and figures avoid page breaks. The cover and immersive openings flatten: the photograph becomes an ordinary block, the white type goes back to ink, and the centred title returns to the left edge.

## Code Blocks

Highlighted at build time by Shiki, configured in [src/config/code.ts](./src/config/code.ts) and wired up in [astro.config.mjs](./astro.config.mjs). A copy button is added client-side to every `pre` in an article.

## Icons

Editorial chrome comes from [src/components/ui/Icon.astro](./src/components/ui/Icon.astro), a small set of stroked icons drawn on a 24x24 grid — add one by extending the `IconName` union and the markup below it. Social and brand marks come from a local Bootstrap Icons set in `src/icons`, rendered by `LocalIcon`, with its licence notice beside it.

## Motion

Motion runs in two layers, and they do not overlap.

Blocks at the top of a page are on screen before a scroll can happen, so they animate once on load: add the `opener` class to a wrapper and its direct children rise in with a short stagger, while any cover inside settles from a slight oversize. It is already on page headers, article heads, the front-page slider's copy and the most-read column beside it, and the About page photograph.

Everything below the fold is scroll-driven through CSS view timelines. Cards in a `.grid-posts` rise as they enter, each column a beat after the one before it, and their photographs settle into their frames on top of the rise. Archive rows, the topics line, the section browser, section headings, the article footer, the figures and galleries inside an article, the pagination and the footer all do the same. To add a block, give it the `reveal` class; to take one out, remove it. There is no observer and no hidden state, so a browser without view timelines simply renders the finished layout.

The one exception is the fallback in [src/layouts/BaseLayout.astro](./src/layouts/BaseLayout.astro): where view timelines are missing but `IntersectionObserver` exists, a small script reveals `.reveal` elements and grid cards as they scroll in. It runs once at load, so never put `reveal` on markup a script paints later — the saved page and the archive filters render their rows without it for that reason.

Everything flattens under `prefers-reduced-motion: reduce`, including the parallax opening, the slider's rotation, and the reveals.
