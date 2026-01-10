/* eslint-disable prettier/prettier */
'use client';

/* eslint-disable prettier/prettier */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';

interface AttendanceSession {
  id: string;
  title: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'active' | 'upcoming' | 'ended';
}

interface AttendanceRecord {
  id: string;
  sessionTitle: string;
  location: string;
  date: string;
  time: string;
  status: 'present' | 'absent' | 'late';
}

// 模拟数据
const mockSession: AttendanceSession = {
  id: '1',
  title: '每周编程工作坊：冬季学期',
  location: '创新楼 304 室',
  date: '2026-01-10',
  startTime: '15:00',
  endTime: '17:00',
  status: 'active',
};

const mockHistory: AttendanceRecord[] = [
  {
    id: '1',
    sessionTitle: 'Python 入门工作坊',
    location: '实验室 202',
    date: '2026-01-08',
    time: '16:00',
    status: 'present',
  },
  {
    id: '2',
    sessionTitle: '网络安全基础',
    location: '教室 101',
    date: '2026-01-03',
    time: '15:00',
    status: 'present',
  },
  {
    id: '3',
    sessionTitle: 'AI 伦理讲座',
    location: '礼堂',
    date: '2025-12-27',
    time: '14:00',
    status: 'absent',
  },
];

export default function AttendancePage() {
  const [currentSession] = useState<AttendanceSession | null>(mockSession);
  const [history] = useState<AttendanceRecord[]>(mockHistory);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckIn = async () => {
    setIsLoading(true);
    // TODO: 实际的签到 API 调用
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsCheckedIn(true);
    setIsLoading(false);
  };

  const statusLabels: Record<string, string> = {
    present: '出席',
    absent: '缺席',
    late: '迟到',
  };

  const statusColors: Record<string, string> = {
    present: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    absent: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
    late: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[#f6f8f7] dark:bg-[#102219] overflow-x-hidden">
      {/* 顶部导航 */}
      <Header
        navItems={[
          { label: '首页', href: '/' },
          { label: '关于', href: '/about' },
          { label: '公告', href: '/notices' },
          { label: '活动', href: '/activities' },
        ]}
      />

      {/* 主要内容区 */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 py-8 lg:p-10">
        <div className="w-full max-w-4xl flex flex-col items-center gap-8">
          {/* 签到卡片 */}
          <div className="w-full max-w-xl bg-white dark:bg-[#1a2c24] rounded-2xl shadow-xl dark:shadow-none border border-[#e5e8e7] dark:border-[#2a3c34] p-6 sm:p-10 flex flex-col items-center gap-8 relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
            {/* 顶部装饰 */}
            <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-transparent via-[#13ec80] to-transparent opacity-50"></div>
            
            {/* 状态徽章 */}
            {isCheckedIn ? (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/50">
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
                <span className="text-sm font-semibold tracking-wide uppercase">已签到</span>
              </div>
            ) : currentSession ? (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
                <span className="material-symbols-outlined text-[20px]">error</span>
                <span className="text-sm font-semibold tracking-wide uppercase">未签到</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                <span className="material-symbols-outlined text-[20px]">schedule</span>
                <span className="text-sm font-semibold tracking-wide uppercase">暂无活动</span>
              </div>
            )}

            {/* 会议详情 */}
            {currentSession ? (
              <div className="text-center space-y-3">
                <h1 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight text-[#111814] dark:text-white">
                  {currentSession.title}
                </h1>
                <div className="flex flex-wrap justify-center items-center gap-4 text-[#618975] dark:text-[#a0b3aa] text-lg font-medium">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-xl">location_on</span>
                    <span>{currentSession.location}</span>
                  </div>
                  <span className="hidden sm:inline w-1.5 h-1.5 rounded-full bg-[#13ec80]/50"></span>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-xl">schedule</span>
                    <span>{currentSession.startTime} - {currentSession.endTime}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-3">
                <h1 className="text-2xl font-bold text-gray-500">暂无进行中的活动</h1>
                <p className="text-gray-400">请稍后再来查看</p>
              </div>
            )}

            {/* 签到按钮 */}
            {currentSession && !isCheckedIn && (
              <div className="py-4 w-full flex justify-center">
                <button
                  onClick={handleCheckIn}
                  disabled={isLoading}
                  className="relative group cursor-pointer w-full sm:w-auto min-w-70 disabled:opacity-50"
                >
                  {/* 发光效果 */}
                  <div className="absolute -inset-1 bg-[#13ec80] rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
                  {/* 按钮主体 */}
                  <div className="relative flex items-center justify-center gap-3 h-16 sm:h-20 px-10 bg-[#13ec80] hover:bg-[#0fd673] active:scale-[0.98] rounded-xl sm:rounded-2xl transition-all duration-200 shadow-lg shadow-[#13ec80]/20">
                    {isLoading ? (
                      <span className="material-symbols-outlined text-[#102219] text-3xl font-bold animate-spin">hourglass_bottom</span>
                    ) : (
                      <span className="material-symbols-outlined text-[#102219] text-3xl font-bold">qr_code_scanner</span>
                    )}
                    <span className="text-[#102219] text-xl sm:text-2xl font-bold tracking-tight">
                      {isLoading ? '签到中...' : '立即签到'}
                    </span>
                  </div>
                </button>
              </div>
            )}

            {isCheckedIn && (
              <div className="py-4 w-full flex justify-center">
                <div className="flex items-center gap-3 h-16 px-10 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-xl border border-green-200 dark:border-green-800/50">
                  <span className="material-symbols-outlined text-3xl">check_circle</span>
                  <span className="text-xl font-bold">签到成功！</span>
                </div>
              </div>
            )}

            {/* 底部提示 */}
            <p className="text-sm text-[#8a9e94] dark:text-[#5a6e64] text-center max-w-xs leading-relaxed">
              请确保您已连接校园 Wi-Fi 以验证位置
            </p>
          </div>

          {/* 历史记录部分 */}
          <div className="w-full max-w-xl mt-4">
            <div className="flex items-center justify-between px-2 mb-4">
              <h3 className="text-lg font-bold text-[#111814] dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-[#13ec80]">history</span>
                近期签到记录
              </h3>
              <Link href="/attendance/history" className="text-sm font-medium text-[#13ec80] hover:underline">
                查看全部
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              {history.map((record) => (
                <div
                  key={record.id}
                  className={`flex items-center gap-4 p-4 bg-white dark:bg-[#1a2c24] rounded-xl border border-[#e5e8e7] dark:border-[#2a3c34] ${
                    record.status === 'absent' ? 'opacity-75' : ''
                  }`}
                >
                  <div className={`shrink-0 size-10 rounded-full flex items-center justify-center ${
                    record.status === 'present' 
                      ? 'bg-[#13ec80]/10 text-[#13ec80]'
                      : record.status === 'late'
                      ? 'bg-amber-500/10 text-amber-500'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                  }`}>
                    <span className="material-symbols-outlined">
                      {record.status === 'present' ? 'check_circle' : record.status === 'late' ? 'schedule' : 'cancel'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#111814] dark:text-white truncate">
                      {record.sessionTitle}
                    </p>
                    <p className="text-xs text-[#618975] dark:text-[#8ba396]">
                      {record.location} • {record.date}
                    </p>
                  </div>
                  <div className={`text-xs font-medium px-2 py-1 rounded ${statusColors[record.status]}`}>
                    {statusLabels[record.status]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
