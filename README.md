<<<<<<< HEAD
# 9ja-directory
9ja listing website 
=======
# 9jaDirectory - Nigeria Business Directory

A modern, full-featured business directory website for Nigerian businesses built with Next.js and Supabase.

## Features

- 🔍 Advanced search and filtering
- 📍 Location-based directory (all 36 states + FCT)
- ⭐ Reviews and ratings
- ✅ Verified business badges
- 📱 Mobile-responsive design
- 🗺️ Map integration
- 🔐 User authentication
- 💼 Business owner dashboard
- 📊 Analytics and insights

## Tech Stack

- **Frontend:** Next.js 16 (React) with TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage
- **Hosting:** Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account (free)

### Installation

1. **Clone/Navigate to the project:**
   ```bash
   cd 9ja-directory
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Supabase:**
   - Follow the detailed guide in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
   - Create a Supabase project at https://supabase.com
   - Run the SQL schema from `database-schema.sql`
   - Get your API credentials

4. **Configure environment variables:**
   - Copy `.env.example` to `.env.local`
   - Add your Supabase URL and anon key:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   - Visit http://localhost:3000
   - You should see your directory website!

## Project Structure

```
9ja-directory/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Homepage
│   ├── layout.tsx         # Root layout with nav/footer
│   └── globals.css        # Global styles
├── components/            # Reusable React components
├── lib/                   # Utility functions
│   └── supabase/         # Supabase client configuration
│       ├── client.ts     # Client-side Supabase
│       └── server.ts     # Server-side Supabase
├── database-schema.sql   # Database schema to run in Supabase
├── middleware.ts         # Next.js middleware for auth
└── .env.local           # Environment variables (not in git)
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Database Schema

The database includes tables for:
- **listings** - Business listings
- **categories** - Business categories
- **states** - Nigerian states (pre-populated)
- **cities** - Cities/LGAs
- **profiles** - User profiles
- **reviews** - Business reviews
- **favorites** - User bookmarks
- **listing_claims** - Claim requests for businesses

See `database-schema.sql` for complete schema.

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click Deploy

Your site will be live at `https://your-project.vercel.app`

### Custom Domain

1. Buy domain (9jadirectory.com or 9jadirectory.ng)
2. In Vercel, go to Settings > Domains
3. Add your custom domain
4. Update DNS records as instructed

## Features Roadmap

### Phase 1 - MVP (Current)
- [x] Homepage with search
- [x] Category browsing
- [x] Database schema
- [ ] Listing detail pages
- [ ] Search functionality
- [ ] User authentication

### Phase 2 - Core Features
- [ ] Business owner dashboard
- [ ] Add/edit listings
- [ ] Reviews and ratings
- [ ] Image uploads
- [ ] Map integration

### Phase 3 - Advanced Features
- [ ] Featured listings
- [ ] Payment integration (Paystack)
- [ ] Email notifications
- [ ] Admin panel
- [ ] Analytics

### Phase 4 - Growth
- [ ] Mobile app (React Native)
- [ ] API for third parties
- [ ] Advanced search filters
- [ ] Business insights

## Contributing

This is a personal project, but suggestions are welcome!

## License

MIT

## Support

For issues or questions:
- Check [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for setup help
- Review the database schema in `database-schema.sql`
- Check Supabase documentation

## Author

Built with ❤️ for Nigeria
>>>>>>> e8f8958 (Initial commit: 9jaDirectory setup)
