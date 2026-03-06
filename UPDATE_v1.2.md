# 项目更新说明 v1.2.0

## 📅 更新日期：2026-03-06

## 🎯 主要更新

### 1. 重构页面路由结构

#### 新增首页（`/`）
- 创建了全新的导航首页
- 美观的卡片式布局展示所有功能
- 支持暗黑模式
- 响应式设计，完美支持移动端

#### 聊天页面迁移（`/` → `/chat`）
- 原首页的DeepSeek聊天功能移至 `/chat` 路由
- 功能完全保留，体验无变化
- 访问路径：http://localhost:3000/chat

#### 古诗词页面保持不变（`/poetry`）
- 路径保持不变：http://localhost:3000/poetry
- 功能完全保留

### 2. 添加访问日志系统

#### 自动记录访问
所有页面自动记录访问日志，包括：
- 访问页面路径
- 用户代理（浏览器信息）
- IP地址（服务端记录）
- 来源页面
- 访问时间

#### 双模式存储
- **本地模式**：访问日志存储在浏览器localStorage
- **MySQL模式**：访问日志存储在数据库表 `visit_logs`

## 📁 新增文件

### 页面文件
1. **app/page.tsx**（重写）
   - 新的首页，包含导航卡片
   - 展示平台功能概览
   - 统计数据展示

2. **app/chat/page.tsx**（新增）
   - 原首页内容移动到此
   - DeepSeek AI对话功能

### API文件
3. **app/api/log/visit/route.ts**
   - 访问日志记录API
   - 支持POST记录访问
   - 支持GET查询统计（MySQL模式）

### 工具文件
4. **lib/visit-log.ts**
   - 访问日志数据结构
   - 本地存储管理函数
   - 数据库存储函数

### 数据库文件
5. **database/visit_logs.sql**
   - 访问日志表SQL
   - 统计视图SQL

### 文档文件
6. **UPDATE_v1.2.md**（本文件）
   - 更新说明文档

## 🗂️ 项目目录结构

```
first-agent/
├── app/
│   ├── page.tsx              # [更新] 新首页导航
│   ├── chat/
│   │   └── page.tsx          # [新增] DeepSeek聊天（原首页）
│   ├── poetry/
│   │   └── page.tsx          # [更新] 古诗词答题（添加访问记录）
│   ├── api/
│   │   ├── chat/             # DeepSeek API
│   │   ├── poetry/           # 古诗词API
│   │   └── log/
│   │       └── visit/
│   │           └── route.ts  # [新增] 访问日志API
│   └── components/           # 公共组件
├── lib/
│   ├── db.ts                 # 数据库连接
│   ├── storage.ts            # 存储适配器
│   ├── local-data.ts         # 本地题库数据
│   └── visit-log.ts          # [新增] 访问日志工具
├── database/
│   ├── schema.sql            # 主数据库表
│   ├── init_data.sql         # 初始数据
│   └── visit_logs.sql        # [新增] 访问日志表
└── ...
```

## 🔄 路由变更

| 功能 | 旧路径 | 新路径 | 状态 |
|------|--------|--------|------|
| 首页导航 | - | `/` | ✅ 新增 |
| DeepSeek聊天 | `/` | `/chat` | 🔄 迁移 |
| 古诗词答题 | `/poetry` | `/poetry` | ✅ 保持 |

## 📊 访问日志功能

### 自动记录

每个页面在加载时自动记录访问：

```typescript
// 首页
useEffect(() => {
  fetch('/api/log/visit', {
    method: 'POST',
    body: JSON.stringify({
      page: '/',
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    }),
  });
}, []);
```

### 数据存储

#### 本地模式（localStorage）

数据结构：
```json
{
  "app_visit_logs": [
    {
      "id": 1,
      "page": "/",
      "userAgent": "Mozilla/5.0...",
      "timestamp": "2026-03-06T10:00:00.000Z"
    }
  ]
}
```

查看日志：
```javascript
// 浏览器控制台
JSON.parse(localStorage.getItem('app_visit_logs'))
```

#### MySQL模式

表结构：
```sql
CREATE TABLE visit_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  page VARCHAR(255) NOT NULL,
  user_agent TEXT,
  ip VARCHAR(50),
  referer VARCHAR(500),
  timestamp DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

查询统计：
```sql
-- 各页面访问量
SELECT page, COUNT(*) as visits
FROM visit_logs
GROUP BY page;

-- 今日访问量
SELECT COUNT(*) as today_visits
FROM visit_logs
WHERE DATE(timestamp) = CURDATE();
```

## 🚀 使用指南

### 启动项目

**本地开发模式（推荐）**
```bash
npm install
npm run dev
```

访问：
- 首页：http://localhost:3000
- AI聊天：http://localhost:3000/chat
- 古诗词：http://localhost:3000/poetry

**MySQL模式**
```bash
# 1. 创建访问日志表（可选）
mysql -u root -p poetry_quiz < database/visit_logs.sql

# 2. 启动项目
npm run dev
```

### 查看访问日志

#### 本地模式

浏览器控制台（F12）：
```javascript
// 查看所有日志
const logs = JSON.parse(localStorage.getItem('app_visit_logs'))
console.table(logs)

// 统计各页面访问量
const stats = {}
logs.forEach(log => {
  stats[log.page] = (stats[log.page] || 0) + 1
})
console.log(stats)
```

#### MySQL模式

```bash
mysql -u root -p poetry_quiz

# 查看最近10条访问
SELECT * FROM visit_logs ORDER BY timestamp DESC LIMIT 10;

# 查看统计视图
SELECT * FROM visit_stats;
```

## 🎨 新首页特性

### 功能卡片
- **DeepSeek AI对话**：蓝色主题，点击跳转到 `/chat`
- **古诗词答题**：紫色主题，点击跳转到 `/poetry`
- **更多功能**：灰色主题，即将推出

### 统计展示
- 2+ 学习工具
- 50+ 古诗词题目
- 3 AI对话模式
- 24/7 随时可用

### 交互效果
- 卡片悬停放大效果
- 边框高亮动画
- 平滑过渡动画
- 暗黑模式适配

## 📝 API接口变更

### 新增接口

#### POST /api/log/visit
记录访问日志

**请求体**：
```json
{
  "page": "/chat",
  "userAgent": "Mozilla/5.0...",
  "timestamp": "2026-03-06T10:00:00.000Z"
}
```

**响应**：
```json
{
  "code": 0,
  "message": "访问日志已记录"
}
```

#### GET /api/log/visit
获取访问统计（MySQL模式）

**响应**：
```json
{
  "code": 0,
  "data": [
    {
      "page": "/",
      "total": 120,
      "today": 15
    }
  ]
}
```

## 🔧 环境配置

无需额外配置，与之前版本完全兼容：

**.env.local**（可选）
```env
# 使用本地存储（默认开发环境）
USE_LOCAL_STORAGE=true

# 或使用MySQL
USE_LOCAL_STORAGE=false
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=poetry_quiz
```

## 🐛 已知问题

1. **访问日志不影响功能**
   - 即使API调用失败，也不会影响页面正常使用
   - 所有catch错误都被忽略

2. **本地存储限制**
   - localStorage最多保存1000条记录
   - 自动清理旧记录

3. **MySQL视图兼容性**
   - `CREATE OR REPLACE VIEW` 需要MySQL 5.1.11+
   - 旧版本请手动创建视图

## 📈 性能优化

1. **异步记录**：访问日志异步记录，不阻塞页面加载
2. **错误容错**：记录失败不影响用户体验
3. **自动清理**：本地存储自动限制数量

## 🔐 隐私说明

### 收集的信息
- 页面访问路径
- 浏览器信息（UserAgent）
- IP地址（仅MySQL模式）
- 访问时间

### 用途
- 了解功能使用情况
- 优化用户体验
- 无商业用途

### 数据安全
- 本地模式：数据仅存储在用户浏览器
- MySQL模式：数据存储在本地数据库
- 无第三方服务

## 🎯 后续计划

- [ ] 添加访问统计仪表板页面
- [ ] 支持访问轨迹分析
- [ ] 添加用户会话跟踪
- [ ] 导出访问报表功能

## 📚 相关文档

- [首次使用指南](./POETRY_START.md)
- [本地调试模式](./LOCAL_DEBUG.md)
- [完整项目文档](./POETRY_README.md)
- [快速入门](./POETRY_QUICKSTART.md)

## 🙏 反馈建议

如有问题或建议，欢迎提Issue！

---

**版本**: v1.2.0
**更新日期**: 2026-03-06
**兼容性**: 完全向后兼容
**状态**: ✅ 稳定可用
