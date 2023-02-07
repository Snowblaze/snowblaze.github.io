import { FC } from "react";
import Head from "next/head";

type Props = {
  title?: string,
  description?: string,
  ogImageUrl?: string,
  url?: string,
  extraMeta?: { property: string, content: string }[]
}

const Seo: FC<Props> = ({
  title,
  description,
  ogImageUrl,
  url,
  extraMeta,
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
      {
        extraMeta && extraMeta.map((meta, index) => (
          <meta key={index} property={meta.property} content={meta.content} />
        ))
      }
    </Head>
  );
};

export default Seo;
