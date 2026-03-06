# MySQL模式配置说明

## ✅ 已完成的配置

你的项目已经修改为**默认使用MySQL数据库模式**！

### 修改内容

1. ✅ **lib/storage.ts** - 移除了自动使用localStorage的逻辑
   - 之前：开发环境自动使用localStorage
   - 现在：只根据 `USE_LOCAL_STORAGE` 环境变量决定

2. ✅ **创建配置模板文件**
   - `.env.mysql.example` - MySQL模式配置模板
   - `.env.local.example` - localStorage模式配置模板

3. ✅ **创建配置工具**
   - `setup-mysql-mode.sh` - 交互式MySQL配置脚本
   - `STORAGE_MODE_GUIDE.md` - 完整的模式切换指南

---

## 🚀 快速配置MySQL模式

### 方式一：使用交互式脚本（推荐）

```bash
# 运行配置脚本
./setup-mysql-mode.sh
```

脚本会：
1. 提示输入数据库配置信息
2. 测试数据库连接
3. 自动导入表结构和数据（如果需要）
4. 生成 `.env.local` 配置文件

### 方式二：手动配置

```bash
# 1. 复制配置模板
cp .env.mysql.example .env.local

# 2. 编辑配置文件
nano .env.local
```

修改以下内容：

```env
USE_LOCAL_STORAGE=false

DB_HOST=localhost
DB_PORT=3306
DB_USER=poetry_user
DB_PASSWORD=你的数据库密码
DB_NAME=poetry_quiz
```

---

## 📋 配置前的准备工作

确保以下内容已完成：

### ✅ 1. MySQL已安装并运行

```bash
# 检查MySQL状态
sudo systemctl status mysqld  # CentOS
sudo systemctl status mysql   # Ubuntu
```

### ✅ 2. 数据库已创建

```bash
mysql -u root -p
```

```sql
CREATE DATABASE IF NOT EXISTS poetry_quiz
DEFAULT CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

### ✅ 3. 应用用户已创建

```sql
-- 创建用户
CREATE USER 'poetry_user'@'localhost' IDENTIFIED BY '你的密码';

-- 授予权限
GRANT ALL PRIVILEGES ON poetry_quiz.* TO 'poetry_user'@'localhost';
FLUSH PRIVILEGES;
```

### ✅ 4. 数据库表已导入

```bash
# 导入表结构
mysql -u root -p poetry_quiz < database/schema.sql

# 导入50道题目
mysql -u root -p poetry_quiz < database/init_data.sql

# 导入访问日志表（可选）
mysql -u root -p poetry_quiz < database/visit_logs.sql
```

### ✅ 5. 验证数据

```bash
# 查看题目数量（应该是50）
mysql -u poetry_user -p poetry_quiz -e "SELECT COUNT(*) FROM questions;"

# 查看所有表
mysql -u poetry_user -p poetry_quiz -e "SHOW TABLES;"
```

---

## 🎯 配置完成后

### 1. 启动应用

```bash
# 开发模式
npm run dev

# 生产模式
npm run build
npm start

# 使用PM2
pm2 start npm --name poetry -- start
```

### 2. 验证MySQL模式

访问 http://localhost:3000/poetry

开始答题，然后在MySQL中查看：

```bash
mysql -u poetry_user -p poetry_quiz
```

```sql
-- 查看答题记录
SELECT * FROM answers ORDER BY created_at DESC LIMIT 5;

-- 查看用户信息
SELECT * FROM users;

-- 查看访问日志
SELECT * FROM visit_logs ORDER BY timestamp DESC LIMIT 10;
```

如果能看到数据，说明MySQL模式工作正常！

---

## 🔄 如何切换回localStorage模式

如果你想临时切换回本地存储模式：

### 方式一：修改配置文件

```bash
nano .env.local
```

改为：
```env
USE_LOCAL_STORAGE=true
```

### 方式二：使用模板

```bash
cp .env.local.example .env.local
```

然后重启应用：
```bash
npm run dev
```

---

## 📊 当前配置状态

### 默认模式

- ✅ **MySQL模式**（生产环境）
- ⚠️ localStorage模式需要手动设置 `USE_LOCAL_STORAGE=true`

### 环境变量

| 变量 | 默认值 | 说明 |
|-----|-------|------|
| USE_LOCAL_STORAGE | false | false=MySQL, true=localStorage |
| DB_HOST | localhost | 数据库主机 |
| DB_PORT | 3306 | 数据库端口 |
| DB_USER | poetry_user | 数据库用户 |
| DB_PASSWORD | - | 数据库密码（必填） |
| DB_NAME | poetry_quiz | 数据库名称 |

---

## 🛠️ 故障排查

### 问题1：应用启动报错 "connect ECONNREFUSED"

**原因**：无法连接到MySQL数据库

**解决**：
```bash
# 1. 检查MySQL是否运行
sudo systemctl status mysqld

# 2. 检查配置是否正确
cat .env.local | grep DB_

# 3. 测试连接
mysql -h localhost -u poetry_user -p poetry_quiz
```

### 问题2：数据库连接成功但没有数据

**原因**：表未创建或数据未导入

**解决**：
```bash
# 检查表是否存在
mysql -u poetry_user -p poetry_quiz -e "SHOW TABLES;"

# 如果表不存在，导入表结构
mysql -u root -p poetry_quiz < database/schema.sql

# 导入题目数据
mysql -u root -p poetry_quiz < database/init_data.sql
```

### 问题3：权限不足错误

**原因**：数据库用户权限不够

**解决**：
```sql
-- 以root登录MySQL
mysql -u root -p

-- 授予权限
GRANT ALL PRIVILEGES ON poetry_quiz.* TO 'poetry_user'@'localhost';
FLUSH PRIVILEGES;
```

### 问题4：想确认当前使用的模式

**检查方法**：

```bash
# 方法1：查看配置
grep USE_LOCAL_STORAGE .env.local

# 方法2：启动应用，观察日志
npm run dev

# 方法3：测试数据存储位置
# 答题后，如果MySQL中有数据，说明使用MySQL模式
mysql -u poetry_user -p poetry_quiz -e "SELECT * FROM answers ORDER BY created_at DESC LIMIT 1;"
```

---

## 📚 相关文档

### 核心文档

- **[STORAGE_MODE_GUIDE.md](./STORAGE_MODE_GUIDE.md)** - 完整的存储模式切换指南
- **[ALIYUN_MYSQL_SETUP.md](./ALIYUN_MYSQL_SETUP.md)** - 阿里云MySQL安装教程
- **[ALIYUN_QUICKSTART.md](./ALIYUN_QUICKSTART.md)** - 5分钟快速部署指南

### 配置文件

- **`.env.mysql.example`** - MySQL模式配置模板
- **`.env.local.example`** - localStorage模式配置模板
- **`setup-mysql-mode.sh`** - 交互式配置脚本

### 数据库文件

- **`database/schema.sql`** - 数据库表结构
- **`database/init_data.sql`** - 50道题目数据
- **`database/visit_logs.sql`** - 访问日志表

---

## ✨ 总结

### 完成的工作

1. ✅ 修改了存储模式判断逻辑（lib/storage.ts）
2. ✅ 创建了MySQL配置模板
3. ✅ 创建了交互式配置脚本
4. ✅ 创建了完整的文档说明
5. ✅ 保留了localStorage模式支持

### 当前状态

- ✅ **默认使用MySQL模式**
- ✅ 需要配置 `.env.local` 文件
- ✅ 可随时切换回localStorage模式
- ✅ 两种模式完全兼容

### 下一步

运行配置脚本开始使用：

```bash
./setup-mysql-mode.sh
```

或查看完整指南：

```bash
cat STORAGE_MODE_GUIDE.md
```

---

**配置状态**: ✅ MySQL模式已启用（需配置 .env.local）
**localStorage模式**: ✅ 保留支持
**文档版本**: v1.0
**更新日期**: 2026-03-06

🎉 现在你的项目默认使用MySQL数据库了！
