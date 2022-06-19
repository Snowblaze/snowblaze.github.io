import type { AppProps } from "next/app";
import Head from "next/head";
import Script from "next/script";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "../ui/Theme";
import "../styles/globals.css";

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <Head>
        <link rel="icon" href="/logo.png" />
        <meta name="author" content="Arman Matinyan" />
        <meta name="twitter:creator" content="@Snowblazed" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@Snowblazed" />
        <meta property="og:type" content="website" />
      </Head>
      <ChakraProvider theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-KHR99SNSP0"
        strategy="afterInteractive"
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
      >
        {
          `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-KHR99SNSP0');
          `
        }
      </Script>
    </>
  );
};

export default MyApp;
