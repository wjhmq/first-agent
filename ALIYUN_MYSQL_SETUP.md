# 阿里云服务器MySQL安装配置完整教程

## 📋 目录

1. [准备工作](#准备工作)
2. [MySQL安装](#mysql安装)
3. [MySQL安全配置](#mysql安全配置)
4. [创建数据库和表](#创建数据库和表)
5. [导入项目数据](#导入项目数据)
6. [远程访问配置](#远程访问配置)
7. [常用命令](#常用命令)
8. [故障排查](#故障排查)

---

## 准备工作

### 1. 连接到阿里云服务器

使用SSH连接到你的阿里云ECS服务器：

```bash
# 方式一：使用密码登录
ssh root@your_server_ip

# 方式二：使用密钥登录
ssh -i /path/to/your-key.pem root@your_server_ip
```

### 2. 更新系统

```bash
# CentOS/RHEL
sudo yum update -y

# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y
```

### 3. 查看系统信息

```bash
# 查看操作系统版本
cat /etc/os-release

# 查看系统架构
uname -m

# 查看内存
free -h

# 查看磁盘
df -h
```

---

## MySQL安装

### 方式一：CentOS/RHEL 系统

#### 1. 添加MySQL Yum仓库

```bash
# 下载MySQL仓库配置
wget https://dev.mysql.com/get/mysql80-community-release-el7-7.noarch.rpm

# 安装仓库配置
sudo rpm -Uvh mysql80-community-release-el7-7.noarch.rpm

# 查看可用的MySQL版本
yum repolist enabled | grep mysql
```

#### 2. 安装MySQL服务器

```bash
# 安装MySQL 8.0
sudo yum install -y mysql-community-server

# 查看安装的版本
mysql --version
```

#### 3. 启动MySQL服务

```bash
# 启动MySQL
sudo systemctl start mysqld

# 设置开机自启
sudo systemctl enable mysqld

# 查看运行状态
sudo systemctl status mysqld
```

#### 4. 获取临时密码

```bash
# MySQL 8.0会生成一个临时密码
sudo grep 'temporary password' /var/log/mysqld.log

# 输出类似：
# [Note] A temporary password is generated for root@localhost: Abcd1234!@#$
```

### 方式二：Ubuntu/Debian 系统

#### 1. 安装MySQL

```bash
# 更新包索引
sudo apt update

# 安装MySQL服务器
sudo apt install -y mysql-server

# 查看版本
mysql --version
```

#### 2. 启动MySQL服务

```bash
# 启动MySQL
sudo systemctl start mysql

# 设置开机自启
sudo systemctl enable mysql

# 查看状态
sudo systemctl status mysql
```

---

## MySQL安全配置

### 1. 运行安全配置脚本

```bash
sudo mysql_secure_installation
```

按照提示进行配置：

```
1. 输入临时密码（CentOS）或直接回车（Ubuntu）

2. 是否更改root密码？
   输入: Y
   设置新密码: YourStrongPassword123!

3. 是否移除匿名用户？
   输入: Y

4. 是否禁止root远程登录？
   输入: N（如果需要远程连接）
   输入: Y（如果只本地使用）

5. 是否删除test数据库？
   输入: Y

6. 是否重新加载权限表？
   输入: Y
```

### 2. 登录MySQL

```bash
# 使用新密码登录
mysql -u root -p

# 输入刚才设置的密码
```

### 3. 创建应用专用用户（推荐）

```sql
-- 创建新用户
CREATE USER 'poetry_user'@'localhost' IDENTIFIED BY 'YourPassword123!';

-- 授予数据库权限
GRANT ALL PRIVILEGES ON poetry_quiz.* TO 'poetry_user'@'localhost';

-- 如果需要远程访问
CREATE USER 'poetry_user'@'%' IDENTIFIED BY 'YourPassword123!';
GRANT ALL PRIVILEGES ON poetry_quiz.* TO 'poetry_user'@'%';

-- 刷新权限
FLUSH PRIVILEGES;

-- 查看用户
SELECT user, host FROM mysql.user;

-- 退出MySQL
EXIT;
```

---

## 创建数据库和表

### 方式一：使用项目SQL文件（推荐）

#### 1. 上传SQL文件到服务器

```bash
# 在本地电脑执行（将SQL文件上传到服务器）
scp database/schema.sql root@your_server_ip:/root/
scp database/init_data.sql root@your_server_ip:/root/
scp database/visit_logs.sql root@your_server_ip:/root/
```

#### 2. 执行SQL文件

```bash
# 方式1：在命令行执行
mysql -u root -p < /root/schema.sql
mysql -u root -p < /root/init_data.sql
mysql -u root -p < /root/visit_logs.sql

# 方式2：登录MySQL后执行
mysql -u root -p

# 在MySQL中执行
SOURCE /root/schema.sql;
SOURCE /root/init_data.sql;
SOURCE /root/visit_logs.sql;
EXIT;
```

### 方式二：手动创建（一步步执行）

#### 1. 创建数据库

```bash
mysql -u root -p
```

在MySQL命令行中执行：

```sql
-- 创建数据库
CREATE DATABASE IF NOT EXISTS poetry_quiz
DEFAULT CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE poetry_quiz;

-- 查看数据库
SHOW DATABASES;
```

#### 2. 创建用户表

```sql
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
```

#### 3. 创建题目表

```sql
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
```

#### 4. 创建答题记录表

```sql
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
```

#### 5. 创建访问日志表（可选）

```sql
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
```

#### 6. 验证表结构

```sql
-- 查看所有表
SHOW TABLES;

-- 查看表结构
DESCRIBE users;
DESCRIBE questions;
DESCRIBE answers;
DESCRIBE visit_logs;

-- 查看创建语句
SHOW CREATE TABLE users\G
```

---

## 导入项目数据

### 1. 创建测试用户

```sql
USE poetry_quiz;

INSERT INTO users (openid, nickname, avatar, score, streak, max_streak, hearts)
VALUES ('test_user_001', '诗词小白', 'https://via.placeholder.com/100', 0, 0, 0, 5);

-- 验证
SELECT * FROM users;
```

### 2. 导入题目数据

有两种方式：

#### 方式A：使用SQL文件（推荐）

```bash
# 确保init_data.sql文件已上传到服务器
mysql -u root -p poetry_quiz < /root/init_data.sql

# 验证导入
mysql -u root -p -e "SELECT COUNT(*) FROM poetry_quiz.questions;"
# 应该显示 50
```

#### 方式B：手动插入示例数据

```sql
USE poetry_quiz;

-- 插入几条示例题目
INSERT INTO questions (given_line, direction, correct_option, option_a, option_b, option_c, option_d, explanation, difficulty, source_poem, source_author) VALUES
('床前明月光', '下句', 'B', '低头思故乡', '疑是地上霜', '举头望明月', '春风不度玉门关', '《静夜思》唐·李白：床前明月光，疑是地上霜。举头望明月，低头思故乡。', 1, '静夜思', '李白'),
('春眠不觉晓', '下句', 'A', '处处闻啼鸟', '夜来风雨声', '花落知多少', '月落乌啼霜满天', '《春晓》唐·孟浩然：春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。', 1, '春晓', '孟浩然'),
('白日依山尽', '下句', 'B', '欲穷千里目', '黄河入海流', '更上一层楼', '春风不度玉门关', '《登鹳雀楼》唐·王之涣：白日依山尽，黄河入海流。欲穷千里目，更上一层楼。', 1, '登鹳雀楼', '王之涣');

-- 验证
SELECT id, given_line, source_poem, source_author FROM questions;
```

### 3. 验证数据完整性

```sql
-- 查看各表记录数
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'questions', COUNT(*) FROM questions
UNION ALL
SELECT 'answers', COUNT(*) FROM answers;

-- 查看题目难度分布
SELECT difficulty, COUNT(*) as count
FROM questions
GROUP BY difficulty
ORDER BY difficulty;

-- 查看各作者题目数量
SELECT source_author, COUNT(*) as count
FROM questions
GROUP BY source_author
ORDER BY count DESC;
```

---

## 远程访问配置

### 1. 修改MySQL配置文件

```bash
# CentOS/RHEL
sudo nano /etc/my.cnf

# Ubuntu/Debian
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
```

找到 `bind-address` 行，修改为：

```ini
# 注释掉或修改为0.0.0.0（允许所有IP访问）
# bind-address = 127.0.0.1
bind-address = 0.0.0.0

# 或者指定具体IP
# bind-address = your_server_ip
```

保存并退出（Ctrl+X, Y, Enter）

### 2. 创建远程访问用户

```bash
mysql -u root -p
```

```sql
-- 创建远程访问用户
CREATE USER 'poetry_user'@'%' IDENTIFIED BY 'YourStrongPassword123!';

-- 授予权限
GRANT ALL PRIVILEGES ON poetry_quiz.* TO 'poetry_user'@'%';

-- 刷新权限
FLUSH PRIVILEGES;

-- 查看用户权限
SHOW GRANTS FOR 'poetry_user'@'%';

EXIT;
```

### 3. 重启MySQL服务

```bash
sudo systemctl restart mysqld   # CentOS
sudo systemctl restart mysql    # Ubuntu
```

### 4. 配置防火墙

#### CentOS/RHEL (firewalld)

```bash
# 开放MySQL端口
sudo firewall-cmd --permanent --add-port=3306/tcp

# 重载防火墙
sudo firewall-cmd --reload

# 查看开放的端口
sudo firewall-cmd --list-ports
```

#### Ubuntu (UFW)

```bash
# 开放MySQL端口
sudo ufw allow 3306/tcp

# 查看状态
sudo ufw status
```

### 5. 阿里云安全组配置

登录阿里云控制台：

1. 进入 **ECS控制台**
2. 选择你的实例
3. 点击 **安全组配置**
4. 添加入方向规则：
   - 端口范围：`3306/3306`
   - 授权对象：`0.0.0.0/0`（所有IP）或指定IP
   - 协议类型：`TCP`

### 6. 测试远程连接

在本地电脑测试：

```bash
# 方式1：使用MySQL命令行
mysql -h your_server_ip -P 3306 -u poetry_user -p

# 方式2：使用telnet测试端口
telnet your_server_ip 3306

# 方式3：使用nc测试
nc -zv your_server_ip 3306
```

---

## 常用命令

### 数据库操作

```sql
-- 查看所有数据库
SHOW DATABASES;

-- 使用数据库
USE poetry_quiz;

-- 查看当前数据库
SELECT DATABASE();

-- 查看所有表
SHOW TABLES;

-- 查看表结构
DESCRIBE table_name;
SHOW CREATE TABLE table_name;

-- 查看表数据
SELECT * FROM table_name LIMIT 10;

-- 查看表记录数
SELECT COUNT(*) FROM table_name;
```

### 用户管理

```sql
-- 查看所有用户
SELECT user, host FROM mysql.user;

-- 查看用户权限
SHOW GRANTS FOR 'username'@'host';

-- 修改用户密码
ALTER USER 'username'@'host' IDENTIFIED BY 'new_password';

-- 删除用户
DROP USER 'username'@'host';
```

### 备份和恢复

```bash
# 备份数据库
mysqldump -u root -p poetry_quiz > poetry_quiz_backup_$(date +%Y%m%d).sql

# 备份单个表
mysqldump -u root -p poetry_quiz questions > questions_backup.sql

# 恢复数据库
mysql -u root -p poetry_quiz < poetry_quiz_backup_20260306.sql

# 只备份结构
mysqldump -u root -p --no-data poetry_quiz > schema_only.sql

# 只备份数据
mysqldump -u root -p --no-create-info poetry_quiz > data_only.sql
```

### 性能监控

```sql
-- 查看进程
SHOW PROCESSLIST;

-- 查看数据库大小
SELECT
  table_schema AS 'Database',
  ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.tables
GROUP BY table_schema;

-- 查看表大小
SELECT
  table_name AS 'Table',
  ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.tables
WHERE table_schema = 'poetry_quiz'
ORDER BY (data_length + index_length) DESC;

-- 查看慢查询
SHOW VARIABLES LIKE 'slow_query%';
```

---

## 故障排查

### 1. 无法启动MySQL

```bash
# 查看错误日志
sudo tail -f /var/log/mysqld.log  # CentOS
sudo tail -f /var/log/mysql/error.log  # Ubuntu

# 检查端口占用
sudo netstat -tlnp | grep 3306

# 检查MySQL进程
ps aux | grep mysql

# 强制停止
sudo pkill mysql
sudo systemctl start mysqld
```

### 2. 忘记root密码

```bash
# 停止MySQL
sudo systemctl stop mysqld

# 跳过权限启动
sudo mysqld_safe --skip-grant-tables &

# 登录（无需密码）
mysql -u root

# 重置密码
USE mysql;
UPDATE user SET authentication_string=PASSWORD('NewPassword123!') WHERE User='root';
FLUSH PRIVILEGES;
EXIT;

# 重启MySQL
sudo systemctl restart mysqld
```

### 3. 无法远程连接

检查清单：

```bash
# 1. 检查MySQL是否监听外部IP
sudo netstat -tlnp | grep 3306
# 应该看到 0.0.0.0:3306 而不是 127.0.0.1:3306

# 2. 检查防火墙
sudo firewall-cmd --list-ports  # CentOS
sudo ufw status  # Ubuntu

# 3. 检查用户权限
mysql -u root -p -e "SELECT user, host FROM mysql.user;"

# 4. 测试本地连接
mysql -h 127.0.0.1 -u poetry_user -p

# 5. 查看错误日志
sudo tail -50 /var/log/mysqld.log
```

### 4. 连接数过多

```sql
-- 查看当前连接数
SHOW STATUS LIKE 'Threads_connected';

-- 查看最大连接数
SHOW VARIABLES LIKE 'max_connections';

-- 修改最大连接数
SET GLOBAL max_connections = 500;

-- 永久修改（编辑配置文件）
-- /etc/my.cnf 添加：
-- max_connections = 500
```

### 5. 性能慢

```sql
-- 检查慢查询
SHOW VARIABLES LIKE 'slow_query_log';
SET GLOBAL slow_query_log = 'ON';

-- 查看表索引
SHOW INDEX FROM questions;

-- 分析查询
EXPLAIN SELECT * FROM questions WHERE difficulty = 1;

-- 优化表
OPTIMIZE TABLE questions;
```

---

## 项目环境变量配置

在你的项目服务器上，创建 `.env.local` 文件：

```bash
cd /path/to/your/project
nano .env.local
```

添加以下内容：

```env
# 使用MySQL数据库模式
USE_LOCAL_STORAGE=false

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=poetry_user
DB_PASSWORD=YourStrongPassword123!
DB_NAME=poetry_quiz
```

如果应用和数据库在不同服务器：

```env
DB_HOST=your_mysql_server_ip
```

---

## 自动化脚本

### 快速部署脚本

创建 `deploy_mysql.sh`：

```bash
#!/bin/bash

echo "开始部署MySQL数据库..."

# 1. 登录MySQL创建数据库
mysql -u root -p <<EOF
CREATE DATABASE IF NOT EXISTS poetry_quiz DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'poetry_user'@'localhost' IDENTIFIED BY 'YourPassword123!';
GRANT ALL PRIVILEGES ON poetry_quiz.* TO 'poetry_user'@'localhost';
FLUSH PRIVILEGES;
EOF

# 2. 导入表结构
mysql -u root -p poetry_quiz < database/schema.sql

# 3. 导入数据
mysql -u root -p poetry_quiz < database/init_data.sql

# 4. 导入访问日志表
mysql -u root -p poetry_quiz < database/visit_logs.sql

echo "数据库部署完成！"

# 验证
mysql -u root -p -e "SELECT COUNT(*) as question_count FROM poetry_quiz.questions;"
```

---

## 安全建议

1. **使用强密码**
   - 至少12位
   - 包含大小写字母、数字、特殊字符

2. **限制root远程访问**
   ```sql
   DELETE FROM mysql.user WHERE user='root' AND host='%';
   FLUSH PRIVILEGES;
   ```

3. **定期备份**
   ```bash
   # 添加到crontab
   0 2 * * * mysqldump -u root -p'password' poetry_quiz > /backup/poetry_quiz_$(date +\%Y\%m\%d).sql
   ```

4. **监控日志**
   ```bash
   sudo tail -f /var/log/mysqld.log
   ```

5. **更新MySQL**
   ```bash
   sudo yum update mysql-community-server  # CentOS
   sudo apt update && sudo apt upgrade mysql-server  # Ubuntu
   ```

---

## 快速参考

### 一键安装（CentOS）

```bash
# 安装MySQL
wget https://dev.mysql.com/get/mysql80-community-release-el7-7.noarch.rpm
sudo rpm -Uvh mysql80-community-release-el7-7.noarch.rpm
sudo yum install -y mysql-community-server
sudo systemctl start mysqld
sudo systemctl enable mysqld

# 获取临时密码
sudo grep 'temporary password' /var/log/mysqld.log

# 运行安全配置
sudo mysql_secure_installation
```

### 一键安装（Ubuntu）

```bash
# 安装MySQL
sudo apt update
sudo apt install -y mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql

# 运行安全配置
sudo mysql_secure_installation
```

### 常用端口

- MySQL默认端口：`3306`
- 确保在阿里云安全组中开放此端口

---

**文档版本**: v1.0
**适用系统**: CentOS 7/8, Ubuntu 18.04/20.04/22.04
**MySQL版本**: 8.0+
**更新日期**: 2026-03-06

祝你部署顺利！🚀
