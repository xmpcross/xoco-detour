import type { ImageMetadata } from "astro";
import delphineRoy from "@/assets/authors/delphine-roy.jpg";

/**
 * Author portraits, keyed by the `author.name` used in post frontmatter.
 * Authors with no entry fall back to a monogram avatar, so this map is
 * optional — add a name here only once you have a photo for it.
 *
 * Detour ships as a one-writer site: there is one name here, and the About page
 * is the masthead. Nothing in the theme assumes that, though — the byline, the
 * avatar, the author archive, and `coauthors` in frontmatter all still work
 * the moment a second name appears, so a site that grows a second writer only
 * has to add a portrait here.
 *
 * The bundled portrait is an Unsplash placeholder of a model who has no
 * connection to this fictional byline. Replace it with a photo of the person
 * actually writing before publishing.
 */
export interface AuthorProfile {
  bio: string;
  image: ImageMetadata;
  creditName: string;
  creditUrl: string;
}

export const authorProfiles: Record<string, AuthorProfile> = {
  "Delphine Roy": {
    bio: "Files from the slow end of the timetable: night trains, coastal paths, and the towns one stop before the one everybody photographs. Ten years of it, in the season each route is written about, which is why the notes on weather are the long ones.",
    image: delphineRoy,
    creditName: "Konrad Nowacki",
    creditUrl: "https://unsplash.com/photos/a-woman-with-dark-hair-is-reaching-ywe6J_WZuGs",
  },
};

export const authorPortrait = (name: string): AuthorProfile | undefined => authorProfiles[name];

/** The standfirst under a contributor's name. Empty for a byline with no entry. */
export const authorBio = (name: string): string => authorProfiles[name]?.bio ?? "";
