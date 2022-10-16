import { FC } from "react";
import Link from "next/link";
import { Box, Heading, useColorMode } from "@chakra-ui/react";

type Props = {
  nextSlug: string,
  nextTitle: string,
  previousSlug: string,
  previousTitle: string,
}

const PostFooter: FC<Props> = ({
  nextSlug,
  nextTitle,
  previousSlug,
  previousTitle,
}) => {
  const { colorMode } = useColorMode();

  return (
    <Box
      sx={{
        display: 'flex',
      }}
    >
      {
        previousSlug && (
          <Link href={`/${previousSlug}`}>
            <Box
              sx={{
                padding: "16px",
                marginRight: "auto",
                cursor: "pointer",
                borderRadius: "16px",
                border: "1px solid #eaeaea",
                ":hover": {
                  boxShadow: `0 1px 2px 0 ${colorMode === "light" ? "rgba(0, 0, 0, 0.05)" : "rgba(200, 200, 200, 0.5)"},
                        0 2px 4px 0 ${colorMode === "light" ? "rgba(0, 0, 0, 0.05)" : "rgba(200, 200, 200, 0.5)"}`,
                },
                transition: "all 300ms ease",
              }}
            >
              <Heading as="h4" size="sm">
                {previousTitle}
              </Heading>
            </Box>
          </Link>
        )
      }
      {
        nextSlug && (
          <Link href={`/${nextSlug}`}>
            <Box
              sx={{
                padding: "16px",
                marginLeft: "auto",
                cursor: "pointer",
                borderRadius: "16px",
                border: "1px solid #eaeaea",
                ":hover": {
                  boxShadow: `0 1px 2px 0 ${colorMode === "light" ? "rgba(0, 0, 0, 0.05)" : "rgba(200, 200, 200, 0.5)"},
                        0 2px 4px 0 ${colorMode === "light" ? "rgba(0, 0, 0, 0.05)" : "rgba(200, 200, 200, 0.5)"}`,
                },
                transition: "all 300ms ease",
              }}
            >
              <Heading as="h4" size="sm">
                {nextTitle}
              </Heading>
            </Box>
          </Link>
        )
      }
    </Box>
  );
};

export default PostFooter;
