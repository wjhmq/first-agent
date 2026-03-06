# 本地调试模式 - 无需数据库快速开始

## 🚀 1分钟极速启动

无需安装MySQL，无需配置数据库，直接开始使用！

```bash
# 1. 安装依赖（如果还没安装）
npm install

# 2. 启动开发服务器
npm run dev

# 3. 打开浏览器
# http://localhost:3000/poetry
```

就这么简单！✨

## 📦 本地存储模式说明

### 自动启用条件

项目默认在开发环境（`NODE_ENV=development`）下使用本地存储模式，无需任何配置！

数据存储方式：
- ✅ **题目数据**: 内置50道经典古诗词题目（硬编码）
- ✅ **用户数据**: 存储在浏览器 localStorage
- ✅ **答题记录**: 存储在浏览器 localStorage

### 特点

1. **零配置**: 无需安装MySQL，无需数据库初始化
2. **即时运行**: 安装依赖后立即可用
3. **数据持久**: 关闭浏览器后数据保留（localStorage）
4. **完整功能**: 支持所有答题功能，与MySQL模式体验一致
5. **易于调试**: 可随时清空数据重新开始

## 🔧 手动切换存储模式

### 方式一：环境变量（推荐）

在 `.env.local` 文件中设置：

```env
# 使用本地存储（默认在开发环境）
USE_LOCAL_STORAGE=true

# 或使用MySQL数据库
USE_LOCAL_STORAGE=false
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=poetry_quiz
```

### 方式二：代码配置

编辑 `lib/storage.ts` 第7行：

```typescript
// 强制使用本地存储
const USE_LOCAL_STORAGE = true;

// 或根据环境变量自动判断（默认）
const USE_LOCAL_STORAGE = process.env.USE_LOCAL_STORAGE === 'true' || process.env.NODE_ENV === 'development';
```

## 📊 数据管理

### 查看当前存储模式

打开浏览器控制台，输入：

```javascript
// 查看当前用户数据
JSON.parse(localStorage.getItem('poetry_user'))

// 查看答题记录
JSON.parse(localStorage.getItem('poetry_answers'))
```

### 重置用户数据

在浏览器控制台输入：

```javascript
// 重置用户（积分、连胜归零）
localStorage.setItem('poetry_user', JSON.stringify({
  id: 1,
  openid: 'test_user_001',
  nickname: '诗词小白',
  avatar: 'https://via.placeholder.com/100',
  score: 0,
  streak: 0,
  max_streak: 0,
  hearts: 5
}))

// 清空答题记录
localStorage.removeItem('poetry_answers')

// 刷新页面
location.reload()
```

### 清空所有数据

```javascript
// 清空所有古诗词相关数据
localStorage.removeItem('poetry_user')
localStorage.removeItem('poetry_answers')
location.reload()
```

### 修改用户昵称和积分

```javascript
// 获取当前用户
const user = JSON.parse(localStorage.getItem('poetry_user'))

// 修改数据
user.nickname = '诗词大神'
user.score = 1000
user.streak = 50

// 保存
localStorage.setItem('poetry_user', JSON.stringify(user))

// 刷新页面
location.reload()
```

## 🎯 完整功能列表

本地存储模式支持所有功能：

- ✅ 随机获取题目
- ✅ 按难度筛选题目
- ✅ 提交答案
- ✅ 自动计分
- ✅ 连胜统计
- ✅ 答题记录
- ✅ 用户数据持久化
- ✅ 智能鼓励语
- ✅ 完整诗词解析

## 🔄 数据持久化说明

### localStorage 存储结构

#### 1. 用户数据 (`poetry_user`)
```json
{
  "id": 1,
  "openid": "test_user_001",
  "nickname": "诗词小白",
  "avatar": "https://via.placeholder.com/100",
  "score": 120,
  "streak": 12,
  "max_streak": 15,
  "hearts": 5
}
```

#### 2. 答题记录 (`poetry_answers`)
```json
[
  {
    "id": 1,
    "user_id": 1,
    "question_id": 5,
    "user_answer": "B",
    "is_correct": true,
    "answer_time": 0,
    "created_at": "2026-03-06T10:30:00.000Z"
  },
  ...
]
```

## 🛠️ 调试技巧

### 1. 实时查看存储数据

在Chrome DevTools中：
1. 按 F12 打开开发者工具
2. 切换到 **Application** 标签
3. 左侧选择 **Local Storage** → `http://localhost:3000`
4. 可以看到 `poetry_user` 和 `poetry_answers`

### 2. 修改题目难度分布

编辑 `lib/local-data.ts`，修改题目数组：

```typescript
export const localQuestions: Question[] = [
  // 添加你自己的题目
  {
    id: 51,
    given_line: '你的诗句',
    direction: '下句',
    correct_option: 'A',
    option_a: '正确答案',
    option_b: '干扰项1',
    option_c: '干扰项2',
    option_d: '干扰项3',
    explanation: '完整诗词解析',
    difficulty: 1,
    source_poem: '诗名',
    source_author: '作者'
  },
  ...
];
```

### 3. 模拟不同用户状态

```javascript
// 新手用户
localStorage.setItem('poetry_user', JSON.stringify({
  ...JSON.parse(localStorage.getItem('poetry_user')),
  score: 0,
  streak: 0,
  nickname: '新手小白'
}))

// 高手用户
localStorage.setItem('poetry_user', JSON.stringify({
  ...JSON.parse(localStorage.getItem('poetry_user')),
  score: 5000,
  streak: 100,
  max_streak: 150,
  nickname: '诗词宗师'
}))

location.reload()
```

## 🎨 开发建议

### 前端开发

使用本地存储模式进行前端开发的优势：

1. **快速迭代**: 无需等待数据库查询，响应更快
2. **离线开发**: 无需网络连接即可开发测试
3. **数据隔离**: 每个浏览器独立存储，不互相影响
4. **易于重置**: 清除localStorage即可重新开始

### 后端开发

开发API时的建议：

1. **统一接口**: API接口对前端透明，自动适配存储模式
2. **渐进增强**: 先用本地存储快速验证逻辑，再切换到MySQL
3. **错误降级**: MySQL连接失败时自动降级到本地存储

## 📝 切换到生产环境

### 开发 → 生产

```bash
# 1. 安装并初始化MySQL
./init-database.sh

# 2. 配置环境变量
echo "USE_LOCAL_STORAGE=false" >> .env.local

# 3. 重启服务
npm run dev
```

### 验证切换成功

1. 打开浏览器控制台
2. 清除localStorage数据
3. 刷新页面，数据应从MySQL加载

## 🐛 常见问题

### Q1: 数据突然清空了？

**A**: localStorage有容量限制（约5MB），通常不会清空。检查：
- 是否手动清除了浏览器数据
- 是否使用了隐私/无痕模式
- 浏览器是否有自动清理策略

**解决方案**: 本地模式主要用于开发调试，生产环境请使用MySQL。

### Q2: 多个浏览器/标签页数据不同步？

**A**: 这是正常的！localStorage是浏览器隔离的：
- 不同浏览器（Chrome、Firefox）有独立存储
- 同一浏览器的不同标签页共享存储
- 隐私模式与正常模式存储隔离

### Q3: 如何批量导入答题记录？

**A**: 在浏览器控制台执行：

```javascript
const answers = [
  { id: 1, user_id: 1, question_id: 1, user_answer: 'B', is_correct: true, answer_time: 0, created_at: new Date().toISOString() },
  // ... 更多记录
]
localStorage.setItem('poetry_answers', JSON.stringify(answers))
location.reload()
```

### Q4: 本地存储模式性能如何？

**A**: 非常快！因为：
- 无网络请求延迟
- 无数据库查询开销
- 直接内存访问
- 适合小规模数据（50题 + 用户数据）

## 📱 移动端调试

### iOS Safari

1. 打开 Safari → 设置 → 高级 → 网页检查器
2. 在Mac上的Safari中选择 开发 → iPhone → localhost
3. 可以查看和修改localStorage

### Android Chrome

1. 在手机上打开 `chrome://inspect`
2. 连接USB线到电脑
3. 在电脑Chrome中远程调试

## 🎯 最佳实践

1. **开发阶段**: 使用本地存储，快速验证功能
2. **联调阶段**: 切换到MySQL，测试数据库交互
3. **性能测试**: 使用MySQL + 大量数据测试性能
4. **生产部署**: 确保使用MySQL，并配置好连接池

## 📚 相关文件

- `lib/local-data.ts` - 本地题库数据（50道题）
- `lib/storage.ts` - 存储适配器（自动切换数据源）
- `app/api/poetry/**/*.ts` - API接口（已适配）

## 🚀 立即开始

```bash
# 克隆项目
cd your-project

# 安装依赖
npm install

# 启动（默认使用本地存储）
npm run dev

# 访问
open http://localhost:3000/poetry
```

就这么简单！现在开始答题吧！📚✨

---

**提示**: 本地存储模式非常适合：
- 🎨 前端开发和UI调试
- 🧪 功能测试和验证
- 📱 离线环境开发
- 🏫 教学演示

**注意**: 生产环境强烈建议使用MySQL数据库以确保数据安全和性能。
