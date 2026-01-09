/* eslint-disable prettier/prettier */
import { Client, Databases, Query } from 'appwrite';

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

const databases = new Databases(client);

// Type definitions
export interface Signup {
  $id: string;
  activityId: string;
  activityTitle?: string;
  studentName: string;
  studentEmail: string;
  studentId?: string;
  major?: string;
  year?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  signupDate: string;
  formData?: Record<string, string>;
}

export interface CreateSignupInput {
  activityId: string;
  activityTitle?: string;
  studentName: string;
  studentEmail: string;
  studentId?: string;
  major?: string;
  year?: string;
  status?: 'pending' | 'confirmed';
  formData?: Record<string, string>;
}

export interface UpdateSignupInput {
  studentName?: string;
  studentEmail?: string;
  studentId?: string;
  major?: string;
  year?: string;
  status?: 'pending' | 'confirmed' | 'cancelled';
  formData?: Record<string, string>;
}

// Signup Service
export const signupService = {
  // Get all signups (optionally filtered by activity)
  async getAllSignups(activityId?: string): Promise<Signup[]> {
    try {
      const queries = activityId ? [Query.equal('activityId', activityId)] : [];
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'signups',
        queries
      );
      return (response.documents as unknown as Signup[]) || [];
    } catch (error) {
      console.error('Failed to fetch signups:', error);
      throw error;
    }
  },

  // Get a single signup by ID
  async getSignupById(id: string): Promise<Signup> {
    try {
      const response = await databases.getDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'signups',
        id
      );
      return response as unknown as Signup;
    } catch (error) {
      console.error(`Failed to fetch signup ${id}:`, error);
      throw error;
    }
  },

  // Create a new signup
  async createSignup(input: CreateSignupInput): Promise<Signup> {
    try {
      const response = await databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'signups',
        'unique()',
        {
          activityId: input.activityId,
          activityTitle: input.activityTitle || '',
          studentName: input.studentName,
          studentEmail: input.studentEmail,
          studentId: input.studentId || '',
          major: input.major || '',
          year: input.year || '',
          status: input.status || 'pending',
          signupDate: new Date().toISOString(),
          formData: input.formData || {},
        }
      );
      return response as unknown as Signup;
    } catch (error) {
      console.error('Failed to create signup:', error);
      throw error;
    }
  },

  // Update an existing signup
  async updateSignup(id: string, input: UpdateSignupInput): Promise<Signup> {
    try {
      const response = await databases.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'signups',
        id,
        input
      );
      return response as unknown as Signup;
    } catch (error) {
      console.error(`Failed to update signup ${id}:`, error);
      throw error;
    }
  },

  // Delete a signup
  async deleteSignup(id: string): Promise<void> {
    try {
      await databases.deleteDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'signups',
        id
      );
    } catch (error) {
      console.error(`Failed to delete signup ${id}:`, error);
      throw error;
    }
  },

  // Get signups by activity ID
  async getSignupsByActivity(activityId: string): Promise<Signup[]> {
    try {
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'signups',
        [Query.equal('activityId', activityId)]
      );
      return (response.documents as unknown as Signup[]) || [];
    } catch (error) {
      console.error(`Failed to fetch signups for activity ${activityId}:`, error);
      throw error;
    }
  },

  // Get signups by status
  async getSignupsByStatus(status: string): Promise<Signup[]> {
    try {
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'signups',
        [Query.equal('status', status)]
      );
      return (response.documents as unknown as Signup[]) || [];
    } catch (error) {
      console.error(`Failed to fetch signups with status ${status}:`, error);
      throw error;
    }
  },

  // Get signups by email
  async getSignupsByEmail(email: string): Promise<Signup[]> {
    try {
      const allSignups = await this.getAllSignups();
      return allSignups.filter(
        (signup) => signup.studentEmail.toLowerCase() === email.toLowerCase()
      );
    } catch (error) {
      console.error(`Failed to fetch signups for email ${email}:`, error);
      throw error;
    }
  },

  // Search signups
  async searchSignups(query: string): Promise<Signup[]> {
    try {
      const allSignups = await this.getAllSignups();
      return allSignups.filter(
        (signup) =>
          signup.studentName.toLowerCase().includes(query.toLowerCase()) ||
          signup.studentEmail.toLowerCase().includes(query.toLowerCase()) ||
          signup.activityTitle?.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      console.error('Failed to search signups:', error);
      throw error;
    }
  },

  // Get signup count for activity
  async getSignupCount(activityId: string): Promise<number> {
    try {
      const signups = await this.getSignupsByActivity(activityId);
      return signups.length;
    } catch (error) {
      console.error(`Failed to get signup count for activity ${activityId}:`, error);
      throw error;
    }
  },

  // Get confirmed signup count for activity
  async getConfirmedSignupCount(activityId: string): Promise<number> {
    try {
      const signups = await this.getSignupsByActivity(activityId);
      return signups.filter((s) => s.status === 'confirmed').length;
    } catch (error) {
      console.error(
        `Failed to get confirmed signup count for activity ${activityId}:`,
        error
      );
      throw error;
    }
  },

  // Export signups as CSV
  async exportSignupsAsCSV(activityId: string): Promise<string> {
    try {
      const signups = await this.getSignupsByActivity(activityId);

      // CSV header
      const headers = [
        '姓名',
        '邮箱',
        '学号',
        '专业',
        '年级',
        '状态',
        '报名时间',
      ];
      const rows = signups.map((signup) => [
        signup.studentName,
        signup.studentEmail,
        signup.studentId || '',
        signup.major || '',
        signup.year || '',
        signup.status,
        new Date(signup.signupDate).toLocaleDateString('zh-CN'),
      ]);

      // Combine header and rows
      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
      ].join('\n');

      return csvContent;
    } catch (error) {
      console.error('Failed to export signups as CSV:', error);
      throw error;
    }
  },
};
