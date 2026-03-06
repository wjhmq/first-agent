#!/bin/bash

# 阿里云服务器一键部署脚本
# 用途：自动部署MySQL数据库和项目数据

set -e  # 遇到错误立即退出

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}======================================"
echo "  阿里云MySQL数据库一键部署脚本"
echo "======================================${NC}"
echo ""

# 检查是否为root用户
if [ "$EUID" -ne 0 ]; then
  echo -e "${YELLOW}提示: 建议使用root用户运行此脚本${NC}"
  echo "或使用: sudo ./deploy-to-aliyun.sh"
  echo ""
fi

# 1. 检查MySQL是否安装
echo -e "${BLUE}[1/8] 检查MySQL安装状态...${NC}"
if ! command -v mysql &> /dev/null; then
    echo -e "${RED}✗ MySQL未安装${NC}"
    echo ""
    echo "请先安装MySQL，参考文档: ALIYUN_MYSQL_SETUP.md"
    echo ""
    echo "快速安装命令:"
    echo "CentOS: sudo yum install -y mysql-community-server"
    echo "Ubuntu: sudo apt install -y mysql-server"
    exit 1
fi
echo -e "${GREEN}✓ MySQL已安装${NC}"
echo ""

# 2. 检查MySQL服务状态
echo -e "${BLUE}[2/8] 检查MySQL服务状态...${NC}"
if systemctl is-active --quiet mysqld 2>/dev/null || systemctl is-active --quiet mysql 2>/dev/null; then
    echo -e "${GREEN}✓ MySQL服务正在运行${NC}"
else
    echo -e "${YELLOW}⚠ MySQL服务未运行，正在启动...${NC}"
    sudo systemctl start mysqld 2>/dev/null || sudo systemctl start mysql 2>/dev/null
    echo -e "${GREEN}✓ MySQL服务已启动${NC}"
fi
echo ""

# 3. 获取MySQL配置
echo -e "${BLUE}[3/8] 配置数据库连接信息${NC}"
read -p "MySQL Root用户名 [root]: " MYSQL_USER
MYSQL_USER=${MYSQL_USER:-root}

read -sp "MySQL Root密码: " MYSQL_PASSWORD
echo ""

if [ -z "$MYSQL_PASSWORD" ]; then
    echo -e "${RED}✗ 密码不能为空${NC}"
    exit 1
fi

# 测试MySQL连接
echo -e "${YELLOW}测试MySQL连接...${NC}"
if ! mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "SELECT 1;" &>/dev/null; then
    echo -e "${RED}✗ 无法连接到MySQL，请检查用户名和密码${NC}"
    exit 1
fi
echo -e "${GREEN}✓ MySQL连接成功${NC}"
echo ""

# 4. 创建数据库
echo -e "${BLUE}[4/8] 创建数据库 poetry_quiz${NC}"
mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" <<EOF
CREATE DATABASE IF NOT EXISTS poetry_quiz
DEFAULT CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 数据库创建成功${NC}"
else
    echo -e "${RED}✗ 数据库创建失败${NC}"
    exit 1
fi
echo ""

# 5. 创建应用用户
echo -e "${BLUE}[5/8] 创建应用数据库用户${NC}"
read -p "应用用户名 [poetry_user]: " APP_USER
APP_USER=${APP_USER:-poetry_user}

read -sp "应用用户密码 (留空自动生成): " APP_PASSWORD
echo ""

if [ -z "$APP_PASSWORD" ]; then
    # 生成随机密码
    APP_PASSWORD=$(openssl rand -base64 12)
    echo -e "${YELLOW}自动生成的密码: ${APP_PASSWORD}${NC}"
    echo -e "${YELLOW}请妥善保存此密码！${NC}"
fi

mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" <<EOF
-- 创建本地用户
CREATE USER IF NOT EXISTS '${APP_USER}'@'localhost' IDENTIFIED BY '${APP_PASSWORD}';
GRANT ALL PRIVILEGES ON poetry_quiz.* TO '${APP_USER}'@'localhost';

-- 创建远程用户（可选）
CREATE USER IF NOT EXISTS '${APP_USER}'@'%' IDENTIFIED BY '${APP_PASSWORD}';
GRANT ALL PRIVILEGES ON poetry_quiz.* TO '${APP_USER}'@'%';

FLUSH PRIVILEGES;
EOF

echo -e "${GREEN}✓ 用户创建成功${NC}"
echo ""

# 6. 导入表结构
echo -e "${BLUE}[6/8] 导入数据库表结构${NC}"

if [ ! -f "database/schema.sql" ]; then
    echo -e "${RED}✗ 找不到 database/schema.sql 文件${NC}"
    echo "请确保在项目根目录执行此脚本"
    exit 1
fi

mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" poetry_quiz < database/schema.sql

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 表结构导入成功${NC}"
else
    echo -e "${RED}✗ 表结构导入失败${NC}"
    exit 1
fi
echo ""

# 7. 导入初始数据
echo -e "${BLUE}[7/8] 导入初始题库数据（50道题目）${NC}"

if [ -f "database/init_data.sql" ]; then
    mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" poetry_quiz < database/init_data.sql
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ 题库数据导入成功${NC}"
    else
        echo -e "${YELLOW}⚠ 题库数据导入失败（可能已存在）${NC}"
    fi
else
    echo -e "${YELLOW}⚠ 未找到 database/init_data.sql，跳过题库导入${NC}"
fi

# 导入访问日志表（可选）
if [ -f "database/visit_logs.sql" ]; then
    echo -e "${YELLOW}导入访问日志表...${NC}"
    mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" poetry_quiz < database/visit_logs.sql
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ 访问日志表创建成功${NC}"
    fi
else
    echo -e "${YELLOW}⚠ 未找到 database/visit_logs.sql，跳过${NC}"
fi
echo ""

# 8. 验证数据
echo -e "${BLUE}[8/8] 验证数据完整性${NC}"

# 查询各表记录数
TABLES_INFO=$(mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" poetry_quiz -N -e "
SELECT CONCAT('  ', table_name, ': ', table_rows, ' 条记录')
FROM information_schema.tables
WHERE table_schema = 'poetry_quiz'
ORDER BY table_name;
")

echo "$TABLES_INFO"
echo ""

# 9. 生成环境变量配置
echo -e "${BLUE}生成项目配置文件 .env.production${NC}"

cat > .env.production <<EOF
# 生产环境数据库配置
# 生成时间: $(date)

# 使用MySQL数据库模式
USE_LOCAL_STORAGE=false

# 数据库连接配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=${APP_USER}
DB_PASSWORD=${APP_PASSWORD}
DB_NAME=poetry_quiz

# DeepSeek API配置（如果需要）
# DEEPSEEK_API_KEY=your_api_key_here
EOF

echo -e "${GREEN}✓ 配置文件已生成: .env.production${NC}"
echo ""

# 10. 配置防火墙（可选）
echo -e "${BLUE}配置防火墙（如需远程访问）${NC}"
read -p "是否需要开放MySQL远程访问？(y/n) [n]: " OPEN_REMOTE
OPEN_REMOTE=${OPEN_REMOTE:-n}

if [ "$OPEN_REMOTE" = "y" ] || [ "$OPEN_REMOTE" = "Y" ]; then
    echo -e "${YELLOW}开放MySQL 3306端口...${NC}"

    # 检测防火墙类型
    if command -v firewall-cmd &> /dev/null; then
        # firewalld (CentOS)
        sudo firewall-cmd --permanent --add-port=3306/tcp
        sudo firewall-cmd --reload
        echo -e "${GREEN}✓ firewalld规则已添加${NC}"
    elif command -v ufw &> /dev/null; then
        # UFW (Ubuntu)
        sudo ufw allow 3306/tcp
        echo -e "${GREEN}✓ UFW规则已添加${NC}"
    else
        echo -e "${YELLOW}⚠ 未检测到防火墙，请手动配置${NC}"
    fi

    echo ""
    echo -e "${YELLOW}⚠ 重要提醒：${NC}"
    echo "1. 还需要在阿里云控制台配置安全组"
    echo "2. 添加入方向规则：3306/3306, TCP, 0.0.0.0/0"
    echo "3. 修改MySQL配置允许外部连接："
    echo "   编辑 /etc/my.cnf 或 /etc/mysql/mysql.conf.d/mysqld.cnf"
    echo "   设置: bind-address = 0.0.0.0"
    echo "4. 重启MySQL: sudo systemctl restart mysqld"
    echo ""
fi

# 11. 显示总结
echo ""
echo -e "${GREEN}======================================"
echo "  部署完成！"
echo "======================================${NC}"
echo ""
echo "数据库信息："
echo "  数据库名: poetry_quiz"
echo "  应用用户: ${APP_USER}"
echo "  应用密码: ${APP_PASSWORD}"
echo ""
echo "数据统计："
mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" poetry_quiz -N -e "
SELECT CONCAT('  用户数: ', COUNT(*)) FROM users
UNION ALL
SELECT CONCAT('  题目数: ', COUNT(*)) FROM questions
UNION ALL
SELECT CONCAT('  答题记录: ', COUNT(*)) FROM answers;
"
echo ""
echo "配置文件："
echo "  已生成: .env.production"
echo "  请根据需要复制到 .env.local"
echo ""
echo "下一步："
echo "  1. 复制配置: cp .env.production .env.local"
echo "  2. 安装依赖: npm install"
echo "  3. 构建项目: npm run build"
echo "  4. 启动服务: npm start"
echo "  或使用PM2: pm2 start npm --name poetry -- start"
echo ""
echo "测试连接："
echo "  mysql -h localhost -u ${APP_USER} -p poetry_quiz"
echo ""
echo -e "${YELLOW}⚠ 请妥善保存数据库密码！${NC}"
echo ""
