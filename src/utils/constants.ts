/* eslint-disable prettier/prettier */
// Application Constants

// Appwrite Collections
export const COLLECTIONS = {
  USERS: process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION || 'users',
  ADMINS: process.env.NEXT_PUBLIC_APPWRITE_ADMINS_COLLECTION || 'admins',
  NOTICES: process.env.NEXT_PUBLIC_APPWRITE_NOTICES_COLLECTION || 'notices',
  ACTIVITIES:
    process.env.NEXT_PUBLIC_APPWRITE_ACTIVITIES_COLLECTION || 'activities',
  SIGNUPS: process.env.NEXT_PUBLIC_APPWRITE_SIGNUPS_COLLECTION || 'signups',
  COMMENTS: process.env.NEXT_PUBLIC_APPWRITE_COMMENTS_COLLECTION || 'comments',
  AI_CHATS:
    process.env.NEXT_PUBLIC_APPWRITE_AI_CHATS_COLLECTION || 'ai_chats',
  CLUB_INFO:
    process.env.NEXT_PUBLIC_APPWRITE_CLUB_INFO_COLLECTION || 'club_info',
};

// Appwrite Database
export const DATABASE_ID =
  process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'default';

// Appwrite Storage
export const BUCKET_ID = {
  IMAGES: process.env.NEXT_PUBLIC_APPWRITE_IMAGES_BUCKET || 'images',
};

// User Roles
export const USER_ROLES = {
  STUDENT: 'student',
  ADMIN: 'admin',
};

// Notice & Activity Status
export const STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// Comment Status
export const COMMENT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

// Signup Status
export const SIGNUP_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  ATTENDED: 'attended',
};

// Activity Categories
export const ACTIVITY_CATEGORIES = [
  '编程',
  'AI',
  '网页',
  '比赛',
  '工作坊',
  '讲座',
  '其他',
];

// Pagination
export const PAGINATION = {
  DEFAULT_LIMIT: 10,
  DEFAULT_OFFSET: 0,
};

// Routes
export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  NOTICES: '/notices',
  NOTICE_DETAIL: '/notices',
  ACTIVITIES: '/activities',
  ACTIVITY_DETAIL: '/activities',
  ACTIVITY_SIGNUP: '/signup',
  ADMIN_LOGIN: '/admin',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_NOTICES: '/admin/dashboard/notices',
  ADMIN_ACTIVITIES: '/admin/dashboard/activities',
  ADMIN_COMMENTS: '/admin/dashboard/comments',
  ADMIN_SETTINGS: '/admin/dashboard/settings',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  SESSION_ID: 'session_id',
  USER_INFO: 'user_info',
  CHAT_HISTORY: 'chat_history',
};

// API Configuration
export const API_CONFIG = {
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
};
