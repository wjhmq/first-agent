# 部署检查清单 - 避免配置文件被覆盖

## ⚠️ 重要提醒

**您的证书文件名是：**
- `www.wangjinfe.com.pem` (证书文件)
- `www.wangjinfe.com.key` (私钥文件)

所有配置都已经按照这个文件名进行了设置。

## 📦 安全的打包方式

### 首次部署打包

```bash
# 在本地项目目录执行
tar -czf deepseek-chat-safe.tar.gz \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=.next \
  --exclude=.env.local \
  --exclude=ecosystem.config.js \
  --exclude=logs \
  --exclude=*.tar.gz \
  .
```

**已排除的文件（避免覆盖服务器配置）：**
- ✅ `.env.local` - 包含 API Key，服务器上单独配置
- ✅ `ecosystem.config.js` - PM2 配置，服务器上单独配置
- ✅ `logs/` - 日志目录
- ✅ `node_modules/` - 依赖包
- ✅ `.next/` - 构建产物

### 对比说明

| 文件 | 是否打包 | 原因 |
|------|---------|------|
| `.env.local` | ❌ 不打包 | 包含敏感的 API Key，每个环境独立配置 |
| `ecosystem.config.js` | ❌ 不打包 | PM2 配置可能因环境而异 |
| `.env.example` | ✅ 打包 | 示例文件，不含敏感信息 |
| `DEPLOY.md` | ✅ 打包 | 部署文档 |
| `nginx.conf` | ✅ 打包 | Nginx 配置模板（证书路径已更新） |

## 🚀 完整部署流程

### 1. 本地准备

```bash
# 创建安全的压缩包
tar -czf deepseek-chat-safe.tar.gz \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=.next \
  --exclude=.env.local \
  --exclude=ecosystem.config.js \
  --exclude=logs \
  --exclude=*.tar.gz \
  .

# 上传到服务器
scp deepseek-chat-safe.tar.gz root@your_server_ip:/var/www/
```

### 2. 服务器上解压

```bash
# 解压项目
cd /var/www
mkdir -p deepseek-chat
tar -xzf deepseek-chat-safe.tar.gz -C deepseek-chat
cd deepseek-chat

# 此时配置文件不存在，需要手动创建
```

### 3. 创建配置文件

#### 3.1 创建 .env.local

```bash
nano /var/www/deepseek-chat/.env.local
```

内容：
```env
DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

#### 3.2 创建 ecosystem.config.js

```bash
nano /var/www/deepseek-chat/ecosystem.config.js
```

内容：
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

### 4. 上传 SSL 证书

```bash
# 在本地执行
scp www.wangjinfe.com.pem root@your_server_ip:/etc/nginx/ssl/
scp www.wangjinfe.com.key root@your_server_ip:/etc/nginx/ssl/

# 在服务器上设置权限
chmod 644 /etc/nginx/ssl/www.wangjinfe.com.pem
chmod 600 /etc/nginx/ssl/www.wangjinfe.com.key
```

### 5. 配置 Nginx

```bash
# 使用项目中的 nginx.conf 模板（证书路径已正确配置）
cat /var/www/deepseek-chat/nginx.conf > /etc/nginx/sites-available/deepseek-chat

# 或者使用 tee 命令
tee /etc/nginx/sites-available/deepseek-chat > /dev/null < /var/www/deepseek-chat/nginx.conf

# 启用配置
ln -sf /etc/nginx/sites-available/deepseek-chat /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 测试配置
nginx -t

# 重启 Nginx
systemctl restart nginx
```

### 6. 安装依赖并启动

```bash
cd /var/www/deepseek-chat

# 创建日志目录
mkdir -p logs

# 安装依赖
npm install

# 构建项目
npm run build

# 使用 PM2 启动
pm2 start ecosystem.config.js

# 配置开机自启
pm2 startup
pm2 save

# 检查状态
pm2 list
pm2 logs deepseek-chat
```

## 🔄 更新部署（不覆盖配置）

### 更新流程

```bash
# 1. 在本地打包（排除配置文件）
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

# 3. 在服务器上备份配置
cd /var/www/deepseek-chat
cp .env.local /tmp/.env.local.backup
cp ecosystem.config.js /tmp/ecosystem.config.js.backup

# 4. 解压新代码（不会覆盖配置文件，因为压缩包里没有）
tar -xzf /tmp/deepseek-chat-update.tar.gz -C /var/www/deepseek-chat

# 5. 验证配置文件仍然存在
ls -la .env.local ecosystem.config.js

# 6. 如果配置文件被意外删除，恢复备份
if [ ! -f .env.local ]; then
    cp /tmp/.env.local.backup .env.local
fi
if [ ! -f ecosystem.config.js ]; then
    cp /tmp/ecosystem.config.js.backup ecosystem.config.js
fi

# 7. 重新安装依赖和构建
npm install
npm run build

# 8. 重启应用
pm2 restart deepseek-chat

# 9. 查看日志
pm2 logs deepseek-chat --lines 50
```

## ✅ 验证清单

部署完成后，请依次检查：

- [ ] 应用在 PM2 中状态为 `online`
  ```bash
  pm2 list
  ```

- [ ] 本地 3000 端口可访问
  ```bash
  curl http://localhost:3000
  ```

- [ ] Nginx 配置正确
  ```bash
  nginx -t
  systemctl status nginx
  ```

- [ ] SSL 证书路径正确
  ```bash
  grep ssl_certificate /etc/nginx/sites-available/deepseek-chat
  # 应该显示：
  # ssl_certificate /etc/nginx/ssl/www.wangjinfe.com.pem;
  # ssl_certificate_key /etc/nginx/ssl/www.wangjinfe.com.key;
  ```

- [ ] SSL 证书文件存在且权限正确
  ```bash
  ls -la /etc/nginx/ssl/www.wangjinfe.com.*
  # 权限应该是：
  # -rw-r--r-- www.wangjinfe.com.pem
  # -rw------- www.wangjinfe.com.key
  ```

- [ ] HTTPS 可以访问
  ```bash
  curl -I https://www.wangjinfe.com
  ```

- [ ] HTTP 自动重定向到 HTTPS
  ```bash
  curl -I http://www.wangjinfe.com
  # 应该返回 301 重定向
  ```

- [ ] 配置文件存在且内容正确
  ```bash
  cat /var/www/deepseek-chat/.env.local
  cat /var/www/deepseek-chat/ecosystem.config.js
  ```

## 🔧 配置文件管理最佳实践

### 方案 1: 软链接到系统目录（推荐）

```bash
# 将配置文件放在系统目录
mkdir -p /etc/deepseek-chat
mv /var/www/deepseek-chat/.env.local /etc/deepseek-chat/
mv /var/www/deepseek-chat/ecosystem.config.js /etc/deepseek-chat/

# 创建软链接
ln -s /etc/deepseek-chat/.env.local /var/www/deepseek-chat/.env.local
ln -s /etc/deepseek-chat/ecosystem.config.js /var/www/deepseek-chat/ecosystem.config.js

# 验证
ls -la /var/www/deepseek-chat/.env.local
ls -la /var/www/deepseek-chat/ecosystem.config.js
```

**优点：**
- 配置文件永远不会被更新覆盖
- 集中管理所有应用配置
- 符合 Linux 标准实践

### 方案 2: 环境变量分离

```bash
# 在 ~/.bashrc 或 /etc/environment 中设置
export DEEPSEEK_API_KEY="your_key_here"

# PM2 会自动读取环境变量，无需 .env.local
```

## 📝 常见错误

### 错误 1: 解压覆盖了配置文件

**原因：** 压缩包包含了 `.env.local` 或 `ecosystem.config.js`

**解决：**
```bash
# 恢复备份
cp /tmp/.env.local.backup /var/www/deepseek-chat/.env.local
cp /tmp/ecosystem.config.js.backup /var/www/deepseek-chat/ecosystem.config.js
```

**预防：** 打包时一定要排除配置文件

### 错误 2: Nginx 找不到证书文件

**原因：** 证书文件名不匹配

**检查：**
```bash
# 检查配置中的路径
grep ssl_certificate /etc/nginx/sites-available/deepseek-chat

# 检查实际文件
ls -la /etc/nginx/ssl/
```

**确保一致：**
- 配置文件: `www.wangjinfe.com.pem` 和 `www.wangjinfe.com.key`
- 实际文件: `www.wangjinfe.com.pem` 和 `www.wangjinfe.com.key`

## 📞 问题排查

如遇问题，按顺序检查：

```bash
# 1. 检查应用状态
pm2 list
pm2 logs deepseek-chat --lines 50

# 2. 检查配置文件
cat /var/www/deepseek-chat/.env.local
cat /var/www/deepseek-chat/ecosystem.config.js

# 3. 检查 Nginx
nginx -t
systemctl status nginx
tail -f /var/log/nginx/error.log

# 4. 检查证书
ls -la /etc/nginx/ssl/
openssl x509 -in /etc/nginx/ssl/www.wangjinfe.com.pem -text -noout | head -20

# 5. 检查端口
lsof -i :3000
lsof -i :443
```

---

**最后提醒：**
- ✅ 使用 `deepseek-chat-safe.tar.gz` 部署
- ❌ 不要使用旧的 `deepseek-chat.tar.gz`（包含了配置文件）
- 📝 每次更新都要排除配置文件
- 🔐 配置文件永远不要提交到 Git 仓库
