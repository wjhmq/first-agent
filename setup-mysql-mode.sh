#!/bin/bash

# MySQL模式配置脚本
# 用途：快速配置项目使用MySQL数据库

set -e

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}======================================${NC}"
echo "  配置MySQL数据库模式"
echo -e "${BLUE}======================================${NC}"
echo ""

# 检查是否已有配置文件
if [ -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  检测到已存在 .env.local 文件${NC}"
    read -p "是否覆盖现有配置？(y/n) [n]: " OVERWRITE
    OVERWRITE=${OVERWRITE:-n}

    if [ "$OVERWRITE" != "y" ] && [ "$OVERWRITE" != "Y" ]; then
        echo "操作已取消"
        exit 0
    fi

    # 备份现有配置
    cp .env.local .env.local.backup.$(date +%Y%m%d_%H%M%S)
    echo -e "${GREEN}✓ 已备份现有配置${NC}"
fi

# 获取数据库配置
echo ""
echo -e "${BLUE}请输入MySQL数据库配置信息：${NC}"
echo ""

read -p "数据库主机 [localhost]: " DB_HOST
DB_HOST=${DB_HOST:-localhost}

read -p "数据库端口 [3306]: " DB_PORT
DB_PORT=${DB_PORT:-3306}

read -p "数据库用户名 [poetry_user]: " DB_USER
DB_USER=${DB_USER:-poetry_user}

read -sp "数据库密码: " DB_PASSWORD
echo ""

if [ -z "$DB_PASSWORD" ]; then
    echo -e "${YELLOW}⚠️  密码不能为空${NC}"
    exit 1
fi

read -p "数据库名称 [poetry_quiz]: " DB_NAME
DB_NAME=${DB_NAME:-poetry_quiz}

# 测试数据库连接
echo ""
echo -e "${YELLOW}测试数据库连接...${NC}"

if command -v mysql &> /dev/null; then
    if mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "SELECT 1;" &>/dev/null; then
        echo -e "${GREEN}✓ 数据库连接成功${NC}"

        # 验证表是否存在
        TABLE_COUNT=$(mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -N -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='$DB_NAME' AND table_name IN ('users', 'questions', 'answers');")

        if [ "$TABLE_COUNT" -eq 3 ]; then
            echo -e "${GREEN}✓ 数据库表已就绪${NC}"

            # 查询题目数量
            QUESTION_COUNT=$(mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -N -e "SELECT COUNT(*) FROM questions;")
            echo -e "${GREEN}✓ 题库包含 $QUESTION_COUNT 道题目${NC}"
        else
            echo -e "${YELLOW}⚠️  数据库表不完整（找到 $TABLE_COUNT/3 个表）${NC}"
            echo ""
            read -p "是否现在导入数据库表？(y/n) [y]: " IMPORT_DB
            IMPORT_DB=${IMPORT_DB:-y}

            if [ "$IMPORT_DB" = "y" ] || [ "$IMPORT_DB" = "Y" ]; then
                echo "导入表结构..."
                mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < database/schema.sql
                echo -e "${GREEN}✓ 表结构导入成功${NC}"

                echo "导入题库数据..."
                mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < database/init_data.sql
                echo -e "${GREEN}✓ 题库数据导入成功${NC}"

                if [ -f "database/visit_logs.sql" ]; then
                    echo "导入访问日志表..."
                    mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < database/visit_logs.sql
                    echo -e "${GREEN}✓ 访问日志表导入成功${NC}"
                fi
            fi
        fi
    else
        echo -e "${YELLOW}⚠️  数据库连接失败，请检查配置${NC}"
        echo ""
        read -p "是否仍要生成配置文件？(y/n) [y]: " CONTINUE
        CONTINUE=${CONTINUE:-y}

        if [ "$CONTINUE" != "y" ] && [ "$CONTINUE" != "Y" ]; then
            exit 1
        fi
    fi
else
    echo -e "${YELLOW}⚠️  未安装mysql客户端，跳过连接测试${NC}"
fi

# 生成配置文件
echo ""
echo -e "${BLUE}生成配置文件 .env.local${NC}"

cat > .env.local <<EOF
# 环境配置文件
# 生成时间: $(date)

# ========================================
# 存储模式配置
# ========================================
# false = 使用MySQL数据库（生产模式）
# true = 使用localStorage（开发调试模式）
USE_LOCAL_STORAGE=false

# ========================================
# MySQL数据库配置
# ========================================
DB_HOST=${DB_HOST}
DB_PORT=${DB_PORT}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=${DB_NAME}

# ========================================
# DeepSeek API配置（可选）
# ========================================
# 如果不配置，聊天功能将不可用
# DEEPSEEK_API_KEY=your_deepseek_api_key_here

# ========================================
# 使用说明
# ========================================
#
# 【切换到本地存储模式】
# 1. 修改 USE_LOCAL_STORAGE=true
# 2. 重启应用: npm run dev
#
# 【切换回MySQL模式】
# 1. 修改 USE_LOCAL_STORAGE=false
# 2. 确保数据库配置正确
# 3. 重启应用
#
# 【验证当前模式】
# grep USE_LOCAL_STORAGE .env.local
#
# 详细说明请查看: STORAGE_MODE_GUIDE.md
#
EOF

echo -e "${GREEN}✓ 配置文件已生成${NC}"

# 设置文件权限
chmod 600 .env.local
echo -e "${GREEN}✓ 已设置文件权限 (600)${NC}"

# 显示配置摘要
echo ""
echo -e "${BLUE}======================================${NC}"
echo "  配置完成"
echo -e "${BLUE}======================================${NC}"
echo ""
echo "存储模式: MySQL"
echo "数据库主机: ${DB_HOST}:${DB_PORT}"
echo "数据库名称: ${DB_NAME}"
echo "数据库用户: ${DB_USER}"
echo ""
echo -e "${YELLOW}下一步：${NC}"
echo "  1. 安装依赖（如果还没有）："
echo "     npm install"
echo ""
echo "  2. 启动应用："
echo "     npm run dev"
echo ""
echo "  3. 访问页面："
echo "     http://localhost:3000"
echo ""
echo "  4. 查看配置切换指南："
echo "     cat STORAGE_MODE_GUIDE.md"
echo ""
echo -e "${GREEN}✨ MySQL模式已配置完成！${NC}"
echo ""
