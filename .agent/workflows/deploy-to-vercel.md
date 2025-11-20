---
description: How to deploy the project to Vercel
---

1.  **Sign Up / Log In**:
    - Go to [vercel.com](https://vercel.com) and sign up (continue with GitHub is best).

2.  **Add New Project**:
    - On your Vercel dashboard, click **"Add New..."** -> **"Project"**.
    - You should see your `9ja-directory` repository from GitHub.
    - Click **"Import"**.

3.  **Configure Project**:
    - **Framework Preset**: Next.js (should be auto-detected).
    - **Root Directory**: `./` (default).
    - **Environment Variables**: You MUST add these (copy from your `.env.local` file):
        - `NEXT_PUBLIC_SUPABASE_URL`
        - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4.  **Deploy**:
    - Click **"Deploy"**.
    - Wait for the build to finish (about 1-2 minutes).
    - Once done, you will get a live URL (e.g., `9ja-directory.vercel.app`).

5.  **Update Supabase Auth**:
    - Go to your [Supabase Dashboard](https://supabase.com/dashboard).
    - Go to **Authentication** -> **URL Configuration**.
    - Add your new Vercel URL to **Site URL** and **Redirect URLs**.
