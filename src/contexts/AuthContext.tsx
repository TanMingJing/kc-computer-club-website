/* eslint-disable prettier/prettier */
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  studentSignup,
  studentLogin,
  adminLogin,
  studentLogout,
  adminLogout,
  checkSession,
} from '@/services/auth.service';

export interface StudentUser {
  id: string;
  email: string;
  name: string;
  studentId?: string;
  major?: string;
  year?: string;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  username?: string;  // 添加 username 字段用于密码修改查询
  role: 'admin';
}

export type AuthUser = StudentUser | AdminUser;

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isStudent: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  adminLogin: (adminEmail: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const checkExistingSession = async () => {
      let restoredUser: AuthUser | null = null;
      
      try {
        // 总是优先检查 Appwrite 的真实 session（跨标签页的事实来源）
        // 而不是依赖 localStorage 的清除逻辑，以避免标签页之间的冲突
        const sessionInfo = await checkSession();
        
        if (sessionInfo.user) {
          restoredUser = sessionInfo.user;
          setUser(restoredUser);
          
          // 更新 localStorage 作为缓存，但不清除其他类型的 session
          // 因为另一个标签页可能还在使用它
          if (sessionInfo.type === 'student') {
            localStorage.setItem('studentSession', JSON.stringify(sessionInfo.user));
          } else if (sessionInfo.type === 'admin') {
            localStorage.setItem('adminSession', JSON.stringify(sessionInfo.user));
          }
        } else {
          // Appwrite 没有活跃 session，尝试从 localStorage 恢复
          // （用于离线或 localStorage 缓存的场景）
          const savedAdminSession = localStorage.getItem('adminSession');
          if (savedAdminSession) {
            try {
              restoredUser = JSON.parse(savedAdminSession) as AdminUser;
              setUser(restoredUser);
              return;
            } catch {
              localStorage.removeItem('adminSession');
            }
          }

          const savedStudentSession = localStorage.getItem('studentSession');
          if (savedStudentSession) {
            try {
              restoredUser = JSON.parse(savedStudentSession) as StudentUser;
              setUser(restoredUser);
              return;
            } catch {
              localStorage.removeItem('studentSession');
            }
          }

          setUser(null);
        }
      } catch (err) {
        console.error('Failed to check session:', err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingSession();
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const studentUser = await studentLogin(email, password);
      setUser(studentUser);
      // 保存到 localStorage 作为备份（学生会话）
      localStorage.setItem('studentSession', JSON.stringify(studentUser));
      // 注意：不清除 adminSession，因为另一个标签页可能还在使用
    } catch (err: unknown) {
      const error = err as Error & { message?: string };
      const errorMsg = error.message || '登录失败';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setError(null);
    try {
      await studentSignup(name, email, password);
      // Do NOT set user state here - user must verify email first
      // Do NOT save to localStorage - session is deleted after signup
      // Signup just creates account, doesn't create a session
    } catch (err: unknown) {
      const error = err as Error & { message?: string };
      const errorMsg = error.message || '注册失败';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const handleAdminLogin = async (adminUsername: string, password: string) => {
    setError(null);
    try {
      const adminUser = await adminLogin(adminUsername, password);
      setUser(adminUser);
      // 注意：不清除 studentSession，因为另一个标签页可能还在使用
    } catch (err: unknown) {
      const error = err as Error & { message?: string };
      const errorMsg = error.message || '管理员登录失败';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const logout = async () => {
    setError(null);
    try {
      // 检查是管理员还是学生，调用对应的登出函数
      if (user && 'role' in user && user.role === 'admin') {
        await adminLogout();
        // 只清除管理员session
        localStorage.removeItem('adminSession');
      } else {
        await studentLogout();
        // 只清除学生session
        localStorage.removeItem('studentSession');
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    isLoading,
    isStudent: user ? !('role' in user) : false,
    isAdmin: user ? 'role' in user && user.role === 'admin' : false,
    login,
    signup,
    adminLogin: handleAdminLogin,
    logout,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
