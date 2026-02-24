# AI Agent Naming Conventions and Coding Standards

As an AI Agent, you **MUST** adhere to the following naming conventions and design standards.

## 1. File Naming Rules
- Use `kebab-case` for folder names: `my-feature`, `user-profile`
- Use the format `[feature].[type].[ext]` for backend and frontend files whenever possible.
    - ✅ `auth.controller.ts`
    - ✅ `user.repository.ts`
    - ✅ `match.service.ts`
    - ❌ `AuthController.ts`
    - ❌ `userService.ts`
- Use PascalCase for strictly React UI Components:
    - ✅ `LoginForm.tsx`
    - ✅ `UserProfileCard.tsx`

## 2. Anti Over-Engineering Design (3-Tiers Layer)
- Your backend features MUST strictly follow the 3-Tier Layer:
  - **Controller**: Parses requests and passes data to Service.
  - **Service**: Executes the Core Business rules.
  - **Repository**: Handles Supabase query logic.
- ❌ DO NOT generate generic wrapper Interfaces (e.g. `IUserRepository`) for TypeScript layers unless dealing with >2 diverse Databases.
- ❌ DO NOT create "Adapter" patterns for simple features.
- Keep the code extremely simple and practical.

## 3. Enforcement
These rules apply to any new files generated. Before creating a file, ask yourself if it adheres to these conventions.
