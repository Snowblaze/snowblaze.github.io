import Image from "next/image";
import {
  Box,
  Heading,
} from "@chakra-ui/react";
import Link from "next/link";
import logo from "../../../public/logo.png";

const Header = () => (
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
            <Image src={logo} layout="fill" placeholder="blur" alt="Snowblaze Logo" />
          </Box>
          <Box>
            <Heading>
              Snowblaze
            </Heading>
          </Box>
        </Box>
      </Link>
      <Link href="https://github.com/Snowblaze/sdl2-cmake-starter">
        SDL Cmake Template
      </Link>
    </Box>
  </Box>
);

export default Header;
