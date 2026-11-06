import { getImage } from "astro:assets";
import {
  bylineShort,
  formatDate,
  postHref,
  readMinutes,
  visiblePosts,
  type Post,
} from "@/lib/posts";

/**
 * One story as the client-side surfaces see it. The command palette, the
 * results page, the reading list, and the archive filters all read this shape
 * from `/search-index.json`, so a field added here reaches every one of them
 * at once and none can drift from the others.
 */
export interface SearchItem {
  title: string;
  excerpt: string;
  href: string;
  category: string;
  author: string;
  tags: string[];
  /** The cover, cut to the site's wide ratio, for a row built in the browser. */
  cover: string;
  /** Read time in minutes. Every story has one; it is what the rows print. */
  read: number;
  /** The publish date, already formatted — the rows never parse it back. */
  date: string;
}

export const searchItem = async (post: Post): Promise<SearchItem> => {
  const cover = await getImage({
    src: post.data.cover.src,
    width: 720,
    height: 480,
    fit: "cover",
    format: "webp",
  });

  return {
    title: post.data.title,
    excerpt: post.data.excerpt,
    href: postHref(post),
    category: post.data.category,
    author: bylineShort(post),
    read: readMinutes(post),
    date: formatDate(post.data.date),
    /* The place joins the tags: somebody typing "Lisbon" is looking for a
       city, not browsing a taxonomy, and the headline may never say it. */
    tags: Array.from(new Set([...post.data.tags, ...(post.data.place ? [post.data.place] : [])])),
    cover: cover.src,
  };
};

export const searchItems = (posts: Post[]): Promise<SearchItem[]> =>
  Promise.all(visiblePosts(posts).map(searchItem));
