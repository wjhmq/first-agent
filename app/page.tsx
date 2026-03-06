'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  useEffect(() => {
    // 记录访问日志
    fetch('/api/log/visit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        page: '/',
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      }),
    }).catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-900 dark:to-purple-900">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            欢迎来到学习平台
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8">
            探索知识的海洋，开启智慧之旅
          </p>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            这里汇集了AI对话、古诗词学习等多种学习工具，
            助您在学习的道路上更进一步。
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* AI Chat Feature */}
          <Link href="/chat">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer border-2 border-transparent hover:border-blue-500">
              <div className="text-5xl mb-4">🤖</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                DeepSeek AI 对话
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                与先进的AI助手对话，支持普通模式、深度思考和联网搜索。
              </p>
              <div className="flex items-center text-blue-600 dark:text-blue-400 font-semibold">
                立即体验
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Poetry Quiz Feature */}
          <Link href="/poetry">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer border-2 border-transparent hover:border-purple-500">
              <div className="text-5xl mb-4">📚</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                古诗词答题
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                通过趣味答题学习经典古诗词，包含50+唐诗宋词题目。
              </p>
              <div className="flex items-center text-purple-600 dark:text-purple-400 font-semibold">
                开始答题
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Coming Soon Feature */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 opacity-60">
            <div className="text-5xl mb-4">🚀</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              更多功能
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              敬请期待更多学习工具和功能...
            </p>
            <div className="flex items-center text-gray-400 font-semibold">
              即将推出
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              2+
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              学习工具
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              50+
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              古诗词题目
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
              3
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              AI对话模式
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-pink-600 dark:text-pink-400 mb-2">
              24/7
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              随时可用
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-gray-500 dark:text-gray-400">
          <p className="mb-2">探索更多，学无止境</p>
          <p className="text-sm">
            Powered by Next.js & DeepSeek AI
          </p>
        </div>
      </div>
    </div>
  );
}
