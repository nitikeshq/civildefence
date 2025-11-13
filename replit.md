# Civil Defence Department Odisha - Volunteer Management System

## Overview

This is a web-based volunteer management system for the Civil Defence Department, Government of Odisha. The application facilitates volunteer registration (ex-servicemen and civilians), incident reporting, inventory management, and administrative approval workflows. Built with a modern React frontend and Express backend, it provides role-based access control for volunteers, district admins, department admins, and state admins.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React with TypeScript for type-safe component development
- Vite as the build tool and development server for fast hot module replacement
- Wouter for lightweight client-side routing instead of React Router

**UI Component System**
- shadcn/ui component library (New York style variant) for consistent, accessible components
- Radix UI primitives for headless accessible components
- TailwindCSS for utility-first styling with custom design tokens
- Class Variance Authority (CVA) for component variant management

**State Management & Data Fetching**
- TanStack Query (React Query) for server state management, caching, and synchronization
- React Hook Form with Zod resolvers for form state and validation
- Custom hooks pattern for authentication (`useAuth`) and UI state (`useToast`, `useIsMobile`)

**Design System**
- Government of India WCAG 2.0 Level AA compliance with enhanced accessibility
- Increased font sizes (base: 18px instead of 16px) for senior government officials
- Bilingual readiness supporting English and Odia (Noto Sans font family)
- System-based approach following GIGW guidelines

**Page Structure**
- Landing page for unauthenticated users with government portal aesthetics
- Dashboard for authenticated users with role-based content
- Dedicated pages for volunteer registration, incident reporting, inventory management, and volunteer approval
- Separate sign-in/sign-up flows with local password authentication

### Backend Architecture

**Server Framework**
- Express.js on Node.js runtime with ES modules
- TypeScript for type safety across the entire stack
- Session-based authentication using express-session with Passport.js Local Strategy

**Authentication & Authorization**
- Passport.js with Local Strategy for username/password authentication
- bcryptjs for password hashing with salt rounds
- Role-based access control (RBAC) with middleware functions (`isAuthenticated`, `requireRole`)
- Four user roles: volunteer, district_admin, department_admin, state_admin
- Session storage in PostgreSQL for persistence across server restarts

**API Design**
- RESTful API endpoints under `/api` prefix
- Standardized error handling with HTTP status codes
- Request/response logging middleware for debugging
- CRUD operations for volunteers, incidents, and inventory items
- Status update endpoints for approval workflows

**Data Validation**
- Zod schemas shared between client and server (`@shared/schema`)
- Runtime validation on all mutation endpoints
- Type-safe database operations with Drizzle ORM's inferred types

### Data Storage

**Database**
- PostgreSQL as the primary relational database
- Neon serverless PostgreSQL driver with WebSocket support for edge deployments
- Drizzle ORM for type-safe database queries and migrations

**Schema Design**
- `users` table: Local authentication with username, password_hash, email, role, and profile data
- `volunteers` table: Volunteer registrations with personal details, skills, documents, and approval status
- `incidents` table: Emergency incident reports with location, severity, status, and assigned volunteers
- `inventory` table: Equipment and resource tracking with quantity, condition, location, and inspection dates
- `sessions` table: Express session persistence for authentication state

**Enums**
- `user_role`: volunteer | district_admin | department_admin | state_admin
- Incident status: reported | assigned | in_progress | resolved | closed
- Volunteer status: pending | approved | rejected
- Inventory category: medical_supplies | communication_equipment | rescue_equipment | vehicles | safety_gear | other
- Inventory condition: excellent | good | fair | poor | needs_repair

**Data Access Layer**
- Storage interface (`IStorage`) abstracts database operations
- Centralized storage implementation in `server/storage.ts`
- Query methods for filtering by status, district, and search criteria
- Bulk operations support for incident assignment to multiple volunteers

### External Dependencies

**Third-Party UI Libraries**
- Radix UI components (20+ primitives): accordion, alert-dialog, avatar, checkbox, dialog, dropdown-menu, select, tabs, toast, tooltip, etc.
- Lucide React for consistent iconography
- date-fns for date manipulation and formatting
- cmdk for command palette functionality

**Development Tools**
- Drizzle Kit for database schema migrations
- TSX for TypeScript execution in development
- ESBuild for production server bundling
- Replit-specific plugins: runtime error overlay, cartographer, dev banner

**Database & Storage**
- @neondatabase/serverless: PostgreSQL driver optimized for serverless/edge environments
- connect-pg-simple: PostgreSQL session store for express-session
- ws: WebSocket library for Neon database connections

**Authentication Libraries**
- passport: Authentication middleware framework
- passport-local: Local username/password strategy
- bcryptjs: Password hashing library
- express-session: Session management middleware

**Form & Validation**
- @hookform/resolvers: Validation resolver for React Hook Form
- zod: Schema validation library
- drizzle-zod: Automatic Zod schema generation from Drizzle schemas

**Build & Asset Management**
- Vite with React plugin and custom Replit plugins
- PostCSS with TailwindCSS and Autoprefixer
- Path aliases: `@/` for client source, `@shared/` for shared code, `@assets/` for static assets

**Deployment Considerations**
- Environment variables: DATABASE_URL (required), SESSION_SECRET (required for production)
- Build output: `dist/public` for frontend, `dist/index.js` for backend
- Production mode uses built assets, development uses Vite middleware
- Session cookie security flags adjust based on NODE_ENV

## Implemented Features

### Recent Updates (November 2025)

**Navigation Consistency**
- All admin dashboard pages now use `getAdminNavItems()` for unified navigation
- Constant role-based sidebar headers (e.g., "District Admin - Khordha", "Department Admin - Odisha")
- Removed page-specific title/subtitle props from DashboardLayout
- Role-based navigation with automatic scoping

**District Filtering for Department Admins**
- **Volunteers Page**: Added district filter dropdown for department/state admins
- **Incidents Page**: District filter dropdown available
- **Inventory Page**: District filter dropdown available
- **Tasks Page**: District filter dropdown available
- District admins automatically scoped to their district (no filter needed)
- Department/State admins must select district to view data

**CRUD Operations**
- **Incidents**: Full CRUD with edit/delete functionality, district-based filtering
- **Inventory**: Full CRUD with pagination (10 items per page), district-based filtering
- **Volunteers**: Create, view, approve/reject workflows with district filtering
- **Tasks/Assignments**: Individual task assignment per volunteer (not group assignments)

**Task Assignment Workflow**
- Each selected volunteer receives an individual task assignment
- UI clearly communicates this behavior in the assignment dialog
- District admins auto-scoped to their district
- Department/State admins must select district before creating assignments

**Data Seeding**
- **Volunteer Users**: 8 volunteer user accounts with login credentials (username: volunteer1-8, password: volunteer123)
- **Volunteer Registrations**: 8 volunteer registrations across multiple districts (5 approved, 3 pending)
- **Incidents**: 8 diverse incidents across multiple districts
- **Inventory**: 15 inventory items with varied categories and conditions
- All test users have password format: `{role}123` (e.g., volunteer123, district123, department123)

### Pending Features

**Training Management System** (Not Yet Implemented)
- **Status**: Feature not implemented. User has asked about this feature.
- **Planned Who Creates**: Both district admins and department/state admins
  - District admins: Create and manage local training sessions for their district
  - Department/State admins: Create statewide training sessions accessible across all districts
- **Planned Implementation Scope**:
  - New `trainings` table in database schema
  - CRUD endpoints in `server/routes.ts`
  - Storage methods in `server/storage.ts`
  - Dedicated admin page for training management
  - Volunteer interface to view and register for trainings
  - District filter support for department/state admins
- **Planned Schema Requirements**:
  - Training title, description, date/time, location
  - District association (specific district or "All Districts" for statewide)
  - Capacity limits and current enrollment
  - Skills/topics covered
  - Created by (admin user reference)
  - Registration tracking for volunteers

**NOTE**: This feature is in the roadmap but has not been developed yet. When user asks about "where is training creation", inform them it hasn't been implemented and is on the pending features list.

### Known Infrastructure Issues

**Neon Database Connection**
- Intermittent connection termination messages: `error: terminating connection due to administrator command`
- This is a Neon infrastructure behavior (auto-scaling, connection pooling)
- Application auto-reconnects automatically via Drizzle ORM connection pool
- No code changes required; connection recovery is handled transparently

### Architecture Notes

**District-Based Access Control**
- District admins: Automatically scoped to their assigned district
- Department admins: Must manually select district for creating incidents/inventory/tasks
- State admins: Full access across all 28-29 districts
- Filtering applied at query level via `useScopedData` hooks

**Navigation Pattern**
- All admin pages use `getAdminNavItems(role)` helper
- Consistent title/subtitle formatting based on role and district
- Sidebar navigation managed through shadcn/ui `<Sidebar>` component
- No residual references to deprecated `getNavigationItems`, `getDashboardTitle`, or `getDashboardSubtitle`