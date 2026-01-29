# DeepSeek 聊天应用

这是一个基于 Next.js、React 和 DeepSeek AI 构建的现代化实时聊天应用。该应用提供了一个干净、响应式的界面，可以使用服务器发送事件（SSE）实现流式输出，与 DeepSeek 的 AI 模型进行对话。

## 功能特性

- **实时流式输出**：使用 SSE 实现消息的实时流式传输，提供流畅的聊天体验
- **三种对话模式**：
  - 🔵 **普通模式**：标准的 AI 对话
  - 🟣 **深度思考模式**：使用 DeepSeek Reasoner 模型，展示详细的推理过程
  - 🟢 **联网搜索模式**：可获取最新信息的增强模式
- **思考过程展示**：深度思考模式下，可查看 AI 的推理过程
- **H5 移动端适配**：使用 postcss-pxtorem 实现完美的移动端适配
- **现代化 UI**：采用 Tailwind CSS 打造的简洁响应式设计，支持深色模式
- **类型安全**：使用 TypeScript 构建，提供更好的开发体验
- **边缘运行时**：API 路由使用 Next.js Edge Runtime 优化，性能更佳
- **可扩展架构**：易于添加新的路由、页面和功能

## 技术栈

- **框架**：[Next.js 15](https://nextjs.org/) (App Router)
- **UI 库**：[React 19](https://react.dev/)
- **样式**：[Tailwind CSS](https://tailwindcss.com/)
- **编程语言**：[TypeScript](https://www.typescriptlang.org/)
- **移动端适配**：postcss-pxtorem (自动 px 转 rem)
- **AI 提供商**：[DeepSeek API](https://platform.deepseek.com/)
  - deepseek-chat (普通模式/联网搜索)
  - deepseek-reasoner (深度思考模式)

## 项目结构

```
first-agent/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # 聊天 API 端点，支持 SSE
│   ├── globals.css               # 全局样式，包含 Tailwind 指令
│   ├── layout.tsx                # 根布局组件
│   └── page.tsx                  # 主聊天界面
├── .env.local                    # 环境变量（不在 git 中）
├── .env.example                  # 环境变量模板
├── next.config.ts                # Next.js 配置
├── tailwind.config.ts            # Tailwind CSS 配置
├── tsconfig.json                 # TypeScript 配置
└── package.json                  # 项目依赖和脚本
```

## 架构概览

### 前端 (app/page.tsx)
- **组件类型**：客户端 React 组件
- **状态管理**：使用 React hooks (`useState`, `useRef`, `useEffect`)
- **核心功能**：
  - 三种对话模式切换（普通/深度思考/联网搜索）
  - 消息历史管理
  - 通过 SSE 实时更新消息
  - 深度思考过程的展开/折叠展示
  - 自动滚动到最新消息
  - 加载状态和错误处理
  - H5 移动端完美适配（px 自动转 rem）
  - 移动端和桌面端响应式设计

### API 层 (app/api/chat/route.ts)
- **运行时**：Edge Runtime，性能最优
- **协议**：服务器发送事件（SSE）用于流式传输
- **模式支持**：
  - 普通模式：使用 deepseek-chat 模型
  - 深度思考模式：使用 deepseek-reasoner 模型，返回推理过程
  - 联网搜索模式：使用 deepseek-chat + 系统提示词
- **流程**：
  1. 通过 POST 请求接收用户消息和模式选择
  2. 从环境变量验证 API 密钥
  3. 根据模式选择对应的模型和配置
  4. 将请求转发到 DeepSeek API，启用流式输出
  5. 解析流式响应块（包括推理内容和回答内容）
  6. 将数据重新格式化为 SSE 格式流回客户端

### 样式与移动端适配
- **Tailwind CSS**：实用优先的 CSS 框架，自定义 px 单位配置
- **postcss-pxtorem**：自动将 px 转换为 rem，适配不同屏幕
  - 基准值：37.5 (设计稿宽度 375px)
  - 自动适配 320px - 750px 宽度设备
- **深色模式**：基于系统偏好自动支持深色模式
- **响应式**：移动优先设计，支持响应式断点
- **安全区域**：支持 iOS 刘海屏等设备的安全区域适配

## 快速开始

### 前置要求

- Node.js 18.x 或更高版本
- npm 或 yarn
- DeepSeek API 密钥（在 [https://platform.deepseek.com/api_keys](https://platform.deepseek.com/api_keys) 获取）

### 安装步骤

1. **克隆仓库**（或者你已经在这里了！）

2. **安装依赖**：
   ```bash
   npm install
   ```

3. **配置环境变量**：

   复制示例环境变量文件：
   ```bash
   cp .env.example .env.local
   ```

   编辑 `.env.local` 并添加你的 DeepSeek API 密钥：
   ```env
   DEEPSEEK_API_KEY=你的真实api密钥
   ```

4. **启动开发服务器**：
   ```bash
   npm run dev
   ```

5. **打开浏览器**，访问 [http://localhost:3000](http://localhost:3000)

你应该能看到聊天界面。输入一条消息并点击发送，开始与 DeepSeek AI 对话！

## 可用脚本

- `npm run dev` - 在 3000 端口启动开发服务器
- `npm run build` - 构建生产环境应用
- `npm start` - 启动生产服务器（需要先执行 build）
- `npm run lint` - 运行 ESLint 检查代码质量

## 工作原理

### 消息流程

1. **用户输入**：用户输入消息并点击发送
2. **客户端请求**：前端向 `/api/chat` 发送 POST 请求
3. **API 处理**：API 路由接收消息并转发到 DeepSeek
4. **流式响应**：DeepSeek 将响应块流式返回
5. **SSE 解析**：API 路由解析块并格式化为 SSE 事件
6. **客户端更新**：前端接收 SSE 事件并实时更新 UI
7. **展示**：用户看到响应逐字符出现

### SSE（服务器发送事件）实现

应用使用 SSE 实现高效的服务器到客户端单向流式传输：

**服务器端** (`app/api/chat/route.ts`)：
```typescript
// 创建一个 ReadableStream：
// 1. 从 DeepSeek API 读取块
// 2. 解析 JSON 响应
// 3. 提取内容增量
// 4. 格式化为 SSE 事件："data: {content}\n\n"
// 5. 发送到客户端
```

**客户端** (`app/page.tsx`)：
```typescript
// 使用以下方式读取流：
// 1. response.body.getReader()
// 2. TextDecoder 将字节转换为文本
// 3. 解析 "data: " 前缀的行
// 4. 用新内容更新 React 状态
```

## 扩展应用

### 添加新页面

在 `app/` 目录中创建新文件：

```typescript
// app/about/page.tsx
export default function About() {
  return <div>关于页面</div>;
}
```

访问：`http://localhost:3000/about`

### 添加新 API 路由

创建新的路由处理器：

```typescript
// app/api/custom/route.ts
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  return Response.json({ message: 'Hello' });
}
```

访问：`http://localhost:3000/api/custom`

### 自定义 UI

编辑 `app/page.tsx` 来修改聊天界面，或编辑 `app/globals.css` 来修改全局样式。

## 环境变量

| 变量 | 描述 | 必需 |
|------|------|------|
| `DEEPSEEK_API_KEY` | 你的 DeepSeek API 密钥 | 是 |

## 故障排除

### "API key not configured" 错误
- 确保 `.env.local` 存在并包含你的 API 密钥
- 添加环境变量后重启开发服务器

### 消息无法流式输出
- 检查浏览器控制台的错误
- 验证你的 API 密钥是否有效
- 检查网络选项卡查看 SSE 连接是否建立

### 构建错误
- 运行 `npm install` 确保所有依赖已安装
- 检查 Node.js 版本是否为 18.x 或更高
- 删除 `.next` 文件夹并重新构建：`rm -rf .next && npm run build`

## API 参考

### POST /api/chat

向 DeepSeek AI 模型发送消息。

**请求体**：
```json
{
  "message": "你的问题"
}
```

**响应**：服务器发送事件流

**SSE 事件格式**：
```
data: {"content": "文本块"}

data: {"content": "另一个块"}

data: [DONE]
```

## 性能考虑

- **边缘运行时**：API 路由使用 Edge Runtime 降低延迟
- **流式传输**：SSE 提供即时反馈，无需等待完整响应
- **客户端渲染**：主页面采用客户端渲染，支持交互功能
- **代码拆分**：Next.js 自动拆分代码以优化加载

## 安全说明

- API 密钥存储在环境变量中（永不提交到 git）
- `.env.local` 通过 `.gitignore` 排除在版本控制之外
- API 路由在转发到 DeepSeek 之前验证请求
- Edge Runtime 提供额外的安全隔离

## 贡献

欢迎提交问题和功能请求！

## 许可证

本项目开源，可用于教育目的。

## 资源

- [Next.js 文档](https://nextjs.org/docs)
- [React 文档](https://react.dev/)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [DeepSeek API 文档](https://platform.deepseek.com/docs)
- [服务器发送事件规范](https://html.spec.whatwg.org/multipage/server-sent-events.html)

## 支持

对于以下相关问题：
- **本应用**：在此仓库中提交 issue
- **DeepSeek API**：联系 DeepSeek 支持
- **Next.js**：查看 [Next.js 文档](https://nextjs.org/docs)
