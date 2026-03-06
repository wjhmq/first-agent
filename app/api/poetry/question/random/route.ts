import { NextResponse } from 'next/server';
import { getRandomQuestion } from '@/lib/storage';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const difficulty = searchParams.get('difficulty');

    const question = await getRandomQuestion(
      difficulty ? parseInt(difficulty) : undefined
    );

    if (!question) {
      return NextResponse.json(
        { code: 1, message: '暂无题目' },
        { status: 404 }
      );
    }

    // 返回题目，不包含正确答案
    return NextResponse.json({
      code: 0,
      data: {
        id: question.id,
        givenLine: question.given_line,
        direction: question.direction,
        options: {
          A: question.option_a,
          B: question.option_b,
          C: question.option_c,
          D: question.option_d,
        },
        difficulty: question.difficulty,
        sourcePoem: question.source_poem,
        sourceAuthor: question.source_author,
      },
    });
  } catch (error) {
    console.error('获取题目失败:', error);
    return NextResponse.json(
      { code: 1, message: '获取题目失败，请稍后重试' },
      { status: 500 }
    );
  }
}
