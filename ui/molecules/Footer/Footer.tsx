import { Box, Icon, IconButton, Link, Text } from "@chakra-ui/react";
import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";

const Footer = () => {
  return (
    <Box
      sx={{
        display: "flex",
        gap: "16px",
        justifyContent: "center",
        alignItems: "center",
        marginTop: "auto",
        borderTop: "1px solid #eaeaea",
        padding: "8px 16px",
      }}
    >
      <Text fontSize="sm">
        @{process.env.CURRENT_YEAR} Arman Matinyan
      </Text>
      <Box
        sx={{
          display: "flex",
          gap: "4px",
        }}
      >
        <Link
          href="https://twitter.com/Snowblazed"
          isExternal
        >
          <IconButton
            aria-label="Open Twitter"
            icon={<Icon as={FaTwitter} />}
            fontSize="20px"
            size="sm"
            isRound
            variant="ghost"
          />
        </Link>
        <Link
          href="https://www.linkedin.com/in/arman-matinyan-40576a134/"
          isExternal
        >
          <IconButton
            aria-label="Open LinkedIn"
            icon={<Icon as={FaLinkedin} />}
            fontSize="20px"
            size="sm"
            isRound
            variant="ghost"
          />
        </Link>
        <Link
          href="https://github.com/Snowblaze"
          isExternal
        >
          <IconButton
            aria-label="Open Github"
            icon={<Icon as={FaGithub} />}
            fontSize="20px"
            size="sm"
            isRound
            variant="ghost"
          />
        </Link>
      </Box>
    </Box>
  );
};

export default Footer;
