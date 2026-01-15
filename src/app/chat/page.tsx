/* eslint-disable prettier/prettier */
'use client';

import { useState, useRef, useEffect } from 'react';
import { StudentLayout } from '@/components/layout/StudentLayout';

interface ChatGroup {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  isActive?: boolean;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  time: string;
  isMe: boolean;
}

// 模拟数据
const mockGroups: ChatGroup[] = [
  {
    id: '1',
    name: '编程工作坊',
    avatar: 'groups',
    lastMessage: '明天记得带电脑！',
    lastTime: '刚刚',
    unread: 3,
    isActive: true,
  },
  {
    id: '2',
    name: '黑客马拉松团队',
    avatar: 'code',
    lastMessage: '我们需要讨论 API 设计',
    lastTime: '10 分钟前',
    unread: 0,
  },
  {
    id: '3',
    name: '网络安全兴趣组',
    avatar: 'security',
    lastMessage: '分享一个有趣的漏洞案例',
    lastTime: '1 小时前',
    unread: 0,
  },
  {
    id: '4',
    name: 'AI 研究小组',
    avatar: 'smart_toy',
    lastMessage: '新论文发布了，大家看一下',
    lastTime: '昨天',
    unread: 5,
  },
  {
    id: '5',
    name: '社团公告',
    avatar: 'campaign',
    lastMessage: '下周活动时间调整通知',
    lastTime: '2 天前',
    unread: 0,
  },
];

const mockMessages: ChatMessage[] = [
  {
    id: '1',
    senderId: '2',
    senderName: '李明',
    senderAvatar: '李',
    content: '大家好！明天的编程工作坊有人参加吗？',
    time: '14:00',
    isMe: false,
  },
  {
    id: '2',
    senderId: '3',
    senderName: '王晓',
    senderAvatar: '王',
    content: '我会参加的！这次主题是什么？',
    time: '14:05',
    isMe: false,
  },
  {
    id: '3',
    senderId: '1',
    senderName: '我',
    senderAvatar: '我',
    content: '这次我们会讲 React 和 Next.js 的基础知识',
    time: '14:10',
    isMe: true,
  },
  {
    id: '4',
    senderId: '2',
    senderName: '李明',
    senderAvatar: '李',
    content: '太棒了！我一直想学 Next.js',
    time: '14:15',
    isMe: false,
  },
  {
    id: '5',
    senderId: '4',
    senderName: '张华',
    senderAvatar: '张',
    content: '明天记得带电脑！',
    time: '14:20',
    isMe: false,
  },
];

export default function ChatPage() {
  const [groups] = useState<ChatGroup[]>(mockGroups);
  const [activeGroup, setActiveGroup] = useState<ChatGroup | null>(mockGroups[0]);
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      senderId: '1',
      senderName: '我',
      senderAvatar: '我',
      content: newMessage,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    };
    
    setMessages([...messages, newMsg]);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <StudentLayout>
      {/* 主要内容 */}
      <div className="flex flex-1 overflow-hidden h-[calc(100vh-4rem)]">
        {/* 左侧群组列表 */}
        <aside className={`${showSidebar ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-80 lg:w-96 border-r border-[#e5e8e7] dark:border-[#2a3c34] bg-white dark:bg-[#102219]`}>
          {/* 群组头部 */}
          <div className="flex items-center justify-between p-4 border-b border-[#e5e8e7] dark:border-[#2a3c34]">
            <h1 className="text-xl font-bold text-[#111814] dark:text-white">群组聊天</h1>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-[#1a2c24] rounded-lg transition-colors">
              <span className="material-symbols-outlined text-[#618975]">add</span>
            </button>
          </div>

          {/* 搜索框 */}
          <div className="p-4">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#618975]">search</span>
              <input
                type="text"
                placeholder="搜索群组..."
                className="w-full h-12 pl-10 pr-4 rounded-xl bg-[#f0f4f2] dark:bg-[#1a2c24] border-0 text-sm text-[#111814] dark:text-white placeholder:text-[#618975] focus:outline-none focus:ring-2 focus:ring-[#13ec80]"
              />
            </div>
          </div>

          {/* 群组列表 */}
          <div className="flex-1 overflow-y-auto">
            {groups.map((group) => (
              <div
                key={group.id}
                onClick={() => {
                  setActiveGroup(group);
                  setShowSidebar(false);
                }}
                className={`flex items-center gap-3 p-4 cursor-pointer transition-colors ${
                  activeGroup?.id === group.id
                    ? 'bg-[#13ec80]/10'
                    : 'hover:bg-[#f0f4f2] dark:hover:bg-[#1a2c24]'
                }`}
              >
                <div className="shrink-0 w-12 h-12 rounded-full bg-linear-to-br from-[#13ec80] to-[#0fd673] flex items-center justify-center text-[#102219]">
                  <span className="material-symbols-outlined">{group.avatar}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-[#111814] dark:text-white truncate">{group.name}</h3>
                    <span className="text-xs text-[#618975]">{group.lastTime}</span>
                  </div>
                  <p className="text-sm text-[#618975] truncate">{group.lastMessage}</p>
                </div>
                {group.unread > 0 && (
                  <div className="shrink-0 w-5 h-5 rounded-full bg-[#13ec80] text-[#102219] text-xs font-bold flex items-center justify-center">
                    {group.unread}
                  </div>
                )}
              </div>
            ))}
          </div>
        </aside>

        {/* 右侧聊天区域 */}
        <main className={`${!showSidebar ? 'flex' : 'hidden'} md:flex flex-col flex-1 bg-[#f6f8f7] dark:bg-[#0d1a14]`}>
        {activeGroup ? (
          <>
            {/* 聊天头部 */}
            <header className="flex items-center gap-3 p-4 border-b border-[#e5e8e7] dark:border-[#2a3c34] bg-white dark:bg-[#102219]">
              <button
                onClick={() => setShowSidebar(true)}
                className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-[#1a2c24] rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-[#618975]">arrow_back</span>
              </button>
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#13ec80] to-[#0fd673] flex items-center justify-center text-[#102219]">
                <span className="material-symbols-outlined">{activeGroup.avatar}</span>
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-[#111814] dark:text-white">{activeGroup.name}</h2>
                <p className="text-xs text-[#618975]">12 位成员在线</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-[#1a2c24] rounded-lg transition-colors">
                  <span className="material-symbols-outlined text-[#618975]">search</span>
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-[#1a2c24] rounded-lg transition-colors">
                  <span className="material-symbols-outlined text-[#618975]">more_vert</span>
                </button>
              </div>
            </header>

            {/* 消息列表 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${msg.isMe ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                    msg.isMe
                      ? 'bg-[#13ec80] text-[#102219]'
                      : 'bg-[#283930] text-white'
                  }`}>
                    {msg.senderAvatar}
                  </div>
                  <div className={`max-w-[70%] ${msg.isMe ? 'items-end' : 'items-start'}`}>
                    {!msg.isMe && (
                      <p className="text-xs text-[#618975] mb-1">{msg.senderName}</p>
                    )}
                    <div className={`px-4 py-3 rounded-2xl ${
                      msg.isMe
                        ? 'bg-[#13ec80] text-[#102219] rounded-br-md'
                        : 'bg-white dark:bg-[#1a2c24] text-[#111814] dark:text-white rounded-bl-md border border-[#e5e8e7] dark:border-[#2a3c34]'
                    }`}>
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    </div>
                    <p className={`text-xs text-[#618975] mt-1 ${msg.isMe ? 'text-right' : ''}`}>{msg.time}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* 输入区域 */}
            <div className="p-4 border-t border-[#e5e8e7] dark:border-[#2a3c34] bg-white dark:bg-[#102219]">
              <div className="flex items-center gap-3">
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-[#1a2c24] rounded-lg transition-colors">
                  <span className="material-symbols-outlined text-[#618975]">attach_file</span>
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="输入消息..."
                    className="w-full h-12 px-4 rounded-xl bg-[#f0f4f2] dark:bg-[#1a2c24] border-0 text-sm text-[#111814] dark:text-white placeholder:text-[#618975] focus:outline-none focus:ring-2 focus:ring-[#13ec80]"
                  />
                </div>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-[#1a2c24] rounded-lg transition-colors">
                  <span className="material-symbols-outlined text-[#618975]">emoji_emotions</span>
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="p-3 bg-[#13ec80] hover:bg-[#0fd673] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors"
                >
                  <span className="material-symbols-outlined text-[#102219]">send</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <span className="material-symbols-outlined text-6xl text-[#618975] mb-4">forum</span>
              <p className="text-[#618975]">选择一个群组开始聊天</p>
            </div>
          </div>
        )}
      </main>
      </div>
    </StudentLayout>
  );
}
