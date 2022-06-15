import { FC } from "react";
import { GetStaticProps } from "next";
// import { Head } from "next/document";
import { getAllPosts, getPostBySlug } from "../lib/api";
import Post from "../types/Post";
import Layout from "../ui/molecules/Layout";
import PostHeader from "../ui/molecules/PostHeader";
import PostBody from "../ui/molecules/PostBody";

type Props = {
  post: Post,
}

const Post: FC<Props> = ({
  post,
}) => {
  return (
    <Layout>
      <article>
        {/*<Head>*/}
        {/*  <title>{post.title}</title>*/}
        {/*  <meta name="description" content={post.excerpt} />*/}
        {/*  <meta property="og:image" content={post.ogImage} />*/}
        {/*</Head>*/}
        <PostHeader
          title={post.title}
          coverImage={post.coverImage}
          date={post.date}
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
  ]);

  return {
    props: {
      post,
    },
  };
}

export default Post;
