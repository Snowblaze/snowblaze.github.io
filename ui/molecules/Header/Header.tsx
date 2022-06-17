import Image from "next/image";
import {
  Box,
  Switch,
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
              <Image src="/logo.png" layout="fill" />
            </Box>
            <Box>
              <Heading>
                Blog
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
          <Switch
            onChange={toggleColorMode}
            isChecked={colorMode === "light"}
          />
          {
            colorMode === "light"
              ? (
                <SunIcon boxSize={{ base: "24px" }} />
              ) : (
                <MoonIcon boxSize={{ base: "24px" }} />
              )
          }
        </Box>
      </Box>
    </Box>
  );
};

export default Header;
