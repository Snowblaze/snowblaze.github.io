import { FC } from "react";
import { GetStaticProps } from "next";
import { getAllPosts, getPostBySlug } from "../lib/api";
import Post from "../types/Post";
import Layout from "../ui/molecules/Layout";
import PostHeader from "../ui/molecules/PostHeader";
import PostBody from "../ui/molecules/PostBody";
import Seo from "../components/Seo";

type Props = {
  post: Post,
}

const Post: FC<Props> = ({
  post,
}) => {
  return (
    <Layout>
      <Seo
        title={post.title}
        description={post.excerpt}
        ogImageUrl={`https://snowblaze.github.io${post.ogImage}`}
        url={`https://snowblaze.github.io/${post.slug}`}
      />
      <article>
        <PostHeader
          title={post.title}
          coverImage={post.coverImage}
          date={post.date}
          readTime={post.readTime}
        />
        <PostBody content={post.content} />
      </article>
    </Layout>
  );
};

export const getStaticPaths = async () => {
  const posts = getAllPosts(["slug"]);

  return {
    paths: posts.map((post) => {
      return {
        params: {
          slug: post.slug,
        },
      }
    }),
    fallback: false,
  };
}

export const getStaticProps: GetStaticProps<Props, { slug: string }> = async ({ params }) => {
  const post = getPostBySlug(params!.slug, [
    "title",
    "date",
    "slug",
    "content",
    "ogImage",
    "coverImage",
    "excerpt",
    "readTime",
  ]);

  return {
    props: {
      post,
    },
  };
}

export default Post;
