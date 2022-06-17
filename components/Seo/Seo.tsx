import { FC } from "react";
import Head from "next/head";

type Props = {
  title?: string,
  description?: string,
  ogImageUrl?: string,
  url?: string,
}

const Seo: FC<Props> = ({
  title,
  description,
  ogImageUrl,
  url,
}) => {
  return (
    <Head>
      {
        title && (
          <>
            <title>{title}</title>
            <meta property="og:title" content={title} />
            <meta name="twitter:title" content={title} />
          </>
        )
      }
      {
        description && (
          <>
            <meta name="description" content={description} />
            <meta property="og:description" content={description} />
            <meta name="twitter:description" content={description} />
          </>
        )
      }
      {
        ogImageUrl && (
          <>
            <meta property="og:image" content={ogImageUrl} />
            <meta property="twitter:image" content={ogImageUrl} />
          </>
        )
      }
      {
        url && (
          <meta property="og:url" content={url} />
        )
      }
    </Head>
  );
};

export default Seo;
