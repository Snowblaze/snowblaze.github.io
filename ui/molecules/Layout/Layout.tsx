import { FC, ReactNode } from "react";
import { Box } from "@chakra-ui/react";
import Footer from "../Footer";
import Header from "../Header";

type Props = {
  children?: ReactNode,
}

const Layout: FC<Props> = ({
  children,
}) => (
  <main>
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100%",
      }}
    >
      <Header />
      <Box
        sx={{
          width: "100%",
          padding: {
            base: "32px 16px",
            md: "40px 0",
          },
          minWidth: {
            base: "100%",
            md: "700px",
          },
          maxWidth: "700px",
          margin: "0 auto",
        }}
      >
        {children}
      </Box>
      <Footer />
    </Box>
  </main>
);

export default Layout;
