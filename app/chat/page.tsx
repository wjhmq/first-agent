'use client';

import { useState, useRef, useEffect } from 'react';
import MarkdownRenderer from '../components/MarkdownRenderer';

type ChatMode = 'normal' | 'deepthink' | 'websearch';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  thinkingProcess?: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<ChatMode>('normal');
  const [showThinking, setShowThinking] = useState<{ [key: number]: boolean }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 记录访问日志
  useEffect(() => {
    fetch('/api/log/visit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        page: '/chat',
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      }),
    }).catch(console.error);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 停止生成
  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    // 创建新的 AbortController
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput,
          mode: mode
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';
      let thinkingProcess = '';

      setMessages((prev) => [...prev, { role: 'assistant', content: '', thinkingProcess: '' }]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                break;
              }
              try {
                const parsed = JSON.parse(data);
                if (parsed.type === 'thinking') {
                  thinkingProcess += parsed.content;
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].thinkingProcess = thinkingProcess;
                    return newMessages;
                  });
                } else if (parsed.content) {
                  assistantMessage += parsed.content;
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].content = assistantMessage;
                    return newMessages;
                  });
                }
              } catch (e) {
                console.error('Error parsing SSE data:', e);
              }
            }
          }
        }
      }
    } catch (error: unknown) {
      console.error('Error:', error);

      // 如果是用户主动取消，不显示错误消息
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Request was aborted by user');
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: '抱歉，发生了错误，请重试。' },
        ]);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  // 判断发送按钮是否可用
  const canSend = input.trim().length > 0 && !isLoading;

  return (
    <div className="fixed inset-0 flex flex-col bg-gray-50 dark:bg-gray-900">
      <header className="flex-shrink-0 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-4 py-3 md:px-6 md:py-4 z-10">
        <h1 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white mb-2 md:mb-3">
          DeepSeek Chat
        </h1>
        <div className="flex gap-2 md:gap-3">
          <button
            onClick={() => setMode('normal')}
            className={`flex-1 py-2 px-3 md:py-2.5 md:px-4 rounded-lg text-sm font-medium transition-all ${
              mode === 'normal'
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            普通模式
          </button>
          <button
            onClick={() => setMode('deepthink')}
            className={`flex-1 py-2 px-3 md:py-2.5 md:px-4 rounded-lg text-sm font-medium transition-all ${
              mode === 'deepthink'
                ? 'bg-purple-500 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            深度思考
          </button>
          <button
            onClick={() => setMode('websearch')}
            className={`flex-1 py-2 px-3 md:py-2.5 md:px-4 rounded-lg text-sm font-medium transition-all ${
              mode === 'websearch'
                ? 'bg-green-500 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            联网搜索
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto overscroll-none px-4 py-3 md:px-6 md:py-4 space-y-3 md:space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-20 md:mt-32">
            <p className="text-base md:text-lg">欢迎使用 DeepSeek Chat!</p>
            <p className="mt-2 text-sm md:text-base">选择模式后开始对话吧</p>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[85%] md:max-w-[75%] rounded-xl px-3 py-2.5 md:px-4 md:py-3 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow-md'
              }`}
            >
              {message.role === 'assistant' && message.thinkingProcess && (
                <div className="mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setShowThinking(prev => ({ ...prev, [index]: !prev[index] }))}
                    className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400 font-medium mb-2"
                  >
                    <span>{showThinking[index] ? '▼' : '▶'}</span>
                    思考过程
                  </button>
                  {showThinking[index] && (
                    <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                      <MarkdownRenderer content={message.thinkingProcess} />
                    </div>
                  )}
                </div>
              )}
              {message.role === 'user' ? (
                <p className="text-sm md:text-base whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
              ) : (
                <MarkdownRenderer content={message.content} className="text-sm md:text-base" />
              )}
            </div>
          </div>
        ))}

        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex justify-start">
            <div className="max-w-[85%] md:max-w-[75%] rounded-xl px-3 py-2.5 md:px-4 md:py-3 bg-white dark:bg-gray-800 shadow-md">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <footer className="flex-shrink-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-10">
        <div className="px-3 py-3 md:px-6 md:py-4 safe-area-inset-bottom">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="输入你的问题..."
                disabled={isLoading}
                className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2.5 text-[16px] focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                style={{ fontSize: '16px' }}
              />
              {isLoading ? (
                <button
                  type="button"
                  onClick={handleStop}
                  className="flex-shrink-0 w-[60px] h-[42px] md:w-auto md:h-auto md:px-5 md:py-2.5 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 active:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors flex items-center justify-center"
                >
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!canSend}
                  className={`flex-shrink-0 w-[60px] h-[42px] md:w-auto md:h-auto md:px-5 md:py-2.5 rounded-lg font-medium focus:outline-none focus:ring-2 transition-colors ${
                    canSend
                      ? 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700 focus:ring-blue-500 cursor-pointer'
                      : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  }`}
                >
                  发送
                </button>
              )}
            </form>
          </div>
        </div>
      </footer>
    </div>
  );
}
