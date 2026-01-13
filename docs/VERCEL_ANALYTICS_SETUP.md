# Vercel Web Analytics 设置指南

## 📊 概述

Vercel Web Analytics 是一个无需部署到 Vercel 也能使用的性能监控工具。它提供：

- ✅ 页面加载时间分析
- ✅ 用户交互跟踪
- ✅ Core Web Vitals 监控
- ✅ 实时数据反馈
- ✅ 地理位置分析

---

## 🚀 快速设置（3 步）

### Step 1: 在 Vercel 控制面板获取 Analytics ID

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择你的项目
3. 进入 **Settings** → **Analytics**
4. 点击 **Enable Web Analytics** 按钮
5. 复制显示的 **Analytics ID**（格式如：`xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`）

### Step 2: 添加到环境变量

在 `.env.local` 文件中添加：

```bash
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your_analytics_id_here
```

替换 `your_analytics_id_here` 为实际的 Analytics ID。

### Step 3: 验证配置

代码已在 RootLayout 中自动集成，无需额外修改。验证方法：

1. 查看 `src/app/layout.tsx` 文件
2. 确认存在以下导入和组件：
   ```tsx
   import { Analytics } from '@vercel/analytics/react';
   
   // 在 return 的 <html> 内部：
   <Analytics />
   ```

---

## ✅ 验证集成

### 在本地环境测试

```bash
# 1. 启动开发服务器
npm run dev

# 2. 打开浏览器开发者工具
# 按 F12 → Console 标签

# 3. 搜索 "analytics" 或 "web-vitals"
# 如果看到相关日志，说明已正确配置
```

### 在 Vercel 上部署后

1. 部署你的应用到 Vercel
2. 访问 Vercel 控制面板
3. 进入 **Analytics** 标签
4. 等待 5-10 分钟数据收集
5. 刷新页面查看数据

---

## 📈 查看分析数据

### Vercel 控制面板

访问 **Projects** → **Your Project** → **Analytics** 查看：

| 指标 | 说明 |
|------|------|
| **Page Load Time** | 平均页面加载时间 |
| **First Contentful Paint (FCP)** | 首次内容绘制时间 |
| **Largest Contentful Paint (LCP)** | 最大内容绘制时间 |
| **Cumulative Layout Shift (CLS)** | 累积布局位移 |
| **First Input Delay (FID)** | 首次输入延迟 |
| **Total Blocking Time (TBT)** | 总阻塞时间 |

### 地理位置分析

查看访问者来自的国家和地区

### 时间序列分析

观察不同时段的性能变化

---

## 🔧 高级配置

### 自定义事件跟踪

在需要跟踪的位置添加：

```typescript
import { reportWebVitals } from 'next/app';

export function reportWebVitals(metric) {
  console.log('Web Vital:', metric);
  // 发送到自己的分析服务
  // fetch('/api/analytics', { method: 'POST', body: JSON.stringify(metric) });
}
```

### 排除某些路由

在 `next.config.ts` 中配置（如果需要）：

```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel Analytics 会自动跟踪所有路由
  // 无需额外配置排除特定路由
};
```

### 自定义分析 ID 验证

```typescript
// src/utils/analytics.ts
export const verifyAnalyticsId = () => {
  const id = process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID;
  if (!id) {
    console.warn('⚠️ Vercel Analytics ID not configured');
    return false;
  }
  console.log('✅ Vercel Analytics configured:', id.substring(0, 8) + '...');
  return true;
};
```

---

## 📊 性能优化建议

根据 Web Analytics 数据，可以优化以下方面：

### 如果 LCP > 2.5s
- 优化图片加载（使用 WebP、图片压缩）
- 延迟加载非关键资源
- 使用 CDN 加速

### 如果 CLS > 0.1
- 为图片/视频指定尺寸
- 避免动态注入内容
- 使用 `transform` 替代 `margin`/`padding` 动画

### 如果 FCP > 1.8s
- 减少关键渲染路径
- 延迟加载 JavaScript
- 压缩和缩小 CSS

---

## 🐛 故障排查

### 问题 1: Analytics 在 Vercel 上看不到数据

**解决方案**：
1. 检查 `NEXT_PUBLIC_VERCEL_ANALYTICS_ID` 是否正确设置
2. 访问几个页面（至少 5 次）以生成数据
3. 等待 10-15 分钟数据聚合
4. 刷新 Vercel 控制面板

### 问题 2: 本地开发看不到 Analytics

**预期行为**：
- 本地开发环境（`localhost:3000`）的分析数据**不会**显示在 Vercel 控制面板
- 这是正常的，只有部署到 Vercel 的流量才会被计入

### 问题 3: Analytics ID 为空或 undefined

**解决方案**：
```bash
# 1. 确认 .env.local 中有配置
cat .env.local | grep VERCEL_ANALYTICS

# 2. 重启开发服务器
npm run dev

# 3. 检查浏览器控制台是否有警告
```

---

## 📌 集成检查清单

- ✅ `@vercel/analytics` 包已安装（v1.3.1+）
- ✅ RootLayout 中导入 `Analytics` 组件
- ✅ `<Analytics />` 添加到 HTML 中
- ✅ 环境变量 `NEXT_PUBLIC_VERCEL_ANALYTICS_ID` 已配置
- ✅ 类型检查通过（`npm run type-check`）
- ✅ 构建成功（`npm run build`）
- ✅ 本地测试可访问应用
- ✅ 已部署到 Vercel

---

## 🎯 性能目标

| 指标 | 目标值 | 当前值 |
|------|--------|--------|
| FCP | < 1.8s | - |
| LCP | < 2.5s | - |
| CLS | < 0.1 | - |
| FID | < 100ms | - |
| TTL | < 3s | - |

---

## 📚 相关文档

- [Vercel 官方文档](https://vercel.com/docs/analytics)
- [Web Vitals 指标说明](https://web.dev/vitals/)
- [Next.js 性能优化](https://nextjs.org/docs/app/building-your-application/optimizing)

---

## ✅ 完成状态

| 任务 | 状态 |
|------|------|
| 安装 @vercel/analytics | ✅ |
| RootLayout 集成 | ✅ |
| 环境变量配置 | ✅ |
| 类型检查通过 | ✅ |
| 构建验证 | ✅ |
| 文档完成 | ✅ |

---

**最后更新**: 2024年  
**版本**: 1.0  
**维护者**: 开发团队
