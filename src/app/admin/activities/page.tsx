/* eslint-disable prettier/prettier */
'use client';

import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import { useState } from 'react';

interface Activity {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  status: 'published' | 'draft' | 'cancelled';
}

// 模拟活动数据
const mockActivities: Activity[] = [
  {
    id: '1',
    title: 'Python 数据科学工作坊',
    date: '2025-01-20',
    time: '19:00-21:00',
    location: '教学楼 301',
    attendees: 24,
    status: 'published',
  },
  {
    id: '2',
    title: 'Web 开发训练营',
    date: '2025-01-22',
    time: '18:30-20:30',
    location: '创意中心 A01',
    attendees: 32,
    status: 'published',
  },
  {
    id: '3',
    title: 'AI 应用论坛',
    date: '2025-02-01',
    time: '19:00-21:00',
    location: '学生中心',
    attendees: 0,
    status: 'draft',
  },
  {
    id: '4',
    title: '黑客马拉松 2025',
    date: '2025-02-15',
    time: '09:00-18:00',
    location: '校园全区',
    attendees: 0,
    status: 'cancelled',
  },
  {
    id: '5',
    title: 'GIS 讲座',
    date: '2024-12-28',
    time: '19:00-21:00',
    location: '教学楼 301',
    attendees: 18,
    status: 'published',
  },
];

const statuses = ['全部', 'published', 'draft', 'cancelled'];
const statusLabels: Record<string, string> = {
  published: '已发布',
  draft: '草稿',
  cancelled: '已取消',
};

export default function AdminActivities() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('全部');
  const [activities] = useState(mockActivities);

  // 过滤活动
  const filteredActivities = activities.filter((activity) => {
    const matchSearch =
      activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.location.includes(searchTerm);
    const matchStatus = selectedStatus === '全部' || activity.status === selectedStatus;
    return matchSearch && matchStatus;
  });

  return (
    <AdminLayout adminName="管理员">
      {/* 页面头部 */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-2">活动管理</h1>
        <p className="text-gray-400">管理社团的所有活动，支持创建、编辑和取消活动。</p>
      </div>

      {/* 操作栏 */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="flex-1">
          <Input
            placeholder="搜索活动名称或地点..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon="search"
          />
        </div>
        <Link href="/admin/activities/create">
          <Button variant="primary">
            <span className="material-symbols-outlined">add</span>
            创建活动
          </Button>
        </Link>
      </div>

      {/* 状态过滤 */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedStatus === status
                ? 'bg-[#137fec] text-white'
                : 'bg-[#1a2632] text-gray-400 hover:text-white border border-[#283946]'
            }`}
          >
            {status === '全部' ? '全部' : statusLabels[status]}
          </button>
        ))}
      </div>

      {/* 统计信息 */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[#1a2632] border border-[#283946] rounded-xl p-4">
          <p className="text-gray-400 text-sm mb-1">活动总数</p>
          <p className="text-2xl font-bold text-white">{activities.length}</p>
        </div>
        <div className="bg-[#1a2632] border border-[#283946] rounded-xl p-4">
          <p className="text-gray-400 text-sm mb-1">已发布</p>
          <p className="text-2xl font-bold text-green-400">
            {activities.filter((a) => a.status === 'published').length}
          </p>
        </div>
        <div className="bg-[#1a2632] border border-[#283946] rounded-xl p-4">
          <p className="text-gray-400 text-sm mb-1">草稿中</p>
          <p className="text-2xl font-bold text-amber-400">
            {activities.filter((a) => a.status === 'draft').length}
          </p>
        </div>
        <div className="bg-[#1a2632] border border-[#283946] rounded-xl p-4">
          <p className="text-gray-400 text-sm mb-1">参与人数</p>
          <p className="text-2xl font-bold text-blue-400">
            {activities.reduce((sum, a) => sum + a.attendees, 0)}
          </p>
        </div>
      </div>

      {/* 活动列表 */}
      <div className="bg-[#1a2632] border border-[#283946] rounded-2xl overflow-hidden">
        {filteredActivities.length > 0 ? (
          <div className="divide-y divide-[#283946]">
            {filteredActivities.map((activity) => {
              let statusBg = '';
              let statusText = '';
              let statusLabel = '';

              if (activity.status === 'published') {
                statusBg = 'bg-green-500/10';
                statusText = 'text-green-400';
                statusLabel = '已发布';
              } else if (activity.status === 'draft') {
                statusBg = 'bg-amber-500/10';
                statusText = 'text-amber-400';
                statusLabel = '草稿';
              } else {
                statusBg = 'bg-red-500/10';
                statusText = 'text-red-400';
                statusLabel = '已取消';
              }

              return (
                <div
                  key={activity.id}
                  className="px-6 py-4 hover:bg-[#1f2d39] transition-colors flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-white font-semibold truncate flex-1">
                        {activity.title}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium shrink-0 ${statusBg} ${statusText}`}
                      >
                        {statusLabel}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">
                          calendar_today
                        </span>
                        {activity.date} {activity.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">location_on</span>
                        {activity.location}
                      </span>
                      {activity.status === 'published' && (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">group</span>
                          {activity.attendees} 人已报名
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div className="ml-4 flex gap-2 shrink-0">
                    <Link href={`/admin/activities/${activity.id}/edit`}>
                      <button className="p-2 hover:bg-[#283946] rounded-lg text-gray-400 hover:text-[#137fec] transition-colors">
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                    </Link>
                    <Link href={`/admin/activities/${activity.id}/signups`}>
                      <button className="p-2 hover:bg-[#283946] rounded-lg text-gray-400 hover:text-green-400 transition-colors">
                        <span className="material-symbols-outlined">group</span>
                      </button>
                    </Link>
                    <button className="p-2 hover:bg-[#283946] rounded-lg text-gray-400 hover:text-red-400 transition-colors">
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <span className="material-symbols-outlined text-6xl text-gray-600 block mb-3">
              event
            </span>
            <p className="text-gray-400 mb-4">没有找到活动</p>
            <Link href="/admin/activities/create">
              <Button variant="primary">创建第一个活动</Button>
            </Link>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
