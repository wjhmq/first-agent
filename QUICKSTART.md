# 🚀 快速开始 - 小程序 API 测试

## 1️⃣ 启动开发服务器（如果尚未启动）

```bash
npm run dev
```

等待提示 "Ready in xxx ms"，服务器将在 `http://localhost:3000` 启动。

---

## 2️⃣ 测试方式

### 方式 1: 浏览器可视化测试（最简单 ⭐️）

打开浏览器访问：

```
http://localhost:3000/test-api.html
```

**功能特点：**
- 🎨 友好的可视化界面
- 🔘 一键快速测试按钮
- 📝 可自定义测试数据
- ✅ 实时显示响应结果
- 🎯 支持所有测试场景

**使用步骤：**
1. 点击快速测试按钮（如"测试 id=1"）
2. 或者输入自定义数据后点击"发送请求"
3. 查看响应结果

---

### 方式 2: 直接访问 GET 接口

在浏览器地址栏输入：

```
http://localhost:3000/api/miniprogram/get-data?id=1
```

将 `id=1` 改为其他值测试不同数据：
- `id=2` - 产品经理信息
- `id=3` - UI设计师信息
- `id=999` - 动态生成的数据

---

### 方式 3: 使用命令行测试脚本

```bash
bash test-api.sh
```

**前提条件：**
- 已安装 `curl` 命令
- 已安装 `jq` 命令（用于格式化 JSON）

如果没有 `jq`，可以安装：
```bash
# macOS
brew install jq

# Ubuntu/Debian
sudo apt-get install jq

# CentOS
sudo yum install jq
```

---

### 方式 4: 使用 Postman/Apifox

#### GET 请求
1. 新建请求
2. 方法: GET
3. URL: `http://localhost:3000/api/miniprogram/get-data`
4. Params 添加: `id = 1`
5. 点击 Send

#### POST 请求
1. 新建请求
2. 方法: POST
3. URL: `http://localhost:3000/api/miniprogram/post-data`
4. Headers 添加: `Content-Type: application/json`
5. Body 选择 raw + JSON，输入：
   ```json
   {
     "id": "1",
     "productName": "智能手表",
     "quantity": 1,
     "address": "北京市朝阳区xxx路xxx号"
   }
   ```
6. 点击 Send

---

## 3️⃣ 测试示例

### GET 接口测试用例

| ID | 说明 | 预期结果 |
|----|------|---------|
| 1 | 开发工程师 | 返回张三的完整信息 |
| 2 | 产品经理 | 返回李四的完整信息 |
| 3 | UI设计师 | 返回王五的完整信息 |
| 999 | 未定义ID | 动态生成默认数据 |
| (空) | 缺少参数 | 返回 400 错误 |

### POST 接口测试用例

| ID | 类型 | 预期结果 |
|----|------|---------|
| 1 | 商品订单 | 返回订单创建成功信息 |
| 2 | 服务订单 | 返回服务预约成功信息 |
| 3 | 反馈表单 | 返回反馈提交成功信息 |
| 999 | 自定义数据 | 返回通用处理结果 |
| (空) | 缺少参数 | 返回 400 错误 |

---

## 4️⃣ 响应示例

### 成功响应
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": "1",
    "name": "张三",
    "role": "开发工程师",
    ...
  },
  "timestamp": "2026-02-05T11:30:00.000Z"
}
```

### 错误响应
```json
{
  "code": 400,
  "message": "id 参数是必需的",
  "data": null
}
```

---

## 5️⃣ 小程序集成

### 在小程序中使用

```javascript
// GET 请求
wx.request({
  url: 'http://localhost:3000/api/miniprogram/get-data',
  method: 'GET',
  data: { id: '1' },
  success(res) {
    console.log(res.data);
  }
});

// POST 请求
wx.request({
  url: 'http://localhost:3000/api/miniprogram/post-data',
  method: 'POST',
  data: {
    id: '1',
    productName: '测试商品'
  },
  success(res) {
    console.log(res.data);
  }
});
```

**小程序开发者工具设置：**
- 打开"详情" -> "本地设置"
- 勾选"不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书"

---

## 6️⃣ 常见问题

### Q: 服务器启动失败？
**A:** 检查 3000 端口是否被占用：
```bash
lsof -i :3000
# 如果被占用，可以杀掉进程或改用其他端口
```

### Q: 无法访问 API？
**A:** 确认：
1. 服务器是否已启动
2. 访问的 URL 是否正确
3. 端口号是否正确（默认 3000）

### Q: 返回 404 错误？
**A:** 检查：
1. API 路径是否正确
2. 服务器是否已完全启动
3. 文件 `app/api/miniprogram/get-data/route.ts` 是否存在

### Q: 小程序无法访问本地接口？
**A:** 确保：
1. 电脑和手机在同一网络
2. 使用电脑的局域网 IP 地址，而不是 localhost
3. 开发者工具已关闭域名校验

---

## 7️⃣ 查看详细文档

- **完整 API 文档:** `API_USAGE.md`
- **接口说明:** `MINIPROGRAM_API.md`
- **部署指南:** `DEPLOY.md`

---

## 🎉 就这么简单！

现在您可以：
1. ✅ 在浏览器中测试 API
2. ✅ 在小程序中调用 API
3. ✅ 根据需要修改 mock 数据
4. ✅ 扩展更多接口功能

祝开发愉快！💪
