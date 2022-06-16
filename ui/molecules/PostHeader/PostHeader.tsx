import { FC } from "react";
import {Box, Heading} from "@chakra-ui/react";
import Image from "next/image";

type Props = {
  title: string,
  coverImage: string,
  date: string,
}

const PostHeader: FC<Props> = ({
  title,
  coverImage,
  date,
}) => {
  return (
    <>
      <Heading as="h1" size="xl">
        {title}
      </Heading>
      <Box
        sx={{
          position: "relative",
        }}
      >
        <Image
          src={coverImage}
          alt={`Cover Image for ${title}`}
          layout="responsive"
          width="700px"
          height="300px"
          objectFit="cover"
          priority
          placeholder="blur"
        />
      </Box>
      {/*<div className="mb-8 md:mb-16 sm:mx-0">*/}
      {/*  <CoverImage title={title} src={coverImage} height={620} width={1240} />*/}
      {/*</div>*/}
      {/*<div className="max-w-2xl mx-auto">*/}
      {/*  <div className="mb-6 text-lg">*/}
      {/*    <DateFormatter dateString={date} />*/}
      {/*  </div>*/}
      {/*</div>*/}
    </>
  );
};

export default PostHeader;
