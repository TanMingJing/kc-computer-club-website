/* eslint-disable prettier/prettier */
'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { formatRelativeTime, truncate } from '@/lib/utils';
import { Badge, CategoryBadge } from '@/components/ui/Badge';

// ========================================
// NoticeCard 组件
// 参考设计：club_homepage_1/code.html - Recent Notices 部分
// ========================================

interface NoticeCardProps {
  /** 通知ID */
  id: string;
  /** 标题 */
  title: string;
  /** 摘要内容 */
  summary: string;
  /** 分类 */
  category: string;
  /** 发布时间 */
  publishedAt: string | Date;
  /** 是否置顶 */
  isPinned?: boolean;
  /** 是否重要 */
  isImportant?: boolean;
  /** 额外类名 */
  className?: string;
}

export function NoticeCard({
  id,
  title,
  summary,
  category,
  publishedAt,
  isPinned = false,
  isImportant = false,
  className,
}: NoticeCardProps) {
  const date = typeof publishedAt === 'string' ? new Date(publishedAt) : publishedAt;

  return (
    <Link href={`/notices/${id}`} className="block group">
      <article
        className={cn(
          'rounded-xl p-4',
          'bg-gray-50 dark:bg-[#1c3128]',
          'border border-gray-200 dark:border-transparent',
          'hover:bg-gray-100 dark:hover:bg-[#283930]',
          'transition-all duration-300',
          'cursor-pointer',
          className
        )}
      >
        {/* 标签区域 */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <CategoryBadge category={category} />
          {isPinned && (
            <Badge variant="warning" size="sm">
              <span className="material-symbols-outlined text-xs mr-1">push_pin</span>
              置顶
            </Badge>
          )}
          {isImportant && (
            <Badge variant="danger" size="sm">
              <span className="material-symbols-outlined text-xs mr-1">priority_high</span>
              重要
            </Badge>
          )}
        </div>

        {/* 标题 */}
        <h3
          className={cn(
            'font-bold text-gray-900 dark:text-white',
            'group-hover:text-primary',
            'transition-colors duration-200',
            'line-clamp-2 mb-2'
          )}
        >
          {title}
        </h3>

        {/* 摘要 */}
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
          {truncate(summary, 100)}
        </p>

        {/* 底部信息 */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-500">
            {formatRelativeTime(date)}
          </span>
          <span
            className={cn(
              'text-xs text-primary',
              'flex items-center gap-1',
              'opacity-0 group-hover:opacity-100',
              'transition-opacity duration-200'
            )}
          >
            阅读更多
            <span className="material-symbols-outlined text-xs">arrow_forward</span>
          </span>
        </div>
      </article>
    </Link>
  );
}

// ========================================
// NoticeCardCompact 组件
// 简洁版通知卡片
// ========================================

interface NoticeCardCompactProps {
  id: string;
  title: string;
  category: string;
  publishedAt: string | Date;
  isImportant?: boolean;
  className?: string;
}

export function NoticeCardCompact({
  id,
  title,
  category,
  publishedAt,
  isImportant = false,
  className,
}: NoticeCardCompactProps) {
  const date = typeof publishedAt === 'string' ? new Date(publishedAt) : publishedAt;

  return (
    <Link href={`/notices/${id}`}>
      <div
        className={cn(
          'flex items-center gap-4 p-4 rounded-lg',
          'bg-gray-50 dark:bg-[#1c3128]',
          'hover:bg-gray-100 dark:hover:bg-[#283930]',
          'transition-all duration-300',
          'cursor-pointer group',
          className
        )}
      >
        {/* 分类图标 */}
        <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-primary">
            {isImportant ? 'priority_high' : 'article'}
          </span>
        </div>

        {/* 内容 */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-primary transition-colors truncate">
            {title}
          </h4>
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
            <span>{category}</span>
            <span>·</span>
            <span>{formatRelativeTime(date)}</span>
          </div>
        </div>

        {/* 箭头 */}
        <span className="material-symbols-outlined text-gray-400 group-hover:text-primary transition-colors">
          chevron_right
        </span>
      </div>
    </Link>
  );
}
