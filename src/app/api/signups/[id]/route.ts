/* eslint-disable prettier/prettier */
import { NextRequest, NextResponse } from 'next/server';
import { signupService } from '@/services/signup.service';
import { Client, Databases } from 'appwrite';

/**
 * GET /api/signups/[id] - 获取单个报名
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const signup = await signupService.getSignupById(id);

    return NextResponse.json({
      success: true,
      signup,
    });
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    console.error('获取报名失败:', err);
    return NextResponse.json(
      { error: err.message || '获取报名失败' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/signups/[id] - 更新报名
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // 获取原始报名信息
    const originalSignup = await signupService.getSignupById(id);
    const wasActive = originalSignup.status !== 'cancelled';
    
    const signup = await signupService.updateSignup(id, body);
    
    // 如果状态改为 'cancelled'，减少活动计数
    if (signup.activityId && body.status === 'cancelled' && wasActive) {
      try {
        const client = new Client()
          .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
          .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);
        const databases = new Databases(client);

        const activity = await databases.getDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          'activities',
          signup.activityId
        );
        const currentCount = (activity as Record<string, unknown>).currentParticipants as number || 0;
        await databases.updateDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          'activities',
          signup.activityId,
          {
            currentParticipants: Math.max(0, currentCount - 1),
            updatedAt: new Date().toISOString(),
          }
        );
      } catch (err) {
        console.warn('Failed to update activity participant count:', err);
      }
    }
    // 如果从 cancelled 改为其他状态，增加活动计数
    else if (signup.activityId && originalSignup.status === 'cancelled' && body.status !== 'cancelled') {
      try {
        const client = new Client()
          .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
          .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);
        const databases = new Databases(client);

        const activity = await databases.getDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          'activities',
          signup.activityId
        );
        const currentCount = (activity as Record<string, unknown>).currentParticipants as number || 0;
        await databases.updateDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          'activities',
          signup.activityId,
          {
            currentParticipants: currentCount + 1,
            updatedAt: new Date().toISOString(),
          }
        );
      } catch (err) {
        console.warn('Failed to update activity participant count:', err);
      }
    }

    return NextResponse.json({
      success: true,
      message: '报名更新成功',
      signup,
    });
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    console.error('更新报名失败:', err);
    return NextResponse.json(
      { error: err.message || '更新报名失败' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/signups/[id] - 删除报名
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // 获取报名信息以便更新活动计数
    const signup = await signupService.getSignupById(id);
    
    await signupService.deleteSignup(id);

    // 减少活动的报名计数
    if (signup.activityId) {
      try {
        const client = new Client()
          .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
          .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);
        const databases = new Databases(client);

        const activity = await databases.getDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          'activities',
          signup.activityId
        );
        const currentCount = (activity as Record<string, unknown>).currentParticipants as number || 0;
        await databases.updateDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          'activities',
          signup.activityId,
          {
            currentParticipants: Math.max(0, currentCount - 1),
            updatedAt: new Date().toISOString(),
          }
        );
      } catch (err) {
        console.warn('Failed to update activity participant count:', err);
        // 不中断删除流程
      }
    }

    return NextResponse.json({
      success: true,
      message: '报名删除成功',
    });
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    console.error('删除报名失败:', err);
    return NextResponse.json(
      { error: err.message || '删除报名失败' },
      { status: 500 }
    );
  }
}
