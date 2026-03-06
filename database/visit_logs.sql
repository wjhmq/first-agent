-- 访问日志表（可选，用于MySQL模式）
USE poetry_quiz;

CREATE TABLE IF NOT EXISTS visit_logs (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '日志ID',
  page VARCHAR(255) NOT NULL COMMENT '访问页面路径',
  user_agent TEXT COMMENT '用户代理字符串',
  ip VARCHAR(50) COMMENT 'IP地址',
  referer VARCHAR(500) COMMENT '来源页面',
  timestamp DATETIME NOT NULL COMMENT '访问时间',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '记录创建时间',
  INDEX idx_page (page),
  INDEX idx_timestamp (timestamp),
  INDEX idx_ip (ip)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='访问日志表';

-- 创建统计视图（可选）
CREATE OR REPLACE VIEW visit_stats AS
SELECT
  page,
  COUNT(*) as total_visits,
  COUNT(DISTINCT ip) as unique_visitors,
  DATE(timestamp) as visit_date
FROM visit_logs
GROUP BY page, DATE(timestamp);
