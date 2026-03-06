# 本地调试测试指南

## 🧪 快速测试步骤

### 1. 启动应用

```bash
npm run dev
```

### 2. 打开浏览器

访问：http://localhost:3000/poetry

### 3. 测试功能清单

#### ✅ 基础功能测试

- [ ] 页面正常加载，显示题目
- [ ] 显示用户昵称"诗词小白"
- [ ] 显示初始积分为0
- [ ] 显示连胜数为0
- [ ] 显示"请选出上句"或"请选出下句"提示
- [ ] 显示4个选项
- [ ] 显示诗词出处和作者

#### ✅ 答题功能测试

- [ ] 点击选项，选项高亮显示
- [ ] 切换选项，高亮正确切换
- [ ] 点击"确定"按钮提交答案
- [ ] 答对显示✅和鼓励语
- [ ] 答错显示❌和正确答案
- [ ] 显示完整诗词解析
- [ ] 积分正确增加（答对+10）
- [ ] 连胜数正确更新

#### ✅ 下一题功能

- [ ] 点击"下一题"按钮
- [ ] 加载新题目
- [ ] 题目不重复（概率很低）
- [ ] 页面平滑过渡

#### ✅ 数据持久化测试

1. 答几道题，记录当前积分和连胜
2. 刷新页面
3. [ ] 积分和连胜保持不变
4. 关闭浏览器，重新打开
5. [ ] 数据仍然保留

#### ✅ 响应式测试

- [ ] 缩小浏览器窗口，布局自适应
- [ ] 使用移动端模式（F12 → 切换设备模拟）
- [ ] 移动端显示正常
- [ ] 按钮大小适中，易于点击

#### ✅ 暗黑模式测试

- [ ] 切换系统暗黑模式
- [ ] 页面自动适配暗黑主题
- [ ] 文字清晰可读
- [ ] 对比度合适

## 🔍 浏览器控制台测试

打开浏览器控制台（F12），执行以下命令测试：

### 查看存储数据

```javascript
// 查看用户数据
console.log('用户数据:', JSON.parse(localStorage.getItem('poetry_user')))

// 查看答题记录
console.log('答题记录:', JSON.parse(localStorage.getItem('poetry_answers')))
```

### 修改用户数据

```javascript
// 修改积分
const user = JSON.parse(localStorage.getItem('poetry_user'))
user.score = 500
user.streak = 50
localStorage.setItem('poetry_user', JSON.stringify(user))
location.reload()
```

### 重置数据

```javascript
// 重置用户
localStorage.setItem('poetry_user', JSON.stringify({
  id: 1,
  openid: 'test_user_001',
  nickname: '诗词小白',
  avatar: 'https://via.placeholder.com/100',
  score: 0,
  streak: 0,
  max_streak: 0,
  hearts: 5
}))

// 清空答题记录
localStorage.removeItem('poetry_answers')

// 刷新
location.reload()
```

## 🎯 API接口测试

### 测试获取题目

```bash
curl http://localhost:3000/api/poetry/question/random
```

**期望输出**：
```json
{
  "code": 0,
  "data": {
    "id": 1,
    "givenLine": "床前明月光",
    "direction": "下句",
    "options": {
      "A": "低头思故乡",
      "B": "疑是地上霜",
      "C": "举头望明月",
      "D": "烟花三月下扬州"
    },
    "difficulty": 1,
    "sourcePoem": "静夜思",
    "sourceAuthor": "李白"
  }
}
```

### 测试提交答案

```bash
curl -X POST http://localhost:3000/api/poetry/answer/submit \
  -H "Content-Type: application/json" \
  -d '{"questionId":1,"option":"B","userId":1}'
```

**期望输出**（答对）：
```json
{
  "code": 0,
  "data": {
    "correct": true,
    "correctOption": "B",
    "explanation": "《静夜思》唐·李白：床前明月光，疑是地上霜...",
    "scoreAdded": 10,
    "newScore": 10,
    "newStreak": 1,
    "message": "太棒了！"
  }
}
```

### 测试获取用户信息

```bash
curl http://localhost:3000/api/poetry/user/info?userId=1
```

**期望输出**：
```json
{
  "code": 0,
  "data": {
    "id": 1,
    "nickname": "诗词小白",
    "avatar": "https://via.placeholder.com/100",
    "score": 10,
    "streak": 1,
    "maxStreak": 1,
    "hearts": 5
  }
}
```

## 🐛 常见问题测试

### 测试1：题目是否会重复？

1. 连续答50题以上
2. 记录出现的题目ID
3. [ ] 题目会重复出现（这是正常的，因为是随机选取）

### 测试2：答错是否重置连胜？

1. 连续答对5题
2. 故意答错1题
3. [ ] 连胜归零
4. [ ] 积分不变（只是不增加）
5. 再答对1题
6. [ ] 连胜从1重新开始

### 测试3：刷新页面是否丢失数据？

1. 答对几题，记录积分
2. 刷新页面
3. [ ] 积分、连胜保持不变

### 测试4：不同浏览器数据是否隔离？

1. 在Chrome中答题，积分100
2. 打开Firefox访问同一地址
3. [ ] Firefox显示初始积分0（数据隔离）

### 测试5：无痕模式数据是否保留？

1. 打开无痕/隐私模式
2. 答题获得积分
3. 关闭无痕窗口，重新打开
4. [ ] 数据清空（这是正常的）

## 📊 性能测试

### 加载速度测试

1. 打开Network标签
2. 刷新页面
3. [ ] 首次加载时间 < 2秒
4. [ ] 后续加载（有缓存）< 0.5秒

### 答题响应速度

1. 点击选项
2. [ ] 立即高亮（< 100ms）
3. 点击确定
4. [ ] 结果显示 < 200ms

### 内存占用

1. 打开Performance Monitor（More tools → Performance Monitor）
2. 答题20次
3. [ ] 内存增长 < 10MB
4. [ ] 无明显内存泄漏

## 🎨 UI/UX测试

### 视觉测试

- [ ] 渐变背景显示正常
- [ ] 卡片阴影效果明显
- [ ] 字体清晰易读
- [ ] 颜色对比度适中
- [ ] 图标显示正确

### 交互测试

- [ ] 按钮hover效果
- [ ] 选项点击反馈
- [ ] 答对/答错动画流畅
- [ ] 页面滚动平滑
- [ ] 无闪烁或卡顿

### 文案测试

- [ ] 鼓励语根据连胜数变化
  - 连胜1: "太棒了！"
  - 连胜2-4: "果然是个小诗仙！"
  - 连胜5-9: "妙啊！继续保持！"
  - 连胜10+: "诗词大师就是你！"
- [ ] 答错提示友好："差一点点，再接再厉！"

## ✅ 测试完成检查表

完成以上所有测试后，确认：

- [ ] 所有基础功能正常
- [ ] 数据持久化工作正常
- [ ] 响应速度满足要求
- [ ] 无明显bug或错误
- [ ] UI/UX体验良好

## 🚀 进阶测试

### 压力测试

```javascript
// 在控制台执行，模拟大量答题
async function stressTest() {
  for (let i = 0; i < 100; i++) {
    await fetch('/api/poetry/question/random')
    console.log(`请求 ${i + 1}/100 完成`)
  }
}
stressTest()
```

### 边界测试

```javascript
// 测试极端情况
const user = JSON.parse(localStorage.getItem('poetry_user'))

// 极高积分
user.score = 999999
user.streak = 9999

localStorage.setItem('poetry_user', JSON.stringify(user))
location.reload()

// 验证显示是否正常
```

## 📝 测试报告模板

测试完成后，记录结果：

```
测试日期: 2026-03-06
测试人员: [你的名字]
测试环境:
  - 浏览器: Chrome 120
  - 操作系统: macOS 14
  - Node.js: 20.10.0

测试结果:
  ✅ 基础功能: 通过
  ✅ 数据持久化: 通过
  ✅ 响应速度: 通过
  ✅ UI/UX: 通过
  ❌ 发现问题: [描述问题]

建议改进:
  1. [改进建议1]
  2. [改进建议2]
```

---

测试愉快！如有问题，请查阅 [LOCAL_DEBUG.md](./LOCAL_DEBUG.md) 📚
