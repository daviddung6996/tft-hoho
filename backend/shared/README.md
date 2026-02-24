# Backend Shared Logic

This directory acts as the central hub for generic utilities. 

> [!WARNING]
> DO NOT put feature-specific business logic here! Everything here must be completely agnostic to features and reusable.

## Allowed Types of Code:
- Global standard error handlers (`AppError`).
- Config variables parsers.
- Generic middleware (`requireAuth`, `rateLimiter`).
- Utility functions (`dateUtils.ts`, `cryptoUtils.ts`).
- Generic logger mechanisms.

## Disallowed Types of Code:
- User Repository logic.
- Post validation logic.
- Complex service orchestrators.
