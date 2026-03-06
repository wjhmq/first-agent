# 我爱古诗词 - 项目概览

## 项目简介

这是一个基于Next.js开发的古诗词学习应用，采用"上下句填空猜诗"的经典玩法，帮助用户在游戏中学习和巩固古诗词知识。

## 已实现功能

### 1. 数据库设计 ✅
- **用户表 (users)**: 存储用户信息、积分、连胜记录
- **题目表 (questions)**: 存储诗词题目、选项、答案、解析
- **答题记录表 (answers)**: 记录用户答题历史

**文件位置**:
- `database/schema.sql` - 数据库表结构
- `database/init_data.sql` - 50道初始题目数据

### 2. 后端API接口 ✅

#### 获取随机题目
- **路径**: `GET /api/poetry/question/random`
- **参数**: `difficulty` (可选，1-5)
- **功能**: 随机返回一道题目，不包含正确答案

#### 提交答案
- **路径**: `POST /api/poetry/answer/submit`
- **参数**: `questionId`, `option`, `userId`
- **功能**:
  - 验证答案正确性
  - 更新用户积分和连胜
  - 返回详细解析和鼓励语

#### 获取用户信息
- **路径**: `GET /api/poetry/user/info`
- **参数**: `userId` (可选，默认1)
- **功能**: 返回用户的积分、连胜等信息

**文件位置**:
- `app/api/poetry/question/random/route.ts`
- `app/api/poetry/answer/submit/route.ts`
- `app/api/poetry/user/info/route.ts`
- `lib/db.ts` - 数据库连接工具

### 3. 前端答题页面 ✅

**页面路径**: `/poetry` (http://localhost:3000/poetry)

**核心功能**:
- ✅ 顶部状态栏：显示用户昵称、总积分、当前连胜
- ✅ 题目展示：清晰显示要填"上句"还是"下句"
- ✅ 4个选项卡片：可选择答案
- ✅ 答题结果反馈：
  - 答对：显示✅、鼓励语、加分提示
  - 答错：显示❌、正确答案提示
- ✅ 诗词全文解析：展示完整诗词和作者
- ✅ 自动加载下一题
- ✅ 响应式设计，支持移动端
- ✅ 暗黑模式支持

**文件位置**:
- `app/poetry/page.tsx` - 答题页面组件

### 4. 用户体验设计 ✅

**积分系统**:
- 每题答对 +10 积分
- 连胜不中断

**鼓励语系统**:
- 连胜1题: "太棒了！"
- 连胜2-4题: "果然是个小诗仙！"
- 连胜5-9题: "妙啊！继续保持！"
- 连胜10+题: "诗词大师就是你！"

**视觉设计**:
- 渐变紫粉色背景
- 圆角卡片设计
- 平滑动画效果
- 答对/答错动画反馈

### 5. 部署文档 ✅

**文档内容**:
- ✅ 环境要求说明
- ✅ MySQL安装指南（macOS/Ubuntu/CentOS/Windows）
- ✅ 数据库初始化步骤
- ✅ 项目配置说明
- ✅ 本地开发运行
- ✅ 生产环境部署方案（云服务器/Docker/Vercel）
- ✅ 数据库维护（备份/恢复/添加题目）
- ✅ 性能优化建议
- ✅ 常见问题解答

**文件位置**:
- `POETRY_README.md` - 完整部署文档
- `.env.poetry.example` - 环境变量示例
- `init-database.sh` - 数据库初始化脚本（一键执行）

## 项目文件结构

```
first-agent/
├── app/
│   ├── api/
│   │   └── poetry/              # 古诗词API
│   │       ├── question/random/ # 获取题目
│   │       ├── answer/submit/   # 提交答案
│   │       └── user/info/       # 用户信息
│   ├── poetry/
│   │   └── page.tsx            # 答题页面
│   └── ...                      # 其他原有文件
├── database/
│   ├── schema.sql              # 数据库表结构
│   └── init_data.sql           # 初始数据（50道题）
├── lib/
│   └── db.ts                   # 数据库连接
├── .env.poetry.example         # 环境变量示例
├── init-database.sh            # 数据库初始化脚本
├── POETRY_README.md            # 完整部署文档
└── POETRY_OVERVIEW.md          # 本文档
```

## 快速开始

### 方式一：使用初始化脚本（推荐）

```bash
# 1. 运行初始化脚本
./init-database.sh

# 2. 安装依赖（如果还没安装）
npm install

# 3. 启动开发服务器
npm run dev

# 4. 访问应用
# 打开浏览器访问: http://localhost:3000/poetry
```

### 方式二：手动初始化

```bash
# 1. 创建数据库
mysql -u root -p < database/schema.sql

# 2. 导入数据
mysql -u root -p poetry_quiz < database/init_data.sql

# 3. 配置环境变量
cp .env.poetry.example .env.local
# 编辑 .env.local，填入数据库信息

# 4. 安装依赖
npm install

# 5. 启动开发
npm run dev
```

## 技术栈

- **前端**: Next.js 15 + React 19 + TypeScript
- **样式**: TailwindCSS
- **数据库**: MySQL 8.0+
- **ORM**: mysql2（原生SQL）
- **部署**: 支持云服务器/Docker/Vercel

## 特色功能

1. **无需登录**: 当前版本使用默认测试用户，无需微信登录即可体验
2. **50道经典题库**: 包含《静夜思》《春晓》《登鹳雀楼》等经典唐诗
3. **智能答题反馈**: 根据连胜数给出不同的鼓励语
4. **完整诗词解析**: 每次答题后展示完整诗词和作者信息
5. **响应式设计**: 完美支持PC和移动端
6. **暗黑模式**: 自动适配系统主题

## 数据库信息

### 测试用户
- **ID**: 1
- **昵称**: 诗词小白
- **初始积分**: 0
- **初始爱心**: 5

### 题库统计
- **总题目数**: 50道
- **难度分布**:
  - 难度1 (简单): 18题
  - 难度2 (中等): 27题
  - 难度3 (困难): 5题
- **诗人分布**:
  - 李白: 12题
  - 王之涣: 5题
  - 王昌龄: 3题
  - 杜甫: 4题
  - 王维: 10题
  - 其他: 16题

## API测试示例

### 测试获取题目
```bash
curl http://localhost:3000/api/poetry/question/random
```

### 测试提交答案
```bash
curl -X POST http://localhost:3000/api/poetry/answer/submit \
  -H "Content-Type: application/json" \
  -d '{"questionId":1,"option":"B","userId":1}'
```

### 测试获取用户信息
```bash
curl http://localhost:3000/api/poetry/user/info?userId=1
```

## 部署到云服务器

详细步骤请查看 `POETRY_README.md` 文档，主要步骤：

1. 准备云服务器（2核4G推荐）
2. 安装Node.js + MySQL + Nginx
3. 克隆项目并构建
4. 使用PM2管理进程
5. 配置Nginx反向代理
6. 可选：配置SSL证书

## 后续扩展计划

以下功能可在MVP版本之后逐步添加：

- [ ] 微信登录集成
- [ ] 排行榜系统
- [ ] 每日挑战模式
- [ ] 题目收藏功能
- [ ] 错题本
- [ ] 成就系统
- [ ] 多人对战模式
- [ ] AI自动生成新题目
- [ ] 分享到社交媒体
- [ ] 学习统计图表

## 注意事项

1. **数据库配置**: 部署前务必修改 `.env.local` 中的数据库密码
2. **生产环境**: 建议使用独立的数据库用户而非root
3. **备份**: 定期备份数据库，防止数据丢失
4. **性能**: 大流量时考虑添加Redis缓存
5. **安全**: 生产环境建议配置SSL证书

## 问题排查

如果遇到问题，请按以下顺序检查：

1. **数据库连接失败**
   - 检查MySQL是否启动
   - 验证 `.env.local` 配置
   - 查看数据库用户权限

2. **题目加载失败**
   - 确认数据库已导入初始数据
   - 检查浏览器控制台错误
   - 查看Network请求状态

3. **页面显示异常**
   - 清除浏览器缓存
   - 重新构建项目 `npm run build`
   - 检查终端错误日志

## 贡献

欢迎提交Issue和Pull Request！

## 许可证

MIT License

---

**开发完成日期**: 2026-03-06
**版本**: v1.0.0 MVP
**状态**: ✅ 所有核心功能已实现并可用
