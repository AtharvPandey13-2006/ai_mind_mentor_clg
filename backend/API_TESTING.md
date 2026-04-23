# API Testing Guide

Complete guide for testing all API endpoints with example requests and responses.

## Base URL
```
https://ai-mind-mentor-clg-3.onrender.com/api
```

## Authentication Headers
For protected endpoints, include:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 🔐 Authentication Endpoints

### 1. Register New User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "message": "Registration successful",
  "user": {
    "id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "xp": 0,
    "level": 1,
    "loginStreak": 1,
    "totalMoodLogs": 0,
    "totalChatMessages": 0
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": { ... },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Get Current User
```http
GET /api/auth/me
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 😊 Mood Tracking Endpoints

### 1. Log Mood Entry
```http
POST /api/mood
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "mood": "happy",
  "moodScore": 8,
  "stressLevel": 3,
  "energyLevel": 7,
  "productivityLevel": 8,
  "note": "Great day at work! Completed major project milestone.",
  "activities": "coding, team meeting, exercise"
}
```

**Mood Options:** `happy`, `neutral`, `stressed`, `anxious`, `burned_out`

**Response:**
```json
{
  "message": "Mood logged successfully",
  "mood": {
    "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "userId": "...",
    "mood": "happy",
    "moodScore": 8,
    "stressLevel": 3,
    "energyLevel": 7,
    "productivityLevel": 8,
    "burnoutRisk": "low",
    "timestamp": "2026-02-10T10:30:00.000Z"
  },
  "xp": {
    "xp": 5,
    "level": 1,
    "leveledUp": false
  }
}
```

### 2. Get Mood History
```http
GET /api/mood/history?limit=30&skip=0
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters:**
- `limit` (optional): Number of entries to return (default: 30)
- `skip` (optional): Number of entries to skip (default: 0)

### 3. Get Mood Statistics
```http
GET /api/mood/stats?days=30
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "totalEntries": 25,
  "averageMood": 7.2,
  "averageStress": 4.5,
  "averageEnergy": 6.8,
  "averageProductivity": 7.1,
  "moodDistribution": {
    "happy": 15,
    "neutral": 7,
    "stressed": 3
  },
  "burnoutRiskLevel": "low",
  "recentTrend": "stable"
}
```

### 4. Analyze Burnout Risk
```http
GET /api/mood/analyze
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "burnoutRisk": "low",
  "trend": "improving",
  "statistics": {
    "averageStress": 4.5,
    "averageEnergy": 6.8,
    "averageMood": 7.2,
    "totalEntries": 25
  },
  "insights": [
    "Your overall well-being seems stable",
    "You've logged 25 mood entries - great job tracking!"
  ],
  "recommendations": [
    "Take regular breaks throughout your day",
    "Practice mindfulness or meditation"
  ],
  "concerningPatterns": []
}
```

### 5. Delete Mood Entry
```http
DELETE /api/mood/:moodId
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 🎯 Career Management Endpoints

### 1. Get Career Profile
```http
GET /api/career/profile
Authorization: Bearer YOUR_JWT_TOKEN
```

### 2. Update Career Profile
```http
PUT /api/career/profile
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "currentRole": "Junior Developer",
  "targetRole": "Senior Full-Stack Developer",
  "skills": [
    { "name": "JavaScript", "level": "intermediate" },
    { "name": "React", "level": "intermediate" },
    { "name": "Node.js", "level": "beginner" }
  ],
  "interests": ["web development", "AI/ML", "cloud computing"],
  "experience": 2,
  "education": "Bachelor's in Computer Science",
  "industry": "Software Development"
}
```

### 3. Generate Career Roadmap
```http
POST /api/career/roadmap
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "currentRole": "Junior Developer",
  "targetRole": "Senior Full-Stack Developer",
  "skills": ["JavaScript", "React", "Node.js"],
  "interests": ["web development", "cloud computing"],
  "experience": 2,
  "education": "Bachelor's in Computer Science"
}
```

**Response:**
```json
{
  "message": "Career roadmap generated successfully",
  "roadmap": {
    "generated": true,
    "generatedAt": "2026-02-10T10:30:00.000Z",
    "estimatedDuration": "12-18 months",
    "completionPercentage": 0,
    "steps": [
      {
        "id": "step_1",
        "title": "Master Advanced JavaScript",
        "description": "Deep dive into ES6+, async patterns, and advanced concepts",
        "duration": "2-3 months",
        "skills": ["ES6+", "Promises", "Async/Await"],
        "resources": ["JavaScript.info", "You Don't Know JS"],
        "completed": false
      },
      {
        "id": "step_2",
        "title": "Build Full-Stack Projects",
        "description": "Create 3-5 complete applications using MERN stack",
        "duration": "4-6 months",
        "skills": ["MongoDB", "Express", "React", "Node.js"],
        "resources": ["freeCodeCamp", "Udemy Courses"],
        "completed": false
      }
    ]
  }
}
```

### 4. Get Career Roadmap
```http
GET /api/career/roadmap
Authorization: Bearer YOUR_JWT_TOKEN
```

### 5. Update Roadmap Step
```http
PUT /api/career/roadmap/step/:stepId
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "completed": true
}
```

---

## 💬 Chat Endpoints

### 1. Career Chat
```http
POST /api/chat/career
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "message": "What skills should I learn to become a senior developer?",
  "sessionId": "career_64a1b2c3_1707560400000"
}
```

**Response:**
```json
{
  "response": "To become a senior developer, focus on these key areas:\n\n1. Deep Technical Expertise: Master your primary programming language...",
  "sessionId": "career_64a1b2c3_1707560400000"
}
```

### 2. Emotional Support Chat
```http
POST /api/chat/emotional
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "message": "I'm feeling overwhelmed with my workload",
  "sessionId": "emotional_64a1b2c3_1707560400000"
}
```

### 3. Generic Gemini Chat
```http
POST /api/chat/gemini
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "message": "Explain the concept of microservices",
  "chatType": "general"
}
```

### 4. Get Chat History
```http
GET /api/chat/history/:sessionId
Authorization: Bearer YOUR_JWT_TOKEN
```

### 5. Get All User Sessions
```http
GET /api/chat/sessions
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
[
  {
    "sessionId": "career_64a1b2c3_1707560400000",
    "chatType": "career",
    "lastActivity": "2026-02-10T10:30:00.000Z"
  },
  {
    "sessionId": "emotional_64a1b2c3_1707560500000",
    "chatType": "emotional",
    "lastActivity": "2026-02-10T09:15:00.000Z"
  }
]
```

### 6. Delete Chat Session
```http
DELETE /api/chat/session/:sessionId
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 🧪 Testing with PowerShell

### Register User
```powershell
$body = @{
    email = "test@example.com"
    password = "password123"
    firstName = "Test"
    lastName = "User"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://ai-mind-mentor-clg-3.onrender.com/api/auth/register" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

### Login and Save Token
```powershell
$loginBody = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "https://ai-mind-mentor-clg-3.onrender.com/api/auth/login" `
    -Method POST `
    -Body $loginBody `
    -ContentType "application/json"

$token = $response.token
```

### Use Token for Protected Endpoint
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "https://ai-mind-mentor-clg-3.onrender.com/api/mood/stats" `
    -Method GET `
    -Headers $headers
```

---

## 🧪 Testing with curl (Git Bash)

### Register
```bash
curl -X POST https://ai-mind-mentor-clg-3.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","firstName":"Test","lastName":"User"}'
```

### Login
```bash
curl -X POST https://ai-mind-mentor-clg-3.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Protected Endpoint
```bash
curl -X GET https://ai-mind-mentor-clg-3.onrender.com/api/mood/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📊 XP and Gamification

Users earn XP for various actions:
- **Register/Login:** Initial XP
- **Log Mood:** 5 XP per entry
- **Chat Message:** 3 XP per message
- **Generate Roadmap:** 20 XP
- **Complete Roadmap Step:** 15 XP

Level up: Every 100 XP = 1 Level

---

## 🐛 Common Error Responses

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "details": ["Email is required", "Password must be at least 6 characters"]
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid or expired token. Please login again."
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "Database connection failed"
}
```

---

## 💡 Testing Tips

1. **Use Thunder Client or Postman** in VS Code for easy API testing
2. **Save your JWT token** - it's valid for 7 days
3. **Test the flow**: Register → Login → Log Mood → Generate Roadmap → Chat
4. **Check MongoDB** using MongoDB Compass to see stored data
5. **Monitor server logs** for detailed error messages

Happy Testing! 🚀
