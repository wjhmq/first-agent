# 阿里云服务器部署指南

本文档详细说明如何将 DeepSeek Chat 应用部署到阿里云服务器。

> 📌 **更新提示：** 如果您的服务已经部署，需要更新代码，请查看 [UPDATE_DEPLOY.md](./UPDATE_DEPLOY.md) 文档。

## 目录
1. [服务器环境准备](#1-服务器环境准备)
2. [安装必要软件](#2-安装必要软件)
3. [项目部署](#3-项目部署)
4. [配置 Nginx](#4-配置-nginx)
5. [配置 PM2 进程管理](#5-配置-pm2-进程管理)
6. [配置域名和 SSL](#6-配置域名和-ssl-可选)
7. [常用维护命令](#7-常用维护命令)
8. [代码更新部署](#8-代码更新部署) ⭐ 新增

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
apt update
apt upgrade -y

# CentOS/AliyunOS 系统
yum update -y
```

---

## 2. 安装必要软件

### 2.1 安装 Node.js (推荐 v20 或更高版本)

**推荐方式 - 使用官方源安装:**

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# CentOS/AliyunOS
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
yum install -y nodejs

# 验证安装
node -v
npm -v
```

**或者使用 nvm 安装 (可选):**

```bash
# 安装 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 重新加载配置
source ~/.bashrc

# 安装 Node.js 20
nvm install 20
nvm use 20
nvm alias default 20

# 验证安装
node -v
npm -v
```

### 2.2 安装 Git

```bash
# Ubuntu/Debian
apt install git -y

# CentOS/AliyunOS
yum install git -y

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
apt install nginx -y

# CentOS/AliyunOS
yum install nginx -y

# 启动 Nginx
systemctl start nginx
systemctl enable nginx

# 验证安装
nginx -v
```

---

## 3. 项目部署

### 3.1 创建项目目录

```bash
# 创建项目根目录
mkdir -p /var/www
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
# 压缩项目文件(排除不必要的文件和配置文件)
tar -czf deepseek-chat.tar.gz \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=.next \
  --exclude=.env.local \
  --exclude=ecosystem.config.js \
  --exclude=logs \
  .

# 上传到服务器
scp deepseek-chat.tar.gz root@your_server_ip:/var/www/

# 在服务器上解压
cd /var/www
mkdir -p deepseek-chat
tar -xzf deepseek-chat.tar.gz -C deepseek-chat
cd deepseek-chat

# ⚠️ 重要提示：解压后需要手动创建配置文件
# 因为打包时已排除 .env.local 和 ecosystem.config.js
# 请继续按照下面的步骤配置环境变量
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
# 测试运行(仅用于测试,不用于生产环境)
npm start

# 检查是否能在 http://localhost:3000 访问
curl http://localhost:3000

# 测试成功后,按 Ctrl+C 停止测试
```

> **注意**: 直接使用 `npm start` 运行的服务会在退出终端后停止。

**快速解决方案 - 如果不想现在配置 PM2,可以使用以下任一方法:**

#### 方法 1: 使用 nohup (最简单)
```bash
# 后台运行应用,输出重定向到日志文件
nohup npm start > /var/www/deepseek-chat/app.log 2>&1 &

# 查看进程
ps aux | grep node

# 查看日志
tail -f /var/www/deepseek-chat/app.log

# 停止应用(需要找到进程ID)
ps aux | grep node
kill <进程ID>
```

#### 方法 2: 使用 & 和 disown
```bash
# 启动应用并放到后台
npm start &

# 将后台任务脱离当前终端
disown

# 或者一行命令
npm start > /var/www/deepseek-chat/app.log 2>&1 & disown
```

#### 方法 3: 直接使用 systemd 服务
```bash
# 创建 systemd 服务文件
nano /etc/systemd/system/deepseek-chat.service
```

添加以下内容:
```ini
[Unit]
Description=DeepSeek Chat Application
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/deepseek-chat
Environment=NODE_ENV=production
Environment=PORT=3000
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=10
StandardOutput=append:/var/www/deepseek-chat/logs/app.log
StandardError=append:/var/www/deepseek-chat/logs/error.log

[Install]
WantedBy=multi-user.target
```

启动服务:
```bash
# 创建日志目录
mkdir -p /var/www/deepseek-chat/logs

# 重新加载 systemd 配置
systemctl daemon-reload

# 启动服务
systemctl start deepseek-chat

# 设置开机自启
systemctl enable deepseek-chat

# 查看状态
systemctl status deepseek-chat

# 查看日志
journalctl -u deepseek-chat -f

# 重启服务
systemctl restart deepseek-chat

# 停止服务
systemctl stop deepseek-chat
```

> **推荐**: 生产环境最好使用 **PM2** 或 **systemd 服务** 的方式,因为它们提供了自动重启、日志管理等完善的功能。nohup 适合临时快速部署。

---

## 4. 配置 Nginx

### 4.1 创建 Nginx 配置文件

**步骤 1: 检查并创建配置目录**

```bash
# 检查 sites-available 目录是否存在
ls -la /etc/nginx/sites-available/

# 如果提示目录不存在,先创建目录
mkdir -p /etc/nginx/sites-available/
mkdir -p /etc/nginx/sites-enabled/
```

**步骤 2: 创建配置文件**

**方法 A - 使用 cat 命令直接创建(推荐,最简单):**

```bash
cat > /etc/nginx/sites-available/deepseek-chat << 'EOF'
server {
    listen 80;
    server_name www.wangjinfe.com wangjinfe.com;

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

        proxy_buffering off;
        proxy_read_timeout 86400;
    }
}
EOF
```

> **注意**:
> - 复制时确保包含 `EOF` 最后一行
> - 粘贴后按**回车键**执行
> - 如果没有任何输出说明成功了

**方法 B - 使用 nano 编辑器:**

```bash
nano /etc/nginx/sites-available/deepseek-chat
# 粘贴下面的配置内容
# 保存: Ctrl+O 然后回车
# 退出: Ctrl+X
```

**方法 C - 使用 vim 编辑器:**

```bash
vim /etc/nginx/sites-available/deepseek-chat
# 按 i 进入插入模式
# 粘贴配置内容
# 按 Esc 退出插入模式
# 输入 :wq 保存并退出
```

> **重要提示**:
> - 如果使用 vim 遇到 "E212: Can't open file for writing" 错误,说明目录不存在或没有权限
> - 按 `Esc` 然后输入 `:q!` 退出 vim,先执行上面的 `mkdir -p` 命令创建目录
> - 建议直接使用**方法 A**,一条命令搞定

**验证配置文件已创建:**

```bash
# 查看配置文件内容
cat /etc/nginx/sites-available/deepseek-chat

# 检查文件是否存在
ls -l /etc/nginx/sites-available/deepseek-chat
```

**如果 cat 命令还是不行,使用这个替代方法:**

```bash
# 方法 1: 分步创建
echo "server {" > /etc/nginx/sites-available/deepseek-chat
echo "    listen 80;" >> /etc/nginx/sites-available/deepseek-chat
echo "    server_name www.wangjinfe.com wangjinfe.com;" >> /etc/nginx/sites-available/deepseek-chat
echo "" >> /etc/nginx/sites-available/deepseek-chat
echo "    client_max_body_size 10M;" >> /etc/nginx/sites-available/deepseek-chat
echo "" >> /etc/nginx/sites-available/deepseek-chat
echo "    location / {" >> /etc/nginx/sites-available/deepseek-chat
echo "        proxy_pass http://localhost:3000;" >> /etc/nginx/sites-available/deepseek-chat
echo "        proxy_http_version 1.1;" >> /etc/nginx/sites-available/deepseek-chat
echo "        proxy_set_header Upgrade \$http_upgrade;" >> /etc/nginx/sites-available/deepseek-chat
echo "        proxy_set_header Connection 'upgrade';" >> /etc/nginx/sites-available/deepseek-chat
echo "        proxy_set_header Host \$host;" >> /etc/nginx/sites-available/deepseek-chat
echo "        proxy_set_header X-Real-IP \$remote_addr;" >> /etc/nginx/sites-available/deepseek-chat
echo "        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;" >> /etc/nginx/sites-available/deepseek-chat
echo "        proxy_set_header X-Forwarded-Proto \$scheme;" >> /etc/nginx/sites-available/deepseek-chat
echo "        proxy_cache_bypass \$http_upgrade;" >> /etc/nginx/sites-available/deepseek-chat
echo "" >> /etc/nginx/sites-available/deepseek-chat
echo "        proxy_buffering off;" >> /etc/nginx/sites-available/deepseek-chat
echo "        proxy_read_timeout 86400;" >> /etc/nginx/sites-available/deepseek-chat
echo "    }" >> /etc/nginx/sites-available/deepseek-chat
echo "}" >> /etc/nginx/sites-available/deepseek-chat

# 验证文件内容
cat /etc/nginx/sites-available/deepseek-chat
```

```bash
# 方法 2: 使用 tee 命令
tee /etc/nginx/sites-available/deepseek-chat > /dev/null << 'EOF'
server {
    listen 80;
    server_name www.wangjinfe.com wangjinfe.com;

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

        proxy_buffering off;
        proxy_read_timeout 86400;
    }
}
EOF
```

### 4.2 启用站点配置

```bash
# Ubuntu/Debian (使用 sites-enabled)
ln -s /etc/nginx/sites-available/deepseek-chat /etc/nginx/sites-enabled/

# CentOS/AliyunOS (直接修改主配置)
# 如果没有 sites-available 目录,可以将配置直接放在 /etc/nginx/conf.d/
cp /etc/nginx/sites-available/deepseek-chat /etc/nginx/conf.d/deepseek-chat.conf
```

### 4.3 测试并重启 Nginx

```bash
# 测试配置文件
nginx -t

# 重启 Nginx
systemctl restart nginx

# 检查状态
systemctl status nginx
```

---

## 5. 配置 PM2 进程管理

> **重要**: PM2 是一个进程管理器,可以让 Node.js 应用在后台持续运行。使用 PM2 后,即使退出 SSH 终端,应用也会继续运行。

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
# 使用 PM2 启动应用
pm2 start ecosystem.config.js

# 查看应用状态(确认状态为 online)
pm2 status

# 查看实时日志
pm2 logs deepseek-chat

# 查看详细信息
pm2 info deepseek-chat
```

> **验证**: 执行 `pm2 status` 后,如果看到应用状态为 `online`,说明应用已成功启动并在后台运行。

### 5.4 设置 PM2 开机自启 (重要!)

> **关键步骤**: 这一步确保服务器重启后应用自动启动,以及退出终端后应用持续运行。

```bash
# 1. 生成启动脚本
pm2 startup
```

执行后,PM2 会自动完成配置并显示类似以下信息:
```
[PM2] Init System found: systemd
[PM2] Writing init configuration in /etc/systemd/system/pm2-root.service
[PM2] Making script booting at startup...
[PM2] [v] Command successfully executed.
+---------------------------------------+
[PM2] Freeze a process list on reboot via:
$ pm2 save
```

> **重要**: 如果 PM2 输出了一条 `sudo env PATH=...` 命令,需要复制并执行那条命令。但如果直接显示成功(如上所示),则可以跳过。

```bash
# 2. 保存当前 PM2 进程列表 (必须执行!)
pm2 save
```

执行后会看到:
```
[PM2] Saving current process list...
[PM2] Successfully saved in /root/.pm2/dump.pm2
```

```bash
# 3. 验证配置
systemctl status pm2-root

# 4. 查看保存的应用列表
pm2 list
```

**说明:**
- `pm2 startup`: 创建系统服务 `/etc/systemd/system/pm2-root.service`,确保开机自启
- `pm2 save`: 保存当前运行的应用列表到 `/root/.pm2/dump.pm2`
- 完成后,即使退出 SSH 终端或重启服务器,应用都会自动运行

**测试退出终端:**
```bash
# 1. 确认应用正在运行
pm2 list

# 2. 退出 SSH 终端
exit

# 3. 重新连接服务器后检查
pm2 list
# 应用仍然显示为 online 状态
```

**测试服务器重启 (可选):**
```bash
# 重启服务器
reboot

# 重新连接后检查
pm2 list
# 应用会自动启动
```

### 5.5 其他后台运行方案 (备选)

如果不使用 PM2,也可以使用以下方式让应用后台运行:

#### 方案 1: 使用 nohup

```bash
# 使用 nohup 启动应用
nohup npm start > /var/www/deepseek-chat/logs/app.log 2>&1 &

# 查看进程
ps aux | grep node

# 查看日志
tail -f /var/www/deepseek-chat/logs/app.log
```

#### 方案 2: 使用 screen

```bash
# 安装 screen
apt install screen -y  # Ubuntu/Debian
yum install screen -y  # CentOS

# 创建一个新的 screen 会话
screen -S deepseek-chat

# 在 screen 中启动应用
cd /var/www/deepseek-chat
npm start

# 按 Ctrl+A 然后按 D 来分离会话 (应用继续运行)

# 重新连接到会话
screen -r deepseek-chat

# 查看所有会话
screen -ls
```

#### 方案 3: 使用 tmux

```bash
# 安装 tmux
apt install tmux -y  # Ubuntu/Debian
yum install tmux -y  # CentOS

# 创建新会话
tmux new -s deepseek-chat

# 启动应用
cd /var/www/deepseek-chat
npm start

# 按 Ctrl+B 然后按 D 来分离会话

# 重新连接
tmux attach -t deepseek-chat

# 查看所有会话
tmux ls
```

> **推荐**: 生产环境强烈建议使用 **PM2**,因为它提供了自动重启、日志管理、负载均衡等功能。

---

## 6. 配置域名和 HTTPS (使用阿里云 SSL 证书)

### 6.1 配置域名解析

在阿里云域名控制台,添加 A 记录:
- **主机记录**: @ (代表根域名 wangjinfe.com)
- **主机记录**: www (代表 www.wangjinfe.com)
- **记录类型**: A
- **记录值**: 你的阿里云服务器公网 IP 地址
- **TTL**: 10分钟

### 6.2 申请阿里云免费 SSL 证书

1. 登录阿里云控制台
2. 进入「SSL 证书」服务
3. 点击「免费证书」-> 「立即购买」
4. 选择「DV 单域名证书(免费)」
5. 购买后在「证书管理」中点击「证书申请」
6. 填写域名信息(如 www.wangjinfe.com 或 wangjinfe.com)
7. 选择「DNS 验证」或「文件验证」完成域名验证
8. 等待证书签发(通常几分钟内完成)

### 6.3 下载阿里云 SSL 证书

证书签发后:
1. 在证书列表中找到你的证书
2. 点击「下载」
3. 选择「Nginx」服务器类型下载
4. 会下载一个 zip 文件,包含两个文件:
   - `xxx.pem` 或 `xxx.crt` (证书文件)
   - `xxx.key` (私钥文件)

### 6.4 上传证书到服务器 ⚠️ 重要步骤!

> **关键提示**: 必须先上传证书文件,再配置 Nginx HTTPS,否则会报错!

#### 方法 1: 在服务器上直接创建证书文件 (推荐)

```bash
# 1. 创建 SSL 证书目录
mkdir -p /etc/nginx/ssl
cd /etc/nginx/ssl

# 2. 创建证书文件
nano www.wangjinfe.com.pem
```

**粘贴证书内容** (从阿里云下载的 .pem 或 .crt 文件内容):
```
-----BEGIN CERTIFICATE-----
MIIFxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
... (证书内容) ...
-----END CERTIFICATE-----
```

保存: `Ctrl+O`, 回车, `Ctrl+X`

```bash
# 3. 创建私钥文件
nano www.wangjinfe.com.key
```

**粘贴私钥内容** (从阿里云下载的 .key 文件内容):
```
-----BEGIN PRIVATE KEY-----
或
-----BEGIN RSA PRIVATE KEY-----
MIIEvxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
... (私钥内容) ...
-----END PRIVATE KEY-----
或
-----END RSA PRIVATE KEY-----
```

保存: `Ctrl+O`, 回车, `Ctrl+X`

```bash
# 4. 设置文件权限 (重要!)
chmod 644 /etc/nginx/ssl/wangjinfe.com.pem
chmod 600 /etc/nginx/ssl/wangjinfe.com.key

# 5. 验证文件已创建
ls -lh /etc/nginx/ssl/

# 6. 验证证书内容 (应该看到 BEGIN CERTIFICATE)
head -2 /etc/nginx/ssl/wangjinfe.com.pem

# 7. 验证私钥内容 (应该看到 BEGIN PRIVATE KEY 或 BEGIN RSA PRIVATE KEY)
head -2 /etc/nginx/ssl/wangjinfe.com.key
```

#### 方法 2: 从本地上传到服务器

**在本地电脑上执行:**
```bash
# 1. 解压阿里云下载的证书文件
unzip your-certificate.zip

# 2. 查看文件
ls -la
# 应该看到两个文件: xxx.pem (或 .crt) 和 xxx.key

# 3. 先在服务器上创建目录
ssh root@your_server_ip "mkdir -p /etc/nginx/ssl"

# 4. 上传证书文件
scp your-domain.pem root@your_server_ip:/etc/nginx/ssl/wangjinfe.com.pem
scp your-domain.key root@your_server_ip:/etc/nginx/ssl/wangjinfe.com.key

# 5. 设置权限
ssh root@your_server_ip "chmod 644 /etc/nginx/ssl/wangjinfe.com.pem && chmod 600 /etc/nginx/ssl/wangjinfe.com.key"
```

#### 验证证书文件正确性

```bash
# 验证证书文件格式
openssl x509 -in /etc/nginx/ssl/wangjinfe.com.pem -text -noout

# 验证私钥文件格式
openssl rsa -in /etc/nginx/ssl/wangjinfe.com.key -check

# 验证证书和私钥是否匹配
openssl x509 -noout -modulus -in /etc/nginx/ssl/wangjinfe.com.pem | openssl md5
openssl rsa -noout -modulus -in /etc/nginx/ssl/wangjinfe.com.key | openssl md5
# 两个输出应该完全相同
```

### 6.5 配置 Nginx 支持 HTTPS

修改 Nginx 配置文件,添加 HTTPS 支持:

```bash
# 备份原配置
cp /etc/nginx/sites-available/deepseek-chat /etc/nginx/sites-available/deepseek-chat.bak 2>/dev/null
```

**使用 tee 命令创建 HTTPS 配置(推荐):**

```bash
tee /etc/nginx/sites-available/deepseek-chat > /dev/null << 'EOF'
# HTTP 服务器 - 重定向到 HTTPS
server {
    listen 80;
    server_name www.wangjinfe.com wangjinfe.com;

    # 重定向所有 HTTP 请求到 HTTPS
    return 301 https://$server_name$request_uri;
}

# HTTPS 服务器
server {
    listen 443 ssl http2;
    server_name www.wangjinfe.com wangjinfe.com;

    # SSL 证书配置
    ssl_certificate /etc/nginx/ssl/www.wangjinfe.com.pem;
    ssl_certificate_key /etc/nginx/ssl/www.wangjinfe.com.key;

    # SSL 安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # 客户端上传大小限制
    client_max_body_size 10M;

    # 代理到 Node.js 应用
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
EOF
```

**验证配置文件已创建:**

```bash
# 查看配置文件内容
cat /etc/nginx/sites-available/deepseek-chat

# 检查文件大小和权限
ls -lh /etc/nginx/sites-available/deepseek-chat
```

**备选方法 - 使用 cat 命令:**

```bash
cat > /etc/nginx/sites-available/deepseek-chat << 'EOF'
# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name www.wangjinfe.com wangjinfe.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS 服务器
server {
    listen 443 ssl http2;
    server_name www.wangjinfe.com wangjinfe.com;

    # SSL 证书配置
    ssl_certificate /etc/nginx/ssl/wangjinfe.com.pem;
    ssl_certificate_key /etc/nginx/ssl/wangjinfe.com.key;

    # SSL 安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

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

        proxy_buffering off;
        proxy_read_timeout 86400;
    }
}
EOF
```

**备选方法 - 使用 nano 编辑器:**

```bash
nano /etc/nginx/sites-available/deepseek-chat
# 粘贴上面的配置内容
# 保存: Ctrl+O, 回车, Ctrl+X
```

### 6.6 测试并重启 Nginx



```bash

# 启用 Nginx 配置
cp /etc/nginx/sites-available/deepseek-chat /etc/nginx/conf.d/deepseek-chat.conf
# 测试 Nginx 配置
nginx -t

# 如果测试通过,重启 Nginx
systemctl restart nginx

# 查看 Nginx 状态
systemctl status nginx
```

### 6.7 配置防火墙开放 HTTPS 端口

```bash
# Ubuntu (UFW)
ufw allow 443/tcp
ufw status

# CentOS (Firewalld)
firewall-cmd --permanent --add-service=https
firewall-cmd --reload
firewall-cmd --list-all
```

**阿里云安全组配置:**
- 登录阿里云控制台
- 进入「云服务器 ECS」-> 「安全组」
- 添加入方向规则:
  - 端口范围: 443/443
  - 授权对象: 0.0.0.0/0
  - 描述: HTTPS

### 6.8 验证 HTTPS 配置

```bash
# 测试 HTTP 重定向
curl -I http://wangjinfe.com

# 测试 HTTPS 访问
curl -I https://wangjinfe.com

# 查看证书信息
openssl s_client -connect wangjinfe.com:443 -servername wangjinfe.com < /dev/null
```

**在浏览器中访问:**
- 访问 `https://wangjinfe.com` 或 `https://www.wangjinfe.com`
- 查看地址栏是否显示小锁图标
- 点击小锁查看证书信息

### 6.9 证书更新说明

> **注意**: 阿里云免费 SSL 证书有效期为 1 年,到期前需要:
> 1. 在阿里云控制台重新申请免费证书
> 2. 下载新证书
> 3. 替换服务器上的证书文件
> 4. 重启 Nginx: `systemctl restart nginx`

```bash
# 查看证书到期时间
openssl x509 -in /etc/nginx/ssl/wangjinfe.com.pem -noout -dates

# 更新证书时的操作
cd /etc/nginx/ssl
# 备份旧证书
mv wangjinfe.com.pem wangjinfe.com.pem.old
mv wangjinfe.com.key wangjinfe.com.key.old
# 上传新证书后重启
systemctl restart nginx
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

> **重要提示**: 项目更新时需要保护配置文件,避免被覆盖!

#### 方法 1: Git 方式更新(推荐)

```bash
cd /var/www/deepseek-chat

# 1. 备份配置文件(首次更新时执行)
cp .env.local .env.local.backup
cp ecosystem.config.js ecosystem.config.js.backup

# 2. 拉取最新代码
git pull

# 3. 恢复配置文件(如果被覆盖)
if [ ! -f .env.local ]; then
    cp .env.local.backup .env.local
fi

# 4. 安装依赖
npm install

# 5. 重新构建
npm run build

# 6. 重启应用
pm2 restart deepseek-chat

# 7. 查看日志确认启动成功
pm2 logs deepseek-chat --lines 50
```

#### 方法 2: 上传压缩包方式更新

**在本地机器上:**
```bash
# 1. 打包最新代码(排除配置文件和构建产物) ⚠️ 非常重要！
tar -czf deepseek-chat-update.tar.gz \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=.next \
  --exclude=.env.local \
  --exclude=ecosystem.config.js \
  --exclude=logs \
  --exclude=deepseek-chat.tar.gz \
  .

# 2. 上传到服务器
scp deepseek-chat-update.tar.gz root@your_server_ip:/tmp/
```

**在服务器上:**
```bash
# 3. 备份配置文件
cd /var/www/deepseek-chat
cp .env.local /tmp/env.local.backup
cp ecosystem.config.js /tmp/ecosystem.config.js.backup

# 4. 备份当前版本(可选但推荐)
cd /var/www
tar -czf deepseek-chat-backup-$(date +%Y%m%d-%H%M%S).tar.gz \
  --exclude=deepseek-chat/node_modules \
  --exclude=deepseek-chat/.next \
  deepseek-chat/

# 5. 解压新代码(会保留未打包的文件)
cd /var/www/deepseek-chat
tar -xzf /tmp/deepseek-chat-update.tar.gz

# 6. 确认配置文件存在
ls -la .env.local ecosystem.config.js

# 7. 如果配置文件被删除,恢复它们
if [ ! -f .env.local ]; then
    cp /tmp/env.local.backup .env.local
fi
if [ ! -f ecosystem.config.js ]; then
    cp /tmp/ecosystem.config.js.backup ecosystem.config.js
fi

# 8. 安装依赖
npm install

# 9. 重新构建
npm run build

# 10. 重启应用
pm2 restart deepseek-chat

# 11. 查看日志
pm2 logs deepseek-chat --lines 50

# 12. 清理临时文件
rm /tmp/deepseek-chat-update.tar.gz
```

#### 方法 3: 使用脚本自动更新

创建更新脚本:
```bash
nano /root/update-app.sh
```

添加以下内容:
```bash
#!/bin/bash

APP_DIR="/var/www/deepseek-chat"
BACKUP_DIR="/var/backups/deepseek-chat"
DATE=$(date +%Y%m%d-%H%M%S)

echo "================================"
echo "开始更新应用: $DATE"
echo "================================"

# 1. 创建备份目录
mkdir -p $BACKUP_DIR

# 2. 备份配置文件
echo "备份配置文件..."
cp $APP_DIR/.env.local $BACKUP_DIR/.env.local.$DATE
cp $APP_DIR/ecosystem.config.js $BACKUP_DIR/ecosystem.config.js.$DATE

# 3. 备份当前版本
echo "备份当前版本..."
cd /var/www
tar -czf $BACKUP_DIR/app-backup-$DATE.tar.gz \
  --exclude=deepseek-chat/node_modules \
  --exclude=deepseek-chat/.next \
  --exclude=deepseek-chat/logs \
  deepseek-chat/

# 4. 进入项目目录
cd $APP_DIR

# 5. 拉取最新代码 (Git 方式)
echo "拉取最新代码..."
git pull

# 或解压新代码 (压缩包方式)
# tar -xzf /tmp/deepseek-chat-update.tar.gz

# 6. 恢复配置文件
echo "恢复配置文件..."
cp $BACKUP_DIR/.env.local.$DATE $APP_DIR/.env.local
cp $BACKUP_DIR/ecosystem.config.js.$DATE $APP_DIR/ecosystem.config.js

# 7. 安装依赖
echo "安装依赖..."
npm install

# 8. 构建项目
echo "构建项目..."
npm run build

# 9. 重启应用
echo "重启应用..."
pm2 restart deepseek-chat

# 10. 等待启动
sleep 3

# 11. 检查状态
echo "检查应用状态..."
pm2 list

# 12. 显示日志
echo "================================"
echo "最近日志:"
echo "================================"
pm2 logs deepseek-chat --lines 20 --nostream

echo "================================"
echo "更新完成: $DATE"
echo "================================"
```

设置权限并使用:
```bash
# 设置执行权限
chmod +x /root/update-app.sh

# 执行更新
/root/update-app.sh
```

#### 推荐的配置文件管理方式

**方案 A: 将配置文件放在项目外部(最佳实践)**

```bash
# 1. 创建配置目录
mkdir -p /etc/deepseek-chat

# 2. 移动配置文件
mv /var/www/deepseek-chat/.env.local /etc/deepseek-chat/
mv /var/www/deepseek-chat/ecosystem.config.js /etc/deepseek-chat/

# 3. 创建软链接
ln -s /etc/deepseek-chat/.env.local /var/www/deepseek-chat/.env.local
ln -s /etc/deepseek-chat/ecosystem.config.js /var/www/deepseek-chat/ecosystem.config.js

# 4. 验证
ls -la /var/www/deepseek-chat/.env.local
ls -la /var/www/deepseek-chat/ecosystem.config.js
```

这样更新代码时,配置文件不在项目目录内,永远不会被覆盖!

**方案 B: 使用 Git 忽略配置文件**

如果使用 Git 管理代码,在 `.gitignore` 中添加:
```
.env.local
ecosystem.config.js
logs/
.next/
node_modules/
```

这样 `git pull` 时不会覆盖这些文件。

#### 更新失败回滚

如果更新后应用出现问题:
```bash
# 1. 停止应用
pm2 stop deepseek-chat

# 2. 恢复备份(使用最新的备份文件)
cd /var/www
rm -rf deepseek-chat
tar -xzf /var/backups/deepseek-chat/app-backup-YYYYMMDD-HHMMSS.tar.gz

# 3. 重启应用
cd deepseek-chat
pm2 restart deepseek-chat

# 4. 检查日志
pm2 logs deepseek-chat
```

### 7.3 Nginx 常用命令

```bash
# 测试配置
nginx -t

# 重启
systemctl restart nginx

# 重新加载配置(不停机)
systemctl reload nginx

# 查看状态
systemctl status nginx

# 查看错误日志
tail -f /var/log/nginx/error.log

# 查看访问日志
tail -f /var/log/nginx/access.log
```

### 7.4 防火墙配置

```bash
# Ubuntu (UFW)
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp
ufw enable
ufw status

# CentOS (Firewalld)
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --permanent --add-service=ssh
firewall-cmd --reload
firewall-cmd --list-all
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
lsof -i :3000
# 或
netstat -tlnp | grep 3000

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
tail -f /var/log/nginx/error.log
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
nano /root/backup.sh
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
chmod +x /root/backup.sh

# 添加 cron job (每天凌晨2点备份)
crontab -e
# 添加: 0 2 * * * /root/backup.sh
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
- [ ] PM2 应用已启动 (`pm2 status` 显示 online)
- [ ] **PM2 开机自启已配置** (`pm2 startup` 和 `pm2 save` 已执行)
- [ ] **测试退出终端后应用仍在运行**
- [ ] Nginx 配置已生效
- [ ] 防火墙和安全组已配置 (80, 443, 22 端口)
- [ ] 域名已解析 (如果使用域名)
- [ ] SSL 证书已安装 (如果使用 HTTPS)
- [ ] **通过公网 IP 或域名访问网站确认正常运行**

---

## 11. 常见问题 FAQ

### Q1: Vim 编辑配置文件时提示 "Can't open file for writing"?

**A**: 这是权限问题,有以下几种解决方法:

**解决方法 1 - 在 Vim 内强制保存:**
```
# 在 vim 命令模式下输入:
:w !sudo tee %
# 然后按回车,会提示是否重新加载,按 O (大写)
# 最后退出:
:q!
```

**解决方法 2 - 使用 nano 编辑器(推荐):**
```bash
nano /etc/nginx/sites-available/deepseek-chat
# 保存: Ctrl+O 然后回车
# 退出: Ctrl+X
```

**解决方法 3 - 检查文件权限:**
```bash
# 查看文件权限
ls -la /etc/nginx/sites-available/

# 如果文件已存在但无法写入,修改权限
chmod 644 /etc/nginx/sites-available/deepseek-chat

# 如果目录不存在,先创建
mkdir -p /etc/nginx/sites-available/
```

**解决方法 4 - 直接用重定向创建文件:**
```bash
cat > /etc/nginx/sites-available/deepseek-chat << 'EOF'
server {
    listen 80;
    server_name www.wangjinfe.com wangjinfe.com;

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

        proxy_buffering off;
        proxy_read_timeout 86400;
    }
}
EOF
```

### Q2: 退出 SSH 终端后应用停止运行?

**A**: 这说明应用没有在后台运行。请确保:
1. 使用 PM2 启动应用: `pm2 start ecosystem.config.js`
2. 执行 `pm2 save` 保存进程列表
3. 执行 `pm2 startup` 并按提示配置开机自启
4. 验证: 退出终端后重新登录,执行 `pm2 list` 查看应用是否仍在运行

### Q3: 服务器重启后应用没有自动启动?

**A**: 需要配置 PM2 开机自启:
```bash
pm2 startup
# 执行输出的命令 (会包含具体的命令)
pm2 save
reboot
# 重启后检查: pm2 list
```

### Q5: 如何查看应用是否正在运行?

**A**: 使用以下命令:
```bash
# 方式 1: PM2 状态
pm2 list
pm2 status

# 方式 2: 检查进程
ps aux | grep node

# 方式 3: 检查端口
lsof -i :3000
netstat -tlnp | grep 3000

# 方式 4: 测试访问
curl http://localhost:3000
```

### Q6: 应用启动失败怎么办?

**A**: 按顺序检查:
```bash
# 1. 查看详细日志
pm2 logs deepseek-chat --lines 100

# 2. 检查环境变量
cat /var/www/deepseek-chat/.env.local

# 3. 检查端口是否被占用
lsof -i :3000

# 4. 手动测试启动
cd /var/www/deepseek-chat
npm start

# 5. 检查项目是否已构建
ls -la .next/
```

### Q7: 如何查看应用日志?

**A**:
```bash
# PM2 实时日志
pm2 logs deepseek-chat

# 查看最近 100 行日志
pm2 logs deepseek-chat --lines 100

# 只看错误日志
pm2 logs deepseek-chat --err

# 查看日志文件
tail -f /var/www/deepseek-chat/logs/out.log
tail -f /var/www/deepseek-chat/logs/err.log
```

### Q8: 如何更新部署的代码?

**A**:
```bash
cd /var/www/deepseek-chat

# 拉取最新代码
git pull

# 安装依赖
npm install

# 重新构建
npm run build

# 使用 PM2 重启应用(零停机)
pm2 reload deepseek-chat
# 或使用重启
pm2 restart deepseek-chat

# 查看日志确认
pm2 logs deepseek-chat
```

### Q9: Nginx 显示 502 Bad Gateway?

**A**:
```bash
# 1. 检查应用是否运行
pm2 status

# 2. 检查应用端口
curl http://localhost:3000

# 3. 检查 Nginx 配置
nginx -t

# 4. 查看 Nginx 错误日志
tail -f /var/log/nginx/error.log

# 5. 重启服务
pm2 restart deepseek-chat
systemctl restart nginx
```

### Q10: Nginx 配置重启了但显示默认测试页面,没有代理到应用?

**A**: 这是常见问题,按以下步骤排查:

**步骤 1: 检查配置文件是否被加载**
```bash
# 检查 Nginx 主配置是否包含你的配置
nginx -T | grep deepseek

# 查看 Nginx 主配置文件
cat /etc/nginx/nginx.conf | grep include
```

**步骤 2: 禁用默认站点**
```bash
# Ubuntu/Debian 系统
# 删除默认站点的软链接
rm -f /etc/nginx/sites-enabled/default

# 或者移除默认配置
mv /etc/nginx/sites-enabled/default /etc/nginx/sites-enabled/default.bak
```

**步骤 3: 确保你的配置被启用**
```bash
# 检查软链接是否存在
ls -la /etc/nginx/sites-enabled/

# 如果没有,创建软链接
ln -s /etc/nginx/sites-available/deepseek-chat /etc/nginx/sites-enabled/deepseek-chat
```

**步骤 4: 测试配置并重启**
```bash
# 测试配置
nginx -t

# 如果测试通过,重新加载 Nginx
systemctl reload nginx

# 或者重启 Nginx
systemctl restart nginx
```

**步骤 5: 检查应用是否正在运行**
```bash
# 确认 Node.js 应用在运行
curl http://localhost:3000

# 如果没有响应,启动应用
pm2 list
pm2 start ecosystem.config.js
```

**步骤 6: 查看 Nginx 错误日志**
```bash
tail -f /var/log/nginx/error.log
```

**完整解决方案 - 一键修复:**
```bash
# 1. 禁用默认站点
rm -f /etc/nginx/sites-enabled/default

# 2. 启用你的站点
ln -sf /etc/nginx/sites-available/deepseek-chat /etc/nginx/sites-enabled/

# 3. 测试配置
nginx -t

# 4. 重启 Nginx
systemctl restart nginx

# 5. 验证
curl -I http://localhost
```

### Q11: HTTPS 配置后无法访问,但 HTTP 可以访问?

**A**: 这是常见问题,按以下步骤逐一排查:

**步骤 1: 检查 Nginx 配置是否正确加载**
```bash
# 测试 Nginx 配置语法
nginx -t

# 查看完整的 Nginx 配置
nginx -T | grep -A 30 "listen 443"

# 检查是否有 HTTPS 配置
nginx -T | grep "ssl_certificate"
```

**步骤 2: 检查 SSL 证书文件是否存在**
```bash
# 检查证书文件
ls -la /etc/nginx/ssl/

# 查看证书内容(应该看到 BEGIN CERTIFICATE)
head -5 /etc/nginx/ssl/wangjinfe.com.pem

# 查看私钥内容(应该看到 BEGIN PRIVATE KEY 或 BEGIN RSA PRIVATE KEY)
head -5 /etc/nginx/ssl/wangjinfe.com.key

# 验证证书有效性
openssl x509 -in /etc/nginx/ssl/wangjinfe.com.pem -text -noout | grep -A 2 "Validity"
```

**步骤 3: 检查防火墙和安全组**
```bash
# 检查 443 端口是否开放
netstat -tlnp | grep :443

# 检查防火墙规则
# Ubuntu
ufw status | grep 443

# CentOS
firewall-cmd --list-ports
```

**阿里云安全组检查:**
1. 登录阿里云控制台
2. 进入 ECS 实例 -> 安全组
3. 检查入方向规则是否包含:
   - 端口: 443/443
   - 协议: TCP
   - 授权对象: 0.0.0.0/0

**步骤 4: 重启 Nginx**
```bash
# 重启 Nginx
systemctl restart nginx

# 检查 Nginx 状态
systemctl status nginx

# 查看 Nginx 错误日志
tail -50 /var/log/nginx/error.log
```

**步骤 5: 测试 HTTPS 连接**
```bash
# 在服务器本地测试
curl -I https://localhost

# 测试域名
curl -I https://wangjinfe.com

# 详细测试 SSL 连接
openssl s_client -connect wangjinfe.com:443 -servername wangjinfe.com
```

**步骤 6: 检查 Nginx 是否监听 443 端口**
```bash
# 检查端口监听
ss -tlnp | grep :443
# 或
netstat -tlnp | grep :443

# 应该看到类似:
# tcp  0  0  0.0.0.0:443  0.0.0.0:*  LISTEN  12345/nginx
```

**常见问题和解决方案:**

**问题 1: 证书文件路径错误**
```bash
# 检查配置中的证书路径
grep ssl_certificate /etc/nginx/sites-available/deepseek-chat

# 确认文件存在
ls -la /etc/nginx/ssl/wangjinfe.com.pem
ls -la /etc/nginx/ssl/wangjinfe.com.key
```

**问题 2: 证书文件权限错误**
```bash
# 修正权限
chmod 644 /etc/nginx/ssl/wangjinfe.com.pem
chmod 600 /etc/nginx/ssl/wangjinfe.com.key
chown root:root /etc/nginx/ssl/*
```

**问题 3: Nginx 配置未生效**
```bash
# 确认软链接存在
ls -la /etc/nginx/sites-enabled/ | grep deepseek-chat

# 如果不存在,创建软链接
ln -sf /etc/nginx/sites-available/deepseek-chat /etc/nginx/sites-enabled/

# 删除默认配置(如果存在)
rm -f /etc/nginx/sites-enabled/default

# 重启 Nginx
systemctl restart nginx
```

**问题 4: 防火墙未开放 443 端口**
```bash
# Ubuntu (UFW)
ufw allow 443/tcp
ufw reload
ufw status

# CentOS (Firewalld)
firewall-cmd --permanent --add-port=443/tcp
firewall-cmd --reload
firewall-cmd --list-all
```

**问题 5: SELinux 阻止(CentOS/RHEL)**
```bash
# 检查 SELinux 状态
getenforce

# 临时关闭 SELinux 测试
setenforce 0

# 如果关闭后可以访问,配置 SELinux
setsebool -P httpd_can_network_connect 1
setenforce 1
```

**完整的一键修复命令:**
```bash
# 1. 检查并创建 SSL 目录
mkdir -p /etc/nginx/ssl

# 2. 设置证书权限
chmod 644 /etc/nginx/ssl/*.pem 2>/dev/null
chmod 600 /etc/nginx/ssl/*.key 2>/dev/null

# 3. 确保软链接存在
ln -sf /etc/nginx/sites-available/deepseek-chat /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 4. 开放防火墙端口
ufw allow 443/tcp 2>/dev/null || firewall-cmd --permanent --add-port=443/tcp 2>/dev/null
ufw reload 2>/dev/null || firewall-cmd --reload 2>/dev/null

# 5. 测试配置
nginx -t

# 6. 重启 Nginx
systemctl restart nginx

# 7. 检查状态
systemctl status nginx
ss -tlnp | grep :443

# 8. 测试访问
curl -I https://localhost
```

**查看详细错误信息:**
```bash
# 查看 Nginx 错误日志
tail -100 /var/log/nginx/error.log

# 实时查看日志
tail -f /var/log/nginx/error.log

# 查看系统日志
journalctl -u nginx -n 50
```

### Q12: CentOS/AliyunOS 系统没有 sites-available 目录?

**A**: CentOS 系统 Nginx 配置结构不同,直接在 conf.d 目录创建配置:

**方法 1: 在 conf.d 目录创建配置**
```bash
# 先禁用默认配置
mv /etc/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf.bak 2>/dev/null

# 创建你的配置文件
cat > /etc/nginx/conf.d/deepseek-chat.conf << 'EOF'
server {
    listen 80;
    server_name www.wangjinfe.com wangjinfe.com;

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

        proxy_buffering off;
        proxy_read_timeout 86400;
    }
}
EOF

# 测试配置
nginx -t

# 重启 Nginx
systemctl restart nginx
```

**方法 2: 创建 sites-available 目录结构**
```bash
# 创建目录
mkdir -p /etc/nginx/sites-available
mkdir -p /etc/nginx/sites-enabled

# 修改主配置文件,添加 include
echo "include /etc/nginx/sites-enabled/*;" >> /etc/nginx/nginx.conf

# 然后按照 Ubuntu 的方式配置
```

---

## 联系和支持

如遇到问题,请检查:
1. **PM2 日志**: `pm2 logs deepseek-chat --lines 200`
2. **Nginx 错误日志**: `tail -f /var/log/nginx/error.log`
3. **Nginx 访问日志**: `tail -f /var/log/nginx/access.log`
4. **系统日志**: `journalctl -xe`
5. **应用进程**: `ps aux | grep node`
6. **端口占用**: `lsof -i :3000`

## 快速排查流程

```bash
# 1. 检查应用是否运行
pm2 list

# 2. 如果没有运行,查看日志
pm2 logs deepseek-chat --lines 50

# 3. 检查 Nginx 状态
systemctl status nginx

# 4. 测试本地访问
curl http://localhost:3000

# 5. 测试外网访问
curl http://your_server_ip
```

---

## 8. 代码更新部署

### 8.1 概述

当您的代码有更新需要重新部署时，**不需要重复完整的部署流程**。

📖 **完整更新指南**: [UPDATE_DEPLOY.md](./UPDATE_DEPLOY.md)

该文档提供了详细的更新步骤、自动化脚本和故障排查指南。

### 8.2 快速更新流程

#### 方式 1: 压缩包更新（推荐）

**本地操作：**
```bash
# 1. 打包代码（排除配置文件）
tar -czf deepseek-chat-update.tar.gz \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=.next \
  --exclude=.env.local \
  --exclude=ecosystem.config.js \
  --exclude=logs \
  --exclude=*.tar.gz \
  .

# 2. 上传到服务器
scp deepseek-chat-update.tar.gz root@your_server_ip:/tmp/
```

**服务器操作：**
```bash
# 3. SSH 连接到服务器
ssh root@your_server_ip

# 4. 备份配置文件
cd /var/www/deepseek-chat
cp .env.local /tmp/.env.local.backup
cp ecosystem.config.js /tmp/ecosystem.config.js.backup

# 5. 解压新代码
tar -xzf /tmp/deepseek-chat-update.tar.gz

# 6. 清除 npm 缓存 重新构建和重启
  npm cache clean --force
  # 删除 node_modules 和 package-lock.json
  rm -rf node_modules package-lock.json .next

npm install
npm run build
pm2 restart deepseek-chat

# 7. 验证
pm2 logs deepseek-chat --lines 30
```

#### 方式 2: Git 更新

```bash
cd /var/www/deepseek-chat

# 备份配置
cp .env.local /tmp/.env.local.backup
cp ecosystem.config.js /tmp/ecosystem.config.js.backup

# 拉取更新
git pull

# 重新构建和重启
npm install
npm run build
pm2 restart deepseek-chat
```

#### 方式 3: 自动化脚本

详见 [UPDATE_DEPLOY.md](./UPDATE_DEPLOY.md) 中的完整自动化脚本。

### 8.3 重要注意事项

⚠️ **更新前必读**:

1. **保护配置文件**
   - 始终备份 `.env.local` 和 `ecosystem.config.js`
   - 打包时排除这些文件（使用 `--exclude` 参数）
   - 解压后验证配置文件是否存在

2. **备份当前版本**
   ```bash
   tar -czf backup-$(date +%Y%m%d-%H%M%S).tar.gz \
     --exclude=node_modules \
     --exclude=.next \
     deepseek-chat/
   ```

3. **验证更新成功**
   ```bash
   # 检查应用状态
   pm2 list

   # 查看日志
   pm2 logs deepseek-chat --lines 50

   # 浏览器访问测试
   # https://your-domain.com
   ```

### 8.4 回滚操作

如果更新出现问题：

```bash
# 1. 停止应用
pm2 stop deepseek-chat

# 2. 恢复备份
cd /var/www
rm -rf deepseek-chat
tar -xzf backup-YYYYMMDD-HHMMSS.tar.gz

# 3. 重启应用
cd deepseek-chat
pm2 restart deepseek-chat
```

### 8.5 常见问题

**Q: 更新后配置文件丢失？**
```bash
# 恢复备份的配置文件
cp /tmp/.env.local.backup /var/www/deepseek-chat/.env.local
cp /tmp/ecosystem.config.js.backup /var/www/deepseek-chat/ecosystem.config.js
pm2 restart deepseek-chat
```

**Q: 构建失败？**
```bash
# 清除缓存重新构建
rm -rf .next node_modules
npm install
npm run build
```

**Q: 应用无法启动？**
```bash
# 查看详细日志
pm2 logs deepseek-chat --lines 100

# 检查端口占用
lsof -i :3000

# 检查配置文件
cat .env.local
```

### 8.6 最佳实践

1. **定期备份**
   - 每次更新前备份
   - 保留最近 7 天的备份
   - 备份配置文件到项目外目录

2. **测试后部署**
   - 本地测试无误后再部署
   - 先在测试环境验证
   - 准备回滚方案

3. **零停机更新**
   ```bash
   # 使用 PM2 reload 而不是 restart
   pm2 reload deepseek-chat
   ```

4. **监控日志**
   ```bash
   # 更新后持续监控日志
   pm2 logs deepseek-chat -f
   ```

📚 **完整文档**: 查看 [UPDATE_DEPLOY.md](./UPDATE_DEPLOY.md) 获取更详细的说明、自动化脚本和故障排查指南。

---

祝部署顺利!
