/* eslint-disable prettier/prettier */
import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases, Query } from '@/services/appwrite-server';

const APPWRITE_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
const ATTENDANCE_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_ATTENDANCE_COLLECTION || 'attendance';
const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION || 'users';

/**
 * POST /api/attendance/mark-absent
 * 自动标记缺席的学生（在规定时间过后）
 * 
 * 触发条件：
 * 1. 第一时段 (15:20-15:25) 过了 → 标记所有未点名的学生为缺席（time > 15:25）
 * 2. 第二时段 (16:35-16:40) 过了 → 标记所有未点名的学生为缺席（time > 16:40）
 * 
 * Body: {
 *   sessionTime: '15:20' | '16:35',
 *   weekNumber: number
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionTime, weekNumber } = body;

    if (!sessionTime || !weekNumber) {
      return NextResponse.json(
        { error: '缺少必要参数：sessionTime, weekNumber' },
        { status: 400 }
      );
    }

    if (!['15:20', '16:35'].includes(sessionTime)) {
      return NextResponse.json(
        { error: 'sessionTime 必须是 15:20 或 16:35' },
        { status: 400 }
      );
    }

    // 获取所有用户（作为学生列表）
    const allUsers = await serverDatabases.listDocuments(
      APPWRITE_DATABASE_ID,
      USERS_COLLECTION_ID,
      [Query.equal('role', 'student')] // 只获取学生
    );

    const studentList = allUsers.documents.map((doc) => ({
      $id: doc.$id,
      studentId: doc.$id,
      studentName: doc.name,
      studentEmail: doc.email,
    }));

    console.log(`[MARK-ABSENT] 获取学生列表: ${studentList.length} 名学生`);

    // 获取已经点过名的学生
    const attendedStudents = await serverDatabases.listDocuments(
      APPWRITE_DATABASE_ID,
      ATTENDANCE_COLLECTION_ID,
      [
        Query.equal('sessionTime', sessionTime),
        Query.equal('weekNumber', weekNumber),
        Query.equal('status', 'present'), // 只查找已点名的学生
      ]
    );

    const attendedIds = new Set(attendedStudents.documents.map((doc) => doc.studentId));

    console.log(`[MARK-ABSENT] 周${weekNumber}时段${sessionTime}已点名学生: ${attendedIds.size} 名`);

    // 找出未点名的学生
    const absentStudents = studentList.filter((student) => !attendedIds.has(student.studentId));

    console.log(`[MARK-ABSENT] 未点名学生: ${absentStudents.length} 名`, {
      names: absentStudents.map((s) => s.studentName),
    });

    // 为未点名的学生创建缺席记录
    const createdRecords = [];
    const now = new Date().toISOString();

    for (const student of absentStudents) {
      try {
        const record = await serverDatabases.createDocument(
          APPWRITE_DATABASE_ID,
          ATTENDANCE_COLLECTION_ID,
          `absent_${student.studentId}_${sessionTime}_week${weekNumber}`,
          {
            studentId: student.studentId,
            studentName: student.studentName,
            studentEmail: student.studentEmail,
            checkInTime: now,
            sessionTime,
            weekNumber,
            status: 'absent', // 缺席
            notes: '系统自动标记（超过规定时间未点名）',
            createdAt: now,
          }
        );
        createdRecords.push(record);
      } catch (err) {
        console.warn(`[MARK-ABSENT] 创建缺席记录失败 ${student.studentName}:`, err);
        // 继续处理其他学生，不中断流程
      }
    }

    return NextResponse.json({
      success: true,
      message: `自动标记完成：${createdRecords.length} 名学生被标记为缺席`,
      summary: {
        sessionTime,
        weekNumber,
        totalStudents: studentList.length,
        attendedCount: attendedIds.size,
        absentCount: absentStudents.length,
        createdRecordsCount: createdRecords.length,
      },
    });
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    console.error('[MARK-ABSENT] 错误:', err);
    return NextResponse.json(
      { error: err.message || '标记缺席失败' },
      { status: 500 }
    );
  }
}
