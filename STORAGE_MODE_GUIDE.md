# 存储模式配置指南

## 📋 两种存储模式

本项目支持两种数据存储模式，可以根据需求自由切换：

### 1️⃣ **MySQL模式**（生产环境）
- ✅ 数据持久化存储在数据库
- ✅ 支持多用户
- ✅ 数据安全可靠
- ✅ 适合生产部署

### 2️⃣ **localStorage模式**（开发调试）
- ✅ 无需安装数据库
- ✅ 零配置开箱即用
- ✅ 快速开发测试
- ⚠️ 数据仅存浏览器

---

## 🚀 快速切换模式

### 当前使用MySQL模式（默认）

你的项目已配置为**MySQL模式**，数据会保存到数据库中。

#### 验证当前模式

检查 `.env.local` 文件：

```bash
cat .env.local
```

如果看到 `USE_LOCAL_STORAGE=false`，说明正在使用MySQL模式。

---

## 🔧 切换到MySQL模式（生产环境）

### 步骤1：复制配置模板

```bash
# 使用MySQL配置模板
cp .env.mysql.example .env.local
```

### 步骤2：编辑配置文件

```bash
nano .env.local
```

修改数据库配置：

```env
USE_LOCAL_STORAGE=false

DB_HOST=localhost
DB_PORT=3306
DB_USER=poetry_user          # 改成你的数据库用户名
DB_PASSWORD=your_password    # 改成你的数据库密码
DB_NAME=poetry_quiz
```

### 步骤3：确保数据库准备就绪

```bash
# 验证数据库连接
mysql -h localhost -u poetry_user -p poetry_quiz

# 在MySQL中执行
SELECT COUNT(*) FROM questions;  # 应该返回 50
EXIT;
```

### 步骤4：重启应用

```bash
# 开发模式
npm run dev

# 生产模式
npm run build
pm2 restart poetry  # 如果使用PM2
```

---

## 🧪 切换到localStorage模式（开发调试）

### 步骤1：复制配置模板

```bash
# 使用本地存储配置模板
cp .env.local.example .env.local
```

### 步骤2：编辑配置文件

```bash
nano .env.local
```

设置为localStorage模式：

```env
USE_LOCAL_STORAGE=true

# 以下数据库配置会被忽略，可以注释掉
# DB_HOST=localhost
# DB_PORT=3306
# DB_USER=poetry_user
# DB_PASSWORD=your_password
# DB_NAME=poetry_quiz
```

### 步骤3：重启应用

```bash
npm run dev
```

### 步骤4：验证localStorage模式

打开浏览器控制台（F12），执行：

```javascript
// 查看存储模式
fetch('/api/poetry/question/random')
  .then(r => r.json())
  .then(d => console.log('Question:', d))

// 查看本地存储的用户数据
JSON.parse(localStorage.getItem('poetry_user'))

// 查看答题记录
JSON.parse(localStorage.getItem('poetry_answers'))
```

---

## 📊 两种模式对比

| 特性 | MySQL模式 | localStorage模式 |
|------|-----------|------------------|
| 数据持久化 | ✅ 永久存储 | ⚠️ 仅限浏览器 |
| 多用户支持 | ✅ 支持 | ❌ 不支持 |
| 配置复杂度 | ⚠️ 需要配置数据库 | ✅ 零配置 |
| 性能 | ✅ 高性能查询 | ✅ 极快响应 |
| 数据安全 | ✅ 可备份恢复 | ⚠️ 易丢失 |
| 题库管理 | ✅ 可动态增删 | ⚠️ 代码内置 |
| 统计分析 | ✅ SQL查询 | ❌ 功能受限 |
| 适用场景 | 生产部署 | 开发测试 |

---

## 🔍 验证当前使用的存储模式

### 方法1：检查配置文件

```bash
grep USE_LOCAL_STORAGE .env.local
```

- `USE_LOCAL_STORAGE=false` → MySQL模式
- `USE_LOCAL_STORAGE=true` → localStorage模式

### 方法2：查看应用日志

```bash
# 开发模式启动时会显示
npm run dev

# 查看PM2日志
pm2 logs poetry | grep -i storage
```

### 方法3：浏览器测试

访问 http://localhost:3000/poetry，打开控制台：

**localStorage模式** - 会看到：
```javascript
localStorage.getItem('poetry_user')  // 有数据
```

**MySQL模式** - localStorage为空：
```javascript
localStorage.getItem('poetry_user')  // null
```

---

## ⚙️ 环境变量完整说明

### USE_LOCAL_STORAGE

**作用**：控制数据存储位置

**取值**：
- `false` - 使用MySQL数据库（**默认**，生产模式）
- `true` - 使用localStorage（开发调试模式）

**影响范围**：
- 题目数据读取
- 用户信息存储
- 答题记录保存
- 统计数据查询

### 数据库配置（仅MySQL模式需要）

```env
DB_HOST=localhost        # 数据库主机地址
DB_PORT=3306            # MySQL端口（默认3306）
DB_USER=poetry_user     # 数据库用户名
DB_PASSWORD=password    # 数据库密码
DB_NAME=poetry_quiz     # 数据库名称
```

---

## 🛠️ 常见问题

### Q1: 切换模式后数据会丢失吗？

**A**: 不会互相影响

- **MySQL → localStorage**：数据库数据保留，localStorage为空白开始
- **localStorage → MySQL**：浏览器数据保留，数据库独立存在

### Q2: 可以同时使用两种模式吗？

**A**: 不可以，同一时间只能使用一种模式。但可以随时切换。

### Q3: 切换模式需要重启应用吗？

**A**: 是的，修改 `.env.local` 后需要重启：

```bash
# 开发模式
Ctrl+C  # 停止
npm run dev  # 重新启动

# 生产模式
pm2 restart poetry
```

### Q4: localStorage模式的数据在哪里？

**A**: 存储在浏览器中，不同浏览器独立存储：

```javascript
// 查看所有数据
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  console.log(key, localStorage.getItem(key));
}
```

### Q5: MySQL连接失败怎么办？

**A**: 检查清单：

```bash
# 1. 检查MySQL是否运行
sudo systemctl status mysqld

# 2. 测试数据库连接
mysql -h localhost -u poetry_user -p poetry_quiz

# 3. 检查用户权限
mysql -u root -p -e "SHOW GRANTS FOR 'poetry_user'@'localhost';"

# 4. 查看错误日志
sudo tail -f /var/log/mysqld.log
```

### Q6: 如何导出localStorage数据？

**A**: 浏览器控制台执行：

```javascript
// 导出所有poetry相关数据
const data = {
  user: JSON.parse(localStorage.getItem('poetry_user')),
  answers: JSON.parse(localStorage.getItem('poetry_answers')),
  logs: JSON.parse(localStorage.getItem('app_visit_logs'))
};

// 复制到剪贴板
copy(JSON.stringify(data, null, 2));

// 或下载为文件
const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'poetry_data_backup.json';
a.click();
```

### Q7: 如何清空数据重新开始？

**localStorage模式**：
```javascript
// 浏览器控制台
localStorage.clear();
```

**MySQL模式**：
```sql
-- MySQL命令行
USE poetry_quiz;
DELETE FROM answers WHERE user_id = 1;
UPDATE users SET score = 0, streak = 0, max_streak = 0 WHERE id = 1;
```

---

## 📈 生产部署建议

### ✅ 推荐配置

```env
# .env.local（生产环境）
USE_LOCAL_STORAGE=false

DB_HOST=localhost
DB_PORT=3306
DB_USER=poetry_user
DB_PASSWORD=strong_password_here
DB_NAME=poetry_quiz
```

### 🔒 安全建议

1. **使用强密码**
   ```bash
   # 生成随机密码
   openssl rand -base64 16
   ```

2. **限制数据库用户权限**
   ```sql
   -- 只授予必要的权限
   GRANT SELECT, INSERT, UPDATE ON poetry_quiz.* TO 'poetry_user'@'localhost';
   ```

3. **保护配置文件**
   ```bash
   # 设置正确的权限
   chmod 600 .env.local

   # 添加到.gitignore
   echo ".env.local" >> .gitignore
   ```

4. **定期备份数据库**
   ```bash
   # 每日自动备份
   0 2 * * * mysqldump -u root -p'password' poetry_quiz > /backup/poetry_$(date +\%Y\%m\%d).sql
   ```

---

## 🚀 快速命令参考

### 切换到MySQL模式
```bash
cp .env.mysql.example .env.local
nano .env.local  # 修改数据库密码
npm run dev
```

### 切换到localStorage模式
```bash
cp .env.local.example .env.local
npm run dev
```

### 验证当前模式
```bash
grep USE_LOCAL_STORAGE .env.local
```

### 测试数据库连接
```bash
mysql -h localhost -u poetry_user -p poetry_quiz -e "SELECT COUNT(*) FROM questions;"
```

---

## 📚 相关文档

- **[阿里云MySQL安装](./ALIYUN_MYSQL_SETUP.md)** - 完整的数据库安装教程
- **[一键部署脚本](./deploy-to-aliyun.sh)** - 自动化部署工具
- **[快速开始](./ALIYUN_QUICKSTART.md)** - 5分钟快速部署
- **[本地调试模式](./LOCAL_DEBUG.md)** - localStorage详细说明

---

**文档版本**: v1.0
**更新日期**: 2026-03-06
**默认模式**: MySQL（生产环境）
**状态**: ✅ 已配置MySQL模式

现在你的项目已经配置为使用MySQL数据库！🎉
