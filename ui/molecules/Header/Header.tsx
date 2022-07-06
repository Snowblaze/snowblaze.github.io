import Image from "next/image";
import {
  Box,
  Icon,
  IconButton,
  Heading,
  useColorMode,
} from "@chakra-ui/react";
import {
  MoonIcon,
  SunIcon,
} from "@chakra-ui/icons";
import Link from "next/link";

const Header = () => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Box
      sx={{
        height: {
          base: "64px",
          md: "80px",
        },
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        borderBottom: "1px solid #eaeaea",
      }}
    >
      <Box
        sx={{
          padding: {
            base: "0 16px",
            md: 0,
          },
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          minWidth: {
            base: "100%",
            md: "700px",
          },
          maxWidth: "700px",
        }}
      >
        <Link href="/">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
            }}
          >
            <Box
              sx={{
                borderRadius: "24px",
                overflow: "hidden",
                position: "relative",
                width: {
                  base: "48px",
                },
                height: {
                  base: "48px",
                },
              }}
            >
              <Image src="/logo.png" layout="fill" placeholder="blur" />
            </Box>
            <Box>
              <Heading>
                Snowblaze
              </Heading>
            </Box>
          </Box>
        </Link>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {
            colorMode === "light"
              ? (
                <IconButton
                  aria-label="Turn on Dark mode"
                  icon={<Icon as={SunIcon} />}
                  fontSize="24px"
                  size="md"
                  isRound
                  variant="ghost"
                  onClick={toggleColorMode}
                />
              ) : (
                <IconButton
                  aria-label="Turn on Light mode"
                  icon={<Icon as={MoonIcon} />}
                  fontSize="24px"
                  size="md"
                  isRound
                  variant="ghost"
                  onClick={toggleColorMode}
                />
              )
          }
        </Box>
      </Box>
    </Box>
  );
};

export default Header;
