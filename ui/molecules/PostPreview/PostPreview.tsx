import { FC } from "react";
import Link from "next/link";
import Image from "next/image";
import { format, parseISO } from "date-fns";
import {Box, Heading, Text, useColorMode} from "@chakra-ui/react";

type Props = {
  title: string,
  coverImage: string,
  date: string,
  excerpt: string,
  slug: string,
}

const PostPreview: FC<Props> = ({
  title,
  coverImage,
  date,
  excerpt,
  slug,
}) => {
  const { colorMode } = useColorMode();

  return (
    <Link href={`/${slug}`}>
      <Box
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
            boxShadow: `0 1px 2px 0 ${colorMode === "light" ? "rgba(0, 0, 0, 0.05)" : "rgba(200, 200, 200, 0.5)"},
                        0 2px 4px 0 ${colorMode === "light" ? "rgba(0, 0, 0, 0.05)" : "rgba(200, 200, 200, 0.5)"}`,
          },
          transition: "all 300ms ease",
        }}
      >
        <Box
          sx={{
            display: {
              base: "none",
              md: "flex",
            },
            position: "relative",
            width: "294px",
            height: "165px",
          }}
        >
          <Image
            src={coverImage}
            alt={`Cover Image for ${title}`}
            layout="fill"
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
              marginTop: "8px",
              marginBottom: "8px",
            }}
          >
            <Text color="gray.500" fontSize="sm">
              <time dateTime={date}>{format(parseISO(date), 'LLLL	d, yyyy')}</time>
            </Text>
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
      </Box>
    </Link>
  );
};

export default PostPreview;
