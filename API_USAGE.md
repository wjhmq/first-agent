# 小程序 API 接口文档

本文档说明了为小程序开发的两个 API 接口的使用方法。

## 接口概览

| 接口路径 | 方法 | 功能 | 参数 |
|---------|------|------|------|
| `/api/miniprogram/get-data` | GET | 获取用户信息 | id (查询参数) |
| `/api/miniprogram/post-data` | POST | 提交订单/表单 | id (请求体) |

---

## 1. GET 接口 - 获取用户信息

### 接口地址
```
GET /api/miniprogram/get-data
```

### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 用户ID |

### 请求示例

#### 使用 curl
```bash
# 获取用户 1 的信息
curl "http://localhost:3000/api/miniprogram/get-data?id=1"

# 获取用户 2 的信息
curl "http://localhost:3000/api/miniprogram/get-data?id=2"

# 获取用户 3 的信息
curl "http://localhost:3000/api/miniprogram/get-data?id=3"
```

#### 微信小程序请求示例
```javascript
// 在小程序中使用
wx.request({
  url: 'https://your-domain.com/api/miniprogram/get-data',
  method: 'GET',
  data: {
    id: '1'
  },
  success(res) {
    console.log('用户信息：', res.data);
    if (res.data.code === 200) {
      // 处理返回的数据
      const userInfo = res.data.data;
      console.log('用户姓名：', userInfo.name);
      console.log('用户角色：', userInfo.role);
    }
  },
  fail(err) {
    console.error('请求失败：', err);
  }
});
```

#### JavaScript Fetch 示例
```javascript
// 在网页或其他 JS 环境中使用
fetch('http://localhost:3000/api/miniprogram/get-data?id=1')
  .then(response => response.json())
  .then(data => {
    console.log('返回数据：', data);
    if (data.code === 200) {
      console.log('用户信息：', data.data);
    }
  })
  .catch(error => {
    console.error('请求错误：', error);
  });
```

### 响应示例

#### 成功响应 (id=1)
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": "1",
    "name": "张三",
    "avatar": "https://picsum.photos/200/200?random=1",
    "role": "开发工程师",
    "department": "技术部",
    "email": "zhangsan@example.com",
    "phone": "138****1234",
    "joinDate": "2023-01-15",
    "status": "active",
    "level": "P6",
    "skills": ["JavaScript", "TypeScript", "React", "Node.js"],
    "projects": [
      {
        "name": "项目A",
        "role": "前端负责人",
        "status": "进行中"
      },
      {
        "name": "项目B",
        "role": "全栈开发",
        "status": "已完成"
      }
    ]
  },
  "timestamp": "2026-02-05T11:30:00.000Z"
}
```

#### 成功响应 (id=2)
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": "2",
    "name": "李四",
    "avatar": "https://picsum.photos/200/200?random=2",
    "role": "产品经理",
    "department": "产品部",
    "email": "lisi@example.com",
    "phone": "139****5678",
    "joinDate": "2022-06-20",
    "status": "active",
    "level": "P7",
    "skills": ["产品设计", "需求分析", "Axure", "Figma"],
    "projects": [
      {
        "name": "项目C",
        "role": "产品负责人",
        "status": "进行中"
      }
    ]
  },
  "timestamp": "2026-02-05T11:30:00.000Z"
}
```

#### 错误响应（缺少 id）
```json
{
  "code": 400,
  "message": "id 参数是必需的",
  "data": null
}
```

#### 动态数据响应（未预设的 id）
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": "999",
    "name": "用户999",
    "avatar": "https://picsum.photos/200/200?random=999",
    "role": "员工",
    "department": "其他部门",
    "email": "user999@example.com",
    "phone": "138****0000",
    "joinDate": "2026-02-05",
    "status": "active",
    "level": "P4",
    "skills": ["通用技能"],
    "projects": [
      {
        "name": "默认项目",
        "role": "成员",
        "status": "进行中"
      }
    ]
  },
  "timestamp": "2026-02-05T11:30:00.000Z"
}
```

---

## 2. POST 接口 - 提交订单/表单

### 接口地址
```
POST /api/miniprogram/post-data
```

### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 用户ID/订单类型ID |
| ...其他 | any | 否 | 其他业务数据 |

### 请求示例

#### 使用 curl
```bash
# 提交商品订单 (id=1)
curl -X POST "http://localhost:3000/api/miniprogram/post-data" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "1",
    "productName": "智能手表",
    "quantity": 1,
    "address": "北京市朝阳区xxx路xxx号"
  }'

# 提交服务订单 (id=2)
curl -X POST "http://localhost:3000/api/miniprogram/post-data" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "2",
    "serviceType": "上门维修",
    "appointmentTime": "2026-02-07 14:00",
    "address": "上海市浦东新区xxx路xxx号"
  }'

# 提交反馈表单 (id=3)
curl -X POST "http://localhost:3000/api/miniprogram/post-data" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "3",
    "content": "建议增加深色模式",
    "category": "功能建议",
    "contact": "user@example.com"
  }'
```

#### 微信小程序请求示例
```javascript
// 提交商品订单
wx.request({
  url: 'https://your-domain.com/api/miniprogram/post-data',
  method: 'POST',
  header: {
    'content-type': 'application/json'
  },
  data: {
    id: '1',
    productName: '智能手表',
    quantity: 1,
    address: '北京市朝阳区xxx路xxx号',
    remark: '请尽快发货'
  },
  success(res) {
    console.log('订单提交结果：', res.data);
    if (res.data.code === 200) {
      const orderInfo = res.data.data;
      wx.showToast({
        title: '订单提交成功',
        icon: 'success'
      });
      console.log('订单号：', orderInfo.orderId);
    }
  },
  fail(err) {
    console.error('提交失败：', err);
    wx.showToast({
      title: '提交失败',
      icon: 'none'
    });
  }
});

// 提交反馈表单
wx.request({
  url: 'https://your-domain.com/api/miniprogram/post-data',
  method: 'POST',
  header: {
    'content-type': 'application/json'
  },
  data: {
    id: '3',
    content: '建议增加深色模式',
    category: '功能建议',
    contact: 'user@example.com'
  },
  success(res) {
    console.log('反馈提交结果：', res.data);
    if (res.data.code === 200) {
      wx.showToast({
        title: '反馈提交成功',
        icon: 'success'
      });
    }
  }
});
```

#### JavaScript Fetch 示例
```javascript
// 提交订单
fetch('http://localhost:3000/api/miniprogram/post-data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    id: '1',
    productName: '智能手表',
    quantity: 1,
    address: '北京市朝阳区xxx路xxx号'
  })
})
  .then(response => response.json())
  .then(data => {
    console.log('返回数据：', data);
    if (data.code === 200) {
      console.log('订单信息：', data.data);
      console.log('订单号：', data.data.orderId);
    }
  })
  .catch(error => {
    console.error('请求错误：', error);
  });
```

### 响应示例

#### 成功响应 (id=1 - 商品订单)
```json
{
  "code": 200,
  "message": "提交成功",
  "data": {
    "orderId": "ORD1738758600000",
    "userId": "1",
    "type": "商品订单",
    "status": "processing",
    "amount": 199.99,
    "items": [
      {
        "productId": "P001",
        "name": "智能手表",
        "quantity": 1,
        "price": 199.99
      }
    ],
    "paymentMethod": "微信支付",
    "createTime": "2026-02-05T11:30:00.000Z",
    "estimatedDelivery": "2026-02-08",
    "trackingNumber": null,
    "message": "订单已创建，等待支付",
    "submittedData": {
      "productName": "智能手表",
      "quantity": 1,
      "address": "北京市朝阳区xxx路xxx号"
    }
  },
  "timestamp": "2026-02-05T11:30:00.000Z"
}
```

#### 成功响应 (id=2 - 服务订单)
```json
{
  "code": 200,
  "message": "提交成功",
  "data": {
    "orderId": "ORD1738758600000",
    "userId": "2",
    "type": "服务订单",
    "status": "confirmed",
    "amount": 299.00,
    "items": [
      {
        "serviceId": "S001",
        "name": "上门维修服务",
        "quantity": 1,
        "price": 299.00
      }
    ],
    "paymentMethod": "支付宝",
    "createTime": "2026-02-05T11:30:00.000Z",
    "scheduledTime": "2026-02-07T11:30:00.000Z",
    "technician": {
      "name": "王师傅",
      "phone": "138****5678",
      "rating": 4.9
    },
    "message": "服务已确认，技师将按约定时间上门",
    "submittedData": {
      "serviceType": "上门维修",
      "appointmentTime": "2026-02-07 14:00",
      "address": "上海市浦东新区xxx路xxx号"
    }
  },
  "timestamp": "2026-02-05T11:30:00.000Z"
}
```

#### 成功响应 (id=3 - 反馈表单)
```json
{
  "code": 200,
  "message": "提交成功",
  "data": {
    "formId": "FORM1738758600000",
    "userId": "3",
    "type": "反馈表单",
    "status": "submitted",
    "category": "功能建议",
    "priority": "medium",
    "content": "建议增加深色模式",
    "attachments": [],
    "createTime": "2026-02-05T11:30:00.000Z",
    "responseTime": "2026-02-06T11:30:00.000Z",
    "assignee": {
      "name": "客服小李",
      "department": "客服部"
    },
    "message": "您的反馈已收到，我们将在24小时内回复",
    "submittedData": {
      "content": "建议增加深色模式",
      "category": "功能建议",
      "contact": "user@example.com"
    }
  },
  "timestamp": "2026-02-05T11:30:00.000Z"
}
```

#### 错误响应（缺少 id）
```json
{
  "code": 400,
  "message": "id 参数是必需的",
  "data": null
}
```

---

## 响应码说明

| 状态码 | 说明 |
|-------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 500 | 服务器内部错误 |

## 响应数据结构

所有接口返回的数据都遵循统一的结构：

```typescript
interface ApiResponse<T> {
  code: number;        // 状态码
  message: string;     // 提示信息
  data: T | null;      // 业务数据
  timestamp?: string;  // 时间戳（可选）
}
```

---

## 本地测试

### 启动开发服务器
```bash
npm run dev
```

服务器启动后，可以通过以下地址访问：
- 本地地址: `http://localhost:3000`
- GET 接口: `http://localhost:3000/api/miniprogram/get-data?id=1`
- POST 接口: `http://localhost:3000/api/miniprogram/post-data`

### 使用浏览器测试 GET 接口
直接在浏览器地址栏输入：
```
http://localhost:3000/api/miniprogram/get-data?id=1
```

### 使用 Postman 测试

#### GET 接口
1. 选择 GET 方法
2. URL: `http://localhost:3000/api/miniprogram/get-data`
3. Params: 添加 `id` 参数，值为 `1`, `2`, `3` 等
4. 点击 Send

#### POST 接口
1. 选择 POST 方法
2. URL: `http://localhost:3000/api/miniprogram/post-data`
3. Headers: 添加 `Content-Type: application/json`
4. Body: 选择 raw 和 JSON 格式，输入：
   ```json
   {
     "id": "1",
     "productName": "测试商品",
     "quantity": 2
   }
   ```
5. 点击 Send

---

## 生产环境部署

### 域名配置
将 `localhost:3000` 替换为您的实际域名：
```
https://your-domain.com/api/miniprogram/get-data
https://your-domain.com/api/miniprogram/post-data
```

### 小程序服务器域名配置
在微信小程序后台配置服务器域名：
1. 登录微信公众平台
2. 开发 -> 开发管理 -> 开发设置 -> 服务器域名
3. 添加 `request合法域名`: `https://your-domain.com`

---

## 注意事项

1. ⚠️ 这些接口暂时没有登录验证和权限控制
2. 📝 返回的都是 mock 数据，实际使用时需要连接真实数据库
3. 🔐 生产环境建议添加：
   - 用户认证（JWT token）
   - 请求频率限制
   - 参数验证和过滤
   - 日志记录
   - 错误监控
4. 🌐 小程序请求需要使用 HTTPS 协议
5. 📱 测试时可以使用微信开发者工具的"不校验合法域名"选项

---

## 扩展建议

### 1. 添加更多业务场景
- 添加分页支持
- 支持搜索和筛选
- 支持批量操作

### 2. 数据持久化
- 连接 MongoDB/MySQL 数据库
- 使用 Prisma ORM

### 3. 安全增强
- 添加 JWT 认证
- 添加 CORS 配置
- 添加请求签名验证

### 4. 性能优化
- 添加 Redis 缓存
- 实现接口限流
- 优化数据库查询

---

如有问题，请联系开发团队。
