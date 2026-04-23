# API Reference Guide

## Base URL

```
Development: http://localhost:5000/api
Production: https://your-backend-api.com/api
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {...},
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Field error 1", "Field error 2"]
}
```

---

## Authentication Endpoints

### Register Teacher

Create a new teacher account.

**Endpoint:** `POST /auth/register`

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@school.com",
  "phone": "9876543210",
  "school": "Government School Name",
  "password": "securePassword123",
  "passwordConfirm": "securePassword123"
}
```

**Required Fields:**
- `name`: String (1-100 characters)
- `email`: Valid email address (unique)
- `phone`: Phone number string
- `school`: School name
- `password`: Minimum 6 characters
- `passwordConfirm`: Must match password

**Response:**
```json
{
  "success": true,
  "message": "Teacher registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "teacher": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@school.com",
    "school": "Government School",
    "role": "teacher"
  }
}
```

**Errors:**
- `400`: All fields required
- `400`: Passwords do not match
- `400`: Password must be at least 6 characters
- `400`: Email already registered
- `500`: Internal server error

---

### Login

Authenticate with email and password.

**Endpoint:** `POST /auth/login`

**Request:**
```json
{
  "email": "john@school.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "teacher": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@school.com",
    "school": "Government School",
    "role": "teacher"
  }
}
```

**Errors:**
- `400`: Email and password required
- `401`: Invalid credentials
- `403`: Account is inactive
- `500`: Internal server error

---

### Guest Login

Get temporary access without registration.

**Endpoint:** `POST /auth/guest-login`

**Request:** (No body)

**Response:**
```json
{
  "success": true,
  "message": "Guest login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "isGuest": true
}
```

**Token Expiration:** 24 hours

---

### Get Current User

Retrieve logged-in user information.

**Endpoint:** `GET /auth/me`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@school.com",
    "phone": "9876543210",
    "school": "Government School",
    "role": "teacher",
    "isActive": true
  }
}
```

**Errors:**
- `401`: No token provided / Invalid token
- `404`: Teacher not found

---

## Record Endpoints

### Create Record

Save attendance and meal data.

**Endpoint:** `POST /records`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token> (optional)
```

**Request:**
```json
{
  "date": "2024-01-15",
  "classGroup1to5": true,
  "classGroup6to8": false,
  "students": {
    "class1": 30,
    "class2": 28,
    "class3": 32,
    "class4": 25,
    "class5": 27
  },
  "beneficiaries": {
    "class1": 29,
    "class2": 27,
    "class3": 30,
    "class4": 24,
    "class5": 26
  },
  "mealType": "Khichdi",
  "notes": "All students present today"
}
```

**Field Validations:**
- `date`: Valid date (ISO format)
- `classGroup1to5`, `classGroup6to8`: At least one must be true
- `students`: All classes (1-5) required, values 0-100
- `beneficiaries`: All classes required, values 0-100
- Beneficiaries must be ≤ Students for each class
- `mealType`: One of [Khichdi, Dal, Rice, Bread, Vegetables, Milk, Other]
- `notes`: Optional string

**Response:**
```json
{
  "success": true,
  "message": "Record created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "date": "2024-01-15T00:00:00.000Z",
    "classGroup1to5": true,
    "classGroup6to8": false,
    "students": { "class1": 30, ... },
    "beneficiaries": { "class1": 29, ... },
    "mealType": "Khichdi",
    "notes": "All students present today",
    "teacherId": null,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Status Code:** 201 (Created)

**Errors:**
- `400`: At least one class group required
- `400`: All student counts required
- `400`: Beneficiaries cannot exceed students
- `400`: Invalid field values
- `500`: Internal server error

---

### Get All Records

Fetch all records with pagination.

**Endpoint:** `GET /records?page=1&limit=10`

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Records per page (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "date": "2024-01-15T00:00:00.000Z",
      "classGroup1to5": true,
      "students": { ... },
      "beneficiaries": { ... },
      "mealType": "Khichdi"
    },
    ...
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```

---

### Get Records by Date

Fetch records for a specific date.

**Endpoint:** `GET /records/date/{date}`

**Path Parameters:**
- `date`: Date in YYYY-MM-DD format (e.g., 2024-01-15)

**Response:**
```json
{
  "success": true,
  "date": "2024-01-15",
  "count": 2,
  "data": [
    { ... },
    { ... }
  ]
}
```

**Example:**
```bash
curl http://localhost:5000/api/records/date/2024-01-15
```

---

### Get Records by Date Range

Fetch records between two dates with statistics.

**Endpoint:** `GET /records/range?startDate={date}&endDate={date}`

**Query Parameters:**
- `startDate`: Start date (YYYY-MM-DD format)
- `endDate`: End date (YYYY-MM-DD format)

**Response:**
```json
{
  "success": true,
  "dateRange": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31"
  },
  "count": 25,
  "statistics": {
    "totalStudents": 850,
    "totalBeneficiaries": 820,
    "averageBeneficiaryRate": 96
  },
  "data": [
    { ... },
    { ... }
  ]
}
```

**Example:**
```bash
curl "http://localhost:5000/api/records/range?startDate=2024-01-01&endDate=2024-01-31"
```

---

### Get Single Record

Fetch a specific record by ID.

**Endpoint:** `GET /records/{id}`

**Path Parameters:**
- `id`: MongoDB ObjectId

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "date": "2024-01-15T00:00:00.000Z",
    "classGroup1to5": true,
    "students": { ... },
    "beneficiaries": { ... },
    "mealType": "Khichdi",
    "notes": "All students present",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Errors:**
- `404`: Record not found

---

### Update Record

Modify an existing record.

**Endpoint:** `PUT /records/{id}`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token> (optional)
```

**Request:** (Same fields as Create, all optional)
```json
{
  "mealType": "Dal",
  "notes": "Updated notes",
  "beneficiaries": { ... }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Record updated successfully",
  "data": { ... }
}
```

**Errors:**
- `404`: Record not found
- `400`: Validation errors

---

### Delete Record

Remove a record.

**Endpoint:** `DELETE /records/{id}`

**Headers:**
```
Authorization: Bearer <token> (optional)
```

**Response:**
```json
{
  "success": true,
  "message": "Record deleted successfully",
  "data": { ... }
}
```

**Status Code:** 200

**Errors:**
- `404`: Record not found

---

### Get Dashboard Statistics

Fetch aggregated statistics for dashboard.

**Endpoint:** `GET /records/stats/dashboard`

**Response:**
```json
{
  "success": true,
  "statistics": {
    "totalRecords": 45,
    "totalStudents": 2250,
    "totalBeneficiaries": 2180,
    "averageBeneficiaryPerRecord": 48.44,
    "beneficiaryPercentage": 97,
    "mealTypes": {
      "Khichdi": 15,
      "Dal": 12,
      "Rice": 10,
      "Bread": 5,
      "Vegetables": 3,
      "Milk": 0,
      "Other": 0
    }
  }
}
```

---

## Health Check Endpoint

Check if backend is running.

**Endpoint:** `GET /health`

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Error Status Codes

| Code | Meaning | Possible Cause |
|------|---------|----------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid input, validation failed |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 500 | Server Error | Internal server error |

---

## Rate Limiting

Currently no rate limiting. In production, consider adding:
- 100 requests per minute per IP
- 1000 requests per hour per user

---

## CORS Policy

Allowed Origins:
- Development: `http://localhost:3000`
- Production: Configured in `.env` as `FRONTEND_URL`

**Headers:**
```
Access-Control-Allow-Origin: <configured-domain>
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
```

---

## API Client Examples

### Using JavaScript Fetch

```javascript
// Register
const response = await fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John',
    email: 'john@school.com',
    phone: '9876543210',
    school: 'School Name',
    password: 'pass123',
    passwordConfirm: 'pass123'
  })
});

const data = await response.json();
localStorage.setItem('token', data.token);
```

### Using curl

```bash
# Create record
curl -X POST http://localhost:5000/api/records \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "date": "2024-01-15",
    "classGroup1to5": true,
    "classGroup6to8": false,
    "students": {"class1": 30, "class2": 28, "class3": 32, "class4": 25, "class5": 27},
    "beneficiaries": {"class1": 29, "class2": 27, "class3": 30, "class4": 24, "class5": 26},
    "mealType": "Khichdi"
  }'
```

### Using Postman

1. Import collection from API
2. Set environment variables:
   - `baseUrl`: `http://localhost:5000/api`
   - `token`: From login response
3. Use variables in headers: `Authorization: Bearer {{token}}`

---

## Pagination

For endpoints returning lists:

```
GET /records?page=2&limit=20
```

**Response includes:**
```json
"pagination": {
  "total": 100,        // Total records
  "page": 2,           // Current page
  "limit": 20,         // Records per page
  "pages": 5           // Total pages
}
```

---

## Data Types

| Type | Description | Example |
|------|-------------|---------|
| String | Text | "Khichdi" |
| Number | Integer | 30 |
| Boolean | True/False | true |
| Date | ISO 8601 | "2024-01-15" |
| ObjectId | MongoDB ID | "507f1f77bcf86cd799439011" |
| Enum | Limited values | One of: Khichdi, Dal, Rice... |

---

## Best Practices

1. **Always include Authorization header** for protected endpoints
2. **Validate input** before sending to API
3. **Handle errors** with proper try-catch
4. **Store token securely** (localStorage okay for this app)
5. **Set reasonable timeouts** (30 seconds for uploads)
6. **Use pagination** for large datasets
7. **Log errors** for debugging
8. **Test with real data** before production

---

## Versioning

Current API Version: **v1**

Future versions will use: `/api/v2/records`

---

**For more help, see README.md and other documentation files.**
