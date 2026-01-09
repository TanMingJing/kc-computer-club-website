/* eslint-disable prettier/prettier */
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';

// 临时模拟数据
const MOCK_NOTICES = [
  {
    id: '1',
    title: '2024年全球黑客马拉松报名开启',
    excerpt: '年度黑客马拉松活动现已开放报名，邀请所有编程爱好者参与这场48小时的创意与技术盛宴...',
    content: `
      <p class="lead text-xl text-[#9db9ab] font-medium mb-6">
        呼唤所有程序员、设计师和创新者！年度全球黑客马拉松再次来袭，今年我们将比以往更加精彩。准备好你的键盘，迎接48小时紧张刺激的创意与问题解决之旅。
      </p>

      <h2 class="text-2xl font-bold mt-8 mb-4 text-white">活动概述</h2>
      <p class="mb-4">
        电脑社很高兴地宣布，<strong class="text-white">2024年全球黑客马拉松</strong>报名正式开启。本次活动将汇聚来自各个学科的学生，共同协作开发解决现实问题的软件方案。无论你是经验丰富的开发者还是刚刚起步的新手，这里都有你的一席之地。
      </p>
      <p class="mb-4">
        今年的主题是 <span class="font-mono bg-[#1E2E25] px-1.5 py-0.5 rounded text-sm text-primary">"可持续未来"</span>。我们将挑战各团队开发针对环境可持续性、资源管理或绿色技术的应用程序。
      </p>

      <h3 class="text-xl font-bold mt-8 mb-4 text-white">参赛规则</h3>
      <ul class="list-disc pl-5 space-y-2 marker:text-primary mb-6">
        <li>团队必须由 3-5 名成员组成。</li>
        <li>所有代码必须在活动期间编写；允许使用预先编写的库，但必须声明。</li>
        <li>项目必须托管在公开的 GitHub 仓库中。</li>
        <li>最终提交截止时间为周日中午 12:00。</li>
      </ul>

      <blockquote class="border-l-4 border-primary pl-4 italic bg-[#1A2C23] p-4 rounded-r-lg my-8">
        "创新是区分领导者和跟随者的标志。这次黑客马拉松是你在可持续技术领域引领潮流的机会。"
      </blockquote>

      <h3 class="text-xl font-bold mt-8 mb-4 text-white">报名流程</h3>
      <p class="mb-4">
        报名前请确保已组建团队。如果你还没有团队，可以加入我们的 <a href="#" class="text-primary hover:underline">Discord 服务器</a>，在 <code class="font-mono bg-[#1E2E25] px-1.5 py-0.5 rounded text-sm text-primary">#team-formation</code> 频道寻找队友。准备好后，点击下方报名按钮。
      </p>
    `,
    category: 'event',
    tags: ['公告', '比赛'],
    author: 'Alex Chen',
    date: '2024-01-15',
    status: 'published',
    imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&h=675&fit=crop',
    readTime: '5 分钟',
    attachments: [
      { name: 'Hackathon_规则手册_v2.pdf', type: 'pdf', size: '2.4 MB' },
      { name: '活动日程表.png', type: 'image', size: '1.8 MB' },
    ],
  },
  {
    id: '2',
    title: '服务器维护通知',
    excerpt: '俱乐部服务器将于本周日进行升级维护，届时部分服务可能暂时无法访问...',
    content: `
      <p class="lead text-xl text-[#9db9ab] font-medium mb-6">
        为了提升服务质量和系统安全性，俱乐部服务器将进行定期维护升级。
      </p>

      <h2 class="text-2xl font-bold mt-8 mb-4 text-white">维护时间</h2>
      <p class="mb-4">
        <strong class="text-white">日期：</strong>2024年1月14日（周日）<br/>
        <strong class="text-white">时间：</strong>凌晨 2:00 - 6:00（预计4小时）
      </p>

      <h3 class="text-xl font-bold mt-8 mb-4 text-white">影响范围</h3>
      <ul class="list-disc pl-5 space-y-2 marker:text-primary mb-6">
        <li>俱乐部官网可能间歇性无法访问</li>
        <li>在线活动报名系统暂停服务</li>
        <li>AI 聊天助手暂时离线</li>
      </ul>

      <blockquote class="border-l-4 border-primary pl-4 italic bg-[#1A2C23] p-4 rounded-r-lg my-8">
        维护期间请耐心等待，如有紧急事务请通过邮件联系我们。
      </blockquote>
    `,
    category: 'urgent',
    tags: ['紧急', '维护'],
    author: 'Sarah Jones',
    date: '2024-01-12',
    status: 'published',
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=675&fit=crop',
    readTime: '2 分钟',
    attachments: [],
  },
  {
    id: '3',
    title: 'Python 工作坊系列课程',
    excerpt: '为初学者准备的Python编程工作坊即将开课，涵盖基础语法到实战项目开发...',
    content: `
      <p class="lead text-xl text-[#9db9ab] font-medium mb-6">
        想要学习编程却不知从何开始？我们的 Python 工作坊系列课程专为零基础学员设计！
      </p>

      <h2 class="text-2xl font-bold mt-8 mb-4 text-white">课程安排</h2>
      <p class="mb-4">
        本次工作坊共分为 <strong class="text-white">6 期</strong>，每周六下午举行，从基础语法到实战项目逐步进阶。
      </p>

      <h3 class="text-xl font-bold mt-8 mb-4 text-white">课程大纲</h3>
      <ul class="list-disc pl-5 space-y-2 marker:text-primary mb-6">
        <li>第1期：Python 安装与开发环境搭建</li>
        <li>第2期：变量、数据类型与基础运算</li>
        <li>第3期：条件判断与循环</li>
        <li>第4期：函数与模块</li>
        <li>第5期：文件处理与异常</li>
        <li>第6期：实战项目：制作简易游戏</li>
      </ul>
    `,
    category: 'general',
    tags: ['课程', '工作坊'],
    author: 'Mike Ross',
    date: '2024-01-10',
    status: 'published',
    imageUrl: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=1200&h=675&fit=crop',
    readTime: '4 分钟',
    attachments: [
      { name: 'Python课程大纲.pdf', type: 'pdf', size: '1.2 MB' },
    ],
  },
];

const RELATED_NOTICES = [
  { id: '2', title: '服务器维护通知', date: '2024-01-12' },
  { id: '3', title: 'Python 工作坊系列课程', date: '2024-01-10' },
  { id: '4', title: '招募执行委员会成员', date: '2024-01-08' },
];

const TAG_STYLES: Record<string, { bg: string; text: string }> = {
  '公告': { bg: 'bg-primary/10', text: 'text-primary' },
  '比赛': { bg: 'bg-purple-500/10', text: 'text-purple-400' },
  '紧急': { bg: 'bg-amber-500/10', text: 'text-amber-400' },
  '维护': { bg: 'bg-red-500/10', text: 'text-red-400' },
  '课程': { bg: 'bg-blue-500/10', text: 'text-blue-400' },
  '工作坊': { bg: 'bg-cyan-500/10', text: 'text-cyan-400' },
};

export default function NoticeDetailPage() {
  const params = useParams();
  const [notice, setNotice] = useState<(typeof MOCK_NOTICES)[0] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    // 模拟加载公告数据
    const timer = setTimeout(() => {
      const found = MOCK_NOTICES.find((n) => n.id === params.id);
      setNotice(found || null);
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [params.id]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#102219]">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loading size="lg" text="加载公告详情..." />
        </main>
        <Footer />
      </div>
    );
  }

  if (!notice) {
    return (
      <div className="min-h-screen flex flex-col bg-[#102219]">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center py-20">
          <span className="material-symbols-outlined text-6xl text-[#9db9ab] mb-4">article_shortcut</span>
          <h1 className="text-2xl font-bold text-white mb-2">公告不存在</h1>
          <p className="text-[#9db9ab] mb-6">请检查链接是否正确，或返回公告列表</p>
          <Link href="/notices">
            <Button variant="primary" leftIcon="arrow_back">
              返回公告列表
            </Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  // 分类样式供后续扩展使用
  // const categoryStyle = CATEGORY_STYLES[notice.category] || CATEGORY_STYLES.general;

  return (
    <div className="min-h-screen flex flex-col bg-[#102219]">
      <Header />

      <main className="flex-1 w-full max-w-300 mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        {/* 左侧：文章内容 */}
        <article className="flex-1 max-w-200 mx-auto lg:mx-0">
          {/* 面包屑导航 */}
          <nav className="flex items-center text-sm text-[#9db9ab] mb-6 font-medium">
            <Link href="/" className="hover:text-[#13ec80] transition-colors">
              首页
            </Link>
            <span className="mx-2">/</span>
            <Link href="/notices" className="hover:text-[#13ec80] transition-colors">
              公告
            </Link>
            <span className="mx-2">/</span>
            <span className="text-white truncate max-w-50">{notice.title}</span>
          </nav>

          {/* 文章头部 */}
          <header className="mb-8">
            {/* 标签 */}
            <div className="flex flex-wrap gap-2 mb-4">
              {notice.tags.map((tag) => {
                const style = TAG_STYLES[tag] || { bg: 'bg-gray-500/10', text: 'text-gray-400' };
                return (
                  <span
                    key={tag}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${style.bg} ${style.text} border border-current/20`}
                  >
                    {tag}
                  </span>
                );
              })}
            </div>

            {/* 标题 */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight mb-4 tracking-[-0.02em]">
              {notice.title}
            </h1>

            {/* 元信息 */}
            <div className="flex items-center gap-4 text-sm text-[#9db9ab]">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                <span>{notice.date}</span>
              </div>
              <span className="w-1 h-1 rounded-full bg-[#9db9ab]"></span>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">person</span>
                <span>{notice.author}</span>
              </div>
              <span className="w-1 h-1 rounded-full bg-[#9db9ab]"></span>
              <div className="flex items-center gap-1.5 text-[#13ec80]">
                <span className="material-symbols-outlined text-[18px]">schedule</span>
                <span>{notice.readTime}</span>
              </div>
            </div>
          </header>

          {/* 封面图片 */}
          <div className="w-full aspect-video rounded-xl overflow-hidden mb-10 shadow-lg relative group">
            <div
              className="w-full h-full bg-cover bg-center transform transition-transform duration-700 group-hover:scale-105"
              style={{ backgroundImage: `url(${notice.imageUrl})` }}
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-60" />
          </div>

          {/* 文章内容 */}
          <div
            className="prose prose-lg prose-invert max-w-none text-[#E0E0E0] [&_a]:text-primary [&_a]:no-underline hover:[&_a]:underline [&_strong]:text-white [&_code]:bg-[#1E2E25] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:text-primary"
            dangerouslySetInnerHTML={{ __html: notice.content }}
          />

          {/* CTA 区块 */}
          <div className="my-10 p-6 rounded-xl bg-[#1A2C23] border border-[#283930] flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="text-lg font-bold text-white mb-1">准备好参与了吗？</h4>
              <p className="text-sm text-[#9db9ab]">名额有限，先到先得！</p>
            </div>
            <Button variant="primary" size="lg" glow rightIcon="arrow_forward">
              立即报名
            </Button>
          </div>

          {/* 附件区域 */}
          {notice.attachments.length > 0 && (
            <div className="mb-12">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#13ec80]">attachment</span>
                附件下载
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {notice.attachments.map((attachment, index) => (
                  <a
                    key={index}
                    href="#"
                    className="group flex items-center p-4 rounded-lg bg-[#1A2C23] border border-[#283930] hover:border-[#13ec80]/50 transition-colors"
                  >
                    <div
                      className={`h-10 w-10 rounded-lg flex items-center justify-center mr-4 ${
                        attachment.type === 'pdf'
                          ? 'bg-red-500/10 text-red-500'
                          : 'bg-blue-500/10 text-blue-500'
                      }`}
                    >
                      <span className="material-symbols-outlined">
                        {attachment.type === 'pdf' ? 'picture_as_pdf' : 'image'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate group-hover:text-[#13ec80] transition-colors">
                        {attachment.name}
                      </p>
                      <p className="text-xs text-[#9db9ab]">
                        {attachment.size} • {attachment.type.toUpperCase()}
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-[#9db9ab] group-hover:text-[#13ec80]">
                      download
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* 底部互动区域 */}
          <div className="flex items-center justify-between pt-8 border-t border-[#283930]">
            <Link
              href="/notices"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#9db9ab] hover:text-[#13ec80] transition-colors"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              返回公告列表
            </Link>
            <div className="flex gap-2">
              {/* Twitter 分享 */}
              <button
                aria-label="分享到 Twitter"
                className="p-2 rounded-full text-[#9db9ab] hover:text-[#13ec80] hover:bg-[#13ec80]/10 transition-colors"
                onClick={() =>
                  window.open(
                    `https://twitter.com/intent/tweet?text=${encodeURIComponent(notice.title)}&url=${encodeURIComponent(window.location.href)}`,
                    '_blank'
                  )
                }
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </button>
              {/* 复制链接 */}
              <button
                aria-label="复制链接"
                className={`p-2 rounded-full transition-colors ${
                  copySuccess
                    ? 'text-[#13ec80] bg-[#13ec80]/10'
                    : 'text-[#9db9ab] hover:text-[#13ec80] hover:bg-[#13ec80]/10'
                }`}
                onClick={handleCopyLink}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {copySuccess ? 'check' : 'link'}
                </span>
              </button>
              {/* 打印 */}
              <button
                aria-label="打印"
                className="p-2 rounded-full text-[#9db9ab] hover:text-[#13ec80] hover:bg-[#13ec80]/10 transition-colors"
                onClick={handlePrint}
              >
                <span className="material-symbols-outlined text-[20px]">print</span>
              </button>
            </div>
          </div>
        </article>

        {/* 右侧：侧边栏 */}
        <aside className="hidden lg:block w-80 shrink-0">
          <div className="sticky top-24 space-y-8">
            {/* 相关公告 */}
            <div className="bg-[#1A2C23] rounded-xl border border-[#283930] p-5 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#9db9ab] mb-4">
                相关公告
              </h3>
              <div className="space-y-4">
                {RELATED_NOTICES.filter((n) => n.id !== notice.id)
                  .slice(0, 3)
                  .map((relatedNotice, index) => (
                    <div key={relatedNotice.id}>
                      {index > 0 && <hr className="border-[#283930] mb-4" />}
                      <Link href={`/notices/${relatedNotice.id}`} className="block group">
                        <span className="text-xs text-[#13ec80] mb-1 block">{relatedNotice.date}</span>
                        <h4 className="text-sm font-bold text-white group-hover:text-[#13ec80] transition-colors line-clamp-2">
                          {relatedNotice.title}
                        </h4>
                      </Link>
                    </div>
                  ))}
              </div>
              <Link
                href="/notices"
                className="inline-block mt-4 text-xs font-bold text-[#13ec80] hover:text-white transition-colors"
              >
                查看所有公告 →
              </Link>
            </div>

            {/* 下一个活动 */}
            <div className="bg-linear-to-br from-[#1A2C23] to-[#102219] rounded-xl border border-[#283930] p-5 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#13ec80]/20 blur-2xl rounded-full"></div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4 relative z-10">
                近期活动
              </h3>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-[#13ec80]/20 p-2 rounded-lg text-[#13ec80]">
                    <span className="material-symbols-outlined">code</span>
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">代码之夜</p>
                    <p className="text-[#9db9ab] text-xs">每周例会</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-300 mb-4">
                  <span className="material-symbols-outlined text-[16px]">event</span>
                  <span>周五 • 下午 6:00</span>
                </div>
                <Link href="/activities">
                  <Button variant="secondary" size="sm" className="w-full">
                    查看活动详情
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </aside>
      </main>

      <Footer />
    </div>
  );
}
