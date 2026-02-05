#!/bin/bash

# API 接口测试脚本
# 使用方法: bash test-api.sh

echo "========================================="
echo "开始测试 API 接口"
echo "========================================="
echo ""

BASE_URL="http://localhost:3000"

# 测试 GET 接口
echo "📡 测试 GET 接口..."
echo "========================================="
echo ""

echo "1️⃣ 测试 GET 请求 - id=1 (开发工程师)"
echo "---"
curl -s "${BASE_URL}/api/miniprogram/get-data?id=1" | jq '.'
echo ""
echo ""

echo "2️⃣ 测试 GET 请求 - id=2 (产品经理)"
echo "---"
curl -s "${BASE_URL}/api/miniprogram/get-data?id=2" | jq '.'
echo ""
echo ""

echo "3️⃣ 测试 GET 请求 - id=3 (UI设计师)"
echo "---"
curl -s "${BASE_URL}/api/miniprogram/get-data?id=3" | jq '.'
echo ""
echo ""

echo "4️⃣ 测试 GET 请求 - 动态 id=999"
echo "---"
curl -s "${BASE_URL}/api/miniprogram/get-data?id=999" | jq '.'
echo ""
echo ""

echo "5️⃣ 测试 GET 请求 - 缺少 id (应该返回错误)"
echo "---"
curl -s "${BASE_URL}/api/miniprogram/get-data" | jq '.'
echo ""
echo ""

# 测试 POST 接口
echo "========================================="
echo "📤 测试 POST 接口..."
echo "========================================="
echo ""

echo "6️⃣ 测试 POST 请求 - id=1 (商品订单)"
echo "---"
curl -s -X POST "${BASE_URL}/api/miniprogram/post-data" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "1",
    "productName": "智能手表",
    "quantity": 1,
    "address": "北京市朝阳区xxx路xxx号"
  }' | jq '.'
echo ""
echo ""

echo "7️⃣ 测试 POST 请求 - id=2 (服务订单)"
echo "---"
curl -s -X POST "${BASE_URL}/api/miniprogram/post-data" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "2",
    "serviceType": "上门维修",
    "appointmentTime": "2026-02-07 14:00",
    "address": "上海市浦东新区xxx路xxx号"
  }' | jq '.'
echo ""
echo ""

echo "8️⃣ 测试 POST 请求 - id=3 (反馈表单)"
echo "---"
curl -s -X POST "${BASE_URL}/api/miniprogram/post-data" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "3",
    "content": "建议增加深色模式",
    "category": "功能建议",
    "contact": "user@example.com"
  }' | jq '.'
echo ""
echo ""

echo "9️⃣ 测试 POST 请求 - 动态 id=999"
echo "---"
curl -s -X POST "${BASE_URL}/api/miniprogram/post-data" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "999",
    "customData": "自定义数据",
    "test": true
  }' | jq '.'
echo ""
echo ""

echo "🔟 测试 POST 请求 - 缺少 id (应该返回错误)"
echo "---"
curl -s -X POST "${BASE_URL}/api/miniprogram/post-data" \
  -H "Content-Type: application/json" \
  -d '{
    "productName": "测试商品"
  }' | jq '.'
echo ""
echo ""

echo "========================================="
echo "✅ 测试完成！"
echo "========================================="
