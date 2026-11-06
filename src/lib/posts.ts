import type { CollectionEntry } from "astro:content";
import { categories, categorySlug, categoryTints, type Category } from "@/config/categories";
import { siteConfig } from "@/config/site";

export type Post = CollectionEntry<"posts">;
export { categories, categorySlug, categoryTints, type Category };

export const tagSlug = (tag: string) =>
  tag
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

/** Monogram fallback for authors with no portrait in `src/config/authors.ts`. */
export const authorInitials = (author: string) =>
  author
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

export const authorSlug = (author: string) =>
  author
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

/** One name on a post byline: the lead author or one of its coauthors. */
export interface Byline {
  name: string;
  role: string;
}

/** Every name on a post, lead author first, then coauthors in frontmatter order. */
export const postBylines = (post: Post): Byline[] => [post.data.author, ...post.data.coauthors];

/**
 * The byline as running text, for the places that print names without linking
 * them — RSS, structured data, and the search index. UI that can afford links
 * renders the names itself and joins them with the same words.
 */
export const bylineText = (post: Post) => {
  const names = postBylines(post).map((byline) => byline.name);
  if (names.length < 3) return names.join(" and ");
  return `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
};

/**
 * The byline for places that cannot carry links, because the whole block is
 * already one link — cards, ledger rows, cover stories. Extra names are counted
 * off rather than printed, so the row keeps its height.
 */
export const bylineShort = (post: Post) => {
  const names = postBylines(post).map((byline) => byline.name);
  return names.length > 1 ? `${names[0]} +${names.length - 1}` : names[0];
};

export type StoryLayout = Post["data"]["storyLayout"];

/** Every opening treatment, in the order they escalate. */
export const storyLayouts = [
  "standard",
  "split",
  "banner",
  "parallax",
  "cover",
  "immersive",
] as const satisfies readonly StoryLayout[];

/**
 * The opening treatment an article uses. A post that hides its cover cannot
 * use a layout built around one, so those fall back to `standard` — the only
 * variant that reads correctly as pure type.
 */
export const storyLayoutFor = (post: Post): StoryLayout => {
  const layout = post.data.storyLayout;
  const hasCover = post.data.cover.showInPost ?? true;
  return layout !== "standard" && !hasCover ? "standard" : layout;
};

export const postSlug = (post: Post) => post.id.replace(/\/index$/, "");

export const postHref = (post: Post) => `/post/${postSlug(post)}/`;

const byNewest = (a: Post, b: Post) => b.data.date.getTime() - a.data.date.getTime();

export const visiblePosts = (posts: Post[]) =>
  posts.filter((post) => !post.data.draft).sort(byNewest);

export const excludePosts = (posts: Post[], excluded: Post[]) => {
  const excludedIds = new Set(excluded.map((post) => post.id));
  return posts.filter((post) => !excludedIds.has(post.id));
};

/**
 * One live example per opening treatment, derived from the archive rather than
 * hand-listed, so the menus that offer them keep pointing at real posts as the
 * archive changes — and a treatment nothing currently uses is simply absent.
 *
 * Both the header panel and the drawer read this, so the two menus can never
 * disagree about which layouts the site has.
 */
export const storyLayoutExamples = (posts: Post[]) =>
  storyLayouts
    .map((layout) => {
      const example = visiblePosts(posts).find((post) => storyLayoutFor(post) === layout);
      if (!example) return undefined;
      return {
        layout,
        label: `${layout[0].toUpperCase()}${layout.slice(1)}`,
        href: postHref(example),
      };
    })
    .filter((item) => item !== undefined);

export const getByCategory = (posts: Post[], category: Category, limit?: number) => {
  const list = visiblePosts(posts).filter((post) => post.data.category === category);
  return typeof limit === "number" ? list.slice(0, limit) : list;
};

/**
 * The front page hero: posts flagged `featured` first, newest of those at the
 * top, then the newest of the rest — so the block never renders empty when
 * nothing is flagged.
 */
export const getFeatured = (posts: Post[], limit = 1) => {
  const visible = visiblePosts(posts);
  const flagged = visible.filter((post) => post.data.featured);
  return [...flagged, ...visible.filter((post) => !post.data.featured)].slice(0, limit);
};

export const getTrending = (posts: Post[], limit = 5) => {
  const visible = visiblePosts(posts);
  const trending = visible.filter((post) => post.data.trending);
  return [...trending, ...visible.filter((post) => !post.data.trending)].slice(0, limit);
};

/**
 * The front page picks: posts flagged `editorsPick` first, in date order, then
 * the newest of whatever is left to fill the row. Flagging nothing still gives
 * a full row, so the block never renders half empty.
 */
export const getEditorsPicks = (posts: Post[], limit = 4) => {
  const visible = visiblePosts(posts);
  const picked = visible.filter((post) => post.data.editorsPick);
  return [...picked, ...visible.filter((post) => !post.data.editorsPick)].slice(0, limit);
};

export const getRelated = (posts: Post[], current: Post, limit = 3) =>
  visiblePosts(posts)
    .filter((post) => post.id !== current.id)
    .sort((a, b) => {
      const categoryScore =
        Number(b.data.category === current.data.category) -
        Number(a.data.category === current.data.category);
      return categoryScore || byNewest(a, b);
    })
    .slice(0, limit);

export const getAllTags = (posts: Post[]) =>
  Array.from(new Set(visiblePosts(posts).flatMap((post) => post.data.tags))).sort((a, b) =>
    a.localeCompare(b),
  );

export const getAllAuthors = (posts: Post[]) =>
  Array.from(
    visiblePosts(posts)
      .reduce((authorMap, post) => {
        postBylines(post).forEach((byline) => {
          const slug = authorSlug(byline.name);
          const current = authorMap.get(slug);
          authorMap.set(slug, {
            name: byline.name,
            /* The first role a name appears under wins, so a contributor who
               guests on another desk keeps the title from their own posts. */
            role: current?.role ?? byline.role,
            posts: [...(current?.posts ?? []), post],
          });
        });
        return authorMap;
      }, new Map<string, { name: string; role: string; posts: Post[] }>())
      .entries(),
  )
    .map(([slug, author]) => ({ slug, ...author }))
    .sort((a, b) => a.name.localeCompare(b.name));

/** Words for the read-time count: letters and digits, apostrophes and hyphens kept intact. */
const wordPattern = /[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu;

/**
 * Words of real prose in a post, counted at build time. Code blocks, HTML tags,
 * URLs, and Markdown punctuation are dropped first, so a story heavy with any
 * of them is not counted as though a reader had to read it.
 *
 * It feeds the read time printed on every card and the `wordCount` in an
 * article's structured data.
 */
export const wordCount = (post: Post) => {
  const prose = (post.body ?? "")
    .replace(/^---\n[\s\S]*?\n---/, " ")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/~~~[\s\S]*?~~~/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^\s{0,3}\[[^\]]+\]:.*$/gm, " ");
  return prose.match(wordPattern)?.length ?? 0;
};

/**
 * Read time in whole minutes, at 200 words a minute, never less than one. It
 * is the one duration on a card here: a travel story is read before it is
 * used, and "how long is this" is the question a dense grid has to answer.
 */
export const readMinutes = (post: Post) => Math.max(1, Math.round(wordCount(post) / 200));

export const formatDate = (date: Date, style: "short" | "long" = "short") =>
  new Intl.DateTimeFormat(siteConfig.dateLocale, {
    month: style === "short" ? "short" : "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
