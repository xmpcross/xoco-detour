import { categorySlug } from "@/config/categories";
import { siteConfig } from "@/config/site";
import { authorSlug, postHref, postBylines, wordCount, type Byline, type Post } from "@/lib/posts";

/**
 * Every piece of structured data the site emits, in one place.
 *
 * Two rules hold the file together. Nothing is asserted here that a reader
 * cannot also see on the page — a claim in markup that the page never makes is
 * the fastest way to lose a rich result, and deservedly so.
 * And every URL is absolute, built from `siteConfig.siteUrl`, because a crawler
 * has no page to resolve a relative path against.
 */

export type Schema = Record<string, unknown>;

export const absoluteUrl = (path: string) => new URL(path, siteConfig.siteUrl).toString();

/** The publication. Referenced by `@id` so it is described once per page. */
const publisherId = absoluteUrl("/#publication");

export const organizationSchema = (): Schema => ({
  "@type": "Organization",
  "@id": publisherId,
  name: siteConfig.name,
  url: siteConfig.siteUrl,
  description: siteConfig.description,
  logo: {
    "@type": "ImageObject",
    url: absoluteUrl(siteConfig.publisherLogo),
  },
  sameAs: siteConfig.socials
    .filter((social) => /^https?:\/\//.test(social.href))
    .map((social) => social.href),
});

const personSchema = (byline: Byline): Schema => ({
  "@type": "Person",
  name: byline.name,
  jobTitle: byline.role,
  url: absoluteUrl(`/author/${authorSlug(byline.name)}/`),
});

/**
 * The site itself, on any page that is not an article. The search action is
 * only claimed because `/search/` genuinely answers a `q` parameter.
 */
export const websiteSchema = (): Schema => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": absoluteUrl("/#website"),
  name: siteConfig.name,
  alternateName: siteConfig.tagline,
  url: siteConfig.siteUrl,
  description: siteConfig.description,
  inLanguage: siteConfig.language,
  publisher: organizationSchema(),
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: absoluteUrl("/search/?q={search_term_string}"),
    },
    "query-input": "required name=search_term_string",
  },
});

/**
 * The trail a reader can actually retrace: every crumb below is a link the page
 * itself renders — the logo, and the section tag under the headline.
 */
export const breadcrumbSchema = (trail: { name: string; href: string }[]): Schema => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: trail.map((crumb, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: crumb.name,
    item: absoluteUrl(crumb.href),
  })),
});

export const postBreadcrumbSchema = (post: Post): Schema =>
  breadcrumbSchema([
    { name: siteConfig.name, href: "/" },
    { name: post.data.category, href: `/category/${categorySlug(post.data.category)}/` },
    { name: post.data.title, href: postHref(post) },
  ]);

/**
 * The article node.
 *
 * Nothing here is asserted that the page does not also print, and every URL is
 * absolute — a crawler has no page to resolve a relative path against.
 */
export const postSchema = (post: Post, imageUrl: string): Schema => {
  const data = post.data;
  const url = absoluteUrl(postHref(post));

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: data.title,
    description: data.excerpt,
    image: imageUrl,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    datePublished: data.date.toISOString(),
    dateModified: (data.updatedDate ?? data.date).toISOString(),
    author: postBylines(post).map(personSchema),
    publisher: organizationSchema(),
    articleSection: data.category,
    keywords: data.tags,
    inLanguage: siteConfig.language,
    wordCount: wordCount(post),
    isAccessibleForFree: true,
  };
};
