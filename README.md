# Dorm Booking Admin Dashboard

A modern, professional admin dashboard for managing a Dormitory Booking System. Built with Vite, React, TypeScript, TailwindCSS, shadcn/ui, and lucide-react icons.

## 🚀 Features

### Authentication
- **Login Page**: Secure login with email & password, "Remember me" checkbox, and forgot password link
- **Registration Page**: New admin registration with validation
- Responsive layout with dormitory-themed background illustration

### Dashboard Overview
- System statistics: total users, rooms, bookings, revenue, reviews
- Visual metrics with lucide-react icons
- Charts for occupancy rate, monthly bookings, and payment trends (using Recharts)

### User Management
- Table of all registered users (students and admins)
- Search, filter, and pagination capabilities
- CRUD operations with modal for editing user details
- Status indicators and role badges

### Booking Management
- Table showing all bookings with student info, room, dates, payment & booking status
- Filter by status or date range
- Approve/reject booking functionality
- Real-time status updates

### Payment Management
- Transaction list with payment ID, user, amount, method (MOMO, VNPay, etc.), and status
- Summary charts for monthly revenue
- Detailed transaction view with modal

### Review & Feedback Management
- Table of student reviews with ratings (1–5 stars) and comments
- Toggle visibility for inappropriate reviews
- Search and filter by rating or visibility status

### Settings Page
- Admin profile section (change name, email, password)
- System configurations: dorm capacity limits, payment gateway keys
- Dark/light mode toggle using shadcn/ui components

### Navigation Layout
- Responsive sidebar with icons for all sections
- Collapsible sidebar for mobile view
- Top bar with search, notifications, and admin avatar dropdown

## 🛠️ Tech Stack

- **Framework**: Vite + React
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI Components**: shadcn/ui
- **Icons**: lucide-react
- **Charts**: Recharts
- **Routing**: React Router DOM

## 📦 Installation

```bash
cd UI-admin
npm install
```

## 🎨 Design Features

- **Colors**: Soft blue, gray, and white color palette
- **Typography**: Clear, professional typography
- **Shadows**: Light, subtle shadows for depth
- **Corners**: Rounded corners (rounded-2xl)
- **Icons**: Comprehensive use of lucide-react icons
- **Responsive**: Mobile-first, fully responsive design
- **Dark Mode**: Toggle between light and dark themes

## 🚦 Getting Started

### Development

```bash
npm run dev
```

The app will run on `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

## 📁 Project Structure

```
UI-admin/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   └── layout/          # Layout components
│   ├── pages/
│   │   ├── auth/            # Login, Register pages
│   │   ├── dashboard/       # Dashboard page
│   │   ├── users/           # User management
│   │   ├── bookings/        # Booking management
│   │   ├── payments/        # Payment management
│   │   ├── reviews/         # Review management
│   │   └── settings/        # Settings page
│   ├── types/               # TypeScript types
│   ├── lib/                 # Utility functions
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## 🎯 Key Components

### shadcn/ui Components Used
- `Button` - For all interactive elements
- `Input` - Form inputs
- `Card` - Content containers
- `Dialog` - Modals for CRUD operations
- `Checkbox` - Toggle options
- `Switch` - Settings toggles
- `Label` - Form labels
- `Avatar` - User avatars
- `DropdownMenu` - User menu

### Lucide Icons Used
- `Home`, `Users`, `Calendar`, `CreditCard` - Navigation icons
- `Settings`, `LogOut` - Action icons
- `Search`, `Filter` - Filter icons
- `Eye`, `EyeOff` - Visibility toggles
- `CheckCircle`, `XCircle` - Status icons
- `Moon`, `Sun` - Theme toggles

## 🎨 Pages Included

1. **Login Page** (`/login`)
2. **Register Page** (`/register`)
3. **Dashboard** (`/dashboard`)
4. **Users** (`/users`)
5. **Bookings** (`/bookings`)
6. **Payments** (`/payments`)
7. **Reviews** (`/reviews`)
8. **Settings** (`/settings`)

## 🔧 Configuration

### Environment Variables

Create a `.env` file for environment-specific configurations:

```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Dorm Booking System
```

## 📝 Notes

- All pages are fully responsive
- Mock data is used for demonstration purposes
- In production, connect to actual backend APIs
- Authentication should be implemented with proper JWT tokens
- Add proper error handling and loading states

## 🤝 Contributing

This is a complete admin dashboard implementation ready for integration with backend services.

## 📄 License

This project is part of the Dorm Booking System.
