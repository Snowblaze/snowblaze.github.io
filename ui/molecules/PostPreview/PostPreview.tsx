import { FC } from "react";
import NextLink from "next/link";
import Image from "next/image";
import {
  Box,
  Heading,
  Icon,
  Link,
  Text,
} from "@chakra-ui/react";
import { BsBook } from "react-icons/bs";
import transformDate from "../../../lib/date";

type Props = {
  title: string,
  coverImage: string,
  date: string,
  excerpt: string,
  slug: string,
  readTime: string,
}

const PostPreview: FC<Props> = ({
  title,
  coverImage,
  date,
  excerpt,
  slug,
  readTime,
}) => (
  <NextLink href={`/${slug}`} passHref>
    <Link
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        cursor: "pointer",
        borderRadius: "16px",
        overflow: "hidden",
        border: "1px solid #eaeaea",
        ":hover": {
          textDecoration: 'none',
          boxShadow: `0 1px 2px 0 rgba(0, 0, 0, 0.05), 0 2px 4px 0 rgba(0, 0, 0, 0.05)`,
        },
        transition: "all 300ms ease",
        ":not(:first-of-type)": {
          marginTop: "16px",
        },
      }}
    >
      <Box
        sx={{
          display: {
            base: "none",
            md: "flex",
          },
          position: "relative",
        }}
      >
        <Image
          src={coverImage}
          alt={`Cover Image for ${title}`}
          width="294px"
          height="165px"
          objectFit="cover"
        />
      </Box>
      <Box
        sx={{
          flex: 1,
          padding: "16px",
        }}
      >
        <Box
          sx={{
            marginBottom: "8px",
          }}
        >
          <Heading as="h3" size="md">
            {title}
          </Heading>
        </Box>
        <Box
          sx={{
            display: "flex",
            gap: "12px",
            alignItems: "center",
            marginTop: "8px",
            marginBottom: "8px",
          }}
        >
          <Text color="gray.500" fontSize="sm">
            <time dateTime={date}>{transformDate(date)}</time>
          </Text>
          <Text color="gray.500" fontSize="sm">
            •
          </Text>
          <Box
            sx={{
              display: "flex",
              gap: "8px",
              alignItems: "center",
            }}
          >
            <Icon as={BsBook} color="gray.500" fontSize="sm" />
            <Text color="gray.500" fontSize="sm">
              {`${readTime} read`}
            </Text>
          </Box>
        </Box>
        <Box
          sx={{
            marginTop: "8px",
          }}
        >
          <Text noOfLines={2}>
            {excerpt}
          </Text>
        </Box>
      </Box>
    </Link>
  </NextLink>
);

export default PostPreview;
