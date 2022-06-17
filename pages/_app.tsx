import type { AppProps } from "next/app";
import Head from "next/head";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "../ui/Theme";
import "../styles/globals.css";

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <Head>
        <link rel="icon" href="/logo.png" />
        <meta name="author" content="Arman Matinyan" />
        <meta name="twitter:creator" content="Arman Matinyan" />
        <meta name="twitter:card" content="summary" />
        <meta property="og:type" content="website" />
      </Head>
      <ChakraProvider theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
    </>
  );
};

export default MyApp;
