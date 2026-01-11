# Appwrite 数据库初始化指南

## 概述

ZhCode学生网站现已集成完整的数据库持久化系统。所有社团设置都保存到Appwrite数据库，学生页面从数据库动态读取数据。

## 系统组件

### 1. 数据库集合（Collection）
- **集合名称**: `clubSettings`
- **位置**: Appwrite数据库
- **属性**（13个字段）:
  - `aboutTitle` - 社团名称
  - `aboutDescription` - 社团描述
  - `aboutEmail` - 联系邮箱
  - `aboutLocation` - 会议地点
  - `aboutMeetingTime` - 会议时间
  - `activeMembers` - 活跃成员数
  - `yearlyActivities` - 年度活动数
  - `awardProjects` - 获奖项目数
  - `partners` - 合作伙伴数
  - `githubUrl` - GitHub链接
  - `discordUrl` - Discord链接
  - `instagramUrl` - Instagram链接
  - `youtubeUrl` - YouTube链接

### 2. API 端点

#### GET `/api/club-settings`
- **功能**: 从数据库获取社团设置
- **返回**: JSON格式的clubSettings对象
- **错误处理**: 404时返回初始化URL提示

#### POST `/api/club-settings`
- **功能**: 保存/更新社团设置到数据库
- **请求体**: 完整的clubSettings对象
- **返回**: 更新后的文档

#### GET `/api/init`
- **功能**: 初始化数据库（创建集合和属性）
- **使用场景**: 首次部署时调用
- **返回**: 初始化结果详情（每个属性的创建状态）

### 3. 初始化系统

#### 通过浏览器UI初始化
1. 访问 `http://localhost:3000/init`
2. 点击 "开始初始化" 按钮
3. 系统自动创建clubSettings集合和所有属性
4. 查看初始化结果
5. 点击 "返回设置页面" 返回admin面板

#### 通过CLI脚本初始化
```bash
npx ts-node scripts/init-appwrite.ts
```

### 4. 数据流

**管理员保存设置**:
```
Admin Panel (/admin/settings)
    ↓
handleSaveSettings() 点击
    ↓
POST /api/club-settings
    ↓
Appwrite 数据库 (clubSettings集合)
    ↓
localStorage 备份
```

**学生查看设置**:
```
Student /about page
    ↓
useEffect: 加载数据
    ↓
GET /api/club-settings (主要来源)
    ↓
fallback: localStorage (API失败时)
    ↓
fallback: 默认数据 (都无法获取时)
```

## 环境变量配置

所有这些变量都必须在 `.env.local` 文件中设置:

```env
# Appwrite 项目配置
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_database_id

# API密钥（服务器端初始化使用）
APPWRITE_API_KEY=your_api_key
```

**注意**: 
- `NEXT_PUBLIC_*` 前缀的变量会暴露在客户端（用于认证)
- `APPWRITE_API_KEY` 不带 `NEXT_PUBLIC_` 前缀，只在服务器端使用

## 快速开始

### 1. 配置环境
```bash
# 编辑 .env.local
# 添加上述4个环境变量
```

### 2. 首次初始化
```bash
# 方式A: 通过UI初始化
http://localhost:3000/init
# 或
# 方式B: 通过脚本初始化
npm run dev  # 启动开发服务器
npx ts-node scripts/init-appwrite.ts
```

### 3. 使用系统
```bash
# 启动开发服务器
npm run dev

# 访问管理员面板
http://localhost:3000/admin/settings

# 查看学生页面
http://localhost:3000/about
```

### 4. 测试流程

#### 保存设置
1. 进入 `/admin/settings` 页面
2. 编辑"关于我们"或"社团信息"标签中的任何字段
3. 点击保存
4. 确认成功提示

#### 验证持久化
1. 刷新页面 - 数据应保持不变
2. 重启开发服务器 - 数据应从数据库加载
3. 访问 `/about` 页面 - 应显示admin保存的数据

#### 测试离线功能
1. 暂时禁用API（注释掉fetch调用）
2. 管理员仍可保存到localStorage
3. 学生页面使用localStorage显示数据
4. 恢复API - 同步回数据库

## 工作原理

### 集合创建逻辑
- 集合采用单文档模式：整个社团设置存储为一个文档
- 创建时不存在则创建，已存在则跳过（409错误处理）
- 属性创建采用相同逻辑

### 数据读取优先级
```
1. API /api/club-settings (数据库 - 主要来源)
   ↓ (如果404或网络错误)
2. localStorage ('clubSettings' 键)
   ↓ (如果不存在)
3. 默认数据 (DEFAULT_CLUB_INFO常量)
```

### 数据保存流程
```
1. Admin提交表单 → handleSaveSettings()
2. POST /api/club-settings
3. 如果返回404且有initUrl → 提示初始化并打开/api/init
4. 否则保存成功 → localStorage备份
5. 显示成功提示
```

## 故障排除

### 错误: "Collection with the requested ID 'clubSettings' could not be found"
**原因**: clubSettings集合尚未创建
**解决**:
1. 访问 `http://localhost:3000/init` 页面
2. 点击"开始初始化"按钮
3. 等待初始化完成
4. 返回admin面板重试保存

### 错误: "APPWRITE_API_KEY is not set"
**原因**: 初始化脚本找不到API密钥
**解决**: 确保 `.env.local` 包含 `APPWRITE_API_KEY=your_key`

### 设置未保存到数据库
**排查**:
1. 检查浏览器console是否有错误
2. 检查Appwrite仪表板中是否存在文档
3. 验证API端点配置正确
4. 检查Appwrite数据库权限

### 学生页面显示默认数据
**原因**: API调用失败，localStorage为空
**解决**:
1. 确保/api/club-settings端点工作正常
2. 在admin面板中保存设置
3. 验证localStorage中是否有'clubSettings'键

## 架构设计

### 为什么使用单文档模式？
- ✅ 简单性：社团只有一个配置
- ✅ 性能：单次查询获取所有数据
- ✅ 一致性：无需复杂的数据关联
- ✅ 扩展性：轻松添加新字段

### 为什么需要初始化系统？
- Appwrite不会自动创建集合
- 首次部署需要建立数据库结构
- 初始化系统处理错误恢复和409冲突

### 为什么有localStorage备份？
- 📱 离线支持：网络断开时仍可读写
- ⚡ 性能：减少API调用
- 🛡️ 容错：API故障时的备选方案

## 部署到生产环境

1. **配置生产环境变量**
   - 在Render/Vercel等平台中设置环境变量
   - 确保包含APPWRITE_API_KEY

2. **初始化数据库**
   ```bash
   # 选项A: 访问网站上的/init页面
   https://your-domain.com/init
   
   # 选项B: 运行脚本（需要远程权限）
   npx ts-node scripts/init-appwrite.ts
   ```

3. **验证部署**
   - 测试管理员保存设置
   - 验证学生页面显示数据
   - 检查Appwrite仪表板

## 相关文件

- `/api/club-settings/route.ts` - 主API端点
- `/api/init/route.ts` - 初始化API
- `/init/page.tsx` - 初始化UI
- `/admin/settings/page.tsx` - 管理员面板
- `/about/page.tsx` - 学生页面
- `/scripts/init-appwrite.ts` - 初始化脚本
