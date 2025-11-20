---
description: Review code for quality, performance, and best practices
---

Review the codebase or specific files for quality and best practices:

1. **Ask the user**:
   - Which files or areas to review
   - Specific concerns (performance, security, readability)

2. **Review checklist**:

   **TypeScript**:
   - Proper type definitions (no `any`)
   - Type safety maintained
   - Interface vs type usage

   **React/Next.js**:
   - Correct use of Server vs Client Components
   - Proper async/await handling
   - No unnecessary 'use client' directives
   - Efficient data fetching
   - Proper error boundaries

   **Performance**:
   - Image optimization (next/image)
   - Code splitting and lazy loading
   - Database query efficiency
   - Unnecessary re-renders
   - Bundle size considerations

   **Security**:
   - No exposed API keys or secrets
   - Proper input validation
   - SQL injection prevention
   - XSS protection
   - Authentication checks
   - RLS policies in Supabase

   **Code Quality**:
   - Clean, readable code
   - Proper naming conventions
   - DRY principle (Don't Repeat Yourself)
   - Single responsibility principle
   - Proper error handling
   - Helpful comments where needed

   **Styling**:
   - Responsive design (mobile-first)
   - Consistent Tailwind usage
   - Accessibility (a11y)
   - Color contrast

3. **Provide**:
   - List of issues found (priority: high/medium/low)
   - Specific code examples
   - Suggested improvements
   - Refactoring recommendations
