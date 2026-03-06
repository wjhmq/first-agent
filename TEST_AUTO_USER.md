# 自动用户创建功能 - 快速测试指南

## 🚀 快速测试（5分钟）

### 前提条件

- ✅ MySQL数据库已配置（.env.local已填写密码）
- ✅ 应用已启动（`npm run dev`）

---

## 测试步骤

### 第1步：清空浏览器数据

打开浏览器控制台（F12），执行：

```javascript
// 清空所有本地数据
localStorage.clear();
console.log('✓ 已清空localStorage');
```

### 第2步：访问古诗词页面

打开：http://localhost:3000/poetry

**预期效果**：
- ✅ 页面正常加载
- ✅ 看到用户昵称（随机生成）
- ✅ 积分显示为 0
- ✅ 连胜显示为 0

### 第3步：查看浏览器指纹

控制台执行：

```javascript
console.log('我的指纹:', localStorage.getItem('poetry_user_fingerprint'));
```

**预期输出**：
```
我的指纹: fp_abc123def
```

### 第4步：查看数据库

终端执行：

```bash
mysql -u root -p poetry_quiz -e "
SELECT
  id,
  LEFT(openid, 20) as fingerprint,
  nickname,
  score,
  streak,
  created_at
FROM users
ORDER BY id DESC
LIMIT 1;
"
```

**预期结果**：
```
+----+----------------------+------------------+-------+--------+---------------------+
| id | fingerprint          | nickname         | score | streak | created_at          |
+----+----------------------+------------------+-------+--------+---------------------+
|  2 | fp_abc123def         | 诗词爱好者2468   |     0 |      0 | 2026-03-06 10:15:30 |
+----+----------------------+------------------+-------+--------+---------------------+
```

✅ **指纹匹配**：浏览器指纹 = 数据库openid

### 第5步：答题测试

在页面上答3道题目。

### 第6步：验证数据保存

刷新页面，检查：

```javascript
// 控制台查看用户信息（从页面读取）
// 应该显示积分和连胜数据
```

数据库验证：

```bash
mysql -u root -p poetry_quiz -e "
SELECT nickname, score, streak, max_streak
FROM users
WHERE openid = 'fp_abc123def';  -- 替换为你的指纹
"
```

**预期结果**：
```
+------------------+-------+--------+------------+
| nickname         | score | streak | max_streak |
+------------------+-------+--------+------------+
| 诗词爱好者2468   |    30 |      3 |          3 |
+------------------+-------+--------+------------+
```

✅ 积分和连胜已保存！

---

## 高级测试

### 测试1：多浏览器独立性

#### Chrome浏览器

```javascript
// 1. 打开 http://localhost:3000/poetry
// 2. 查看指纹
console.log('Chrome:', localStorage.getItem('poetry_user_fingerprint'));
// 输出: Chrome: fp_abc123

// 3. 答几道题
// 4. 记录用户ID和昵称
```

#### Firefox浏览器

```javascript
// 1. 打开 http://localhost:3000/poetry
// 2. 查看指纹
console.log('Firefox:', localStorage.getItem('poetry_user_fingerprint'));
// 输出: Firefox: fp_xyz789  （不同！）

// 3. 答几道题
// 4. 记录用户ID和昵称
```

#### 验证数据库

```bash
mysql -u root -p poetry_quiz -e "
SELECT id, LEFT(openid, 15) as fp, nickname, score
FROM users
ORDER BY id DESC
LIMIT 2;
"
```

**预期结果**：两个不同的用户
```
+----+-----------------+------------------+-------+
| id | fp              | nickname         | score |
+----+-----------------+------------------+-------+
|  3 | fp_xyz789       | 古韵学者5678     |    10 |
|  2 | fp_abc123       | 诗词爱好者2468   |    30 |
+----+-----------------+------------------+-------+
```

---

### 测试2：再次访问保持数据

#### 步骤

1. 关闭浏览器
2. 重新打开浏览器
3. 访问 http://localhost:3000/poetry

#### 验证

```javascript
// 指纹应该保持不变
localStorage.getItem('poetry_user_fingerprint')
// fp_abc123 （相同）

// 用户数据应该保留
// 积分和连胜数应该是之前的值
```

✅ **数据持久化成功！**

---

### 测试3：清空指纹后重新识别

#### 步骤

```javascript
// 1. 清除指纹
localStorage.removeItem('poetry_user_fingerprint');

// 2. 刷新页面
location.reload();

// 3. 查看新指纹
console.log('新指纹:', localStorage.getItem('poetry_user_fingerprint'));
```

**注意**：
- 如果浏览器特征没变，生成的指纹可能相同
- 系统会识别为同一用户
- 积分和连胜数据保持不变

✅ **自动识别成功！**

---

## 🐛 常见问题排查

### 问题1：页面加载后没有用户信息

**检查1**：控制台是否有错误

```javascript
// 打开控制台（F12）查看是否有红色错误信息
```

**检查2**：API是否正常

```javascript
fetch('/api/poetry/user/info', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fingerprint: 'test_fp',
    nickname: '测试用户',
  }),
})
.then(r => r.json())
.then(d => console.log('API响应:', d));
```

**预期响应**：
```json
{
  "code": 0,
  "data": {
    "id": 4,
    "nickname": "测试用户",
    "score": 0,
    ...
  }
}
```

**检查3**：数据库连接

```bash
mysql -u root -p poetry_quiz -e "SELECT 1;"
```

---

### 问题2：指纹总是不同

**原因**：每次刷新重新生成指纹

**解决**：检查指纹是否保存到localStorage

```javascript
// 查看指纹
localStorage.getItem('poetry_user_fingerprint')

// 如果为null，说明没有保存成功
// 检查浏览器是否禁用了localStorage
```

---

### 问题3：数据库没有创建新用户

**检查1**：数据库连接

```bash
# 查看.env.local配置
cat .env.local | grep DB_

# 测试连接
mysql -h localhost -u root -p poetry_quiz
```

**检查2**：users表是否存在

```sql
USE poetry_quiz;
SHOW TABLES;
DESCRIBE users;
```

**检查3**：查看错误日志

```bash
# 终端查看应用日志
# 应该能看到错误信息
```

---

### 问题4：答题后数据没有保存

**检查用户ID**：

```javascript
// 浏览器控制台
// 查看页面中的userInfo对象
// 应该包含有效的user.id
```

**检查答题API**：

打开控制台Network标签，提交答案时查看：
- 请求地址：`/api/poetry/answer/submit`
- 请求方法：POST
- 请求体：应该包含 `userId`

---

## ✅ 成功标志

测试成功的标志：

1. ✅ 首次访问自动创建用户
   - 数据库有新记录
   - openid = 浏览器指纹

2. ✅ 答题数据正常保存
   - 积分增加
   - 连胜更新
   - 答题记录入库

3. ✅ 再次访问数据保留
   - 指纹相同
   - 用户信息一致
   - 积分累积

4. ✅ 多浏览器独立
   - 不同指纹
   - 不同用户ID
   - 数据独立

---

## 📊 验证SQL查询

### 查看所有用户

```sql
SELECT
  id,
  LEFT(openid, 20) as fingerprint,
  nickname,
  score,
  streak,
  max_streak,
  hearts,
  created_at
FROM users
ORDER BY id DESC;
```

### 查看用户答题记录

```sql
SELECT
  u.nickname,
  COUNT(a.id) as total_answers,
  SUM(a.is_correct) as correct_count,
  u.score
FROM users u
LEFT JOIN answers a ON u.id = a.user_id
GROUP BY u.id
ORDER BY u.id DESC;
```

### 查看今日新增用户

```sql
SELECT COUNT(*) as new_users_today
FROM users
WHERE DATE(created_at) = CURDATE();
```

---

## 🎯 完整测试清单

### 前置准备
- [ ] MySQL已启动
- [ ] .env.local已配置
- [ ] 数据库表已创建
- [ ] 应用已启动（npm run dev）

### 基础功能
- [ ] 清空localStorage
- [ ] 访问页面显示用户信息
- [ ] 浏览器生成指纹
- [ ] 数据库创建用户记录
- [ ] 指纹匹配（浏览器 = 数据库）

### 答题功能
- [ ] 可以正常答题
- [ ] 答对题目积分增加
- [ ] 连胜数据更新
- [ ] 刷新页面数据保留

### 多浏览器
- [ ] Chrome独立用户
- [ ] Firefox独立用户
- [ ] 数据互不影响

### 持久化
- [ ] 关闭浏览器后重开
- [ ] 指纹保持不变
- [ ] 用户数据保留

---

**测试指南版本**: v1.0
**对应功能版本**: v1.3.0
**更新日期**: 2026-03-06

所有测试通过即可投入使用！🚀
