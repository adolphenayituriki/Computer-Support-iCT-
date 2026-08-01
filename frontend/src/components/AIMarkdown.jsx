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

const removeUnbalancedBraces = (s) => {
  let res = '';
  let depth = 0;
  for (const ch of s) {
    if (ch === '{') { depth++; res += ch; }
    else if (ch === '}') { if (depth > 0) { depth--; res += ch; } }
    else res += ch;
  }
  if (depth > 0) {
    let out = '';
    let d = 0;
    for (let i = res.length - 1; i >= 0; i--) {
      const ch = res[i];
      if (ch === '}') { d++; out = ch + out; }
      else if (ch === '{') { if (d > 0) { d--; out = ch + out; } }
      else out = ch + out;
    }
    res = out;
  }
  return res;
};

export function sanitizeAI(text) {
  if (!text) return text;
  let str = String(text);
  const codeBlobs = [];
  str = str
    .replace(/```[\s\S]*?(?:```|$)/g, (m) => { codeBlobs.push(m); return `\u0000CODE${codeBlobs.length - 1}\u0000`; })
    .replace(/`[^`\n]*`/g, (m) => { codeBlobs.push(m); return `\u0000CODE${codeBlobs.length - 1}\u0000`; });

  str = str
    .replace(/\s*[:;=]\s*-?\s*\)\s*\}/g, ' ')
    .replace(/\s*\)\s*\}/g, ' ')
    .replace(/\s*\{\s*\(\s*\)\s*\}\s*/g, ' ')
    .replace(/\s*[:;=]-?[)DP(](?![A-Za-z0-9{])/g, ' ')
    .replace(/\s*[:;=]\s*\)(?![A-Za-z0-9{])/g, ' ')
    .replace(/^[)}\]]+\s*/g, ' ')
    .replace(/(\s)[)}\]]+\s*$/g, '$1')
    .replace(/\s*\(\s*\{?\s*$/g, ' ');
  str = removeUnbalancedBraces(str);
  str = str.replace(/[ \t]{2,}/g, ' ').trim();

  codeBlobs.forEach((c, i) => { str = str.replace(`\u0000CODE${i}\u0000`, c); });
  return str;
}

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
        {sanitizeAI(children)}
      </ReactMarkdown>
    </div>
  );
}

export default memo(AIMarkdown);
