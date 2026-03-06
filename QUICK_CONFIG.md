# ⚡ 快速配置指南

## 📍 当前状态

✅ 项目已配置为 **MySQL模式**
✅ `.env.local` 文件已创建
⚠️ **需要你填入数据库密码**

---

## 🚀 只需2步即可启动

### 步骤1：填入数据库密码

```bash
nano .env.local
```

找到这一行：
```env
DB_PASSWORD=YOUR_ROOT_PASSWORD_HERE
```

替换为你的MySQL root密码，例如：
```env
DB_PASSWORD=your_actual_password
```

保存退出：`Ctrl+X` → `Y` → `Enter`

### 步骤2：启动应用

```bash
npm run dev
```

访问：http://localhost:3000

---

## ✅ 验证配置

启动应用后，访问 http://localhost:3000/poetry 开始答题。

然后检查数据是否保存到MySQL：

```bash
mysql -u root -p poetry_quiz -e "SELECT * FROM answers ORDER BY created_at DESC LIMIT 3;"
```

如果能看到你的答题记录，说明MySQL模式工作正常！🎉

---

## 🔍 当前配置信息

| 配置项 | 值 |
|-------|-----|
| 存储模式 | MySQL |
| 数据库主机 | localhost |
| 数据库端口 | 3306 |
| 数据库用户 | root |
| 数据库名称 | poetry_quiz |
| 密码 | ⚠️ 需要填写 |

---

## 📝 配置文件位置

- **配置文件**: `.env.local`
- **修改命令**: `nano .env.local`
- **查看配置**: `cat .env.local | grep -v "^#"`

---

## 🛠️ 如果遇到问题

### 问题1：启动时报错 "connect ECONNREFUSED"

**原因**：数据库密码未填写或不正确

**解决**：
```bash
# 1. 编辑配置文件
nano .env.local

# 2. 确认密码正确
# 3. 保存并重启应用
npm run dev
```

### 问题2：想测试数据库连接

```bash
# 使用配置的用户连接测试
mysql -h localhost -u root -p poetry_quiz

# 输入密码后，如果能登录说明配置正确
mysql> SELECT COUNT(*) FROM questions;
+----------+
| COUNT(*) |
+----------+
|       50 |
+----------+
mysql> EXIT;
```

### 问题3：想切换回本地存储模式

```bash
# 1. 编辑配置
nano .env.local

# 2. 修改这一行
USE_LOCAL_STORAGE=true

# 3. 保存并重启
npm run dev
```

---

## 📚 更多文档

- **[MYSQL_MODE_SETUP.md](./MYSQL_MODE_SETUP.md)** - MySQL模式完整说明
- **[STORAGE_MODE_GUIDE.md](./STORAGE_MODE_GUIDE.md)** - 存储模式切换指南
- **[ALIYUN_MYSQL_SETUP.md](./ALIYUN_MYSQL_SETUP.md)** - 数据库安装教程

---

## ⏱️ 预计时间

- 填写密码：**30秒**
- 启动应用：**1分钟**
- 总计：**不到2分钟**

现在就开始吧！🚀

```bash
# 第1步：填写密码
nano .env.local

# 第2步：启动应用
npm run dev
```

---

**配置状态**: ⚠️ 待填写密码
**下一步**: 编辑 `.env.local` 填入数据库密码
**文档版本**: v1.0
**更新时间**: 2026-03-06
