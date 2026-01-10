/* eslint-disable prettier/prettier */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components/layout/AdminLayout';

interface AttendanceSession {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  present: number;
  absent: number;
  late: number;
  total: number;
  status: 'active' | 'upcoming' | 'completed';
}

interface AttendanceStats {
  totalSessions: number;
  averageAttendance: number;
  totalStudents: number;
  thisMonthSessions: number;
}

// 模拟数据
const mockStats: AttendanceStats = {
  totalSessions: 24,
  averageAttendance: 85,
  totalStudents: 156,
  thisMonthSessions: 4,
};

const mockSessions: AttendanceSession[] = [
  {
    id: '1',
    title: '每周编程工作坊',
    date: '2026-01-10',
    time: '15:00 - 17:00',
    location: '创新楼 304 室',
    present: 28,
    absent: 4,
    late: 3,
    total: 35,
    status: 'active',
  },
  {
    id: '2',
    title: 'Python 入门工作坊',
    date: '2026-01-08',
    time: '14:00 - 16:00',
    location: '实验室 202',
    present: 22,
    absent: 3,
    late: 2,
    total: 27,
    status: 'completed',
  },
  {
    id: '3',
    title: '网络安全基础',
    date: '2026-01-03',
    time: '15:00 - 17:00',
    location: '教室 101',
    present: 18,
    absent: 5,
    late: 2,
    total: 25,
    status: 'completed',
  },
  {
    id: '4',
    title: 'AI 伦理讲座',
    date: '2026-01-12',
    time: '14:00 - 16:00',
    location: '礼堂',
    present: 0,
    absent: 0,
    late: 0,
    total: 45,
    status: 'upcoming',
  },
];

export default function AdminAttendancePage() {
  const [stats] = useState<AttendanceStats>(mockStats);
  const [/* sessions, setSessions */] = useState<AttendanceSession[]>(mockSessions);
  const [filter, setFilter] = useState<'all' | 'active' | 'upcoming' | 'completed'>('all');

  const filteredSessions = mockSessions.filter((session) => {
    if (filter === 'all') return true;
    return session.status === filter;
  });

  const statusLabels: Record<string, string> = {
    active: '进行中',
    upcoming: '即将开始',
    completed: '已结束',
  };

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    upcoming: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    completed: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
  };

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        {/* 页面标题 */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">考勤管理</h1>
            <p className="text-[#8ba396] mt-1">查看和管理活动签到记录</p>
          </div>
          <Link
            href="/admin/attendance/new"
            className="flex items-center gap-2 h-12 px-6 bg-[#13ec80] hover:bg-[#0fd673] text-[#102219] font-bold rounded-xl transition-colors"
          >
            <span className="material-symbols-outlined">add</span>
            新建签到
          </Link>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#1a2c24] rounded-xl p-6 border border-[#2a3c34]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#13ec80]/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-[#13ec80]">event_available</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.totalSessions}</p>
                <p className="text-sm text-[#8ba396]">总签到场次</p>
              </div>
            </div>
          </div>

          <div className="bg-[#1a2c24] rounded-xl p-6 border border-[#2a3c34]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-blue-400">trending_up</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.averageAttendance}%</p>
                <p className="text-sm text-[#8ba396]">平均出席率</p>
              </div>
            </div>
          </div>

          <div className="bg-[#1a2c24] rounded-xl p-6 border border-[#2a3c34]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-purple-400">group</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.totalStudents}</p>
                <p className="text-sm text-[#8ba396]">注册学生</p>
              </div>
            </div>
          </div>

          <div className="bg-[#1a2c24] rounded-xl p-6 border border-[#2a3c34]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-amber-400">calendar_month</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.thisMonthSessions}</p>
                <p className="text-sm text-[#8ba396]">本月场次</p>
              </div>
            </div>
          </div>
        </div>

        {/* 筛选和搜索 */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center gap-2 p-1 bg-[#1a2c24] rounded-xl border border-[#2a3c34]">
            {(['all', 'active', 'upcoming', 'completed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === status
                    ? 'bg-[#13ec80] text-[#102219]'
                    : 'text-[#8ba396] hover:text-white'
                }`}
              >
                {status === 'all' ? '全部' : statusLabels[status]}
              </button>
            ))}
          </div>

          <div className="flex-1 min-w-50 max-w-md">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#618975]">search</span>
              <input
                type="text"
                placeholder="搜索签到活动..."
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#1a2c24] border border-[#2a3c34] text-sm text-white placeholder:text-[#618975] focus:outline-none focus:ring-2 focus:ring-[#13ec80]"
              />
            </div>
          </div>
        </div>

        {/* 签到列表 */}
        <div className="bg-[#1a2c24] rounded-xl border border-[#2a3c34] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2a3c34]">
                  <th className="text-left px-6 py-4 text-sm font-medium text-[#8ba396]">活动</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[#8ba396]">日期时间</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[#8ba396]">地点</th>
                  <th className="text-center px-6 py-4 text-sm font-medium text-[#8ba396]">出席</th>
                  <th className="text-center px-6 py-4 text-sm font-medium text-[#8ba396]">缺席</th>
                  <th className="text-center px-6 py-4 text-sm font-medium text-[#8ba396]">迟到</th>
                  <th className="text-center px-6 py-4 text-sm font-medium text-[#8ba396]">出席率</th>
                  <th className="text-center px-6 py-4 text-sm font-medium text-[#8ba396]">状态</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-[#8ba396]">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredSessions.map((session) => {
                  const attendanceRate = session.total > 0 
                    ? Math.round((session.present / session.total) * 100) 
                    : 0;
                  
                  return (
                    <tr key={session.id} className="border-b border-[#2a3c34] last:border-0 hover:bg-[#102219]/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#13ec80]/20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[#13ec80]">event</span>
                          </div>
                          <span className="font-medium text-white">{session.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="text-white">{session.date}</p>
                          <p className="text-[#8ba396]">{session.time}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#8ba396]">{session.location}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-green-400 font-medium">{session.present}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-red-400 font-medium">{session.absent}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-amber-400 font-medium">{session.late}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 h-2 bg-[#102219] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#13ec80] rounded-full"
                              style={{ width: `${attendanceRate}%` }}
                            />
                          </div>
                          <span className="text-sm text-white font-medium">{attendanceRate}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${statusColors[session.status]}`}>
                          {statusLabels[session.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/attendance/${session.id}`}
                            className="p-2 hover:bg-[#102219] rounded-lg transition-colors"
                            title="查看详情"
                          >
                            <span className="material-symbols-outlined text-[#8ba396] hover:text-white">visibility</span>
                          </Link>
                          {session.status === 'active' && (
                            <Link
                              href={`/admin/attendance/${session.id}/take`}
                              className="p-2 hover:bg-[#102219] rounded-lg transition-colors"
                              title="开始点名"
                            >
                              <span className="material-symbols-outlined text-[#13ec80]">how_to_reg</span>
                            </Link>
                          )}
                          <button
                            className="p-2 hover:bg-[#102219] rounded-lg transition-colors"
                            title="更多操作"
                          >
                            <span className="material-symbols-outlined text-[#8ba396] hover:text-white">more_vert</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredSessions.length === 0 && (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined text-5xl text-[#2a3c34] mb-4">event_busy</span>
              <p className="text-[#8ba396]">暂无签到记录</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
