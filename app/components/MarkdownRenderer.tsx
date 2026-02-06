'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={{
          // 自定义代码块渲染
          code({ inline, className, children, ...props }: React.HTMLProps<HTMLElement> & { inline?: boolean }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline ? (
              <div className="relative my-4 rounded-lg overflow-hidden">
                {match && (
                  <div className="bg-gray-700 px-3 py-1.5 text-xs text-gray-300 font-mono">
                    {match[1]}
                  </div>
                )}
                <pre className="bg-gray-800 p-3 overflow-x-auto">
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              </div>
            ) : (
              <code
                className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-xs font-mono text-pink-600 dark:text-pink-400"
                {...props}
              >
                {children}
              </code>
            );
          },
          // 自定义标题渲染
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold mb-3 mt-4 text-gray-900 dark:text-white border-b border-gray-300 dark:border-gray-600 pb-2">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-bold mb-2.5 mt-4 text-gray-900 dark:text-white">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-semibold mb-2 mt-3 text-gray-900 dark:text-white">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-base font-semibold mb-1.5 mt-2.5 text-gray-800 dark:text-gray-200">
              {children}
            </h4>
          ),
          // 段落
          p: ({ children }) => (
            <p className="mb-3 leading-relaxed text-gray-700 dark:text-gray-300">
              {children}
            </p>
          ),
          // 列表
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-3 space-y-1 text-gray-700 dark:text-gray-300">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-3 space-y-1 text-gray-700 dark:text-gray-300">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="ml-4">
              {children}
            </li>
          ),
          // 引用
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-500 pl-3 py-2 my-3 bg-blue-50 dark:bg-blue-900/20 text-gray-700 dark:text-gray-300 italic">
              {children}
            </blockquote>
          ),
          // 链接
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {children}
            </a>
          ),
          // 表格
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-gray-100 dark:bg-gray-700">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left font-semibold text-gray-900 dark:text-white">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-700 dark:text-gray-300">
              {children}
            </td>
          ),
          // 分割线
          hr: () => (
            <hr className="my-4 border-t-2 border-gray-300 dark:border-gray-600" />
          ),
          // 强调
          strong: ({ children }) => (
            <strong className="font-bold text-gray-900 dark:text-white">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-gray-800 dark:text-gray-200">
              {children}
            </em>
          ),
          // 删除线
          del: ({ children }) => (
            <del className="line-through text-gray-500 dark:text-gray-400">
              {children}
            </del>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
