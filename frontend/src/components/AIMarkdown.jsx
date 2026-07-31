import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import { memo, useState } from 'react';
import { FaCheck, FaCopy } from 'react-icons/fa';
import 'katex/dist/katex.min.css';

const copyToClipboard = (text) => {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).catch(() => {});
  }
};

function CodeBlock({ node, className, children, ...props }) {
  const match = /language-(\w+)/.exec(className || '');
  const lang = match ? match[1] : '';
  const code = String(children).replace(/\n$/, '');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    copyToClipboard(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="ai-md-codeblock">
      <div className="ai-md-codeblock-bar">
        <span>{lang || 'code'}</span>
        <button onClick={handleCopy} className="ai-md-codeblock-copy">
          {copied ? <FaCheck /> : <FaCopy />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className={className} {...props}>
        <code>{children}</code>
      </pre>
    </div>
  );
}

function AIMarkdown({ children }) {
  if (!children) return null;
  return (
    <div className="ai-md">
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeKatex, rehypeRaw]}
        components={{
          code: CodeBlock,
          a: ({ node, ...props }) => (
            <a {...props} target="_blank" rel="noopener noreferrer" />
          ),
          table: ({ node, ...props }) => (
            <div className="ai-md-table-wrap">
              <table {...props} />
            </div>
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="ai-md-quote" {...props} />
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

export default memo(AIMarkdown);
