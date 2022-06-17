import { FC } from "react";
import { CodeProps } from "react-markdown/lib/ast-to-react";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialOceanic } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { IconButton } from "@chakra-ui/react";
import { CopyIcon } from "@chakra-ui/icons";
import cpp from "react-syntax-highlighter/dist/cjs/languages/prism/cpp";
import cmake from "react-syntax-highlighter/dist/cjs/languages/prism/cmake";

SyntaxHighlighter.registerLanguage('cpp', cpp);
SyntaxHighlighter.registerLanguage('cmake', cmake);

const CodeBlock: FC<CodeProps> = ({
  node,
  inline,
  className,
  children,
  ...props
}) => {
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
};

export default CodeBlock;
