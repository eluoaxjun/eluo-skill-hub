'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-3xl font-bold border-b pb-2 mb-4">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl font-semibold mt-6 mb-3">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-semibold mt-5 mb-2">{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-lg font-semibold mt-4 mb-2">{children}</h4>
          ),
          h5: ({ children }) => (
            <h5 className="text-base font-semibold mt-3 mb-1">{children}</h5>
          ),
          h6: ({ children }) => (
            <h6 className="text-sm font-semibold mt-3 mb-1">{children}</h6>
          ),
          pre: ({ children }) => (
            <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 overflow-x-auto my-4">
              {children}
            </pre>
          ),
          code: ({ inline, children, ...props }: { inline?: boolean; children?: React.ReactNode; className?: string }) =>
            inline ? (
              <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-sm" {...props}>
                {children}
              </code>
            ) : (
              <code {...props}>{children}</code>
            ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="w-full border-collapse">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="bg-slate-100 font-semibold border px-4 py-2 text-left">{children}</th>
          ),
          td: ({ children }) => (
            <td className="border px-4 py-2">{children}</td>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-6 space-y-1 my-2">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-6 space-y-1 my-2">{children}</ol>
          ),
          hr: () => <hr className="border-slate-200 my-6" />,
          strong: ({ children }) => (
            <strong className="font-semibold">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic">{children}</em>
          ),
          p: ({ children }) => (
            <p className="my-2 leading-7">{children}</p>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
