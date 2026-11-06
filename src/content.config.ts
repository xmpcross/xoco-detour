import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { categories } from "@/config/categories";

/** One name on a byline. The lead author and every coauthor take this shape. */
const byline = z.object({
  name: z.string(),
  role: z.string(),
});

const posts = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/posts" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      excerpt: z.string(),
      category: z.enum(categories),
      date: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      author: byline,
      /**
       * Extra names on the byline, read in the order they are listed. The lead
       * `author` still owns the post and always reads first, while every
       * coauthor gets the same avatar, archive page, and author box treatment.
       */
      coauthors: z.array(byline).default([]),
      tags: z.array(z.string()).default([]),
      cover: z.object({
        src: image(),
        alt: z.string(),
        creditName: z.string(),
        creditUrl: z.url(),
        showInPost: z.boolean().optional(),
        /** Which half the picture takes. Only the `split` opening reads it. */
        side: z.enum(["left", "right"]).default("left"),
      }),
      /* Opening treatment for the article page. Every layout uses the same
         cover image; only its placement and scale change. */
      storyLayout: z
        .enum(["standard", "split", "banner", "parallax", "cover", "immersive"])
        .default("standard"),
      /**
       * Where the story was filed from — "Lisbon, Portugal". Printed in the
       * title block and indexed for search, so a reader can find a place by
       * name even when the headline never says it.
       */
      place: z.string().optional(),
      trending: z.boolean().default(false),
      /** Promotes the post into the front page "Worth the detour" wall. */
      editorsPick: z.boolean().default(false),
      /**
       * Puts the post at the top of the front page as the lead. When several
       * are flagged the newest wins; when none is, the newest post stands in.
       */
      featured: z.boolean().default(false),
      draft: z.boolean().default(false),
    }),
});

export const collections = { posts };
