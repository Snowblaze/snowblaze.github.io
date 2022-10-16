import { FC } from "react";
import { GetStaticProps } from "next";
import { getPlaiceholder } from "plaiceholder";
import { getAllPosts, getPostBySlug } from "../lib/api";
import Post from "../types/Post";
import Layout from "../ui/molecules/Layout";
import PostHeader from "../ui/molecules/PostHeader";
import PostBody from "../ui/molecules/PostBody";
import PostFooter from "../ui/molecules/PostFooter";
import Seo from "../components/Seo";

type Props = {
  post: Post,
  coverImage: {
    src: string,
  },
  coverImageBase64: string,
}

const Post: FC<Props> = ({
  post,
  coverImage,
  coverImageBase64,
}) => {
  return (
    <Layout>
      <Seo
        title={post.title}
        description={post.excerpt}
        ogImageUrl={`https://www.snowblazed.com${post.ogImage}`}
        url={`https://www.snowblazed.com/${post.slug}`}
      />
      <article>
        <PostHeader
          title={post.title}
          coverImage={coverImage.src}
          coverImageBase64={coverImageBase64}
          date={post.date}
          readTime={post.readTime}
        />
        <PostBody content={post.content} />
        <PostFooter
          nextSlug={post.nextSlug}
          nextTitle={post.nextTitle}
          previousSlug={post.previousSlug}
          previousTitle={post.previousTitle}
        />
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
    "nextSlug",
    "nextTitle",
    "previousSlug",
    "previousTitle",
  ]);

  const coverImage = await getPlaiceholder(
    post.coverImage,
    {
      size: 10,
    }
  );
  return {
    props: {
      post,
      coverImage: coverImage.img,
      coverImageBase64: coverImage.base64,
    },
  };
}

export default Post;
