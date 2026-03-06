# 访问日志快速测试（30秒）

## ⚡ 一键检查

```bash
./check-visit-logs.sh
```

---

## 🎯 快速验证（如果脚本正常）

### 1. 确认配置（5秒）

```bash
grep USE_LOCAL_STORAGE .env.local
```

**预期输出**：`USE_LOCAL_STORAGE=false`

---

### 2. 重启应用（5秒）

```bash
# Ctrl+C 停止当前应用
npm run dev
```

---

### 3. 访问页面（10秒）

在浏览器打开：
- http://localhost:3000
- http://localhost:3000/chat
- http://localhost:3000/poetry

---

### 4. 查看终端输出（立即）

应该看到：
```
[访问日志] 已记录: / - 2026-03-06 下午2:30:15
[访问日志] 已记录: /chat - 2026-03-06 下午2:30:20
[访问日志] 已记录: /poetry - 2026-03-06 下午2:30:25
```

✅ 看到这些输出说明**代码层面正常**！

---

### 5. 查询数据库（10秒）

```bash
mysql -u root -p poetry_quiz -e "SELECT COUNT(*) as total FROM visit_logs;"
```

**预期输出**：
```
+-------+
| total |
+-------+
|     3 |
+-------+
```

✅ 数字 > 0 说明**数据库记录成功**！

---

## 🐛 如果还是空的

### 检查表是否存在

```bash
mysql -u root -p poetry_quiz -e "SHOW TABLES LIKE 'visit_logs';"
```

**如果输出为空**，运行：
```bash
mysql -u root -p poetry_quiz < database/visit_logs.sql
```

---

### 手动插入测试数据

```bash
mysql -u root -p poetry_quiz -e "
INSERT INTO visit_logs (page, user_agent, ip, timestamp)
VALUES ('/test', 'Test', '127.0.0.1', NOW());
"
```

然后查询：
```bash
mysql -u root -p poetry_quiz -e "SELECT * FROM visit_logs;"
```

✅ 如果能看到数据，说明表正常，问题在代码。

---

## 📊 查看详细日志

```bash
mysql -u root -p poetry_quiz -e "
SELECT
  id,
  page,
  LEFT(user_agent, 30) as browser,
  timestamp
FROM visit_logs
ORDER BY timestamp DESC
LIMIT 10;
"
```

---

## 🎉 成功标志

1. ✅ 终端显示: `[访问日志] 已记录: ...`
2. ✅ 数据库有记录: `COUNT(*) > 0`
3. ✅ 可以查询详情

**全部通过 = 修复成功！** 🚀

---

## 📞 仍有问题？

运行完整检查：
```bash
./check-visit-logs.sh
```

查看详细文档：
```bash
cat FIX_VISIT_LOGS.md
```
