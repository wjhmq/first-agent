# 🔄 代码更新与重新部署指南

## 📋 概述

本文档详细说明如何在代码更新后重新部署服务到阿里云服务器。

---

## 🎯 快速操作流程

### 完整流程（5步）

```bash
# 1. 本地打包（排除配置文件）
# 2. 上传到服务器
# 3. 备份并解压
# 4. 重新构建
# 5. 重启服务
```

---

## 📦 方式 1: 使用压缩包更新（推荐）

### 步骤 1: 本地打包代码

在本地项目目录执行：

```bash
# 打包代码（排除配置文件和构建产物）
tar -czf deepseek-chat-update.tar.gz \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=.next \
  --exclude=.env.local \
  --exclude=ecosystem.config.js \
  --exclude=logs \
  --exclude=*.tar.gz \
  .
```

**重要说明：**
- ✅ 排除 `.env.local` - 避免覆盖服务器上的 API Key
- ✅ 排除 `ecosystem.config.js` - 避免覆盖 PM2 配置
- ✅ 排除 `node_modules` - 服务器上重新安装
- ✅ 排除 `.next` - 服务器上重新构建

### 步骤 2: 上传到服务器

```bash
# 上传压缩包到服务器的临时目录
scp deepseek-chat-update.tar.gz root@your_server_ip:/tmp/
```

**替换 `your_server_ip` 为您的服务器 IP 地址**

### 步骤 3: 在服务器上备份和解压

SSH 连接到服务器：

```bash
ssh root@your_server_ip
```

执行以下命令：

```bash
# 进入项目目录
cd /var/www/deepseek-chat

# 1. 备份配置文件（重要！）
echo "=== 备份配置文件 ==="
cp .env.local /tmp/.env.local.backup
cp ecosystem.config.js /tmp/ecosystem.config.js.backup

# 2. 备份当前版本（可选但推荐）
echo "=== 备份当前版本 ==="
cd /var/www
tar -czf deepseek-chat-backup-$(date +%Y%m%d-%H%M%S).tar.gz \
  --exclude=deepseek-chat/node_modules \
  --exclude=deepseek-chat/.next \
  --exclude=deepseek-chat/logs \
  deepseek-chat/

# 3. 解压新代码
echo "=== 解压新代码 ==="
cd /var/www/deepseek-chat
tar -xzf /tmp/deepseek-chat-update.tar.gz

# 4. 验证配置文件是否存在
echo "=== 验证配置文件 ==="
ls -la .env.local ecosystem.config.js

# 5. 如果配置文件被删除，恢复它们
if [ ! -f .env.local ]; then
    echo "恢复 .env.local"
    cp /tmp/.env.local.backup .env.local
fi
if [ ! -f ecosystem.config.js ]; then
    echo "恢复 ecosystem.config.js"
    cp /tmp/ecosystem.config.js.backup ecosystem.config.js
fi
```

### 步骤 4: 重新构建

```bash
# 1. 安装/更新依赖
echo "=== 安装依赖 ==="
npm install

# 2. 重新构建项目
echo "=== 构建项目 ==="
npm run build
```

### 步骤 5: 重启服务

```bash
# 1. 使用 PM2 重启应用
echo "=== 重启应用 ==="
pm2 restart deepseek-chat

# 2. 等待几秒
sleep 3

# 3. 查看状态
echo "=== 检查状态 ==="
pm2 list

# 4. 查看最近日志
echo "=== 查看日志 ==="
pm2 logs deepseek-chat --lines 30 --nostream

# 5. 清理临时文件
rm /tmp/deepseek-chat-update.tar.gz
```

---

## 🚀 方式 2: 使用 Git 更新（如果使用 Git）

### 步骤 1: 备份配置

```bash
cd /var/www/deepseek-chat

# 备份配置文件
cp .env.local /tmp/.env.local.backup
cp ecosystem.config.js /tmp/ecosystem.config.js.backup
```

### 步骤 2: 拉取最新代码

```bash
# 拉取最新代码
git pull origin main
# 或者
git pull origin master
```

### 步骤 3: 恢复配置文件

```bash
# 恢复配置文件（如果被覆盖）
cp /tmp/.env.local.backup .env.local
cp /tmp/ecosystem.config.js.backup ecosystem.config.js
```

### 步骤 4: 重新构建和重启

```bash
# 安装依赖
npm install

# 构建项目
npm run build

# 重启应用
pm2 restart deepseek-chat

# 查看状态和日志
pm2 list
pm2 logs deepseek-chat --lines 30
```

---

## 🤖 方式 3: 使用自动化脚本（最方便）

### 创建更新脚本

在服务器上创建脚本：

```bash
nano /root/update-deepseek-chat.sh
```

复制以下内容：

```bash
#!/bin/bash

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

APP_DIR="/var/www/deepseek-chat"
BACKUP_DIR="/var/backups/deepseek-chat"
DATE=$(date +%Y%m%d-%H%M%S)

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}开始更新 DeepSeek Chat${NC}"
echo -e "${GREEN}时间: $DATE${NC}"
echo -e "${GREEN}================================${NC}"

# 1. 创建备份目录
mkdir -p $BACKUP_DIR

# 2. 备份配置文件
echo -e "${YELLOW}[1/8] 备份配置文件...${NC}"
cp $APP_DIR/.env.local $BACKUP_DIR/.env.local.$DATE
cp $APP_DIR/ecosystem.config.js $BACKUP_DIR/ecosystem.config.js.$DATE
echo -e "${GREEN}✓ 配置文件备份完成${NC}"

# 3. 备份当前版本
echo -e "${YELLOW}[2/8] 备份当前版本...${NC}"
cd /var/www
tar -czf $BACKUP_DIR/app-backup-$DATE.tar.gz \
  --exclude=deepseek-chat/node_modules \
  --exclude=deepseek-chat/.next \
  --exclude=deepseek-chat/logs \
  deepseek-chat/ 2>/dev/null
echo -e "${GREEN}✓ 版本备份完成${NC}"

# 4. 进入项目目录
cd $APP_DIR

# 5. 解压新代码（如果使用压缩包方式）
if [ -f /tmp/deepseek-chat-update.tar.gz ]; then
    echo -e "${YELLOW}[3/8] 解压新代码...${NC}"
    tar -xzf /tmp/deepseek-chat-update.tar.gz
    echo -e "${GREEN}✓ 代码解压完成${NC}"
else
    # 或使用 Git 方式
    echo -e "${YELLOW}[3/8] 拉取最新代码...${NC}"
    git pull
    echo -e "${GREEN}✓ 代码更新完成${NC}"
fi

# 6. 恢复配置文件
echo -e "${YELLOW}[4/8] 恢复配置文件...${NC}"
cp $BACKUP_DIR/.env.local.$DATE $APP_DIR/.env.local
cp $BACKUP_DIR/ecosystem.config.js.$DATE $APP_DIR/ecosystem.config.js
echo -e "${GREEN}✓ 配置文件恢复完成${NC}"

# 7. 安装依赖
echo -e "${YELLOW}[5/8] 安装依赖...${NC}"
npm install
echo -e "${GREEN}✓ 依赖安装完成${NC}"

# 8. 构建项目
echo -e "${YELLOW}[6/8] 构建项目...${NC}"
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 项目构建成功${NC}"
else
    echo -e "${RED}✗ 项目构建失败！${NC}"
    echo -e "${RED}回滚到之前的版本...${NC}"
    # 这里可以添加回滚逻辑
    exit 1
fi

# 9. 重启应用
echo -e "${YELLOW}[7/8] 重启应用...${NC}"
pm2 restart deepseek-chat
sleep 3
echo -e "${GREEN}✓ 应用重启完成${NC}"

# 10. 检查状态
echo -e "${YELLOW}[8/8] 检查应用状态...${NC}"
pm2 list | grep deepseek-chat

# 11. 显示日志
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}最近日志:${NC}"
echo -e "${GREEN}================================${NC}"
pm2 logs deepseek-chat --lines 20 --nostream

# 12. 清理临时文件
if [ -f /tmp/deepseek-chat-update.tar.gz ]; then
    rm /tmp/deepseek-chat-update.tar.gz
fi

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✓ 更新完成: $DATE${NC}"
echo -e "${GREEN}================================${NC}"
```

### 设置脚本权限

```bash
chmod +x /root/update-deepseek-chat.sh
```

### 使用脚本

**使用压缩包更新：**

```bash
# 1. 本地上传压缩包
scp deepseek-chat-update.tar.gz root@your_server_ip:/tmp/

# 2. 在服务器上执行脚本
ssh root@your_server_ip
/root/update-deepseek-chat.sh
```

**使用 Git 更新：**

```bash
# 直接在服务器上执行
ssh root@your_server_ip
/root/update-deepseek-chat.sh
```

---

## 📋 更新检查清单

### 更新前检查

- [ ] 本地代码已测试通过
- [ ] 已备份服务器配置文件
- [ ] 已确认服务器磁盘空间充足
- [ ] 已通知用户服务即将更新

### 更新中检查

- [ ] 配置文件未被覆盖
- [ ] npm install 成功
- [ ] npm run build 成功
- [ ] PM2 重启成功

### 更新后检查

- [ ] pm2 list 显示 online
- [ ] pm2 logs 无错误
- [ ] 浏览器访问正常
- [ ] API 接口正常
- [ ] 新功能工作正常

---

## 🔍 故障排查

### 问题 1: 构建失败

**症状：** `npm run build` 报错

**解决：**

```bash
# 1. 清除缓存
rm -rf .next
rm -rf node_modules

# 2. 重新安装依赖
npm install

# 3. 重新构建
npm run build
```

### 问题 2: 应用无法启动

**症状：** PM2 显示 `errored` 或 `stopped`

**解决：**

```bash
# 1. 查看详细日志
pm2 logs deepseek-chat --lines 100

# 2. 检查配置文件
cat .env.local
cat ecosystem.config.js

# 3. 检查端口占用
lsof -i :3000

# 4. 尝试手动启动
npm start
```

### 问题 3: 配置文件丢失

**症状：** 缺少 API Key 或 PM2 配置

**解决：**

```bash
# 1. 恢复备份
cp /tmp/.env.local.backup .env.local
cp /tmp/ecosystem.config.js.backup ecosystem.config.js

# 2. 或从备份目录恢复
cp /var/backups/deepseek-chat/.env.local.* .env.local
cp /var/backups/deepseek-chat/ecosystem.config.js.* ecosystem.config.js

# 3. 重启应用
pm2 restart deepseek-chat
```

### 问题 4: 依赖安装失败

**症状：** `npm install` 报错

**解决：**

```bash
# 1. 清除 npm 缓存
npm cache clean --force

# 2. 删除 node_modules 和 package-lock.json
rm -rf node_modules
rm package-lock.json

# 3. 重新安装
npm install

# 4. 如果还是失败，检查 Node.js 版本
node -v  # 应该是 v20 或更高
npm -v
```

---

## 🔄 回滚操作

### 如果更新出现问题，快速回滚：

```bash
# 1. 停止当前应用
pm2 stop deepseek-chat

# 2. 删除当前代码
cd /var/www
rm -rf deepseek-chat

# 3. 恢复备份（使用最新的备份）
tar -xzf /var/backups/deepseek-chat/app-backup-YYYYMMDD-HHMMSS.tar.gz

# 4. 重启应用
cd deepseek-chat
pm2 restart deepseek-chat

# 5. 检查状态
pm2 list
pm2 logs deepseek-chat
```

---

## 📊 更新时间估算

| 步骤 | 预计时间 |
|------|---------|
| 本地打包 | 10秒 |
| 上传到服务器 | 1-5分钟 |
| 备份 | 30秒 |
| 解压 | 10秒 |
| npm install | 2-5分钟 |
| npm run build | 1-3分钟 |
| 重启服务 | 10秒 |
| **总计** | **5-15分钟** |

---

## 🎯 最佳实践

### 1. 定期备份

```bash
# 添加定时备份（每天凌晨2点）
crontab -e

# 添加以下行
0 2 * * * tar -czf /var/backups/deepseek-chat/daily-$(date +\%Y\%m\%d).tar.gz --exclude=node_modules --exclude=.next /var/www/deepseek-chat
```

### 2. 保持备份版本数量

```bash
# 只保留最近7天的备份
find /var/backups/deepseek-chat -name "*.tar.gz" -mtime +7 -delete
```

### 3. 更新前测试

```bash
# 在本地测试无误后再部署
npm run build  # 本地测试构建
npm start      # 本地测试运行
```

### 4. 使用 Git 标签

```bash
# 给每个版本打标签
git tag -a v1.1.0 -m "添加 Markdown 渲染和停止生成功能"
git push origin v1.1.0
```

---

## 🔐 安全建议

1. **保护配置文件**
   ```bash
   # 确保配置文件不在 Git 中
   echo ".env.local" >> .gitignore
   echo "ecosystem.config.js" >> .gitignore
   ```

2. **使用环境变量**
   ```bash
   # 考虑使用系统环境变量
   export DEEPSEEK_API_KEY="your_key"
   ```

3. **限制文件权限**
   ```bash
   chmod 600 .env.local
   chmod 644 ecosystem.config.js
   ```

---

## 📞 需要帮助？

如果更新过程中遇到问题：

1. 查看 PM2 日志
   ```bash
   pm2 logs deepseek-chat --lines 100
   ```

2. 查看 Nginx 日志
   ```bash
   tail -f /var/log/nginx/error.log
   ```

3. 检查系统资源
   ```bash
   free -h  # 内存
   df -h    # 磁盘
   top      # CPU
   ```

4. 回滚到之前的版本
   ```bash
   # 使用备份文件恢复
   ```

---

## ✅ 快速命令参考

```bash
# 完整更新流程（复制粘贴执行）

# === 本地操作 ===
tar -czf deepseek-chat-update.tar.gz --exclude=node_modules --exclude=.git --exclude=.next --exclude=.env.local --exclude=ecosystem.config.js --exclude=logs --exclude=*.tar.gz .
scp deepseek-chat-update.tar.gz root@your_server_ip:/tmp/

# === 服务器操作 ===
ssh root@your_server_ip

cd /var/www/deepseek-chat
cp .env.local /tmp/.env.local.backup
cp ecosystem.config.js /tmp/ecosystem.config.js.backup
tar -xzf /tmp/deepseek-chat-update.tar.gz
npm install
npm run build
pm2 restart deepseek-chat
pm2 logs deepseek-chat --lines 30
```

---

**祝更新顺利！** 🚀
