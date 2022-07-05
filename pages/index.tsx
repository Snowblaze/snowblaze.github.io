import type { GetStaticProps, NextPage } from "next";
import { Box } from "@chakra-ui/react";
import Layout from "../ui/molecules/Layout";
import { getAllPosts } from "../lib/api";
import Post from "../types/Post";
import PostPreview from "../ui/molecules/PostPreview";
import Seo from "../components/Seo";
import OgImage from "../public/main-og.png";

type Props = {
  allPosts: Post[],
}

const Home: NextPage<Props> = ({
  allPosts,
}) => {
  return (
    <Layout>
      <Seo
        title="Snowblaze"
        description="Personal blog on game development by Arman Matinyan"
        ogImageUrl={`https://www.snowblazed.com${OgImage.src}`}
        url="https://www.snowblazed.com"
      />
      <Box>
        {
          allPosts.map((post, index) => (
            <PostPreview
              key={index}
              title={post.title}
              coverImage={post.coverImage}
              date={post.date}
              excerpt={post.excerpt}
              slug={post.slug}
              readTime={post.readTime}
            />
          ))
        }
      </Box>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps<Props> = async () => {
  const allPosts = getAllPosts([
    "title",
    "date",
    "slug",
    "coverImage",
    "excerpt",
    "readTime",
  ]);

  return {
    props: { allPosts },
  };
};

export default Home;
