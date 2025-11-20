---
description: Debug errors and issues in the application
---

Help debug the current error or issue:

1. **Check the development server output** for error messages

2. **Common issues to investigate**:
   - Build errors (TypeScript, ESLint)
   - Runtime errors (console errors)
   - Database connection issues (Supabase)
   - Environment variables missing
   - Module import issues
   - Tailwind CSS not working
   - Next.js configuration problems

3. **Debugging steps**:
   - Read error messages carefully
   - Check file paths and imports
   - Verify environment variables in `.env.local`
   - Test Supabase connection
   - Check browser console for client errors
   - Verify dependencies are installed
   - Clear Next.js cache (`.next` folder)

4. **Provide**:
   - Clear explanation of the error
   - Root cause analysis
   - Step-by-step fix instructions
   - Prevention tips for the future

5. **If database-related**:
   - Check Supabase connection
   - Verify RLS policies
   - Test queries in Supabase SQL Editor
   - Check table permissions
