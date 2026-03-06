# 我爱古诗词 - 上下句填空猜诗游戏

一个基于Next.js开发的古诗词答题小应用，用户可以通过选择正确的上句或下句来学习和巩固古诗词知识。

## 功能特点

- 🎯 简单直观的答题界面
- 📚 50+经典唐诗题库
- 🏆 积分和连胜系统
- 📱 响应式设计，支持移动端
- 🌙 暗黑模式支持
- 💾 MySQL数据库存储

## 技术栈

- **前端框架**: Next.js 15 + React 19
- **样式**: TailwindCSS
- **数据库**: MySQL 8.0+
- **语言**: TypeScript
- **数据库客户端**: mysql2

## 快速开始

### 1. 环境要求

- Node.js 20+
- MySQL 8.0+
- npm 或 yarn

### 2. 安装MySQL数据库

#### macOS
```bash
# 使用 Homebrew 安装
brew install mysql

# 启动 MySQL 服务
brew services start mysql

# 登录 MySQL（首次登录无密码）
mysql -u root
```

#### Ubuntu/Debian
```bash
# 更新包索引
sudo apt update

# 安装 MySQL
sudo apt install mysql-server

# 启动 MySQL 服务
sudo systemctl start mysql

# 登录 MySQL
sudo mysql -u root
```

#### CentOS/RHEL
```bash
# 安装 MySQL
sudo yum install mysql-server

# 启动 MySQL 服务
sudo systemctl start mysqld

# 获取临时密码
sudo grep 'temporary password' /var/log/mysqld.log

# 登录 MySQL
mysql -u root -p
```

#### Windows
1. 下载 MySQL 安装包：https://dev.mysql.com/downloads/mysql/
2. 运行安装程序，按向导完成安装
3. 在服务中启动 MySQL 服务
4. 使用 MySQL Workbench 或命令行连接

### 3. 创建数据库和表

#### 方式一：使用MySQL命令行

```bash
# 登录 MySQL
mysql -u root -p

# 执行数据库初始化脚本
source /path/to/project/database/schema.sql

# 导入初始题库数据
source /path/to/project/database/init_data.sql
```

#### 方式二：逐步创建

```bash
# 1. 创建数据库
mysql -u root -p -e "CREATE DATABASE poetry_quiz CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 2. 导入表结构
mysql -u root -p poetry_quiz < database/schema.sql

# 3. 导入初始数据
mysql -u root -p poetry_quiz < database/init_data.sql
```

#### 验证数据库安装

```bash
# 登录数据库
mysql -u root -p

# 切换到数据库
USE poetry_quiz;

# 查看表
SHOW TABLES;

# 查看题目数量
SELECT COUNT(*) FROM questions;

# 应该显示 50 条题目
```

### 4. 配置项目

```bash
# 1. 克隆或下载项目
cd /path/to/project

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.poetry.example .env.local

# 4. 编辑 .env.local 文件，填入数据库信息
```

**.env.local 配置示例**：
```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=poetry_quiz
```

### 5. 运行项目

```bash
# 开发模式
npm run dev

# 访问应用
# 主页（DeepSeek聊天）：http://localhost:3000
# 古诗词答题页面：http://localhost:3000/poetry
```

## 项目结构

```
first-agent/
├── app/
│   ├── api/
│   │   ├── chat/              # DeepSeek聊天API
│   │   ├── miniprogram/       # 小程序API
│   │   └── poetry/            # 古诗词相关API
│   │       ├── question/
│   │       │   └── random/    # 获取随机题目
│   │       ├── answer/
│   │       │   └── submit/    # 提交答案
│   │       └── user/
│   │           └── info/      # 获取用户信息
│   ├── poetry/
│   │   └── page.tsx          # 古诗词答题页面
│   ├── components/           # 公共组件
│   ├── globals.css           # 全局样式
│   ├── layout.tsx            # 布局组件
│   └── page.tsx              # 首页
├── database/
│   ├── schema.sql            # 数据库表结构
│   └── init_data.sql         # 初始题库数据
├── lib/
│   └── db.ts                 # 数据库连接工具
├── .env.local                # 环境变量配置（需自行创建）
├── .env.poetry.example       # 环境变量示例
├── package.json              # 项目依赖
└── POETRY_README.md          # 本文档
```

## API接口文档

### 1. 获取随机题目

**接口**: `GET /api/poetry/question/random`

**查询参数**:
- `difficulty` (可选): 难度等级 1-5

**响应示例**:
```json
{
  "code": 0,
  "data": {
    "id": 1,
    "givenLine": "床前明月光",
    "direction": "下句",
    "options": {
      "A": "低头思故乡",
      "B": "疑是地上霜",
      "C": "举头望明月",
      "D": "烟花三月下扬州"
    },
    "difficulty": 1,
    "sourcePoem": "静夜思",
    "sourceAuthor": "李白"
  }
}
```

### 2. 提交答案

**接口**: `POST /api/poetry/answer/submit`

**请求体**:
```json
{
  "questionId": 1,
  "option": "B",
  "userId": 1
}
```

**响应示例（答对）**:
```json
{
  "code": 0,
  "data": {
    "correct": true,
    "correctOption": "B",
    "explanation": "《静夜思》唐·李白：床前明月光，疑是地上霜。举头望明月，低头思故乡。",
    "scoreAdded": 10,
    "newScore": 10,
    "newStreak": 1,
    "message": "太棒了！"
  }
}
```

### 3. 获取用户信息

**接口**: `GET /api/poetry/user/info`

**查询参数**:
- `userId` (可选): 用户ID，默认为1

**响应示例**:
```json
{
  "code": 0,
  "data": {
    "id": 1,
    "nickname": "诗词小白",
    "avatar": "https://via.placeholder.com/100",
    "score": 0,
    "streak": 0,
    "maxStreak": 0,
    "hearts": 5
  }
}
```

## 生产环境部署

### 方案一：云服务器部署（推荐）

#### 1. 准备云服务器
- 阿里云ECS / 腾讯云CVM / AWS EC2
- 配置：2核4G内存（最低1核2G）
- 系统：Ubuntu 20.04 LTS / CentOS 8

#### 2. 安装运行环境

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 安装 MySQL
sudo apt install -y mysql-server

# 安装 Nginx
sudo apt install -y nginx

# 安装 PM2（进程管理器）
sudo npm install -g pm2
```

#### 3. 部署应用

```bash
# 1. 克隆项目到服务器
cd /var/www
git clone your-repo-url poetry-app
cd poetry-app

# 2. 安装依赖
npm install

# 3. 配置环境变量
nano .env.local
# 填入生产环境的数据库配置

# 4. 初始化数据库
mysql -u root -p < database/schema.sql
mysql -u root -p < database/init_data.sql

# 5. 构建项目
npm run build

# 6. 使用PM2启动应用
pm2 start npm --name "poetry-app" -- start
pm2 save
pm2 startup
```

#### 4. 配置Nginx反向代理

创建Nginx配置文件：
```bash
sudo nano /etc/nginx/sites-available/poetry-app
```

配置内容：
```nginx
server {
    listen 80;
    server_name your-domain.com;  # 替换为你的域名

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

启用配置：
```bash
sudo ln -s /etc/nginx/sites-available/poetry-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 5. 配置SSL证书（可选但推荐）

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取SSL证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

### 方案二：Docker部署

#### 1. 创建Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

#### 2. 创建docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DB_HOST=mysql
      - DB_PORT=3306
      - DB_USER=root
      - DB_PASSWORD=your_password
      - DB_NAME=poetry_quiz
    depends_on:
      - mysql

  mysql:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=your_password
      - MYSQL_DATABASE=poetry_quiz
    volumes:
      - mysql_data:/var/lib/mysql
      - ./database:/docker-entrypoint-initdb.d
    ports:
      - "3306:3306"

volumes:
  mysql_data:
```

#### 3. 启动容器

```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止
docker-compose down
```

### 方案三：Vercel部署（需要外部MySQL）

```bash
# 1. 安装 Vercel CLI
npm install -g vercel

# 2. 登录
vercel login

# 3. 部署
vercel

# 4. 在Vercel控制台配置环境变量
# DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
```

注意：Vercel部署需要使用外部MySQL数据库，如：
- PlanetScale
- Railway
- AWS RDS
- 阿里云RDS

## 数据库维护

### 备份数据库

```bash
# 备份整个数据库
mysqldump -u root -p poetry_quiz > backup_$(date +%Y%m%d).sql

# 只备份数据（不含表结构）
mysqldump -u root -p --no-create-info poetry_quiz > data_backup.sql

# 只备份表结构
mysqldump -u root -p --no-data poetry_quiz > schema_backup.sql
```

### 恢复数据库

```bash
# 恢复数据库
mysql -u root -p poetry_quiz < backup_20260306.sql
```

### 添加新题目

```sql
-- 连接数据库
mysql -u root -p poetry_quiz

-- 插入新题目
INSERT INTO questions (given_line, direction, correct_option, option_a, option_b, option_c, option_d, explanation, difficulty, source_poem, source_author)
VALUES
('君不见黄河之水天上来', '下句', 'A', '奔流到海不复回', '千里江陵一日还', '烟花三月下扬州', '春风不度玉门关', '《将进酒》唐·李白', 3, '将进酒', '李白');
```

## 性能优化建议

### 数据库优化

```sql
-- 添加索引
CREATE INDEX idx_difficulty ON questions(difficulty);
CREATE INDEX idx_user_answers ON answers(user_id, created_at);

-- 定期清理旧的答题记录（保留最近3个月）
DELETE FROM answers WHERE created_at < DATE_SUB(NOW(), INTERVAL 3 MONTH);
```

### 应用优化

1. 启用数据库连接池（已实现）
2. 使用Redis缓存热门题目（可选）
3. 配置CDN加速静态资源
4. 启用Gzip压缩

## 常见问题

### Q1: 数据库连接失败？
**A**: 检查以下几点：
1. MySQL服务是否启动：`sudo systemctl status mysql`
2. 数据库用户权限：`GRANT ALL PRIVILEGES ON poetry_quiz.* TO 'root'@'localhost';`
3. .env.local配置是否正确
4. 防火墙是否开放3306端口

### Q2: 题目显示不出来？
**A**:
1. 检查数据库是否导入了初始数据
2. 执行：`SELECT COUNT(*) FROM questions;` 查看题目数量
3. 查看浏览器控制台是否有API错误

### Q3: 部署后页面404？
**A**:
1. 确保已执行 `npm run build`
2. 检查Next.js路由配置
3. 查看PM2日志：`pm2 logs poetry-app`

### Q4: 如何修改默认用户？
**A**:
```sql
-- 修改测试用户信息
UPDATE users SET nickname = '新昵称', score = 0, streak = 0 WHERE id = 1;
```

## 扩展功能（待开发）

- [ ] 微信登录集成
- [ ] 排行榜系统
- [ ] 每日挑战模式
- [ ] 题目收藏功能
- [ ] 错题本
- [ ] 成就系统
- [ ] 多人对战模式
- [ ] AI生成新题目

## 贡献指南

欢迎提交Issue和Pull Request！

## 开源协议

MIT License

## 联系方式

如有问题或建议，请提交Issue或联系开发者。

---

祝你使用愉快！愿你在学习古诗词的路上越走越远！📚✨
