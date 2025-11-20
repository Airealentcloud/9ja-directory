---
description: Create a new React component following project conventions
---

Create a new React component in the `/components` directory with the following specifications:

1. **Ask the user for**:
   - Component name (e.g., "BusinessCard", "SearchBar")
   - Component type: Server Component (default) or Client Component
   - Basic functionality description

2. **Create the component with**:
   - TypeScript with proper type definitions
   - Tailwind CSS for styling
   - Mobile-first responsive design
   - Proper exports (named export)
   - JSDoc comments explaining purpose

3. **File naming**: Use kebab-case (e.g., `business-card.tsx`)

4. **Structure**:
   ```typescript
   // Server Component (default)
   interface ComponentNameProps {
     // Define props
   }

   export function ComponentName({ props }: ComponentNameProps) {
     return (
       <div className="...">
         {/* Component JSX */}
       </div>
     )
   }
   ```

5. **For Client Components**: Add `'use client'` at the top only if needed (interactivity, hooks, browser APIs)

6. **Styling guidelines**:
   - Use Tailwind utility classes
   - Follow mobile-first approach
   - Use semantic spacing (p-4, m-2, etc.)
   - Ensure proper contrast for accessibility
