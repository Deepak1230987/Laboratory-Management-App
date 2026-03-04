# Development Guide

Complete guide for setting up and contributing to the Laboratory Management System.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Development Workflow](#development-workflow)
4. [Code Standards](#code-standards)
5. [Git Workflow](#git-workflow)
6. [Testing](#testing)
7. [Debugging](#debugging)
8. [Common Tasks](#common-tasks)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- **Node.js**: v16.x or higher (v20.x recommended)
- **npm**: v8.x or higher
- **MongoDB**: v6.x or higher (local or Atlas)
- **Git**: Latest version
- **Code Editor**: VS Code recommended

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "mongodb.mongodb-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "github.copilot",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

### Install Node.js

**Windows**:

```powershell
# Using Chocolatey
choco install nodejs

# Or download from nodejs.org
```

**macOS**:

```bash
# Using Homebrew
brew install node

# Or download from nodejs.org
```

**Linux**:

```bash
# Using apt (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Using yum (CentOS/RHEL)
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs
```

### Install MongoDB

**Local Installation**:

**Windows**:

```powershell
choco install mongodb
```

**macOS**:

```bash
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0
```

**Linux**:

```bash
# Ubuntu
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

**Cloud Option** (Recommended for development):

- Use MongoDB Atlas free tier (M0)
- See [Deployment Guide](./DEPLOYMENT_GUIDE.md#part-1-database-setup-mongodb-atlas)

---

## Initial Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-username/Laboratory-Management-App.git
cd Laboratory-Management-App
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << 'EOL'
PORT=5000
MONGODB_URI=mongodb://localhost:27017/laboratory_management
JWT_SECRET=dev_secret_key_change_in_production
JWT_EXPIRES_IN=7d
NODE_ENV=development
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
EOL

# Start development server
npm run dev
```

### 3. Frontend Setup

```bash
cd ../client

# Install dependencies
npm install

# Create .env file
cat > .env << 'EOL'
VITE_API_URL=http://localhost:5000/api
NODE_ENV=development
EOL

# Start development server
npm run dev
```

### 4. Seed Database (Optional)

Create initial data for testing:

```bash
# Create seed script: backend/scripts/seed.js
mkdir backend/scripts
```

**backend/scripts/seed.js**:

```javascript
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("../models/User");
const Instrument = require("../models/Instrument");

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await Instrument.deleteMany({});
    console.log("Cleared existing data");

    // Create admin user
    const adminPassword = await bcrypt.hash("admin123", 12);
    const admin = await User.create({
      name: "Admin User",
      email: "admin@example.com",
      password: adminPassword,
      role: "admin",
      isActive: true,
    });
    console.log("Created admin user:", admin.email);

    // Create test user
    const userPassword = await bcrypt.hash("user123", 12);
    const user = await User.create({
      name: "Test User",
      email: "user@example.com",
      password: userPassword,
      role: "user",
      isActive: true,
    });
    console.log("Created test user:", user.email);

    // Create sample instruments
    const instruments = await Instrument.insertMany([
      {
        name: "Digital Microscope DM-100",
        description:
          "High-resolution digital microscope with 4K camera and LED illumination",
        quantity: 5,
        availableQuantity: 5,
        category: "Microscopy",
        status: "available",
        location: "Lab Room 101",
        specifications: {
          magnification: "40x-1000x",
          resolution: "4K",
          illumination: "LED",
          camera: "8MP",
        },
      },
      {
        name: "Centrifuge CF-200",
        description: "High-speed refrigerated centrifuge with digital controls",
        quantity: 3,
        availableQuantity: 3,
        category: "Centrifugation",
        status: "available",
        location: "Lab Room 102",
        specifications: {
          maxSpeed: "15000 RPM",
          capacity: "24 tubes",
          temperature: "4°C to 40°C",
        },
      },
      {
        name: "PCR Thermal Cycler TC-500",
        description: "Programmable thermal cycler for PCR applications",
        quantity: 2,
        availableQuantity: 2,
        category: "Molecular Biology",
        status: "available",
        location: "Lab Room 103",
        specifications: {
          blockFormat: "96-well",
          rampRate: "3°C/s",
          temperature: "4°C to 100°C",
        },
      },
      {
        name: "Spectrophotometer SP-300",
        description: "UV-Vis spectrophotometer for quantitative analysis",
        quantity: 4,
        availableQuantity: 4,
        category: "Spectroscopy",
        status: "available",
        location: "Lab Room 101",
        specifications: {
          wavelength: "190-1100 nm",
          bandwidth: "2 nm",
          accuracy: "±0.5 nm",
        },
      },
    ]);
    console.log(`Created ${instruments.length} instruments`);

    console.log("\nSeed data created successfully!");
    console.log("Login credentials:");
    console.log("Admin - email: admin@example.com, password: admin123");
    console.log("User - email: user@example.com, password: user123");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
};

seedData();
```

Run seed script:

```bash
cd backend
node scripts/seed.js
```

### 5. Verify Installation

**Backend**:

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Expected response:
# {"status":"OK","timestamp":"2026-01-04T10:30:00.000Z"}
```

**Frontend**:

- Open http://localhost:5173
- Should see landing page
- Try logging in with seeded credentials

---

## Development Workflow

### Daily Workflow

1. **Pull latest changes**:

   ```bash
   git checkout main
   git pull origin main
   ```

2. **Create feature branch**:

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Start development servers**:

   ```bash
   # Terminal 1: Backend
   cd backend
   npm run dev

   # Terminal 2: Frontend
   cd client
   npm run dev

   # Terminal 3: MongoDB (if local)
   mongod
   ```

4. **Make changes**:

   - Edit code in your editor
   - Hot reload automatically updates
   - Check console for errors

5. **Test changes**:

   - Test in browser
   - Check API responses
   - Verify database changes

6. **Commit changes**:

   ```bash
   git add .
   git commit -m "feat: add new feature"
   git push origin feature/your-feature-name
   ```

7. **Create Pull Request**:
   - Go to GitHub repository
   - Click "New Pull Request"
   - Describe changes
   - Request review

### Hot Reload

**Backend** (nodemon):

- Watches: `*.js` files
- Auto-restarts on file changes
- Logs: `[nodemon] restarting due to changes...`

**Frontend** (Vite):

- Hot Module Replacement (HMR)
- Instant updates in browser
- Preserves component state

---

## Code Standards

### JavaScript/TypeScript

**Style Guide**: Follow Airbnb style guide

**ESLint Configuration**:

**backend/.eslintrc.json**:

```json
{
  "env": {
    "node": true,
    "es2021": true
  },
  "extends": "eslint:recommended",
  "parserOptions": {
    "ecmaVersion": 12
  },
  "rules": {
    "indent": ["error", 2],
    "quotes": ["error", "single"],
    "semi": ["error", "always"],
    "no-console": "off",
    "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }]
  }
}
```

**client/.eslintrc.json**:

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2021,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "rules": {
    "react/react-in-jsx-scope": "off",
    "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }]
  }
}
```

### Naming Conventions

**Files**:

- Components: `PascalCase.tsx` (e.g., `UserProfile.tsx`)
- Utilities: `camelCase.ts` (e.g., `formatDate.ts`)
- Constants: `UPPER_SNAKE_CASE.ts` (e.g., `API_ENDPOINTS.ts`)

**Variables**:

```javascript
// Bad
const UserName = "John";
const user_age = 25;

// Good
const userName = "John";
const userAge = 25;
const USER_ROLE = "admin"; // constants
```

**Functions**:

```javascript
// Bad
function get_user() {}
function GetUser() {}

// Good
function getUser() {}
function fetchUserData() {}
```

**Components**:

```tsx
// Bad
function userProfile() {}
function user_profile() {}

// Good
function UserProfile() {}
export default UserProfile;
```

**Interfaces/Types**:

```typescript
// Bad
type user = { name: string };
interface userdata {}

// Good
interface User {
  name: string;
  email: string;
}

type UserRole = "admin" | "user";
```

### Code Formatting

**Prettier Configuration** (`.prettierrc`):

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
```

**Format on Save** (VS Code):

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

### Comments

**Good Comments**:

```javascript
// Calculate total usage time in minutes
const totalMinutes = sessions.reduce(
  (sum, session) => sum + session.duration,
  0
);

// TODO: Implement email notification
// FIXME: Handle edge case when quantity is 0
// NOTE: This endpoint is rate-limited
```

**Bad Comments**:

```javascript
// Set x to 5
const x = 5;

// Loop through array
for (let i = 0; i < arr.length; i++) {}
```

### Error Handling

**Backend**:

```javascript
// Bad
try {
  const data = await fetchData();
  res.json(data);
} catch (error) {
  res.status(500).json({ message: "Error" });
}

// Good
try {
  const data = await fetchData();
  res.json(data);
} catch (error) {
  console.error("Fetch data error:", error);
  res.status(500).json({
    message: "Failed to fetch data",
    error: process.env.NODE_ENV === "development" ? error.message : undefined,
  });
}
```

**Frontend**:

```typescript
// Bad
const handleSubmit = async () => {
  await api.submitData(data);
};

// Good
const handleSubmit = async () => {
  try {
    await api.submitData(data);
    toast.success("Data submitted successfully");
  } catch (error) {
    const message = error.response?.data?.message || "Failed to submit data";
    toast.error(message);
    console.error("Submit error:", error);
  }
};
```

---

## Git Workflow

### Branching Strategy

**Main Branches**:

- `main`: Production-ready code
- `develop`: Development branch (optional)

**Feature Branches**:

- `feature/feature-name`: New features
- `fix/bug-name`: Bug fixes
- `refactor/component-name`: Code refactoring
- `docs/update-name`: Documentation updates

### Commit Messages

Follow Conventional Commits:

**Format**:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Tests
- `chore`: Maintenance

**Examples**:

```bash
git commit -m "feat(instruments): add image upload functionality"
git commit -m "fix(auth): resolve token expiration issue"
git commit -m "docs(api): update endpoint documentation"
git commit -m "refactor(usage): simplify start/stop logic"
```

### Pull Request Process

1. **Create PR**:

   - Descriptive title
   - List changes
   - Add screenshots (for UI changes)
   - Link related issues

2. **PR Template**:

   ```markdown
   ## Description

   Brief description of changes

   ## Type of Change

   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing

   - [ ] Tested locally
   - [ ] Added/updated tests
   - [ ] All tests passing

   ## Screenshots (if applicable)

   [Add screenshots]

   ## Checklist

   - [ ] Code follows project style
   - [ ] Self-reviewed code
   - [ ] Commented complex code
   - [ ] Updated documentation
   - [ ] No new warnings
   ```

3. **Code Review**:

   - Address reviewer comments
   - Make requested changes
   - Re-request review

4. **Merge**:
   - Squash and merge (default)
   - Delete branch after merge

---

## Testing

### Manual Testing Checklist

**Authentication**:

- [ ] Register new user
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Logout
- [ ] Token persistence
- [ ] Protected route access

**Instruments** (User):

- [ ] View instrument list
- [ ] Search instruments
- [ ] Filter by category
- [ ] View instrument details
- [ ] Start using instrument
- [ ] Stop using instrument

**Instruments** (Admin):

- [ ] Create instrument
- [ ] Upload instrument image
- [ ] Update instrument
- [ ] Delete instrument (not in use)
- [ ] Cannot delete (in use)

**Users** (Admin):

- [ ] View all users
- [ ] Search users
- [ ] Activate/deactivate user
- [ ] Change user role
- [ ] Cannot demote self

**Usage Tracking**:

- [ ] Start session creates history
- [ ] Stop session updates history
- [ ] Force stop (admin)
- [ ] View personal history
- [ ] View all history (admin)

### API Testing with Postman

1. **Import Collection**:
   Create `postman_collection.json`:

   ```json
   {
     "info": {
       "name": "Laboratory Management API",
       "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
     },
     "item": [
       {
         "name": "Auth",
         "item": [
           {
             "name": "Register",
             "request": {
               "method": "POST",
               "url": "{{baseUrl}}/auth/register",
               "body": {
                 "mode": "raw",
                 "raw": "{\n  \"name\": \"Test User\",\n  \"email\": \"test@example.com\",\n  \"password\": \"password123\"\n}"
               }
             }
           }
         ]
       }
     ]
   }
   ```

2. **Set Environment**:

   - Variable: `baseUrl`
   - Value: `http://localhost:5000/api`

3. **Test Endpoints**:
   - Run collection
   - Check status codes
   - Verify responses

---

## Debugging

### Backend Debugging

**VS Code Launch Configuration** (`.vscode/launch.json`):

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/backend/server.js",
      "envFile": "${workspaceFolder}/backend/.env",
      "console": "integratedTerminal"
    }
  ]
}
```

**Debug with Breakpoints**:

1. Open backend file
2. Click left gutter to set breakpoint
3. Press F5 to start debugging
4. Make API request
5. Execution stops at breakpoint

**Console Logging**:

```javascript
// Log with context
console.log("User login:", { email, timestamp: new Date() });

// Log errors
console.error("Database error:", error);

// Log warnings
console.warn("Deprecated endpoint called");
```

### Frontend Debugging

**React DevTools**:

1. Install extension: Chrome/Firefox
2. Open DevTools → Components tab
3. Inspect component tree
4. View props and state
5. Track re-renders

**Network Debugging**:

1. Open DevTools → Network tab
2. Filter: XHR
3. Inspect requests/responses
4. Check headers
5. View timing

**Console Debugging**:

```typescript
// Component mounting
useEffect(() => {
  console.log("Component mounted", { props });
  return () => console.log("Component unmounted");
}, []);

// State changes
useEffect(() => {
  console.log("State changed:", state);
}, [state]);
```

---

## Common Tasks

### Add New API Endpoint

1. **Define Route** (`backend/routes/instruments.js`):

   ```javascript
   router.get("/categories", auth, async (req, res) => {
     try {
       const categories = await Instrument.distinct("category");
       res.json({ categories });
     } catch (error) {
       console.error("Get categories error:", error);
       res.status(500).json({ message: "Server error" });
     }
   });
   ```

2. **Add API Client** (`client/src/lib/instruments.ts`):

   ```typescript
   export const getCategories = async (): Promise<string[]> => {
     const response = await api.get("/instruments/categories");
     return response.data.categories;
   };
   ```

3. **Use in Component**:

   ```typescript
   const [categories, setCategories] = useState<string[]>([]);

   useEffect(() => {
     const fetchCategories = async () => {
       const data = await instrumentsApi.getCategories();
       setCategories(data);
     };
     fetchCategories();
   }, []);
   ```

### Add New Page

1. **Create Component** (`client/src/pages/user/NewPage.tsx`):

   ```typescript
   export default function NewPage() {
     return (
       <div>
         <h1>New Page</h1>
       </div>
     );
   }
   ```

2. **Add Route** (`client/src/App.tsx`):

   ```typescript
   <Route path="new-page" element={<NewPage />} />
   ```

3. **Add Navigation** (`client/src/components/Sidebar.tsx`):
   ```typescript
   <Link to="/app/new-page">New Page</Link>
   ```

### Update Database Schema

1. **Modify Model** (`backend/models/Instrument.js`):

   ```javascript
   manufacturer: {
     type: String,
     default: null
   }
   ```

2. **Update TypeScript Types** (`client/src/types/index.ts`):

   ```typescript
   interface Instrument {
     // ... existing fields
     manufacturer?: string;
   }
   ```

3. **Migrate Existing Data** (if needed):
   ```javascript
   await Instrument.updateMany(
     { manufacturer: { $exists: false } },
     { $set: { manufacturer: null } }
   );
   ```

---

## Troubleshooting

### Common Issues

**Port Already in Use**:

```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>
```

**MongoDB Connection Failed**:

```bash
# Check MongoDB is running
mongod --version

# Start MongoDB
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

**CORS Errors**:

- Check `CORS_ALLOWED_ORIGINS` in backend `.env`
- Verify frontend `VITE_API_URL` is correct
- Restart both servers

**Module Not Found**:

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## Resources

- [Node.js Docs](https://nodejs.org/docs)
- [Express Guide](https://expressjs.com/en/guide)
- [MongoDB Manual](https://docs.mongodb.com/manual)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## Getting Help

- Create GitHub Issue
- Check existing documentation
- Search Stack Overflow
- Ask in project chat/Discord
