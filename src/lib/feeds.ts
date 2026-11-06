import type { RSSFeedItem } from "@astrojs/rss";
import mdxRenderer from "@astrojs/mdx/server.js";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { render } from "astro:content";

import { siteConfig } from "@/config/site";
import { bylineText, postHref, visiblePosts, type Post } from "@/lib/posts";

/**
 * Every feed on the site — the main one plus the per-section and per-contributor
 * feeds — is built from this module, so a reader who subscribes to one section
 * gets exactly the same item shape as a reader who subscribes to everything.
 */

const absoluteUrl = (path: string) => new URL(path, siteConfig.siteUrl).toString();

/**
 * One container for the whole build — creating it costs more than rendering an
 * item — and one rendered body per post, since a story that appears in the
 * site feed also appears in its section and contributor feeds.
 *
 * MDX compiles to its own component type, so its renderer has to be registered
 * by hand here; without it every `.mdx` post silently falls back to its
 * excerpt while the `.md` posts around it carry their full text.
 */
let containerPromise: Promise<AstroContainer> | undefined;
const renderedBodies = new Map<string, string>();

const getContainer = async () => {
  containerPromise ??= AstroContainer.create().then((container) => {
    container.addServerRenderer({ name: "astro:jsx", renderer: mdxRenderer });
    return container;
  });

  return containerPromise;
};

/**
 * Article HTML rewritten for somewhere that runs none of this site's code.
 *
 * A feed reader resolves nothing and executes nothing: root-relative images are
 * dead in an inbox, and the buttons the lightbox binds itself to are controls
 * that can never do anything. So paths are lifted onto the configured site URL
 * and the interactive shell is unwrapped, leaving the figure and its caption.
 */
const forFeed = (html: string) =>
  html
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<\/?button\b[^>]*>/gi, "")
    .replace(/(\s(?:src|href|poster)=")\/(?!\/)/g, `$1${siteConfig.siteUrl}/`)
    .replace(/(\ssrcset=")([^"]+)"/g, (_match, attribute: string, value: string) => {
      const rewritten = value.replace(/(^|,\s*)\/(?!\/)/g, `$1${siteConfig.siteUrl}/`);
      return `${attribute}${rewritten}"`;
    });

/**
 * The post body as standalone HTML for the feed. Rendering through Astro's
 * container rather than a second Markdown parser is what lets an MDX post with
 * `<Figure>` and `<Gallery>` in it reach a reader as real markup instead of as
 * component syntax printed literally.
 *
 * A post that cannot be rendered falls back to its excerpt rather than failing
 * the build, so one awkward story never costs you the whole feed.
 */
const renderBody = async (post: Post): Promise<string | undefined> => {
  const cached = renderedBodies.get(post.id);
  if (cached !== undefined) return cached || undefined;

  try {
    const container = await getContainer();
    const { Content } = await render(post);
    const html = forFeed(await container.renderToString(Content));
    renderedBodies.set(post.id, html);
    return html;
  } catch (error) {
    // Loud on purpose: the fallback is silent in the feed itself, so this is
    // the only place a post quietly shipping as an excerpt becomes visible.
    console.warn(`[rss] ${post.id} could not be rendered; shipping its excerpt instead.`, error);
    renderedBodies.set(post.id, "");
    return undefined;
  }
};

export const feedItems = async (posts: Post[]): Promise<RSSFeedItem[]> =>
  Promise.all(
    visiblePosts(posts).map(async (post) => ({
      title: post.data.title,
      link: postHref(post),
      pubDate: post.data.date,
      description: post.data.excerpt,
      author: bylineText(post),
      /* The section first, then the tags — a reader filtering on "Outdoors" and
         a reader filtering on "night train" both find what they expect. */
      categories: [post.data.category, ...post.data.tags],
      content: siteConfig.rss.fullContent ? await renderBody(post) : undefined,
      /* The cover, so a feed reader has an image without digging into the body. */
      enclosure: {
        url: absoluteUrl(post.data.cover.src.src),
        length: 0,
        type: `image/${(post.data.cover.src.format ?? "jpeg").replace("jpg", "jpeg")}`,
      },
    })),
  );

/** `<language>` is not part of the RSS 2.0 fields `@astrojs/rss` models. */
export const feedCustomData = `<language>${siteConfig.language}</language>`;
