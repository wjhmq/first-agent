import { NextResponse } from 'next/server';
import {
  getQuestionById,
  getUserInfo,
  saveAnswer,
  updateUserScore,
  resetUserStreak,
} from '@/lib/storage';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { questionId, option, userId = 1 } = body; // 默认使用测试用户ID=1

    if (!questionId || !option) {
      return NextResponse.json(
        { code: 1, message: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 验证选项格式
    if (!/^[A-D]$/.test(option)) {
      return NextResponse.json(
        { code: 1, message: '无效的选项' },
        { status: 400 }
      );
    }

    // 获取题目信息
    const question = await getQuestionById(questionId);
    if (!question) {
      return NextResponse.json(
        { code: 1, message: '题目不存在' },
        { status: 404 }
      );
    }

    const isCorrect = option === question.correct_option;

    // 获取用户信息
    const user = await getUserInfo(userId);
    if (!user) {
      return NextResponse.json(
        { code: 1, message: '用户不存在' },
        { status: 404 }
      );
    }

    // 记录答题
    await saveAnswer(userId, questionId, option, isCorrect);

    let newScore = user.score;
    let newStreak = user.streak;
    let scoreAdded = 0;
    let message = '';

    if (isCorrect) {
      // 答对：增加积分和连胜
      scoreAdded = 10;
      newStreak += 1;

      const updatedUser = await updateUserScore(userId, scoreAdded, newStreak);
      if (updatedUser) {
        newScore = updatedUser.score;
        newStreak = updatedUser.streak;
      }

      // 根据连胜数给出不同的鼓励语
      if (newStreak === 1) {
        message = '太棒了！';
      } else if (newStreak < 5) {
        message = '果然是个小诗仙！';
      } else if (newStreak < 10) {
        message = '妙啊！继续保持！';
      } else {
        message = '诗词大师就是你！';
      }
    } else {
      // 答错：重置连胜
      newStreak = 0;
      await resetUserStreak(userId);
      message = '差一点点，再接再厉！';
    }

    return NextResponse.json({
      code: 0,
      data: {
        correct: isCorrect,
        correctOption: question.correct_option,
        explanation: question.explanation,
        scoreAdded,
        newScore,
        newStreak,
        message,
      },
    });
  } catch (error) {
    console.error('提交答案失败:', error);
    return NextResponse.json(
      { code: 1, message: '提交答案失败，请稍后重试' },
      { status: 500 }
    );
  }
}
