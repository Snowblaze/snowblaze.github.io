// @ts-nocheck
import { FC } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Box, Heading, Link, ListItem, OrderedList, Text, UnorderedList } from "@chakra-ui/react";
import CodeBlock from "../../../components/CodeBlock";
import 'katex/dist/katex.min.css';

type Props = {
  content: string,
}

const PostBody: FC<Props> = ({
  content,
}) => {
  return (
    <Box>
      <ReactMarkdown
        remarkPlugins={[
          remarkMath,
        ]}
        rehypePlugins={[
          rehypeKatex,
        ]}
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
          a: ({node, ...props}) => {
            return (
              <Link {...props} color="blue.600" />
            );
          },
          p: ({node, ...props}) => {
            return (
              <Text {...props} my="24px" />
            );
          },
          ul: ({node, ordered, ...props}) => {
            return (
              <UnorderedList {...props} my="24px" spacing="8px" ml="32px" />
            );
          },
          ol: ({node, ordered, ...props}) => {
            return (
              <OrderedList {...props} my="24px" spacing="8px" ml="32px" />
            );
          },
          li: ({node, ordered, ...props}) => {
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
          code: CodeBlock,
        }}
      >
        {content}
      </ReactMarkdown>
    </Box>
  );
};

export default PostBody;
