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
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline ? (
              <div className="relative my-16 rounded-8 overflow-hidden">
                {match && (
                  <div className="bg-gray-700 px-12 py-6 text-11 text-gray-300 font-mono">
                    {match[1]}
                  </div>
                )}
                <pre className="bg-gray-800 p-12 overflow-x-auto">
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              </div>
            ) : (
              <code
                className="bg-gray-100 dark:bg-gray-700 px-6 py-2 rounded-4 text-13 font-mono text-pink-600 dark:text-pink-400"
                {...props}
              >
                {children}
              </code>
            );
          },
          // 自定义标题渲染
          h1: ({ children }) => (
            <h1 className="text-24 font-bold mb-12 mt-16 text-gray-900 dark:text-white border-b border-gray-300 dark:border-gray-600 pb-8">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-20 font-bold mb-10 mt-16 text-gray-900 dark:text-white">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-18 font-semibold mb-8 mt-12 text-gray-900 dark:text-white">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-16 font-semibold mb-6 mt-10 text-gray-800 dark:text-gray-200">
              {children}
            </h4>
          ),
          // 段落
          p: ({ children }) => (
            <p className="mb-12 leading-relaxed text-gray-700 dark:text-gray-300">
              {children}
            </p>
          ),
          // 列表
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-12 space-y-4 text-gray-700 dark:text-gray-300">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-12 space-y-4 text-gray-700 dark:text-gray-300">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="ml-16">
              {children}
            </li>
          ),
          // 引用
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-500 pl-12 py-8 my-12 bg-blue-50 dark:bg-blue-900/20 text-gray-700 dark:text-gray-300 italic">
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
            <div className="overflow-x-auto my-16">
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
            <th className="border border-gray-300 dark:border-gray-600 px-12 py-8 text-left font-semibold text-gray-900 dark:text-white">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-gray-300 dark:border-gray-600 px-12 py-8 text-gray-700 dark:text-gray-300">
              {children}
            </td>
          ),
          // 分割线
          hr: () => (
            <hr className="my-16 border-t-2 border-gray-300 dark:border-gray-600" />
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
