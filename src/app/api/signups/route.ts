/* eslint-disable prettier/prettier */
import { NextRequest, NextResponse } from 'next/server';
import { signupService, CreateSignupInput } from '@/services/signup.service';
import { Client, Databases, Query } from 'appwrite';

/**
 * GET /api/signups - 获取所有报名
 * 查询参数: activityId=xxx (按活动ID过滤)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const activityId = searchParams.get('activityId');

    const signups = await signupService.getAllSignups(activityId || undefined);

    // 增强数据：从 formData 中提取 studentName，从 activities 表中获取 activityTitle
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);
    const databases = new Databases(client);

    const enrichedSignups = await Promise.all(
      signups.map(async (signup) => {
        let studentName = '';
        let activityTitle = '';

        // 从 formData 中提取 studentName
        if (signup.formData) {
          try {
            const formDataObj =
              typeof signup.formData === 'string'
                ? JSON.parse(signup.formData)
                : signup.formData;
            studentName = formDataObj.studentName || '';
          } catch (err) {
            console.warn('Failed to parse formData:', err);
          }
        }

        // 从 activities 表中获取 activityTitle
        if (signup.activityId) {
          try {
            const activity = await databases.getDocument(
              process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
              'activities',
              signup.activityId
            );
            activityTitle = (activity as Record<string, unknown>).title as string || '';
          } catch (err) {
            console.warn(`Failed to fetch activity ${signup.activityId}:`, err);
          }
        }

        return {
          ...signup,
          studentName,
          activityTitle,
        };
      })
    );

    return NextResponse.json({
      success: true,
      total: enrichedSignups.length,
      signups: enrichedSignups,
    });
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    console.error('获取报名列表失败:', err);
    return NextResponse.json(
      { error: err.message || '获取报名列表失败' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/signups - 创建新报名
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { activityId, activityTitle, studentName, studentEmail, studentId, year, className, formData } = body;

    // 验证必填字段
    if (!activityId || !studentEmail) {
      return NextResponse.json(
        { error: '缺少必填字段: activityId, studentEmail' },
        { status: 400 }
      );
    }

    // 检查是否已经报名过这个活动
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);
    const databases = new Databases(client);

    try {
      const existingSignups = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'signups',
        [
          Query.equal('activityId', activityId),
          Query.equal('email', studentEmail),
        ]
      );

      // 过滤掉已取消的报名
      const activeSignups = (existingSignups.documents as Record<string, unknown>[]).filter(
        (s) => (s.status as string) !== 'cancelled'
      );

      if (activeSignups.length > 0) {
        return NextResponse.json(
          { error: '你已经报名过这个活动了' },
          { status: 409 }
        );
      }
    } catch (err) {
      console.warn('检查重复报名时出错:', err);
      // 继续执行，不中断流程
    }

    const input: CreateSignupInput = {
      activityId,
      activityTitle,
      studentName,
      studentEmail,
      studentId,
      year,
      className,
      formData,
    };

    const signup = await signupService.createSignup(input);

    // 更新活动的报名计数
    try {
      const activity = await databases.getDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'activities',
        activityId
      );
      const currentCount = (activity as Record<string, unknown>).currentParticipants as number || 0;
      await databases.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'activities',
        activityId,
        {
          currentParticipants: currentCount + 1,
          updatedAt: new Date().toISOString(),
        }
      );
    } catch (err) {
      console.warn('Failed to update activity participant count:', err);
      // 不中断报名流程，但记录警告
    }

    return NextResponse.json({
      success: true,
      message: '报名成功',
      signup,
    });
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    console.error('创建报名失败:', err);
    return NextResponse.json(
      { error: err.message || '创建报名失败' },
      { status: 500 }
    );
  }
}
