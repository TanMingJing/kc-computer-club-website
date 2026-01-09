/* eslint-disable prettier/prettier */
'use client';

import { AdminLayout } from '@/components/layout/AdminLayout';
import { useState } from 'react';

interface Comment {
  id: string;
  author: string;
  content: string;
  targetTitle: string;
  targetType: 'notice' | 'activity';
  createdAt: string;
  status: 'approved' | 'pending' | 'rejected';
}

// 模拟评论数据
const mockComments: Comment[] = [
  {
    id: '1',
    author: '张三',
    content: '感谢分享，学到了很多东西！',
    targetTitle: '2025年第一季度活动计划发布',
    targetType: 'notice',
    createdAt: '2025-01-18 14:30',
    status: 'approved',
  },
  {
    id: '2',
    author: '李四',
    content: '请问这次活动有没有其他时间段？',
    targetTitle: 'Python 数据科学工作坊',
    targetType: 'activity',
    createdAt: '2025-01-19 10:15',
    status: 'pending',
  },
  {
    id: '3',
    author: '王五',
    content: '垃圾内容111',
    targetTitle: 'Web 开发训练营',
    targetType: 'activity',
    createdAt: '2025-01-18 09:00',
    status: 'rejected',
  },
  {
    id: '4',
    author: '赵六',
    content: '非常期待下次的活动！',
    targetTitle: 'GIS 讲座',
    targetType: 'activity',
    createdAt: '2025-01-15 16:45',
    status: 'approved',
  },
];

const statusLabels: Record<string, string> = {
  approved: '已批准',
  pending: '待审核',
  rejected: '已拒绝',
};

const statusBgColors: Record<string, string> = {
  approved: 'bg-green-500/10 text-green-400',
  pending: 'bg-amber-500/10 text-amber-400',
  rejected: 'bg-red-500/10 text-red-400',
};

export default function AdminComments() {
  const [comments] = useState(mockComments);
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');

  const filteredComments =
    filter === 'all' ? comments : comments.filter((c) => c.status === filter);

  return (
    <AdminLayout adminName="管理员">
      {/* 页面头部 */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-2">评论管理</h1>
        <p className="text-gray-400">审核和管理用户评论，维护社区环境。</p>
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
          全部 ({comments.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'pending'
              ? 'bg-[#137fec] text-white'
              : 'bg-[#1a2632] text-gray-400 hover:text-white border border-[#283946]'
          }`}
        >
          待审核 ({comments.filter((c) => c.status === 'pending').length})
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'approved'
              ? 'bg-[#137fec] text-white'
              : 'bg-[#1a2632] text-gray-400 hover:text-white border border-[#283946]'
          }`}
        >
          已批准 ({comments.filter((c) => c.status === 'approved').length})
        </button>
        <button
          onClick={() => setFilter('rejected')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'rejected'
              ? 'bg-[#137fec] text-white'
              : 'bg-[#1a2632] text-gray-400 hover:text-white border border-[#283946]'
          }`}
        >
          已拒绝 ({comments.filter((c) => c.status === 'rejected').length})
        </button>
      </div>

      {/* 评论列表 */}
      <div className="bg-[#1a2632] border border-[#283946] rounded-2xl overflow-hidden">
        {filteredComments.length > 0 ? (
          <div className="divide-y divide-[#283946]">
            {filteredComments.map((comment) => (
              <div
                key={comment.id}
                className="px-6 py-4 hover:bg-[#1f2d39] transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-white font-semibold">{comment.author}</h3>
                    <p className="text-gray-400 text-sm">
                      评论于{' '}
                      <span className="text-gray-500">{comment.targetTitle}</span>
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium shrink-0 ${
                      statusBgColors[comment.status]
                    }`}
                  >
                    {statusLabels[comment.status]}
                  </span>
                </div>

                {/* 评论内容 */}
                <div className="bg-[#1f2d39] rounded-lg p-4 mb-3 text-white text-sm">
                  {comment.content}
                </div>

                {/* 元信息 */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">
                        {comment.targetType === 'notice' ? 'article' : 'event'}
                      </span>
                      {comment.targetType === 'notice' ? '公告' : '活动'}评论
                    </span>
                    <span>{comment.createdAt}</span>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex gap-2">
                  {comment.status !== 'approved' && (
                    <button className="flex items-center gap-1 px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg text-xs font-medium transition-colors">
                      <span className="material-symbols-outlined text-sm">
                        check_circle
                      </span>
                      批准
                    </button>
                  )}
                  {comment.status !== 'rejected' && (
                    <button className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-medium transition-colors">
                      <span className="material-symbols-outlined text-sm">
                        block
                      </span>
                      拒绝
                    </button>
                  )}
                  <button className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-medium transition-colors">
                    <span className="material-symbols-outlined text-sm">delete</span>
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <span className="material-symbols-outlined text-6xl text-gray-600 block mb-3">
              chat
            </span>
            <p className="text-gray-400">没有评论</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
