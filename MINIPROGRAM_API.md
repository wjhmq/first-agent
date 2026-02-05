# 小程序 API 接口说明

## 📋 概述

已为小程序添加了两个 mock API 接口，支持接收 `id` 参数并返回不同的模拟数据。这些接口暂时不包含登录验证和权限控制，可直接用于小程序开发和测试。

---

## 🎯 新增接口

### 1. GET 接口 - 获取用户信息

**接口路径:** `/api/miniprogram/get-data`
**请求方法:** GET
**参数:** `id` (查询参数)

**功能说明:**
- 根据不同的 `id` 返回不同的用户信息
- 包含用户基本信息、技能、项目等数据
- 支持动态生成未预设的 id 数据

**预设的 mock 数据:**
- `id=1`: 开发工程师（张三）
- `id=2`: 产品经理（李四）
- `id=3`: UI 设计师（王五）
- 其他 id: 动态生成的默认数据

---

### 2. POST 接口 - 提交订单/表单

**接口路径:** `/api/miniprogram/post-data`
**请求方法:** POST
**参数:** `id` (请求体) + 其他业务数据

**功能说明:**
- 根据不同的 `id` 返回不同类型的响应数据
- 支持商品订单、服务订单、反馈表单等多种场景
- 会回显提交的数据

**预设的 mock 响应:**
- `id=1`: 商品订单响应
- `id=2`: 服务订单响应
- `id=3`: 反馈表单响应
- 其他 id: 通用请求响应

---

## 📁 项目结构

```
app/api/miniprogram/
├── get-data/
│   └── route.ts          # GET 接口实现
└── post-data/
    └── route.ts          # POST 接口实现
```

---

## 🚀 快速开始

### 1. 启动开发服务器

```bash
npm run dev
```

服务器将在 `http://localhost:3000` 启动

### 2. 测试接口

#### 方法 1: 使用浏览器测试页面（推荐）

打开浏览器访问：
```
http://localhost:3000/test-api.html
```

这个页面提供了友好的界面来测试所有接口功能。

#### 方法 2: 使用命令行测试脚本

```bash
bash test-api.sh
```

需要确保已安装 `curl` 和 `jq` 命令。

#### 方法 3: 直接在浏览器访问 GET 接口

```
http://localhost:3000/api/miniprogram/get-data?id=1
```

---

## 💻 使用示例

### 微信小程序中使用

#### GET 请求示例

```javascript
// 获取用户信息
wx.request({
  url: 'https://your-domain.com/api/miniprogram/get-data',
  method: 'GET',
  data: {
    id: '1'
  },
  success(res) {
    console.log('用户信息：', res.data);
    if (res.data.code === 200) {
      const userInfo = res.data.data;
      // 使用用户信息
      console.log('姓名：', userInfo.name);
      console.log('角色：', userInfo.role);
    }
  },
  fail(err) {
    console.error('请求失败：', err);
  }
});
```

#### POST 请求示例

```javascript
// 提交订单
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
    address: '北京市朝阳区xxx路xxx号'
  },
  success(res) {
    console.log('订单提交结果：', res.data);
    if (res.data.code === 200) {
      wx.showToast({
        title: '提交成功',
        icon: 'success'
      });
      console.log('订单号：', res.data.data.orderId);
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
```

---

## 📝 响应格式

所有接口统一返回以下格式：

```typescript
{
  code: number;        // 状态码 (200=成功, 400=参数错误, 500=服务器错误)
  message: string;     // 提示信息
  data: any | null;    // 业务数据
  timestamp?: string;  // 时间戳
}
```

---

## 📖 详细文档

- **完整 API 文档:** 查看 `API_USAGE.md` 文件
- **测试脚本:** 使用 `test-api.sh` 脚本
- **测试页面:** 访问 `/test-api.html` 页面

---

## 🔧 配置说明

### 本地开发

接口地址: `http://localhost:3000`

### 生产环境

1. 将项目部署到服务器
2. 使用 HTTPS 协议（小程序要求）
3. 配置域名: `https://your-domain.com`

### 小程序配置

在微信小程序后台配置服务器域名：

1. 登录 [微信公众平台](https://mp.weixin.qq.com)
2. 开发 -> 开发管理 -> 开发设置 -> 服务器域名
3. 添加 **request合法域名**: `https://your-domain.com`

---

## ⚠️ 注意事项

1. **无需认证:** 这些接口目前没有登录验证，可直接访问
2. **Mock 数据:** 返回的都是模拟数据，实际使用时需要连接真实数据库
3. **HTTPS 要求:** 小程序正式环境必须使用 HTTPS 协议
4. **测试环境:** 在微信开发者工具中测试时，可以选择"不校验合法域名"

---

## 🎨 特性

- ✅ 支持 GET 和 POST 请求
- ✅ 接收 `id` 参数返回不同数据
- ✅ 统一的响应格式
- ✅ 详细的错误提示
- ✅ 支持动态数据生成
- ✅ 包含时间戳
- ✅ 回显提交的数据
- ✅ 无需登录验证（适合快速开发）

---

## 🔮 未来扩展

建议在生产环境中添加：

### 1. 安全增强
- JWT 认证
- 请求签名验证
- CORS 配置
- 请求频率限制

### 2. 数据持久化
- 连接数据库（MongoDB/MySQL）
- 使用 ORM（Prisma）
- 实现真实的 CRUD 操作

### 3. 功能完善
- 分页支持
- 搜索和筛选
- 数据校验
- 文件上传
- 图片处理

### 4. 性能优化
- Redis 缓存
- CDN 加速
- 数据库索引优化

---

## 📞 技术支持

如遇到问题：

1. 查看 `API_USAGE.md` 详细文档
2. 使用 `test-api.html` 测试页面进行调试
3. 检查浏览器控制台错误信息
4. 查看服务器日志

---

## 📚 相关文件

- `app/api/miniprogram/get-data/route.ts` - GET 接口实现
- `app/api/miniprogram/post-data/route.ts` - POST 接口实现
- `API_USAGE.md` - 完整 API 使用文档
- `test-api.sh` - 命令行测试脚本
- `public/test-api.html` - 浏览器测试页面

---

祝开发顺利！🎉
