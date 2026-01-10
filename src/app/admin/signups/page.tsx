/* eslint-disable prettier/prettier */
'use client';

import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface Signup {
  $id?: string;
  id: string;
  name: string;
  email: string;
  activity: string;
  activityId: string;
  date: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'attended';
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
  attended: '已参加',
};

const statusBgColors: Record<string, string> = {
  confirmed: 'bg-green-500/10 text-green-400',
  pending: 'bg-amber-500/10 text-amber-400',
  cancelled: 'bg-red-500/10 text-red-400',
  attended: 'bg-blue-500/10 text-blue-400',
};

export default function AdminSignups() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [signups, setSignups] = useState<Signup[]>(mockSignups);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'pending' | 'cancelled' | 'attended'>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusChangeId, setStatusChangeId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<'confirmed' | 'pending' | 'cancelled' | 'attended'>('confirmed');
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [confirmDeleteModal, setConfirmDeleteModal] = useState<{ id: string; name: string } | null>(null);

  // 权限检查
  useEffect(() => {
    if (!authLoading && (!user || !('role' in user) || user.role !== 'admin')) {
      router.push('/admin/login');
    }
  }, [user, authLoading, router]);

  // 加载报名数据
  useEffect(() => {
    if (user && 'role' in user && user.role === 'admin') {
      loadSignups();
    }
  }, [user]);

  const loadSignups = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/signups');
      const data = await response.json();

      if (data.success && data.signups) {
        const formatted = (data.signups as unknown[]).map((s: unknown) => {
          const signup = s as Record<string, unknown>;
          return {
            $id: (signup.$id as string) || '',
            id: (signup.$id as string) || '',
            name: (signup.studentName as string) || '',
            email: (signup.email as string) || '',
            activity: (signup.activityTitle as string) || '',
            activityId: (signup.activityId as string) || '',
            date: new Date(signup.createdAt as string).toLocaleString('zh-CN'),
            status: (signup.status as 'confirmed' | 'pending' | 'cancelled' | 'attended') || 'pending',
          };
        });
        setSignups(formatted);
      } else {
        setSignups(mockSignups);
      }
    } catch (err) {
      console.error('加载报名列表失败:', err);
      setSignups(mockSignups);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/signups/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.success) {
        setSignups(signups.filter((s) => s.$id !== id));
        setConfirmDeleteModal(null);
      } else {
        alert(data.error || '删除失败');
        setIsDeleting(false);
      }
    } catch (err) {
      console.error('删除报名失败:', err);
      alert(err instanceof Error ? err.message : '删除失败');
      setIsDeleting(false);
    }
  };

  const handleRevokeAttendance = async (id: string) => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/signups/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'pending' }),
      });
      const data = await response.json();

      if (data.success) {
        setSignups(
          signups.map((s) =>
            (s.id === id || s.$id === id) ? { ...s, status: 'pending' } : s
          )
        );
        setConfirmDeleteModal(null);
      } else {
        alert(data.error || '撤回失败');
        setIsDeleting(false);
      }
    } catch (err) {
      console.error('撤回报名失败:', err);
      alert(err instanceof Error ? err.message : '撤回失败');
      setIsDeleting(false);
    }
  };

  const handleStatusChange = async (id: string, status: typeof newStatus) => {
    try {
      setIsChangingStatus(true);
      const response = await fetch(`/api/signups/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();

      if (data.success) {
        const signup = signups.find((s) => s.id === id || s.$id === id);
        setSignups(
          signups.map((s) =>
            (s.id === id || s.$id === id) ? { ...s, status } : s
          )
        );
        setStatusChangeId(null);

        // 如果状态变为已确认，发送通知给学生
        if (status === 'confirmed' && signup) {
          try {
            await fetch('/api/notifications', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: signup.id,
                title: '报名已批准',
                message: `您的 "${signup.activity}" 活动报名已被批准，期待您的参与！`,
                type: 'approval',
                relatedId: signup.activityId,
              }),
            });
          } catch (err) {
            console.error('发送通知失败:', err);
          }
        }
      } else {
        alert(data.error || '更新状态失败');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : '更新状态失败');
    } finally {
      setIsChangingStatus(false);
    }
  }

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
        <Button 
          onClick={handleExportCSV} 
          variant="secondary"
          className="bg-[#283946]! hover:bg-[#2f3d47]!"
        >
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
          onClick={() => setFilter('attended')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'attended'
              ? 'bg-[#137fec] text-white'
              : 'bg-[#1a2632] text-gray-400 hover:text-white border border-[#283946]'
          }`}
        >
          已参加 ({signups.filter((s) => s.status === 'attended').length})
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
        {isLoading ? (
          <div className="px-6 py-12 text-center">
            <span className="material-symbols-outlined text-4xl text-gray-600 block mb-3 animate-spin">
              hourglass_bottom
            </span>
            <p className="text-gray-400">加载报名信息中...</p>
          </div>
        ) : filteredSignups.length > 0 ? (
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
                      {signup.activityId ? (
                        <Link href={`/admin/activities/${signup.activityId}/edit`}>
                          <p className="text-[#137fec] hover:underline text-sm">
                            {signup.activity}
                          </p>
                        </Link>
                      ) : (
                        <p className="text-gray-400 text-sm">{signup.activity}</p>
                      )}
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
                        {signup.status !== 'confirmed' && signup.status !== 'attended' && (
                          <button 
                            onClick={() => {
                              setStatusChangeId(signup.id);
                              setNewStatus('confirmed');
                            }}
                            className="p-2 hover:bg-[#283946] text-gray-400 hover:text-green-400 rounded-lg transition-colors"
                            title="确认"
                          >
                            <span className="material-symbols-outlined text-sm">
                              check_circle
                            </span>
                          </button>
                        )}
                        {signup.status === 'confirmed' && (
                          <button 
                            onClick={() => setConfirmDeleteModal({ id: signup.id, name: signup.name })}
                            className="p-2 hover:bg-[#283946] text-gray-400 hover:text-amber-400 rounded-lg transition-colors"
                            title="撤回为待确认"
                          >
                            <span className="material-symbols-outlined text-sm">
                              undo
                            </span>
                          </button>
                        )}
                        {signup.status !== 'attended' && (
                          <button 
                            onClick={() => {
                              setStatusChangeId(signup.id);
                              setNewStatus('attended');
                            }}
                            className="p-2 hover:bg-[#283946] text-gray-400 hover:text-blue-400 rounded-lg transition-colors"
                            title="标记参加"
                          >
                            <span className="material-symbols-outlined text-sm">
                              done_all
                            </span>
                          </button>
                        )}
                        {signup.status !== 'confirmed' && signup.status !== 'attended' && (
                          <button 
                            onClick={() => setConfirmDeleteModal({ id: signup.id, name: signup.name })}
                            className="p-2 hover:bg-[#283946] text-gray-400 hover:text-red-400 rounded-lg transition-colors"
                            title="删除"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        )}
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

      {/* 删除/撤回确认弹窗 */}
      {confirmDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1a2632] border border-[#283946] rounded-2xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-white font-bold text-lg mb-2">
              {signups.find(s => s.id === confirmDeleteModal.id)?.status === 'attended' 
                ? '撤回学生参加记录？' 
                : '删除报名记录'}
            </h3>
            <p className="text-gray-400 text-sm mb-2">
              确定要{signups.find(s => s.id === confirmDeleteModal.id)?.status === 'attended' ? '撤回' : '删除'} <span className="font-bold text-white">{confirmDeleteModal.name}</span> 的{signups.find(s => s.id === confirmDeleteModal.id)?.status === 'attended' ? '参加记录' : '报名'}吗？
            </p>
            {signups.find(s => s.id === confirmDeleteModal.id)?.status !== 'attended' && (
              <p className="text-gray-500 text-xs mb-6">
                删除后将无法恢复。
              </p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteModal(null)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-[#283946] text-white rounded-lg hover:bg-[#2f3d47] transition-colors disabled:opacity-50"
              >
                取消
              </button>
              <button
                onClick={() => {
                  const signup = signups.find(s => s.id === confirmDeleteModal.id);
                  if (signup?.status === 'attended') {
                    handleRevokeAttendance(confirmDeleteModal.id);
                  } else if (signup?.status === 'confirmed') {
                    handleRevokeAttendance(confirmDeleteModal.id);
                  } else {
                    handleDelete(confirmDeleteModal.id);
                  }
                }}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting && (
                  <span className="material-symbols-outlined animate-spin text-sm">
                    hourglass_bottom
                  </span>
                )}
                {isDeleting 
                  ? '处理中...' 
                  : signups.find(s => s.id === confirmDeleteModal.id)?.status === 'attended' 
                    ? '撤回参加' 
                    : signups.find(s => s.id === confirmDeleteModal.id)?.status === 'confirmed'
                    ? '撤回为待确认'
                    : '确认删除'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 状态修改确认对话框 */}
      {statusChangeId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1a2632] border border-[#283946] rounded-2xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-white font-bold text-lg mb-2">
              {newStatus === 'confirmed' ? '确认报名？' : '标记为已参加？'}
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              {newStatus === 'confirmed' 
                ? '确认该学生的报名信息。'
                : '标记该学生已参加此活动。'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setStatusChangeId(null)}
                disabled={isChangingStatus}
                className="flex-1 px-4 py-2 bg-[#283946] text-white rounded-lg hover:bg-[#2f3d47] transition-colors disabled:opacity-50"
              >
                取消
              </button>
              <button
                onClick={() => handleStatusChange(statusChangeId, newStatus)}
                disabled={isChangingStatus}
                className="flex-1 px-4 py-2 bg-[#137fec] text-white rounded-lg hover:bg-[#0f5fcc] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isChangingStatus && (
                  <span className="material-symbols-outlined animate-spin text-sm">
                    hourglass_bottom
                  </span>
                )}
                {isChangingStatus ? '更新中...' : '确认'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
