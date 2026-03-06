#!/bin/bash

# 我爱古诗词 - API测试脚本

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"

echo "======================================"
echo "  我爱古诗词 - API测试"
echo "======================================"
echo ""

# 检查服务是否运行
echo -e "${BLUE}检查服务状态...${NC}"
if ! curl -s "$BASE_URL" > /dev/null 2>&1; then
    echo -e "${RED}✗ 服务未运行${NC}"
    echo "请先启动服务: npm run dev"
    exit 1
fi
echo -e "${GREEN}✓ 服务正在运行${NC}"
echo ""

# 测试1: 获取用户信息
echo -e "${BLUE}测试1: 获取用户信息${NC}"
echo "请求: GET $BASE_URL/api/poetry/user/info?userId=1"
response=$(curl -s "$BASE_URL/api/poetry/user/info?userId=1")
echo "响应: $response"

if echo "$response" | grep -q '"code":0'; then
    echo -e "${GREEN}✓ 获取用户信息成功${NC}"
    nickname=$(echo "$response" | grep -o '"nickname":"[^"]*"' | cut -d'"' -f4)
    score=$(echo "$response" | grep -o '"score":[0-9]*' | cut -d':' -f2)
    echo "  用户昵称: $nickname"
    echo "  当前积分: $score"
else
    echo -e "${RED}✗ 获取用户信息失败${NC}"
fi
echo ""

# 测试2: 获取随机题目
echo -e "${BLUE}测试2: 获取随机题目${NC}"
echo "请求: GET $BASE_URL/api/poetry/question/random"
response=$(curl -s "$BASE_URL/api/poetry/question/random")
echo "响应: $response"

if echo "$response" | grep -q '"code":0'; then
    echo -e "${GREEN}✓ 获取题目成功${NC}"
    question_id=$(echo "$response" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    given_line=$(echo "$response" | grep -o '"givenLine":"[^"]*"' | cut -d'"' -f4)
    direction=$(echo "$response" | grep -o '"direction":"[^"]*"' | cut -d'"' -f4)
    echo "  题目ID: $question_id"
    echo "  诗句: $given_line"
    echo "  方向: $direction"
else
    echo -e "${RED}✗ 获取题目失败${NC}"
    echo -e "${YELLOW}请确保数据库已初始化并导入了题目数据${NC}"
    exit 1
fi
echo ""

# 测试3: 提交答案（故意提交错误答案）
echo -e "${BLUE}测试3: 提交答案（测试答错情况）${NC}"
echo "请求: POST $BASE_URL/api/poetry/answer/submit"
echo "数据: {\"questionId\":$question_id,\"option\":\"A\",\"userId\":1}"
response=$(curl -s -X POST "$BASE_URL/api/poetry/answer/submit" \
  -H "Content-Type: application/json" \
  -d "{\"questionId\":$question_id,\"option\":\"A\",\"userId\":1}")
echo "响应: $response"

if echo "$response" | grep -q '"code":0'; then
    echo -e "${GREEN}✓ 提交答案成功${NC}"
    is_correct=$(echo "$response" | grep -o '"correct":[^,]*' | cut -d':' -f2)
    correct_option=$(echo "$response" | grep -o '"correctOption":"[^"]*"' | cut -d'"' -f4)
    message=$(echo "$response" | grep -o '"message":"[^"]*"' | cut -d'"' -f4)

    if [ "$is_correct" = "true" ]; then
        echo -e "  结果: ${GREEN}答对了！${NC}"
    else
        echo -e "  结果: ${YELLOW}答错了${NC}"
    fi
    echo "  正确答案: $correct_option"
    echo "  提示: $message"
else
    echo -e "${RED}✗ 提交答案失败${NC}"
fi
echo ""

# 测试4: 再次获取用户信息（验证数据是否更新）
echo -e "${BLUE}测试4: 验证用户数据更新${NC}"
echo "请求: GET $BASE_URL/api/poetry/user/info?userId=1"
response=$(curl -s "$BASE_URL/api/poetry/user/info?userId=1")

if echo "$response" | grep -q '"code":0'; then
    echo -e "${GREEN}✓ 获取用户信息成功${NC}"
    new_score=$(echo "$response" | grep -o '"score":[0-9]*' | cut -d':' -f2)
    streak=$(echo "$response" | grep -o '"streak":[0-9]*' | cut -d':' -f2)
    echo "  当前积分: $new_score"
    echo "  当前连胜: $streak"
else
    echo -e "${RED}✗ 获取用户信息失败${NC}"
fi
echo ""

# 测试5: 获取指定难度的题目
echo -e "${BLUE}测试5: 获取指定难度题目（难度1）${NC}"
echo "请求: GET $BASE_URL/api/poetry/question/random?difficulty=1"
response=$(curl -s "$BASE_URL/api/poetry/question/random?difficulty=1")

if echo "$response" | grep -q '"code":0'; then
    echo -e "${GREEN}✓ 获取指定难度题目成功${NC}"
    difficulty=$(echo "$response" | grep -o '"difficulty":[0-9]*' | cut -d':' -f2)
    source_poem=$(echo "$response" | grep -o '"sourcePoem":"[^"]*"' | cut -d'"' -f4)
    echo "  难度: $difficulty"
    echo "  出处: 《$source_poem》"
else
    echo -e "${RED}✗ 获取指定难度题目失败${NC}"
fi
echo ""

# 总结
echo "======================================"
echo -e "${GREEN}  API测试完成！${NC}"
echo "======================================"
echo ""
echo "如果所有测试都通过，说明后端API工作正常。"
echo "现在可以访问前端页面进行测试："
echo -e "${BLUE}  http://localhost:3000/poetry${NC}"
echo ""
