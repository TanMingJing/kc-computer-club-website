/* eslint-disable prettier/prettier */
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { verifyEmail, sendVerificationEmail } from '@/services/auth.service';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'resend'>('loading');
  const [message, setMessage] = useState('');
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const userId = searchParams.get('userId');
    const secret = searchParams.get('secret');

    if (userId && secret) {
      // 验证邮箱
      verifyEmail(userId, secret)
        .then(() => {
          setStatus('success');
          setMessage('邮箱验证成功！您现在可以登录了。');
        })
        .catch((err) => {
          setStatus('error');
          setMessage(err.message || '验证失败，链接可能已过期');
        });
    } else {
      // 没有验证参数，显示重新发送选项
      setStatus('resend');
      setMessage('未找到验证参数');
    }
  }, [searchParams]);

  const handleResend = async () => {
    setIsResending(true);
    try {
      await sendVerificationEmail();
      setMessage('验证邮件已重新发送，请检查您的邮箱');
      setStatus('success');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : '发送失败，请稍后重试');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#102219] px-4 py-12 relative overflow-hidden">
      {/* 装饰背景 */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 right-20 w-72 h-72 bg-[#13ec80] rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-[#13ec80] rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-[#1a2c23] rounded-2xl border border-[#283930] p-8 shadow-2xl text-center">
          {status === 'loading' && (
            <>
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#13ec80]/10 mb-6">
                <span className="material-symbols-outlined text-[#13ec80] text-4xl animate-spin">
                  hourglass_bottom
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">验证中...</h1>
              <p className="text-[#9db9ab]">请稍候，正在验证您的邮箱</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#13ec80]/10 mb-6">
                <span className="material-symbols-outlined text-[#13ec80] text-4xl">
                  check_circle
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">验证成功！</h1>
              <p className="text-[#9db9ab] mb-6">{message}</p>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center gap-2 w-full py-3 bg-[#13ec80] text-[#102219] font-bold rounded-lg hover:bg-[#0fd673] transition-colors"
              >
                <span className="material-symbols-outlined">login</span>
                前往登录
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 mb-6">
                <span className="material-symbols-outlined text-red-400 text-4xl">
                  error
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">验证失败</h1>
              <p className="text-[#9db9ab] mb-6">{message}</p>
              <button
                onClick={handleResend}
                disabled={isResending}
                className="inline-flex items-center justify-center gap-2 w-full py-3 bg-[#283930] text-white font-medium rounded-lg hover:bg-[#344b3f] transition-colors disabled:opacity-50 mb-4"
              >
                {isResending ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">hourglass_bottom</span>
                    发送中...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">send</span>
                    重新发送验证邮件
                  </>
                )}
              </button>
              <Link
                href="/auth/login"
                className="text-[#13ec80] hover:text-[#0fd673] text-sm transition-colors"
              >
                返回登录
              </Link>
            </>
          )}

          {status === 'resend' && (
            <>
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-500/10 mb-6">
                <span className="material-symbols-outlined text-amber-400 text-4xl">
                  mail
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">验证您的邮箱</h1>
              <p className="text-[#9db9ab] mb-6">
                请点击下方按钮重新发送验证邮件
              </p>
              <button
                onClick={handleResend}
                disabled={isResending}
                className="inline-flex items-center justify-center gap-2 w-full py-3 bg-[#13ec80] text-[#102219] font-bold rounded-lg hover:bg-[#0fd673] transition-colors disabled:opacity-50 mb-4"
              >
                {isResending ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">hourglass_bottom</span>
                    发送中...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">send</span>
                    发送验证邮件
                  </>
                )}
              </button>
              <Link
                href="/auth/login"
                className="text-[#9db9ab] hover:text-white text-sm transition-colors"
              >
                返回登录
              </Link>
            </>
          )}
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

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#102219]">
        <div className="text-white">加载中...</div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
