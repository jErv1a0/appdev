# StayGrid API Documentation

## Base URL
`http://YOUR_PC_IP:8000/api`

Replace `YOUR_PC_IP` with your actual PC IPv4 address (e.g., `192.168.1.100`).

## Authentication
- **Method**: Session-based authentication using cookies
- **Login Required**: All endpoints except login require an active session
- **Credentials**: Always include `credentials: 'include'` in fetch requests

## Endpoints

### POST /api/login
Authenticate user and create session.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (Success):**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

**Response (Error):**
```json
{
  "error": "Invalid credentials"
}
```

### GET /api/room_listings
Get list of available rooms.

**Response:**
```json
[
  {
    "id": 1,
    "title": "Cozy Apartment",
    "price": 100,
    "location": "Downtown",
    "images": ["url1.jpg", "url2.jpg"],
    "amenities": ["WiFi", "Kitchen"]
  }
]
```

### GET /api/rooms/{id}
Get detailed information about a specific room.

**Response:**
```json
{
  "id": 1,
  "title": "Cozy Apartment",
  "description": "A comfortable apartment in the city center",
  "price": 100,
  "location": "Downtown",
  "images": ["url1.jpg", "url2.jpg"],
  "amenities": ["WiFi", "Kitchen", "Parking"],
  "max_guests": 4,
  "bedrooms": 2
}
```

### POST /api/bookings
Create a new booking.

**Request Body:**
```json
{
  "room_id": 1,
  "check_in": "2024-01-15",
  "check_out": "2024-01-20"
}
```

**Response:**
```json
{
  "id": 123,
  "room_id": 1,
  "check_in": "2024-01-15",
  "check_out": "2024-01-20",
  "total_price": 500,
  "status": "confirmed"
}
```

### GET /api/bookings
Get user's bookings.

**Response:**
```json
[
  {
    "id": 123,
    "room": {
      "id": 1,
      "title": "Cozy Apartment"
    },
    "check_in": "2024-01-15",
    "check_out": "2024-01-20",
    "total_price": 500,
    "status": "confirmed"
  }
]
```

### DELETE /api/bookings/{id}
Cancel a booking.

**Response:**
```json
{
  "message": "Booking cancelled successfully"
}
```

## Error Responses
All endpoints return appropriate HTTP status codes:

- `200`: Success
- `400`: Bad Request
- `401`: Unauthorized (session expired)
- `404`: Not Found
- `500`: Internal Server Error

Error response format:
```json
{
  "error": "Error message description"
}
```

## Testing with cURL

### Login
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}' \
  -c cookies.txt
```

### Get Rooms (after login)
```bash
curl http://localhost:8000/api/room_listings \
  -b cookies.txt
```

## Notes
- All requests must include credentials for session management
- Dates should be in YYYY-MM-DD format
- Prices are in the default currency
- Images are returned as URL strings