# 我爱古诗词 - 快速入门指南

## 5分钟快速上手

### 前提条件
- 已安装 Node.js 20+
- 已安装 MySQL 8.0+
- MySQL服务正在运行

### 第一步：初始化数据库（1分钟）

```bash
# 运行自动初始化脚本
./init-database.sh
```

脚本会自动：
1. 测试MySQL连接
2. 创建数据库和表
3. 导入50道古诗词题目
4. 创建测试用户
5. 生成 `.env.local` 配置文件

### 第二步：安装依赖（2分钟）

```bash
npm install
```

### 第三步：启动开发服务器（1分钟）

```bash
npm run dev
```

### 第四步：访问应用（1分钟）

打开浏览器访问：
- **古诗词答题页面**: http://localhost:3000/poetry
- **原DeepSeek聊天页面**: http://localhost:3000

---

## 如果遇到问题

### 问题1：数据库连接失败

**症状**：
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**解决方案**：
```bash
# 检查MySQL是否运行
# macOS
brew services list | grep mysql

# Linux
sudo systemctl status mysql

# 如果未运行，启动MySQL
# macOS
brew services start mysql

# Linux
sudo systemctl start mysql
```

### 问题2：找不到数据库

**症状**：
```
Error: Unknown database 'poetry_quiz'
```

**解决方案**：
```bash
# 重新运行初始化脚本
./init-database.sh
```

### 问题3：题目加载不出来

**症状**：页面显示"暂无题目"

**解决方案**：
```bash
# 检查题目数量
mysql -u root -p poetry_quiz -e "SELECT COUNT(*) FROM questions;"

# 如果为0，重新导入数据
mysql -u root -p poetry_quiz < database/init_data.sql
```

### 问题4：端口被占用

**症状**：
```
Error: Port 3000 is already in use
```

**解决方案**：
```bash
# 方式1：停止占用端口的进程
lsof -ti:3000 | xargs kill -9

# 方式2：使用其他端口
PORT=3001 npm run dev
```

---

## 测试API是否正常

```bash
# 运行API测试脚本
./test-poetry-api.sh
```

测试脚本会自动测试：
1. ✓ 获取用户信息
2. ✓ 获取随机题目
3. ✓ 提交答案
4. ✓ 验证数据更新
5. ✓ 获取指定难度题目

---

## 手动测试API

### 测试1：获取题目
```bash
curl http://localhost:3000/api/poetry/question/random
```

**期望返回**：
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

### 测试2：提交答案
```bash
curl -X POST http://localhost:3000/api/poetry/answer/submit \
  -H "Content-Type: application/json" \
  -d '{"questionId":1,"option":"B","userId":1}'
```

**期望返回（答对）**：
```json
{
  "code": 0,
  "data": {
    "correct": true,
    "correctOption": "B",
    "explanation": "《静夜思》唐·李白：床前明月光，疑是地上霜...",
    "scoreAdded": 10,
    "newScore": 10,
    "newStreak": 1,
    "message": "太棒了！"
  }
}
```

### 测试3：获取用户信息
```bash
curl http://localhost:3000/api/poetry/user/info?userId=1
```

**期望返回**：
```json
{
  "code": 0,
  "data": {
    "id": 1,
    "nickname": "诗词小白",
    "avatar": "https://via.placeholder.com/100",
    "score": 10,
    "streak": 1,
    "maxStreak": 1,
    "hearts": 5
  }
}
```

---

## 页面功能测试

访问 http://localhost:3000/poetry 后：

1. **查看顶部状态栏**
   - [ ] 显示用户昵称
   - [ ] 显示总积分
   - [ ] 显示连胜数（火焰图标）

2. **题目显示**
   - [ ] 显示"请选出上句"或"请选出下句"
   - [ ] 显示诗句内容
   - [ ] 显示诗词出处和作者

3. **答题功能**
   - [ ] 可以选择4个选项中的任意一个
   - [ ] 选中后有高亮效果
   - [ ] 点击"确定"按钮提交答案

4. **结果反馈**
   - [ ] 答对显示✅和鼓励语
   - [ ] 答错显示❌和正确答案
   - [ ] 显示完整诗词解析
   - [ ] 积分和连胜正确更新

5. **下一题**
   - [ ] 点击"下一题"按钮加载新题目
   - [ ] 题目不会重复（在50题范围内）

---

## 常用命令

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 重新初始化数据库
./init-database.sh

# 测试API
./test-poetry-api.sh

# 查看MySQL数据
mysql -u root -p poetry_quiz

# 查看题目
mysql -u root -p poetry_quiz -e "SELECT * FROM questions LIMIT 5;"

# 查看用户
mysql -u root -p poetry_quiz -e "SELECT * FROM users;"

# 查看答题记录
mysql -u root -p poetry_quiz -e "SELECT * FROM answers ORDER BY created_at DESC LIMIT 10;"
```

---

## 数据库快速命令

```sql
-- 查看所有表
SHOW TABLES;

-- 查看题目总数
SELECT COUNT(*) FROM questions;

-- 查看不同难度题目数量
SELECT difficulty, COUNT(*) as count
FROM questions
GROUP BY difficulty;

-- 查看不同作者题目数量
SELECT source_author, COUNT(*) as count
FROM questions
GROUP BY source_author
ORDER BY count DESC;

-- 查看用户答题统计
SELECT
  u.nickname,
  u.score,
  u.streak,
  COUNT(a.id) as total_answers,
  SUM(a.is_correct) as correct_answers
FROM users u
LEFT JOIN answers a ON u.id = a.user_id
GROUP BY u.id;

-- 重置用户数据
UPDATE users SET score = 0, streak = 0, max_streak = 0 WHERE id = 1;
DELETE FROM answers WHERE user_id = 1;
```

---

## 下一步

1. **查看完整文档**: `POETRY_README.md`
2. **查看项目概览**: `POETRY_OVERVIEW.md`
3. **开始答题**: http://localhost:3000/poetry
4. **添加新题目**: 编辑 `database/init_data.sql`
5. **自定义样式**: 修改 `app/poetry/page.tsx`
6. **准备部署**: 参考 `POETRY_README.md` 部署章节

---

## 获取帮助

- 查看完整文档：`POETRY_README.md`
- 检查常见问题：`POETRY_README.md` 的"常见问题"章节
- 查看API文档：`POETRY_README.md` 的"API接口文档"章节

祝你使用愉快！📚✨
