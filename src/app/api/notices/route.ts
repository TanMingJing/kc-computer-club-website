/* eslint-disable prettier/prettier */
import { NextRequest, NextResponse } from 'next/server';
import {
  getAllNotices,
  createNotice,
  CreateNoticeInput,
} from '@/services/notice.service';

/**
 * GET /api/notices - 获取所有公告
 * 查询参数: onlyPublished=true (仅获取已发布)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const onlyPublished = searchParams.get('onlyPublished') === 'true';

    const notices = await getAllNotices(onlyPublished);

    return NextResponse.json({
      success: true,
      total: notices.length,
      notices,
    });
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    console.error('获取公告列表失败:', err);
    return NextResponse.json(
      { error: err.message || '获取公告列表失败' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notices - 创建新公告
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, category, authorId, author, status, images, tags } = body;

    // 验证必填字段
    if (!title || !content || !category || !authorId || !author) {
      return NextResponse.json(
        { error: '缺少必填字段：title, content, category, authorId, author' },
        { status: 400 }
      );
    }

    const input: CreateNoticeInput = {
      title,
      content,
      category,
      authorId,
      author,
      status: status || 'draft',
      images,
      tags,
    };

    const notice = await createNotice(input);

    return NextResponse.json({
      success: true,
      message: '公告创建成功',
      notice,
    });
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    console.error('创建公告失败:', err);
    return NextResponse.json(
      { error: err.message || '创建公告失败' },
      { status: 500 }
    );
  }
}
