# 访问日志功能修复说明

## 🐛 问题描述

之前访问日志表（visit_logs）一直是空的，无法记录访问数据。

### 问题原因

在 `lib/visit-log.ts` 中，判断逻辑有误：

```typescript
// ❌ 错误的逻辑
const USE_LOCAL_STORAGE = process.env.USE_LOCAL_STORAGE === 'true' || process.env.NODE_ENV === 'development';
```

这导致在**开发环境**（`npm run dev`）时，即使配置了MySQL，也不会保存日志到数据库。

---

## ✅ 修复内容

### 1. 修改判断逻辑 (lib/visit-log.ts)

```typescript
// ✅ 修复后的逻辑
const USE_LOCAL_STORAGE = process.env.USE_LOCAL_STORAGE === 'true';
```

现在只根据 `USE_LOCAL_STORAGE` 环境变量判断，不受 `NODE_ENV` 影响。

### 2. 添加日志输出

```typescript
// MySQL模式下会输出：
console.log(`[访问日志] 已记录: ${log.page} - ${new Date(log.timestamp).toLocaleString()}`);

// localStorage模式下会输出：
console.log('[访问日志] localStorage模式，跳过数据库保存');
```

### 3. 同步修改GET方法 (app/api/log/visit/route.ts)

统一判断逻辑，确保一致性。

---

## 🚀 验证修复

### 方式一：使用检查脚本（推荐）

```bash
# 运行检查脚本
./check-visit-logs.sh
```

脚本会自动检查：
1. ✅ 数据库连接
2. ✅ visit_logs表是否存在
3. ✅ 表结构
4. ✅ 现有日志数量
5. ✅ 环境配置

### 方式二：手动检查

#### 1. 确认环境配置

```bash
cat .env.local | grep USE_LOCAL_STORAGE
```

**应该看到**：
```
USE_LOCAL_STORAGE=false
```

如果是 `true`，需要改为 `false`：
```bash
nano .env.local
# 修改为: USE_LOCAL_STORAGE=false
```

#### 2. 确认表已创建

```bash
mysql -u root -p poetry_quiz -e "DESCRIBE visit_logs;"
```

**预期输出**：
```
+------------+--------------+------+-----+-------------------+----------------+
| Field      | Type         | Null | Key | Default           | Extra          |
+------------+--------------+------+-----+-------------------+----------------+
| id         | int          | NO   | PRI | NULL              | auto_increment |
| page       | varchar(255) | NO   | MUL | NULL              |                |
| user_agent | text         | YES  |     | NULL              |                |
| ip         | varchar(50)  | YES  | MUL | NULL              |                |
| referer    | varchar(500) | YES  |     | NULL              |                |
| timestamp  | datetime     | NO   | MUL | NULL              |                |
| created_at | datetime     | YES  |     | CURRENT_TIMESTAMP |                |
+------------+--------------+------+-----+-------------------+----------------+
```

如果表不存在，创建它：
```bash
mysql -u root -p poetry_quiz < database/visit_logs.sql
```

#### 3. 重启应用

```bash
# 停止应用（Ctrl+C）
# 重新启动
npm run dev
```

#### 4. 访问页面

访问以下页面：
- http://localhost:3000
- http://localhost:3000/chat
- http://localhost:3000/poetry

#### 5. 查看终端日志

应该看到输出：
```
[访问日志] 已记录: / - 2026-03-06 14:30:15
[访问日志] 已记录: /chat - 2026-03-06 14:30:20
[访问日志] 已记录: /poetry - 2026-03-06 14:30:25
```

#### 6. 查询数据库

```bash
mysql -u root -p poetry_quiz -e "
SELECT * FROM visit_logs
ORDER BY timestamp DESC
LIMIT 10;
"
```

**预期结果**：
```
+----+--------+----------------------------------+---------------+---------+---------------------+---------------------+
| id | page   | user_agent                       | ip            | referer | timestamp           | created_at          |
+----+--------+----------------------------------+---------------+---------+---------------------+---------------------+
|  3 | /poetry| Mozilla/5.0 (Macintosh; ...)     | 127.0.0.1     | ...     | 2026-03-06 14:30:25 | 2026-03-06 14:30:25 |
|  2 | /chat  | Mozilla/5.0 (Macintosh; ...)     | 127.0.0.1     | ...     | 2026-03-06 14:30:20 | 2026-03-06 14:30:20 |
|  1 | /      | Mozilla/5.0 (Macintosh; ...)     | 127.0.0.1     | ...     | 2026-03-06 14:30:15 | 2026-03-06 14:30:15 |
+----+--------+----------------------------------+---------------+---------+---------------------+---------------------+
```

✅ 如果看到数据，说明修复成功！

---

## 📊 查看访问统计

### 各页面访问量

```sql
SELECT
  page,
  COUNT(*) as visits,
  COUNT(DISTINCT ip) as unique_visitors
FROM visit_logs
GROUP BY page
ORDER BY visits DESC;
```

### 今日访问量

```sql
SELECT COUNT(*) as today_visits
FROM visit_logs
WHERE DATE(timestamp) = CURDATE();
```

### 最近访问记录

```sql
SELECT
  page,
  LEFT(user_agent, 50) as browser,
  ip,
  timestamp
FROM visit_logs
ORDER BY timestamp DESC
LIMIT 20;
```

### 按小时统计

```sql
SELECT
  DATE_FORMAT(timestamp, '%Y-%m-%d %H:00') as hour,
  COUNT(*) as visits
FROM visit_logs
GROUP BY hour
ORDER BY hour DESC
LIMIT 24;
```

---

## 🔧 故障排查

### 问题1：重启应用后还是没有日志

**检查1**：确认配置
```bash
grep USE_LOCAL_STORAGE .env.local
# 应该输出: USE_LOCAL_STORAGE=false
```

**检查2**：确认代码已更新
```bash
grep "const USE_LOCAL_STORAGE = process.env.USE_LOCAL_STORAGE" lib/visit-log.ts
# 应该看到修复后的代码（没有 || process.env.NODE_ENV）
```

**检查3**：查看错误日志
终端应该显示详细的错误信息。

---

### 问题2：终端显示"保存访问日志到数据库失败"

**可能原因**：
1. 数据库连接失败
2. visit_logs表不存在
3. 字段类型不匹配

**解决步骤**：

```bash
# 1. 测试数据库连接
mysql -u root -p poetry_quiz -e "SELECT 1;"

# 2. 检查表是否存在
mysql -u root -p poetry_quiz -e "SHOW TABLES LIKE 'visit_logs';"

# 3. 如果表不存在，创建它
mysql -u root -p poetry_quiz < database/visit_logs.sql

# 4. 手动插入测试数据
mysql -u root -p poetry_quiz -e "
INSERT INTO visit_logs (page, user_agent, ip, referer, timestamp)
VALUES ('/test', 'Test Browser', '127.0.0.1', '', NOW());
"

# 5. 查询验证
mysql -u root -p poetry_quiz -e "SELECT * FROM visit_logs;"
```

---

### 问题3：看到"localStorage模式，跳过数据库保存"

**原因**：`USE_LOCAL_STORAGE=true`

**解决**：
```bash
# 修改配置
nano .env.local
# 改为: USE_LOCAL_STORAGE=false

# 重启应用
npm run dev
```

---

## 📝 日志记录流程

### 完整流程图

```
用户访问页面 (例如 /poetry)
    ↓
前端 useEffect 触发
    ↓
fetch('/api/log/visit', {
  method: 'POST',
  body: { page, userAgent, timestamp }
})
    ↓
后端 route.ts 接收请求
    ↓
提取 IP 和 Referer
    ↓
调用 saveVisitLogToDB()
    ↓
检查 USE_LOCAL_STORAGE 配置
    ↓
【false】→ MySQL模式
    ↓
INSERT INTO visit_logs (...)
    ↓
输出日志: [访问日志] 已记录: /poetry - ...
    ↓
返回成功响应
```

### 代码位置

1. **前端触发**: `app/*/page.tsx`
   ```typescript
   useEffect(() => {
     fetch('/api/log/visit', { ... });
   }, []);
   ```

2. **API接收**: `app/api/log/visit/route.ts`
   ```typescript
   export async function POST(request: Request) {
     await saveVisitLogToDB({ ... });
   }
   ```

3. **数据库保存**: `lib/visit-log.ts`
   ```typescript
   export async function saveVisitLogToDB(log) {
     await pool.query('INSERT INTO visit_logs ...');
   }
   ```

---

## ✅ 修复检查清单

测试前确认：

- [ ] `.env.local` 文件存在
- [ ] `USE_LOCAL_STORAGE=false`
- [ ] MySQL数据库已启动
- [ ] `visit_logs` 表已创建
- [ ] 应用已重启

测试步骤：

- [ ] 访问首页 (/)
- [ ] 访问聊天页 (/chat)
- [ ] 访问古诗词页 (/poetry)
- [ ] 终端显示日志输出
- [ ] 数据库有访问记录
- [ ] 可以查询统计数据

---

## 🎯 预期效果

修复后，每次访问页面都会：

1. ✅ 前端自动发送访问日志请求
2. ✅ 后端保存到 `visit_logs` 表
3. ✅ 终端输出日志信息
4. ✅ 可以查询访问统计

**示例输出**：

终端：
```
[访问日志] 已记录: /poetry - 2026-03-06 14:30:25
```

数据库：
```sql
SELECT COUNT(*) FROM visit_logs;
-- 输出: 3 (访问了3个页面)
```

---

## 📚 相关文件

### 修改的文件
1. `lib/visit-log.ts` - 修复判断逻辑，添加日志输出
2. `app/api/log/visit/route.ts` - 同步修改判断逻辑

### 新增文件
1. `check-visit-logs.sh` - 自动检查脚本
2. `FIX_VISIT_LOGS.md` - 本文档

### 数据库文件
1. `database/visit_logs.sql` - 表结构定义

---

**修复版本**: v1.3.1
**修复日期**: 2026-03-06
**状态**: ✅ 已修复
**测试**: 待验证

现在重启应用并访问页面，日志应该能正常记录了！🎉
