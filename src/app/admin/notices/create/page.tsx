/* eslint-disable prettier/prettier */
'use client';

import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import { useState } from 'react';

interface NoticeFormData {
  title: string;
  category: string;
  content: string;
  status: 'draft' | 'published';
}

const categories = ['活动通知', '课程公告', '会议通知', '其他'];

export default function CreateNotice() {
  const [formData, setFormData] = useState<NoticeFormData>({
    title: '',
    category: '活动通知',
    content: '',
    status: 'draft',
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // 模拟保存
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    console.log('Save notice:', formData);
    setIsSaving(false);
    
    // TODO: 实际保存到 Appwrite
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <AdminLayout adminName="管理员">
      {/* 页面头部 */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white mb-2">发布新公告</h1>
          <p className="text-gray-400">填写公告信息，支持Markdown格式。</p>
        </div>
        <Link href="/admin/notices">
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
                公告标题 *
              </label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="输入公告标题..."
                required
              />
              <p className="text-gray-500 text-sm mt-2">标题字数建议 10-100 字</p>
            </div>

            {/* 分类 */}
            <div className="bg-[#1a2632] border border-[#283946] rounded-2xl p-6">
              <label htmlFor="category" className="block text-white font-semibold mb-3">
                公告分类 *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-[#1f2d39] border border-[#283946] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#137fec] transition-colors"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* 内容 */}
            <div className="bg-[#1a2632] border border-[#283946] rounded-2xl p-6">
              <label htmlFor="content" className="block text-white font-semibold mb-3">
                公告内容 *
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="输入公告内容...支持 Markdown 格式"
                required
                rows={10}
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
              <div className="bg-[#1f2d39] rounded-xl p-4 mb-4 space-y-2">
                {formData.title && (
                  <h3 className="text-white font-semibold text-sm line-clamp-2">
                    {formData.title}
                  </h3>
                )}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="material-symbols-outlined text-sm">label</span>
                  <span>{formData.category}</span>
                </div>
                {formData.content && (
                  <p className="text-gray-400 text-xs line-clamp-3">
                    {formData.content.replace(/[#*`]/g, '')}
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
                  disabled={isSaving || !formData.title || !formData.content}
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
                      {formData.status === 'draft' ? '保存草稿' : '发布公告'}
                    </>
                  )}
                </Button>
                <Link href="/admin/notices" className="w-full">
                  <button
                    type="button"
                    className="w-full px-4 py-2 bg-[#1f2d39] hover:bg-[#283946] text-gray-400 rounded-lg font-medium transition-colors"
                  >
                    取消
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}
