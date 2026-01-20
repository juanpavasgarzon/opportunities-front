# Job Opportunities Application

A comprehensive Next.js application with Tailwind CSS, i18n support, theme management, and admin functionality.

## Features

### ✅ Core Features
- **Next.js 16** with App Router
- **Tailwind CSS v4** for styling
- **Internationalization (i18n)** - English, Spanish, and Portuguese
- **Theme Management** - Light and Dark mode support
- **Route Protection** - Guest users cannot access admin pages
- **Responsive Design** - Mobile-friendly UI

### ✅ Components
- **Header** - Logo, theme toggle, language selector, login/logout
- **Button** - Multiple variants (primary, secondary, danger, outline)
- **Input/Field** - Form inputs with validation
- **Alert/Notification** - Success, error, warning, and info alerts
- **DataTable** - Paginated, sortable data table with actions
- **AdminNavbar** - Navigation for admin sections

### ✅ Pages

#### Public Pages
- **Home Page (`/`)** - Job opportunities table with search and apply functionality
- **Login Page (`/login`)** - Authentication page

#### Admin Pages (Protected)
- **Users Management (`/admin/users`)** - Only accessible by owners
  - View users list
  - Inactivate/Activate users
  - Reset password functionality
  
- **Opportunities Management (`/admin/opportunities`)** - Accessible by owners and admins
  - View job opportunities table
  - Create new opportunities
  - Edit existing opportunities
  - Delete opportunities
  
- **Settings (`/admin/settings`)** - Accessible by owners and admins
  - Logo configuration (upload and display)
  - Email configuration (recipients, CC, BCC)

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

## Authentication

### Mock Users

The application includes mock authentication. Use these credentials to login:

- **Owner Account:**
  - Email: `owner@example.com`
  - Password: `password`

- **Admin Account:**
  - Email: `admin@example.com`
  - Password: `password`

### Roles

- **Owner** - Full access to all admin features including user management
- **Admin** - Access to opportunities and settings management (no user management)
- **Guest** - Public access only, cannot access admin pages

## Project Structure

```
/app
  /[locale]              # Locale-based routing
    /page.tsx           # Home page with job opportunities
    /login              # Login page
    /admin              # Admin section
      /users            # User management (owner only)
      /opportunities    # Opportunities management
      /settings         # Settings configuration
/components
  /ui                   # Reusable UI components
  /layout               # Layout components (Header, AdminNavbar)
  /auth                 # Authentication components
  /providers            # Context providers
/lib
  /auth.ts              # Authentication utilities
  /mockData.ts          # Mock data generators
/messages               # i18n translation files
  /en.json
  /es.json
  /pt.json
```

## Technologies Used

- **Next.js 16.1.3** - React framework
- **React 19.2.3** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **next-intl** - Internationalization
- **next-themes** - Theme management
- **lucide-react** - Icons

## Features in Detail

### Internationalization
- Three languages supported: English (en), Spanish (es), Portuguese (pt)
- Language switcher in header
- All UI text is translatable

### Theme Management
- Light and Dark mode
- System preference detection
- Theme toggle in header
- Persistent theme selection

### Data Table
- Pagination support
- Column sorting
- Search functionality
- Custom action buttons per row
- Responsive design

### Route Protection
- Client-side route protection
- Role-based access control
- Automatic redirect to login for unauthorized users

## Mock Data

The application uses mock data generated locally. Job opportunities and users are created with realistic sample data for development and testing purposes.

## Notes

- Authentication is currently mocked using localStorage
- Logo configuration is stored in localStorage
- Email configuration is stored in localStorage
- In production, these should be replaced with proper backend APIs

## License

Private project
