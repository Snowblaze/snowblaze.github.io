import fs from "fs";
import { join } from "path";
import matter from "gray-matter";
import Post from "../types/Post";

const postsDirectory = join(process.cwd(), "posts");

export const getPostSlugs = () => {
  return fs.readdirSync(postsDirectory);
};

export const getPostBySlug = (slug: string, fields: string[] = []): Post => {
  const realSlug = slug.replace(/\.md$/, "");
  const fullPath = join(postsDirectory, `${realSlug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  const items: Post = {};

  fields.forEach((field) => {
    if (field === "slug") {
      items.slug = realSlug;
    }
    if (field === "content") {
      items.content = content;
    }

    if (typeof data[field] !== "undefined") {
      items[field] = data[field];
    }
  })

  return items;
};

export const getAllPosts = (fields: string[] = []): Post[] => {
  const slugs = getPostSlugs();
  const posts = slugs
    .map((slug) => getPostBySlug(slug, fields))
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1));
  return posts;
};
