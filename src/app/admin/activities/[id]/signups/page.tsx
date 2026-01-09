/* eslint-disable prettier/prettier */
'use client';

import { AdminLayout } from '@/components/layout/AdminLayout';
import Link from 'next/link';
import { useState } from 'react';

interface Signup {
  id: string;
  name: string;
  email: string;
  phone: string;
  signedUpAt: string;
  status: 'attended' | 'registered' | 'cancelled';
}

// 模拟报名数据
const mockSignups: Signup[] = [
  {
    id: '1',
    name: '张三',
    email: 'zhangsan@example.com',
    phone: '13800138000',
    signedUpAt: '2025-01-18',
    status: 'registered',
  },
  {
    id: '2',
    name: '李四',
    email: 'lisi@example.com',
    phone: '13900139000',
    signedUpAt: '2025-01-19',
    status: 'registered',
  },
  {
    id: '3',
    name: '王五',
    email: 'wangwu@example.com',
    phone: '13700137000',
    signedUpAt: '2025-01-10',
    status: 'attended',
  },
  {
    id: '4',
    name: '赵六',
    email: 'zhaoliu@example.com',
    phone: '13600136000',
    signedUpAt: '2025-01-15',
    status: 'cancelled',
  },
];

const statusLabels: Record<string, string> = {
  attended: '已参加',
  registered: '已注册',
  cancelled: '已取消',
};

const statusBgColors: Record<string, string> = {
  attended: 'bg-green-500/10 text-green-400',
  registered: 'bg-blue-500/10 text-blue-400',
  cancelled: 'bg-red-500/10 text-red-400',
};

export default function ActivitySignups() {
  const [signups] = useState(mockSignups);
  const [selectedSignups, setSelectedSignups] = useState<Set<string>>(new Set());

  const toggleSelectSignup = (id: string) => {
    const newSelected = new Set(selectedSignups);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedSignups(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedSignups.size === signups.length) {
      setSelectedSignups(new Set());
    } else {
      setSelectedSignups(new Set(signups.map((s) => s.id)));
    }
  };

  return (
    <AdminLayout adminName="管理员">
      {/* 页面头部 */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white mb-2">
            报名管理 - Python 数据科学工作坊
          </h1>
          <p className="text-gray-400">管理参与者的报名信息。</p>
        </div>
        <Link href="/admin/activities">
          <button className="text-gray-400 hover:text-white transition-colors">
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </Link>
      </div>

      {/* 统计信息 */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[#1a2632] border border-[#283946] rounded-xl p-4">
          <p className="text-gray-400 text-sm mb-1">总报名人数</p>
          <p className="text-2xl font-bold text-white">{signups.length}</p>
        </div>
        <div className="bg-[#1a2632] border border-[#283946] rounded-xl p-4">
          <p className="text-gray-400 text-sm mb-1">已注册</p>
          <p className="text-2xl font-bold text-blue-400">
            {signups.filter((s) => s.status === 'registered').length}
          </p>
        </div>
        <div className="bg-[#1a2632] border border-[#283946] rounded-xl p-4">
          <p className="text-gray-400 text-sm mb-1">已参加</p>
          <p className="text-2xl font-bold text-green-400">
            {signups.filter((s) => s.status === 'attended').length}
          </p>
        </div>
        <div className="bg-[#1a2632] border border-[#283946] rounded-xl p-4">
          <p className="text-gray-400 text-sm mb-1">已取消</p>
          <p className="text-2xl font-bold text-red-400">
            {signups.filter((s) => s.status === 'cancelled').length}
          </p>
        </div>
      </div>

      {/* 操作栏 */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-[#1a2632] hover:bg-[#1f2d39] text-gray-400 rounded-lg border border-[#283946] transition-colors">
          <span className="material-symbols-outlined">download</span>
          导出为 Excel
        </button>
        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-[#1a2632] hover:bg-[#1f2d39] text-gray-400 rounded-lg border border-[#283946] transition-colors">
          <span className="material-symbols-outlined">mail</span>
          群发邮件
        </button>
        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors">
          <span className="material-symbols-outlined">delete</span>
          批量删除
        </button>
      </div>

      {/* 报名列表 */}
      <div className="bg-[#1a2632] border border-[#283946] rounded-2xl overflow-hidden">
        {signups.length > 0 ? (
          <>
            {/* 表头 */}
            <div className="px-6 py-4 border-b border-[#283946] flex items-center justify-between bg-[#1f2d39]">
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={selectedSignups.size === signups.length}
                  onChange={toggleSelectAll}
                  className="cursor-pointer"
                />
                <span className="text-gray-400 text-sm">
                  已选择 {selectedSignups.size} 条记录
                </span>
              </div>
            </div>

            {/* 表格数据 */}
            <div className="divide-y divide-[#283946]">
              {signups.map((signup) => (
                <div
                  key={signup.id}
                  className="px-6 py-4 hover:bg-[#1f2d39] transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedSignups.has(signup.id)}
                      onChange={() => toggleSelectSignup(signup.id)}
                      className="cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold mb-1">{signup.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">
                            mail
                          </span>
                          {signup.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">
                            phone
                          </span>
                          {signup.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">
                            calendar_today
                          </span>
                          {signup.signedUpAt}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 状态和操作 */}
                  <div className="flex items-center gap-4 shrink-0">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${
                        statusBgColors[signup.status]
                      }`}
                    >
                      {statusLabels[signup.status]}
                    </span>
                    <button className="p-2 hover:bg-[#283946] rounded-lg text-gray-400 hover:text-red-400 transition-colors">
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="px-6 py-12 text-center">
            <span className="material-symbols-outlined text-6xl text-gray-600 block mb-3">
              person
            </span>
            <p className="text-gray-400">暂无报名信息</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
