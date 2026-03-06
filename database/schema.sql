-- 我爱古诗词数据库表结构
-- 创建数据库
CREATE DATABASE IF NOT EXISTS poetry_quiz DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE poetry_quiz;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
  openid VARCHAR(100) UNIQUE NOT NULL COMMENT '微信openid',
  nickname VARCHAR(50) DEFAULT '诗词爱好者' COMMENT '用户昵称',
  avatar VARCHAR(255) COMMENT '头像URL',
  score INT DEFAULT 0 COMMENT '总积分',
  streak INT DEFAULT 0 COMMENT '当前连胜次数',
  max_streak INT DEFAULT 0 COMMENT '历史最高连胜',
  hearts INT DEFAULT 5 COMMENT '爱心（换题消耗）',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_openid (openid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 题目表
CREATE TABLE IF NOT EXISTS questions (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '题目ID',
  given_line VARCHAR(255) NOT NULL COMMENT '给出的诗句',
  direction ENUM('上句', '下句') NOT NULL COMMENT '要填上句还是下句',
  correct_option CHAR(1) NOT NULL COMMENT '正确答案 A/B/C/D',
  option_a VARCHAR(255) NOT NULL COMMENT '选项A内容',
  option_b VARCHAR(255) NOT NULL COMMENT '选项B内容',
  option_c VARCHAR(255) NOT NULL COMMENT '选项C内容',
  option_d VARCHAR(255) NOT NULL COMMENT '选项D内容',
  explanation TEXT COMMENT '解析（诗词全文及作者）',
  difficulty TINYINT DEFAULT 3 COMMENT '难度1-5',
  source_poem VARCHAR(100) COMMENT '出自哪首诗',
  source_author VARCHAR(50) COMMENT '作者',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_difficulty (difficulty),
  INDEX idx_source_poem (source_poem)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='题目表';

-- 答题记录表
CREATE TABLE IF NOT EXISTS answers (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '记录ID',
  user_id INT NOT NULL COMMENT '用户ID',
  question_id INT NOT NULL COMMENT '题目ID',
  user_answer CHAR(1) NOT NULL COMMENT '用户选择的答案 A/B/C/D',
  is_correct BOOLEAN NOT NULL COMMENT '是否正确',
  answer_time INT DEFAULT 0 COMMENT '答题用时（秒）',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '答题时间',
  INDEX idx_user_answers (user_id, created_at),
  INDEX idx_question (question_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='答题记录表';
