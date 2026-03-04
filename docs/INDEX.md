# Documentation Index

Complete documentation for the Laboratory Management System.

## 📚 Documentation Structure

### 1. [README.md](../README.md)

**Main project overview and quick start guide**

- Project features and architecture
- Technology stack overview
- Quick installation guide
- Basic usage instructions
- Roadmap and contributing guidelines

### 2. [API Documentation](./API_DOCUMENTATION.md)

**Complete REST API reference**

- Authentication endpoints
- Instrument management endpoints
- Usage tracking endpoints
- User management endpoints
- Request/response examples
- Error handling
- Rate limiting details

### 3. [Frontend Documentation](./FRONTEND_DOCUMENTATION.md)

**React frontend architecture and components**

- Component structure and organization
- State management patterns
- Routing and navigation
- API integration
- TypeScript types and interfaces
- UI component library usage
- Form handling and validation
- Best practices and patterns

### 4. [Deployment Guide](./DEPLOYMENT_GUIDE.md)

**Production deployment instructions**

- MongoDB Atlas setup
- Backend deployment on Render
- Frontend deployment on Vercel
- Environment configuration
- CORS setup
- Continuous deployment
- Monitoring and scaling
- Backup strategies
- Security checklist

### 5. [Development Guide](./DEVELOPMENT_GUIDE.md)

**Local development setup and workflow**

- Prerequisites and installation
- Initial project setup
- Development workflow
- Code standards and conventions
- Git workflow and branching
- Testing strategies
- Debugging techniques
- Common development tasks
- Troubleshooting guide

## 🎯 Quick Links by Role

### For Developers (New Contributors)

1. Start with [Development Guide](./DEVELOPMENT_GUIDE.md) → Initial Setup
2. Review [Code Standards](./DEVELOPMENT_GUIDE.md#code-standards)
3. Learn the [Git Workflow](./DEVELOPMENT_GUIDE.md#git-workflow)
4. Understand [Frontend Architecture](./FRONTEND_DOCUMENTATION.md#core-concepts)
5. Familiarize with [API Endpoints](./API_DOCUMENTATION.md)

### For DevOps/Deployment

1. Follow [Deployment Guide](./DEPLOYMENT_GUIDE.md) step-by-step
2. Review [Security Checklist](./DEPLOYMENT_GUIDE.md#part-10-security-checklist)
3. Set up [Monitoring](./DEPLOYMENT_GUIDE.md#part-9-monitoring--alerts)
4. Plan [Backup Strategy](./DEPLOYMENT_GUIDE.md#part-8-backup--recovery)

### For API Consumers

1. Read [API Documentation](./API_DOCUMENTATION.md)
2. Check [Authentication Flow](./API_DOCUMENTATION.md#authentication)
3. Review [Error Handling](./API_DOCUMENTATION.md#error-handling)
4. Test with provided cURL examples

### For Frontend Developers

1. Study [Frontend Documentation](./FRONTEND_DOCUMENTATION.md)
2. Understand [Component Architecture](./FRONTEND_DOCUMENTATION.md#component-architecture)
3. Learn [State Management](./FRONTEND_DOCUMENTATION.md#state-management)
4. Review [TypeScript Types](./FRONTEND_DOCUMENTATION.md#typescript-types)

## 📋 Common Tasks

### Setting Up Development Environment

→ [Development Guide - Initial Setup](./DEVELOPMENT_GUIDE.md#initial-setup)

### Deploying to Production

→ [Deployment Guide - Full Walkthrough](./DEPLOYMENT_GUIDE.md)

### Adding New API Endpoint

→ [Development Guide - Add New API Endpoint](./DEVELOPMENT_GUIDE.md#add-new-api-endpoint)

### Creating New Component

→ [Frontend Documentation - Component Architecture](./FRONTEND_DOCUMENTATION.md#component-architecture)

### Debugging Issues

→ [Development Guide - Debugging](./DEVELOPMENT_GUIDE.md#debugging)

### Understanding Database Schema

→ [README - Database Schema](../README.md#database-schema)

## 🔍 Search Index

### Authentication & Authorization

- JWT token flow: [API Docs](./API_DOCUMENTATION.md#authentication)
- Auth context: [Frontend Docs](./FRONTEND_DOCUMENTATION.md#authcontext)
- Protected routes: [Frontend Docs](./FRONTEND_DOCUMENTATION.md#route-guards)
- User roles: [README](../README.md#authentication--authorization)

### API Integration

- Axios setup: [Frontend Docs](./FRONTEND_DOCUMENTATION.md#axios-configuration)
- API modules: [Frontend Docs](./FRONTEND_DOCUMENTATION.md#api-modules)
- Error handling: [API Docs](./API_DOCUMENTATION.md#error-handling)
- Rate limiting: [API Docs](./API_DOCUMENTATION.md#rate-limiting)

### Database

- MongoDB setup: [Deployment Guide](./DEPLOYMENT_GUIDE.md#part-1-database-setup-mongodb-atlas)
- Schema definitions: [README](../README.md#database-schema)
- Migrations: [Development Guide](./DEVELOPMENT_GUIDE.md#update-database-schema)
- Seeding data: [Development Guide](./DEVELOPMENT_GUIDE.md#seed-database-optional)

### Deployment

- Backend (Render): [Deployment Guide](./DEPLOYMENT_GUIDE.md#part-2-backend-deployment-render)
- Frontend (Vercel): [Deployment Guide](./DEPLOYMENT_GUIDE.md#part-3-frontend-deployment-vercel)
- Environment variables: [Deployment Guide](./DEPLOYMENT_GUIDE.md#part-6-environment-management)
- CORS configuration: [Deployment Guide](./DEPLOYMENT_GUIDE.md#update-backend-cors)

### Development

- Setup instructions: [Development Guide](./DEVELOPMENT_GUIDE.md#initial-setup)
- Code standards: [Development Guide](./DEVELOPMENT_GUIDE.md#code-standards)
- Git workflow: [Development Guide](./DEVELOPMENT_GUIDE.md#git-workflow)
- Testing: [Development Guide](./DEVELOPMENT_GUIDE.md#testing)

### Frontend

- Component structure: [Frontend Docs](./FRONTEND_DOCUMENTATION.md#component-architecture)
- State management: [Frontend Docs](./FRONTEND_DOCUMENTATION.md#state-management)
- Routing: [Frontend Docs](./FRONTEND_DOCUMENTATION.md#routing-system)
- UI components: [Frontend Docs](./FRONTEND_DOCUMENTATION.md#ui-component-library-shadcnui)

### Security

- Security features: [README](../README.md#security-features)
- Security checklist: [Deployment Guide](./DEPLOYMENT_GUIDE.md#part-10-security-checklist)
- CORS setup: [Deployment Guide](./DEPLOYMENT_GUIDE.md#update-backend-cors)
- JWT authentication: [API Docs](./API_DOCUMENTATION.md#authentication)

## 🛠️ Troubleshooting

### Common Issues

**CORS Errors**

- [Deployment Guide - Troubleshooting](./DEPLOYMENT_GUIDE.md#frontend-issues)
- [Development Guide - Troubleshooting](./DEVELOPMENT_GUIDE.md#cors-errors)

**Database Connection**

- [Deployment Guide - Database Issues](./DEPLOYMENT_GUIDE.md#database-issues)
- [Development Guide - MongoDB Connection Failed](./DEVELOPMENT_GUIDE.md#mongodb-connection-failed)

**Build Errors**

- [Frontend Docs - Troubleshooting](./FRONTEND_DOCUMENTATION.md#troubleshooting)
- [Development Guide - Module Not Found](./DEVELOPMENT_GUIDE.md#module-not-found)

**API Errors**

- [API Docs - Error Handling](./API_DOCUMENTATION.md#error-handling)
- [Deployment Guide - Backend Issues](./DEPLOYMENT_GUIDE.md#backend-issues)

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  React + TypeScript + Vite + Tailwind CSS + shadcn/ui      │
│  http://localhost:5173 (dev) / Vercel (prod)               │
└───────────────────┬─────────────────────────────────────────┘
                    │ HTTPS/REST API
                    │ JWT Authentication
┌───────────────────▼─────────────────────────────────────────┐
│                      Application Layer                       │
│  Node.js + Express + JWT + Multer + Helmet                  │
│  http://localhost:5000/api (dev) / Render (prod)           │
└───────────────────┬─────────────────────────────────────────┘
                    │ Mongoose ODM
┌───────────────────▼─────────────────────────────────────────┐
│                       Database Layer                         │
│  MongoDB (local) / MongoDB Atlas (cloud)                    │
│  Collections: users, instruments, usagehistories           │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Project Structure

```
Laboratory-Management-App/
├── README.md                    # Main documentation
├── docs/                        # Detailed documentation
│   ├── INDEX.md                # This file
│   ├── API_DOCUMENTATION.md    # API reference
│   ├── FRONTEND_DOCUMENTATION.md  # Frontend guide
│   ├── DEPLOYMENT_GUIDE.md     # Deployment instructions
│   └── DEVELOPMENT_GUIDE.md    # Development setup
├── backend/                     # Node.js + Express API
│   ├── server.js               # Application entry point
│   ├── models/                 # MongoDB schemas
│   ├── routes/                 # API endpoints
│   ├── middleware/             # Express middleware
│   └── uploads/                # File storage
└── client/                      # React + TypeScript frontend
    ├── src/
    │   ├── components/         # React components
    │   ├── pages/              # Page components
    │   ├── contexts/           # Context providers
    │   ├── lib/                # API clients & utilities
    │   └── types/              # TypeScript definitions
    └── public/                 # Static assets
```

## 🔗 External Resources

### Official Documentation

- [Node.js](https://nodejs.org/docs)
- [Express.js](https://expressjs.com)
- [MongoDB](https://docs.mongodb.com)
- [Mongoose](https://mongoosejs.com/docs)
- [React](https://react.dev)
- [TypeScript](https://www.typescriptlang.org/docs)
- [Vite](https://vitejs.dev/guide)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Deployment Platforms

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas](https://docs.atlas.mongodb.com)

### UI Libraries

- [Radix UI](https://www.radix-ui.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Lucide Icons](https://lucide.dev)
- [Sonner Toasts](https://sonner.emilkowal.ski)

## 💬 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/Laboratory-Management-App/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/Laboratory-Management-App/discussions)
- **Email**: your-email@example.com

## 📝 Contributing

See [Development Guide - Git Workflow](./DEVELOPMENT_GUIDE.md#git-workflow) for contribution guidelines.

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

---

**Last Updated**: January 4, 2026

**Documentation Version**: 1.0.0
