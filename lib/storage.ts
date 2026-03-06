// 数据存储适配器 - 自动切换MySQL或本地存储
import pool from './db';
import { localQuestions, defaultUser, type Question, type User, type Answer } from './local-data';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// 存储模式配置
// 设置为 'true' 使用localStorage（开发调试）
// 设置为 'false' 或不设置则使用MySQL（生产环境）
const USE_LOCAL_STORAGE = process.env.USE_LOCAL_STORAGE === 'true';

// 本地存储的键名
const STORAGE_KEYS = {
  USER: 'poetry_user',
  ANSWERS: 'poetry_answers',
};

// ============ 工具函数 ============

function getFromLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveToLocalStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('保存到本地存储失败:', error);
  }
}

// ============ 题目相关 ============

export async function getRandomQuestion(difficulty?: number): Promise<Question | null> {
  if (USE_LOCAL_STORAGE) {
    // 本地存储模式
    let questions = localQuestions;
    if (difficulty) {
      questions = questions.filter(q => q.difficulty === difficulty);
    }
    if (questions.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * questions.length);
    return questions[randomIndex];
  } else {
    // MySQL模式
    try {
      let query = 'SELECT * FROM questions';
      const params: number[] = [];

      if (difficulty) {
        query += ' WHERE difficulty = ?';
        params.push(difficulty);
      }

      query += ' ORDER BY RAND() LIMIT 1';

      const [rows] = await pool.query<(Question & RowDataPacket)[]>(query, params);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('从数据库获取题目失败:', error);
      // 降级到本地存储
      let questions = localQuestions;
      if (difficulty) {
        questions = questions.filter(q => q.difficulty === difficulty);
      }
      if (questions.length === 0) return null;
      const randomIndex = Math.floor(Math.random() * questions.length);
      return questions[randomIndex];
    }
  }
}

export async function getQuestionById(id: number): Promise<Question | null> {
  if (USE_LOCAL_STORAGE) {
    return localQuestions.find(q => q.id === id) || null;
  } else {
    try {
      const [rows] = await pool.query<(Question & RowDataPacket)[]>(
        'SELECT * FROM questions WHERE id = ?',
        [id]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('从数据库获取题目失败:', error);
      return localQuestions.find(q => q.id === id) || null;
    }
  }
}

// ============ 用户相关 ============

/**
 * 根据指纹获取或创建用户
 */
export async function getUserByFingerprint(
  fingerprint: string,
  nickname?: string
): Promise<User | null> {
  if (USE_LOCAL_STORAGE) {
    // 本地存储模式 - 使用localStorage
    const user = getFromLocalStorage<User>(STORAGE_KEYS.USER, { ...defaultUser });
    return user;
  } else {
    // MySQL模式
    try {
      // 先尝试查找现有用户
      const [rows] = await pool.query<(User & RowDataPacket)[]>(
        'SELECT * FROM users WHERE openid = ?',
        [fingerprint]
      );

      if (rows.length > 0) {
        // 用户已存在
        return rows[0];
      }

      // 用户不存在，创建新用户
      const newNickname = nickname || '诗词爱好者';
      const [result] = await pool.query<ResultSetHeader>(
        'INSERT INTO users (openid, nickname, avatar, score, streak, max_streak, hearts) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [fingerprint, newNickname, '', 0, 0, 0, 5]
      );

      // 返回新创建的用户
      return {
        id: result.insertId,
        openid: fingerprint,
        nickname: newNickname,
        avatar: '',
        score: 0,
        streak: 0,
        max_streak: 0,
        hearts: 5,
      };
    } catch (error) {
      console.error('获取或创建用户失败:', error);
      return { ...defaultUser };
    }
  }
}

export async function getUserInfo(userId: number = 1): Promise<User | null> {
  if (USE_LOCAL_STORAGE) {
    // 本地存储模式 - 使用localStorage
    const user = getFromLocalStorage<User>(STORAGE_KEYS.USER, { ...defaultUser });
    return user;
  } else {
    // MySQL模式
    try {
      const [rows] = await pool.query<(User & RowDataPacket)[]>(
        'SELECT * FROM users WHERE id = ?',
        [userId]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('从数据库获取用户失败:', error);
      return { ...defaultUser };
    }
  }
}

export async function updateUserScore(
  userId: number,
  scoreToAdd: number,
  newStreak: number
): Promise<User | null> {
  if (USE_LOCAL_STORAGE) {
    // 本地存储模式
    const user = getFromLocalStorage<User>(STORAGE_KEYS.USER, { ...defaultUser });
    user.score += scoreToAdd;
    user.streak = newStreak;
    user.max_streak = Math.max(user.max_streak, newStreak);
    saveToLocalStorage(STORAGE_KEYS.USER, user);
    return user;
  } else {
    // MySQL模式
    try {
      const user = await getUserInfo(userId);
      if (!user) return null;

      const newScore = user.score + scoreToAdd;
      const newMaxStreak = Math.max(user.max_streak, newStreak);

      await pool.query<ResultSetHeader>(
        'UPDATE users SET score = ?, streak = ?, max_streak = ? WHERE id = ?',
        [newScore, newStreak, newMaxStreak, userId]
      );

      return {
        ...user,
        score: newScore,
        streak: newStreak,
        max_streak: newMaxStreak,
      };
    } catch (error) {
      console.error('更新用户积分失败:', error);
      throw error;
    }
  }
}

export async function resetUserStreak(userId: number): Promise<void> {
  if (USE_LOCAL_STORAGE) {
    const user = getFromLocalStorage<User>(STORAGE_KEYS.USER, { ...defaultUser });
    user.streak = 0;
    saveToLocalStorage(STORAGE_KEYS.USER, user);
  } else {
    try {
      await pool.query<ResultSetHeader>(
        'UPDATE users SET streak = ? WHERE id = ?',
        [0, userId]
      );
    } catch (error) {
      console.error('重置用户连胜失败:', error);
      throw error;
    }
  }
}

// ============ 答题记录相关 ============

export async function saveAnswer(
  userId: number,
  questionId: number,
  userAnswer: string,
  isCorrect: boolean
): Promise<void> {
  if (USE_LOCAL_STORAGE) {
    // 本地存储模式
    const answers = getFromLocalStorage<Answer[]>(STORAGE_KEYS.ANSWERS, []);
    const newAnswer: Answer = {
      id: answers.length + 1,
      user_id: userId,
      question_id: questionId,
      user_answer: userAnswer,
      is_correct: isCorrect,
      answer_time: 0,
      created_at: new Date().toISOString(),
    };
    answers.push(newAnswer);
    saveToLocalStorage(STORAGE_KEYS.ANSWERS, answers);
  } else {
    // MySQL模式
    try {
      await pool.query<ResultSetHeader>(
        'INSERT INTO answers (user_id, question_id, user_answer, is_correct) VALUES (?, ?, ?, ?)',
        [userId, questionId, userAnswer, isCorrect]
      );
    } catch (error) {
      console.error('保存答题记录失败:', error);
      throw error;
    }
  }
}

// ============ 调试工具 ============

export function getStorageMode(): string {
  return USE_LOCAL_STORAGE ? 'local' : 'mysql';
}

export function clearLocalStorage(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.USER);
  localStorage.removeItem(STORAGE_KEYS.ANSWERS);
}

export function resetLocalUser(): void {
  if (typeof window === 'undefined') return;
  saveToLocalStorage(STORAGE_KEYS.USER, { ...defaultUser });
  saveToLocalStorage(STORAGE_KEYS.ANSWERS, []);
}
