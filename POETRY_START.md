# 🎉 我爱古诗词 - 开始使用

## ✅ 项目已完成

恭喜！"我爱古诗词"项目已经完全实现并可以使用了。

## 📦 已创建的文件

### 核心功能文件（14个）
- ✅ 数据库表结构：`database/schema.sql`
- ✅ 50道题库数据：`database/init_data.sql`
- ✅ 数据库连接工具：`lib/db.ts`
- ✅ 获取题目API：`app/api/poetry/question/random/route.ts`
- ✅ 提交答案API：`app/api/poetry/answer/submit/route.ts`
- ✅ 用户信息API：`app/api/poetry/user/info/route.ts`
- ✅ 答题页面：`app/poetry/page.tsx`
- ✅ 环境变量示例：`.env.poetry.example`
- ✅ 数据库初始化脚本：`init-database.sh` ⭐
- ✅ API测试脚本：`test-poetry-api.sh` ⭐
- ✅ 完整文档：`POETRY_README.md` 📖
- ✅ 项目概览：`POETRY_OVERVIEW.md` 📖
- ✅ 快速入门：`POETRY_QUICKSTART.md` 📖
- ✅ 文件清单：`POETRY_FILES.md` 📖

## 🚀 开始使用

### 方式一：本地调试模式（推荐用于开发）⭐

**无需数据库，1分钟极速启动！**

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev

# 3. 访问应用
# http://localhost:3000/poetry
```

**特点**：
- ✅ 零配置，无需MySQL
- ✅ 内置50道经典题目
- ✅ 数据存储在浏览器localStorage
- ✅ 完整功能，适合快速测试和开发

详细说明：查看 [LOCAL_DEBUG.md](./LOCAL_DEBUG.md)

---

### 方式二：MySQL数据库模式（生产环境）

**完整的数据库支持，适合生产部署**

```bash
# 1. 初始化数据库
./init-database.sh

# 2. 安装依赖（如果还没安装）
npm install

# 3. 启动应用
npm run dev

# 4. 访问应用
# http://localhost:3000/poetry
```

数据库脚本会自动：
- ✓ 检查MySQL是否安装
- ✓ 创建数据库和表
- ✓ 导入50道古诗词题目
- ✓ 创建测试用户
- ✓ 生成.env.local配置文件

## 📚 主要功能

### 用户体验
- 🎯 简洁的答题界面
- 📊 实时显示积分和连胜
- ✨ 答题动画反馈
- 💬 智能鼓励语（根据连胜数变化）
- 📱 完美支持移动端
- 🌙 自动适配暗黑模式

### 题库内容
- 📖 50道经典唐诗题目
- 👨‍🎨 包含李白、杜甫、王维等名家作品
- 🎚️ 3个难度等级（1-简单、2-中等、3-困难）
- 📝 每题附带完整诗词解析

### 技术特性
- ⚡ Next.js 15 + React 19
- 🎨 TailwindCSS样式
- 🗄️ MySQL数据库
- 🔒 TypeScript类型安全
- 🔄 实时数据更新

## 🧪 测试功能

运行API测试：
```bash
./test-poetry-api.sh
```

测试项目：
1. ✓ 获取用户信息
2. ✓ 获取随机题目
3. ✓ 提交答案
4. ✓ 验证数据更新
5. ✓ 获取指定难度题目

## 📖 文档指南

| 文档 | 用途 | 适合人群 |
|------|------|----------|
| `POETRY_START.md` | 本文档，快速开始 | 首次使用 |
| `POETRY_QUICKSTART.md` | 5分钟快速入门 | 快速上手 |
| `POETRY_README.md` | 完整文档和部署指南 | 深入了解/部署 |
| `POETRY_OVERVIEW.md` | 项目概览和技术细节 | 开发者 |
| `POETRY_FILES.md` | 文件清单和说明 | 了解结构 |

## 🎮 使用流程

1. **首次访问页面**
   - 自动加载一道随机题目
   - 显示用户信息（昵称、积分、连胜）

2. **答题过程**
   - 阅读诗句和出处
   - 选择4个选项中的答案
   - 点击"确定"提交

3. **查看结果**
   - 答对：显示✅、鼓励语、加分提示
   - 答错：显示❌、正确答案、诗词全文
   - 点击"下一题"继续

4. **积分系统**
   - 每题答对+10积分
   - 连续答对增加连胜数
   - 答错重置连胜为0

## 🎨 页面路由

| 路由 | 功能 | 说明 |
|------|------|------|
| `/` | DeepSeek聊天 | 原有功能 |
| `/poetry` | 古诗词答题 | 新增功能 ⭐ |

## 🔧 配置说明

### 数据库配置（.env.local）

```env
DB_HOST=localhost        # 数据库主机
DB_PORT=3306            # 数据库端口
DB_USER=root            # 数据库用户
DB_PASSWORD=your_pass   # 数据库密码
DB_NAME=poetry_quiz     # 数据库名称
```

### 默认测试用户

- **ID**: 1
- **昵称**: 诗词小白
- **初始积分**: 0
- **初始连胜**: 0
- **爱心数**: 5

## 🛠️ 常用命令

```bash
# 开发
npm run dev              # 启动开发服务器
npm run build            # 构建生产版本
npm start                # 启动生产服务器

# 数据库
./init-database.sh       # 初始化数据库
mysql -u root -p poetry_quiz  # 连接数据库

# 测试
./test-poetry-api.sh     # 测试API
curl http://localhost:3000/api/poetry/question/random  # 测试单个接口
```

## 🚢 部署到生产环境

详细部署步骤请查看 `POETRY_README.md` 的部署章节。

### 快速部署（云服务器）

```bash
# 1. 安装环境
sudo apt install nodejs mysql-server nginx -y

# 2. 克隆项目
git clone your-repo-url
cd project

# 3. 安装依赖
npm install

# 4. 初始化数据库
./init-database.sh

# 5. 构建项目
npm run build

# 6. 启动服务
pm2 start npm --name "poetry" -- start

# 7. 配置Nginx反向代理
# (详见 POETRY_README.md)
```

## 📊 数据库结构

### 3个核心表

1. **users** - 用户表
   - 存储用户信息、积分、连胜记录

2. **questions** - 题目表
   - 存储诗词题目、选项、答案、解析

3. **answers** - 答题记录表
   - 记录用户答题历史

## 💾 数据维护

### 查看题目
```sql
mysql -u root -p poetry_quiz -e "SELECT * FROM questions LIMIT 5;"
```

### 添加新题目
```sql
INSERT INTO questions (given_line, direction, correct_option, option_a, option_b, option_c, option_d, explanation, difficulty, source_poem, source_author)
VALUES ('你的诗句', '下句', 'B', '选项A', '选项B', '选项C', '选项D', '解析', 2, '诗名', '作者');
```

### 重置用户数据
```sql
UPDATE users SET score = 0, streak = 0 WHERE id = 1;
```

### 备份数据库
```bash
mysqldump -u root -p poetry_quiz > backup.sql
```

## ⚠️ 注意事项

1. **首次使用前必须初始化数据库**
   ```bash
   ./init-database.sh
   ```

2. **确保MySQL服务正在运行**
   ```bash
   # macOS
   brew services start mysql

   # Linux
   sudo systemctl start mysql
   ```

3. **端口占用**
   - Next.js默认使用3000端口
   - MySQL默认使用3306端口

4. **环境变量**
   - 开发环境：`.env.local`
   - 生产环境：服务器环境变量或配置管理

## 🐛 问题排查

### 问题1：数据库连接失败
```bash
# 检查MySQL状态
sudo systemctl status mysql

# 测试连接
mysql -u root -p -e "SELECT 1;"
```

### 问题2：题目显示不出来
```bash
# 检查题目数量
mysql -u root -p poetry_quiz -e "SELECT COUNT(*) FROM questions;"

# 应该显示50
```

### 问题3：页面报错
```bash
# 查看开发服务器日志
# 检查浏览器控制台
# 运行API测试
./test-poetry-api.sh
```

## 🎓 学习资源

- **Next.js文档**: https://nextjs.org/docs
- **React文档**: https://react.dev
- **TailwindCSS文档**: https://tailwindcss.com/docs
- **MySQL文档**: https://dev.mysql.com/doc

## 🤝 获取帮助

如果遇到问题：

1. 查看 `POETRY_QUICKSTART.md` 快速入门指南
2. 阅读 `POETRY_README.md` 完整文档
3. 运行 `./test-poetry-api.sh` 诊断API
4. 检查浏览器控制台错误
5. 查看MySQL数据库数据

## 🎯 下一步

### 现在可以做的
- ✅ 开始答题：http://localhost:3000/poetry
- ✅ 测试所有功能
- ✅ 查看数据库数据
- ✅ 自定义样式和配置

### 未来可以扩展
- 🔲 添加微信登录
- 🔲 实现排行榜
- 🔲 每日挑战模式
- 🔲 错题本功能
- 🔲 成就系统
- 🔲 多人对战

## 🎉 开始答题

一切准备就绪！现在运行：

```bash
./init-database.sh
npm run dev
```

然后访问：**http://localhost:3000/poetry**

祝你答题愉快！📚✨

---

**项目版本**: v1.0.0 MVP
**创建日期**: 2026-03-06
**状态**: ✅ 可以使用
