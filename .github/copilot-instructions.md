# Flight Management Frontend - AI Coding Instructions

## Project Overview

Flight management system frontend built with React 19, TypeScript, TanStack Router, and TanStack Query. Uses shadcn/ui with Tailwind CSS v4 and Radix UI components. Backend integration via OpenAPI-generated types.

## Architecture Patterns

### Routing & Authentication

- **TanStack Router** with file-based routing in `src/routes/`
- Protected routes use `_authenticated/` layout with `beforeLoad` guard checking `context.auth.isAuthenticated`
- Auth context in `src/context/auth-context.tsx` manages JWT tokens in localStorage
- Route groups: `(auth)/` for login/signup, `(errors)/` for error pages
- Auto-generated route tree at `src/routeTree.gen.ts` (ignored in git/eslint)

### Feature Organization

- **Feature-first structure** in `src/features/[feature-name]/`
- Each feature contains: `components/`, `hooks/`, `types.ts`, `schema.ts`, `utils.ts`
- Custom hooks pattern: `use-[entity]-[action].ts` (e.g., `use-tasks.ts`, `use-create-task.ts`)
- All API calls abstracted through feature-specific hooks

### API Integration

- **openapi-fetch + openapi-react-query** for type-safe API calls
- Generated types in `src/generated/api-schema.d.ts` from OpenAPI spec
- Centralized API client in `src/api/index.ts` with auth interceptor
- Custom `FetchError` model for consistent error handling
- Query options pattern: `entityQueryOptions()` functions for reusable queries

### Component Architecture

- **shadcn/ui** components in `src/components/ui/` (generated, not manually edited)
- Custom components use Radix UI primitives + `class-variance-authority` for variants
- Layout components in `src/components/layout/`
- Feature components stay within their feature directory
- Context providers for cross-cutting concerns (auth, dialogs, theme)

## Development Workflow

### Code Generation

```bash
# Update API types from backend
pnpm schema:generate  # Fetches OpenAPI spec + generates TypeScript types

# Add shadcn/ui components
npx shadcn@latest add [component-name]
```

### Code Quality

- **ESLint** with TypeScript, React hooks, TanStack plugins, Prettier integration
- **Knip** for unused code detection (`pnpm knip`)
- **Prettier** with import sorting and Tailwind class sorting
- Path aliases: `@/` and `~/` both point to `src/`

### Build & Deploy

- **Vite** with SWC for fast builds and HMR
- TanStack Router plugin for auto route generation
- Production builds use esbuild minification
- Bundle analysis: `pnpm sizecheck`

## Key Conventions

### File Naming

- React components: PascalCase (`TaskCard.tsx`)
- Hooks: kebab-case starting with `use-` (`use-task-data.ts`)
- Utilities: kebab-case (`data-table.ts`)
- Types: kebab-case (`task-types.ts`)

### Import Patterns

- Absolute imports via `@/` alias
- Group imports: external → internal → relative
- Auto-sorted by Prettier with `@trivago/prettier-plugin-sort-imports`

### State Management

- **TanStack Query** for server state with query options pattern
- React Context for global UI state (auth, dialogs, theme)
- Local component state with useState/useReducer
- Form state via `react-hook-form` + Zod validation

### Styling

- **Tailwind CSS v4** with CSS variables for theming
- Component variants via `class-variance-authority`
- Responsive design with mobile-first approach
- Dark/light theme support built-in

## Common Patterns

### Creating New Features

1. Add feature directory: `src/features/[name]/`
2. Create types, schema, hooks following existing patterns
3. Add routes in `src/routes/_authenticated/[name]/`
4. Use existing layout and data table patterns

### API Integration

1. Update OpenAPI spec: `pnpm schema:generate`
2. Create query options function in feature hooks
3. Use `$queryClient.useQuery()` or `$queryClient.useMutation()`
4. Handle loading/error states in components

### Form Handling

- Use `react-hook-form` + `@hookform/resolvers/zod`
- Create Zod schemas in feature `schema.ts`
- Consistent validation patterns across forms
