#!/bin/bash

# 我爱古诗词 - 数据库初始化脚本

echo "======================================"
echo "  我爱古诗词 - 数据库初始化脚本"
echo "======================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查MySQL是否安装
if ! command -v mysql &> /dev/null; then
    echo -e "${RED}错误: MySQL未安装${NC}"
    echo "请先安装MySQL："
    echo "  macOS:   brew install mysql"
    echo "  Ubuntu:  sudo apt install mysql-server"
    echo "  CentOS:  sudo yum install mysql-server"
    exit 1
fi

echo -e "${GREEN}✓ MySQL已安装${NC}"
echo ""

# 获取数据库配置
echo "请输入MySQL配置信息："
read -p "数据库主机 [localhost]: " DB_HOST
DB_HOST=${DB_HOST:-localhost}

read -p "数据库端口 [3306]: " DB_PORT
DB_PORT=${DB_PORT:-3306}

read -p "数据库用户 [root]: " DB_USER
DB_USER=${DB_USER:-root}

read -sp "数据库密码: " DB_PASSWORD
echo ""

read -p "数据库名称 [poetry_quiz]: " DB_NAME
DB_NAME=${DB_NAME:-poetry_quiz}

echo ""
echo "配置信息："
echo "  主机: $DB_HOST"
echo "  端口: $DB_PORT"
echo "  用户: $DB_USER"
echo "  数据库: $DB_NAME"
echo ""

read -p "确认以上配置？(y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "操作已取消"
    exit 1
fi

# 测试数据库连接
echo ""
echo "测试数据库连接..."
mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1;" &> /dev/null

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ 数据库连接失败${NC}"
    echo "请检查用户名和密码是否正确"
    exit 1
fi

echo -e "${GREEN}✓ 数据库连接成功${NC}"
echo ""

# 创建数据库和表
echo "正在创建数据库和表..."
mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" < database/schema.sql

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ 创建数据库失败${NC}"
    exit 1
fi

echo -e "${GREEN}✓ 数据库和表创建成功${NC}"
echo ""

# 导入初始数据
echo "正在导入初始题库数据..."
mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < database/init_data.sql

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ 导入数据失败${NC}"
    exit 1
fi

echo -e "${GREEN}✓ 初始数据导入成功${NC}"
echo ""

# 验证数据
echo "验证数据..."
QUESTION_COUNT=$(mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -N -e "SELECT COUNT(*) FROM questions;")
USER_COUNT=$(mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -N -e "SELECT COUNT(*) FROM users;")

echo "  题目数量: $QUESTION_COUNT"
echo "  用户数量: $USER_COUNT"
echo ""

if [ "$QUESTION_COUNT" -eq 0 ]; then
    echo -e "${YELLOW}⚠ 警告: 题库为空${NC}"
fi

# 创建.env.local文件
echo "正在创建环境变量文件..."

if [ -f ".env.local" ]; then
    echo -e "${YELLOW}⚠ .env.local已存在，是否覆盖？(y/n)${NC}"
    read -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "保留现有.env.local文件"
    else
        create_env=true
    fi
else
    create_env=true
fi

if [ "$create_env" = true ]; then
    cat > .env.local << EOF
# 数据库配置
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_NAME=$DB_NAME

# DeepSeek API配置（如果需要）
# DEEPSEEK_API_KEY=your_deepseek_api_key
EOF
    echo -e "${GREEN}✓ .env.local创建成功${NC}"
fi

echo ""
echo "======================================"
echo -e "${GREEN}  数据库初始化完成！${NC}"
echo "======================================"
echo ""
echo "接下来的步骤："
echo "  1. 安装依赖:    npm install"
echo "  2. 启动开发:    npm run dev"
echo "  3. 访问应用:    http://localhost:3000/poetry"
echo ""
echo "如有问题，请查阅 POETRY_README.md"
echo ""
