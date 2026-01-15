# Copilot Instructions for KC Computer Club Website

## Project Overview

**KC Computer Club Website** is a Next.js 16 + TypeScript + Appwrite application for managing a school computer club. It provides:
- **Public-facing features**: notices, activities, signups, comments
- **Admin dashboard**: content management and member administration
- **Authentication**: Student (email/password) + Admin (custom collection with bcryptjs)

- **Status**: Phase 3 (User Authentication System) ✅ completed
- **Tech Stack**: Next.js 16, React 19, TypeScript 5, Tailwind CSS 4, Appwrite, Zustand, React Hook Form
- **Deployment**: Vercel-ready (no Node.js API routes)
- **Language**: Chinese (Simplified) for UI/documentation

---

## Critical Architecture Patterns

### 1. Service Layer Architecture
All data operations are isolated in `/src/services/`:
- **auth.service.ts** (549 lines) - Student & admin auth, password hashing with bcryptjs, session management
- **notice.service.ts** - Notice CRUD (with JSON parsing for image arrays)
- **activity.service.ts** - Activity CRUD + participant counting
- **comment.service.ts** - Comment moderation workflow
- **signup.service.ts** - Activity enrollment + email notifications
- **appwrite.ts** - Appwrite client initialization (databases, storage, account)

**Pattern**: Each service exports named functions (not classes), includes JSDoc comments, handles Appwrite errors with try-catch, and maps Appwrite responses to typed interfaces.

```typescript
// Example: Services always wrap Appwrite calls with error handling
export async function studentLogin(email: string, password: string): Promise<StudentUser> {
  try {
    const records = await databases.listDocuments(DB_ID, COLLECTION_ID, [Query.equal('email', email)]);
    if (records.documents.length === 0) throw new Error('账号或密码错误');
    const user = records.documents[0];
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) throw new Error('账号或密码错误');
    return parseUserResponse(user); // Transform Appwrite response to typed interface
  } catch (error) {
    console.error('Login failed:', error);
    throw new Error('User-friendly message'); // Don't expose Appwrite internals
  }
}
```

### 2. Type System & Data Models
- **Central types** in `/src/types/index.ts` for all domain models (User, Notice, Activity, Comment, etc.)
- **Service-level interfaces** extend base types with API-specific fields (e.g., `$id` from Appwrite)
- **Form validation** uses Zod schemas + react-hook-form integration
- **No `any` types** - strict TypeScript enforced via ESLint + tsconfig

### 3. Authentication Flow (Phase 3 Complete)
- **Student auth**: Email/password stored in `users` collection with bcryptjs hashing
- **Admin auth**: Custom `admins` collection with bcryptjs password hashing
- **Session management**: AuthContext (React) + localStorage caching + Appwrite as source of truth
- **Cross-tab coordination**: Always check Appwrite session first, use localStorage as fallback
- **Key files**: `AuthContext.tsx` (196 lines), `auth.service.ts` (549 lines)

**Password hashing pattern** (bcryptjs with 10 rounds):
```typescript
// Hashing: await bcrypt.hash(password, 10)
// Verification: await bcrypt.compare(providedPassword, storedHash)
```

### 4. Context & State Management
- **React Context** for authentication (AuthContext.tsx, NotificationContext.tsx)
- **Zustand stores** for UI state (if needed for non-auth state)
- **No Redux/complex patterns** - keep it simple for a school project

### 5. API Routes Pattern
- Minimal API layer - most logic lives in services
- API routes in `/src/app/api/` only handle HTTP transport + basic auth checks
- Actual business logic stays in services (e.g., `notice.service.ts`)
- No long-running processes or webhooks
```
src/components/
├── admin/           # Admin-specific UI
├── common/          # Shared components (Button, Form, etc.)
├── forms/           # Form components (wrapped with react-hook-form)
├── layout/          # Header, Footer, Navigation
├── sections/        # Page-level sections (Hero, Features, etc.)
├── ui/              # Base UI elements (cards, modals, etc.)
└── notices/activity/chat/etc/  # Feature-specific components
```

**Rule**: Components are functional, use hooks, accept props instead of accessing context directly (except for auth/notifications).

---

## Critical Workflows & Commands

### Development Setup
```bash
npm install                    # Install dependencies
cp .env.example .env.local     # Create environment file
npm run dev                    # Start dev server (http://localhost:3000)
```

### Build & Verification
```bash
npm run lint                   # ESLint + Prettier checks
npm run type-check             # TypeScript strict checking (catches many bugs)
npm run format                 # Auto-fix code style
npm run build                  # Production build (must pass before deploy)
```

### Appwrite Setup (Critical for Testing)
```bash
npm run setup:appwrite         # Initialize Appwrite project + collections
npm run seed:appwrite          # Populate sample data
```

**Key**: 8 Collections required: users, admins, notices, activities, signups, comments, ai_chats, club_info. See `scripts/setup-appwrite.ts` for structure.

### Database Fixes (One-time Maintenance)
```bash
npm run fix:attributes         # Fix missing/malformed attributes
npm run fix:grades             # Add allowed grades to activities
npm run fix:comments           # Add reply relationship to comments
```

---

## Code Conventions & Patterns

### Naming & Organization
- **Collections & constants**: Use environment variables `NEXT_PUBLIC_APPWRITE_*` + constants in auth.service.ts
- **Routes**: Use hardcoded paths (TODO: extract to `ROUTES` object for consistency)
- **Storage keys**: `studentSession`, `adminSession` in localStorage
- **Path aliases**: Always use `@/` prefix (`import { X } from '@/services'`)

### Error Handling
- **Services**: Catch Appwrite errors, log + throw user-friendly message
- **Components**: Use try-catch in async operations, display via NotificationContext
- **Pattern**: Never expose Appwrite error details to users

### TypeScript Usage
```typescript
// ✅ Required: Explicit types for function parameters
export async function getNoticeById(id: string): Promise<Notice> { }

// ❌ Avoid: No `any` types (will fail ESLint)
const data: any = response; // ERROR

// ✅ Correct: Use Record<string, T> for dynamic objects
const metadata: Record<string, string> = { key: 'value' };
```

### CSS & Styling
- **Tailwind v4** with Space Grotesk font
- **Dark mode first**: Theme uses `dark:` variants for light mode fallback
- **Color system** (from design): Primary `#13ec80` (green), Admin `#137fec` (blue), Backgrounds `#102219` (dark)
- **Spacing/Radius**: Follow Material Design tokens (8px base unit, 16px radius default)
- **Icons**: Google Material Symbols Outlined (auto-loaded in RootLayout)

---

## Key Files Reference

| File | Purpose | Maintainers Note |
|------|---------|------------------|
| `src/services/auth.service.ts` | Student & admin auth, bcryptjs, session - 549 lines | Complex; test carefully after changes |
| `src/contexts/AuthContext.tsx` | Auth state + hooks (useAuth) - 196 lines | Single source of truth for user state |
| `src/services/notice.service.ts` | Notice CRUD + JSON image parsing | Custom JSON parsing for images field |
| `tsconfig.json` | Path aliases + TypeScript strict | `@/*` paths enabled, strict: true |
| `src/types/index.ts` | All domain types | Central schema - keep in sync |
| `docs/context.md` | Product requirements & data schema | Source of truth for features |
| `docs/plan.md` | Development roadmap (8 phases) | Task status tracking

---

## Testing & Debugging

### Enable Debug Logs
Services use `console.error()`/`console.warn()` for failures. Check:
- Browser Console (F12) for client errors
- Terminal output for server-side logs
- Appwrite Console for database/permission issues

### Common Issues
1. **"Collection not found"** → Verify `NEXT_PUBLIC_APPWRITE_*` env vars match Appwrite project
2. **CORS errors** → Appwrite endpoint must be publicly accessible (not localhost in production)
3. **Session lost on page reload** → Check `checkSession()` in AuthContext + localStorage sync
4. **Type mismatches** → Run `npm run type-check` (catches 98%+ of issues)

---

### Important Constraints & Decisions

### Why This Architecture?
- **Appwrite-first**: No custom backend - use cloud services for scalability
- **Services + Context**: Minimal, understandable state management for school project
- **Strict TypeScript**: Prevents runtime bugs in production
- **Single-language imports**: `@/` aliases reduce path confusion

### What NOT to Do
- ❌ Don't store sensitive data (passwords, tokens) in localStorage beyond session
- ❌ Don't add Node.js API logic (not deployable to Vercel)
- ❌ Don't hardcode collection/route names (use constants in auth.service.ts)
- ❌ Don't import from sibling paths (`../../`) - use `@/`
- ❌ Don't skip TypeScript types for "faster coding" - it creates technical debt
- ❌ Don't use Appwrite Account for auth (use DB collections instead - per this project's design)

---

## Extending the Project

### Adding a New Feature
1. **Define types** in `src/types/index.ts`
2. **Create service** in `src/services/feature.service.ts` (follow auth.service.ts pattern)
3. **Add API route** in `src/app/api/feature/` if needed
4. **Build components** in `src/components/feature/`
5. **Add route** to `src/app/feature/page.tsx`
6. **Update ROUTES** in `utils/constants.ts` (TODO: create this if missing)

### Adding a Database Collection
1. Create Collection in Appwrite Console
2. Add to constants (currently in auth.service.ts)
3. Add environment variable to `.env.example`
4. Define interface in `src/types/index.ts`
5. Create service functions with standard error handling
6. Test with `npm run type-check && npm run lint`

---

## Documentation References

- **Product Context**: `docs/context.md` - requirements, data schema, UI system
- **Development Plan**: `docs/plan.md` - phases, status, checklists (8 phases total)
- **Phase 3.2 Services**: `docs/PHASE_3_2_SERVICES.md` - service implementation details
- **Database Fix**: `docs/DATABASE_FIX.md` - database troubleshooting guide
- **README**: `README.md` - quick start, tech stack, commands

---

## Questions for Code Review

When reviewing PRs, ensure:
1. **Types**: Does the code add `any` types or skip type annotations?
2. **Services**: Are Appwrite calls isolated in service layer with error handling?
3. **Constants**: Are magic strings replaced with constants from `utils/constants.ts`?
4. **Paths**: Do imports use `@/` aliases, not relative paths?
5. **Tests**: Does the code change require verification (manual or automated)?
