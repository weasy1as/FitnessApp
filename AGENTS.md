# AGENTS.md

## General Rules

- Before every implementation task, read this file and `project-context/PROJECT_CONTEXT.md` when it exists.
- After meaningful implementation work, update `project-context/PROJECT_CONTEXT.md` with only important project context, decisions, and feature state.
- Keep `project-context/PROJECT_CONTEXT.md` concise. It is local memory and must not be committed.
- Always follow modern React Native and Expo best practices.
- Write clean, readable, and maintainable code.
- Keep files small and focused on a single responsibility.
- Prefer composition over large, monolithic components.
- Reuse existing components before creating new ones.

## Tech Stack

- React Native
- Expo
- TypeScript
- Expo Router
- NativeWind for styling
- Supabase for authentication and database

## Type Safety

- Always use TypeScript.
- Never use `any`.
- Create reusable types and interfaces inside the `types/` folder when needed.
- Keep types shared and reusable across the project.

## Components

- Extract reusable UI into the `components/` folder.
- Avoid duplicating UI between screens.
- Keep screen files focused on layout and screen logic.

## Utilities

- Place reusable functions inside the `lib/` folder.
- Move business logic out of components whenever possible.
- Create utility functions instead of duplicating logic.

Examples:

- Date formatting
- Validation
- Helper functions
- Workout calculations
- Personal best calculations
- Consistency calculations

## Styling

- Always use NativeWind (Tailwind CSS) for styling.
- Avoid inline styles unless absolutely necessary.
- Keep styling consistent across the application.

## Code Quality

Before completing any task, ensure:

- Components are reusable.
- Code is type-safe.
- No duplicated logic exists.
- Business logic is separated from UI.
- Code follows clean architecture and best practices.
- The implementation remains simple and maintainable.
