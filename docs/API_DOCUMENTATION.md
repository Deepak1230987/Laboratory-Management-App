# API Documentation

Complete REST API documentation for the Laboratory Management System.

## Base URL

- Development: `http://localhost:5000/api`
- Production: `https://laboratory-management-app.onrender.com/api`

## Authentication

All endpoints except login and register require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Token Structure

```json
{
  "userId": "507f1f77bcf86cd799439011",
  "role": "admin",
  "iat": 1640000000,
  "exp": 1640604800
}
```

## Response Format

### Success Response

```json
{
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response

```json
{
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### Pagination Response

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Authentication Endpoints

### Register User

Register a new user account.

**Endpoint**: `POST /auth/register`

**Access**: Public

**Request Body**:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
```

**Validation Rules**:

- `name`: minimum 2 characters
- `email`: valid email format
- `password`: minimum 6 characters
- `role`: optional, must be "admin" or "user" (default: "user")

**Success Response** (201):

```json
{
  "message": "User created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "isActive": true,
    "currentlyUsing": [],
    "createdAt": "2026-01-04T10:30:00.000Z",
    "updatedAt": "2026-01-04T10:30:00.000Z"
  }
}
```

**Error Response** (400):

```json
{
  "message": "User already exists with this email"
}
```

---

### Login User

Authenticate a user and receive a JWT token.

**Endpoint**: `POST /auth/login`

**Access**: Public

**Request Body**:

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response** (200):

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "isActive": true,
    "currentlyUsing": []
  }
}
```

**Error Responses**:

- `400`: Invalid credentials
- `400`: Account is deactivated

---

### Verify Token

Verify the current JWT token and get user information.

**Endpoint**: `GET /auth/verify`

**Access**: Authenticated

**Headers**:

```
Authorization: Bearer <token>
```

**Success Response** (200):

```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "isActive": true
  }
}
```

---

## Instrument Endpoints

### List All Instruments

Get a paginated list of instruments with optional filters.

**Endpoint**: `GET /instruments`

**Access**: Authenticated

**Query Parameters**:

- `page` (number, default: 1): Page number
- `limit` (number, default: 10): Items per page
- `category` (string): Filter by category
- `status` (string): Filter by status (available, unavailable, maintenance)
- `search` (string): Search in name, description, or category

**Example Request**:

```
GET /instruments?page=1&limit=10&category=Microscope&search=digital
```

**Success Response** (200):

```json
{
  "instruments": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Digital Microscope X100",
      "description": "High-resolution digital microscope with 4K camera",
      "image": "/uploads/microscope-1234567890.jpg",
      "quantity": 5,
      "availableQuantity": 3,
      "manualGuide": "https://example.com/manual.pdf",
      "status": "available",
      "specifications": {
        "magnification": "40x-1000x",
        "resolution": "4K",
        "illumination": "LED"
      },
      "category": "Microscope",
      "location": "Lab Room 101",
      "currentUsers": [
        {
          "user": {
            "_id": "507f1f77bcf86cd799439022",
            "name": "Jane Smith",
            "email": "jane@example.com"
          },
          "startTime": "2026-01-04T09:00:00.000Z",
          "quantity": 2
        }
      ],
      "totalUsageTime": 1200,
      "usageCount": 45,
      "isFullyOccupied": false,
      "currentlyAvailable": 3,
      "createdAt": "2026-01-01T10:00:00.000Z",
      "updatedAt": "2026-01-04T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

---

### Get Instrument by ID

Get detailed information about a specific instrument.

**Endpoint**: `GET /instruments/:id`

**Access**: Authenticated

**URL Parameters**:

- `id` (string): MongoDB ObjectId of the instrument

**Success Response** (200):

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Digital Microscope X100",
  "description": "High-resolution digital microscope",
  "image": "/uploads/microscope-1234567890.jpg",
  "quantity": 5,
  "availableQuantity": 3,
  "manualGuide": "https://example.com/manual.pdf",
  "status": "available",
  "specifications": {
    "magnification": "40x-1000x",
    "resolution": "4K"
  },
  "category": "Microscope",
  "location": "Lab Room 101",
  "currentUsers": [],
  "totalUsageTime": 1200,
  "usageCount": 45,
  "createdAt": "2026-01-01T10:00:00.000Z",
  "updatedAt": "2026-01-04T10:30:00.000Z"
}
```

**Error Response** (404):

```json
{
  "message": "Instrument not found"
}
```

---

### Create Instrument

Create a new laboratory instrument.

**Endpoint**: `POST /instruments`

**Access**: Admin only

**Content-Type**: `multipart/form-data`

**Form Fields**:

- `name` (string, required): Instrument name
- `description` (string, required): Detailed description
- `quantity` (number, required): Total quantity (minimum 1)
- `category` (string, required): Category name
- `location` (string, optional): Physical location
- `manualGuide` (string, optional): URL to manual
- `status` (string, optional): Status (default: "available")
- `specifications` (string, optional): JSON string of key-value pairs
- `image` (file, optional): Instrument image (JPEG, PNG, max 5MB)

**Example Request**:

```javascript
const formData = new FormData();
formData.append("name", "Digital Microscope X100");
formData.append("description", "High-resolution digital microscope");
formData.append("quantity", "5");
formData.append("category", "Microscope");
formData.append("location", "Lab Room 101");
formData.append(
  "specifications",
  JSON.stringify({
    magnification: "40x-1000x",
    resolution: "4K",
  })
);
formData.append("image", imageFile);

fetch("/api/instruments", {
  method: "POST",
  headers: {
    Authorization: "Bearer <token>",
  },
  body: formData,
});
```

**Success Response** (201):

```json
{
  "message": "Instrument created successfully",
  "instrument": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Digital Microscope X100",
    "description": "High-resolution digital microscope",
    "quantity": 5,
    "availableQuantity": 5,
    "category": "Microscope",
    "status": "available",
    "currentUsers": [],
    "totalUsageTime": 0,
    "usageCount": 0
  }
}
```

---

### Update Instrument

Update an existing instrument.

**Endpoint**: `PUT /instruments/:id`

**Access**: Admin only

**Content-Type**: `multipart/form-data`

**Form Fields**: Same as Create, all optional

**Success Response** (200):

```json
{
  "message": "Instrument updated successfully",
  "instrument": { ... }
}
```

---

### Delete Instrument

Delete an instrument from the system.

**Endpoint**: `DELETE /instruments/:id`

**Access**: Admin only

**Success Response** (200):

```json
{
  "message": "Instrument deleted successfully"
}
```

**Error Response** (400):

```json
{
  "message": "Cannot delete instrument that is currently being used"
}
```

---

### Get Instrument Statistics

Get usage statistics for a specific instrument.

**Endpoint**: `GET /instruments/:id/stats`

**Access**: Admin only

**Success Response** (200):

```json
{
  "totalUsageTime": 1200,
  "averageUsageTime": 45,
  "totalSessions": 27,
  "currentUsers": [
    {
      "user": {
        "_id": "507f1f77bcf86cd799439022",
        "name": "Jane Smith",
        "email": "jane@example.com"
      },
      "startTime": "2026-01-04T09:00:00.000Z",
      "quantity": 1
    }
  ],
  "recentUsage": [
    {
      "_id": "507f1f77bcf86cd799439033",
      "user": {
        "_id": "507f1f77bcf86cd799439022",
        "name": "Jane Smith",
        "email": "jane@example.com"
      },
      "startTime": "2026-01-03T14:00:00.000Z",
      "endTime": "2026-01-03T15:30:00.000Z",
      "duration": 90,
      "status": "completed"
    }
  ]
}
```

---

## Usage Endpoints

### Start Using Instrument

Begin a usage session for an instrument.

**Endpoint**: `POST /usage/start`

**Access**: Authenticated

**Request Body**:

```json
{
  "instrumentId": "507f1f77bcf86cd799439011",
  "quantity": 1
}
```

**Validation Rules**:

- `instrumentId`: valid MongoDB ObjectId
- `quantity`: optional, minimum 1 (default: 1)

**Success Response** (200):

```json
{
  "message": "Started using instrument successfully",
  "instrument": { ... },
  "usageHistory": "507f1f77bcf86cd799439044"
}
```

**Error Responses**:

- `400`: Instrument is not available
- `400`: You are already using this instrument
- `400`: Not enough quantity available

---

### Stop Using Instrument

End a usage session for an instrument.

**Endpoint**: `POST /usage/stop`

**Access**: Authenticated

**Request Body**:

```json
{
  "instrumentId": "507f1f77bcf86cd799439011",
  "notes": "Completed microscope analysis"
}
```

**Success Response** (200):

```json
{
  "message": "Stopped using instrument successfully",
  "instrument": { ... },
  "usageHistory": {
    "_id": "507f1f77bcf86cd799439044",
    "user": { ... },
    "instrument": { ... },
    "startTime": "2026-01-04T09:00:00.000Z",
    "endTime": "2026-01-04T10:30:00.000Z",
    "duration": 90,
    "status": "completed",
    "notes": "Completed microscope analysis"
  },
  "duration": 90
}
```

**Error Response** (400):

```json
{
  "message": "You are not currently using this instrument"
}
```

---

### Force Stop Usage (Admin)

Terminate a user's usage session.

**Endpoint**: `POST /usage/force-stop`

**Access**: Admin only

**Request Body**:

```json
{
  "instrumentId": "507f1f77bcf86cd799439011",
  "userId": "507f1f77bcf86cd799439022",
  "reason": "Emergency maintenance required"
}
```

**Success Response** (200):

```json
{
  "message": "Usage terminated successfully",
  "instrument": { ... },
  "usageHistory": {
    "status": "terminated",
    "terminatedBy": {
      "_id": "507f1f77bcf86cd799439055",
      "name": "Admin User"
    },
    "terminationReason": "Emergency maintenance required"
  },
  "duration": 45
}
```

---

### Get Personal Usage History

Get the authenticated user's usage history.

**Endpoint**: `GET /usage/history/me`

**Access**: Authenticated

**Query Parameters**:

- `page` (number, default: 1)
- `limit` (number, default: 10)
- `status` (string): Filter by status (active, completed, terminated)

**Success Response** (200):

```json
{
  "usageHistory": [
    {
      "_id": "507f1f77bcf86cd799439044",
      "instrument": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Digital Microscope X100",
        "category": "Microscope",
        "image": "/uploads/microscope-1234567890.jpg"
      },
      "startTime": "2026-01-04T09:00:00.000Z",
      "endTime": "2026-01-04T10:30:00.000Z",
      "duration": 90,
      "quantity": 1,
      "status": "completed",
      "notes": "Completed analysis",
      "createdAt": "2026-01-04T09:00:00.000Z",
      "updatedAt": "2026-01-04T10:30:00.000Z"
    }
  ],
  "totalUsageTime": 450,
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "pages": 2
  }
}
```

---

### Get All Usage History (Admin)

Get usage history for all users.

**Endpoint**: `GET /usage/history/all`

**Access**: Admin only

**Query Parameters**:

- `page` (number, default: 1)
- `limit` (number, default: 10)
- `status` (string): Filter by status
- `instrumentId` (string): Filter by instrument
- `userId` (string): Filter by user

**Success Response** (200):

```json
{
  "usageHistory": [
    {
      "_id": "507f1f77bcf86cd799439044",
      "user": {
        "_id": "507f1f77bcf86cd799439022",
        "name": "Jane Smith",
        "email": "jane@example.com"
      },
      "instrument": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Digital Microscope X100",
        "category": "Microscope"
      },
      "startTime": "2026-01-04T09:00:00.000Z",
      "endTime": "2026-01-04T10:30:00.000Z",
      "duration": 90,
      "status": "completed"
    }
  ],
  "pagination": { ... }
}
```

---

## User Endpoints

### Get User Profile

Get the authenticated user's profile and statistics.

**Endpoint**: `GET /users/profile`

**Access**: Authenticated

**Success Response** (200):

```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439022",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "role": "user",
    "isActive": true,
    "currentlyUsing": [
      {
        "instrument": {
          "_id": "507f1f77bcf86cd799439011",
          "name": "Digital Microscope X100",
          "category": "Microscope",
          "image": "/uploads/microscope-1234567890.jpg"
        },
        "startTime": "2026-01-04T09:00:00.000Z"
      }
    ],
    "createdAt": "2025-09-15T08:00:00.000Z",
    "updatedAt": "2026-01-04T10:30:00.000Z"
  },
  "stats": {
    "totalSessions": 15,
    "totalTime": 450,
    "averageTime": 30
  }
}
```

---

### Get All Users (Admin)

Get a paginated list of all users.

**Endpoint**: `GET /users/all`

**Access**: Admin only

**Query Parameters**:

- `page` (number, default: 1)
- `limit` (number, default: 10)
- `search` (string): Search in name or email
- `role` (string): Filter by role (admin, user)
- `isActive` (boolean): Filter by active status

**Success Response** (200):

```json
{
  "users": [
    {
      "_id": "507f1f77bcf86cd799439022",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "user",
      "isActive": true,
      "currentlyUsing": [],
      "createdAt": "2025-09-15T08:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

---

### Get User by ID (Admin)

Get detailed information about a specific user.

**Endpoint**: `GET /users/:id`

**Access**: Admin only

**Success Response** (200):

```json
{
  "user": { ... },
  "stats": {
    "totalSessions": 15,
    "totalTime": 450,
    "averageTime": 30
  }
}
```

---

### Update User Status (Admin)

Activate or deactivate a user account.

**Endpoint**: `PATCH /users/:id/status`

**Access**: Admin only

**Request Body**:

```json
{
  "isActive": false
}
```

**Success Response** (200):

```json
{
  "message": "User deactivated successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439022",
    "name": "Jane Smith",
    "isActive": false
  }
}
```

---

### Update User Role (Admin)

Change a user's role between admin and user.

**Endpoint**: `PATCH /users/:id/role`

**Access**: Admin only

**Request Body**:

```json
{
  "role": "admin"
}
```

**Success Response** (200):

```json
{
  "message": "User role updated to admin successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439022",
    "name": "Jane Smith",
    "role": "admin"
  }
}
```

**Error Response** (400):

```json
{
  "message": "You cannot demote yourself"
}
```

---

## Rate Limiting

API requests are rate-limited to prevent abuse:

- **Development**: 1000 requests per 15 minutes
- **Production**: 500 requests per 15 minutes
- **Exempt**: OPTIONS requests (CORS preflight)

**Rate Limit Headers**:

```
X-RateLimit-Limit: 500
X-RateLimit-Remaining: 498
X-RateLimit-Reset: 1640000000
```

**Rate Limit Exceeded** (429):

```json
{
  "message": "Too many requests, please try again later."
}
```

---

## Error Handling

### Validation Errors (400)

```json
{
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email",
      "value": "invalid-email"
    },
    {
      "field": "password",
      "message": "Password must be at least 6 characters",
      "value": "123"
    }
  ]
}
```

### Authentication Errors (401)

```json
{
  "message": "No token provided"
}
```

```json
{
  "message": "Invalid or expired token"
}
```

### Authorization Errors (403)

```json
{
  "message": "Access denied. Admin privileges required."
}
```

### Not Found Errors (404)

```json
{
  "message": "Instrument not found"
}
```

### Server Errors (500)

```json
{
  "message": "Server error",
  "error": "Error details in development mode only"
}
```

---

## Health Check

**Endpoint**: `GET /health`

**Access**: Public

**Success Response** (200):

```json
{
  "status": "OK",
  "timestamp": "2026-01-04T10:30:00.000Z"
}
```

---

## Testing with cURL

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password123"}'
```

### Get Instruments

```bash
curl -X GET http://localhost:5000/api/instruments \
  -H "Authorization: Bearer <your-token>"
```

### Start Using Instrument

```bash
curl -X POST http://localhost:5000/api/usage/start \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{"instrumentId": "507f1f77bcf86cd799439011", "quantity": 1}'
```

---

## Testing with Postman

1. Import the collection from `postman_collection.json`
2. Set environment variable `{{baseUrl}}` to `http://localhost:5000/api`
3. After login, set `{{token}}` to the received JWT token
4. All authenticated requests will automatically include the token

---

## Websocket Events (Future Feature)

_Coming soon: Real-time updates for instrument availability and usage_
