<!-- 文档：Phase 3.2 Appwrite Integration Services（第三阶段第二阶段：Appwrite 集成服务） -->

# Phase 3.2 - Appwrite Integration Services

## 概览（Overview）

**Phase 3.2** 已成功完成！创建了四个核心 Appwrite 集成服务，覆盖所有数据操作。

### 完成内容
- ✅ `src/services/notice.service.ts` - 公告 CRUD 操作
- ✅ `src/services/activity.service.ts` - 活动 CRUD 操作
- ✅ `src/services/signup.service.ts` - 报名 CRUD 操作
- ✅ `src/services/comment.service.ts` - 评论 CRUD 操作
- ✅ TypeScript 类型修复完成
- ✅ Build 编译验证通过（0 错误，16 路由）

---

## 服务文件详细说明

### 1. Notice Service (`src/services/notice.service.ts`)

**功能**：管理所有公告数据库操作

**主要方法**：
```typescript
// 获取所有公告（可选过滤已发布）
getAllNotices(onlyPublished?: boolean): Promise<Notice[]>

// 按 ID 获取单个公告
getNoticeById(id: string): Promise<Notice>

// 创建新公告
createNotice(input: CreateNoticeInput): Promise<Notice>

// 更新公告
updateNotice(id: string, input: UpdateNoticeInput): Promise<Notice>

// 删除公告
deleteNotice(id: string): Promise<void>

// 搜索公告（按标题和内容）
searchNotices(query: string): Promise<Notice[]>

// 按分类获取公告
getNoticesByCategory(category: string): Promise<Notice[]>
```

**数据类型**：
```typescript
interface Notice {
  $id: string;
  title: string;
  content: string;
  category: 'announcement' | 'course' | 'meeting' | 'other';
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
  author?: string;
}
```

---

### 2. Activity Service (`src/services/activity.service.ts`)

**功能**：管理所有活动数据库操作

**主要方法**：
```typescript
// 获取所有活动（可选过滤已发布）
getAllActivities(onlyPublished?: boolean): Promise<Activity[]>

// 按 ID 获取单个活动
getActivityById(id: string): Promise<Activity>

// 创建新活动
createActivity(input: CreateActivityInput): Promise<Activity>

// 更新活动
updateActivity(id: string, input: UpdateActivityInput): Promise<Activity>

// 删除活动
deleteActivity(id: string): Promise<void>

// 搜索活动（按标题和地点）
searchActivities(query: string): Promise<Activity[]>

// 按分类获取活动
getActivitiesByCategory(category: string): Promise<Activity[]>

// 按状态获取活动
getActivitiesByStatus(status: string): Promise<Activity[]>

// 获取即将到来的活动（未来日期）
getUpcomingActivities(): Promise<Activity[]>

// 增加已报名人数
incrementRegisteredCount(id: string): Promise<Activity>

// 减少已报名人数
decrementRegisteredCount(id: string): Promise<Activity>
```

**数据类型**：
```typescript
interface Activity {
  $id: string;
  title: string;
  description: string;
  category: 'workshop' | 'hackathon' | 'social' | 'competition';
  date: string; // ISO date
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  location: string;
  capacity: number;
  registered: number;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  instructor?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}
```

---

### 3. Signup Service (`src/services/signup.service.ts`)

**功能**：管理所有活动报名数据库操作

**主要方法**：
```typescript
// 获取所有报名（可选按活动过滤）
getAllSignups(activityId?: string): Promise<Signup[]>

// 按 ID 获取单个报名
getSignupById(id: string): Promise<Signup>

// 创建新报名
createSignup(input: CreateSignupInput): Promise<Signup>

// 更新报名
updateSignup(id: string, input: UpdateSignupInput): Promise<Signup>

// 删除报名
deleteSignup(id: string): Promise<void>

// 按活动 ID 获取报名
getSignupsByActivity(activityId: string): Promise<Signup[]>

// 按状态获取报名
getSignupsByStatus(status: string): Promise<Signup[]>

// 按邮箱获取报名
getSignupsByEmail(email: string): Promise<Signup[]>

// 搜索报名
searchSignups(query: string): Promise<Signup[]>

// 获取活动报名人数
getSignupCount(activityId: string): Promise<number>

// 获取已确认报名人数
getConfirmedSignupCount(activityId: string): Promise<number>

// 导出报名为 CSV
exportSignupsAsCSV(activityId: string): Promise<string>
```

**数据类型**：
```typescript
interface Signup {
  $id: string;
  activityId: string;
  activityTitle?: string;
  studentName: string;
  studentEmail: string;
  studentId?: string;
  major?: string;
  year?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  signupDate: string;
  formData?: Record<string, string>;
}
```

---

### 4. Comment Service (`src/services/comment.service.ts`)

**功能**：管理所有评论数据库操作

**主要方法**：
```typescript
// 获取所有评论（可选仅已批准）
getAllComments(onlyApproved?: boolean): Promise<Comment[]>

// 按 ID 获取单个评论
getCommentById(id: string): Promise<Comment>

// 创建新评论
createComment(input: CreateCommentInput): Promise<Comment>

// 更新评论
updateComment(id: string, input: UpdateCommentInput): Promise<Comment>

// 删除评论
deleteComment(id: string): Promise<void>

// 按目标获取评论（公告或活动）
getCommentsByTarget(
  targetType: 'notice' | 'activity',
  targetId: string,
  onlyApproved?: boolean
): Promise<Comment[]>

// 按状态获取评论
getCommentsByStatus(status: string): Promise<Comment[]>

// 获取待审核评论
getPendingComments(): Promise<Comment[]>

// 批准评论
approveComment(id: string): Promise<Comment>

// 拒绝评论
rejectComment(id: string): Promise<Comment>

// 搜索评论
searchComments(query: string): Promise<Comment[]>

// 获取目标评论数
getCommentCount(targetId: string): Promise<number>

// 获取待审核评论总数
getPendingCommentCount(): Promise<number>
```

**数据类型**：
```typescript
interface Comment {
  $id: string;
  targetType: 'notice' | 'activity';
  targetId: string;
  targetTitle?: string;
  authorName: string;
  authorEmail?: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}
```

---

## 使用示例

### 创建公告
```typescript
import { noticeService } from '@/services/notice.service';

const newNotice = await noticeService.createNotice({
  title: '社团招新开始',
  content: '欢迎加入我们的社团...',
  category: 'announcement',
  status: 'published',
  author: '管理员',
});
```

### 获取活动并增加报名数
```typescript
import { activityService } from '@/services/activity.service';

const activity = await activityService.getActivityById('activity_123');
const updated = await activityService.incrementRegisteredCount('activity_123');
```

### 创建报名并导出为 CSV
```typescript
import { signupService } from '@/services/signup.service';

const signup = await signupService.createSignup({
  activityId: 'activity_123',
  studentName: '张三',
  studentEmail: 'zhangsan@example.com',
  status: 'confirmed',
});

const csv = await signupService.exportSignupsAsCSV('activity_123');
// 导出格式：CSV 包含姓名、邮箱、学号、专业、年级、状态、报名时间
```

### 获取待审核评论
```typescript
import { commentService } from '@/services/comment.service';

const pendingComments = await commentService.getPendingComments();
// 管理员可以审核并批准或拒绝评论
await commentService.approveComment(commentId);
```

---

## TypeScript 类型系统

所有服务都使用严格的 TypeScript 类型定义，确保类型安全：

- ✅ **Appwrite 响应类型转换**：使用 `as unknown as ServiceType` 模式处理类型兼容性
- ✅ **输入验证**：所有创建和更新操作都使用专门的 Input 接口
- ✅ **空值处理**：所有查询方法都返回默认空数组，防止 undefined 错误
- ✅ **错误处理**：所有异步操作都包含 try-catch，并记录详细错误日志

---

## 错误处理

所有服务方法都包含完善的错误处理：

```typescript
try {
  // 数据库操作
} catch (error) {
  console.error('操作描述:', error);
  throw error; // 向调用者抛出错误，便于进一步处理
}
```

**调用方式**：
```typescript
try {
  const notices = await noticeService.getAllNotices();
} catch (error) {
  // 处理错误，例如显示用户提示
  console.error('Failed to fetch notices:', error);
}
```

---

## Appwrite 环境变量

所有服务依赖以下环境变量（`.env.local`）：

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://your-appwrite-instance.com/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_database_id
```

---

## 下一步（Phase 3.3：Admin Pages Integration）

现在服务已准备就绪，下一步是：

1. **更新管理后台页面**，使用真实数据替换模拟数据
   - `/admin/notices/page.tsx`
   - `/admin/activities/page.tsx`
   - `/admin/signups/page.tsx`
   - `/admin/comments/page.tsx`

2. **实现表单提交**，将创建和编辑操作连接到数据库
   - `/admin/notices/create/page.tsx`
   - `/admin/activities/create/page.tsx`

3. **测试 CRUD 操作**，验证数据完整性和一致性

4. **添加权限检查**，确保只有认证的管理员可以执行写操作

---

## 编译状态

✅ **Build 成功**（最后编译时间：2025-01-09）
- TypeScript 编译：0 错误
- 路由生成：16 个（全部正常）
- 构建时间：~6 秒（Turbopack 优化）

---

## 文件列表

| 文件 | 行数 | 功能 |
|------|------|------|
| `src/services/notice.service.ts` | ~130 | 公告管理 |
| `src/services/activity.service.ts` | ~170 | 活动管理 |
| `src/services/signup.service.ts` | ~160 | 报名管理 |
| `src/services/comment.service.ts` | ~170 | 评论管理 |
| **总计** | ~630 | 4 个服务，全部类型安全 |

---

## 更新日志

**2025-01-09**
- ✅ 创建 4 个 Appwrite 集成服务
- ✅ 添加完整的 TypeScript 类型定义
- ✅ 实现所有核心 CRUD 操作
- ✅ 添加搜索、过滤、导出等高级功能
- ✅ 修复 TypeScript 类型兼容性问题
- ✅ 验证 Build 编译通过
