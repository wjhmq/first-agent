#!/bin/bash

# 访问日志检查和修复脚本

set -e

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}======================================${NC}"
echo "  访问日志功能检查"
echo -e "${BLUE}======================================${NC}"
echo ""

# 读取数据库配置
if [ ! -f ".env.local" ]; then
    echo -e "${RED}✗ 未找到 .env.local 文件${NC}"
    echo "请先运行: ./setup-mysql-mode.sh"
    exit 1
fi

# 提取数据库配置
DB_USER=$(grep "^DB_USER=" .env.local | cut -d'=' -f2)
DB_PASSWORD=$(grep "^DB_PASSWORD=" .env.local | cut -d'=' -f2)
DB_NAME=$(grep "^DB_NAME=" .env.local | cut -d'=' -f2)

if [ -z "$DB_PASSWORD" ] || [ "$DB_PASSWORD" = "YOUR_ROOT_PASSWORD_HERE" ]; then
    echo -e "${RED}✗ 数据库密码未配置${NC}"
    echo "请编辑 .env.local 文件填入密码"
    exit 1
fi

echo -e "${BLUE}[1/5] 检查数据库连接${NC}"
if mysql -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "SELECT 1;" &>/dev/null; then
    echo -e "${GREEN}✓ 数据库连接正常${NC}"
else
    echo -e "${RED}✗ 数据库连接失败${NC}"
    exit 1
fi
echo ""

echo -e "${BLUE}[2/5] 检查visit_logs表是否存在${NC}"
TABLE_EXISTS=$(mysql -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -N -e "
SELECT COUNT(*)
FROM information_schema.tables
WHERE table_schema='$DB_NAME' AND table_name='visit_logs';
")

if [ "$TABLE_EXISTS" -eq 1 ]; then
    echo -e "${GREEN}✓ visit_logs表已存在${NC}"
else
    echo -e "${YELLOW}⚠ visit_logs表不存在，正在创建...${NC}"

    if [ -f "database/visit_logs.sql" ]; then
        mysql -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < database/visit_logs.sql
        echo -e "${GREEN}✓ visit_logs表创建成功${NC}"
    else
        echo -e "${RED}✗ 找不到 database/visit_logs.sql 文件${NC}"
        exit 1
    fi
fi
echo ""

echo -e "${BLUE}[3/5] 查看表结构${NC}"
mysql -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "DESCRIBE visit_logs;"
echo ""

echo -e "${BLUE}[4/5] 查看现有日志记录${NC}"
LOG_COUNT=$(mysql -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -N -e "SELECT COUNT(*) FROM visit_logs;")
echo "日志总数: ${LOG_COUNT}"

if [ "$LOG_COUNT" -gt 0 ]; then
    echo ""
    echo "最近5条日志记录:"
    mysql -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "
    SELECT
      id,
      page,
      LEFT(user_agent, 30) as user_agent,
      ip,
      timestamp
    FROM visit_logs
    ORDER BY timestamp DESC
    LIMIT 5;
    "
else
    echo -e "${YELLOW}⚠ 暂无日志记录${NC}"
fi
echo ""

echo -e "${BLUE}[5/5] 检查环境配置${NC}"
USE_LOCAL_STORAGE=$(grep "^USE_LOCAL_STORAGE=" .env.local | cut -d'=' -f2)
echo "USE_LOCAL_STORAGE=${USE_LOCAL_STORAGE}"

if [ "$USE_LOCAL_STORAGE" = "true" ]; then
    echo -e "${YELLOW}⚠ 当前配置为localStorage模式${NC}"
    echo "访问日志不会保存到数据库"
    echo ""
    echo "如需保存到数据库，请修改 .env.local:"
    echo "USE_LOCAL_STORAGE=false"
else
    echo -e "${GREEN}✓ 当前配置为MySQL模式${NC}"
    echo "访问日志会保存到数据库"
fi
echo ""

echo -e "${BLUE}======================================${NC}"
echo "  测试建议"
echo -e "${BLUE}======================================${NC}"
echo ""
echo "1. 确保应用已启动:"
echo "   npm run dev"
echo ""
echo "2. 访问以下页面:"
echo "   http://localhost:3000"
echo "   http://localhost:3000/chat"
echo "   http://localhost:3000/poetry"
echo ""
echo "3. 再次运行此脚本查看日志:"
echo "   ./check-visit-logs.sh"
echo ""
echo "4. 查看应用日志（终端输出）:"
echo "   应该看到: [访问日志] 已记录: /poetry - ..."
echo ""
echo "5. 直接查询数据库:"
echo "   mysql -u $DB_USER -p $DB_NAME -e \"SELECT * FROM visit_logs ORDER BY timestamp DESC LIMIT 10;\""
echo ""

echo -e "${GREEN}✨ 检查完成！${NC}"
echo ""
