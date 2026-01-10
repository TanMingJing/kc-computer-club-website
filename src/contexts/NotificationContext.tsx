/* eslint-disable prettier/prettier */
'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Notification } from '@/app/api/notifications/route';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (title: string, message: string, type: 'approval' | 'notice' | 'activity' | 'announcement', relatedId?: string) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  removeNotification: (notificationId: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);

  // 获取当前用户 ID
  useEffect(() => {
    const getUserId = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
          console.log('用户未登录');
          return;
        }
        const data = await response.json();
        if (data.user?.id) {
          setUserId(data.user.id);
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
      }
    };

    getUserId();
  }, []);

  // 加载通知
  const loadNotifications = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await fetch(`/api/notifications?userId=${userId}`);
      if (!response.ok) {
        console.log('通知 API 不可用');
        return;
      }
      const data = await response.json();
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('加载通知失败:', error);
    }
  }, [userId]);

  // 初始加载
  useEffect(() => {
    loadNotifications();
    // 每 30 秒轮询一次新通知
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  const addNotification = useCallback(async (title: string, message: string, type: 'approval' | 'notice' | 'activity' | 'announcement', relatedId?: string) => {
    if (!userId) return;

    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          title,
          message,
          type,
          relatedId,
        }),
      });
      if (!response.ok) {
        console.log('通知 API 不可用');
        return;
      }
      const data = await response.json();
      if (data.success) {
        setNotifications([data.notification, ...notifications]);
        setUnreadCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error('添加通知失败:', error);
    }
  }, [userId, notifications]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          notificationId,
        }),
      });
      if (!response.ok) {
        console.log('通知 API 不可用');
        return;
      }
      const data = await response.json();
      if (data.success) {
        setNotifications(notifications.map((n) => 
          n.id === notificationId ? { ...n, read: true } : n
        ));
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('标记通知失败:', error);
    }
  }, [userId, notifications]);

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          markAllAsRead: true,
        }),
      });
      if (!response.ok) {
        console.log('通知 API 不可用');
        return;
      }
      const data = await response.json();
      if (data.success) {
        setNotifications(notifications.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('标记全部通知失败:', error);
    }
  }, [userId, notifications]);

  const removeNotification = useCallback((notificationId: string) => {
    setNotifications(notifications.filter((n) => n.id !== notificationId));
  }, [notifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
}
