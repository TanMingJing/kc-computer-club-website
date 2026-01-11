/* eslint-disable prettier/prettier */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';
import AttendanceWidget from '@/components/attendance/AttendanceWidget';
import StudentAttendanceRecords from '@/components/attendance/StudentAttendanceRecords';

interface AttendanceRecord {
  id: string;
  sessionTitle: string;
  location: string;
  date: string;
  time: string;
  status: 'present' | 'absent' | 'late';
}

// 模拟历史数据
const mockHistory: AttendanceRecord[] = [
  {
    id: '1',
    sessionTitle: '第一时段 (15:20)',
    location: '电脑室',
    date: '2026-01-08',
    time: '15:22',
    status: 'present',
  },
  {
    id: '2',
    sessionTitle: '第二时段 (16:35)',
    location: '电脑室',
    date: '2026-01-03',
    time: '16:38',
    status: 'present',
  },
  {
    id: '3',
    sessionTitle: '第一时段 (15:20)',
    location: '电脑室',
    date: '2025-12-27',
    time: '-',
    status: 'absent',
  },
];

export default function AttendancePage() {
  const { user, isStudent } = useAuth();
  const [history] = useState<AttendanceRecord[]>(mockHistory);
  const [showDebugButton, setShowDebugButton] = useState(false);

  // 检查 URL 参数是否有 debug=true
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('debug') === 'true') {
      setShowDebugButton(true);
    }
  }, []);

  const statusLabels: Record<string, string> = {
    present: '出席',
    absent: '缺席',
    late: '迟到',
  };

  const statusColors: Record<string, string> = {
    present: 'bg-[#13ec80]/10 text-[#13ec80] border border-[#13ec80]/30',
    absent: 'bg-[#2a3c34] text-[#8a9e94] border border-[#3a4c44]',
    late: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[#102219] overflow-x-hidden">
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
      <main className="flex-1 flex flex-col items-center p-4 py-8 lg:p-10">
        <div className="w-full max-w-2xl flex flex-col gap-8">
          {/* 页面标题 */}
          <div className="text-center">
            <h1 className="text-3xl font-black text-white mb-2">
              社团点名
            </h1>
            <p className="text-[#8a9e94]">
              {user ? `欢迎，${user.name}` : '请在规定时间内完成点名'}
            </p>
          </div>

          {/* 点名组件 */}
          <AttendanceWidget
            studentId={user?.id || ''}
            studentName={user?.name || ''}
            studentEmail={user?.email || ''}
            showDebugButton={showDebugButton || !isStudent}
            onCheckInSuccess={() => {
              console.log('点名成功');
            }}
          />

          {/* 历史记录部分 */}
          <div className="mt-8">
            <StudentAttendanceRecords />
          </div>
        </div>

        {/* 提示信息 */}
        <div className="w-full max-w-2xl bg-[#1a2c24] border border-[#2a3c34] rounded-xl p-4 text-center">
          <p className="text-[#8a9e94] text-sm">
            <span className="material-symbols-outlined text-sm align-middle mr-1">info</span>
            点名时间：每周二 15:20-15:25 和 16:35-16:40
          </p>
        </div>
      </main>
    </div>
  );
}
