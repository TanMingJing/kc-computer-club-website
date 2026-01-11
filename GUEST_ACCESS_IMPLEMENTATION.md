# 游客访问实现文档

## 概述
允许未登录的学生访问网站的主要内容（首页、公告、活动），但评论和报名需要登录。

---

## ✅ 已实现的功能

### 1. **首页 - 无需登录访问**
**文件**: `src/app/page.tsx`

- ✅ 移除了 `useEffect` 中的登录重定向
- ✅ 允许 `user` 为 `null` 时正常渲染
- ✅ 已登录用户可看考勤小部件，未登录用户隐藏
- ✅ 导航栏显示登录按钮

**用户体验**:
- 游客可看到：首页 Hero、最新公告、活动预告、项目展示
- 登录用户额外看到：考勤打卡小部件

---

### 2. **公告列表和详情页 - 无需登录访问**
**文件**: 
- `src/app/notices/page.tsx`
- `src/app/notices/[id]/page.tsx`

- ✅ 所有公告可查看
- ✅ 评论需要登录（见下文）

---

### 3. **活动列表和详情页 - 无需登录访问**
**文件**: 
- `src/app/activities/page.tsx`
- `src/app/activities/[id]/page.tsx`

- ✅ 所有活动可查看
- ✅ 报名需要登录（见下文）
- ✅ 评论需要登录（见下文）

---

### 4. **评论表单 - 登录检查** ✨
**文件**: `src/components/comments/CommentForm.tsx`

**变更内容**:
```tsx
// 未登录时显示登录提示，而不是错误消息
if (!user) {
  return (
    <div className="bg-[#0d1a16] border border-[#283930] rounded-lg p-6 text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#13ec80]/10 mb-4">
        <span className="material-symbols-outlined text-[#13ec80] text-2xl">lock</span>
      </div>
      <p className="text-white font-semibold mb-2">需要登录才能评论</p>
      <p className="text-[#9db9ab] text-sm mb-4">请先登录账号，然后就可以分享您的看法</p>
      <div className="flex gap-3 justify-center flex-wrap">
        <Link href="/auth/login" className="...">登录</Link>
        <Link href="/auth/signup" className="...">注册</Link>
      </div>
    </div>
  );
}
```

**位置**: 
- 公告详情页面的评论区
- 活动详情页面的评论区

---

### 5. **报名表单 - 登录检查** ✨
**文件**: `src/app/activities/[id]/page.tsx` (第 680 行)

**变更内容**:
```tsx
// 报名表单前添加未登录检查
{!user ? (
  <div className="bg-[#1A2C23] rounded-xl shadow-sm border border-[#283930] p-6 md:p-8 text-center">
    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#13ec80]/10 mb-4">
      <span className="material-symbols-outlined text-[#13ec80] text-4xl">lock</span>
    </div>
    <h3 className="text-xl font-bold text-white mb-2">需要登录才能报名</h3>
    <p className="text-[#9db9ab] mb-6 text-sm">
      请先登录或注册账号，然后就可以报名这个活动
    </p>
    <div className="flex flex-col gap-3">
      <Link href="/auth/login" className="...">登录账号</Link>
      <Link href="/auth/signup" className="...">创建新账号</Link>
    </div>
  </div>
) : activity.status === 'published' ? (
  // 原来的报名表单
) : (
  // 报名已截止
)}
```

**位置**: 活动详情页的右侧报名区块

---

## 📊 用户流程对比

### 游客用户流程
```
首页 (✓ 看得到)
  ↓
点击"公告" → 公告列表 (✓ 看得到)
  ↓
点击公告 → 公告详情 (✓ 看得到内容)
  ↓
尝试评论 → 提示"需要登录" (❌)
  ↓
点击"登录" → 登录页面 → 登录成功 → 回到公告页面 → 可评论 (✓)

同样：活动 → 尝试报名 → 提示登录 → 登录 → 报名
```

### 登录用户流程
```
所有功能完全可用 ✓
- 查看内容 ✓
- 评论 ✓
- 报名 ✓
- 考勤打卡 ✓（仅学生）
```

---

## 🔍 代码质量检查

**TypeScript 编译**:
```bash
✅ npm run type-check
# 通过 - 0 错误
```

---

## 📝 需要的后续工作

### 1. **其他需要登录的操作** ⚠️
还需要检查和实现登录检查的页面：
- [ ] 群聊 `/chat` - 是否需要登录？
- [ ] 项目提交 `/projects/submit` - 是否需要登录？
- [ ] 用户资料 `/profile` - 是否需要登录？
- [ ] 其他管理功能

### 2. **考勤系统** ✓
已在首页隐藏（仅登录用户看得到）:
```tsx
{user && !('role' in user) && (
  <AttendanceWidget ... />
)}
```

### 3. **响应式测试**
需要在手机端测试：
- [ ] 手机首页显示
- [ ] 手机上的登录提示按钮是否可点击
- [ ] 登录后的返回跳转是否正常

---

## 🎯 设计决策

| 功能 | 游客访问 | 需要登录 | 原因 |
|------|---------|---------|------|
| 首页 | ✓ | ✗ | 对外宣传，吸引访问 |
| 公告列表 | ✓ | ✗ | 信息公开 |
| 公告详情 | ✓ | ✗ | 信息公开 |
| 公告评论 | ✗ | **✓** | 追踪评论者，防止垃圾评论 |
| 活动列表 | ✓ | ✗ | 信息公开 |
| 活动详情 | ✓ | ✗ | 信息公开 |
| 活动报名 | ✗ | **✓** | 收集学生信息，追踪报名 |
| 活动评论 | ✗ | **✓** | 同公告评论 |
| 考勤打卡 | ✗ | **✓** | 仅限学生，需要身份验证 |

---

## 🚀 部署检查清单

- [x] 首页无需登录
- [x] 公告和活动可查看
- [x] 评论处有登录提示
- [x] 报名处有登录提示
- [x] 导航栏显示登录/注册按钮
- [x] TypeScript 编译通过
- [ ] 手机端测试
- [ ] 登录后返回页面功能测试
- [ ] 评论和报名功能端到端测试

---

## 📞 常见问题

**Q: 未登录用户看不到评论吗？**
A: 看得到，只是不能发表评论。会显示"需要登录才能评论"的提示。

**Q: 用户注册后在哪里 redirect 回来？**
A: 注册成功后跳转到登录页，登录后应该跳转到来源页面（需要在认证服务中实现）。

**Q: Header 中是否需要修改？**
A: 已修改 - 手机菜单添加了"更多"功能区块。

