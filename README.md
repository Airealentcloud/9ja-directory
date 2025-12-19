# 9jaDirectory - Nigeria Business Directory

A modern, full-featured business directory website for Nigerian businesses built with Next.js and Supabase.

## Features

- Advanced search and filtering
- Location-based directory (all 36 states + FCT)
- Reviews and ratings
- Verified business badges
- Mobile-responsive design
- Map integration
- User authentication
- Business owner dashboard
- Analytics and insights

## Tech Stack

- **Frontend:** Next.js (React) with TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage
- **Testing:** Playwright
- **Hosting:** Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account (free)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Supabase:**
   - Follow the detailed guide in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
   - Create a Supabase project at https://supabase.com
   - Run the SQL schema from `database-schema.sql`

3. **Configure environment variables:**
   - Copy `.env.example` to `.env.local`
   - Add your Supabase URL and anon key:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   - Visit http://localhost:3000 (or the port shown in the terminal)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run Playwright tests

## Deployment (Vercel)

1. Push your code to GitHub
2. Import the repo in Vercel
3. Set env vars:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (required for admin import + send-emails API routes)

## License

MIT
