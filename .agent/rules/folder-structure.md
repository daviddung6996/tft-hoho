# AI Agent Folder Structure Rules

**CRITICAL RULE: DO NOT CREATE NEW GLOBAL DIRECTORIES.**

As an AI Agent operating in this project, you are strictly prohibited from generating fragmented folder structures.

## 1. Feature Grouping Only (The Golden Rule)
All new business logic, UI components, or backend endpoints **MUST** be placed inside a specific feature directory.

- **Frontend**: Place inside `src/features/[feature-name]/`
- **Backend**: Place inside `backend/features/[feature-name]/`

## 2. No Global Pollution
You are **NOT ALLOWED** to create directories like:
- ❌ `src/components/` (Put them in `src/features/[feature-name]/` or `src/shared/ui/` if generic)
- ❌ `src/pages/` (Views belong inside features)
- ❌ `backend/controllers/` (Put them in `backend/features/[feature-name]/`)
- ❌ `backend/services/`
- ❌ `backend/repositories/`

Any AI Agent attempting to create these old MVC or generic folders must fail the prompt and ask the user for permission to create a valid `feature` folder instead.

## 3. Database Source of Truth
- ❌ DO NOT create or use `database/` or `migrations/` at the root folder.
- ✅ **ALL** database configurations, migrations, and seeds **MUST** go into `supabase/`.
