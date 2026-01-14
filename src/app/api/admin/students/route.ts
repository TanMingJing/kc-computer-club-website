/* eslint-disable prettier/prettier */
import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases, ID, Query } from '@/services/appwrite-server';
import bcrypt from 'bcryptjs';

/**
 * 学生管理 API（使用服务端 Appwrite 客户端）
 */

const APPWRITE_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION || '';
const ATTENDANCE_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_ATTENDANCE_COLLECTION || '';
const PROJECTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECTS_COLLECTION || '';

const DEFAULT_STUDENT_PASSWORD = '11111111';

/**
 * GET /api/admin/students
 * 获取所有学生列表（含活动、出勤、项目信息）
 */
export async function GET() {
  try {
    const response = await serverDatabases.listDocuments(
      APPWRITE_DATABASE_ID,
      USERS_COLLECTION_ID,
      [Query.equal('role', 'student'), Query.limit(500)]
    );

    const students = [];

    for (const doc of response.documents) {
      // 获取出勤统计
      let attendanceStats = { total: 0, present: 0, late: 0, absent: 0 };
      try {
        // 尝试多种可能的 studentId 格式
        const possibleStudentIds: string[] = [];
        const extractedId = extractStudentIdFromEmail(doc.email);
        if (extractedId) possibleStudentIds.push(extractedId);
        if (doc.studentId && !possibleStudentIds.includes(doc.studentId)) {
          possibleStudentIds.push(doc.studentId);
        }
        if (doc.$id && !possibleStudentIds.includes(doc.$id)) {
          possibleStudentIds.push(doc.$id);
        }

        for (const studentIdToFind of possibleStudentIds) {
          try {
            const attendanceResponse = await serverDatabases.listDocuments(
              APPWRITE_DATABASE_ID,
              ATTENDANCE_COLLECTION_ID,
              [Query.equal('studentId', studentIdToFind), Query.limit(200)]
            );

            if (attendanceResponse.documents.length > 0) {
              const docs = attendanceResponse.documents as Array<{ status?: string }>;
              attendanceStats.total += docs.length;
              attendanceStats.present += docs.filter(a => a.status === 'present').length;
              attendanceStats.late += docs.filter(a => a.status === 'late').length;
              attendanceStats.absent += docs.filter(a => a.status === 'absent').length;
            }
          } catch {
            // 忽略单个查询错误
          }
        }
      } catch {
        // 忽略出勤统计错误
      }

      // 获取项目信息
      let projects: Array<{ projectId: string; title: string; teamName: string; role: string; status: string }> = [];
      try {
        const projectResponse = await serverDatabases.listDocuments(
          APPWRITE_DATABASE_ID,
          PROJECTS_COLLECTION_ID,
          [Query.limit(100)]
        );
        const studentEmail = doc.email.toLowerCase().trim();

        for (const project of projectResponse.documents) {
          const leaderEmail = (project.leaderEmail || '').toLowerCase().trim();

          if (leaderEmail === studentEmail) {
            projects.push({
              projectId: project.$id,
              title: project.title,
              teamName: project.teamName,
              role: '组长',
              status: project.status,
            });
          } else if (project.members) {
            try {
              const members = typeof project.members === 'string' ? JSON.parse(project.members) : project.members;
              const member = members.find((m: { email?: string }) =>
                m.email && m.email.toLowerCase().trim() === studentEmail
              );
              if (member) {
                projects.push({
                  projectId: project.$id,
                  title: project.title,
                  teamName: project.teamName,
                  role: member.role || '成员',
                  status: project.status,
                });
              }
            } catch {
              // 忽略解析错误
            }
          }
        }
      } catch {
        // 忽略项目统计错误
      }

      students.push({
        $id: doc.$id,
        studentId: doc.studentId || extractStudentIdFromEmail(doc.email),
        chineseName: doc.chineseName || doc.name || '',
        englishName: doc.englishName || '',
        email: doc.email,
        classNameCn: doc.classNameCn || doc.className || '',
        classNameEn: doc.classNameEn || '',
        classCode: doc.classCode || '',
        groupLevel: doc.groupLevel || '',
        level: doc.level || '',
        phone: doc.phone || '',
        instagram: doc.instagram || '',
        group: doc.group || '',
        position: doc.position || '',
        notes: doc.notes || '',
        role: doc.role,
        createdAt: doc.createdAt || doc.$createdAt,
        attendanceStats,
        projects,
      });
    }

    return NextResponse.json({ success: true, students });
  } catch (error) {
    const err = error as Error;
    console.error('获取学生列表失败:', err);
    return NextResponse.json(
      { success: false, error: err.message || '获取学生列表失败' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/students
 * 批量导入学生
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { students, defaultPassword } = body;

    if (!students || !Array.isArray(students) || students.length === 0) {
      return NextResponse.json(
        { success: false, error: '请提供学生数据' },
        { status: 400 }
      );
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as Array<{ studentId: string; error: string }>,
    };

    for (const student of students) {
      try {
        // 验证数据
        if (!student.studentId || student.studentId.trim().length < 3) {
          results.failed++;
          results.errors.push({ studentId: student.studentId || 'unknown', error: '学号必填且至少3位' });
          continue;
        }
        if (!student.chineseName || student.chineseName.trim().length < 2) {
          results.failed++;
          results.errors.push({ studentId: student.studentId, error: '中文姓名至少需要2个字符' });
          continue;
        }

        // 生成邮箱
        const email = `${student.studentId}@kuencheng.edu.my`.toLowerCase().trim();

        // 检查邮箱是否已存在
        const existing = await serverDatabases.listDocuments(
          APPWRITE_DATABASE_ID,
          USERS_COLLECTION_ID,
          [Query.equal('email', email)]
        );

        if (existing.documents.length > 0) {
          results.failed++;
          results.errors.push({ studentId: student.studentId, error: '该学号已注册' });
          continue;
        }

        // 创建用户记录
        const now = new Date().toISOString();
        const password = student.password || defaultPassword || DEFAULT_STUDENT_PASSWORD;
        const passwordHash = await bcrypt.hash(password, 10);
        const requirePasswordChange = (password === DEFAULT_STUDENT_PASSWORD);

        await serverDatabases.createDocument(
          APPWRITE_DATABASE_ID,
          USERS_COLLECTION_ID,
          ID.unique(),
          {
            email: email,
            name: student.chineseName.trim(),
            studentId: student.studentId.trim(),
            chineseName: student.chineseName.trim(),
            englishName: (student.englishName || '').trim(),
            classNameCn: (student.classNameCn || '').trim(),
            classNameEn: (student.classNameEn || '').trim(),
            classCode: (student.classCode || '').trim(),
            groupLevel: (student.groupLevel || '').trim(),
            level: (student.level || '').trim(),
            phone: (student.phone || '').trim(),
            instagram: (student.instagram || '').trim(),
            group: (student.group || '').trim(),
            position: (student.position || '').trim(),
            notes: (student.notes || '').trim(),
            role: 'student',
            passwordHash: passwordHash,
            requirePasswordChange: requirePasswordChange,
            emailVerified: true,
            createdAt: now,
            updatedAt: now,
          }
        );

        results.success++;
      } catch (error) {
        results.failed++;
        const err = error as Error;
        results.errors.push({ studentId: student.studentId || 'unknown', error: err.message || '未知错误' });
      }
    }

    return NextResponse.json({
      success: true,
      message: `成功导入 ${results.success} 名学生，失败 ${results.failed} 名`,
      imported: results.success,
      failed: results.failed,
      errors: results.errors,
    });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, error: err.message || '批量导入失败' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/students
 * 删除所有学生用户
 */
export async function DELETE() {
  try {
    const response = await serverDatabases.listDocuments(
      APPWRITE_DATABASE_ID,
      USERS_COLLECTION_ID,
      [Query.equal('role', 'student'), Query.limit(500)]
    );

    let deleted = 0;
    let failed = 0;

    for (const doc of response.documents) {
      try {
        await serverDatabases.deleteDocument(
          APPWRITE_DATABASE_ID,
          USERS_COLLECTION_ID,
          doc.$id
        );
        deleted++;
      } catch {
        failed++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `已删除 ${deleted} 名学生，失败 ${failed} 名`,
      deleted,
      failed,
    });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, error: err.message || '删除失败' },
      { status: 500 }
    );
  }
}

// 从邮箱提取学号
function extractStudentIdFromEmail(email: string): string {
  const match = email.match(/^(\d+)@/);
  return match ? match[1] : '';
}
