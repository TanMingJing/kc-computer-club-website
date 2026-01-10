/* eslint-disable prettier/prettier */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AdminLayout } from '@/components/layout/AdminLayout';

interface Attendee {
  id: string;
  name: string;
  studentId: string;
  email: string;
  avatar: string;
  status: 'present' | 'absent' | 'late' | 'pending';
  checkInTime?: string;
}

interface SessionInfo {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  totalRegistered: number;
}

// 模拟数据
const mockSession: SessionInfo = {
  id: '1',
  title: '每周编程工作坊',
  date: '2026-01-10',
  time: '15:00 - 17:00',
  location: '创新楼 304 室',
  totalRegistered: 35,
};

const mockAttendees: Attendee[] = [
  { id: '1', name: '张明华', studentId: 'STU2024001', email: 'zhang@school.edu', avatar: '张', status: 'present', checkInTime: '14:55' },
  { id: '2', name: '李小红', studentId: 'STU2024002', email: 'li@school.edu', avatar: '李', status: 'present', checkInTime: '14:58' },
  { id: '3', name: '王志强', studentId: 'STU2024003', email: 'wang@school.edu', avatar: '王', status: 'late', checkInTime: '15:12' },
  { id: '4', name: '陈美玲', studentId: 'STU2024004', email: 'chen@school.edu', avatar: '陈', status: 'pending' },
  { id: '5', name: '刘伟东', studentId: 'STU2024005', email: 'liu@school.edu', avatar: '刘', status: 'absent' },
  { id: '6', name: '赵小芳', studentId: 'STU2024006', email: 'zhao@school.edu', avatar: '赵', status: 'present', checkInTime: '14:50' },
  { id: '7', name: '周大伟', studentId: 'STU2024007', email: 'zhou@school.edu', avatar: '周', status: 'pending' },
  { id: '8', name: '吴晓明', studentId: 'STU2024008', email: 'wu@school.edu', avatar: '吴', status: 'present', checkInTime: '14:52' },
];

export default function TakeAttendancePage() {
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const params = useParams();
  const [session/* , setSession */] = useState<SessionInfo>(mockSession);
  const [attendees, setAttendees] = useState<Attendee[]>(mockAttendees);
  const [filter, setFilter] = useState<'all' | 'present' | 'absent' | 'late' | 'pending'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAttendees = attendees.filter((attendee) => {
    const matchesFilter = filter === 'all' || attendee.status === filter;
    const matchesSearch = 
      attendee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attendee.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    present: attendees.filter((a) => a.status === 'present').length,
    absent: attendees.filter((a) => a.status === 'absent').length,
    late: attendees.filter((a) => a.status === 'late').length,
    pending: attendees.filter((a) => a.status === 'pending').length,
  };

  const statusLabels: Record<string, string> = {
    present: '出席',
    absent: '缺席',
    late: '迟到',
    pending: '未点名',
  };

  const statusColors: Record<string, string> = {
    present: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    absent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    late: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    pending: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
  };

  const handleStatusChange = (attendeeId: string, newStatus: Attendee['status']) => {
    setAttendees(attendees.map((a) => {
      if (a.id === attendeeId) {
        return {
          ...a,
          status: newStatus,
          checkInTime: newStatus === 'present' || newStatus === 'late' 
            ? new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
            : undefined,
        };
      }
      return a;
    }));
  };

  const markAllPresent = () => {
    const currentTime = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    setAttendees(attendees.map((a) => ({
      ...a,
      status: 'present',
      checkInTime: a.checkInTime || currentTime,
    })));
  };

  const markAllPendingAbsent = () => {
    setAttendees(attendees.map((a) => ({
      ...a,
      status: a.status === 'pending' ? 'absent' : a.status,
    })));
  };

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        {/* 页面标题 */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/attendance"
              className="p-2 hover:bg-[#1a2c24] rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined text-[#8ba396]">arrow_back</span>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">{session.title}</h1>
              <div className="flex items-center gap-4 text-sm text-[#8ba396] mt-1">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-lg">calendar_today</span>
                  {session.date}
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-lg">schedule</span>
                  {session.time}
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-lg">location_on</span>
                  {session.location}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={markAllPresent}
              className="flex items-center gap-2 h-10 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined text-lg">check_circle</span>
              全部出席
            </button>
            <button
              onClick={markAllPendingAbsent}
              className="flex items-center gap-2 h-10 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined text-lg">cancel</span>
              未到标缺席
            </button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#1a2c24] rounded-xl p-4 border border-[#2a3c34]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-400">{stats.present}</p>
                <p className="text-sm text-[#8ba396]">出席</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-green-400">check_circle</span>
              </div>
            </div>
          </div>

          <div className="bg-[#1a2c24] rounded-xl p-4 border border-[#2a3c34]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-amber-400">{stats.late}</p>
                <p className="text-sm text-[#8ba396]">迟到</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-amber-400">schedule</span>
              </div>
            </div>
          </div>

          <div className="bg-[#1a2c24] rounded-xl p-4 border border-[#2a3c34]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-red-400">{stats.absent}</p>
                <p className="text-sm text-[#8ba396]">缺席</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-red-400">cancel</span>
              </div>
            </div>
          </div>

          <div className="bg-[#1a2c24] rounded-xl p-4 border border-[#2a3c34]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-400">{stats.pending}</p>
                <p className="text-sm text-[#8ba396]">未点名</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-gray-500/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-gray-400">pending</span>
              </div>
            </div>
          </div>
        </div>

        {/* 筛选和搜索 */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center gap-2 p-1 bg-[#1a2c24] rounded-xl border border-[#2a3c34]">
            {(['all', 'pending', 'present', 'late', 'absent'] as const).map((status) => (
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索姓名或学号..."
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#1a2c24] border border-[#2a3c34] text-sm text-white placeholder:text-[#618975] focus:outline-none focus:ring-2 focus:ring-[#13ec80]"
              />
            </div>
          </div>
        </div>

        {/* 学生列表 */}
        <div className="bg-[#1a2c24] rounded-xl border border-[#2a3c34] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2a3c34]">
                  <th className="text-left px-6 py-4 text-sm font-medium text-[#8ba396]">学生</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[#8ba396]">学号</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[#8ba396]">邮箱</th>
                  <th className="text-center px-6 py-4 text-sm font-medium text-[#8ba396]">签到时间</th>
                  <th className="text-center px-6 py-4 text-sm font-medium text-[#8ba396]">状态</th>
                  <th className="text-center px-6 py-4 text-sm font-medium text-[#8ba396]">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendees.map((attendee) => (
                  <tr key={attendee.id} className="border-b border-[#2a3c34] last:border-0 hover:bg-[#102219]/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#13ec80] to-[#0fd673] flex items-center justify-center text-[#102219] font-bold">
                          {attendee.avatar}
                        </div>
                        <span className="font-medium text-white">{attendee.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#8ba396]">{attendee.studentId}</td>
                    <td className="px-6 py-4 text-sm text-[#8ba396]">{attendee.email}</td>
                    <td className="px-6 py-4 text-center text-sm text-white">
                      {attendee.checkInTime || '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${statusColors[attendee.status]}`}>
                        {statusLabels[attendee.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleStatusChange(attendee.id, 'present')}
                          className={`p-2 rounded-lg transition-colors ${
                            attendee.status === 'present' 
                              ? 'bg-green-600 text-white' 
                              : 'hover:bg-green-600/20 text-green-400'
                          }`}
                          title="标记出席"
                        >
                          <span className="material-symbols-outlined text-lg">check</span>
                        </button>
                        <button
                          onClick={() => handleStatusChange(attendee.id, 'late')}
                          className={`p-2 rounded-lg transition-colors ${
                            attendee.status === 'late' 
                              ? 'bg-amber-600 text-white' 
                              : 'hover:bg-amber-600/20 text-amber-400'
                          }`}
                          title="标记迟到"
                        >
                          <span className="material-symbols-outlined text-lg">schedule</span>
                        </button>
                        <button
                          onClick={() => handleStatusChange(attendee.id, 'absent')}
                          className={`p-2 rounded-lg transition-colors ${
                            attendee.status === 'absent' 
                              ? 'bg-red-600 text-white' 
                              : 'hover:bg-red-600/20 text-red-400'
                          }`}
                          title="标记缺席"
                        >
                          <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredAttendees.length === 0 && (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined text-5xl text-[#2a3c34] mb-4">person_search</span>
              <p className="text-[#8ba396]">没有找到匹配的学生</p>
            </div>
          )}
        </div>

        {/* 底部操作栏 */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 p-4 bg-[#1a2c24] rounded-xl border border-[#2a3c34]">
          <div className="text-sm text-[#8ba396]">
            共 {attendees.length} 名学生，已点名 {attendees.filter((a) => a.status !== 'pending').length} 人
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 h-10 px-4 bg-[#102219] hover:bg-[#283930] text-white rounded-lg transition-colors">
              <span className="material-symbols-outlined text-lg">download</span>
              导出记录
            </button>
            <button className="flex items-center gap-2 h-10 px-4 bg-[#13ec80] hover:bg-[#0fd673] text-[#102219] font-bold rounded-lg transition-colors">
              <span className="material-symbols-outlined text-lg">save</span>
              保存考勤
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
