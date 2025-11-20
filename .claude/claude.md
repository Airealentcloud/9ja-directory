# 9ja-Directory Project Instructions

## Project Overview
This is a Nigeria Business Directory built with Next.js 16, TypeScript, Tailwind CSS v4, and Supabase.

## Technology Stack
- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4 with @tailwindcss/postcss
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage

## Code Style Guidelines

### TypeScript
- Always use TypeScript for all files
- Define proper types and interfaces
- Avoid using `any` - use proper types or `unknown`
- Use type inference where possible

### React/Next.js
- Use React Server Components by default
- Only add 'use client' when absolutely necessary (forms, interactivity, hooks)
- Prefer async server components for data fetching
- Use Next.js App Router conventions

### Styling
- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Use semantic color names from Tailwind
- Keep custom CSS minimal

### File Organization
- Components go in `/components` directory
- Use kebab-case for file names: `business-card.tsx`
- Group related components in subdirectories
- Keep server and client components separate

### Database
- Use Supabase client from `/lib/supabase/client.ts` (client-side)
- Use Supabase client from `/lib/supabase/server.ts` (server-side)
- Always handle errors from database calls
- Use Row Level Security (RLS) policies

### Nigerian Context
- All states and cities should be Nigerian locations
- Phone numbers should support Nigerian format (+234)
- Currency should be Naira (¦)
- Use Nigerian English spelling

## Common Patterns

### Fetching Data
```typescript
// Server Component
const { data, error } = await supabase
  .from('listings')
  .select('*')
  .eq('status', 'approved')

if (error) throw error
```

### Forms
- Use native form actions where possible
- Validate on both client and server
- Show clear error messages
- Include loading states

## Security
- Never expose sensitive API keys
- Use environment variables for secrets
- Validate all user inputs
- Implement proper RLS policies in Supabase

## Testing
- Test on multiple screen sizes
- Verify database queries work correctly
- Check authentication flows
- Validate forms with edge cases
