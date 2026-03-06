import { NextResponse } from 'next/server';
import { saveVisitLogToDB } from '@/lib/visit-log';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { page, userAgent, timestamp } = body;

    if (!page || !userAgent || !timestamp) {
      return NextResponse.json(
        { code: 1, message: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 获取客户端IP和referer
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown';
    const referer = request.headers.get('referer') || '';

    // 保存访问日志
    await saveVisitLogToDB({
      page,
      userAgent,
      ip,
      referer,
      timestamp,
    });

    return NextResponse.json({
      code: 0,
      message: '访问日志已记录',
    });
  } catch (error) {
    console.error('记录访问日志失败:', error);
    // 不影响用户使用，返回成功
    return NextResponse.json({
      code: 0,
      message: '访问日志记录失败（已忽略）',
    });
  }
}

// 获取访问统计（可选）
export async function GET() {
  try {
    const USE_LOCAL_STORAGE = process.env.USE_LOCAL_STORAGE === 'true';

    if (USE_LOCAL_STORAGE) {
      return NextResponse.json({
        code: 0,
        message: '本地存储模式不支持服务端统计',
        data: null,
      });
    }

    // MySQL模式：从数据库获取统计
    const pool = await import('@/lib/db').then(m => m.default);
    const [rows] = await pool.query<any[]>(`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN DATE(timestamp) = CURDATE() THEN 1 END) as today,
        page,
        COUNT(*) as page_count
      FROM visit_logs
      GROUP BY page
    `);

    return NextResponse.json({
      code: 0,
      data: rows,
    });
  } catch (error) {
    console.error('获取访问统计失败:', error);
    return NextResponse.json(
      { code: 1, message: '获取访问统计失败' },
      { status: 500 }
    );
  }
}
