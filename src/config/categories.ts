export const categories = [
  "City Guides",
  "Slow Travel",
  "Outdoors",
  "Road Trips",
  "Stays",
  "Culture",
] as const;

export type Category = (typeof categories)[number];

/**
 * Controls how each section archive presents its posts:
 * - "grid": the standard card grid
 * - "list": one image-led editorial row per post
 */
export type CategoryLayout = "grid" | "list";

export const categoryLayouts: Record<Category, CategoryLayout> = {
  "City Guides": "grid",
  "Slow Travel": "list",
  Outdoors: "grid",
  "Road Trips": "grid",
  Stays: "grid",
  Culture: "grid",
};

/**
 * Each section owns one tint, and the tint is the ground of that section's
 * panel wherever the section is the subject — the tiles under the front-page
 * hero, the header's sections panel, the category browser, the section page
 * header. Nothing else on the site is tinted, so a colour always means "this
 * section".
 *
 * The values are the `--tint-*` tokens in `src/styles/global.css`, where
 * `--tint-sea` is left spare for a seventh section.
 */
export type CategoryTint = "sand" | "sky" | "moss" | "clay" | "lilac" | "lemon" | "sea";

export const categoryTints: Record<Category, CategoryTint> = {
  "City Guides": "sky",
  "Slow Travel": "sand",
  Outdoors: "moss",
  "Road Trips": "clay",
  Stays: "lilac",
  Culture: "lemon",
};

export const categorySlug = (category: Category) =>
  category
    .toLowerCase()
    .replace(/\s*&\s*/g, "-")
    .replace(/\s+/g, "-");

export const categoryMeta: Record<Category, { description: string; blurb: string }> = {
  "City Guides": {
    description:
      "A city in the time you actually have. Where to start walking, what is worth the queue, and the neighbourhood the guidebook puts on the last page.",
    blurb: "Start walking here",
  },
  "Slow Travel": {
    description:
      "Trains, long roads, and staying put. Journeys where getting there is most of the point and nobody is counting the days.",
    blurb: "Getting there is the point",
  },
  Outdoors: {
    description:
      "Trails, coastlines, and cold water. Routes with the gradient named, the season that suits them, and how far it really is from the car park.",
    blurb: "Trails and cold water",
  },
  "Road Trips": {
    description:
      "Routes worth driving for the driving. Where to turn off, what the road does after dark, and how far it really is between two places that look close on a map.",
    blurb: "Where to turn off",
  },
  Stays: {
    description:
      "Rooms worth the detour: guesthouses, huts, and the odd hotel. What you get for the money and who each one is really for.",
    blurb: "Rooms worth the detour",
  },
  Culture: {
    description:
      "Museums, festivals, and the local argument you will not find on a map. The context that turns a nice afternoon into a reason to go.",
    blurb: "Why it matters there",
  },
};
