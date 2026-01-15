/* eslint-disable prettier/prettier */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SecureCache } from '@/lib/cache';

// ========================================
// 活跃项目部分
// 显示正在进行中的项目，支持缓存
// ========================================

interface Project {
  $id: string;
  title: string;
  description: string;
  status: 'planning' | 'active' | 'completed' | 'on_hold';
  startDate: string;
  endDate?: string;
  lead: string;
  participantCount?: number;
  progress?: number;
  image?: string;
}

export function ActiveProjectsSection() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadActiveProjects();
  }, []);

  const loadActiveProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 先从缓存读取
      const cachedProjects = SecureCache.get<Project[]>('active_projects', {
        ttl: 5 * 60 * 1000, // 5 分钟缓存
        storage: 'localStorage',
      });

      if (cachedProjects) {
        setProjects(cachedProjects);
        return;
      }

      // 从 API 获取
      const response = await fetch('/api/projects?status=active');
      const data = await response.json();

      if (data.success && Array.isArray(data.projects)) {
        const activeProjects = data.projects
          .filter((p: Record<string, unknown>) => p.status === 'active' || p.status === 'planning')
          .slice(0, 6)
          .map((p: Record<string, unknown>) => ({
            $id: p.$id as string,
            title: p.title as string,
            description: p.description as string,
            status: (p.status as 'planning' | 'active' | 'completed' | 'on_hold') || 'planning',
            startDate: new Date(p.startDate as string).toLocaleDateString('zh-CN'),
            endDate: p.endDate ? new Date(p.endDate as string).toLocaleDateString('zh-CN') : undefined,
            lead: (p.lead as string) || '待确定',
            participantCount: (p.participantCount as number) || 0,
            progress: (p.progress as number) || 0,
            image: p.image as string,
          }));

        setProjects(activeProjects);

        // 缓存结果
        SecureCache.set('active_projects', activeProjects, {
          ttl: 5 * 60 * 1000,
          storage: 'localStorage',
        });
      } else {
        setProjects([]);
      }
    } catch (err) {
      console.error('加载活跃项目失败:', err);
      setError('加载项目失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'planning':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'completed':
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      case 'on_hold':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return '进行中';
      case 'planning':
        return '计划中';
      case 'completed':
        return '已完成';
      case 'on_hold':
        return '暂停中';
      default:
        return '未知';
    }
  };

  return (
    <section className="mb-12">
      {/* 标题 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-[var(--foreground)] mb-1">
            活跃项目 🚀
          </h2>
          <p className="text-[var(--text-secondary)]">
            查看目前正在进行的项目
          </p>
        </div>
        <Link
          href="/projects"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium"
        >
          <span>查看全部</span>
          <span className="material-symbols-outlined text-lg">arrow_forward</span>
        </Link>
      </div>

      {/* 加载状态 */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin mb-4">
              <span className="material-symbols-outlined text-4xl text-primary">
                hourglass_bottom
              </span>
            </div>
            <p className="text-[var(--text-secondary)]">加载项目中...</p>
          </div>
        </div>
      )}

      {/* 错误状态 */}
      {error && !isLoading && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-400 text-center mb-4">
          {error}
          <button
            onClick={loadActiveProjects}
            className="ml-2 underline hover:no-underline"
          >
            重试
          </button>
        </div>
      )}

      {/* 空状态 */}
      {!isLoading && !error && projects.length === 0 && (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-12 text-center">
          <span className="material-symbols-outlined text-4xl text-[var(--text-secondary)] mb-4 block">
            folder_open
          </span>
          <p className="text-[var(--text-secondary)] mb-4">
            暂无活跃项目
          </p>
          <Link
            href="/projects/submit"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-black hover:bg-primary/90 transition-colors font-medium"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            提交新项目
          </Link>
        </div>
      )}

      {/* 项目网格 */}
      {!isLoading && !error && projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Link
              key={project.$id}
              href={`/projects/${project.$id}`}
              className="group"
            >
              <div className="h-full rounded-lg border border-[var(--border)] bg-[var(--surface)] overflow-hidden hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                {/* 图片区域 */}
                {project.image ? (
                  <div className="h-40 bg-cover bg-center overflow-hidden">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="h-40 bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-6xl text-primary/40">
                      folder
                    </span>
                  </div>
                )}

                {/* 内容区域 */}
                <div className="p-4">
                  {/* 标题和状态 */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-lg font-bold text-[var(--foreground)] group-hover:text-primary transition-colors line-clamp-2">
                      {project.title}
                    </h3>
                    <span
                      className={`flex-shrink-0 px-2 py-1 rounded text-xs font-medium border ${getStatusColor(
                        project.status
                      )}`}
                    >
                      {getStatusLabel(project.status)}
                    </span>
                  </div>

                  {/* 描述 */}
                  <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-3">
                    {project.description}
                  </p>

                  {/* 进度条 */}
                  {typeof project.progress === 'number' && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-[var(--text-secondary)]">进度</span>
                        <span className="text-xs font-medium text-[var(--foreground)]">
                          {Math.round(project.progress)}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* 底部信息 */}
                  <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                    <span>{project.lead}</span>
                    {project.participantCount !== undefined && (
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">group</span>
                        {project.participantCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
