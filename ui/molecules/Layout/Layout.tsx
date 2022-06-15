import { FC, ReactNode } from "react";
import { Box } from "@chakra-ui/react";
import Footer from "../Footer";
import Header from "../Header";

type Props = {
  children?: ReactNode,
}

const Layout: FC<Props> = ({
  children,
}) => {
  return (
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
            flex: 1,
            padding: {
              base: "32px 16px",
              md: "48px 24px",
              lg: "48px 0",
            },
            minWidth: {
              base: "100%",
              md: "748px",
              lg: "700px",
            },
            maxWidth: "700px",
            margin: "auto",
          }}
        >
          {children}
        </Box>
        <Footer />
      </Box>
    </main>
  );
};

export default Layout;
