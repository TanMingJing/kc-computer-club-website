/* eslint-disable prettier/prettier */
import { NextRequest, NextResponse } from 'next/server';
import { Client, Databases, Query } from 'node-appwrite';

/**
 * GET /api/attendance/records
 * 获取点名记录（支持按时段和周过滤）
 * 
 * Query params:
 *   - sessionTime: '15:20' | '16:35' (可选)
 *   - weekNumber: number (可选，默认当前周)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionTime = searchParams.get('sessionTime') as '15:20' | '16:35' | null;
    const weekNumber = searchParams.get('weekNumber')
      ? parseInt(searchParams.get('weekNumber') as string)
      : getCurrentWeekNumber();

    if (sessionTime && sessionTime !== '15:20' && sessionTime !== '16:35') {
      return NextResponse.json(
        { error: '时段参数必须为 "15:20" 或 "16:35"' },
        { status: 400 }
      );
    }

    // 使用服务器端 Appwrite 客户端（带 API 密钥）
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
    const apiKey = process.env.APPWRITE_API_KEY;

    if (!endpoint || !projectId || !databaseId || !apiKey) {
      return NextResponse.json(
        { error: '服务器配置不完整' },
        { status: 500 }
      );
    }

    const client = new Client()
      .setEndpoint(endpoint)
      .setProject(projectId)
      .setKey(apiKey);

    const databases = new Databases(client);
    const ATTENDANCE_COLLECTION_ID = 'attendance';

    if (sessionTime) {
      // 获取特定时段的记录
      const queries = [Query.equal('sessionTime', sessionTime)];
      if (weekNumber !== undefined) {
        queries.push(Query.equal('weekNumber', weekNumber));
      }

      const response = await databases.listDocuments(
        databaseId,
        ATTENDANCE_COLLECTION_ID,
        queries as unknown as string[]
      );

      const records = response.documents.sort(
        (a: Record<string, unknown>, b: Record<string, unknown>) => 
          new Date(String(b.checkInTime)).getTime() - new Date(String(a.checkInTime)).getTime()
      );

      return NextResponse.json({
        success: true,
        weekNumber,
        sessionTime,
        totalRecords: records.length,
        records,
      });
    } else {
      // 获取整周统计
      const queries = [Query.equal('weekNumber', weekNumber)];
      const response = await databases.listDocuments(
        databaseId,
        ATTENDANCE_COLLECTION_ID,
        queries as unknown as string[]
      );

      const records = response.documents;
      
      // 分组统计（使用实际的 sessionTime 格式：'15:20' 和 '16:35'）
      const session1 = records.filter((r: Record<string, unknown>) => r.sessionTime === '15:20');
      const session2 = records.filter((r: Record<string, unknown>) => r.sessionTime === '16:35');

      const summary = {
        weekNumber,
        session1: {
          total: session1.length,
          students: session1.sort(
            (a: Record<string, unknown>, b: Record<string, unknown>) => 
              new Date(String(b.checkInTime)).getTime() - new Date(String(a.checkInTime)).getTime()
          ),
        },
        session2: {
          total: session2.length,
          students: session2.sort(
            (a: Record<string, unknown>, b: Record<string, unknown>) => 
              new Date(String(b.checkInTime)).getTime() - new Date(String(a.checkInTime)).getTime()
          ),
        },
      };

      return NextResponse.json({
        success: true,
        summary,
      });
    }
  } catch (error: unknown) {
    const err = error as Error & { message?: string; code?: number };
    console.error('获取点名记录错误:', err);
    return NextResponse.json(
      { error: err.message || '获取点名记录失败', code: err.code || 500 },
      { status: 500 }
    );
  }
}

/**
 * 获取当前周数（学年内第几周）
 * 假设学年从9月1日开始
 */
function getCurrentWeekNumber(): number {
  const now = new Date();
  const year = now.getFullYear();
  
  let schoolYearStart: Date;
  if (now.getMonth() >= 8) {
    schoolYearStart = new Date(year, 8, 1);
  } else {
    schoolYearStart = new Date(year - 1, 8, 1);
  }

  const timeDiff = now.getTime() - schoolYearStart.getTime();
  const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  return Math.floor(daysDiff / 7) + 1;
}
