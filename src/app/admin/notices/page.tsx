/* eslint-disable prettier/prettier */
'use client';

import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import { useState } from 'react';

interface Notice {
  id: string;
  title: string;
  category: string;
  publishedAt: string;
  status: 'published' | 'draft';
  views: number;
}

// 模拟公告数据
const mockNotices: Notice[] = [
  {
    id: '1',
    title: '2025年第一季度活动计划发布',
    category: '活动通知',
    publishedAt: '2025-01-10',
    status: 'published',
    views: 342,
  },
  {
    id: '2',
    title: 'Python 数据科学工作坊 - 报名开始',
    category: '课程公告',
    publishedAt: '2025-01-08',
    status: 'published',
    views: 289,
  },
  {
    id: '3',
    title: '社团例会时间调整通知',
    category: '会议通知',
    publishedAt: '2025-01-05',
    status: 'published',
    views: 156,
  },
  {
    id: '4',
    title: '黑客马拉松 2025 - 初步筹划',
    category: '活动通知',
    publishedAt: '2025-01-01',
    status: 'draft',
    views: 0,
  },
  {
    id: '5',
    title: 'Web 开发训练营最新课程内容',
    category: '课程公告',
    publishedAt: '2024-12-28',
    status: 'published',
    views: 421,
  },
];

const categories = ['全部', '活动通知', '课程公告', '会议通知', '其他'];

export default function AdminNotices() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [notices] = useState(mockNotices);

  // 过滤公告
  const filteredNotices = notices.filter((notice) => {
    const matchSearch =
      notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.category.includes(searchTerm);
    const matchCategory = selectedCategory === '全部' || notice.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <AdminLayout adminName="管理员">
      {/* 页面头部 */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-2">公告管理</h1>
        <p className="text-gray-400">管理社团的所有公告信息，支持发布、编辑和删除。</p>
      </div>

      {/* 操作栏 */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="flex-1">
          <Input
            placeholder="搜索公告标题..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon="search"
          />
        </div>
        <Link href="/admin/notices/create">
          <Button variant="primary">
            <span className="material-symbols-outlined">add</span>
            发布公告
          </Button>
        </Link>
      </div>

      {/* 分类过滤 */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedCategory === category
                ? 'bg-[#137fec] text-white'
                : 'bg-[#1a2632] text-gray-400 hover:text-white border border-[#283946]'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* 统计信息 */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#1a2632] border border-[#283946] rounded-xl p-4">
          <p className="text-gray-400 text-sm mb-1">总公告数</p>
          <p className="text-2xl font-bold text-white">{notices.length}</p>
        </div>
        <div className="bg-[#1a2632] border border-[#283946] rounded-xl p-4">
          <p className="text-gray-400 text-sm mb-1">已发布</p>
          <p className="text-2xl font-bold text-green-400">
            {notices.filter((n) => n.status === 'published').length}
          </p>
        </div>
        <div className="bg-[#1a2632] border border-[#283946] rounded-xl p-4">
          <p className="text-gray-400 text-sm mb-1">草稿中</p>
          <p className="text-2xl font-bold text-amber-400">
            {notices.filter((n) => n.status === 'draft').length}
          </p>
        </div>
      </div>

      {/* 公告列表 */}
      <div className="bg-[#1a2632] border border-[#283946] rounded-2xl overflow-hidden">
        {filteredNotices.length > 0 ? (
          <div className="divide-y divide-[#283946]">
            {filteredNotices.map((notice) => (
              <div
                key={notice.id}
                className="px-6 py-4 hover:bg-[#1f2d39] transition-colors flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-white font-semibold truncate flex-1">
                      {notice.title}
                    </h3>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium shrink-0 ${
                        notice.status === 'published'
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-amber-500/10 text-amber-400'
                      }`}
                    >
                      {notice.status === 'published' ? '已发布' : '草稿'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#283946] rounded">
                      {notice.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">
                        calendar_today
                      </span>
                      {notice.publishedAt}
                    </span>
                    {notice.status === 'published' && (
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">
                          visibility
                        </span>
                        {notice.views} 次查看
                      </span>
                    )}
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="ml-4 flex gap-2 shrink-0">
                  <Link href={`/admin/notices/${notice.id}/edit`}>
                    <button className="p-2 hover:bg-[#283946] rounded-lg text-gray-400 hover:text-[#137fec] transition-colors">
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                  </Link>
                  <button className="p-2 hover:bg-[#283946] rounded-lg text-gray-400 hover:text-red-400 transition-colors">
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <span className="material-symbols-outlined text-6xl text-gray-600 block mb-3">
              article
            </span>
            <p className="text-gray-400 mb-4">没有找到公告</p>
            <Link href="/admin/notices/create">
              <Button variant="primary">发布第一条公告</Button>
            </Link>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
