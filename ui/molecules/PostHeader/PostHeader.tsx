import { FC } from "react";
import Image from "next/image";
import { Box, Heading, Icon, Text } from "@chakra-ui/react";
import { BsBook } from "react-icons/bs";
import transformDate from "../../../lib/date";

type Props = {
  title: string,
  coverImage: string,
  date: string,
  readTime: string,
}

const PostHeader: FC<Props> = ({
  title,
  coverImage,
  date,
  readTime,
}) => {
  return (
    <>
      <Box
        sx={{
          position: "relative",
          marginBottom: "32px",
        }}
      >
        <Image
          src={coverImage}
          alt={`Cover Image for ${title}`}
          layout="responsive"
          width="700px"
          height="367px"
          objectFit="cover"
          priority
          placeholder="blur"
        />
      </Box>
      <Heading mt="32px" mb="16px" textAlign="center" as="h1" size="xl">
        {title}
      </Heading>
      <Box
        sx={{
          margin: "16px 0",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <Text color="gray.500" fontSize="lg">
          <time dateTime={date}>{transformDate(date)}</time>
        </Text>
        <Text color="gray.500" fontSize="xl">
          •
        </Text>
        <Box
          sx={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
          }}
        >
          <Icon as={BsBook} color="gray.500" fontSize="lg" />
          <Text color="gray.500" fontSize="lg">
            {`${readTime} read`}
          </Text>
        </Box>
      </Box>
    </>
  );
};

export default PostHeader;
