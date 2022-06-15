// @ts-nocheck
import { FC } from "react";
import ReactMarkdown from "react-markdown";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialOceanic } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { Box, Heading, IconButton, ListItem, OrderedList, Text, UnorderedList } from "@chakra-ui/react";
import { CopyIcon } from "@chakra-ui/icons";
import cpp from "react-syntax-highlighter/dist/cjs/languages/prism/cpp";
import cmake from "react-syntax-highlighter/dist/cjs/languages/prism/cmake";

SyntaxHighlighter.registerLanguage('cpp', cpp);
SyntaxHighlighter.registerLanguage('cmake', cmake);

type Props = {
  content: string,
}

const PostBody: FC<Props> = ({
  content,
}) => {
  return (
    <Box>
      <ReactMarkdown
        components={{
          h1: ({node, ...props}) => {
            return (
              <Heading {...props} as="h1" size="xl" mt="40px" />
            );
          },
          h2: ({node, ...props}) => {
            return (
              <Heading {...props} as="h2" size="lg" mt="32px" />
            );
          },
          h3: ({node, ...props}) => {
            return (
              <Heading {...props} as="h3" size="md" mt="24px" />
            );
          },
          p: ({node, ...props}) => {
            return (
              <Text {...props} my="24px" />
            );
          },
          ul: ({node, ...props}) => {
            return (
              <UnorderedList {...props} my="24px" spacing="8px" ml="32px" />
            );
          },
          ol: ({node, ...props}) => {
            return (
              <OrderedList {...props} my="24px" spacing="8px" ml="32px" />
            );
          },
          li: ({node, ...props}) => {
            return (
              <ListItem {...props} />
            );
          },
          pre: ({node, ...props }) => {
            return (
              <Box
                {...props}
                sx={{
                  position: "relative",
                  borderRadius: "8px",
                  overflow: "hidden",
                  margin: "24px 0",
                }}
              />
            );
          },
          code: ({node, inline, className, children, ...props}) => {
            const match = /language-(\w+)/.exec(className || '');

            return !inline && match
              ? (
                <>
                  <SyntaxHighlighter
                    style={materialOceanic}
                    language={match[1]}
                    customStyle={{
                      margin: 0,
                    }}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                  <CopyToClipboard text={String(children)}>
                    <IconButton
                      aria-label="Copy"
                      icon={<CopyIcon />}
                      sx={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                      }}
                      color="white"
                      bg="whiteAlpha.500"
                      colorScheme="whiteAlpha"
                    />
                  </CopyToClipboard>
                </>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </Box>
  );
};

export default PostBody;
