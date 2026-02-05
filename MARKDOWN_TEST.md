# Markdown 渲染测试文档

这个文档用于测试聊天机器人的 Markdown 渲染功能。

## 📋 测试说明

在聊天窗口中输入以下问题来测试 Markdown 渲染：

### 测试问题示例

1. **"请用 Markdown 格式介绍 Python"**
2. **"用 Markdown 写一个快速排序的代码示例"**
3. **"用 Markdown 表格列出常见的 HTTP 状态码"**
4. **"用 Markdown 列表总结 React Hooks 的使用"**

---

## 🎯 支持的 Markdown 功能

### 1. 标题（Headings）

测试输入：
```
请生成一个包含不同级别标题的 Markdown 示例
```

预期输出：
```markdown
# 一级标题
## 二级标题
### 三级标题
#### 四级标题
```

---

### 2. 代码块（Code Blocks）

测试输入：
```
用 JavaScript 写一个斐波那契数列的函数，用 Markdown 代码块格式
```

预期输出：
```javascript
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10)); // 55
```

支持的语言高亮：
- JavaScript
- Python
- TypeScript
- Java
- C/C++
- Go
- Rust
- HTML/CSS
- SQL
- Bash/Shell
- 等等...

---

### 3. 行内代码（Inline Code）

测试输入：
```
解释 JavaScript 中的 `const` 和 `let` 的区别
```

预期输出包含：
- 使用 `const` 声明常量
- 使用 `let` 声明变量
- `const` 不能重新赋值

---

### 4. 列表（Lists）

#### 无序列表

测试输入：
```
用无序列表列出 React 的主要特点
```

预期输出：
```markdown
React 的主要特点：
- 组件化开发
- 虚拟 DOM
- 单向数据流
- JSX 语法
- 丰富的生态系统
```

#### 有序列表

测试输入：
```
用有序列表说明 Git 的基本工作流程
```

预期输出：
```markdown
Git 基本工作流程：
1. 初始化仓库 (git init)
2. 添加文件 (git add)
3. 提交更改 (git commit)
4. 推送到远程 (git push)
```

---

### 5. 表格（Tables）

测试输入：
```
用 Markdown 表格列出常见的 HTTP 状态码
```

预期输出：
```markdown
| 状态码 | 含义 | 说明 |
|--------|------|------|
| 200 | OK | 请求成功 |
| 404 | Not Found | 资源不存在 |
| 500 | Internal Server Error | 服务器错误 |
```

---

### 6. 引用（Blockquotes）

测试输入：
```
用引用格式给我一句编程名言
```

预期输出：
```markdown
> "Talk is cheap. Show me the code."
> — Linus Torvalds
```

---

### 7. 链接（Links）

测试输入：
```
给我几个前端学习资源的链接
```

预期输出：
```markdown
推荐的前端学习资源：
- [MDN Web Docs](https://developer.mozilla.org/)
- [React 官方文档](https://react.dev/)
- [TypeScript 官方文档](https://www.typescriptlang.org/)
```

---

### 8. 强调（Emphasis）

测试输入：
```
用 Markdown 格式说明粗体和斜体的使用
```

预期输出：
```markdown
- **粗体文本** 使用 `**粗体**` 或 `__粗体__`
- *斜体文本* 使用 `*斜体*` 或 `_斜体_`
- ***粗斜体*** 使用 `***粗斜体***`
```

---

### 9. 分割线（Horizontal Rule）

测试输入：
```
用 Markdown 格式展示如何使用分割线
```

预期输出：
```markdown
内容上方
---
内容下方
```

---

### 10. 删除线（Strikethrough）

测试输入：
```
用删除线标记已完成的任务
```

预期输出：
```markdown
任务列表：
- ~~已完成的任务~~
- 进行中的任务
- 待办任务
```

---

## 🧪 综合测试示例

### 完整的测试问题

输入以下问题来测试多种 Markdown 元素的组合：

```
请用 Markdown 格式写一篇关于 "快速排序算法" 的文章，要求包含：
1. 标题和副标题
2. 算法原理的文字说明
3. Python 代码实现
4. 时间复杂度的表格
5. 优缺点的列表
6. 相关资源的链接
```

---

## 📊 预期渲染效果

### 标题样式
- 清晰的层级结构
- 合适的字体大小
- 明显的间距

### 代码块样式
- 深色背景
- 语法高亮
- 语言标识
- 滚动条（长代码）
- 圆角边框

### 表格样式
- 网格边框
- 表头高亮
- 对齐的内容
- 悬停效果

### 列表样式
- 合适的缩进
- 清晰的标记
- 良好的间距

### 引用样式
- 左侧边框
- 背景色区分
- 斜体文字

---

## 🎨 样式特性

### 响应式设计
- 自适应宽度
- 移动端友好
- 平滑滚动

### 深色模式支持
- 自动适配系统主题
- 代码块深色优化
- 高对比度文字

### 交互优化
- 链接悬停效果
- 平滑过渡动画
- 代码可选择复制

---

## 💡 使用建议

### 1. 测试基础功能

从简单的 Markdown 元素开始测试：

**问题：** "用 Markdown 格式写一个 Hello World 程序"

### 2. 测试代码高亮

测试不同编程语言的代码高亮：

**问题：** "分别用 Python、JavaScript 和 Java 实现一个简单的 Hello World"

### 3. 测试复杂结构

测试嵌套列表、表格等复杂结构：

**问题：** "用 Markdown 格式写一个完整的项目说明文档"

### 4. 测试混合内容

测试多种 Markdown 元素的组合：

**问题：** "写一篇技术博客，包含标题、代码、列表、表格和链接"

---

## 🐛 已知问题和限制

### 当前支持的功能
- ✅ 标题（H1-H6）
- ✅ 代码块和语法高亮
- ✅ 行内代码
- ✅ 无序列表和有序列表
- ✅ 表格
- ✅ 引用
- ✅ 链接
- ✅ 粗体、斜体、删除线
- ✅ 分割线
- ✅ GFM 扩展语法

### 暂不支持的功能
- ❌ 任务列表（可扩展）
- ❌ 数学公式（可扩展）
- ❌ Mermaid 图表（可扩展）
- ❌ 脚注（可扩展）

---

## 📚 技术实现

### 使用的库
- `react-markdown` - Markdown 解析和渲染
- `remark-gfm` - GitHub Flavored Markdown 支持
- `rehype-highlight` - 代码语法高亮
- `rehype-raw` - 支持 HTML 标签

### 自定义组件
- 代码块带语言标识
- 表格响应式设计
- 链接自动添加 target="_blank"
- 样式完全定制化

---

## 🔧 故障排查

### 如果 Markdown 不能正常渲染

1. **检查依赖是否安装**
   ```bash
   npm list react-markdown remark-gfm rehype-highlight
   ```

2. **清除缓存并重启**
   ```bash
   rm -rf .next
   npm run dev
   ```

3. **检查浏览器控制台**
   - 查看是否有 JavaScript 错误
   - 检查 CSS 是否加载

4. **验证 Markdown 语法**
   - 确保 Markdown 语法正确
   - 检查特殊字符是否需要转义

---

## 🎉 测试成功标志

如果以下功能都能正常渲染，说明 Markdown 功能已经完全集成：

- [ ] 标题有不同的大小和样式
- [ ] 代码块有语法高亮
- [ ] 行内代码有背景色
- [ ] 列表有合适的缩进
- [ ] 表格有边框和对齐
- [ ] 引用有左侧边框
- [ ] 链接可以点击
- [ ] 粗体和斜体正常显示
- [ ] 分割线清晰可见
- [ ] 深色模式下样式正常

---

**祝测试顺利！** 🚀

如有问题，请检查上述故障排查步骤或查看开发者文档。
