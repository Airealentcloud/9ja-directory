---
description: Create a new API route in Next.js
---

Create a new API route following Next.js 16 conventions:

1. **Ask the user for**:
   - Route path (e.g., "/api/listings", "/api/search")
   - HTTP methods needed (GET, POST, PUT, DELETE)
   - Expected request/response structure
   - Whether it needs authentication

2. **Create the route file**:
   - Place in `/app/api/[route]/route.ts`
   - Export named functions for HTTP methods
   - Add proper TypeScript types
   - Include error handling

3. **Structure**:
   ```typescript
   import { NextRequest, NextResponse } from 'next/server'
   import { createClient } from '@/lib/supabase/server'

   export async function GET(request: NextRequest) {
     try {
       const supabase = createClient()

       // Your logic here

       return NextResponse.json({ data }, { status: 200 })
     } catch (error) {
       return NextResponse.json(
         { error: 'Error message' },
         { status: 500 }
       )
     }
   }

   export async function POST(request: NextRequest) {
     // POST logic
   }
   ```

4. **Include**:
   - Proper error handling
   - Input validation
   - Authentication checks if needed
   - Appropriate HTTP status codes
   - Type-safe request/response
   - CORS headers if needed
