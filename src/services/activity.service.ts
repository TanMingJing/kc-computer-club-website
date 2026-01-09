/* eslint-disable prettier/prettier */
import { Client, Databases, Query } from 'appwrite';

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

const databases = new Databases(client);

// Type definitions
export interface Activity {
  $id: string;
  title: string;
  description: string;
  category: 'workshop' | 'hackathon' | 'social' | 'competition';
  date: string; // ISO date
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  location: string;
  capacity: number;
  registered: number;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  instructor?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateActivityInput {
  title: string;
  description: string;
  category: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  capacity: number;
  status: 'draft' | 'published';
  instructor?: string;
  imageUrl?: string;
}

export interface UpdateActivityInput {
  title?: string;
  description?: string;
  category?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  capacity?: number;
  registered?: number;
  status?: 'draft' | 'published' | 'cancelled' | 'completed';
  instructor?: string;
  imageUrl?: string;
}

// Activity Service
export const activityService = {
  // Get all activities (optionally filtered by status)
  async getAllActivities(onlyPublished: boolean = false): Promise<Activity[]> {
    try {
      const queries = onlyPublished ? [Query.equal('status', 'published')] : [];
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'activities',
        queries
      );
      return (response.documents as unknown as Activity[]) || [];
    } catch (error) {
      console.error('Failed to fetch activities:', error);
      throw error;
    }
  },

  // Get a single activity by ID
  async getActivityById(id: string): Promise<Activity> {
    try {
      const response = await databases.getDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'activities',
        id
      );
      return response as unknown as Activity;
    } catch (error) {
      console.error(`Failed to fetch activity ${id}:`, error);
      throw error;
    }
  },

  // Create a new activity
  async createActivity(input: CreateActivityInput): Promise<Activity> {
    try {
      const response = await databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'activities',
        'unique()',
        {
          title: input.title,
          description: input.description,
          category: input.category,
          date: input.date,
          startTime: input.startTime,
          endTime: input.endTime,
          location: input.location,
          capacity: input.capacity,
          registered: 0,
          status: input.status,
          instructor: input.instructor || null,
          imageUrl: input.imageUrl || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );
      return response as unknown as Activity;
    } catch (error) {
      console.error('Failed to create activity:', error);
      throw error;
    }
  },

  // Update an existing activity
  async updateActivity(id: string, input: UpdateActivityInput): Promise<Activity> {
    try {
      const response = await databases.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'activities',
        id,
        {
          ...input,
          updatedAt: new Date().toISOString(),
        }
      );
      return response as unknown as Activity;
    } catch (error) {
      console.error(`Failed to update activity ${id}:`, error);
      throw error;
    }
  },

  // Delete an activity
  async deleteActivity(id: string): Promise<void> {
    try {
      await databases.deleteDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'activities',
        id
      );
    } catch (error) {
      console.error(`Failed to delete activity ${id}:`, error);
      throw error;
    }
  },

  // Search activities by title or location
  async searchActivities(query: string): Promise<Activity[]> {
    try {
      const allActivities = await this.getAllActivities();
      return allActivities.filter(
        (activity) =>
          activity.title.toLowerCase().includes(query.toLowerCase()) ||
          activity.location.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      console.error('Failed to search activities:', error);
      throw error;
    }
  },

  // Get activities by category
  async getActivitiesByCategory(category: string): Promise<Activity[]> {
    try {
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'activities',
        [Query.equal('category', category), Query.equal('status', 'published')]
      );
      return (response.documents as unknown as Activity[]) || [];
    } catch (error) {
      console.error(`Failed to fetch activities for category ${category}:`, error);
      throw error;
    }
  },

  // Get activities by status
  async getActivitiesByStatus(status: string): Promise<Activity[]> {
    try {
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'activities',
        [Query.equal('status', status)]
      );
      return (response.documents as unknown as Activity[]) || [];
    } catch (error) {
      console.error(`Failed to fetch activities with status ${status}:`, error);
      throw error;
    }
  },

  // Get upcoming activities (future dates)
  async getUpcomingActivities(): Promise<Activity[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const allActivities = await this.getAllActivities(true);
      return allActivities.filter((activity) => activity.date >= today);
    } catch (error) {
      console.error('Failed to fetch upcoming activities:', error);
      throw error;
    }
  },

  // Increment registered count
  async incrementRegisteredCount(id: string): Promise<Activity> {
    try {
      const activity = await this.getActivityById(id);
      return this.updateActivity(id, {
        registered: activity.registered + 1,
      });
    } catch (error) {
      console.error(`Failed to increment registered count for activity ${id}:`, error);
      throw error;
    }
  },

  // Decrement registered count
  async decrementRegisteredCount(id: string): Promise<Activity> {
    try {
      const activity = await this.getActivityById(id);
      return this.updateActivity(id, {
        registered: Math.max(0, activity.registered - 1),
      });
    } catch (error) {
      console.error(`Failed to decrement registered count for activity ${id}:`, error);
      throw error;
    }
  },
};
