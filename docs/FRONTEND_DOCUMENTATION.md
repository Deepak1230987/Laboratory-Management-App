# Frontend Documentation

Complete documentation for the Laboratory Management System frontend application.

## Technology Stack

- **Framework**: React 19.1.0
- **Language**: TypeScript 5.8.3
- **Build Tool**: Vite 7.0.4
- **Styling**: Tailwind CSS 4.1.11
- **UI Components**: Radix UI (via shadcn/ui)
- **HTTP Client**: Axios 1.11.0
- **Routing**: React Router v7.7.1
- **Form Handling**: React Hook Form 7.61.1
- **Validation**: Zod 4.0.14
- **Notifications**: Sonner 2.0.6
- **Icons**: Lucide React 0.534.0
- **Date Handling**: date-fns 4.1.0

## Project Structure

```
client/src/
├── assets/              # Static assets (images, fonts)
├── components/          # Reusable React components
│   ├── ui/             # shadcn/ui base components
│   ├── Header.tsx      # Application header with nav
│   ├── Sidebar.tsx     # Navigation sidebar
│   ├── Layout.tsx      # Main layout wrapper
│   └── LoadingSpinner.tsx  # Loading indicator
├── contexts/           # React Context providers
│   ├── AuthContext.ts  # Context definition
│   ├── AuthContext.tsx # Auth provider implementation
│   └── index.ts        # Barrel export
├── hooks/              # Custom React hooks
│   └── useAuth.ts      # Auth context consumer hook
├── lib/                # Utility libraries
│   ├── api.ts          # Axios instance with interceptors
│   ├── auth.ts         # Authentication API calls
│   ├── instruments.ts  # Instrument API calls
│   ├── usage.ts        # Usage API calls
│   ├── users.ts        # User API calls
│   └── utils.ts        # Helper functions
├── pages/              # Page components (routes)
│   ├── LandingPage.tsx # Public landing page
│   ├── auth/           # Authentication pages
│   │   ├── LoginPage.tsx
│   │   └── RegisterPage.tsx
│   ├── user/           # User-facing pages
│   │   ├── Dashboard.tsx
│   │   ├── InstrumentList.tsx
│   │   ├── InstrumentDetail.tsx
│   │   └── Profile.tsx
│   └── admin/          # Admin-only pages
│       ├── Dashboard.tsx
│       ├── Instruments.tsx
│       ├── UsageHistory.tsx
│       └── Users.tsx
├── types/              # TypeScript type definitions
│   └── index.ts        # Shared interfaces
├── App.tsx             # Main app component with routing
├── main.tsx            # Application entry point
└── index.css           # Global styles
```

## Core Concepts

### 1. Authentication Flow

#### AuthContext

The application uses React Context for global authentication state management.

**Location**: `src/contexts/AuthContext.tsx`

**Provided Values**:

```typescript
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
}
```

**Usage**:

```tsx
import { useAuth } from "@/hooks/useAuth";

function MyComponent() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  return (
    <div>
      {isAuthenticated ? (
        <>
          <p>Welcome, {user?.name}</p>
          {isAdmin && <AdminPanel />}
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <p>Please log in</p>
      )}
    </div>
  );
}
```

**Implementation Details**:

- JWT token stored in `localStorage`
- Token automatically included in all API requests via Axios interceptor
- Auto-logout on 401 responses
- Token verification on app initialization

### 2. Routing System

#### Route Structure

```
/                          # Landing page
/login                     # Login page
/register                  # Registration page
/app                       # Protected route wrapper
  /dashboard               # User dashboard
  /instruments             # Instrument list
  /instruments/:id         # Instrument details
  /profile                 # User profile
  /admin/dashboard         # Admin dashboard
  /admin/instruments       # Instrument management
  /admin/users             # User management
  /admin/usage-history     # Usage history
```

#### Route Guards

**ProtectedRoute**: Requires authentication

```tsx
<ProtectedRoute>
  <UserDashboard />
</ProtectedRoute>
```

**ProtectedRoute (Admin)**: Requires admin role

```tsx
<ProtectedRoute adminOnly>
  <AdminDashboard />
</ProtectedRoute>
```

**PublicRoute**: Redirects to dashboard if authenticated

```tsx
<PublicRoute>
  <LoginPage />
</PublicRoute>
```

### 3. API Layer

#### Axios Configuration

**Location**: `src/lib/api.ts`

**Features**:

- Base URL from environment variable
- Request interceptor for JWT token injection
- Response interceptor for error handling
- Automatic logout on 401 responses

```typescript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatic token injection
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

#### API Modules

Each module exports functions for specific API operations:

**auth.ts**:

- `login(email, password)`: Authenticate user
- `register(data)`: Create new account
- `verify()`: Verify current token

**instruments.ts**:

- `getInstruments(params)`: Fetch instruments with filters
- `getInstrumentById(id)`: Get single instrument
- `createInstrument(data)`: Create instrument (admin)
- `updateInstrument(id, data)`: Update instrument (admin)
- `deleteInstrument(id)`: Delete instrument (admin)
- `getInstrumentStats(id)`: Get usage statistics (admin)

**usage.ts**:

- `startUsage(instrumentId, quantity)`: Begin session
- `stopUsage(instrumentId, notes)`: End session
- `forceStopUsage(data)`: Terminate session (admin)
- `getUserUsageHistory(params)`: Get personal history
- `getAllUsageHistory(params)`: Get all history (admin)

**users.ts**:

- `getUserProfile()`: Get current user profile
- `getAllUsers(params)`: Get all users (admin)
- `getUserById(id)`: Get user details (admin)
- `updateUserStatus(id, isActive)`: Activate/deactivate (admin)
- `updateUserRole(id, role)`: Change role (admin)

### 4. State Management

#### Local State

Component-level state using `useState` for UI-specific data.

#### Context State

Global authentication state via `AuthContext`.

#### Server State

API data cached and managed in components using:

- `useEffect` for data fetching
- Local state for caching
- Optimistic updates for better UX

**Example Pattern**:

```tsx
function InstrumentList() {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInstruments = async () => {
      try {
        setLoading(true);
        const data = await instrumentsApi.getInstruments({
          page: 1,
          limit: 10,
        });
        setInstruments(data.instruments);
      } catch (err) {
        setError("Failed to load instruments");
      } finally {
        setLoading(false);
      }
    };

    fetchInstruments();
  }, []);

  return (
    <div>
      {loading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} />}
      {instruments.map((instrument) => (
        <InstrumentCard key={instrument._id} instrument={instrument} />
      ))}
    </div>
  );
}
```

## Component Architecture

### UI Component Library (shadcn/ui)

Pre-built, accessible components based on Radix UI:

**Available Components**:

- `Button`: Action buttons with variants
- `Card`: Content containers
- `Dialog`: Modal dialogs
- `AlertDialog`: Confirmation dialogs
- `Input`: Form inputs
- `Label`: Form labels
- `Select`: Dropdown selectors
- `Table`: Data tables
- `Tabs`: Tab navigation
- `Textarea`: Multi-line inputs
- `Avatar`: User avatars
- `Badge`: Status badges
- `DropdownMenu`: Context menus

**Usage Example**:

```tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function MyForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Login</CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" />
        </div>
        <Button type="submit">Login</Button>
      </CardContent>
    </Card>
  );
}
```

### Layout Components

#### Layout

**Location**: `src/components/Layout.tsx`

Main application wrapper with header and sidebar navigation.

```tsx
<Layout>
  <Outlet /> {/* Nested routes render here */}
</Layout>
```

#### Header

**Location**: `src/components/Header.tsx`

Top navigation bar with user menu and notifications.

#### Sidebar

**Location**: `src/components/Sidebar.tsx`

Side navigation with role-based menu items.

### Page Components

#### User Pages

**Dashboard** (`pages/user/Dashboard.tsx`):

- Current usage sessions
- Quick stats
- Recent instruments

**InstrumentList** (`pages/user/InstrumentList.tsx`):

- Browse all instruments
- Search and filter
- Availability indicators
- Pagination

**InstrumentDetail** (`pages/user/InstrumentDetail.tsx`):

- Full instrument information
- Specifications table
- Start/stop usage buttons
- Current users list
- Usage history

**Profile** (`pages/user/Profile.tsx`):

- User information
- Usage statistics
- Active sessions
- History

#### Admin Pages

**Dashboard** (`pages/admin/Dashboard.tsx`):

- System-wide statistics
- Active sessions overview
- Recent activity
- Charts and graphs

**Instruments** (`pages/admin/Instruments.tsx`):

- Instrument management table
- Create new instrument
- Edit/delete operations
- Image upload
- Bulk actions

**Users** (`pages/admin/Users.tsx`):

- User management table
- Activate/deactivate users
- Change user roles
- View user statistics
- Search and filter

**UsageHistory** (`pages/admin/UsageHistory.tsx`):

- All usage records
- Advanced filtering
- Export functionality
- Force stop sessions
- Detailed analytics

## Form Handling

### React Hook Form + Zod

**Installation**:

```bash
npm install react-hook-form zod @hookform/resolvers
```

**Pattern**:

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await authApi.login(data.email, data.password);
      toast.success("Login successful");
    } catch (error) {
      toast.error("Login failed");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input {...register("email")} />
      {errors.email && <span>{errors.email.message}</span>}

      <Input type="password" {...register("password")} />
      {errors.password && <span>{errors.password.message}</span>}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Loading..." : "Login"}
      </Button>
    </form>
  );
}
```

## Styling Guide

### Tailwind CSS

**Configuration**: `tailwind.config.js`

**Common Patterns**:

```tsx
// Container
<div className="container mx-auto px-4">

// Card layout
<div className="bg-white rounded-lg shadow-md p-6">

// Flexbox centering
<div className="flex items-center justify-center">

// Grid layout
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Responsive text
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">

// Button variants
<button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded">
```

### CSS Variables

**Location**: `src/index.css`

Custom CSS variables for theming:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  /* ... more variables */
}
```

## Notifications

### Sonner Toast

**Usage**:

```tsx
import { toast } from "sonner";

// Success
toast.success("Instrument created successfully");

// Error
toast.error("Failed to create instrument");

// Info
toast.info("Session started");

// Loading
toast.loading("Processing...");

// Promise-based
toast.promise(apiCall(), {
  loading: "Saving...",
  success: "Saved successfully",
  error: "Failed to save",
});
```

**Setup** (in App.tsx):

```tsx
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <>
      <AppRoutes />
      <Toaster />
    </>
  );
}
```

## TypeScript Types

### Core Interfaces

**Location**: `src/types/index.ts`

```typescript
interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  isActive: boolean;
  currentlyUsing: CurrentUsage[];
  createdAt: string;
  updatedAt: string;
}

interface Instrument {
  _id: string;
  name: string;
  description: string;
  image?: string;
  quantity: number;
  availableQuantity: number;
  status: "available" | "unavailable" | "maintenance";
  specifications: Record<string, string>;
  category: string;
  location?: string;
  currentUsers: CurrentUser[];
  totalUsageTime: number;
  usageCount: number;
  isFullyOccupied: boolean;
  currentlyAvailable: number;
}

interface UsageHistory {
  _id: string;
  user: UserReference;
  instrument: InstrumentReference;
  startTime: string;
  endTime?: string;
  duration: number;
  quantity: number;
  status: "active" | "completed" | "terminated";
  notes?: string;
  terminatedBy?: UserReference;
  terminationReason?: string;
}
```

## Environment Variables

**Location**: `.env`

```bash
# API Base URL
VITE_API_URL=http://localhost:5000/api

# Environment
NODE_ENV=development
```

**Production** (`.env.production`):

```bash
VITE_API_URL=https://your-api.onrender.com/api
NODE_ENV=production
```

**Access in Code**:

```typescript
const apiUrl = import.meta.env.VITE_API_URL;
const isDev = import.meta.env.DEV;
const isProd = import.meta.env.PROD;
```

## Build & Development

### Development Server

```bash
npm run dev
# Runs on http://localhost:5173
```

### Production Build

```bash
npm run build
# Output: dist/
```

### Preview Production Build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

### Type Check

```bash
npx tsc --noEmit
```

## Best Practices

### 1. Component Organization

```tsx
// 1. Imports
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { instrumentsApi } from "@/lib/instruments";
import { Button } from "@/components/ui/button";
import type { Instrument } from "@/types";

// 2. Types/Interfaces
interface Props {
  onUpdate?: () => void;
}

// 3. Component
export default function InstrumentDetail({ onUpdate }: Props) {
  // 4. Hooks
  const { id } = useParams();
  const [instrument, setInstrument] = useState<Instrument | null>(null);

  // 5. Effects
  useEffect(() => {
    // ...
  }, [id]);

  // 6. Handlers
  const handleUpdate = async () => {
    // ...
  };

  // 7. Render
  return <div>{/* JSX */}</div>;
}
```

### 2. Error Handling

```tsx
try {
  const data = await api.getData();
  setData(data);
} catch (error) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message || "An error occurred";
    toast.error(message);
  } else {
    toast.error("Unexpected error");
  }
}
```

### 3. Loading States

```tsx
function Component() {
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    setLoading(true);
    try {
      await apiCall();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button disabled={loading}>{loading ? "Loading..." : "Submit"}</Button>
  );
}
```

### 4. Conditional Rendering

```tsx
// Early return for loading
if (loading) return <LoadingSpinner />;

// Early return for error
if (error) return <ErrorMessage message={error} />;

// Null check
if (!data) return null;

// Conditional JSX
return (
  <div>
    {isAdmin && <AdminPanel />}
    {items.length > 0 ? <ItemList items={items} /> : <EmptyState />}
  </div>
);
```

### 5. Performance Optimization

```tsx
import React, { memo, useCallback, useMemo } from "react";

// Memoize components
export const ExpensiveComponent = memo(({ data }) => {
  return <div>{/* render */}</div>;
});

// Memoize callbacks
const handleClick = useCallback(() => {
  // handler
}, [dependencies]);

// Memoize computed values
const filteredData = useMemo(() => {
  return data.filter((item) => item.active);
}, [data]);
```

## Troubleshooting

### Common Issues

**1. CORS Errors**

- Ensure backend `CORS_ALLOWED_ORIGINS` includes your frontend URL
- Check `VITE_API_URL` is correct

**2. 401 Unauthorized**

- Check token is stored in localStorage
- Verify token hasn't expired
- Check Authorization header is included

**3. Build Errors**

- Clear node_modules: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`
- Check TypeScript errors: `npx tsc --noEmit`

**4. Hot Reload Not Working**

- Restart dev server
- Check file watching limits (Linux)
- Update Vite config

## Testing (Future)

### Unit Tests (Jest + React Testing Library)

```typescript
import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/button";

test("renders button with text", () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText("Click me")).toBeInTheDocument();
});
```

### Integration Tests

```typescript
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "@/pages/auth/LoginPage";

test("logs in user successfully", async () => {
  render(<LoginPage />);

  await userEvent.type(screen.getByLabelText("Email"), "test@example.com");
  await userEvent.type(screen.getByLabelText("Password"), "password123");
  await userEvent.click(screen.getByRole("button", { name: "Login" }));

  await waitFor(() => {
    expect(screen.getByText("Welcome")).toBeInTheDocument();
  });
});
```

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Vite Guide](https://vitejs.dev/guide)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Radix UI Primitives](https://www.radix-ui.com)
- [React Hook Form](https://react-hook-form.com)
- [Zod Documentation](https://zod.dev)
