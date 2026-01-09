/* eslint-disable prettier/prettier */
import { Client, Databases, Query } from 'appwrite';

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

const databases = new Databases(client);

// Type definitions
export interface Notice {
  $id: string;
  title: string;
  content: string;
  category: 'announcement' | 'course' | 'meeting' | 'other';
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
  author?: string;
}

export interface CreateNoticeInput {
  title: string;
  content: string;
  category: string;
  status: 'draft' | 'published';
  author?: string;
}

export interface UpdateNoticeInput {
  title?: string;
  content?: string;
  category?: string;
  status?: 'draft' | 'published';
}

// Notice Service
export const noticeService = {
  // Get all notices (optionally filtered by status)
  async getAllNotices(onlyPublished: boolean = false): Promise<Notice[]> {
    try {
      const queries = onlyPublished ? [Query.equal('status', 'published')] : [];
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'notices',
        queries
      );
      return (response.documents as unknown as Notice[]) || [];
    } catch (error) {
      console.error('Failed to fetch notices:', error);
      throw error;
    }
  },

  // Get a single notice by ID
  async getNoticeById(id: string): Promise<Notice> {
    try {
      const response = await databases.getDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'notices',
        id
      );
      return response as unknown as Notice;
    } catch (error) {
      console.error(`Failed to fetch notice ${id}:`, error);
      throw error;
    }
  },

  // Create a new notice
  async createNotice(input: CreateNoticeInput): Promise<Notice> {
    try {
      const response = await databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'notices',
        'unique()',
        {
          title: input.title,
          content: input.content,
          category: input.category,
          status: input.status,
          author: input.author || 'System',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );
      return response as unknown as Notice;
    } catch (error) {
      console.error('Failed to create notice:', error);
      throw error;
    }
  },

  // Update an existing notice
  async updateNotice(id: string, input: UpdateNoticeInput): Promise<Notice> {
    try {
      const response = await databases.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'notices',
        id,
        {
          ...input,
          updatedAt: new Date().toISOString(),
        }
      );
      return response as unknown as Notice;
    } catch (error) {
      console.error(`Failed to update notice ${id}:`, error);
      throw error;
    }
  },

  // Delete a notice
  async deleteNotice(id: string): Promise<void> {
    try {
      await databases.deleteDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'notices',
        id
      );
    } catch (error) {
      console.error(`Failed to delete notice ${id}:`, error);
      throw error;
    }
  },

  // Search notices by title or content
  async searchNotices(query: string): Promise<Notice[]> {
    try {
      const allNotices = await this.getAllNotices();
      return allNotices.filter(
        (notice) =>
          notice.title.toLowerCase().includes(query.toLowerCase()) ||
          notice.content.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      console.error('Failed to search notices:', error);
      throw error;
    }
  },

  // Get notices by category
  async getNoticesByCategory(category: string): Promise<Notice[]> {
    try {
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'notices',
        [Query.equal('category', category), Query.equal('status', 'published')]
      );
      return (response.documents as unknown as Notice[]) || [];
    } catch (error) {
      console.error(`Failed to fetch notices for category ${category}:`, error);
      throw error;
    }
  },
};
