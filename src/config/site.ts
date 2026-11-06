import { categories, categorySlug } from "./categories";

export const siteConfig = {
  name: "Detour",
  tagline: "The long way round",
  title: "Detour - An Astro travel magazine theme",
  description:
    "An Astro travel blog theme: image-led stories, a front page that reads like a magazine contents, city guides, slow journeys, trails, rooms, and the roads between them.",
  siteUrl: "https://detour.xocoweb.workers.dev",
  authorName: "Andrei Alba",
  email: "hello@example.com",
  language: "en",
  dateLocale: "en-US",
  locale: "en_US",
  socialImage: "/og-image.png",
  /**
   * The publication's logo in structured data. It has to be a raster file in
   * `public/`, so the favicon cannot stand in for it — point this at a real
   * logo before launch. The share card is the default only because it is
   * the one raster asset the theme ships.
   */
  publisherLogo: "/og-image.png",
  /** Short bio shown in the footer and under the About page header. */
  bio: "Travel writing for people who would rather miss the train than skip the walk. Every route here was taken at least once, in the season it is written about.",
  /**
   * The byline that fronts the About page. `name` has to match the
   * `author.name` used in post frontmatter: the block links to that author's
   * archive and is skipped entirely when the name has no published posts.
   */
  editor: {
    name: "Delphine Roy",
    title: "Who writes it",
    /** Shown under the byline on the About page. Falls back to a generic line. */
    bio: "Delphine has been filing from the slow end of the timetable since 2014, which is where the house rule comes from: name the season, name the cost, and say plainly which part of the trip was not worth it.",
  },
  /**
   * Feeds. Alongside `/rss.xml` for everything, every section gets its own feed
   * at `<its page>rss.xml`, linked from the page it belongs to.
   */
  rss: {
    fullContent: true,
    /** Items per feed, newest first. */
    limit: 20,
  },
  newsletter: {
    enabled: false,
    action: "",
    method: "post",
    emailFieldName: "email",
    title: "One detour a week, on Friday.",
    description:
      "A single route, guide, or stay worth booking time off for, plus the part of it that did not work. No spam, unsubscribe anytime.",
    terms: "By subscribing you agree to our Terms of Use and Privacy Policy.",
  },
  contact: {
    enabled: false,
    action: "",
    method: "post",
    office: ["14 Rue des Halles", "Montreal QC H2Y 1A1"],
    responseTime: "Usually within two business days.",
  },
  socials: [
    { label: "Instagram", href: "https://instagram.com" },
    { label: "Pinterest", href: "https://pinterest.com" },
    { label: "YouTube", href: "https://youtube.com" },
    { label: "RSS", href: "/rss.xml" },
  ],
};

export const categoryNavigation = categories.map((category) => ({
  label: category,
  href: `/category/${categorySlug(category)}/`,
}));

/**
 * The non-section routes, listed under "The site" in the menu. The header bar
 * carries the sections and About only; everything else lives here. Sections
 * come from `categoryNavigation` above, and the story-layout examples are
 * derived from the posts themselves — see `SiteDrawer.astro`.
 */
export const secondaryNavigation = [
  { label: "All stories", href: "/posts/" },
  { label: "About", href: "/about/" },
  { label: "Contact", href: "/contact/" },
  { label: "Search", href: "/search/" },
  { label: "Saved", href: "/saved/" },
];

export const footerNavigation = [
  {
    title: "Sections",
    links: categoryNavigation,
  },
  {
    title: "Browse",
    links: [
      { label: "All stories", href: "/posts/" },
      { label: "Search", href: "/search/" },
      { label: "Saved", href: "/saved/" },
      { label: "RSS", href: "/rss.xml" },
    ],
  },
  {
    title: "The site",
    links: [
      { label: "About", href: "/about/" },
      { label: "Contact", href: "/contact/" },
      { label: "Privacy", href: "/privacy/" },
      { label: "Sitemap", href: "/sitemap.xml" },
    ],
  },
];
