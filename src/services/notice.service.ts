/* eslint-disable prettier/prettier */
import { databases } from '@/services/appwrite';
import { ID, Query } from 'appwrite';

const APPWRITE_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
const NOTICES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_NOTICES_COLLECTION || '';

/**
 * 公告服务
 * 管理所有公告的数据库操作
 */

export interface Notice {
  $id: string;
  title: string;
  content: string;
  author: string;
  authorId: string;
  category: string;
  status: 'draft' | 'published';
  images?: string[];
  tags?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoticeInput {
  title: string;
  content: string;
  category: string;
  authorId: string;
  author: string;
  status?: 'draft' | 'published';
  images?: string[];
  tags?: string[];
}

export interface UpdateNoticeInput {
  title?: string;
  content?: string;
  category?: string;
  status?: 'draft' | 'published';
  images?: string[];
  tags?: string[];
  publishedAt?: string;
}

/**
 * 获取所有公告（可选过滤已发布）
 */
export async function getAllNotices(onlyPublished = false): Promise<Notice[]> {
  try {
    const queries = onlyPublished ? [Query.equal('status', 'published')] : [];
    const response = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      NOTICES_COLLECTION_ID,
      queries
    );
    return response.documents.map(parseNotice) as unknown as Notice[];
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    console.error('获取公告列表失败:', err);
    throw new Error(err.message || '获取公告列表失败');
  }
}

/**
 * 按 ID 获取单个公告
 */
export async function getNoticeById(id: string): Promise<Notice> {
  try {
    const notice = await databases.getDocument(
      APPWRITE_DATABASE_ID,
      NOTICES_COLLECTION_ID,
      id
    );
    return parseNotice(notice) as unknown as Notice;
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    console.error('获取公告失败:', err);
    throw new Error(err.message || '获取公告失败');
  }
}

/**
 * 解析公告数据，将 JSON 字符串转换为数组
 */
function parseNotice(doc: Record<string, unknown>): Notice {
  return {
    ...doc,
    images: doc.images ? (typeof doc.images === 'string' ? JSON.parse(doc.images as string) : doc.images) : [],
    tags: doc.tags ? (typeof doc.tags === 'string' ? JSON.parse(doc.tags as string) : doc.tags) : [],
  } as Notice;
}

/**
 * 创建新公告
 */
export async function createNotice(input: CreateNoticeInput): Promise<Notice> {
  try {
    const now = new Date().toISOString();
    const notice = await databases.createDocument(
      APPWRITE_DATABASE_ID,
      NOTICES_COLLECTION_ID,
      ID.unique(),
      {
        title: input.title,
        content: input.content,
        category: input.category,
        author: input.author,
        authorId: input.authorId,
        status: input.status || 'draft',
        images: input.images ? JSON.stringify(input.images) : '[]',
        tags: input.tags ? JSON.stringify(input.tags) : '[]',
        publishedAt: input.status === 'published' ? now : null,
        createdAt: now,
        updatedAt: now,
      }
    );
    return parseNotice(notice) as unknown as Notice;
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    console.error('创建公告失败:', err);
    throw new Error(err.message || '创建公告失败');
  }
}

/**
 * 更新公告
 */
export async function updateNotice(
  id: string,
  input: UpdateNoticeInput
): Promise<Notice> {
  try {
    const now = new Date().toISOString();
    const updateData: Record<string, unknown> = {
      updatedAt: now,
    };

    if (input.title) updateData.title = input.title;
    if (input.content) updateData.content = input.content;
    if (input.category) updateData.category = input.category;
    if (input.status) {
      updateData.status = input.status;
      if (input.status === 'published') {
        updateData.publishedAt = now;
      }
    }
    if (input.images !== undefined) updateData.images = input.images ? JSON.stringify(input.images) : '[]';
    if (input.tags) updateData.tags = JSON.stringify(input.tags);

    const notice = await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      NOTICES_COLLECTION_ID,
      id,
      updateData
    );
    return parseNotice(notice) as unknown as Notice;
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    console.error('更新公告失败:', err);
    throw new Error(err.message || '更新公告失败');
  }
}

/**
 * 删除公告
 */
export async function deleteNotice(id: string): Promise<void> {
  try {
    await databases.deleteDocument(
      APPWRITE_DATABASE_ID,
      NOTICES_COLLECTION_ID,
      id
    );
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    console.error('删除公告失败:', err);
    throw new Error(err.message || '删除公告失败');
  }
}

/**
 * 按分类获取公告
 */
export async function getNoticesByCategory(category: string): Promise<Notice[]> {
  try {
    const response = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      NOTICES_COLLECTION_ID,
      [Query.equal('category', category)]
    );
    return response.documents.map(parseNotice) as unknown as Notice[];
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    console.error('按分类获取公告失败:', err);
    throw new Error(err.message || '获取公告失败');
  }
}

/**
 * 搜索公告（按标题和内容）
 */
export async function searchNotices(query: string): Promise<Notice[]> {
  try {
    const response = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      NOTICES_COLLECTION_ID,
      [Query.search('title', query)]
    );
    return response.documents.map(parseNotice) as unknown as Notice[];
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    console.error('搜索公告失败:', err);
    throw new Error(err.message || '搜索公告失败');
  }
}
