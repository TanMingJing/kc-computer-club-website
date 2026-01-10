/* eslint-disable prettier/prettier */
'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useState } from 'react';

interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'completed' | 'in-progress' | 'pending';
  subtasks?: { title: string; completed: boolean }[];
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

interface Resource {
  id: string;
  title: string;
  type: 'code' | 'design' | 'document' | 'link';
  url: string;
  lastUpdated: string;
}

const mockProject = {
  id: '1',
  title: 'Smart Campus App',
  description:
    'A cross-platform mobile application designed to simplify campus life for university students. The app aggregates real-time data to help users navigate complex campus buildings, locate available study rooms with power outlets, and track university shuttle bus schedules using live GPS feeds. The goal is to reduce student stress and improve daily logistical efficiency.',
  status: 'In Progress',
  category: ['Mobile App', 'Utility'],
  createdDate: 'Sep 12, 2023',
  lastUpdated: '2 hours ago',
  progress: 65,
  daysRemaining: 12,
  techStack: ['React Native', 'Node.js', 'Firebase'],
  
  milestones: [
    {
      id: '1',
      title: 'Database Schema Design',
      description: 'Defined user collections, bus routes, and room availability structures.',
      dueDate: 'Oct 12',
      status: 'completed',
    },
    {
      id: '2',
      title: 'API Integration',
      description: 'Connecting frontend with Google Maps API and university shuttle data endpoints.',
      dueDate: 'Oct 28',
      status: 'in-progress',
      subtasks: [
        { title: 'Google Maps SDK Setup', completed: true },
        { title: 'Fetch Bus Coordinates', completed: false },
      ],
    },
    {
      id: '3',
      title: 'Beta Testing',
      description: 'Closed beta release for computer club members to gather feedback.',
      dueDate: 'Nov 5',
      status: 'pending',
    },
  ] as Milestone[],

  team: [
    {
      id: '1',
      name: 'Alex Johnson',
      role: 'Lead Developer',
      avatar: '👨‍💻',
    },
    {
      id: '2',
      name: 'Sarah Lee',
      role: 'UI/UX Designer',
      avatar: '👩‍🎨',
    },
    {
      id: '3',
      name: 'Mike Chen',
      role: 'Backend Dev',
      avatar: '👨‍💼',
    },
  ] as TeamMember[],

  stats: {
    tasks: '14/24',
    issues: '3 Open',
  },

  resources: [
    {
      id: '1',
      title: 'Source Code',
      type: 'code',
      url: '#',
      lastUpdated: 'Updated yesterday',
    },
    {
      id: '2',
      title: 'Design File',
      type: 'design',
      url: '#',
      lastUpdated: 'View prototypes',
    },
  ] as Resource[],
};

export default function ProjectDetailPage() {
  const [showShareMenu, setShowShareMenu] = useState(false);

  const getMilestoneIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="material-symbols-outlined text-[#13ec80]">check_circle</span>;
      case 'in-progress':
        return <span className="material-symbols-outlined text-blue-400">schedule</span>;
      case 'pending':
        return <span className="material-symbols-outlined text-gray-400">radio_button_unchecked</span>;
      default:
        return null;
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'code':
        return '👨‍💻';
      case 'design':
        return '🎨';
      case 'document':
        return '📄';
      case 'link':
        return '🔗';
      default:
        return '📎';
    }
  };

  return (
    <div className="min-h-screen bg-[#102219] text-white">
      <Header />

      <main className="grow py-8 px-4 md:px-10 lg:px-20">
        <div className="max-w-7xl mx-auto">
          {/* 页面头部 */}
          <div className="mb-8">
            <div className="text-sm text-gray-400 mb-4 flex items-center gap-2">
              <span>Projects</span>
              <span className="material-symbols-outlined">chevron_right</span>
              <span>{mockProject.title}</span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-black mb-2">{mockProject.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-4">
                  <p>Last updated {mockProject.lastUpdated}</p>
                  <span className="size-1 bg-gray-600 rounded-full"></span>
                  <p>Created {mockProject.createdDate}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {mockProject.category.map((cat) => (
                    <span
                      key={cat}
                      className="inline-flex items-center px-3 py-1 rounded-lg bg-white/10 text-sm font-medium"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="relative">
                  <Button
                    variant="secondary"
                    size="md"
                    rightIcon="share"
                    onClick={() => setShowShareMenu(!showShareMenu)}
                  >
                    Share
                  </Button>
                </div>
                <Link href={`/projects/${mockProject.id}/edit`}>
                  <Button variant="primary" size="md" rightIcon="edit">
                    Edit Project
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* 主网格布局 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* 左列 - 内容 */}
            <div className="lg:col-span-2 space-y-8">
              {/* 概览卡片 */}
              <div className="bg-[#1a2c24] rounded-2xl p-6 lg:p-8 border border-white/10">
                <div className="mb-6">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#13ec80]/10 text-[#13ec80] text-sm font-bold border border-[#13ec80]/30">
                    <span className="size-2 rounded-full bg-[#13ec80]"></span>
                    In Progress
                  </span>
                </div>

                <h3 className="text-lg font-bold mb-3">Description</h3>
                <p className="text-gray-400 leading-relaxed mb-6">{mockProject.description}</p>

                <h3 className="text-xs font-bold uppercase tracking-wider mb-3">Tech Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {mockProject.techStack.map((tech) => (
                    <div
                      key={tech}
                      className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-sm font-medium"
                    >
                      {tech}
                    </div>
                  ))}
                </div>
              </div>

              {/* 里程碑 */}
              <div className="bg-[#1a2c24] rounded-2xl p-6 lg:p-8 border border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold">Milestones</h3>
                  <a href="#" className="text-[#13ec80] text-sm font-bold hover:underline">
                    View Roadmap
                  </a>
                </div>

                <div className="space-y-4">
                  {mockProject.milestones.map((milestone, index) => (
                    <div key={milestone.id}>
                      <div className="flex items-start gap-4">
                        <div className="mt-1 text-xl">{getMilestoneIcon(milestone.status)}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-bold">{milestone.title}</h4>
                            <span className="text-xs text-gray-400">{milestone.dueDate}</span>
                          </div>
                          <p className="text-sm text-gray-400 mb-2">{milestone.description}</p>

                          {milestone.subtasks && (
                            <div className="space-y-1">
                              {milestone.subtasks.map((subtask, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-sm text-gray-400">
                                  <input
                                    type="checkbox"
                                    checked={subtask.completed}
                                    disabled
                                    className="w-4 h-4"
                                  />
                                  <span className={subtask.completed ? 'line-through' : ''}>
                                    {subtask.title}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      {index < mockProject.milestones.length - 1 && (
                        <div className="h-12 border-l border-white/10 ml-6 my-2"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 右列 - 侧边栏 */}
            <div className="space-y-6">
              {/* 进度卡片 */}
              <div className="bg-[#1a2c24] rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-bold mb-4">Overall Progress</h3>
                <div className="mb-4">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-3xl font-black">{mockProject.progress}%</span>
                    <span className="text-sm text-gray-400">{mockProject.daysRemaining} days remaining</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#13ec80]"
                      style={{ width: `${mockProject.progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">TASKS</p>
                    <p className="text-xl font-bold">{mockProject.stats.tasks}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">ISSUES</p>
                    <p className="text-xl font-bold">{mockProject.stats.issues}</p>
                  </div>
                </div>
              </div>

              {/* 团队 */}
              <div className="bg-[#1a2c24] rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">Team</h3>
                  <span className="text-sm text-[#13ec80] font-bold">
                    +{mockProject.team.length}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  {mockProject.team.map((member) => (
                    <div key={member.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#13ec80] to-blue-400 flex items-center justify-center text-lg">
                          {member.avatar}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-sm">{member.name}</p>
                          <p className="text-xs text-gray-400">{member.role}</p>
                        </div>
                      </div>
                      <button className="text-gray-400 hover:text-white">
                        <span className="material-symbols-outlined">more_horiz</span>
                      </button>
                    </div>
                  ))}
                </div>

                <Button variant="secondary" className="w-full" rightIcon="add">
                  Add Collaborator
                </Button>
              </div>

              {/* 资源 */}
              <div className="bg-[#1a2c24] rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-bold mb-4">Resources</h3>
                <div className="space-y-3">
                  {mockProject.resources.map((resource) => (
                    <a
                      key={resource.id}
                      href={resource.url}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{getResourceIcon(resource.type)}</span>
                        <div>
                          <p className="font-bold text-sm">{resource.title}</p>
                          <p className="text-xs text-gray-400">{resource.lastUpdated}</p>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-gray-400">arrow_outward</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
