import { NextResponse } from 'next/server';
import { serverDatabases, Query } from '@/services/appwrite-server';
import { requireAdminSession } from '@/lib/admin-session';
const APPWRITE_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
const CLUB_SETTINGS_COLLECTION_ID = 'clubSettings';
export async function GET(request: Request) {
  const authError = requireAdminSession(request);
  if (authError) return authError;

  try {
    const response = await serverDatabases.listDocuments(
      APPWRITE_DATABASE_ID,
      CLUB_SETTINGS_COLLECTION_ID,
      [Query.limit(10)]
    );
    const docs = response.documents;
    return NextResponse.json({
      success: true,
      diagnostic: {
        total: docs.length,
        documents: docs.map(doc => ({
          $id: doc.$id,
          attendanceSession1Start: doc.attendanceSession1Start,
          attendanceSession2Start: doc.attendanceSession2Start,
          attendanceDayOfWeek: doc.attendanceDayOfWeek,
        })),
      },
    });
  } catch (error) {
    console.error('诊断失败:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '诊断失败',
      },
      { status: 500 }
    );
  }
}