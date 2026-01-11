/* eslint-disable prettier/prettier */
import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases, ID, Query } from '@/services/appwrite-server';
import {
  getCurrentAttendanceSession,
  getCurrentWeekNumber,
  isDebugMode,
  setDebugMode,
  getAttendanceConfig,
  setAttendanceConfig,
} from '@/services/attendance.service';

const APPWRITE_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
const ATTENDANCE_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_ATTENDANCE_COLLECTION || 'attendance';

/**
 * GET /api/attendance/status
 * 获取当前点名状态（是否在点名时间，还剩多少时间）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    // 获取调试模式状态
    if (action === 'debug-status') {
      return NextResponse.json({
        debugMode: isDebugMode(),
        config: getAttendanceConfig(),
      });
    }

    const session = getCurrentAttendanceSession();
    const weekNumber = getCurrentWeekNumber();
    const config = getAttendanceConfig();
    const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

    if (!session) {
      return NextResponse.json({
        isAttendanceOpen: false,
        session: null,
        message: `当前不在点名时间。点名时间为每${dayNames[config.dayOfWeek]} ${config.session1Start.hour}:${String(config.session1Start.minute).padStart(2, '0')}-${config.session1Start.hour}:${String(config.session1Start.minute + config.session1Duration).padStart(2, '0')} 或 ${config.session2Start.hour}:${String(config.session2Start.minute).padStart(2, '0')}-${config.session2Start.hour}:${String(config.session2Start.minute + config.session2Duration).padStart(2, '0')}`,
        weekNumber,
        debugMode: isDebugMode(),
        config,
      });
    }

    return NextResponse.json({
      isAttendanceOpen: true,
      session: {
        sessionTime: session.sessionTime,
        minutesRemaining: session.minutesRemaining,
      },
      weekNumber,
      debugMode: isDebugMode(),
      config,
    });
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    return NextResponse.json(
      { error: err.message || '获取点名状态失败' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/attendance/check-in
 * 学生点名
 * 
 * Body: {
 *   studentId: string,
 *   studentName: string,
 *   studentEmail: string
 * }
 * 
 * 或者设置调试模式:
 * Body: {
 *   action: 'toggle-debug',
 *   enabled: boolean
 * }
 * 
 * 或者更新配置:
 * Body: {
 *   action: 'update-config',
 *   config: AttendanceConfig
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 切换调试模式
    if (body.action === 'toggle-debug') {
      setDebugMode(body.enabled);
      return NextResponse.json({
        success: true,
        debugMode: isDebugMode(),
        message: body.enabled ? '调试模式已开启' : '调试模式已关闭',
      });
    }

    // 更新点名配置
    if (body.action === 'update-config') {
      setAttendanceConfig(body.config);
      return NextResponse.json({
        success: true,
        config: getAttendanceConfig(),
        message: '点名配置已更新',
      });
    }

    // 正常点名流程
    const { studentId, studentName, studentEmail } = body;

    if (!studentId || !studentName || !studentEmail) {
      return NextResponse.json(
        { error: '学生ID、姓名和邮箱必填' },
        { status: 400 }
      );
    }

    // 检查点名时间
    const session = getCurrentAttendanceSession();
    const debugMode = isDebugMode();
    
    if (!session && !debugMode) {
      const config = getAttendanceConfig();
      const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      return NextResponse.json(
        { error: `当前不在点名时间。点名时间为每${dayNames[config.dayOfWeek]} ${config.session1Start.hour}:${String(config.session1Start.minute).padStart(2, '0')}-${config.session1Start.hour}:${String(config.session1Start.minute + config.session1Duration).padStart(2, '0')} 或 ${config.session2Start.hour}:${String(config.session2Start.minute).padStart(2, '0')}-${config.session2Start.hour}:${String(config.session2Start.minute + config.session2Duration).padStart(2, '0')}` },
        { status: 400 }
      );
    }

    // 确定当前时段
    const sessionTime = session ? session.sessionTime : (debugMode ? '15:20' : '15:20');

    // 检查今天同一时段是否已经点过名（使用服务器端 SDK）
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    try {
      const existingRecords = await serverDatabases.listDocuments(
        APPWRITE_DATABASE_ID,
        ATTENDANCE_COLLECTION_ID,
        [
          Query.equal('studentId', studentId),
          Query.equal('sessionTime', sessionTime),
          Query.greaterThanEqual('checkInTime', today.toISOString()),
          Query.lessThan('checkInTime', tomorrow.toISOString()),
        ]
      );

      if (existingRecords.documents.length > 0) {
        return NextResponse.json(
          { error: `您已在 ${sessionTime} 完成点名` },
          { status: 400 }
        );
      }
    } catch (queryError) {
      console.error('检查重复点名失败:', queryError);
      // 如果查询失败，继续执行（不阻止点名）
    }

    // 使用服务器端 SDK 创建点名记录
    const weekNumber = getCurrentWeekNumber();
    const now = new Date().toISOString();

    console.log('[DEBUG POST] 保存点名记录:', {
      studentId,
      studentName,
      sessionTime,
      weekNumber,
      checkInTime: now,
    });

    const record = await serverDatabases.createDocument(
      APPWRITE_DATABASE_ID,
      ATTENDANCE_COLLECTION_ID,
      ID.unique(),
      {
        studentId,
        studentName,
        studentEmail,
        checkInTime: now,
        sessionTime: sessionTime,
        weekNumber,
        status: 'present',
        notes: debugMode ? '[DEBUG] 调试模式点名' : '',
        createdAt: now,
      }
    );

    console.log('[DEBUG POST] 记录保存成功:', {
      id: record.$id,
      weekNumber: record.weekNumber,
    });

    return NextResponse.json({
      success: true,
      message: '点名成功！',
      record: {
        id: record.$id,
        studentName: record.studentName,
        sessionTime: record.sessionTime,
        checkInTime: record.checkInTime,
        status: record.status,
        weekNumber: record.weekNumber,
      },
    });
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    return NextResponse.json(
      { error: err.message || '点名失败，请稍后重试' },
      { status: 400 }
    );
  }
}
