/* eslint-disable prettier/prettier */
'use client';

import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import { useState } from 'react';

interface Signup {
  id: string;
  name: string;
  email: string;
  activity: string;
  activityId: string;
  date: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

// 模拟报名数据
const mockSignups: Signup[] = [
  {
    id: '1',
    name: '张三',
    email: 'zhangsan@example.com',
    activity: 'Python 数据科学工作坊',
    activityId: '1',
    date: '2025-01-18 14:30',
    status: 'confirmed',
  },
  {
    id: '2',
    name: '李四',
    email: 'lisi@example.com',
    activity: 'Web 开发训练营',
    activityId: '2',
    date: '2025-01-19 10:15',
    status: 'pending',
  },
  {
    id: '3',
    name: '王五',
    email: 'wangwu@example.com',
    activity: 'Python 数据科学工作坊',
    activityId: '1',
    date: '2025-01-15 09:00',
    status: 'confirmed',
  },
  {
    id: '4',
    name: '赵六',
    email: 'zhaoliu@example.com',
    activity: 'AI 应用论坛',
    activityId: '3',
    date: '2025-01-20 16:45',
    status: 'cancelled',
  },
  {
    id: '5',
    name: '孙七',
    email: 'sunqi@example.com',
    activity: 'Web 开发训练营',
    activityId: '2',
    date: '2025-01-21 11:20',
    status: 'confirmed',
  },
];

const statusLabels: Record<string, string> = {
  confirmed: '已确认',
  pending: '待确认',
  cancelled: '已取消',
};

const statusBgColors: Record<string, string> = {
  confirmed: 'bg-green-500/10 text-green-400',
  pending: 'bg-amber-500/10 text-amber-400',
  cancelled: 'bg-red-500/10 text-red-400',
};

export default function AdminSignups() {
  const [searchTerm, setSearchTerm] = useState('');
  const [signups] = useState(mockSignups);
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'pending' | 'cancelled'>('all');

  // 过滤报名
  const filteredSignups = signups.filter((signup) => {
    const matchSearch =
      signup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      signup.email.includes(searchTerm) ||
      signup.activity.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filter === 'all' || signup.status === filter;
    return matchSearch && matchStatus;
  });

  const handleExportCSV = () => {
    // 生成 CSV 内容
    const headers = ['姓名', '邮箱', '活动', '报名时间', '状态'];
    const rows = filteredSignups.map((s) => [
      s.name,
      s.email,
      s.activity,
      s.date,
      statusLabels[s.status],
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    // 下载 CSV 文件
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `signups_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  return (
    <AdminLayout adminName="管理员">
      {/* 页面头部 */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-2">报名管理</h1>
        <p className="text-gray-400">管理所有活动的参与者报名信息。</p>
      </div>

      {/* 操作栏 */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="flex-1">
          <Input
            placeholder="搜索报名者姓名、邮箱或活动..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon="search"
          />
        </div>
        <Button onClick={handleExportCSV} variant="secondary">
          <span className="material-symbols-outlined">download</span>
          导出 CSV
        </Button>
      </div>

      {/* 过滤选项 */}
      <div className="mb-6 flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'all'
              ? 'bg-[#137fec] text-white'
              : 'bg-[#1a2632] text-gray-400 hover:text-white border border-[#283946]'
          }`}
        >
          全部 ({signups.length})
        </button>
        <button
          onClick={() => setFilter('confirmed')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'confirmed'
              ? 'bg-[#137fec] text-white'
              : 'bg-[#1a2632] text-gray-400 hover:text-white border border-[#283946]'
          }`}
        >
          已确认 ({signups.filter((s) => s.status === 'confirmed').length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'pending'
              ? 'bg-[#137fec] text-white'
              : 'bg-[#1a2632] text-gray-400 hover:text-white border border-[#283946]'
          }`}
        >
          待确认 ({signups.filter((s) => s.status === 'pending').length})
        </button>
        <button
          onClick={() => setFilter('cancelled')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'cancelled'
              ? 'bg-[#137fec] text-white'
              : 'bg-[#1a2632] text-gray-400 hover:text-white border border-[#283946]'
          }`}
        >
          已取消 ({signups.filter((s) => s.status === 'cancelled').length})
        </button>
      </div>

      {/* 报名列表表格 */}
      <div className="bg-[#1a2632] border border-[#283946] rounded-2xl overflow-hidden">
        {filteredSignups.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#1f2d39] border-b border-[#283946]">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                    报名者
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                    邮箱
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                    活动
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                    报名时间
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                    状态
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-400">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#283946]">
                {filteredSignups.map((signup) => (
                  <tr
                    key={signup.id}
                    className="hover:bg-[#1f2d39] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="text-white font-medium">{signup.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-400 text-sm">{signup.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/admin/activities/${signup.activityId}/edit`}>
                        <p className="text-[#137fec] hover:underline text-sm">
                          {signup.activity}
                        </p>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-400 text-sm">{signup.date}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${
                          statusBgColors[signup.status]
                        }`}
                      >
                        {statusLabels[signup.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {signup.status !== 'confirmed' && (
                          <button className="p-2 hover:bg-[#283946] text-gray-400 hover:text-green-400 rounded-lg transition-colors">
                            <span className="material-symbols-outlined text-sm">
                              check_circle
                            </span>
                          </button>
                        )}
                        <button className="p-2 hover:bg-[#283946] text-gray-400 hover:text-red-400 rounded-lg transition-colors">
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <span className="material-symbols-outlined text-6xl text-gray-600 block mb-3">
              person
            </span>
            <p className="text-gray-400">没有找到报名信息</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
