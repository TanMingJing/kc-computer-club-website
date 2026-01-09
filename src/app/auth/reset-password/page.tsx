/* eslint-disable prettier/prettier */
'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { resetPassword } from '@/services/auth.service';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const userId = searchParams.get('userId');
  const secret = searchParams.get('secret');

  // 如果没有必要的参数，显示错误
  if (!userId || !secret) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#102219] px-4 py-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-72 h-72 bg-[#13ec80] rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-72 h-72 bg-[#13ec80] rounded-full blur-3xl"></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          <div className="bg-[#1a2c23] rounded-2xl border border-[#283930] p-8 shadow-2xl text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 mb-6">
              <span className="material-symbols-outlined text-red-400 text-4xl">
                error
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">无效链接</h1>
            <p className="text-[#9db9ab] mb-6">
              此密码重置链接无效或已过期。请重新申请密码重置。
            </p>
            <Link
              href="/auth/forgot-password"
              className="inline-flex items-center justify-center gap-2 w-full py-3 bg-[#13ec80] text-[#102219] font-bold rounded-lg hover:bg-[#0fd673] transition-colors"
            >
              <span className="material-symbols-outlined">mail</span>
              重新申请重置
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('密码长度至少为 8 个字符');
      return;
    }

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword(userId, secret, password);
      setSuccess(true);
      // 3秒后跳转到登录页
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '密码重置失败');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#102219] px-4 py-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-72 h-72 bg-[#13ec80] rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-72 h-72 bg-[#13ec80] rounded-full blur-3xl"></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          <div className="bg-[#1a2c23] rounded-2xl border border-[#283930] p-8 shadow-2xl text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#13ec80]/10 mb-6">
              <span className="material-symbols-outlined text-[#13ec80] text-4xl">
                check_circle
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">密码重置成功！</h1>
            <p className="text-[#9db9ab] mb-6">
              您的密码已成功重置。即将跳转到登录页面...
            </p>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center gap-2 w-full py-3 bg-[#13ec80] text-[#102219] font-bold rounded-lg hover:bg-[#0fd673] transition-colors"
            >
              <span className="material-symbols-outlined">login</span>
              立即登录
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#102219] px-4 py-12 relative overflow-hidden">
      {/* 装饰背景 */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 right-20 w-72 h-72 bg-[#13ec80] rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-[#13ec80] rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* 卡片容器 */}
        <div className="bg-[#1a2c23] rounded-2xl border border-[#283930] p-8 shadow-2xl">
          {/* 头部 */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-[#13ec80]/10 mb-4">
              <span className="material-symbols-outlined text-[#13ec80] text-3xl">
                lock_reset
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">设置新密码</h1>
            <p className="text-[#9db9ab] text-sm">
              请输入您的新密码
            </p>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* 表单 */}
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            {/* 新密码 */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                新密码 <span className="text-[#9db9ab] text-xs font-normal">（至少8个字符）</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9db9ab] material-symbols-outlined">
                  lock
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  className="w-full pl-10 pr-10 py-3 bg-[#162a21] border border-[#283930] rounded-lg text-white placeholder-[#5a6b63] focus:outline-none focus:border-[#13ec80] focus:ring-1 focus:ring-[#13ec80] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9db9ab] hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
            </div>

            {/* 确认密码 */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                确认新密码
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9db9ab] material-symbols-outlined">
                  lock_check
                </span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  className="w-full pl-10 pr-10 py-3 bg-[#162a21] border border-[#283930] rounded-lg text-white placeholder-[#5a6b63] focus:outline-none focus:border-[#13ec80] focus:ring-1 focus:ring-[#13ec80] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9db9ab] hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined">
                    {showConfirmPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
            </div>

            {/* 提交按钮 */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#13ec80] text-[#102219] font-bold rounded-lg hover:bg-[#0fd673] disabled:opacity-50 transition-colors mt-6 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin material-symbols-outlined">
                    hourglass_bottom
                  </span>
                  处理中...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">check</span>
                  重置密码
                </>
              )}
            </button>
          </form>

          {/* 返回登录链接 */}
          <p className="text-center text-[#9db9ab] text-sm">
            记起密码了？{' '}
            <Link
              href="/auth/login"
              className="text-[#13ec80] hover:text-[#0fd673] font-medium transition-colors"
            >
              返回登录
            </Link>
          </p>
        </div>

        {/* 返回主站链接 */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-[#9db9ab] hover:text-white transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            返回主站
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#102219]">
        <div className="text-white">加载中...</div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
