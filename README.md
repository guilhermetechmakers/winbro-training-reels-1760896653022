# Winbro Training Reels

A modern B2B SaaS platform for capturing, organizing, and delivering ultra-short (20–30s) instructional video reels that document machine operation, tooling, maintenance, troubleshooting, and processing techniques.

## Features

- **Ultra-Short Training Reels**: Capture 20-30 second instructional videos for machine operations
- **AI-Powered Search**: Intelligent search across video transcripts and metadata
- **Team Collaboration**: Share knowledge across your organization with customer-scoped libraries
- **Course Builder**: Create structured training courses from reels and resources
- **Enterprise Security**: Bank-level security with SSO, audit logs, and compliance-ready data protection
- **Analytics & Reporting**: Track progress, engagement, and completion rates
- **Admin Tools**: Content moderation, user management, and platform administration

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with SWC plugin
- **Styling**: Tailwind CSS v3 with custom design system
- **UI Components**: Shadcn/ui with Radix UI primitives
- **State Management**: TanStack React Query
- **Routing**: React Router v6
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Notifications**: Sonner

## Design System

The application follows a modern, ultra-minimalist B2B SaaS aesthetic with:

- **Color Palette**: 
  - Background: #F9FAFB (very light gray)
  - Primary Text: #111827 (almost black)
  - Secondary Text: #6B7280 (medium gray)
  - Accent Blue: #2563EB (interactive states)
  - Status Green: #34D399 (published status)
  - Status Gray: #D1D5DB (archived status)

- **Typography**: Inter font family with clear hierarchy
- **Components**: White cards with 8px radius, subtle shadows, no borders
- **Animations**: Tailwind CSS animations with custom keyframes
- **Responsive**: Mobile-first design with collapsible sidebar navigation

## Getting Started

### Prerequisites

- Node.js 20.19+ or 22.12+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd winbro-training-reels
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Start the development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Shadcn/ui components
│   ├── layout/         # Layout components (Sidebar, TopNav, MainLayout)
│   └── charts/         # Data visualization components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and API client
├── types/              # TypeScript type definitions
├── contexts/           # React contexts (Auth, Theme, etc.)
└── styles/             # Global styles and CSS
```

## Key Pages

- **Landing Page**: Public marketing page with hero, features, and demo request
- **Authentication**: Login and signup pages with SSO support
- **Dashboard**: Main user dashboard with search, recommendations, and analytics
- **Content Library**: Browse and search reels with filtering and grid/list views
- **Video Player**: Play reels with metadata, transcript, and actions
- **Course Builder**: Create structured courses with drag-and-drop timeline
- **Admin Dashboard**: Platform administration and moderation tools

## API Integration

The application uses a centralized API layer with:

- **API Client**: Fetch-based HTTP client with error handling
- **React Query**: Data fetching, caching, and state management
- **Type Safety**: Full TypeScript support for API responses
- **Authentication**: JWT token management with automatic refresh

## Development

### Code Style

- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Functional components with hooks
- Custom hooks for data fetching

### Component Patterns

- Shadcn/ui components for consistency
- Custom components following design system
- Responsive design with mobile-first approach
- Accessibility with ARIA labels and keyboard navigation

### State Management

- React Query for server state
- React Context for global client state
- Local state with useState/useReducer
- Form state with React Hook Form

## Deployment

The application is built with Vite and can be deployed to any static hosting service:

- **Build**: `npm run build`
- **Preview**: `npm run preview`
- **Output**: `dist/` directory

## Contributing

1. Follow the established code style and patterns
2. Use TypeScript for all new code
3. Write tests for new features
4. Update documentation as needed
5. Follow the design system guidelines

## License

This project is proprietary software. All rights reserved.

## Support

For support and questions, please contact the development team or refer to the help documentation within the application.