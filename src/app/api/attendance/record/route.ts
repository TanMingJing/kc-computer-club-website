/* eslint-disable prettier/prettier */
import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases } from '@/services/appwrite-server';

const APPWRITE_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
const ATTENDANCE_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_ATTENDANCE_COLLECTION || 'attendance';

/**
 * PATCH /api/attendance/record
 * Admin 修改学生的点名状态
 * 
 * Body: {
 *   recordId: string,           // 点名记录ID
 *   status: 'present' | 'absent' | 'late',  // 新状态
 *   notes?: string              // 备注
 * }
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { recordId, status, notes } = body;

    if (!recordId || !status) {
      return NextResponse.json(
        { error: '缺少必要参数：recordId, status' },
        { status: 400 }
      );
    }

    if (!['present', 'absent', 'late'].includes(status)) {
      return NextResponse.json(
        { error: '状态必须是 present（出席）, absent（缺席）或 late（迟到）' },
        { status: 400 }
      );
    }

    // 更新记录
    const updateData: Record<string, unknown> = {
      status,
    };

    if (notes) {
      updateData.notes = notes;
    }

    const updatedRecord = await serverDatabases.updateDocument(
      APPWRITE_DATABASE_ID,
      ATTENDANCE_COLLECTION_ID,
      recordId,
      updateData
    );

    console.log(`[UPDATE-STATUS] 记录 ${recordId} 状态已更改为 ${status}`);

    return NextResponse.json({
      success: true,
      message: `点名状态已更新为${
        status === 'present' ? '出席' : status === 'late' ? '迟到' : '缺席'
      }`,
      record: {
        id: updatedRecord.$id,
        studentName: updatedRecord.studentName,
        status: updatedRecord.status,
        notes: updatedRecord.notes,
        sessionTime: updatedRecord.sessionTime,
      },
    });
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    console.error('[UPDATE-STATUS] 错误:', err);
    return NextResponse.json(
      { error: err.message || '更新状态失败' },
      { status: 500 }
    );
  }
}
