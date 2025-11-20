---
description: Create a new Next.js page in the app directory
---

Create a new Next.js page following App Router conventions:

1. **Ask the user for**:
   - Route path (e.g., "/listings", "/about", "/dashboard")
   - Page purpose and main functionality
   - Whether it needs dynamic segments (e.g., [id])

2. **Create the page structure**:
   - Place in correct `/app` directory structure
   - Create `page.tsx` file
   - Add metadata export for SEO
   - Use Server Component by default

3. **File structure**:
   ```typescript
   import type { Metadata } from 'next'

   export const metadata: Metadata = {
     title: 'Page Title | 9ja Directory',
     description: 'Page description for SEO',
   }

   export default async function PageName() {
     // Fetch data here if needed

     return (
       <main className="min-h-screen">
         {/* Page content */}
       </main>
     )
   }
   ```

4. **For dynamic routes**: Create `[param]/page.tsx` structure

5. **Include**:
   - Proper TypeScript types
   - Metadata for SEO
   - Error boundaries if needed
   - Loading states if fetching data
   - Mobile-responsive layout
