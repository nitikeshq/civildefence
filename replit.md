# Civil Defence Department Odisha - Volunteer Management System

## Overview

This project is a web-based volunteer management system for the Civil Defence Department, Government of Odisha. Its primary purpose is to streamline volunteer registration (for ex-servicemen and civilians), manage incident reporting, track inventory, and facilitate administrative approval workflows. The system aims to provide a robust, role-based access control environment for volunteers, district administrators, department administrators, and state administrators, contributing to efficient disaster management and civil defence operations in Odisha.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend is built with **React and TypeScript**, utilizing **Vite** for development and bundling. **shadcn/ui** (New York style) and **Radix UI** provide a consistent, accessible component library, styled with **TailwindCSS** and **Class Variance Authority (CVA)**. State management and data fetching are handled by **TanStack Query** and **React Hook Form** with Zod resolvers. The design adheres to **Government of India WCAG 2.0 Level AA compliance** and GIGW guidelines, featuring increased font sizes and bilingual readiness for English and Odia. The application includes distinct landing, dashboard, and specific functional pages for volunteer management, incident reporting, inventory, and approvals, with role-based content delivery.

### Backend Architecture

The backend is developed with **Express.js on Node.js**, also using **TypeScript** for type safety. It implements **session-based authentication** via `express-session` and **Passport.js Local Strategy** with `bcryptjs` for password hashing. **Role-based access control (RBAC)** is enforced through middleware for four distinct roles: volunteer, district_admin, department_admin, and state_admin. The API is **RESTful**, using `/api` prefix, standardized error handling, and `Zod` for shared client/server data validation.

### Data Storage

**PostgreSQL** serves as the primary relational database, accessed via **Neon serverless PostgreSQL driver** and **Drizzle ORM** for type-safe queries and migrations. The schema includes tables for `users`, `volunteers`, `incidents`, `inventory`, `sessions`, `trainings`, and various CMS components (`translations`, `hero_banners`, `site_settings`, `about_content`, `services`). Enums are used for roles, statuses, and categories. A centralized storage interface abstracts database operations, supporting filtering and bulk actions.

### System Design Choices & Features

- **CMS Manager System**: Full CRUD for 5 content types (translations, hero banners, site settings, about content, services) with frontend integration. Dynamic content updates without redeployment. Includes i18next multilingual support (English/Odia) and site settings context.
- **Training Management System**: Full CRUD for trainings, role-based filtering, and volunteer enrollment with capacity enforcement. Supports statewide and district-specific trainings.
- **District-Based Access Control**: District admins are scoped to their district; department and state admins have broader access with filtering capabilities.
- **CRUD Operations**: Comprehensive create, read, update, delete functionality for incidents, inventory, and volunteers, including approval workflows.
- **Task Assignment Workflow**: Individual task assignment to volunteers.
- **Data Seeding**: Extensive seed data for volunteers, incidents, inventory, and trainings across districts to facilitate development and testing.

## External Dependencies

### Third-Party UI Libraries
- **Radix UI**: Extensive collection of headless accessible components.
- **Lucide React**: Iconography library.
- **date-fns**: Date manipulation and formatting utility.
- **cmdk**: Command palette functionality.

### Development Tools
- **Drizzle Kit**: Database schema migrations.
- **TSX**: TypeScript execution in development.
- **ESBuild**: Production server bundling.
- **Replit-specific plugins**: Runtime error overlay, cartographer, dev banner.

### Database & Storage
- **@neondatabase/serverless**: PostgreSQL driver optimized for serverless/edge.
- **connect-pg-simple**: PostgreSQL session store for `express-session`.
- **ws**: WebSocket library (used by Neon driver).

### Authentication Libraries
- **passport**: Authentication middleware.
- **passport-local**: Local username/password strategy.
- **bcryptjs**: Password hashing.
- **express-session**: Session management.

### Form & Validation
- **@hookform/resolvers**: Validation resolver for React Hook Form.
- **zod**: Schema validation.
- **drizzle-zod**: Automatic Zod schema generation from Drizzle.

### Build & Asset Management
- **Vite**: Frontend build tool.
- **PostCSS** with **TailwindCSS** and **Autoprefixer**: CSS processing.