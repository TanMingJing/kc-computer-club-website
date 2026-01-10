/* eslint-disable prettier/prettier */
'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';
import { useState } from 'react';

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'planning' | 'in-progress' | 'completed';
  progress: number;
  team: { name: string; avatar: string }[];
  lastUpdated: string;
}

const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Smart Campus App',
    description: 'A mobile app to simplify campus life for university students',
    category: 'Mobile App',
    status: 'in-progress',
    progress: 65,
    team: [
      { name: 'Alex Johnson', avatar: '👨‍💻' },
      { name: 'Sarah Lee', avatar: '👩‍🎨' },
      { name: 'Mike Chen', avatar: '👨‍💼' },
    ],
    lastUpdated: '2 hours ago',
  },
  {
    id: '2',
    title: 'AI Chess Bot',
    description: 'A Python-based chess engine using minimax algorithm',
    category: 'AI/ML',
    status: 'completed',
    progress: 100,
    team: [
      { name: 'Alice Freeman', avatar: '👩' },
      { name: 'Marcus Chen', avatar: '👨' },
    ],
    lastUpdated: '1 week ago',
  },
  {
    id: '3',
    title: 'Web Dev Training Platform',
    description: 'Interactive platform for teaching web development',
    category: 'Web App',
    status: 'planning',
    progress: 15,
    team: [
      { name: 'Sarah Jones', avatar: '👩' },
    ],
    lastUpdated: '3 days ago',
  },
];

export default function ProjectsPage() {
  const [filterStatus, setFilterStatus] = useState<'all' | 'planning' | 'in-progress' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProjects = mockProjects.filter((project) => {
    const matchSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || project.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning':
        return 'bg-blue-500/10 text-blue-400';
      case 'in-progress':
        return 'bg-[#13ec80]/10 text-[#13ec80]';
      case 'completed':
        return 'bg-purple-500/10 text-purple-400';
      default:
        return 'bg-gray-500/10 text-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'planning':
        return '规划中';
      case 'in-progress':
        return '进行中';
      case 'completed':
        return '已完成';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-[#102219] text-white">
      <Header />

      <main className="grow py-8 px-4 md:px-10 lg:px-20">
        <div className="max-w-7xl mx-auto">
          {/* 页面头部 */}
          <div className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black mb-2">项目</h1>
              <p className="text-gray-400">浏览和管理社团的所有项目</p>
            </div>

            <Link href="/projects/submit">
              <button className="flex items-center justify-center gap-2 rounded-xl bg-[#13ec80] text-[#102219] px-6 py-2.5 font-bold hover:bg-[#0bb871] transition-all">
                <span className="material-symbols-outlined">add</span>
                新建项目
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
                { value: 'planning', label: '规划中' },
                { value: 'in-progress', label: '进行中' },
                { value: 'completed', label: '已完成' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilterStatus(option.value as 'all' | 'planning' | 'in-progress' | 'completed')}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <Link key={project.id} href={`/projects/${project.id}`}>
                  <div className="h-full bg-[#1a2c24] rounded-2xl p-6 border border-white/10 hover:border-[#13ec80]/50 hover:shadow-lg hover:shadow-[#13ec80]/20 transition-all cursor-pointer group">
                    {/* 状态标签 */}
                    <div className="flex items-center justify-between mb-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold ${getStatusColor(project.status)}`}>
                        {getStatusLabel(project.status)}
                      </span>
                      <span className="text-xs text-gray-400">{project.lastUpdated}</span>
                    </div>

                    {/* 标题和描述 */}
                    <h3 className="text-lg font-bold mb-2 group-hover:text-[#13ec80] transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2">{project.description}</p>

                    {/* 分类 */}
                    <span className="inline-flex items-center px-3 py-1 rounded-lg bg-white/5 text-xs font-medium text-gray-300 mb-4">
                      {project.category}
                    </span>

                    {/* 进度条 */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-400">Progress</span>
                        <span className="font-bold">{project.progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#13ec80] transition-all"
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* 团队成员 */}
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {project.team.map((member, idx) => (
                          <div
                            key={idx}
                            className="w-8 h-8 rounded-full bg-linear-to-br from-[#13ec80] to-blue-400 flex items-center justify-center text-sm border-2 border-[#102219]"
                          >
                            {member.avatar}
                          </div>
                        ))}
                      </div>
                      <span className="text-xs text-gray-400">{project.team.length} members</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <span className="material-symbols-outlined text-5xl text-gray-600 mb-4 block">
                  folder_open
                </span>
                <p className="text-gray-400">没有找到匹配的项目</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
