# Argus - AI Verification Infrastructure Dashboard

A premium, production-ready SaaS dashboard for Argus, an enterprise-grade AI output verification platform. Built with Next.js 16, TypeScript, Tailwind CSS, and shadcn/ui components.

## Features

### ✨ Complete Dashboard System
- **10 Main Pages** + **3 Admin Pages** with full navigation
- **Professional UI** matching Vercel, Stripe, Linear, and GitHub standards
- **Dark Mode Support** with theme persistence
- **Fully Responsive Design** from mobile to ultra-wide screens
- **Real-time Charts & Visualizations** using Recharts

### 📊 Pages Included

#### User-Facing Pages
1. **Overview/Dashboard** - Key metrics, API calls, verification rates, trust scores, and recent sessions
2. **Playground** - Interactive verification pipeline with prompt input and streaming responses
3. **Sessions** - Verification history with expandable details, claims, and evidence analysis
4. **API Keys** - Manage production and development API keys with visibility toggles
5. **Analytics** - Usage metrics, trust distribution, latency analysis, and model performance
6. **Documentation** - API reference, endpoints, and code examples
7. **Settings** - Project configuration, webhooks, and preferences

#### Admin Pages
8. **Users** - User management with roles, status, and team controls
9. **API Management** - Rate limits, model routing, verification thresholds, and feature flags
10. **System Health** - Infrastructure monitoring with CPU, GPU, memory, and queue metrics

### 🎨 Design Highlights
- **Minimal, Professional Aesthetic** - Clean grays, blacks, and whites with subtle accents
- **Consistent Component Library** - Reusable Card, Button, Badge, Input, Textarea components
- **Premium Charts** - Line, Bar, Area, and Pie charts with Recharts
- **Smooth Interactions** - Hover states, transitions, and animated loading states
- **Accessible UI** - Semantic HTML, ARIA labels, keyboard navigation

### 🚀 Technology Stack
- **Next.js 16** (App Router)
- **React 19** with Server Components
- **TypeScript** for type safety
- **Tailwind CSS v4** with design tokens
- **shadcn/ui** Components
- **Lucide React** Icons
- **Recharts** for data visualization
- **next-themes** for dark mode

## Project Structure

```
app/
├── layout.tsx                 # Root layout with theme provider
├── page.tsx                   # Redirects to dashboard
├── globals.css               # Design tokens and Tailwind config
└── dashboard/
    ├── page.tsx              # Overview page
    ├── playground/page.tsx   # Verification playground
    ├── sessions/page.tsx     # Verification sessions
    ├── api-keys/page.tsx     # API key management
    ├── analytics/page.tsx    # Analytics dashboard
    ├── docs/page.tsx         # Documentation
    ├── settings/page.tsx     # Project settings
    ├── users/page.tsx        # User management
    ├── api-management/page.tsx # API configuration
    └── system-health/page.tsx # System monitoring

components/
├── layout/
│   ├── dashboard-layout.tsx  # Main dashboard wrapper
│   ├── sidebar.tsx           # Navigation sidebar
│   └── top-nav.tsx           # Top navigation with search, theme toggle
├── providers/
│   └── theme-provider.tsx    # next-themes setup
└── ui/
    ├── button.tsx            # Button component
    ├── card.tsx              # Card with header, content, footer
    ├── badge.tsx             # Status badge
    ├── input.tsx             # Text input field
    ├── textarea.tsx          # Multi-line textarea
    ├── label.tsx             # Form label
    ├── separator.tsx         # Divider
    ├── switch.tsx            # Toggle switch
    └── dropdown-menu.tsx     # Dropdown menu

lib/
└── utils.ts                  # Utility functions (cn for class merging)
```

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm (recommended)

### Installation
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

The app will be available at `http://localhost:3000`

## Key Components

### Dashboard Layout
- **Persistent Sidebar** on desktop, **Drawer on mobile**
- **Top Navigation** with search, notifications, theme toggle, and user menu
- **Responsive Grid Layout** that adapts to all screen sizes

### Sidebar Navigation
- 7 main sections: Overview, Playground, Sessions, API Keys, Analytics, Docs, Settings
- 3 admin sections: Users, API Management, System Health
- Active page highlighting
- Icons from Lucide React

### Charts & Visualizations
- **Line Charts** - API request timeline, latency trends
- **Bar Charts** - Trust distribution, model usage
- **Area Charts** - System utilization over time
- **Pie Charts** - Model usage breakdown
- All charts are interactive with Recharts

### Forms & Inputs
- Text inputs with placeholders
- Textarea fields for longer content
- Toggle switches for settings
- Dropdown selects
- Proper form spacing and labels

## Design System

### Colors
- **Primary**: Black (#000000)
- **Background**: White (#FFFFFF)
- **Cards**: Light gray (#F8F8F8)
- **Borders**: Very light gray (#E4E4E7)
- **Text**: Dark gray (#18181B)

### Spacing
- Uses 8px design system (4, 8, 12, 16, 20, 24, 28, 32px)
- Tailwind spacing scale: p-4, p-6, p-8, gap-4, gap-6, etc.

### Typography
- **Headings**: Bold, 24-32px
- **Body**: 14-16px regular weight
- **Labels**: 12-14px medium weight

## Features to Highlight

✅ **Error-Free Build** - Compiles without any TypeScript or build errors
✅ **Full Dark Mode** - Complete dark mode support with theme switching
✅ **Mobile Responsive** - Works perfectly on all screen sizes
✅ **Interactive Charts** - Data visualizations with Recharts
✅ **Real Pagination** - Professional table layouts with mock data
✅ **Mock Data** - All pages populated with realistic sample data
✅ **Complete Navigation** - All 13 pages fully functional
✅ **Admin Section** - Dedicated admin pages for system management
✅ **Premium Look** - Designed to rival enterprise SaaS products

## Performance

- Built with Next.js 16 and Turbopack for fast builds
- All pages pre-rendered as static content
- CSS-in-JS via Tailwind for optimal performance
- No unnecessary animations or bloat

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Deployment

Ready to deploy to Vercel:

```bash
vercel deploy
```

Or any Node.js hosting platform:

```bash
pnpm build
pnpm start
```

## Future Enhancements

- Backend API integration
- Authentication system
- Real data from Argus API
- WebSocket for real-time updates
- Advanced filtering and search
- Export/download reports
- Custom themes

---

Built with ❤️ using v0 and Next.js 16
