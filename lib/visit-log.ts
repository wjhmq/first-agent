// 访问日志数据结构和存储
export interface VisitLog {
  id: number;
  page: string;
  userAgent: string;
  ip?: string;
  referer?: string;
  timestamp: string;
  sessionId?: string;
}

// 本地存储的键名
const VISIT_LOG_KEY = 'app_visit_logs';

// 获取所有访问日志（本地模式）
export function getVisitLogs(): VisitLog[] {
  if (typeof window === 'undefined') return [];
  try {
    const logs = localStorage.getItem(VISIT_LOG_KEY);
    return logs ? JSON.parse(logs) : [];
  } catch {
    return [];
  }
}

// 添加访问日志（本地模式）
export function addVisitLog(log: Omit<VisitLog, 'id'>): void {
  if (typeof window === 'undefined') return;
  try {
    const logs = getVisitLogs();
    const newLog: VisitLog = {
      ...log,
      id: logs.length + 1,
    };
    logs.push(newLog);

    // 只保留最近1000条记录
    const recentLogs = logs.slice(-1000);
    localStorage.setItem(VISIT_LOG_KEY, JSON.stringify(recentLogs));
  } catch (error) {
    console.error('保存访问日志失败:', error);
  }
}

// 清空访问日志
export function clearVisitLogs(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(VISIT_LOG_KEY);
}

// 获取访问统计
export function getVisitStats(): {
  total: number;
  byPage: Record<string, number>;
  today: number;
} {
  const logs = getVisitLogs();
  const today = new Date().toDateString();

  const byPage: Record<string, number> = {};
  let todayCount = 0;

  logs.forEach(log => {
    // 统计各页面访问量
    byPage[log.page] = (byPage[log.page] || 0) + 1;

    // 统计今日访问量
    const logDate = new Date(log.timestamp).toDateString();
    if (logDate === today) {
      todayCount++;
    }
  });

  return {
    total: logs.length,
    byPage,
    today: todayCount,
  };
}

// 服务端：保存访问日志到数据库（MySQL模式）
export async function saveVisitLogToDB(log: Omit<VisitLog, 'id'>): Promise<void> {
  // 只根据 USE_LOCAL_STORAGE 环境变量判断，不受 NODE_ENV 影响
  const USE_LOCAL_STORAGE = process.env.USE_LOCAL_STORAGE === 'true';
  if (USE_LOCAL_STORAGE) {
    console.log('[访问日志] localStorage模式，跳过数据库保存');
    return;
  }

  // MySQL模式：保存到数据库
  try {
    const pool = await import('./db').then(m => m.default);
    await pool.query(
      'INSERT INTO visit_logs (page, user_agent, ip, referer, timestamp) VALUES (?, ?, ?, ?, ?)',
      [log.page, log.userAgent, log.ip || null, log.referer || null, log.timestamp]
    );
    console.log(`[访问日志] 已记录: ${log.page} - ${new Date(log.timestamp).toLocaleString()}`);
  } catch (error) {
    console.error('保存访问日志到数据库失败:', error);
    console.error('日志详情:', log);
    // 降级：不影响主功能
  }
}
