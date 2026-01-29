# 阿里云服务器部署指南

本文档详细说明如何将 DeepSeek Chat 应用部署到阿里云服务器。

## 目录
1. [服务器环境准备](#1-服务器环境准备)
2. [安装必要软件](#2-安装必要软件)
3. [项目部署](#3-项目部署)
4. [配置 Nginx](#4-配置-nginx)
5. [配置 PM2 进程管理](#5-配置-pm2-进程管理)
6. [配置域名和 SSL](#6-配置域名和-ssl-可选)
7. [常用维护命令](#7-常用维护命令)

---

## 1. 服务器环境准备

### 1.1 连接到阿里云服务器

```bash
ssh root@your_server_ip
# 或者使用指定的用户名
ssh username@your_server_ip
```

### 1.2 更新系统软件包

```bash
# Ubuntu/Debian 系统
sudo apt update
sudo apt upgrade -y

# CentOS/AliyunOS 系统
sudo yum update -y
```

### 1.3 创建部署用户(可选但推荐)

```bash
# 创建新用户
sudo adduser deploy

# 添加到 sudo 组
sudo usermod -aG sudo deploy

# 切换到部署用户
su - deploy
```

---

## 2. 安装必要软件

### 2.1 安装 Node.js (推荐 v20 或更高版本)

```bash
# 使用 nvm 安装 Node.js (推荐)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 重新加载配置
source ~/.bashrc
# 或
source ~/.zshrc

# 安装 Node.js 20
nvm install 20
nvm use 20
nvm alias default 20

# 验证安装
node -v
npm -v
```

**或者使用官方源安装:**

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS/AliyunOS
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs
```

### 2.2 安装 Git

```bash
# Ubuntu/Debian
sudo apt install git -y

# CentOS/AliyunOS
sudo yum install git -y

# 验证安装
git --version
```

### 2.3 安装 PM2 (进程管理器)

```bash
npm install -g pm2

# 验证安装
pm2 -v
```

### 2.4 安装 Nginx (反向代理服务器)

```bash
# Ubuntu/Debian
sudo apt install nginx -y

# CentOS/AliyunOS
sudo yum install nginx -y

# 启动 Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# 验证安装
nginx -v
```

---

## 3. 项目部署

### 3.1 创建项目目录

```bash
# 创建项目根目录
sudo mkdir -p /var/www
sudo chown -R $USER:$USER /var/www
cd /var/www
```

### 3.2 克隆项目代码

**方式1: 从 Git 仓库克隆**
```bash
# 如果项目已上传到 Git 仓库
git clone <your-git-repository-url> deepseek-chat
cd deepseek-chat
```

**方式2: 从本地上传**
```bash
# 在本地机器上执行
# 确保先构建项目
npm install
npm run build

# 压缩项目文件
tar -czf deepseek-chat.tar.gz \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=.next \
  .

# 上传到服务器
scp deepseek-chat.tar.gz username@your_server_ip:/var/www/

# 在服务器上解压
cd /var/www
tar -xzf deepseek-chat.tar.gz -C deepseek-chat
cd deepseek-chat
```

### 3.3 安装项目依赖

```bash
cd /var/www/deepseek-chat

# 安装生产环境依赖
npm install --production

# 或者安装全部依赖
npm install
```

### 3.4 配置环境变量

```bash
# 创建 .env.local 文件
nano .env.local
# 或使用 vim
vim .env.local
```

添加以下内容:
```env
DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

保存并退出 (nano: Ctrl+X, Y, Enter; vim: Esc, :wq, Enter)

### 3.5 构建项目

```bash
npm run build
```

### 3.6 测试运行

```bash
# 测试运行
npm start

# 检查是否能在 http://localhost:3000 访问
curl http://localhost:3000
```

---

## 4. 配置 Nginx

### 4.1 创建 Nginx 配置文件

```bash
sudo nano /etc/nginx/sites-available/deepseek-chat
```

添加以下配置:

```nginx
server {
    listen 80;
    server_name your_domain.com;  # 替换为你的域名或服务器 IP

    # 客户端上传大小限制
    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # SSE 支持
        proxy_buffering off;
        proxy_read_timeout 86400;
    }
}
```

### 4.2 启用站点配置

```bash
# Ubuntu/Debian (使用 sites-enabled)
sudo ln -s /etc/nginx/sites-available/deepseek-chat /etc/nginx/sites-enabled/

# CentOS/AliyunOS (直接修改主配置)
# 如果没有 sites-available 目录,可以将配置直接放在 /etc/nginx/conf.d/
sudo cp /etc/nginx/sites-available/deepseek-chat /etc/nginx/conf.d/deepseek-chat.conf
```

### 4.3 测试并重启 Nginx

```bash
# 测试配置文件
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx

# 检查状态
sudo systemctl status nginx
```

---

## 5. 配置 PM2 进程管理

### 5.1 创建 PM2 配置文件

```bash
cd /var/www/deepseek-chat
nano ecosystem.config.js
```

添加以下内容:

```javascript
module.exports = {
  apps: [{
    name: 'deepseek-chat',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
```

### 5.2 创建日志目录

```bash
mkdir -p logs
```

### 5.3 启动应用

```bash
# 使用 PM2 启动
pm2 start ecosystem.config.js

# 查看应用状态
pm2 status

# 查看日志
pm2 logs deepseek-chat

# 查看详细信息
pm2 info deepseek-chat
```

### 5.4 设置 PM2 开机自启

```bash
# 生成启动脚本
pm2 startup

# 会输出一条命令,复制执行该命令
# 例如: sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u username --hp /home/username

# 保存当前 PM2 进程列表
pm2 save
```

---

## 6. 配置域名和 SSL (可选)

### 6.1 配置域名解析

在你的域名注册商处,添加 A 记录:
- 主机记录: @ 或 www
- 记录类型: A
- 记录值: 你的服务器公网 IP

### 6.2 安装 Certbot (Let's Encrypt SSL)

```bash
# Ubuntu/Debian
sudo apt install certbot python3-certbot-nginx -y

# CentOS/AliyunOS
sudo yum install certbot python3-certbot-nginx -y
```

### 6.3 获取 SSL 证书

```bash
# 自动配置 Nginx SSL
sudo certbot --nginx -d your_domain.com -d www.your_domain.com

# 按照提示输入邮箱并同意服务条款
```

### 6.4 设置自动续期

```bash
# 测试续期
sudo certbot renew --dry-run

# Certbot 会自动添加续期的 cron job
# 可以查看
sudo systemctl status certbot.timer
```

---

## 7. 常用维护命令

### 7.1 PM2 常用命令

```bash
# 查看所有应用
pm2 list

# 查看应用状态
pm2 status

# 查看日志
pm2 logs deepseek-chat
pm2 logs deepseek-chat --lines 100

# 重启应用
pm2 restart deepseek-chat

# 停止应用
pm2 stop deepseek-chat

# 删除应用
pm2 delete deepseek-chat

# 查看应用详细信息
pm2 info deepseek-chat

# 监控应用
pm2 monit
```

### 7.2 更新部署

```bash
cd /var/www/deepseek-chat

# 拉取最新代码
git pull

# 安装依赖
npm install

# 重新构建
npm run build

# 重启应用
pm2 restart deepseek-chat

# 查看日志确认启动成功
pm2 logs deepseek-chat
```

### 7.3 Nginx 常用命令

```bash
# 测试配置
sudo nginx -t

# 重启
sudo systemctl restart nginx

# 重新加载配置(不停机)
sudo systemctl reload nginx

# 查看状态
sudo systemctl status nginx

# 查看错误日志
sudo tail -f /var/log/nginx/error.log

# 查看访问日志
sudo tail -f /var/log/nginx/access.log
```

### 7.4 防火墙配置

```bash
# Ubuntu (UFW)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
sudo ufw status

# CentOS (Firewalld)
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --reload
sudo firewall-cmd --list-all
```

### 7.5 阿里云安全组配置

确保在阿里云控制台配置安全组规则:
- 入方向规则添加:
  - 端口 80 (HTTP)
  - 端口 443 (HTTPS)
  - 端口 22 (SSH)

---

## 8. 故障排查

### 8.1 应用无法启动

```bash
# 查看详细日志
pm2 logs deepseek-chat --lines 200

# 检查端口占用
sudo lsof -i :3000
# 或
sudo netstat -tlnp | grep 3000

# 检查环境变量
pm2 env deepseek-chat
```

### 8.2 Nginx 502 错误

```bash
# 检查应用是否运行
pm2 status

# 检查端口是否正确
curl http://localhost:3000

# 查看 Nginx 错误日志
sudo tail -f /var/log/nginx/error.log
```

### 8.3 内存不足

```bash
# 查看内存使用
free -h

# 查看 PM2 进程内存
pm2 monit

# 重启应用释放内存
pm2 restart deepseek-chat
```

### 8.4 查看系统资源

```bash
# CPU 和内存使用
htop
# 或
top

# 磁盘使用
df -h

# 查看进程
ps aux | grep node
```

---

## 9. 性能优化建议

### 9.1 启用 Gzip 压缩

在 Nginx 配置中添加:
```nginx
gzip on;
gzip_vary on;
gzip_min_length 10240;
gzip_proxied expired no-cache no-store private auth;
gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
gzip_disable "MSIE [1-6]\.";
```

### 9.2 配置缓存

在 Nginx 配置中添加静态资源缓存:
```nginx
location /_next/static {
    alias /var/www/deepseek-chat/.next/static;
    expires 365d;
    access_log off;
}

location /static {
    alias /var/www/deepseek-chat/public;
    expires 30d;
    access_log off;
}
```

### 9.3 配置日志轮转

```bash
# 创建日志轮转配置
sudo nano /etc/logrotate.d/deepseek-chat
```

添加:
```
/var/www/deepseek-chat/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

---

## 10. 备份策略

### 10.1 创建备份脚本

```bash
nano ~/backup.sh
```

添加:
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/deepseek-chat"
APP_DIR="/var/www/deepseek-chat"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# 备份代码和配置
tar -czf $BACKUP_DIR/app_$DATE.tar.gz \
  --exclude=$APP_DIR/node_modules \
  --exclude=$APP_DIR/.next \
  --exclude=$APP_DIR/logs \
  $APP_DIR

# 只保留最近7天的备份
find $BACKUP_DIR -name "app_*.tar.gz" -mtime +7 -delete

echo "Backup completed: app_$DATE.tar.gz"
```

设置权限并添加定时任务:
```bash
chmod +x ~/backup.sh

# 添加 cron job (每天凌晨2点备份)
crontab -e
# 添加: 0 2 * * * /home/username/backup.sh
```

---

## 部署完成检查清单

- [ ] Node.js 已安装 (v20+)
- [ ] Git 已安装
- [ ] PM2 已安装并配置
- [ ] Nginx 已安装并配置
- [ ] 项目代码已部署到 /var/www/deepseek-chat
- [ ] .env.local 文件已配置
- [ ] 项目已构建 (npm run build)
- [ ] PM2 应用已启动并设置开机自启
- [ ] Nginx 配置已生效
- [ ] 防火墙和安全组已配置
- [ ] 域名已解析 (如果使用域名)
- [ ] SSL 证书已安装 (如果使用 HTTPS)
- [ ] 访问网站确认正常运行

---

## 联系和支持

如遇到问题,请检查:
1. PM2 日志: `pm2 logs deepseek-chat`
2. Nginx 日志: `sudo tail -f /var/log/nginx/error.log`
3. 系统日志: `sudo journalctl -xe`

祝部署顺利!
