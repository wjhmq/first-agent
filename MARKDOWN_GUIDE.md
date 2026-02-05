# 📝 Markdown 渲染功能使用指南

## 🎯 功能概述

聊天机器人现在支持完整的 Markdown 格式渲染，让 AI 的回复更加美观、结构化和易读。

---

## ✨ 新功能特性

### 1. 代码语法高亮

AI 返回的代码会自动高亮显示，支持多种编程语言：

**示例对话：**
```
你：用 JavaScript 写一个快速排序函数

AI：好的，这是一个快速排序的实现：

​```javascript
function quickSort(arr) {
  if (arr.length <= 1) return arr;

  const pivot = arr[Math.floor(arr.length / 2)];
  const left = arr.filter(x => x < pivot);
  const middle = arr.filter(x => x === pivot);
  const right = arr.filter(x => x > pivot);

  return [...quickSort(left), ...middle, ...quickSort(right)];
}
​```
```

**渲染效果：**
- 深色代码块背景
- 彩色语法高亮
- 语言标识（如 "javascript"）
- 水平滚动条（长代码）

---

### 2. 结构化列表

无序列表和有序列表清晰展示：

**示例对话：**
```
你：React 的主要特点有哪些？

AI：React 的主要特点包括：
- 组件化开发
- 虚拟 DOM 提升性能
- 单向数据流
- JSX 语法
- 丰富的生态系统
```

---

### 3. 表格展示

表格数据清晰对齐：

**示例对话：**
```
你：列出常见的 HTTP 状态码

AI：
| 状态码 | 含义 | 说明 |
|--------|------|------|
| 200 | OK | 请求成功 |
| 404 | Not Found | 资源不存在 |
| 500 | Server Error | 服务器错误 |
```

**渲染效果：**
- 网格边框
- 表头加粗
- 自动对齐
- 响应式布局

---

### 4. 标题层级

多级标题结构清晰：

**示例对话：**
```
你：介绍一下 Python 的基础语法

AI：
# Python 基础语法

## 变量和数据类型
Python 支持多种数据类型...

## 控制流
### if 语句
### for 循环
### while 循环
```

---

### 5. 引用块

重点内容突出显示：

**示例对话：**
```
你：给我一句编程名言

AI：
> "Talk is cheap. Show me the code."
> — Linus Torvalds
```

---

### 6. 链接

可点击的超链接：

**示例对话：**
```
你：推荐一些前端学习资源

AI：
- [MDN Web Docs](https://developer.mozilla.org/)
- [React 官方文档](https://react.dev/)
- [TypeScript 手册](https://www.typescriptlang.org/)
```

---

### 7. 文字强调

粗体、斜体、删除线：

**示例对话：**
```
你：如何使用 Markdown 的文字格式

AI：
- **粗体** 使用两个星号
- *斜体* 使用一个星号
- ~~删除线~~ 使用两个波浪号
```

---

## 🎨 视觉效果

### 代码块示例

```python
def hello_world():
    print("Hello, World!")

hello_world()
```

```javascript
function greet(name) {
  console.log(`Hello, ${name}!`);
}

greet("World");
```

### 表格示例

| 语言 | 类型 | 特点 |
|------|------|------|
| Python | 动态 | 简洁易读 |
| JavaScript | 动态 | 灵活强大 |
| TypeScript | 静态 | 类型安全 |

### 列表示例

**前端三件套：**
- HTML - 结构
- CSS - 样式
- JavaScript - 交互

**学习路线：**
1. 基础语法
2. 框架学习
3. 项目实战
4. 性能优化

---

## 💡 使用技巧

### 1. 请求特定格式

明确要求 AI 使用 Markdown 格式：

```
❌ 不好：介绍一下 Python

✅ 更好：用 Markdown 格式介绍 Python，包含代码示例和列表
```

### 2. 代码示例请求

```
❌ 不好：写一个排序函数

✅ 更好：用 JavaScript 写一个快速排序函数，用代码块格式展示
```

### 3. 结构化内容

```
❌ 不好：比较 React 和 Vue

✅ 更好：用 Markdown 表格比较 React 和 Vue 的特点
```

---

## 🔧 技术细节

### 使用的技术栈

- **react-markdown** - Markdown 渲染引擎
- **remark-gfm** - GitHub Flavored Markdown 支持
- **rehype-highlight** - 代码语法高亮
- **highlight.js** - 语法高亮库

### 支持的 Markdown 语法

| 语法 | 支持 | 说明 |
|------|------|------|
| 标题 | ✅ | H1-H6 全部支持 |
| 代码块 | ✅ | 语法高亮 + 语言标识 |
| 行内代码 | ✅ | 带背景色 |
| 列表 | ✅ | 有序 + 无序 |
| 表格 | ✅ | GFM 表格语法 |
| 引用 | ✅ | 多级引用 |
| 链接 | ✅ | 自动打开新标签 |
| 图片 | ✅ | 响应式显示 |
| 分割线 | ✅ | --- 或 *** |
| 强调 | ✅ | 粗体、斜体、删除线 |

---

## 🌓 深色模式

Markdown 渲染完全支持深色模式：

- 自动适配系统主题
- 代码块针对深色优化
- 高对比度文字
- 平滑过渡动画

---

## 🎯 最佳实践

### 1. 代码相关问题

**好的提问方式：**
```
请用 Python 实现一个二叉树的前序遍历，用 Markdown 代码块格式
```

**AI 会返回：**
```python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def preorderTraversal(root):
    if not root:
        return []
    return [root.val] + preorderTraversal(root.left) + preorderTraversal(root.right)
```

### 2. 知识总结问题

**好的提问方式：**
```
用 Markdown 列表总结 Git 的常用命令
```

**AI 会返回：**
- `git init` - 初始化仓库
- `git add` - 添加文件
- `git commit` - 提交更改
- `git push` - 推送到远程

### 3. 对比分析问题

**好的提问方式：**
```
用 Markdown 表格对比 MySQL 和 PostgreSQL
```

**AI 会返回表格：**
| 特性 | MySQL | PostgreSQL |
|------|-------|-----------|
| 类型 | 关系型 | 对象关系型 |
| 许可证 | GPL | PostgreSQL License |

---

## 📱 响应式设计

Markdown 内容在不同设备上都能良好显示：

- **桌面端**：完整展示，宽松间距
- **平板**：自动适配，保持可读性
- **手机**：紧凑布局，横向滚动代码块

---

## 🚀 测试建议

### 快速测试

尝试这些问题来测试 Markdown 功能：

1. **代码测试**
   ```
   用 TypeScript 写一个 React 组件
   ```

2. **列表测试**
   ```
   列出 JavaScript ES6 的新特性
   ```

3. **表格测试**
   ```
   用表格展示前端框架对比
   ```

4. **综合测试**
   ```
   写一篇关于 REST API 设计的文章，用 Markdown 格式
   ```

---

## ❓ 常见问题

### Q1: 代码没有高亮？
**A:** 确保指定了语言标识，如 \`\`\`javascript 而不是 \`\`\`

### Q2: 表格显示不正常？
**A:** 检查表格语法，确保每列都用 `|` 分隔

### Q3: 链接无法点击？
**A:** 确保链接格式正确：`[文本](URL)`

### Q4: 深色模式下看不清？
**A:** 样式已优化，如仍有问题请刷新页面

---

## 🎉 开始使用

现在就打开聊天窗口，尝试这些问题：

```
1. 用 Markdown 格式介绍 React Hooks

2. 用 JavaScript 写一个防抖函数，用代码块展示

3. 用表格对比 REST 和 GraphQL

4. 列出前端性能优化的最佳实践
```

享受更美观、更结构化的 AI 对话体验！ 🎨✨
