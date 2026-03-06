import { NextResponse } from 'next/server';
import { getUserInfo, getUserByFingerprint } from '@/lib/storage';

/**
 * GET 方法：根据用户ID获取用户信息（旧方式，保留兼容）
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = parseInt(searchParams.get('userId') || '1'); // 默认使用测试用户ID=1

    const user = await getUserInfo(userId);

    if (!user) {
      return NextResponse.json(
        { code: 1, message: '用户不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      code: 0,
      data: {
        id: user.id,
        nickname: user.nickname,
        avatar: user.avatar,
        score: user.score,
        streak: user.streak,
        maxStreak: user.max_streak,
        hearts: user.hearts,
      },
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return NextResponse.json(
      { code: 1, message: '获取用户信息失败，请稍后重试' },
      { status: 500 }
    );
  }
}

/**
 * POST 方法：根据浏览器指纹获取或创建用户（新方式）
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fingerprint, nickname, userAgent } = body;

    if (!fingerprint) {
      return NextResponse.json(
        { code: 1, message: '缺少浏览器指纹信息' },
        { status: 400 }
      );
    }

    // 根据指纹获取或创建用户
    const user = await getUserByFingerprint(fingerprint, nickname);

    if (!user) {
      return NextResponse.json(
        { code: 1, message: '获取或创建用户失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      code: 0,
      data: {
        id: user.id,
        nickname: user.nickname,
        avatar: user.avatar,
        score: user.score,
        streak: user.streak,
        maxStreak: user.max_streak,
        hearts: user.hearts,
      },
      message: '用户信息获取成功',
    });
  } catch (error) {
    console.error('获取或创建用户失败:', error);
    return NextResponse.json(
      { code: 1, message: '服务器错误，请稍后重试' },
      { status: 500 }
    );
  }
}
