# DrugChain Frontend

React + TypeScript + Vite frontend application for DrugChain platform.

## Features

- ✅ User Authentication (Login/Register)
- ✅ Protected Routes
- ✅ Redux State Management
- ✅ Tailwind CSS Styling
- ✅ TypeScript Support
- ✅ API Integration with Backend

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
# Copy example env file
copy .env.example .env

# The .env file should contain:
VITE_API_URL=http://localhost:8000/api/v1
```

### 3. Start Development Server

```bash
npm run dev
```

The app will be available at http://localhost:3000

## Project Structure

```
src/
├── components/      # Reusable components
│   ├── Navbar.tsx
│   └── ProtectedRoute.tsx
├── pages/           # Page components
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   └── DashboardPage.tsx
├── services/        # API services
│   ├── api.ts
│   ├── authService.ts
│   └── productService.ts
├── store/           # Redux store
│   ├── index.ts
│   ├── hooks.ts
│   └── authSlice.ts
├── utils/           # Utility functions
├── App.tsx          # Main app component
└── main.tsx         # Entry point
```

## Available Routes

- `/login` - Login page
- `/register` - Registration page
- `/dashboard` - User dashboard (protected)
- `/products` - Products list (protected, manufacturers only)
- `/batches` - Batches list (protected, manufacturers only)

## Authentication Flow

1. User registers or logs in
2. JWT tokens stored in localStorage
3. Tokens automatically attached to API requests
4. Auto-refresh when access token expires
5. Redirect to login if refresh fails

## Building for Production

```bash
npm run build
```

## Technologies

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Redux Toolkit** - State management
- **React Router** - Routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
