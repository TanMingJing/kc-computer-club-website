/* eslint-disable prettier/prettier */
'use client';

import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import { useState } from 'react';

interface ActivityFormData {
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  maxAttendees: number;
  status: 'draft' | 'published';
}

// 模拟获取现有活动数据
const MOCK_ACTIVITY: ActivityFormData = {
  title: 'Python 数据科学工作坊',
  description: `# Python 数据科学工作坊

## 课程内容

- NumPy 和 Pandas 基础
- 数据清洗和预处理
- 数据可视化
- 机器学习入门

## 讲师

资深数据科学工程师，拥有 5 年以上行业经验。

## 报名要求

- 具有 Python 基础
- 配备笔记本电脑
- 提前安装相关库`,
  date: '2025-01-20',
  startTime: '19:00',
  endTime: '21:00',
  location: '教学楼 301',
  maxAttendees: 30,
  status: 'published',
};

export default function EditActivity({ params }: { params: { id: string } }) {
  const [formData, setFormData] = useState<ActivityFormData>(MOCK_ACTIVITY);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    // 模拟保存
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log('Update activity:', formData, 'ID:', params.id);
    setIsSaving(false);

    // TODO: 实际更新到 Appwrite
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'maxAttendees' ? parseInt(value) || 0 : value,
    }));
  };

  return (
    <AdminLayout adminName="管理员">
      {/* 页面头部 */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white mb-2">编辑活动</h1>
          <p className="text-gray-400">修改活动信息并保存更改。</p>
        </div>
        <Link href="/admin/activities">
          <button className="text-gray-400 hover:text-white transition-colors">
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：主要表单 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 标题 */}
            <div className="bg-[#1a2632] border border-[#283946] rounded-2xl p-6">
              <label htmlFor="title" className="block text-white font-semibold mb-3">
                活动标题 *
              </label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="输入活动标题..."
                required
              />
            </div>

            {/* 日期和时间 */}
            <div className="bg-[#1a2632] border border-[#283946] rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-4">活动时间 *</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="date" className="block text-gray-400 text-sm font-medium mb-2">
                    日期
                  </label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="startTime" className="block text-gray-400 text-sm font-medium mb-2">
                    开始时间
                  </label>
                  <Input
                    id="startTime"
                    name="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="endTime" className="block text-gray-400 text-sm font-medium mb-2">
                    结束时间
                  </label>
                  <Input
                    id="endTime"
                    name="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* 地点和容量 */}
            <div className="bg-[#1a2632] border border-[#283946] rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-4">活动地点与容量 *</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="location" className="block text-gray-400 text-sm font-medium mb-2">
                    活动地点
                  </label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="例如：教学楼 301"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="maxAttendees" className="block text-gray-400 text-sm font-medium mb-2">
                    最大参与人数（0 = 无限制）
                  </label>
                  <Input
                    id="maxAttendees"
                    name="maxAttendees"
                    type="number"
                    value={formData.maxAttendees}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* 描述 */}
            <div className="bg-[#1a2632] border border-[#283946] rounded-2xl p-6">
              <label htmlFor="description" className="block text-white font-semibold mb-3">
                活动描述 *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="输入活动详细描述...支持 Markdown 格式"
                required
                rows={8}
                className="w-full bg-[#1f2d39] border border-[#283946] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#137fec] transition-colors resize-none"
              />
              <p className="text-gray-500 text-sm mt-2">
                支持 Markdown 格式，包括标题、列表、链接等
              </p>
            </div>
          </div>

          {/* 右侧：预览和发布选项 */}
          <div className="space-y-6">
            {/* 预览卡片 */}
            <div className="bg-[#1a2632] border border-[#283946] rounded-2xl p-6 sticky top-6">
              <h2 className="text-white font-semibold mb-4">预览</h2>

              {/* 预览内容 */}
              <div className="bg-[#1f2d39] rounded-xl p-4 mb-4 space-y-3">
                {formData.title && (
                  <h3 className="text-white font-semibold text-sm">{formData.title}</h3>
                )}
                {formData.date && (
                  <p className="text-gray-400 text-xs flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">calendar_today</span>
                    {formData.date} {formData.startTime}
                  </p>
                )}
                {formData.location && (
                  <p className="text-gray-400 text-xs flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">location_on</span>
                    {formData.location}
                  </p>
                )}
                {formData.description && (
                  <p className="text-gray-400 text-xs line-clamp-3">
                    {formData.description.replace(/[#*`]/g, '')}
                  </p>
                )}
              </div>

              {/* 发布选项 */}
              <div className="space-y-3 mb-6">
                <div className="flex gap-2">
                  <input
                    type="radio"
                    id="draft"
                    name="status"
                    value="draft"
                    checked={formData.status === 'draft'}
                    onChange={handleChange}
                    className="cursor-pointer"
                  />
                  <label htmlFor="draft" className="text-gray-400 text-sm cursor-pointer flex-1">
                    保存为草稿
                  </label>
                </div>
                <div className="flex gap-2">
                  <input
                    type="radio"
                    id="published"
                    name="status"
                    value="published"
                    checked={formData.status === 'published'}
                    onChange={handleChange}
                    className="cursor-pointer"
                  />
                  <label htmlFor="published" className="text-gray-400 text-sm cursor-pointer flex-1">
                    立即发布
                  </label>
                </div>
              </div>

              {/* 按钮组 */}
              <div className="space-y-2">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={isSaving || !formData.title || !formData.location || !formData.date}
                >
                  {isSaving ? (
                    <>
                      <span className="material-symbols-outlined animate-spin">
                        sync
                      </span>
                      保存中...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">check</span>
                      保存修改
                    </>
                  )}
                </Button>
                <Link href="/admin/activities" className="w-full">
                  <button
                    type="button"
                    className="w-full px-4 py-2 bg-[#1f2d39] hover:bg-[#283946] text-gray-400 rounded-lg font-medium transition-colors"
                  >
                    取消
                  </button>
                </Link>
              </div>

              {/* 危险操作 */}
              <div className="mt-6 pt-6 border-t border-[#283946]">
                <button
                  type="button"
                  className="w-full px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg font-medium transition-colors"
                >
                  删除活动
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}
