# Quick Reference Guide

Essential commands and configurations for the Laboratory Management System.

## 🚀 Quick Start Commands

### Development Setup

```bash
# Clone repository
git clone https://github.com/your-username/Laboratory-Management-App.git
cd Laboratory-Management-App

# Backend setup
cd backend
npm install
cp .env.example .env  # Configure environment variables
npm run dev

# Frontend setup (new terminal)
cd ../client
npm install
cp .env.example .env  # Configure environment variables
npm run dev
```

### Environment Variables

**Backend** (`.env`):

```bash
PORT=5000
MONGODB_URI=mongodb://localhost:27017/laboratory_management
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d
NODE_ENV=development
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

**Frontend** (`.env`):

```bash
VITE_API_URL=http://localhost:5000/api
NODE_ENV=development
```

## 📡 API Endpoints Quick Reference

### Authentication

```bash
# Register
POST /api/auth/register
Body: { name, email, password, role? }

# Login
POST /api/auth/login
Body: { email, password }

# Verify Token
GET /api/auth/verify
Headers: { Authorization: "Bearer <token>" }
```

### Instruments

```bash
# List All
GET /api/instruments?page=1&limit=10&search=term

# Get One
GET /api/instruments/:id

# Create (Admin)
POST /api/instruments
Content-Type: multipart/form-data

# Update (Admin)
PUT /api/instruments/:id

# Delete (Admin)
DELETE /api/instruments/:id

# Stats (Admin)
GET /api/instruments/:id/stats
```

### Usage

```bash
# Start Session
POST /api/usage/start
Body: { instrumentId, quantity? }

# Stop Session
POST /api/usage/stop
Body: { instrumentId, notes? }

# Force Stop (Admin)
POST /api/usage/force-stop
Body: { instrumentId, userId, reason? }

# Get Personal History
GET /api/usage/history/me?page=1&limit=10

# Get All History (Admin)
GET /api/usage/history/all?status=completed
```

### Users

```bash
# Get Profile
GET /api/users/profile

# Get All (Admin)
GET /api/users/all?page=1&limit=10

# Get By ID (Admin)
GET /api/users/:id

# Update Status (Admin)
PATCH /api/users/:id/status
Body: { isActive: true }

# Update Role (Admin)
PATCH /api/users/:id/role
Body: { role: "admin" }
```

## 🔑 Test Credentials (After Seeding)

```
Admin Account:
Email: admin@example.com
Password: admin123

User Account:
Email: user@example.com
Password: user123
```

## 🐛 Common Fixes

### Port in Use

```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>
```

### Clear Node Modules

```bash
rm -rf node_modules package-lock.json
npm install
```

### MongoDB Connection

```bash
# Check MongoDB status
mongod --version

# Start MongoDB
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

### Clear Browser Cache

```
Chrome: Ctrl+Shift+Del (Cmd+Shift+Del on Mac)
Select: Cached images and files
```

## 📦 NPM Scripts

### Backend

```bash
npm start          # Production server
npm run dev        # Development with nodemon
npm test           # Run tests
```

### Frontend

```bash
npm run dev        # Development server
npm run build      # Production build
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

## 🔒 Security Checklist

- [ ] Strong `JWT_SECRET` (64+ chars)
- [ ] Environment variables not in git
- [ ] CORS origins configured
- [ ] HTTPS in production
- [ ] Rate limiting enabled
- [ ] Input validation active
- [ ] Password hashing (bcrypt)
- [ ] MongoDB IP whitelist set
- [ ] File upload restrictions

## 🚢 Deployment URLs

**Production**:

- Frontend: https://laboratory-management-app.vercel.app
- Backend: https://laboratory-management-api.onrender.com
- Database: MongoDB Atlas

**Development**:

- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- Database: mongodb://localhost:27017

## 📊 Monitoring

### Check Health

```bash
# Backend health
curl http://localhost:5000/api/health

# Expected: {"status":"OK","timestamp":"..."}
```

### View Logs

```bash
# Backend (development)
# Check terminal where npm run dev is running

# Production
# Render: Dashboard → Service → Logs
# Vercel: Dashboard → Deployments → Function Logs
```

### MongoDB Monitoring

```bash
# Connect to MongoDB shell
mongosh

# Show databases
show dbs

# Use database
use laboratory_management

# Show collections
show collections

# Count documents
db.users.countDocuments()
db.instruments.countDocuments()
db.usagehistories.countDocuments()
```

## 🎨 Frontend Component Imports

```typescript
// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Dialog } from "@/components/ui/dialog";
import { Table } from "@/components/ui/table";

// Layout
import Layout from "@/components/Layout";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

// Auth
import { useAuth } from "@/hooks/useAuth";

// API
import { instrumentsApi } from "@/lib/instruments";
import { usageApi } from "@/lib/usage";
import { usersApi } from "@/lib/users";

// Notifications
import { toast } from "sonner";
```

## 🗄️ Database Queries

### MongoDB Shell Examples

```javascript
// Find all admins
db.users.find({ role: "admin" });

// Find available instruments
db.instruments.find({ status: "available" });

// Find active usage sessions
db.usagehistories.find({ status: "active" });

// Update instrument status
db.instruments.updateOne(
  { _id: ObjectId("...") },
  { $set: { status: "maintenance" } }
);

// Count instruments by category
db.instruments.aggregate([
  { $group: { _id: "$category", count: { $sum: 1 } } },
]);

// Get usage statistics
db.usagehistories.aggregate([
  { $match: { status: "completed" } },
  {
    $group: {
      _id: null,
      totalTime: { $sum: "$duration" },
      avgTime: { $avg: "$duration" },
      count: { $sum: 1 },
    },
  },
]);
```

## 🔄 Git Commands

```bash
# Create feature branch
git checkout -b feature/feature-name

# Stage changes
git add .

# Commit with message
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/feature-name

# Update from main
git checkout main
git pull origin main
git checkout feature/feature-name
git merge main

# Squash commits (before PR)
git rebase -i HEAD~3

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1
```

## 📝 Code Snippets

### Create Protected Route (Frontend)

```typescript
<ProtectedRoute>
  <YourComponent />
</ProtectedRoute>

// Admin only
<ProtectedRoute adminOnly>
  <AdminComponent />
</ProtectedRoute>
```

### API Call with Error Handling

```typescript
const handleSubmit = async () => {
  try {
    const data = await api.submitData(formData);
    toast.success("Success!");
    navigate("/success");
  } catch (error) {
    const message = error.response?.data?.message || "Error occurred";
    toast.error(message);
  }
};
```

### MongoDB Schema

```javascript
const schema = new mongoose.Schema(
  {
    field: {
      type: String,
      required: true,
      trim: true,
      default: "value",
    },
    reference: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ModelName",
    },
  },
  { timestamps: true }
);
```

### Express Route with Validation

```javascript
router.post(
  "/",
  auth,
  [
    body("field").notEmpty().withMessage("Required"),
    body("email").isEmail().withMessage("Invalid email"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Handle request
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);
```

## 🎯 Testing Checklist

### Manual Tests

- [ ] User registration
- [ ] User login/logout
- [ ] Browse instruments
- [ ] Start/stop usage
- [ ] Admin: Create instrument
- [ ] Admin: Edit instrument
- [ ] Admin: Delete instrument
- [ ] Admin: Manage users
- [ ] Admin: View usage history
- [ ] Search and filters
- [ ] Pagination
- [ ] Error messages
- [ ] Loading states
- [ ] Mobile responsive

### API Tests (cURL)

```bash
# Health check
curl http://localhost:5000/api/health

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# Get instruments (authenticated)
curl http://localhost:5000/api/instruments \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📞 Support Resources

- **Documentation**: `/docs` folder
- **API Reference**: `/docs/API_DOCUMENTATION.md`
- **Issues**: GitHub Issues
- **Stack Overflow**: Tag `laboratory-management`

## 🔗 Useful Links

- [GitHub Repository](https://github.com/your-username/Laboratory-Management-App)
- [Live Demo](https://laboratory-management-app.vercel.app)
- [API Documentation](./API_DOCUMENTATION.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Development Guide](./DEVELOPMENT_GUIDE.md)

---

**Pro Tip**: Bookmark this page for quick access during development!
