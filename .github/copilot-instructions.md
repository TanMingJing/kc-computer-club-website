# 🤖 Copilot Instructions for KC Computer Club Website

> Last updated: January 2026 | Status: Production-ready (Phase 3+)

## Quick Context

**KC Computer Club Website** is a full-stack Next.js 16 + TypeScript + Appwrite platform for managing a school computer club.

**Key traits**:
- ✅ **Service-oriented architecture**: All Appwrite calls isolated in `/src/services/`
- ✅ **10 Collections**: users, admins, notices, activities, signups, comments, ai_chats, club_info, attendance, projects
- ✅ **Type-first**: Central types in `/src/types/index.ts`, strict TypeScript enforced
- ✅ **Vercel-ready**: No Node.js API routes, edge-compatible
- ✅ **Phase 3+ complete**: Authentication system ✅ | Attendance & Projects 🟨 in progress
- 🌐 **Bilingual UI**: Chinese (Simplified) primary, English fallback

---

## 🏗️ Critical Architecture Patterns

### 1. Service Layer Architecture (Your Primary Interface)

**All data operations are isolated in `/src/services/`**. This is the single most important pattern.

```typescript
// File: src/services/notice.service.ts
// ✅ PATTERN: Every service follows this structure

import { databases, storage } from './appwrite';
import { ID, Query } from 'appwrite';

// 1. Export typed interfaces matching Appwrite responses
export interface Notice {
  $id: string;  // Appwrite document ID
  title: string;
  content: string;
  status: 'draft' | 'published';
  images?: string[];
  createdAt: string;
}

// 2. Export CRUD functions with error handling
export async function getNoticeById(id: string): Promise<Notice> {
  try {
    const doc = await databases.getDocument(DB_ID, NOTICES_COLLECTION_ID, id);
    return doc as Notice;
  } catch (error) {
    console.error('Failed to fetch notice:', error);
    throw new Error('Cannot load notice');  // User-friendly message, not Appwrite error
  }
}

// 3. Wrap ALL Appwrite calls with try-catch
export async function createNotice(data: CreateNoticeInput): Promise<Notice> {
  try {
    const doc = await databases.createDocument(
      DB_ID,
      NOTICES_COLLECTION_ID,
      ID.unique(),
      { ...data, createdAt: new Date().toISOString() }
    );
    return doc as Notice;
  } catch (error) {
    console.error('Create failed:', error);
    throw new Error('Failed to create notice');
  }
}

// 4. Query patterns use Query.* methods (never string queries)
export async function getAllNotices(onlyPublished = false): Promise<Notice[]> {
  try {
    const queries = onlyPublished ? [Query.equal('status', 'published')] : [];
    const response = await databases.listDocuments(
      DB_ID,
      NOTICES_COLLECTION_ID,
      queries
    );
    return response.documents as Notice[];
  } catch (error) {
    throw new Error('Cannot fetch notices');
  }
}
```

**Key services** (reference implementations):
- [auth.service.ts](src/services/auth.service.ts) — 549 lines, student/admin auth + bcryptjs password hashing
- [notice.service.ts](src/services/notice.service.ts) — Notice CRUD + JSON image parsing
- [activity.service.ts](src/services/activity.service.ts) — Activity CRUD + participant counting
- [comment.service.ts](src/services/comment.service.ts) — Comment moderation workflow
- [attendance.service.ts](src/services/attendance.service.ts) — Attendance tracking
- [project.service.ts](src/services/project.service.ts) — Project submissions + checklists

**CRITICAL**: Never add Appwrite calls directly in components—always create a service function first.

---

### 2. React Context & Component Patterns

#### AuthContext (Source of Truth for User State)

```typescript
// File: src/contexts/AuthContext.tsx
// ✅ PATTERN: Single auth context, used by ALL authenticated operations

export interface StudentUser {
  id: string;
  email: string;
  name: string;
  chineseName?: string;
  classCode?: string;
  requirePasswordChange?: boolean;
}

export interface AdminUser {
  id: string;
  email: string;
  username?: string;
  role: 'admin';
}

// Hook usage in components:
const { user, isAdmin, isStudent, login, logout } = useAuth();
```

**Key behaviors**:
1. **Session persistence**: AuthContext checks Appwrite on mount + localStorage fallback
2. **Role-based routing**: Middleware redirects unauthorized users
3. **Password change flow**: Students with `requirePasswordChange` flag forced to change password on login

#### Form Pattern with react-hook-form

```typescript
// ✅ PATTERN: All forms use react-hook-form + Zod validation

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const formSchema = z.object({
  title: z.string().min(3).max(100),
  content: z.string().min(10),
});

export function MyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data) => {
    try {
      const result = await submitForm(data);  // Call service function
      showNotification('Success!');
    } catch (error) {
      // Error already caught by service, display to user
      showNotification(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('title')} />
      {errors.title && <span>{errors.title.message}</span>}
      <button type="submit">Submit</button>
    </form>
  );
}
```

---

### 3. Type System & Data Models

#### Central Type Definitions

All domain models live in [src/types/index.ts](src/types/index.ts):

```typescript
// ✅ PATTERN: All types centralized, imported with @/types
export interface User { ... }
export interface Notice { ... }
export interface Activity { ... }
export interface Comment { ... }
export interface Signup { ... }
export interface Attendance { ... }
export interface Project { ... }
```

**Never define domain types inline**—always add to `src/types/index.ts` and import with `@/types`.

#### Constants & Configuration

Use [src/utils/constants.ts](src/utils/constants.ts) for all magic strings:

```typescript
import { COLLECTIONS, DATABASE_ID, ROUTES, STORAGE_KEYS } from '@/utils/constants';

// ✅ DO THIS
const notices = await databases.listDocuments(DATABASE_ID, COLLECTIONS.NOTICES);

// ❌ DON'T DO THIS
const notices = await databases.listDocuments('kccompt_db', 'notices');
```

**Available constants**:
- `COLLECTIONS`: All 10 Appwrite collection IDs
- `DATABASE_ID`: Main Appwrite database
- `BUCKET_ID`: File storage buckets
- `USER_ROLES`, `STATUS`, `ACTIVITY_CATEGORIES`: Enums
- `ROUTES`: All application routes
- `STORAGE_KEYS`: localStorage keys for session + chat history

---

### 4. Authentication & Password Management

#### Student Auth (Email/Password)

```typescript
// Service: auth.service.ts (lines 89-130)
import { studentLogin, studentLogout } from '@/services/auth.service';

// Login returns requirePasswordChange flag if password is default
const result = await studentLogin('student@school.edu', 'password');
if (result.requirePasswordChange) {
  // Force password change UI
  await changeStudentPassword(currentPassword, newPassword);
}
```

#### Admin Auth (Username/Password with Custom Collection)

```typescript
// Service: auth.service.ts (lines 450-549)
import { adminLogin, adminLogout } from '@/services/auth.service';

// Admin auth uses 'admins' collection (not Appwrite Account API)
const admin = await adminLogin('admin@school.edu', 'password');
```

#### Password Hashing (bcryptjs with 10 rounds)

```typescript
// ✅ PATTERN: Always hash passwords, never store plain text
import { hashPassword, verifyPassword } from '@/services/auth.service';

const hash = await hashPassword('user_password');       // 10 rounds
const isValid = await verifyPassword('input_password', hash);
```

---

### 5. Database Schema (10 Collections)

| Collection | Purpose | Key Fields |
|-----------|---------|-----------|
| `users` | Student accounts | email, passwordHash, chineseName, classCode, createdAt |
| `admins` | Admin accounts | username, passwordHash, permissions, isActive |
| `notices` | Announcements | title, content, status, category, images, publishedAt |
| `activities` | Events/workshops | title, description, category, startTime, maxParticipants |
| `signups` | Activity enrollments | activityId, formData, status, email, createdAt |
| `comments` | Public feedback | contentType, contentId, nickname, status, replyTo |
| `ai_chats` | Chat history | userMessage, aiResponse, sessionId, userType |
| `club_info` | Club metadata | mission, vision, categories, contact, logo |
| `attendance` | Attendance tracking | eventId, userId, timestamp, code, status |
| `projects` | Student submissions | title, members, leaderId, adminFeedback, checklist |

**Query patterns**:

```typescript
import { Query } from 'appwrite';

// ✅ PATTERN: Use Query.* methods (never string queries)
const results = await databases.listDocuments(DB_ID, COLLECTION_ID, [
  Query.equal('status', 'published'),
  Query.greaterThanOrEqual('createdAt', startDate),
  Query.limit(10),
  Query.orderDesc('createdAt'),
]);

// Multiple conditions
const filtered = await databases.listDocuments(DB_ID, COLLECTION_ID, [
  Query.equal('status', 'published'),
  Query.equal('category', '编程'),
  Query.limit(20),
]);
```

---

### 6. Component Organization

```
src/components/
├── common/           # Shared UI (Button, Input, Modal, Card)
├── forms/            # Form components (NoticeForm, ActivityForm)
├── admin/            # Admin-only UI (Dashboard, Lists)
├── notices/          # Notice-specific components
├── activities/       # Activity-specific components
├── layout/           # Header, Footer, Sidebar
├── chat/             # Chat components
├── attendance/       # Attendance components
├── projects/         # Project components
└── ui/               # Base UI elements
```

**Component pattern**:
- Functional components with hooks
- Accept props instead of context (except auth/notifications)
- Error handling via try-catch + NotificationContext
- Strict TypeScript types for all props

---

### 7. CSS & Design System

#### Color Palette (Tailwind v4 + Dark Mode First)

```css
/* Primary (Green) */
--primary: #13ec80;
--primary-hover: #0fd673;

/* Admin (Blue) */
--admin-primary: #137fec;

/* Dark Mode (Default) */
--bg-dark: #102219;
--surface-dark: #162a21;
--card-hover-dark: #1c3328;

/* Light Mode */
--bg-light: #f6f8f7;
--surface-light: #ffffff;
```

#### Typography & Spacing

- **Primary font**: Space Grotesk (via Google Fonts)
- **Fallback**: Noto Sans, sans-serif
- **Monospace**: ui-monospace, SFMono-Regular, Consolas
- **Icons**: Google Material Symbols Outlined (auto-loaded in RootLayout)
- **Spacing**: 8px base unit (p-2 = 16px, gap-2 = 8px)
- **Border radius**: 8px default, 16px for larger elements

#### Tailwind Class Patterns

```typescript
// ✅ Dark mode first, light mode fallback
className="bg-[#162a21] dark:bg-[#f6f8f7]"

// ✅ Responsive design
className="p-2 md:p-4 lg:p-6"

// ✅ Hover states with transitions
className="hover:bg-[#1c3328] transition-colors"

// ✅ Icon styling (Material Symbols)
className="material-symbols-outlined text-[#13ec80]"

// ❌ AVOID: Hardcoded colors not in design system
className="bg-blue-500"  // Wrong
```

---

## 🛠️ Essential Commands

### Development & Verification

```bash
# Development
npm run dev              # Start dev server (http://localhost:3000)

# Verification (RUN BEFORE COMMIT)
npm run lint            # ESLint checks (catches style + logic errors)
npm run format          # Auto-fix code with Prettier
npm run type-check      # TypeScript strict mode (catches most bugs)
npm run build           # Production build validation

# Database setup (one-time)
npm run setup:appwrite  # Initialize 10 collections in Appwrite
npm run seed:appwrite   # Populate sample data for testing

# Database maintenance
npm run fix:attributes  # Fix missing/malformed attributes
npm run fix:grades      # Add allowed grades to activities
npm run fix:comments    # Add reply relationship to comments
```

**Pre-commit checklist**:
1. ✅ `npm run type-check` passes (no `any` types)
2. ✅ `npm run lint` passes (no ESLint violations)
3. ✅ `npm run build` succeeds
4. ✅ All imports use `@/` aliases, not relative paths

---

## 📂 Directory Structure & Conventions

```
src/
├── app/                    # Next.js pages (./page.tsx) and routes
│   ├── page.tsx            # Home page
│   ├── layout.tsx          # Root layout (AuthProvider, ThemeProvider)
│   ├── admin/              # Admin routes (/admin/...)
│   ├── notices/            # Public notice routes
│   ├── activities/         # Public activity routes
│   ├── attendance/         # Attendance routes
│   ├── projects/           # Project routes
│   └── api/                # ⚠️ AVOID: Next.js API routes (not Vercel-ready)
│
├── components/             # Reusable React components
│   ├── common/             # Button, Input, Modal, Card, Dialog
│   ├── forms/              # NoticeForm, ActivityForm, etc.
│   ├── admin/              # AdminDashboard, AdminLists
│   ├── layout/             # Header, Footer, Sidebar
│   └── [features]/         # notices/, activities/, projects/
│
├── services/               # 🔑 Appwrite client + CRUD functions
│   ├── appwrite.ts         # Appwrite client init
│   ├── auth.service.ts     # Student & admin auth (549 lines)
│   ├── notice.service.ts   # Notice CRUD
│   ├── activity.service.ts # Activity CRUD
│   ├── attendance.service.ts # Attendance tracking
│   ├── project.service.ts  # Project management
│   └── ... (4 more services)
│
├── contexts/               # React Context for global state
│   ├── AuthContext.tsx     # User authentication (196 lines)
│   ├── NotificationContext.tsx # Toast notifications
│   ├── ThemeContext.tsx    # Dark/light mode
│   └── ReCaptchaContext.tsx # Google reCAPTCHA
│
├── types/                  # 🔑 Central type definitions
│   └── index.ts            # ALL domain types (247 lines)
│
├── utils/                  # Utility functions
│   ├── constants.ts        # 🔑 COLLECTIONS, ROUTES, STORAGE_KEYS
│   └── api.ts              # HTTP helpers (axios wrapper)
│
└── hooks/                  # Custom React hooks
    └── useAuth.ts          # Auth context hook
```

**Import rule**: Always use `@/` aliases (configured in tsconfig.json):

```typescript
// ✅ DO THIS
import { Notice } from '@/types';
import { getNoticeById } from '@/services/notice.service';
import Button from '@/components/common/Button';
import { COLLECTIONS } from '@/utils/constants';

// ❌ DON'T DO THIS
import Notice from '../../../types';
import { getNoticeById } from '../../services/notice.service';
```

---

## 🔐 Error Handling Pattern

```typescript
// ❌ DON'T: Expose Appwrite internals
throw error;  // Raw Appwrite error

// ✅ DO: Map to user-friendly message
try {
  const doc = await databases.getDocument(...);
  return doc;
} catch (error) {
  console.error('Appwrite error:', error);  // Log for debugging
  throw new Error('Cannot load data');      // Show to user
}
```

---

## ✅ TypeScript Strictness

This project enforces **strict TypeScript** (`tsconfig.json`). All functions require explicit types:

```typescript
// ✅ REQUIRED
export async function getNotice(id: string): Promise<Notice | null> {
  // ...
}

export function formatDate(date: Date): string {
  // ...
}

// ❌ FORBIDDEN (will fail type-check)
export async function getNotice(id: any): any {
  // ...
}

function formatDate(date) {  // No return type
  // ...
}

const data: any = response;  // No `any` types
```

---

## 🚀 Common Workflows

### Adding a New Feature

1. **Define types** in `src/types/index.ts`
2. **Create service** in `src/services/feature.service.ts` (follow auth.service pattern)
3. **Build components** in `src/components/feature/`
4. **Create page route** in `src/app/feature/page.tsx`
5. **Add constants** to `src/utils/constants.ts` (routes, collection IDs)
6. **Test**: `npm run type-check && npm run lint && npm run build`

### Adding a Database Collection

1. Create in Appwrite Console
2. Add to `COLLECTIONS` in `src/utils/constants.ts`
3. Add environment variable to `.env.example`
4. Define interface in `src/types/index.ts`
5. Create service functions with error handling
6. Run `npm run type-check` to verify

### Debugging Appwrite Errors

Check in order:
1. **Browser Console** (F12) — Client-side errors
2. **Terminal output** — Server-side logs
3. **Appwrite Console** — Database/permission issues
4. **Environment variables** — Verify `NEXT_PUBLIC_APPWRITE_*` match Appwrite project

---

## ⚠️ Critical DON'Ts

1. ❌ **No Node.js API routes** — Project runs on Vercel (edge-compatible only)
2. ❌ **No `any` types** — Strict TypeScript enforced via ESLint
3. ❌ **Don't hardcode strings** — Use `COLLECTIONS`, `ROUTES`, `STORAGE_KEYS`
4. ❌ **Don't import with relative paths** — Always use `@/` aliases
5. ❌ **Don't skip service layer** — All Appwrite calls go in services, never in components
6. ❌ **Don't use Appwrite Account API** — Use `databases` collection instead
7. ❌ **Don't store sensitive data in localStorage** — Session only, never passwords
8. ❌ **Don't expose Appwrite errors to users** — Always catch and map to friendly messages

---

## 📚 Key Reference Files

| File | Purpose | Size |
|------|---------|------|
| [src/services/auth.service.ts](src/services/auth.service.ts) | Student/admin auth + bcryptjs | 549 lines |
| [src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx) | Auth state management | 196 lines |
| [src/types/index.ts](src/types/index.ts) | Central type definitions | 247 lines |
| [src/utils/constants.ts](src/utils/constants.ts) | Collections, routes, constants | 80+ lines |
| [docs/context.md](docs/context.md) | Product requirements & features | 1225 lines |
| [docs/plan.md](docs/plan.md) | Development roadmap (8 phases) | 912 lines |
| [tsconfig.json](tsconfig.json) | TypeScript config + @/ aliases | 25 lines |

---

## 🧪 Self-Review Checklist

Before committing, ask:

1. ✅ **Types**: Does my code add `any` types or skip annotations?
2. ✅ **Services**: Are ALL Appwrite calls in `src/services/`, not components?
3. ✅ **Constants**: Did I replace magic strings with constants?
4. ✅ **Paths**: Are imports using `@/` aliases?
5. ✅ **Errors**: Are Appwrite errors caught and mapped to friendly messages?

**Always run**:
```bash
npm run type-check && npm run lint && npm run build
```

---

## 📞 Support Resources

- **Product Context**: [docs/context.md](docs/context.md) — Full feature spec & data schema
- **Development Plan**: [docs/plan.md](docs/plan.md) — 8-phase roadmap with checklists
- **README**: [README.md](README.md) — Quick start & tech stack
- **Appwrite Docs**: https://appwrite.io/docs
- **Next.js Docs**: https://nextjs.org/docs
- **TypeScript Docs**: https://www.typescriptlang.org/docs

---

**Last Updated**: January 2026 | **Status**: Phase 3+ ✅ | **Next**: Phase 4 (Core Features)
