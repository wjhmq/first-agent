/**
 * 浏览器指纹生成工具
 * 用于生成唯一的用户标识，支持客户端和服务端
 */

/**
 * 客户端：生成浏览器指纹
 * 基于浏览器特征生成唯一标识
 */
export function generateBrowserFingerprint(): string {
  if (typeof window === 'undefined') {
    return 'server-side';
  }

  // 收集浏览器特征
  const features = [
    navigator.userAgent,
    navigator.language,
    screen.colorDepth,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    navigator.platform,
    navigator.hardwareConcurrency || 0,
  ];

  // 简单哈希函数
  const hash = features.join('|');
  let hashCode = 0;
  for (let i = 0; i < hash.length; i++) {
    const char = hash.charCodeAt(i);
    hashCode = ((hashCode << 5) - hashCode) + char;
    hashCode = hashCode & hashCode; // Convert to 32bit integer
  }

  return 'fp_' + Math.abs(hashCode).toString(36);
}

/**
 * 客户端：获取或创建用户指纹（持久化到localStorage）
 */
export function getUserFingerprint(): string {
  if (typeof window === 'undefined') {
    return 'server-side';
  }

  const STORAGE_KEY = 'poetry_user_fingerprint';

  // 尝试从localStorage获取
  let fingerprint = localStorage.getItem(STORAGE_KEY);

  if (!fingerprint) {
    // 生成新指纹
    fingerprint = generateBrowserFingerprint();
    // 保存到localStorage
    localStorage.setItem(STORAGE_KEY, fingerprint);
  }

  return fingerprint;
}

/**
 * 客户端：生成随机昵称
 */
export function generateRandomNickname(): string {
  const prefixes = ['诗词', '古韵', '文墨', '雅韵', '诗仙', '诗圣', '诗佛', '诗豪'];
  const suffixes = ['爱好者', '学者', '达人', '追随者', '初学者', '探索者', '修行者', '求学者'];

  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  const number = Math.floor(Math.random() * 9999);

  return `${prefix}${suffix}${number}`;
}

/**
 * 服务端：从请求头生成用户标识
 */
export function generateServerFingerprint(
  userAgent: string,
  ip?: string,
  acceptLanguage?: string
): string {
  const features = [
    userAgent,
    ip || 'unknown',
    acceptLanguage || 'unknown',
  ];

  const hash = features.join('|');
  let hashCode = 0;
  for (let i = 0; i < hash.length; i++) {
    const char = hash.charCodeAt(i);
    hashCode = ((hashCode << 5) - hashCode) + char;
    hashCode = hashCode & hashCode;
  }

  return 'fp_' + Math.abs(hashCode).toString(36);
}

/**
 * 服务端：从Next.js请求对象提取指纹
 */
export function extractFingerprintFromRequest(request: Request): string {
  const userAgent = request.headers.get('user-agent') || '';
  const ip = request.headers.get('x-forwarded-for') ||
             request.headers.get('x-real-ip') ||
             'unknown';
  const acceptLanguage = request.headers.get('accept-language') || '';

  return generateServerFingerprint(userAgent, ip, acceptLanguage);
}
