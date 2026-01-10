/* eslint-disable prettier/prettier */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function ProjectSubmitPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    projectName: '',
    category: '',
    description: '',
    objectives: '',
    timeline: '',
    resources: '',
  });
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: '1', name: '', email: '', role: '组长' },
  ]);

  const categories = [
    { value: 'web', label: '网页应用开发' },
    { value: 'mobile', label: '移动应用开发' },
    { value: 'ai', label: '人工智能/机器学习' },
    { value: 'game', label: '游戏开发' },
    { value: 'iot', label: '物联网' },
    { value: 'security', label: '网络安全' },
    { value: 'data', label: '数据分析' },
    { value: 'other', label: '其他' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleMemberChange = (index: number, field: keyof TeamMember, value: string) => {
    const newMembers = [...teamMembers];
    newMembers[index] = { ...newMembers[index], [field]: value };
    setTeamMembers(newMembers);
  };

  const addTeamMember = () => {
    if (teamMembers.length < 5) {
      setTeamMembers([...teamMembers, { id: Date.now().toString(), name: '', email: '', role: '成员' }]);
    }
  };

  const removeTeamMember = (index: number) => {
    if (teamMembers.length > 1) {
      setTeamMembers(teamMembers.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // TODO: 实际的提交 API 调用
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    // 跳转到成功页面或返回项目列表
    router.push('/projects?submitted=true');
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[#f6f8f7] dark:bg-[#102219] overflow-x-hidden">
      {/* 顶部导航 */}
      <Header
        navItems={[
          { label: '首页', href: '/' },
          { label: '关于', href: '/about' },
          { label: '公告', href: '/notices' },
          { label: '活动', href: '/activities' },
        ]}
      />

      {/* 主要内容区 */}
      <main className="flex-1 p-4 py-8 lg:p-10">
        <div className="max-w-3xl mx-auto">
          {/* 表单卡片 */}
          <form onSubmit={handleSubmit} className="bg-white dark:bg-[#1a2c24] rounded-2xl shadow-xl dark:shadow-none border border-[#e5e8e7] dark:border-[#2a3c34] overflow-hidden">
            {/* 表单头部 */}
            <div className="p-6 border-b border-[#e5e8e7] dark:border-[#2a3c34] bg-linear-to-r from-[#13ec80]/10 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#13ec80]/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl text-[#13ec80]">lightbulb</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-[#111814] dark:text-white">新项目提案</h1>
                  <p className="text-sm text-[#618975]">填写以下信息提交您的项目计划</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* 项目基本信息 */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-[#111814] dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#13ec80]">description</span>
                  基本信息
                </h3>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#111814] dark:text-white mb-2">
                      项目名称 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="projectName"
                      value={formData.projectName}
                      onChange={handleInputChange}
                      required
                      placeholder="输入项目名称"
                      className="w-full h-12 px-4 rounded-xl bg-[#f0f4f2] dark:bg-[#102219] border border-[#e5e8e7] dark:border-[#2a3c34] text-[#111814] dark:text-white placeholder:text-[#618975] focus:outline-none focus:ring-2 focus:ring-[#13ec80]"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#111814] dark:text-white mb-2">
                      项目类别 <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="w-full h-12 px-4 rounded-xl bg-[#f0f4f2] dark:bg-[#102219] border border-[#e5e8e7] dark:border-[#2a3c34] text-[#111814] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#13ec80]"
                    >
                      <option value="">选择项目类别</option>
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* 项目描述 */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-[#111814] dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#13ec80]">article</span>
                  项目详情
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-[#111814] dark:text-white mb-2">
                    项目描述 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    placeholder="详细描述您的项目想法、功能和预期成果"
                    className="w-full px-4 py-3 rounded-xl bg-[#f0f4f2] dark:bg-[#102219] border border-[#e5e8e7] dark:border-[#2a3c34] text-[#111814] dark:text-white placeholder:text-[#618975] focus:outline-none focus:ring-2 focus:ring-[#13ec80] resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#111814] dark:text-white mb-2">
                    项目目标
                  </label>
                  <textarea
                    name="objectives"
                    value={formData.objectives}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="列出项目的主要目标和里程碑"
                    className="w-full px-4 py-3 rounded-xl bg-[#f0f4f2] dark:bg-[#102219] border border-[#e5e8e7] dark:border-[#2a3c34] text-[#111814] dark:text-white placeholder:text-[#618975] focus:outline-none focus:ring-2 focus:ring-[#13ec80] resize-none"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-[#111814] dark:text-white mb-2">
                      预计时间线
                    </label>
                    <input
                      type="text"
                      name="timeline"
                      value={formData.timeline}
                      onChange={handleInputChange}
                      placeholder="例如：2 个月"
                      className="w-full h-12 px-4 rounded-xl bg-[#f0f4f2] dark:bg-[#102219] border border-[#e5e8e7] dark:border-[#2a3c34] text-[#111814] dark:text-white placeholder:text-[#618975] focus:outline-none focus:ring-2 focus:ring-[#13ec80]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#111814] dark:text-white mb-2">
                      所需资源
                    </label>
                    <input
                      type="text"
                      name="resources"
                      value={formData.resources}
                      onChange={handleInputChange}
                      placeholder="例如：服务器、API 等"
                      className="w-full h-12 px-4 rounded-xl bg-[#f0f4f2] dark:bg-[#102219] border border-[#e5e8e7] dark:border-[#2a3c34] text-[#111814] dark:text-white placeholder:text-[#618975] focus:outline-none focus:ring-2 focus:ring-[#13ec80]"
                    />
                  </div>
                </div>
              </div>

              {/* 团队成员 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-[#111814] dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#13ec80]">group</span>
                    团队成员
                  </h3>
                  {teamMembers.length < 5 && (
                    <button
                      type="button"
                      onClick={addTeamMember}
                      className="flex items-center gap-1 text-sm font-medium text-[#13ec80] hover:text-[#0fd673] transition-colors"
                    >
                      <span className="material-symbols-outlined text-xl">add</span>
                      添加成员
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {teamMembers.map((member, index) => (
                    <div
                      key={member.id}
                      className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-[#f0f4f2] dark:bg-[#102219] border border-[#e5e8e7] dark:border-[#2a3c34]"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#13ec80]/20 flex items-center justify-center text-[#13ec80] font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1 grid gap-3 sm:grid-cols-3">
                        <input
                          type="text"
                          value={member.name}
                          onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                          placeholder="姓名"
                          required
                          className="h-10 px-3 rounded-lg bg-white dark:bg-[#1a2c24] border border-[#e5e8e7] dark:border-[#2a3c34] text-sm text-[#111814] dark:text-white placeholder:text-[#618975] focus:outline-none focus:ring-2 focus:ring-[#13ec80]"
                        />
                        <input
                          type="email"
                          value={member.email}
                          onChange={(e) => handleMemberChange(index, 'email', e.target.value)}
                          placeholder="邮箱"
                          required
                          className="h-10 px-3 rounded-lg bg-white dark:bg-[#1a2c24] border border-[#e5e8e7] dark:border-[#2a3c34] text-sm text-[#111814] dark:text-white placeholder:text-[#618975] focus:outline-none focus:ring-2 focus:ring-[#13ec80]"
                        />
                        <select
                          value={member.role}
                          onChange={(e) => handleMemberChange(index, 'role', e.target.value)}
                          className="h-10 px-3 rounded-lg bg-white dark:bg-[#1a2c24] border border-[#e5e8e7] dark:border-[#2a3c34] text-sm text-[#111814] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#13ec80]"
                        >
                          <option value="组长">组长</option>
                          <option value="成员">成员</option>
                          <option value="技术负责">技术负责</option>
                          <option value="设计负责">设计负责</option>
                        </select>
                      </div>
                      {teamMembers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTeamMember(index)}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-[#618975]">
                  最多可添加 5 名团队成员
                </p>
              </div>

              {/* 附件上传 */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-[#111814] dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#13ec80]">attach_file</span>
                  附件（可选）
                </h3>
                
                <div className="border-2 border-dashed border-[#e5e8e7] dark:border-[#2a3c34] rounded-xl p-8 text-center hover:border-[#13ec80] transition-colors cursor-pointer">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#f0f4f2] dark:bg-[#102219] flex items-center justify-center">
                      <span className="material-symbols-outlined text-2xl text-[#618975]">cloud_upload</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#111814] dark:text-white">
                        点击或拖拽文件到此处上传
                      </p>
                      <p className="text-xs text-[#618975] mt-1">
                        支持 PDF、Word、图片等格式，最大 10MB
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 表单底部 */}
            <div className="p-6 border-t border-[#e5e8e7] dark:border-[#2a3c34] bg-[#f6f8f7] dark:bg-[#102219]">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm text-[#618975]">
                  <span className="text-red-500">*</span> 为必填项
                </p>
                <div className="flex items-center gap-3">
                  <Link
                    href="/projects"
                    className="h-12 px-6 flex items-center justify-center rounded-xl border border-[#e5e8e7] dark:border-[#2a3c34] text-[#111814] dark:text-white font-medium hover:bg-[#f0f4f2] dark:hover:bg-[#1a2c24] transition-colors"
                  >
                    取消
                  </Link>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-12 px-8 flex items-center justify-center gap-2 rounded-xl bg-[#13ec80] hover:bg-[#0fd673] text-[#102219] font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="material-symbols-outlined animate-spin">hourglass_bottom</span>
                        提交中...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined">send</span>
                        提交计划
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
