'use client';

import { useState, useEffect } from 'react';
import { getUserFingerprint, generateRandomNickname } from '@/lib/browser-fingerprint';

interface Question {
  id: number;
  givenLine: string;
  direction: '上句' | '下句';
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  difficulty: number;
  sourcePoem: string;
  sourceAuthor: string;
}

interface UserInfo {
  id: number;
  nickname: string;
  avatar: string;
  score: number;
  streak: number;
  maxStreak: number;
  hearts: number;
}

interface AnswerResult {
  correct: boolean;
  correctOption: string;
  explanation: string;
  scoreAdded: number;
  newScore: number;
  newStreak: number;
  message: string;
}

export default function PoetryQuiz() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [resultData, setResultData] = useState<AnswerResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 记录访问日志
  useEffect(() => {
    fetch('/api/log/visit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        page: '/poetry',
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      }),
    }).catch(console.error);
  }, []);

  // 加载用户信息
  const loadUserInfo = async () => {
    try {
      // 获取浏览器指纹作为用户标识
      const fingerprint = getUserFingerprint();

      const response = await fetch('/api/poetry/user/info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fingerprint,
          nickname: generateRandomNickname(), // 如果是新用户，使用这个昵称
          userAgent: navigator.userAgent,
        }),
      });

      const data = await response.json();
      if (data.code === 0) {
        setUserInfo(data.data);
      }
    } catch (error) {
      console.error('加载用户信息失败:', error);
    }
  };

  // 加载新题目
  const loadQuestion = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/poetry/question/random');
      const data = await response.json();
      if (data.code === 0) {
        setCurrentQuestion(data.data);
        setSelectedOption(null);
        setShowResult(false);
        setResultData(null);
      } else {
        alert(data.message || '加载题目失败');
      }
    } catch (error) {
      console.error('加载题目失败:', error);
      alert('加载题目失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 提交答案
  const submitAnswer = async () => {
    if (!selectedOption || !currentQuestion || !userInfo) return;

    try {
      setIsLoading(true);
      const response = await fetch('/api/poetry/answer/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          option: selectedOption,
          userId: userInfo.id, // 使用当前用户ID
        }),
      });

      const data = await response.json();
      if (data.code === 0) {
        setResultData(data.data);
        setShowResult(true);
        // 更新用户信息
        if (userInfo) {
          setUserInfo({
            ...userInfo,
            score: data.data.newScore,
            streak: data.data.newStreak,
          });
        }
      } else {
        alert(data.message || '提交答案失败');
      }
    } catch (error) {
      console.error('提交答案失败:', error);
      alert('提交答案失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 下一题
  const nextQuestion = () => {
    loadQuestion();
  };

  // 初始化
  useEffect(() => {
    loadUserInfo();
    loadQuestion();
  }, []);

  if (!currentQuestion || !userInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* 顶部状态栏 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-lg">
                {userInfo.nickname.charAt(0)}
              </div>
              <div>
                <h2 className="font-semibold text-gray-800 dark:text-white">{userInfo.nickname}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">总积分: {userInfo.score}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                🔥 {userInfo.streak}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">当前连胜</p>
            </div>
          </div>
        </div>

        {/* 题目卡片 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-6">
          {!showResult ? (
            <>
              {/* 题目指示 */}
              <div className="text-center mb-8">
                <span className="inline-block bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-6 py-2 rounded-full text-sm font-medium">
                  请选出{currentQuestion.direction}
                </span>
              </div>

              {/* 诗句 */}
              <div className="text-center mb-10">
                <p className="text-3xl font-serif text-gray-800 dark:text-white mb-4">
                  {currentQuestion.givenLine}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  《{currentQuestion.sourcePoem}》 {currentQuestion.sourceAuthor}
                </p>
              </div>

              {/* 选项 */}
              <div className="space-y-3 mb-8">
                {Object.entries(currentQuestion.options).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedOption(key)}
                    disabled={isLoading}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      selectedOption === key
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 dark:border-purple-400'
                        : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600'
                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <span className="font-semibold text-purple-600 dark:text-purple-400 mr-3">
                      {key}.
                    </span>
                    <span className="text-gray-800 dark:text-white font-serif">{value}</span>
                  </button>
                ))}
              </div>

              {/* 选中提示 */}
              {selectedOption && (
                <div className="text-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                  已选择 {selectedOption}，确定提交吗？
                </div>
              )}

              {/* 提交按钮 */}
              <button
                onClick={submitAnswer}
                disabled={!selectedOption || isLoading}
                className={`w-full py-4 rounded-xl font-medium text-lg transition-all ${
                  selectedOption && !isLoading
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg'
                    : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                }`}
              >
                {isLoading ? '提交中...' : '确定'}
              </button>
            </>
          ) : (
            <>
              {/* 结果展示 */}
              <div className="text-center mb-8">
                <div
                  className={`text-6xl mb-4 ${
                    resultData?.correct ? 'animate-bounce' : 'animate-pulse'
                  }`}
                >
                  {resultData?.correct ? '✅' : '❌'}
                </div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                  {resultData?.message}
                </h3>
                {resultData?.correct ? (
                  <p className="text-purple-600 dark:text-purple-400 font-medium">
                    +{resultData.scoreAdded}积分 连胜+1
                  </p>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">
                    正确答案是 <span className="font-bold text-purple-600 dark:text-purple-400">{resultData?.correctOption}</span>
                  </p>
                )}
              </div>

              {/* 诗词解析 */}
              <div className="bg-purple-50 dark:bg-purple-900/30 rounded-xl p-6 mb-6">
                <h4 className="font-semibold text-gray-800 dark:text-white mb-3">诗词全文</h4>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {resultData?.explanation}
                </p>
              </div>

              {/* 下一题按钮 */}
              <button
                onClick={nextQuestion}
                disabled={isLoading}
                className="w-full py-4 rounded-xl font-medium text-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg transition-all"
              >
                下一题
              </button>
            </>
          )}
        </div>

        {/* 底部说明 */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>每道题答对可获得10积分</p>
          <p className="mt-1">连续答对越多，鼓励语越精彩哦！</p>
        </div>
      </div>
    </div>
  );
}
