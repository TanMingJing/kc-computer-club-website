/* eslint-disable prettier/prettier */
'use client';

import { StudentLayout } from '@/components/layout/StudentLayout';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface ProjectMember {
  userId: string;
  name: string;
  email: string;
  role: string;
}

interface Project {
  projectId: string;
  teamName: string;
  title: string;
  description: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected' | 'revision';
  members: ProjectMember[];
  leaderId: string;
  leaderEmail: string;
  projectLink?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProjectsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'revision'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // 加载项目列表
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects');
        const data = await response.json();

        if (data.success) {
          setProjects(data.projects || []);
        } else {
          setError(data.error || '加载项目失败');
        }
      } catch (err) {
        console.error('加载项目失败:', err);
        setError('加载项目失败，请稍后重试');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const filteredProjects = projects.filter((project) => {
    const matchSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       project.teamName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || project.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-500/10 text-amber-400';
      case 'approved':
        return 'bg-[#13ec80]/10 text-[#13ec80]';
      case 'rejected':
        return 'bg-red-500/10 text-red-400';
      case 'revision':
        return 'bg-blue-500/10 text-blue-400';
      default:
        return 'bg-gray-500/10 text-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return '待审核';
      case 'approved':
        return '已批准';
      case 'rejected':
        return '已拒绝';
      case 'revision':
        return '需修改';
      default:
        return status;
    }
  };

  const getCategoryLabel = (category: string) => {
    const categoryMap: Record<string, string> = {
      'web': '网页应用',
      'mobile': '移动应用',
      'ai': 'AI/ML',
      'game': '游戏开发',
      'iot': '物联网',
      'security': '网络安全',
      'data': '数据分析',
      'other': '其他',
    };
    return categoryMap[category] || category;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return '今天';
    if (days === 1) return '昨天';
    if (days < 7) return `${days} 天前`;
    return date.toLocaleDateString('zh-CN');
  };

  // 检查当前用户是否已有项目
  const userHasProject = user ? projects.some(p => 
    p.members.some(m => m.email.toLowerCase() === user.email.toLowerCase())
  ) : false;

  if (isLoading || authLoading) {
    return (
      <StudentLayout>
        <main className="grow py-8 px-4 md:px-10 lg:px-20">
          <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[50vh]">
            <div className="flex flex-col items-center gap-4">
              <span className="material-symbols-outlined text-4xl text-[#13ec80] animate-spin">hourglass_empty</span>
              <p className="text-[var(--text-secondary)]">加载中...</p>
            </div>
          </div>
        </main>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <main className="grow py-8 px-4 md:px-10 lg:px-20">
        <div className="max-w-7xl mx-auto">
          {/* 页面头部 */}
          <div className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black mb-2">项目</h1>
              <p className="text-gray-400">浏览和管理社团的所有项目</p>
            </div>

            <Link href="/projects/submit">
              <button 
                disabled={userHasProject}
                className={`flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 font-bold transition-all ${
                  userHasProject 
                    ? 'bg-gray-500/50 text-gray-400 cursor-not-allowed' 
                    : 'bg-[#13ec80] text-[#102219] hover:bg-[#0bb871]'
                }`}
              >
                <span className="material-symbols-outlined">add</span>
                {userHasProject ? '已有项目' : '新建项目'}
              </button>
            </Link>
          </div>

          {/* 搜索和过滤 */}
          <div className="mb-8 space-y-4">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <span className="material-symbols-outlined">search</span>
              </span>
              <input
                type="text"
                placeholder="搜索项目名称或描述..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#1a2c24] pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:border-[#13ec80] focus:ring-1 focus:ring-[#13ec80] outline-none transition-all"
              />
            </div>

            {/* 状态过滤 */}
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: '全部' },
                { value: 'pending', label: '待审核' },
                { value: 'approved', label: '已批准' },
                { value: 'revision', label: '需修改' },
                { value: 'rejected', label: '已拒绝' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilterStatus(option.value as 'all' | 'pending' | 'approved' | 'rejected' | 'revision')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    filterStatus === option.value
                      ? 'bg-[#13ec80] text-[#102219]'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* 项目网格 */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3">
              <span className="material-symbols-outlined text-red-400">error</span>
              <p className="text-red-400">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <Link key={project.projectId} href={`/projects/${project.projectId}`}>
                  <div className="h-full bg-[#1a2c24] rounded-2xl p-6 border border-white/10 hover:border-[#13ec80]/50 hover:shadow-lg hover:shadow-[#13ec80]/20 transition-all cursor-pointer group">
                    {/* 状态标签 */}
                    <div className="flex items-center justify-between mb-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold ${getStatusColor(project.status)}`}>
                        {getStatusLabel(project.status)}
                      </span>
                      <span className="text-xs text-gray-400">{formatDate(project.updatedAt)}</span>
                    </div>

                    {/* 组名 */}
                    <p className="text-xs text-[#13ec80] font-medium mb-1">{project.teamName}</p>

                    {/* 标题和描述 */}
                    <h3 className="text-lg font-bold mb-2 group-hover:text-[#13ec80] transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2">{project.description}</p>

                    {/* 分类 */}
                    <span className="inline-flex items-center px-3 py-1 rounded-lg bg-white/5 text-xs font-medium text-gray-300 mb-4">
                      {getCategoryLabel(project.category)}
                    </span>

                    {/* 项目链接 */}
                    {project.projectLink && (
                      <div className="mb-4">
                        <a 
                          href={project.projectLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="material-symbols-outlined text-sm">link</span>
                          查看仓库
                        </a>
                      </div>
                    )}

                    {/* 团队成员 */}
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {project.members.slice(0, 4).map((member, idx) => (
                          <div
                            key={idx}
                            className="w-8 h-8 rounded-full bg-linear-to-br from-[#13ec80] to-blue-400 flex items-center justify-center text-sm font-bold border-2 border-[#102219]"
                            title={member.name}
                          >
                            {member.name.charAt(0)}
                          </div>
                        ))}
                        {project.members.length > 4 && (
                          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold border-2 border-[#102219]">
                            +{project.members.length - 4}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">{project.members.length} 名成员</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <span className="material-symbols-outlined text-5xl text-gray-600 mb-4 block">
                  folder_open
                </span>
                <p className="text-gray-400">
                  {searchTerm || filterStatus !== 'all' ? '没有找到匹配的项目' : '暂无项目，快来创建第一个项目吧！'}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </StudentLayout>
  );
}
