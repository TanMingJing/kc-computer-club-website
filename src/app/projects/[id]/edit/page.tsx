/* eslint-disable prettier/prettier */
'use client';

import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useState } from 'react';

interface ProjectForm {
  title: string;
  description: string;
  techStack: string[];
  repositoryUrl: string;
  demoUrl: string;
  visibility: 'public' | 'private' | 'members-only';
}

export default function EditProjectPage() {
  const [form, setForm] = useState<ProjectForm>({
    title: 'AI Chess Bot - DeepBlue Clone',
    description:
      'A Python-based chess engine that uses the minimax algorithm with alpha-beta pruning. Designed to help club members understand basic game theory concepts.',
    techStack: ['Python', 'PyGame'],
    repositoryUrl: 'https://github.com/club/chess-bot',
    demoUrl: 'https://...',
    visibility: 'public',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [techInput, setTechInput] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleAddTech = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && techInput.trim()) {
      e.preventDefault();
      setForm((prev) => ({
        ...prev,
        techStack: [...prev.techStack, techInput.trim()],
      }));
      setTechInput('');
    }
  };

  const handleRemoveTech = (index: number) => {
    setForm((prev) => ({
      ...prev,
      techStack: prev.techStack.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSaving(false);
    // TODO: 保存到 API
  };

  return (
    <div className="min-h-screen bg-[#102219] text-white">
      <Header />

      <main className="grow py-8 px-4 md:px-10 lg:px-20">
        <div className="max-w-4xl mx-auto">
          {/* 面包屑 */}
          <div className="mb-6 flex items-center gap-2 text-sm text-gray-400">
            <a href="#" className="hover:text-white">
              Dashboard
            </a>
            <span>/</span>
            <a href="#" className="hover:text-white">
              My Projects
            </a>
            <span>/</span>
            <span className="text-white">Edit Project</span>
          </div>

          {/* 页面头部 */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-white/10 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-black mb-2">Edit Project Details</h1>
              <p className="text-gray-400">
                Manage your project information, team, and visibility settings.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="secondary">Cancel</Button>
              <Button
                variant="primary"
                rightIcon="save"
                onClick={handleSave}
                isLoading={isSaving}
              >
                Save Changes
              </Button>
            </div>
          </div>

          {/* 主要内容网格 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 左列 - 主要信息 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 基本信息 */}
              <div className="bg-[#1a2c24] rounded-2xl p-6 lg:p-8 border border-white/10">
                <h3 className="text-xl font-bold mb-6">General Information</h3>

                <div className="space-y-6">
                  {/* 项目标题 */}
                  <div>
                    <label className="block text-sm font-bold mb-2">Project Title</label>
                    <Input
                      value={form.title}
                      onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter project title..."
                    />
                  </div>

                  {/* 描述 */}
                  <div>
                    <label className="block text-sm font-bold mb-2">Description</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter project description..."
                      rows={5}
                      className="w-full rounded-xl border border-white/10 bg-[#102219] p-4 text-white placeholder-gray-500 focus:border-[#13ec80] focus:ring-1 focus:ring-[#13ec80] outline-none transition-all resize-none"
                    />
                  </div>

                  {/* 技术栈 */}
                  <div>
                    <label className="block text-sm font-bold mb-2">Tech Stack</label>
                    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-[#102219] p-3 focus-within:ring-1 focus-within:ring-[#13ec80] focus-within:border-[#13ec80] transition-all">
                      {form.techStack.map((tech, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1.5 rounded-full bg-[#13ec80]/20 px-3 py-1 text-sm font-medium text-[#13ec80]"
                        >
                          {tech}
                          <button
                            onClick={() => handleRemoveTech(index)}
                            className="rounded-full p-0.5 hover:bg-black/20"
                          >
                            <span className="material-symbols-outlined text-[14px]">close</span>
                          </button>
                        </span>
                      ))}
                      <input
                        type="text"
                        value={techInput}
                        onChange={(e) => setTechInput(e.target.value)}
                        onKeyDown={handleAddTech}
                        placeholder="Add technology (e.g., React)..."
                        className="flex-1 bg-transparent border-none p-1 text-base focus:ring-0 placeholder-gray-500"
                      />
                    </div>
                    <p className="text-xs text-gray-400 pt-1">Press Enter to add a tag.</p>
                  </div>
                </div>
              </div>

              {/* 链接和资源 */}
              <div className="bg-[#1a2c24] rounded-2xl p-6 lg:p-8 border border-white/10">
                <h3 className="text-xl font-bold mb-6">Links & Resources</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-2">Repository URL</label>
                    <Input
                      type="url"
                      value={form.repositoryUrl}
                      onChange={(e) => setForm((prev) => ({ ...prev, repositoryUrl: e.target.value }))}
                      placeholder="https://github.com/..."
                      leftIcon="link"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">Live Demo (Optional)</label>
                    <Input
                      type="url"
                      value={form.demoUrl}
                      onChange={(e) => setForm((prev) => ({ ...prev, demoUrl: e.target.value }))}
                      placeholder="https://..."
                      leftIcon="public"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 右列 - 侧边栏 */}
            <div className="space-y-6">
              {/* 可见性设置 */}
              <div className="bg-[#1a2c24] rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-bold mb-4">Visibility</h3>

                <div className="space-y-3">
                  {/* Public */}
                  <label
                    className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      form.visibility === 'public'
                        ? 'border-[#13ec80] bg-[#13ec80]/10'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      value="public"
                      checked={form.visibility === 'public'}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, visibility: e.target.value as 'public' | 'private' | 'members-only' }))
                      }
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-bold flex items-center gap-2 mb-1">
                        <span className="material-symbols-outlined text-[#13ec80]">globe</span>
                        Public
                      </p>
                      <p className="text-xs text-gray-400">
                        Visible to all club members and guests.
                      </p>
                    </div>
                  </label>

                  {/* Private */}
                  <label
                    className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      form.visibility === 'private'
                        ? 'border-[#13ec80] bg-[#13ec80]/10'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      value="private"
                      checked={form.visibility === 'private'}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, visibility: e.target.value as 'public' | 'private' | 'members-only' }))
                      }
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-bold flex items-center gap-2 mb-1">
                        <span className="material-symbols-outlined">lock</span>
                        Private
                      </p>
                      <p className="text-xs text-gray-400">
                        Only visible to project members.
                      </p>
                    </div>
                  </label>

                  {/* Members Only */}
                  <label
                    className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      form.visibility === 'members-only'
                        ? 'border-[#13ec80] bg-[#13ec80]/10'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      value="members-only"
                      checked={form.visibility === 'members-only'}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, visibility: e.target.value as 'public' | 'private' | 'members-only' }))
                      }
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-bold flex items-center gap-2 mb-1">
                        <span className="material-symbols-outlined">group</span>
                        Members Only
                      </p>
                      <p className="text-xs text-gray-400">
                        Only visible to club members.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* 团队成员 */}
              <div className="bg-[#1a2c24] rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">Team</h3>
                  <span className="text-sm text-[#13ec80]">3</span>
                </div>

                <div className="space-y-3 mb-4">
                  {[
                    { name: 'Alice Freeman', role: 'Lead Developer', avatar: '👩' },
                    { name: 'Marcus Chen', role: 'Developer', avatar: '👨' },
                    { name: 'Sarah Jones', role: 'Designer', avatar: '👩' },
                  ].map((member, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-linear-to-br from-[#13ec80] to-blue-400 flex items-center justify-center">
                        {member.avatar}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold">{member.name}</p>
                        <p className="text-xs text-gray-400">{member.role}</p>
                      </div>
                      <button className="text-gray-400 hover:text-white">
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  ))}
                </div>

                <div className="relative">
                  <Input placeholder="Search by name or email" leftIcon="person_add" />
                </div>
              </div>

              {/* 危险区域 */}
              <div className="bg-red-500/10 rounded-2xl p-6 border border-red-500/20">
                <h3 className="text-lg font-bold text-red-400 mb-2">Danger Zone</h3>
                <p className="text-xs text-red-400/70 mb-4">
                  Deleting this project will remove all data and cannot be undone.
                </p>

                {!showDeleteConfirm ? (
                  <Button
                    variant="secondary"
                    className="w-full bg-red-500/20! text-red-400! hover:bg-red-500/30!"
                    rightIcon="delete"
                  >
                    Delete Project
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-red-400 font-bold">
                      Are you sure? This action cannot be undone.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        className="flex-1 bg-white/10!"
                        onClick={() => setShowDeleteConfirm(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="flex-1 bg-red-500! text-white! hover:bg-red-600!"
                        onClick={() => {
                          // TODO: Delete project
                          setShowDeleteConfirm(false);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
