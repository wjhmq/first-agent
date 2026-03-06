# 阿里云一键部署快速指南

## 🚀 5分钟快速部署

### 前置条件

✅ 已购买阿里云ECS服务器
✅ 可以SSH连接到服务器
✅ 服务器系统：CentOS 7/8 或 Ubuntu 18.04+

---

## 📦 方式一：一键自动部署（推荐）

### 1. 上传项目到服务器

```bash
# 在本地电脑执行
cd /path/to/first-agent
tar -czf first-agent.tar.gz .
scp first-agent.tar.gz root@your_server_ip:/root/

# 登录服务器
ssh root@your_server_ip

# 解压项目
cd /root
tar -xzf first-agent.tar.gz -C /var/www/poetry-app
cd /var/www/poetry-app
```

### 2. 运行一键部署脚本

```bash
# 赋予执行权限
chmod +x deploy-to-aliyun.sh

# 执行部署
./deploy-to-aliyun.sh
```

### 3. 按提示输入信息

```
MySQL Root用户名 [root]: root
MySQL Root密码: ********

应用用户名 [poetry_user]: poetry_user
应用用户密码 (留空自动生成): (直接回车，自动生成)

是否需要开放MySQL远程访问？(y/n) [n]: n
```

### 4. 部署完成！

脚本会自动：
- ✅ 检查MySQL安装状态
- ✅ 创建数据库 `poetry_quiz`
- ✅ 创建应用用户
- ✅ 导入表结构（schema.sql）
- ✅ 导入50道题目（init_data.sql）
- ✅ 导入访问日志表（visit_logs.sql）
- ✅ 生成配置文件 `.env.production`

---

## 📝 方式二：手动部署

### 1. 安装MySQL

**CentOS系统**：
```bash
wget https://dev.mysql.com/get/mysql80-community-release-el7-7.noarch.rpm
sudo rpm -Uvh mysql80-community-release-el7-7.noarch.rpm
sudo yum install -y mysql-community-server
sudo systemctl start mysqld
sudo systemctl enable mysqld

# 获取临时密码
sudo grep 'temporary password' /var/log/mysqld.log
```

**Ubuntu系统**：
```bash
sudo apt update
sudo apt install -y mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
```

### 2. 配置MySQL安全

```bash
sudo mysql_secure_installation
```

按提示设置root密码和安全选项。

### 3. 创建数据库和用户

```bash
mysql -u root -p
```

在MySQL中执行：

```sql
-- 创建数据库
CREATE DATABASE IF NOT EXISTS poetry_quiz
DEFAULT CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- 创建应用用户
CREATE USER 'poetry_user'@'localhost' IDENTIFIED BY 'YourPassword123!';
GRANT ALL PRIVILEGES ON poetry_quiz.* TO 'poetry_user'@'localhost';
FLUSH PRIVILEGES;

EXIT;
```

### 4. 导入数据

```bash
# 导入表结构
mysql -u root -p poetry_quiz < database/schema.sql

# 导入题库数据
mysql -u root -p poetry_quiz < database/init_data.sql

# 导入访问日志表
mysql -u root -p poetry_quiz < database/visit_logs.sql
```

### 5. 验证数据

```bash
mysql -u root -p -e "SELECT COUNT(*) FROM poetry_quiz.questions;"
# 应该显示：50
```

---

## ⚙️ 启动应用

### 1. 配置环境变量

```bash
# 复制生成的配置文件
cp .env.production .env.local

# 或手动创建
cat > .env.local <<EOF
USE_LOCAL_STORAGE=false

DB_HOST=localhost
DB_PORT=3306
DB_USER=poetry_user
DB_PASSWORD=YourPassword123!
DB_NAME=poetry_quiz

# DeepSeek API（可选）
DEEPSEEK_API_KEY=your_api_key_here
EOF
```

### 2. 安装依赖

```bash
# 安装Node.js（如果没有）
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -  # CentOS
sudo apt-get install -y nodejs  # Ubuntu

# 安装项目依赖
npm install
```

### 3. 构建项目

```bash
npm run build
```

### 4. 启动服务

**方式A：直接启动**
```bash
npm start
# 访问：http://your_server_ip:3000
```

**方式B：使用PM2（推荐生产环境）**
```bash
# 安装PM2
npm install -g pm2

# 启动应用
pm2 start npm --name poetry -- start

# 查看状态
pm2 status

# 查看日志
pm2 logs poetry

# 设置开机自启
pm2 startup
pm2 save
```

---

## 🔒 配置Nginx反向代理（可选）

### 1. 安装Nginx

```bash
# CentOS
sudo yum install -y nginx

# Ubuntu
sudo apt install -y nginx
```

### 2. 配置反向代理

```bash
sudo nano /etc/nginx/conf.d/poetry.conf
```

添加以下内容：

```nginx
server {
    listen 80;
    server_name your_domain.com;  # 替换为你的域名或IP

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 3. 启动Nginx

```bash
# 测试配置
sudo nginx -t

# 启动Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# 重载配置
sudo systemctl reload nginx
```

现在可以通过 `http://your_domain.com` 访问应用！

---

## 🔥 配置防火墙和安全组

### 1. 服务器防火墙

**CentOS (firewalld)**：
```bash
# 开放HTTP端口
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload
```

**Ubuntu (UFW)**：
```bash
# 开放HTTP端口
sudo ufw allow 80/tcp
sudo ufw allow 3000/tcp
sudo ufw reload
```

### 2. 阿里云安全组

登录阿里云控制台：

1. 进入 **ECS控制台**
2. 选择你的实例
3. 点击 **安全组配置**
4. 添加入方向规则：

| 端口范围 | 授权对象 | 协议 | 说明 |
|---------|---------|------|------|
| 80/80 | 0.0.0.0/0 | TCP | HTTP访问 |
| 3000/3000 | 0.0.0.0/0 | TCP | Next.js应用（临时） |
| 443/443 | 0.0.0.0/0 | TCP | HTTPS访问（可选） |

---

## ✅ 验证部署

### 1. 测试数据库连接

```bash
mysql -h localhost -u poetry_user -p poetry_quiz

# 在MySQL中
SELECT COUNT(*) FROM questions;  # 应该返回 50
SELECT COUNT(*) FROM users;      # 应该返回 0
EXIT;
```

### 2. 测试应用访问

```bash
# 本地测试
curl http://localhost:3000

# 外网测试（在本地电脑）
curl http://your_server_ip:3000
```

### 3. 访问页面

打开浏览器访问：
- **首页导航**：http://your_server_ip:3000
- **AI聊天**：http://your_server_ip:3000/chat
- **古诗词答题**：http://your_server_ip:3000/poetry

---

## 📊 查看运行状态

### 应用状态

```bash
# 使用PM2
pm2 status
pm2 logs poetry
pm2 monit

# 直接运行
ps aux | grep node
netstat -tlnp | grep 3000
```

### 数据库状态

```bash
# MySQL服务状态
sudo systemctl status mysqld  # CentOS
sudo systemctl status mysql   # Ubuntu

# 查看连接数
mysql -u root -p -e "SHOW STATUS LIKE 'Threads_connected';"
```

### 访问日志

```sql
-- 查看最近10条访问
mysql -u root -p poetry_quiz -e "
SELECT * FROM visit_logs
ORDER BY timestamp DESC
LIMIT 10;
"

-- 查看各页面访问量
mysql -u root -p poetry_quiz -e "
SELECT page, COUNT(*) as visits
FROM visit_logs
GROUP BY page;
"
```

---

## 🛠️ 常用维护命令

### 应用管理

```bash
# 重启应用
pm2 restart poetry

# 停止应用
pm2 stop poetry

# 删除应用
pm2 delete poetry

# 更新代码后重新部署
git pull  # 如果使用Git
npm install
npm run build
pm2 restart poetry
```

### 数据库备份

```bash
# 备份数据库
mysqldump -u root -p poetry_quiz > poetry_quiz_backup_$(date +%Y%m%d).sql

# 恢复数据库
mysql -u root -p poetry_quiz < poetry_quiz_backup_20260306.sql
```

### 日志管理

```bash
# 查看应用日志
pm2 logs poetry --lines 100

# 查看Nginx日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# 查看MySQL日志
sudo tail -f /var/log/mysqld.log  # CentOS
sudo tail -f /var/log/mysql/error.log  # Ubuntu
```

---

## ⚡ 性能优化建议

### 1. MySQL优化

```sql
-- 添加索引（如果还没有）
USE poetry_quiz;
ALTER TABLE questions ADD INDEX idx_difficulty (difficulty);
ALTER TABLE answers ADD INDEX idx_user_id (user_id);
ALTER TABLE visit_logs ADD INDEX idx_timestamp (timestamp);
```

### 2. 应用优化

```bash
# 使用生产模式
NODE_ENV=production npm start

# 使用PM2集群模式
pm2 start npm --name poetry -i max -- start
```

### 3. Nginx缓存

在nginx配置中添加：

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

---

## 🐛 故障排查

### 应用无法启动

```bash
# 1. 检查端口占用
sudo netstat -tlnp | grep 3000
# 如果被占用，杀死进程
sudo kill -9 <PID>

# 2. 检查数据库连接
mysql -h localhost -u poetry_user -p poetry_quiz

# 3. 查看错误日志
pm2 logs poetry --err
```

### 无法访问页面

```bash
# 1. 检查应用是否运行
pm2 status
curl http://localhost:3000

# 2. 检查防火墙
sudo firewall-cmd --list-ports  # CentOS
sudo ufw status  # Ubuntu

# 3. 检查安全组（阿里云控制台）
```

### 数据库连接失败

```bash
# 1. 检查MySQL是否运行
sudo systemctl status mysqld

# 2. 检查用户权限
mysql -u root -p -e "SHOW GRANTS FOR 'poetry_user'@'localhost';"

# 3. 检查配置文件
cat .env.local
```

---

## 📚 相关文档

- **[完整安装教程](./ALIYUN_MYSQL_SETUP.md)** - 详细的MySQL安装和配置
- **[更新说明](./UPDATE_v1.2.md)** - v1.2版本更新内容
- **[路由优化](./ROUTE_UPDATE_SUMMARY.md)** - 路由结构说明
- **[本地调试](./LOCAL_DEBUG.md)** - 本地开发模式

---

## 📞 获取帮助

### 查看项目状态

```bash
# 系统信息
uname -a
cat /etc/os-release

# 应用状态
pm2 info poetry

# 数据库状态
mysql -V
sudo systemctl status mysqld
```

### 收集诊断信息

```bash
# 生成诊断报告
cat > diagnostic_report.txt <<EOF
=== 系统信息 ===
$(uname -a)
$(cat /etc/os-release)

=== 应用状态 ===
$(pm2 status)

=== 数据库状态 ===
$(sudo systemctl status mysqld 2>&1)

=== 端口监听 ===
$(sudo netstat -tlnp | grep -E '3000|3306')

=== 最近错误日志 ===
$(pm2 logs poetry --lines 20 --nostream 2>&1)
EOF

cat diagnostic_report.txt
```

---

## 🎉 部署完成检查清单

部署完成后，确认以下项目：

- [ ] MySQL已安装并运行
- [ ] 数据库 `poetry_quiz` 已创建
- [ ] 50道题目已导入
- [ ] 用户表、答题表、日志表已创建
- [ ] 应用配置文件 `.env.local` 已配置
- [ ] 应用已构建（npm run build）
- [ ] 应用已启动（PM2或npm start）
- [ ] 可以通过IP访问应用
- [ ] 三个页面都能正常访问（/, /chat, /poetry）
- [ ] 答题功能正常工作
- [ ] 访问日志正常记录
- [ ] 防火墙和安全组已配置
- [ ] （可选）Nginx反向代理已配置
- [ ] （可选）域名解析已配置

---

**快速部署指南版本**: v1.0
**适用项目版本**: v1.2.0
**更新日期**: 2026-03-06
**状态**: ✅ 已测试可用

祝你部署顺利！🚀
