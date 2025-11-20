# Admin Panel Module

This is the admin panel module built with Next.js. It provides a complete content management interface for managing website content.

## 📁 Structure

```
admin/
├── src/
│   ├── components/     # Reusable UI components
│   │   ├── DataTable.tsx
│   │   ├── Layout.tsx
│   │   ├── PageHeader.tsx
│   │   └── ...
│   ├── context/        # React contexts
│   │   └── AuthContext.tsx
│   ├── lib/            # Utilities and helpers
│   │   ├── api.ts      # API client
│   │   ├── useApi.ts   # API hooks
│   │   └── ...
│   ├── pages/          # Next.js pages (routes)
│   │   ├── _app.tsx    # App wrapper
│   │   ├── login.tsx   # Login page
│   │   ├── dashboard.tsx
│   │   ├── services/   # Service management
│   │   ├── blog/       # Blog management
│   │   └── ...
│   └── styles.css      # Global styles
├── public/             # Static assets
├── next.config.js      # Next.js configuration
├── tailwind.config.js  # Tailwind CSS configuration
├── tsconfig.json       # TypeScript configuration
├── package.json
└── .env.example        # Environment variables template
```

## 🚀 Development

### Prerequisites

- Node.js (v16+)
- Backend API running (for authentication and data)

### Setup

```bash
cd admin
npm install
cp .env.example .env.local
# Edit .env.local with your API URL
```

### Run Development Server

```bash
npm run dev
# Admin panel runs on http://localhost:3000
```

## 📋 Features

- ✅ Authentication & Authorization
- ✅ Dashboard with analytics
- ✅ Content Management (CRUD):
  - Services
  - Blog Posts & Categories
  - Portfolio Projects & Categories
  - Testimonials
  - Team Members
  - Pricing Plans
  - Tech Stack
- ✅ Inquiries Management
- ✅ Newsletter Subscribers
- ✅ SEO Settings
- ✅ File Uploads
- ✅ Activity Logs

## 🔧 Configuration

### Environment Variables

Create `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

For production:
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
```

## 🏗️ Build for Production

```bash
npm run build
npm start
```

### Production Optimizations

- ✅ Console.log removal in production builds
- ✅ Image optimization
- ✅ Code minification
- ✅ Security headers
- ✅ Static optimization

## 🔐 Authentication

Admin panel uses JWT authentication:
1. Login via `/login`
2. JWT tokens stored in cookies
3. Protected routes require authentication
4. Role-based access control

## 📱 UI Framework

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible components
- **SWR** - Data fetching

## 🚀 Production Deployment

```bash
# Build
npm run build

# Start production server
npm start

# Or deploy to Vercel/Netlify
# They auto-detect Next.js and build automatically
```

## 📚 Pages/Routes

- `/login` - Admin login
- `/dashboard` - Main dashboard
- `/services` - Services management
- `/blog` - Blog posts management
- `/portfolio` - Portfolio management
- `/testimonials` - Testimonials management
- `/team` - Team members
- `/pricing` - Pricing plans
- `/inquiries` - Contact form submissions
- `/newsletter` - Newsletter subscribers
- `/seo` - SEO settings
- `/uploads` - File uploads
- `/activity` - Activity logs

## ⚠️ Important Notes

- **Separate from website**: Admin is completely separate from public website
- **API communication**: All data operations go through backend API
- **No direct database access**: Admin never touches database directly
- **Role-based access**: Different roles have different permissions
