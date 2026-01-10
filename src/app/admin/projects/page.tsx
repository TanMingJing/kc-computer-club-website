/* eslint-disable prettier/prettier */
'use client';

import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';

interface ProjectPlan {
  id: string;
  title: string;
  category: string;
  description: string;
  teamLeader: string;
  teamSize: number;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'revision';
}

interface ProjectStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

// 模拟数据
const mockStats: ProjectStats = {
  total: 18,
  pending: 5,
  approved: 10,
  rejected: 3,
};

const mockProjects: ProjectPlan[] = [
  {
    id: '1',
    title: '智能校园导航系统',
    category: '移动应用开发',
    description: '基于 AR 技术的校园室内外导航应用，帮助新生快速熟悉校园环境。',
    teamLeader: '张明华',
    teamSize: 4,
    submittedAt: '2026-01-09',
    status: 'pending',
  },
  {
    id: '2',
    title: 'AI 作业批改助手',
    category: '人工智能/机器学习',
    description: '利用 NLP 技术自动批改编程作业，提供详细的反馈和建议。',
    teamLeader: '李小红',
    teamSize: 3,
    submittedAt: '2026-01-08',
    status: 'pending',
  },
  {
    id: '3',
    title: '社团活动管理平台',
    category: '网页应用开发',
    description: '综合性社团管理系统，包括活动发布、报名、签到等功能。',
    teamLeader: '王志强',
    teamSize: 5,
    submittedAt: '2026-01-05',
    status: 'approved',
  },
  {
    id: '4',
    title: '物联网温室监控',
    category: '物联网',
    description: '基于 Arduino 的智能温室监控系统，自动调节温度和湿度。',
    teamLeader: '陈美玲',
    teamSize: 3,
    submittedAt: '2026-01-03',
    status: 'approved',
  },
  {
    id: '5',
    title: '区块链投票系统',
    category: '网络安全',
    description: '基于区块链的透明投票系统，确保选举公正性。',
    teamLeader: '刘伟东',
    teamSize: 2,
    submittedAt: '2026-01-02',
    status: 'rejected',
  },
  {
    id: '6',
    title: '游戏化学习平台',
    category: '游戏开发',
    description: '将编程学习与游戏元素结合，提高学习兴趣和效率。',
    teamLeader: '赵小芳',
    teamSize: 4,
    submittedAt: '2026-01-01',
    status: 'revision',
  },
];

export default function AdminProjectsPage() {
  const [stats] = useState<ProjectStats>(mockStats);
  const [projects, setProjects] = useState<ProjectPlan[]>(mockProjects);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'revision'>('all');
  const [selectedProject, setSelectedProject] = useState<ProjectPlan | null>(null);
  const [showModal, setShowModal] = useState(false);

  const filteredProjects = projects.filter((project) => {
    if (filter === 'all') return true;
    return project.status === filter;
  });

  const statusLabels: Record<string, string> = {
    pending: '待审核',
    approved: '已批准',
    rejected: '已拒绝',
    revision: '需修改',
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    revision: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  };

  const handleApprove = (projectId: string) => {
    setProjects(projects.map((p) => 
      p.id === projectId ? { ...p, status: 'approved' } : p
    ));
    setShowModal(false);
  };

  const handleReject = (projectId: string) => {
    setProjects(projects.map((p) => 
      p.id === projectId ? { ...p, status: 'rejected' } : p
    ));
    setShowModal(false);
  };

  const handleRequestRevision = (projectId: string) => {
    setProjects(projects.map((p) => 
      p.id === projectId ? { ...p, status: 'revision' } : p
    ));
    setShowModal(false);
  };

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        {/* 页面标题 */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">项目计划审核</h1>
            <p className="text-[#8ba396] mt-1">审核学生提交的项目计划提案</p>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#1a2c24] rounded-xl p-6 border border-[#2a3c34]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#13ec80]/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-[#13ec80]">folder</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
                <p className="text-sm text-[#8ba396]">总提案数</p>
              </div>
            </div>
          </div>

          <div className="bg-[#1a2c24] rounded-xl p-6 border border-[#2a3c34]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-amber-400">pending</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.pending}</p>
                <p className="text-sm text-[#8ba396]">待审核</p>
              </div>
            </div>
          </div>

          <div className="bg-[#1a2c24] rounded-xl p-6 border border-[#2a3c34]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-green-400">check_circle</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.approved}</p>
                <p className="text-sm text-[#8ba396]">已批准</p>
              </div>
            </div>
          </div>

          <div className="bg-[#1a2c24] rounded-xl p-6 border border-[#2a3c34]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-red-400">cancel</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.rejected}</p>
                <p className="text-sm text-[#8ba396]">已拒绝</p>
              </div>
            </div>
          </div>
        </div>

        {/* 筛选和搜索 */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center gap-2 p-1 bg-[#1a2c24] rounded-xl border border-[#2a3c34]">
            {(['all', 'pending', 'approved', 'rejected', 'revision'] as const).map((status) => (
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
                placeholder="搜索项目名称..."
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#1a2c24] border border-[#2a3c34] text-sm text-white placeholder:text-[#618975] focus:outline-none focus:ring-2 focus:ring-[#13ec80]"
              />
            </div>
          </div>
        </div>

        {/* 项目列表 */}
        <div className="grid gap-4">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-[#1a2c24] rounded-xl border border-[#2a3c34] p-6 hover:border-[#13ec80]/50 transition-colors"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-white">{project.title}</h3>
                    <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${statusColors[project.status]}`}>
                      {statusLabels[project.status]}
                    </span>
                  </div>
                  <p className="text-sm text-[#8ba396] mb-4 line-clamp-2">{project.description}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-[#618975]">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-lg">category</span>
                      <span>{project.category}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-lg">person</span>
                      <span>{project.teamLeader}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-lg">group</span>
                      <span>{project.teamSize} 人</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-lg">schedule</span>
                      <span>{project.submittedAt}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedProject(project);
                      setShowModal(true);
                    }}
                    className="flex items-center gap-2 h-10 px-4 bg-[#102219] hover:bg-[#13ec80]/10 text-white rounded-lg transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">visibility</span>
                    查看详情
                  </button>
                  {project.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(project.id)}
                        className="flex items-center gap-2 h-10 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg">check</span>
                        批准
                      </button>
                      <button
                        onClick={() => handleReject(project.id)}
                        className="flex items-center gap-2 h-10 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg">close</span>
                        拒绝
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredProjects.length === 0 && (
            <div className="bg-[#1a2c24] rounded-xl border border-[#2a3c34] p-12 text-center">
              <span className="material-symbols-outlined text-5xl text-[#2a3c34] mb-4">folder_off</span>
              <p className="text-[#8ba396]">暂无项目提案</p>
            </div>
          )}
        </div>

        {/* 项目详情弹窗 */}
        {showModal && selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-[#1a2c24] rounded-2xl border border-[#2a3c34] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-[#2a3c34]">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">{selectedProject.title}</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-[#102219] rounded-lg transition-colors"
                  >
                    <span className="material-symbols-outlined text-[#8ba396]">close</span>
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-[#8ba396] mb-2">项目类别</h4>
                  <p className="text-white">{selectedProject.category}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-[#8ba396] mb-2">项目描述</h4>
                  <p className="text-white">{selectedProject.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-[#8ba396] mb-2">项目负责人</h4>
                    <p className="text-white">{selectedProject.teamLeader}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-[#8ba396] mb-2">团队人数</h4>
                    <p className="text-white">{selectedProject.teamSize} 人</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-[#8ba396] mb-2">提交时间</h4>
                  <p className="text-white">{selectedProject.submittedAt}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-[#8ba396] mb-2">当前状态</h4>
                  <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${statusColors[selectedProject.status]}`}>
                    {statusLabels[selectedProject.status]}
                  </span>
                </div>
              </div>
              <div className="p-6 border-t border-[#2a3c34] flex justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="h-10 px-4 bg-[#102219] hover:bg-[#283930] text-white rounded-lg transition-colors"
                >
                  关闭
                </button>
                {selectedProject.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleRequestRevision(selectedProject.id)}
                      className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      要求修改
                    </button>
                    <button
                      onClick={() => handleReject(selectedProject.id)}
                      className="h-10 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      拒绝
                    </button>
                    <button
                      onClick={() => handleApprove(selectedProject.id)}
                      className="h-10 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      批准
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
